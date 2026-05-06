import type { Contribution, StokvelId } from '@seyva/types';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { getCurrentMonth, previousMonth } from '../../lib/date.js';
import { cachedQueryFn } from '../../lib/persist/idb-cache.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const CACHE_TTL = 30 * 24 * HOUR;

export interface ContributionFilters {
  month?: string;
  memberId?: string;
}

const filterKey = (filters: ContributionFilters): string =>
  Object.keys(filters)
    .filter((k) => filters[k as keyof ContributionFilters] !== undefined)
    .sort()
    .map((k) => `${k}=${filters[k as keyof ContributionFilters]}`)
    .join('&');

export const contributionsQueryOptions = (
  stokvelId: StokvelId,
  filters: ContributionFilters = {},
) => {
  // Strip undefined values so { month: undefined } and {} produce the same cache key
  const normFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined),
  );
  return queryOptions({
    queryKey: ['contributions', stokvelId, normFilters],
    queryFn: () =>
      cachedQueryFn(
        `contributions:${stokvelId}:${filterKey(normFilters)}`,
        () => api.stokvel.contributions(stokvelId, filters),
        { ttl: CACHE_TTL, persistent: true },
      ),
    staleTime: 5 * MINUTE,
    gcTime: 10 * MINUTE,
  });
};

/**
 * Paginated contributions for the main list view. Each "page" is one month;
 * `getNextPageParam` walks backwards in time. Stops when a page returns empty
 * (no contributions that month → presumed no older history) or after a hard
 * 24-month safety cap.
 *
 * Each page is a separate idbCache entry, so on cheap-Android RAM is bounded
 * by the visible-pages window, not the total history length.
 */
const MAX_PAGES = 24;

export const contributionsInfiniteQueryOptions = (stokvelId: StokvelId) =>
  infiniteQueryOptions({
    queryKey: ['contributions', stokvelId, 'infinite'],
    initialPageParam: getCurrentMonth(),
    queryFn: ({ pageParam }: { pageParam: string }) =>
      cachedQueryFn(
        `contributions:${stokvelId}:month=${pageParam}`,
        () => api.stokvel.contributions(stokvelId, { month: pageParam }),
        { ttl: CACHE_TTL, persistent: true },
      ),
    getNextPageParam: (
      lastPage: Contribution[],
      allPages: Contribution[][],
      lastPageParam: string,
    ): string | undefined => {
      if (lastPage.length === 0) return undefined;
      if (allPages.length >= MAX_PAGES) return undefined;
      return previousMonth(lastPageParam);
    },
    staleTime: 5 * MINUTE,
    gcTime: 10 * MINUTE,
  });
