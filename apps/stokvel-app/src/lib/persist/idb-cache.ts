import { del, entries, get, set } from 'idb-keyval';
import { decrypt, encrypt } from '../crypto/aes-gcm.js';
import { keyStore } from '../crypto/key-store.js';
import { logger } from '../logger.js';

/**
 * Thrown by `read()` when the AES-GCM auth tag fails — i.e. the encrypted
 * cache blob has been modified after it was written. Distinct from a normal
 * cache miss so callers can surface it differently (security warning vs
 * silent fallback to network).
 */
export class CacheTamperError extends Error {
  constructor(public readonly cacheKey: string) {
    super(`Cache entry tampered: ${cacheKey}`);
    this.name = 'CacheTamperError';
  }
}

/**
 * Per-record encrypted IDB cache for query results.
 *
 * Replaces the global PersistQueryClientProvider blob-persister with a
 * lazy, per-key store. Every record is AES-GCM encrypted at rest using
 * the in-memory session key — there is no plaintext tier (see
 * docs/architecture/persistence.md).
 *
 * Each entry stores cleartext metadata (timestamps, ttl, persistent flag)
 * alongside the encrypted payload so eviction can run without needing the
 * key in memory. The metadata leaks query-shape (which keys exist, when
 * they were last touched) but never the data.
 */

const KEY_PREFIX = 'seyva-cache:';

interface CacheEntry {
  /**
   * When the data was originally fetched. Used for both TTL expiry and
   * eviction ordering — older `cachedAt` evicted first under size pressure.
   * We deliberately don't track read access (true LRU) because race-free
   * read-side updates would require an atomic IDB transaction; the resulting
   * "least recently written" approximation is fine given the hot set is
   * marked persistent and protected from size-based eviction.
   */
  cachedAt: number;
  /** Time-to-live in ms; expired entries return cache-miss + are evicted. */
  ttl: number;
  /** Hot-set entries are skipped by size-budget eviction (still eligible for TTL). */
  persistent: boolean;
  /** Length of the base64 ciphertext, used for budget accounting. */
  sizeBytes: number;
  /** AES-GCM ciphertext (IV-prepended, base64). */
  ciphertext: string;
}

/** Browsers may not expose deviceMemory (Safari, older Firefox). */
function lowMemoryDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  // reason: Navigator.deviceMemory is part of the Device Memory spec and not
  // in lib.dom yet. Optional widen via a typed accessor.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof mem === 'number' && mem < 1;
}

const SIZE_BUDGET_BYTES = lowMemoryDevice() ? 1 * 1024 * 1024 : 5 * 1024 * 1024;
const COLD_TAIL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days unread → drop

const storageKey = (key: string): string => `${KEY_PREFIX}${key}`;
const isCacheKey = (k: unknown): k is string => typeof k === 'string' && k.startsWith(KEY_PREFIX);

interface ReadResult<T> {
  data: T;
  cachedAt: number;
}

interface WriteOptions {
  /** Time-to-live in ms. Past this, the entry returns cache-miss. */
  ttl: number;
  /** Persistent entries skip size-budget eviction. Default false. */
  persistent?: boolean;
}

/**
 * Read a typed value from the cache. Returns null on:
 *   - missing entry
 *   - entry past its TTL
 *   - no AES key in memory (cold start before PIN unlock)
 *   - parse failure (corrupt entry shape)
 *
 * Throws `CacheTamperError` on AES-GCM auth-tag failure so the caller can
 * surface it differently from a normal miss.
 */
export async function read<T>(key: string): Promise<ReadResult<T> | null> {
  const entry = await get<CacheEntry>(storageKey(key));
  if (!entry) return null;

  const now = Date.now();
  if (entry.cachedAt + entry.ttl < now) {
    // Lazily evict expired entries on read so they don't linger
    void del(storageKey(key));
    return null;
  }

  const aesKey = keyStore.getKey();
  if (!aesKey) return null;

  let plaintext: string;
  try {
    plaintext = await decrypt(aesKey, entry.ciphertext);
  } catch {
    // AES-GCM auth tag failed — blob was modified or wrong key. Drop the
    // poisoned entry and signal tamper to the caller so it can decide
    // whether to fall back to network or surface a security warning.
    logger.warn('idb_cache_tamper_detected', { key });
    void del(storageKey(key));
    throw new CacheTamperError(key);
  }

  try {
    return { data: JSON.parse(plaintext) as T, cachedAt: entry.cachedAt };
  } catch {
    logger.warn('idb_cache_parse_failed', { key });
    return null;
  }
}

/**
 * Write a value to the cache. Silently no-ops if no AES key is in memory
 * (rather than storing plaintext as a fallback — fail closed).
 */
