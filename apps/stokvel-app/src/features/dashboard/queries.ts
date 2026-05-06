import type { StokvelId } from '@seyva/types';
import { queryOptions } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { cachedQueryFn } from '../../lib/persist/idb-cache.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Disk TTL is a graceful-degradation safety net, not the primary freshness
 * mechanism. Mutations invalidate affected queries (`queryClient.invalidate`),
 * fresh login wipes everything, sign-out wipes everything. TTL only kicks in
 * if a user goes >30 days without any invalidation signal — at which point
 * a refetch is reasonable.
 *
 * `staleTime` and `gcTime` still differ per query — those control in-RAM
 * refetch behaviour and unmount eviction, separate concerns from disk TTL.
 */
const CACHE_TTL = 30 * 24 * HOUR;

const STABLE_STALE = 60 * MINUTE;
const STABLE_GC = 60 * MINUTE;
const VOLATILE_STALE = 5 * MINUTE;
const VOLATILE_GC = 10 * MINUTE;

export const stokvelQueryOptions = (stokvelId: StokvelId) =>
  queryOptions({
    queryKey: ['stokvel', stokvelId],
    queryFn: () =>
      cachedQueryFn(`stokvel:${stokvelId}`, () => api.stokvel.get(stokvelId), {
        ttl: CACHE_TTL,
        persistent: true,
      }),
    staleTime: STABLE_STALE,
    gcTime: STABLE_GC,
  });

export const balanceQueryOptions = (stokvelId: StokvelId) =>
  queryOptions({
    queryKey: ['balance', stokvelId],
    queryFn: () =>
      cachedQueryFn(`balance:${stokvelId}`, () => api.stokvel.balance(stokvelId), {
        ttl: CACHE_TTL,
        persistent: true,
      }),
    staleTime: VOLATILE_STALE,
    gcTime: VOLATILE_GC,
  });

export const membersQueryOptions = (stokvelId: StokvelId) =>
  queryOptions({
    queryKey: ['members', stokvelId],
    queryFn: () =>
      cachedQueryFn(`members:${stokvelId}`, () => api.stokvel.members(stokvelId), {
        ttl: CACHE_TTL,
        persistent: true,
      }),
    staleTime: STABLE_STALE,
    gcTime: STABLE_GC,
  });
