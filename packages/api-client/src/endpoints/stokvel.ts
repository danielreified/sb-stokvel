import type { BalanceSummary, Contribution, Member, Stokvel, StokvelId } from '@seyva/types';
import type { ContributionCreateInput } from '@seyva/validation';
import type { RequestFn } from '../types.js';

export interface ContributionListParams {
  month?: string;
  memberId?: string;
}

export function createStokvelEndpoints(request: RequestFn) {
  return {
    get: (stokvelId: StokvelId): Promise<Stokvel> => request('GET', `/api/stokvel/${stokvelId}`),

    members: (stokvelId: StokvelId): Promise<Member[]> =>
      request('GET', `/api/stokvel/${stokvelId}/members`),

    contributions: (
      stokvelId: StokvelId,
      params?: ContributionListParams,
    ): Promise<Contribution[]> => {
      const defined = params
        ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
        : {};
      const qs = Object.keys(defined).length
        ? `?${new URLSearchParams(defined as Record<string, string>).toString()}`
        : '';
      return request('GET', `/api/stokvel/${stokvelId}/contributions${qs}`);
    },

    balance: (stokvelId: StokvelId): Promise<BalanceSummary> =>
      request('GET', `/api/stokvel/${stokvelId}/balance`),

    createContribution: (
      stokvelId: StokvelId,
      data: ContributionCreateInput,
    ): Promise<Contribution> => request('POST', `/api/stokvel/${stokvelId}/contributions`, data),
  };
}
