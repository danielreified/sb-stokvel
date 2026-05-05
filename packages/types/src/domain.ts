import type { MemberId, StokvelId } from './brands.js';

export interface Stokvel {
  id: StokvelId;
  name: string;
  rules: string;
  monthlyTarget: number;
  createdAt: string;
}

export interface Member {
  id: MemberId;
  stokvelId: StokvelId;
  name: string;
  phone: string;
  joinedAt: string;
}

export type ContributionStatus = 'pending' | 'confirmed' | 'missed';

export interface Contribution {
  id: string;
  memberId: MemberId;
  stokvelId: StokvelId;
  /** Amount in cents (ZAR). */
  amount: number;
  /** Calendar month the contribution covers, format YYYY-MM. */
  month: string;
  status: ContributionStatus;
  createdAt: string;
}

export interface BalanceSummary {
  stokvelId: StokvelId;
  /** Total confirmed balance in cents. */
  totalBalance: number;
  /** Monthly target per member in cents. */
  monthlyTarget: number;
  /** ISO timestamp of last reconciliation. */
  reconciledAt: string;
}

export type UpdateLevel = 'none' | 'optional' | 'recommended' | 'forced';
