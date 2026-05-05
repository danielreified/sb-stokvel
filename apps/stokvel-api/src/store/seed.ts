import type { BalanceSummary, Contribution, Member, Stokvel } from '@seyva/types';
import { toMemberId, toStokvelId } from '@seyva/types';
import type { Store } from './types.js';

/** Fixed UUIDs so the persisted client cache survives API restarts. */
const STOKVEL_ID = toStokvelId('00000000-0000-0000-0000-000000000001');

const MEMBERS: Member[] = [
  {
    id: toMemberId('10000000-0000-0000-0000-000000000001'),
    stokvelId: STOKVEL_ID,
    name: 'Nomsa Dlamini',
    phone: '+27821000001',
    joinedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: toMemberId('10000000-0000-0000-0000-000000000002'),
    stokvelId: STOKVEL_ID,
    name: 'Thabo Nkosi',
    phone: '+27821000002',
    joinedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: toMemberId('10000000-0000-0000-0000-000000000003'),
    stokvelId: STOKVEL_ID,
    name: 'Zanele Mokoena',
    phone: '+27821000003',
    joinedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: toMemberId('10000000-0000-0000-0000-000000000004'),
    stokvelId: STOKVEL_ID,
    name: 'Sipho Khumalo',
    phone: '+27821000004',
    joinedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: toMemberId('10000000-0000-0000-0000-000000000005'),
    stokvelId: STOKVEL_ID,
    name: 'Lerato Sithole',
    phone: '+27821000005',
    joinedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: toMemberId('10000000-0000-0000-0000-000000000006'),
    stokvelId: STOKVEL_ID,
    name: 'Bongani Zulu',
    phone: '+27821000006',
    joinedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: toMemberId('10000000-0000-0000-0000-000000000007'),
    stokvelId: STOKVEL_ID,
    name: 'Ayanda Mthembu',
    phone: '+27821000007',
    joinedAt: '2025-03-01T00:00:00.000Z',
  },
  {
    id: toMemberId('10000000-0000-0000-0000-000000000008'),
    stokvelId: STOKVEL_ID,
    name: 'Precious Mahlangu',
    phone: '+27821000008',
    joinedAt: '2025-03-01T00:00:00.000Z',
  },
];

/** Demo login account — phone matches Nomsa Dlamini. PIN is checked mock-style. */
export const DEMO_PHONE = '+27821000001';
export const DEMO_PIN = '1234';

function contribution(
  id: string,
  memberId: string,
  month: string,
  status: 'confirmed' | 'pending' | 'missed',
): Contribution {
  return {
    id,
    memberId: toMemberId(memberId),
    stokvelId: STOKVEL_ID,
    amount: 50000,
    month,
    status,
    createdAt: `${month}-05T10:00:00.000Z`,
  };
}

const CONTRIBUTIONS: Contribution[] = [
  ...MEMBERS.flatMap((m, i) =>
    ['2025-02', '2025-03', '2025-04'].map((month, j) =>
      contribution(
        `20000000-0000-0000-${String(i).padStart(4, '0')}-${String(j).padStart(12, '0')}`,
        m.id,
        month,
        i === 3 && month === '2025-04' ? 'missed' : 'confirmed',
      ),
    ),
  ),
];

const BALANCE: BalanceSummary = {
  stokvelId: STOKVEL_ID,
  totalBalance: CONTRIBUTIONS.filter((c) => c.status === 'confirmed').length * 50000,
  monthlyTarget: 50000,
  reconciledAt: '2026-05-01T00:00:00.000Z',
};

export function createStore(): Store {
  const store: Store = {
    stokvels: new Map(),
    members: new Map(),
    contributions: new Map(),
    balances: new Map(),
    sessions: new Map(),
  };

  const stokvel: Stokvel = {
    id: STOKVEL_ID,
    name: 'Ubuntu Stokvel',
    rules: 'Monthly contribution of R500. Payout rotates monthly. Missed contribution = penalty.',
    monthlyTarget: 50000,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  store.stokvels.set(STOKVEL_ID, stokvel);
  for (const m of MEMBERS) store.members.set(m.id, m);
  for (const c of CONTRIBUTIONS) store.contributions.set(c.id, c);
  store.balances.set(STOKVEL_ID, BALANCE);

  return store;
}
