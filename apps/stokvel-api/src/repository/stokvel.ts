import type { BalanceSummary, Contribution, Member, Stokvel, StokvelId } from '@seyva/types';
import type { Store } from '../store/types.js';

export interface ContributionFilters {
  month?: string;
  memberId?: string;
}

export function createStokvelRepository(store: Store) {
  return {
    findById: (id: StokvelId): Stokvel | undefined => store.stokvels.get(id),

    findMembers: (stokvelId: StokvelId): Member[] =>
      [...store.members.values()].filter((m) => m.stokvelId === stokvelId),

    findContributions: (stokvelId: StokvelId, filters: ContributionFilters = {}): Contribution[] =>
      [...store.contributions.values()].filter((c) => {
        if (c.stokvelId !== stokvelId) return false;
        if (filters.month && c.month !== filters.month) return false;
        if (filters.memberId && c.memberId !== filters.memberId) return false;
        return true;
      }),

    findBalance: (stokvelId: StokvelId): BalanceSummary | undefined =>
      store.balances.get(stokvelId),

    addContribution: (contribution: Contribution): void => {
      store.contributions.set(contribution.id, contribution);
    },
  };
}