export async function write<T>(key: string, data: T, opts: WriteOptions): Promise<void> {
  const aesKey = keyStore.getKey();
  if (!aesKey) return;

  let ciphertext: string;
  try {
    const plaintext = JSON.stringify(data);
    ciphertext = await encrypt(aesKey, plaintext);
  } catch {
    logger.warn('idb_cache_encrypt_failed', { key });
    return;
  }

  const entry: CacheEntry = {
    cachedAt: Date.now(),
    ttl: opts.ttl,
    persistent: opts.persistent ?? false,
    sizeBytes: ciphertext.length,
    ciphertext,
  };

  try {
    await set(storageKey(key), entry);
  } catch {
    // QuotaExceededError, private-mode restrictions, etc.
    logger.warn('idb_cache_write_failed', { key });
  }
}

/** Drop a single entry (used by signOut / explicit invalidations). */
export async function remove(key: string): Promise<void> {
  await del(storageKey(key));
}

/**
 * LRU + TTL + cold-tail eviction pass. Safe to run with no in-memory key —
 * we only inspect cleartext metadata, never the ciphertext. Triggered:
 *   - once on app boot after PIN unlock
 *   - hourly while the tab is open
 *   - after large writes (e.g. infinite-query page fetch)
 */
export async function evict(): Promise<void> {
  const all = await entries<string, CacheEntry>();
  const cacheEntries = all.filter(([k]) => isCacheKey(k));
  const now = Date.now();

  let totalBytes = 0;
  const survivors: { key: string; entry: CacheEntry }[] = [];

  for (const [k, entry] of cacheEntries) {
    if (!isCacheKey(k)) continue;

    // TTL expiry: drop unconditionally
    if (entry.cachedAt + entry.ttl < now) {
      await del(k);
      continue;
    }

    // Cold-tail: written more than 30 days ago and never refreshed → drop
    // even if persistent (caller will refetch on next subscribe).
    if (now - entry.cachedAt > COLD_TAIL_MS) {
      await del(k);
      continue;
    }

    survivors.push({ key: k, entry });
    totalBytes += entry.sizeBytes;
  }

  if (totalBytes <= SIZE_BUDGET_BYTES) return;

  // Over budget: drop oldest non-persistent entries first (oldest cachedAt).
  const evictable = survivors
    .filter(({ entry }) => !entry.persistent)
    .sort((a, b) => a.entry.cachedAt - b.entry.cachedAt);

  for (const { key, entry } of evictable) {
    if (totalBytes <= SIZE_BUDGET_BYTES) break;
    await del(key);
    totalBytes -= entry.sizeBytes;
  }

  if (totalBytes <= SIZE_BUDGET_BYTES) return;

  // Still over budget — every remaining entry is persistent. Rather than
  // silently let writes start failing with QuotaExceededError, fall through
  // and drop oldest persistent entries too. They're "hot set" by intent,
  // not invariant, and a re-fetch is preferable to a write failure.
  logger.warn('idb_cache_persistent_eviction', { totalBytes, budget: SIZE_BUDGET_BYTES });
  const persistentByAge = survivors
    .filter(({ entry }) => entry.persistent)
    .sort((a, b) => a.entry.cachedAt - b.entry.cachedAt);

  for (const { key, entry } of persistentByAge) {
    if (totalBytes <= SIZE_BUDGET_BYTES) break;
    await del(key);
    totalBytes -= entry.sizeBytes;
  }
}

/** Total size of all cache entries in bytes (for diagnostics / tests). */
export async function size(): Promise<number> {
  const all = await entries<string, CacheEntry>();
  return all.filter(([k]) => isCacheKey(k)).reduce((sum, [, entry]) => sum + entry.sizeBytes, 0);
}

/**
 * Wraps a query's fetch with the network-first / IDB-fallback policy. Writes
 * fresh results through to the cache; on network failure, reads from cache.
 * Throws only if both paths fail.
 *
 * Tamper detection: if the cached entry's auth tag fails, we propagate the
 * `CacheTamperError` rather than treating it like a normal cache miss — the
 * route's errorComponent should make this visible to the user.
 *
 * Each queryOptions.queryFn becomes a one-liner over this helper — see
 * features/{dashboard,members,contributions}/queries.ts.
 */
export async function cachedQueryFn<T>(
  cacheKey: string,
  fetch: () => Promise<T>,
  opts: { ttl: number; persistent?: boolean },
): Promise<T> {
  try {
    const fresh = await fetch();
    await write(cacheKey, fresh, opts);
    return fresh;
  } catch (err) {
    try {
      const cached = await read<T>(cacheKey);
      if (cached) return cached.data;
    } catch (cacheErr) {
      if (cacheErr instanceof CacheTamperError) throw cacheErr;
      // Any other cache read error: ignore, fall through to network error.
    }
    throw err;
  }
}

export const idbCache = { read, write, remove, evict, size, cachedQueryFn };
