/**
 * Idempotent demo seed. Wipes + re-inserts: 1 stokvel, 8 members, 3 months
 * of contributions. Fixed UUIDs so the persisted client cache survives
 * API restarts.
 */
import { createDb } from './index.js';
import { contributions, members, stokvels } from './schema.js';

const STOKVEL_ID = '00000000-0000-0000-0000-000000000001';

const MEMBER_SEEDS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Nomsa Dlamini',
    phone: '+27821000001',
    joinedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Thabo Nkosi',
    phone: '+27821000002',
    joinedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Zanele Mokoena',
    phone: '+27821000003',
    joinedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Sipho Khumalo',
    phone: '+27821000004',
    joinedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Lerato Sithole',
    phone: '+27821000005',
    joinedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'Bongani Zulu',
    phone: '+27821000006',
    joinedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    name: 'Ayanda Mthembu',
    phone: '+27821000007',
    joinedAt: '2025-03-01T00:00:00.000Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    name: 'Precious Mahlangu',
    phone: '+27821000008',
    joinedAt: '2025-03-01T00:00:00.000Z',
  },
];

export const DEMO_PHONE = '+27821000001';
export const DEMO_PIN = '1234';

export async function seed(databaseUrl: string): Promise<void> {
  const { db, close } = createDb(databaseUrl);
  try {
    // Delete in FK order so cascades don't matter
    await db.delete(contributions);
    await db.delete(members);
    await db.delete(stokvels);

    await db.insert(stokvels).values({
      id: STOKVEL_ID,
      name: 'Ubuntu Stokvel',
      rules: 'Monthly contribution of R500. Payout rotates monthly. Missed contribution = penalty.',
      monthlyTargetCents: 50000,
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    await db.insert(members).values(
      MEMBER_SEEDS.map((m) => ({
        id: m.id,
        stokvelId: STOKVEL_ID,
        name: m.name,
        phone: m.phone,
        joinedAt: m.joinedAt,
      })),
    );

    const months = ['2025-02', '2025-03', '2025-04'];
    const rows = MEMBER_SEEDS.flatMap((m, i) =>
      months.map((month, j) => ({
        id: `20000000-0000-0000-${String(i).padStart(4, '0')}-${String(j).padStart(12, '0')}`,
        memberId: m.id,
        stokvelId: STOKVEL_ID,
        amountCents: 50000,
        month,
        status: (i === 3 && month === '2025-04' ? 'missed' : 'confirmed') as
          | 'pending'
          | 'confirmed'
          | 'missed',
        createdAt: `${month}-05T10:00:00.000Z`,
      })),
    );
    await db.insert(contributions).values(rows);
  } finally {
    await close();
  }
}

if (import.meta.main) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  await seed(url);
  console.log('seed complete');
}
