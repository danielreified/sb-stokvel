import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';
import { decrypt, encrypt } from '../crypto/aes-gcm.js';
import { keyStore } from '../crypto/key-store.js';
import { logger } from '../logger.js';
import { PERSIST_KEY } from './cache-schema.js';
import { SENSITIVE_QUERY_KEYS } from './sensitive-keys.js';

/** Returns the first segment of a query key for sensitivity routing. */
function queryKeyRoot(queryKey: unknown): string | undefined {
  if (Array.isArray(queryKey) && typeof queryKey[0] === 'string') return queryKey[0];
  return undefined;
}

function isSensitive(queryKey: unknown): boolean {
  const root = queryKeyRoot(queryKey);
  return root !== undefined && SENSITIVE_QUERY_KEYS.has(root);
}

/**
 * Custom idb-keyval storage adapter with per-entry AES-GCM encryption for sensitive queries.
 * Both encrypted and plain entries live in the same idb-keyval store under PERSIST_KEY.
 */
const encryptingStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const stored = await get<{ data: string; encrypted: boolean }>(key);
    if (!stored) return null;

    if (stored.encrypted) {
      const aesKey = keyStore.getKey();
      if (!aesKey) {
        // Cold start without session — treat as cache miss, fail closed
        return null;
      }
      try {
        return await decrypt(aesKey, stored.data);
      } catch {
        // Tampered blob or key mismatch — treat as cache miss
        logger.warn('persist_decrypt_failed', { key });
        return null;
      }
    }

    return stored.data;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    // Determine sensitivity by peeking at the dehydrated query keys inside the value
    let needsEncryption = false;
    try {
      const parsed: unknown = JSON.parse(value);
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'queries' in parsed &&
        Array.isArray((parsed as { queries: unknown }).queries)
      ) {
        needsEncryption = (parsed as { queries: Array<{ queryKey: unknown }> }).queries.some((q) =>
          isSensitive(q.queryKey),
        );
      }
    } catch {
      needsEncryption = false;
    }

    if (needsEncryption) {
      const aesKey = keyStore.getKey();
      if (!aesKey) {
        // No key — skip persisting encrypted data rather than storing plaintext
        return;
      }
      const encrypted = await encrypt(aesKey, value);
      await set(key, { data: encrypted, encrypted: true });
    } else {
      await set(key, { data: value, encrypted: false });
    }
  },

  removeItem: async (key: string): Promise<void> => {
    await del(key);
  },
};

/**
 * Pass buster to PersistQueryClientProvider via:
 *   persistOptions={{ persister, buster: String(CACHE_SCHEMA_VERSION) }}
 */
export const persister = createAsyncStoragePersister({
  storage: encryptingStorage,
  key: PERSIST_KEY,
});
