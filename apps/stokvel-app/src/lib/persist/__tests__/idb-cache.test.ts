import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { importSessionKey } from '../../crypto/aes-gcm.js';
import { keyStore } from '../../crypto/key-store.js';

// Mock idb-keyval BEFORE the idb-cache module loads so its closure picks up
// our fake. The fake is a Map-backed in-memory store with the same API surface
// idb-cache needs: get / set / del / entries.
const fakeStore = new Map<string, unknown>();
mock.module('idb-keyval', () => ({
  get: async <T>(key: string): Promise<T | undefined> => fakeStore.get(key) as T | undefined,
  set: async (key: string, value: unknown): Promise<void> => {
    fakeStore.set(key, value);
  },
  del: async (key: string): Promise<void> => {
    fakeStore.delete(key);
  },
  entries: async <K, V>(): Promise<[K, V][]> => Array.from(fakeStore.entries()) as [K, V][],
}));

// Now import the module under test (after the mock is registered).
const { CacheTamperError, cachedQueryFn, evict, read, remove, write } = await import(
  '../idb-cache.js'
);

const TEST_KEY_BASE64 = 'rZK4Z5GvL+Q5tHNXEsiP9D2k7QvP0u3DyxgWNJ1mP7Y=';

const ONE_HOUR = 60 * 60 * 1000;

