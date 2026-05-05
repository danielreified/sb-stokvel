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
) =>
  queryOptions({
    queryKey: ['contributions', stokvelId, filters],
    queryFn: () => api.stokvel.contributions(stokvelId, filters),
    staleTime: 5 * 60 * 1000,
  });
