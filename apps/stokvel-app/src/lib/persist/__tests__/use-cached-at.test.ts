import '../../../__tests__/setup-dom.js';
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { importSessionKey } from '../../crypto/aes-gcm.js';
import { keyStore } from '../../crypto/key-store.js';

// Same idb-keyval mock pattern as idb-cache.test.ts so writes/reads round-trip
// in-memory without a real IndexedDB.
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

const { write } = await import('../idb-cache.js');
const { useCachedAt } = await import('../use-cached-at.js');

const TEST_KEY_BASE64 = 'rZK4Z5GvL+Q5tHNXEsiP9D2k7QvP0u3DyxgWNJ1mP7Y=';
const ONE_HOUR = 60 * 60 * 1000;

describe('useCachedAt', () => {
  beforeEach(async () => {
    fakeStore.clear();
    keyStore.setKey(await importSessionKey(TEST_KEY_BASE64));
  });

  afterEach(() => {
    cleanup();
    keyStore.clearKey();
  });

  it('returns null when no entry exists', async () => {
    const { result } = renderHook(() => useCachedAt('nope', null));
    // Initial render: null. Effect resolves to null because no entry.
    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('returns the ISO cachedAt of an existing entry', async () => {
    await write('balance:abc', { v: 1 }, { ttl: ONE_HOUR });

    const { result } = renderHook(() => useCachedAt('balance:abc', null));
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  });

  it('re-reads when dependsOn changes', async () => {
    await write('balance:abc', { v: 1 }, { ttl: ONE_HOUR });

    const { result, rerender } = renderHook(
      ({ trigger }: { trigger: number }) => useCachedAt('balance:abc', trigger),
      { initialProps: { trigger: 1 } },
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    const firstSeen = result.current;

    // Wait a moment, then write a fresh entry — the cachedAt should differ.
    await act(() => new Promise((r) => setTimeout(r, 10)));
    await write('balance:abc', { v: 2 }, { ttl: ONE_HOUR });

    rerender({ trigger: 2 });

    await waitFor(() => {
      expect(result.current).not.toBe(firstSeen);
    });
  });
});
