import { useEffect, useState } from 'react';
import { read } from './idb-cache.js';

/**
 * Returns the `cachedAt` timestamp for an idbCache entry as ISO string.
 * Re-reads when the `dependsOn` value changes (typically the query data
 * itself, so the timestamp updates after a successful queryFn write).
 *
 * Used to surface "last synced X ago" labels alongside cached data — the
 * freshness signal users need when offline.
 */
export function useCachedAt(cacheKey: string, dependsOn: unknown): string | null {
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  // dependsOn is a trigger-only dep — its identity changes when the upstream
  // query refetches, which is exactly when we want to re-read the IDB
  // cachedAt timestamp. The effect body doesn't reference it directly.
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger-only dep
  useEffect(() => {
    let cancelled = false;
    void read<unknown>(cacheKey).then((entry) => {
      if (cancelled) return;
      setCachedAt(entry ? new Date(entry.cachedAt).toISOString() : null);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, dependsOn]);

  return cachedAt;
}