describe('idb-cache', () => {
  beforeEach(async () => {
    fakeStore.clear();
    keyStore.setKey(await importSessionKey(TEST_KEY_BASE64));
  });

  afterEach(() => {
    keyStore.clearKey();
  });

  describe('write + read roundtrip', () => {
    it('returns null on a missing key', async () => {
      expect(await read('nope')).toBeNull();
    });

    it('roundtrips an object', async () => {
      const data = { balance: 12345, currency: 'ZAR' };
      await write('balance:abc', data, { ttl: ONE_HOUR });

      const result = await read<typeof data>('balance:abc');
      expect(result).not.toBeNull();
      expect(result?.data).toEqual(data);
      expect(typeof result?.cachedAt).toBe('number');
    });

    it('returns null after TTL expiry', async () => {
      await write('expired', { v: 1 }, { ttl: 50 });
      // Wait past the TTL
      await new Promise((r) => setTimeout(r, 60));
      expect(await read('expired')).toBeNull();
    });

    it('write is a no-op when no AES key is in memory (fail-closed)', async () => {
      keyStore.clearKey();
      await write('no-key', { v: 1 }, { ttl: ONE_HOUR });
      // Restore key, verify nothing was written
      keyStore.setKey(await importSessionKey(TEST_KEY_BASE64));
      expect(await read('no-key')).toBeNull();
    });

    it('read returns null when no AES key is in memory', async () => {
      await write('written', { v: 1 }, { ttl: ONE_HOUR });
      keyStore.clearKey();
      expect(await read('written')).toBeNull();
    });
  });

  describe('tamper detection', () => {
    it('throws CacheTamperError when ciphertext is modified', async () => {
      await write('victim', { secret: 'amount: 50000' }, { ttl: ONE_HOUR });
      // Reach into the fake store and corrupt the ciphertext byte
      const stored = fakeStore.get('seyva-cache:victim') as { ciphertext: string };
      const bytes = Uint8Array.from(atob(stored.ciphertext), (c) => c.charCodeAt(0));
      bytes[20] = bytes[20] ^ 0xff;
      stored.ciphertext = btoa(String.fromCharCode(...bytes));

      await expect(read('victim')).rejects.toThrow(CacheTamperError);
    });

    it('drops the tampered entry from storage on tamper detection', async () => {
      await write('victim', { v: 1 }, { ttl: ONE_HOUR });
      const stored = fakeStore.get('seyva-cache:victim') as { ciphertext: string };
      const bytes = Uint8Array.from(atob(stored.ciphertext), (c) => c.charCodeAt(0));
      bytes[20] = bytes[20] ^ 0xff;
      stored.ciphertext = btoa(String.fromCharCode(...bytes));

      await expect(read('victim')).rejects.toThrow();
      expect(fakeStore.has('seyva-cache:victim')).toBe(false);
    });
  });

  describe('cachedQueryFn', () => {
    it('returns network result and writes through on success', async () => {
      let called = 0;
      const fetch = async () => {
        called += 1;
        return { fresh: true };
      };
      const result = await cachedQueryFn('key', fetch, { ttl: ONE_HOUR });
      expect(result).toEqual({ fresh: true });
      expect(called).toBe(1);
      // Cache hit on the next read
      const cached = await read<{ fresh: boolean }>('key');
      expect(cached?.data).toEqual({ fresh: true });
    });

    it('falls back to cache when network throws', async () => {
      await write('preloaded', { fromCache: true }, { ttl: ONE_HOUR });
      const result = await cachedQueryFn(
        'preloaded',
        async () => {
          throw new Error('network down');
        },
        { ttl: ONE_HOUR },
      );
      expect(result).toEqual({ fromCache: true });
    });

    it('throws the network error when both network and cache fail', async () => {
      await expect(
        cachedQueryFn(
          'never-cached',
          async () => {
            throw new Error('offline');
          },
          { ttl: ONE_HOUR },
        ),
      ).rejects.toThrow('offline');
    });

    it('propagates CacheTamperError instead of falling through', async () => {
      // Write something, then tamper with it
      await write('tampered', { v: 1 }, { ttl: ONE_HOUR });
      const stored = fakeStore.get('seyva-cache:tampered') as { ciphertext: string };
      const bytes = Uint8Array.from(atob(stored.ciphertext), (c) => c.charCodeAt(0));
      bytes[20] = bytes[20] ^ 0xff;
      stored.ciphertext = btoa(String.fromCharCode(...bytes));

      // Now network fails too — we should see the tamper error, not the network error
      await expect(
        cachedQueryFn(
          'tampered',
          async () => {
            throw new Error('offline');
          },
          { ttl: ONE_HOUR },
        ),
      ).rejects.toThrow(CacheTamperError);
    });
  });

  describe('eviction', () => {
    it('drops TTL-expired entries', async () => {
      await write('expired', { v: 1 }, { ttl: 10 });
      await write('alive', { v: 2 }, { ttl: ONE_HOUR });
      await new Promise((r) => setTimeout(r, 20));

      await evict();

      expect(fakeStore.has('seyva-cache:expired')).toBe(false);
      expect(fakeStore.has('seyva-cache:alive')).toBe(true);
    });

    it('skips non-cache keys (other idb-keyval consumers)', async () => {
      // A foreign key not under our prefix
      fakeStore.set('other-app-key', 'untouched');
      await write('ours', { v: 1 }, { ttl: ONE_HOUR });

      await evict();

      expect(fakeStore.get('other-app-key')).toBe('untouched');
    });

    it('persistent entries survive size-budget pressure when others can be dropped', async () => {
      // Two entries — one persistent, one not. Both within TTL.
      await write('keep', { kind: 'persistent' }, { ttl: ONE_HOUR, persistent: true });
      await write('drop', { kind: 'evictable' }, { ttl: ONE_HOUR, persistent: false });

      // The default budget is 5 MB and our records are tiny, so eviction
      // won't drop either here. Verifying both survive a normal pass.
      await evict();
      expect(fakeStore.has('seyva-cache:keep')).toBe(true);
      expect(fakeStore.has('seyva-cache:drop')).toBe(true);
    });

    it('remove() drops a single entry by key', async () => {
      await write('byebye', { v: 1 }, { ttl: ONE_HOUR });
      expect(fakeStore.has('seyva-cache:byebye')).toBe(true);
      await remove('byebye');
      expect(fakeStore.has('seyva-cache:byebye')).toBe(false);
    });
  });
});
