import type { StokvelId } from '@seyva/types';
import { queryOptions } from '@tanstack/react-query';
import { api } from '../../lib/api.js';

export interface ContributionFilters {
  month?: string;
  memberId?: string;
}

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
    queryFn: () => api.stokvel.contributions(stokvelId, filters),
    staleTime: 5 * 60 * 1000,
  });
};
