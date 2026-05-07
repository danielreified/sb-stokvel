import type { Db } from '@seyva/db';
import { and, eq, schema, sql } from '@seyva/db';
import type { BalanceSummary, Contribution, Member, Stokvel, StokvelId } from '@seyva/types';
import { toMemberId, toStokvelId } from '@seyva/types';

export interface ContributionFilters {
  month?: string;
  memberId?: string;
}

type StokvelRow = typeof schema.stokvels.$inferSelect;
type MemberRow = typeof schema.members.$inferSelect;
type ContributionRow = typeof schema.contributions.$inferSelect;

const toStokvel = (row: StokvelRow): Stokvel => ({
  id: toStokvelId(row.id),
  name: row.name,
  rules: row.rules,
  monthlyTarget: row.monthlyTargetCents,
  createdAt: row.createdAt,
});

const toMember = (row: MemberRow): Member => ({
  id: toMemberId(row.id),
  stokvelId: toStokvelId(row.stokvelId),
  name: row.name,
  phone: row.phone,
  joinedAt: row.joinedAt,
});

const toContribution = (row: ContributionRow): Contribution => ({
  id: row.id,
  memberId: toMemberId(row.memberId),
  stokvelId: toStokvelId(row.stokvelId),
  amount: row.amountCents,
  month: row.month,
  status: row.status,
  createdAt: row.createdAt,
});

export function createStokvelRepository(db: Db) {
  return {
    findById: async (id: StokvelId): Promise<Stokvel | undefined> => {
      const [row] = await db.select().from(schema.stokvels).where(eq(schema.stokvels.id, id));
      return row ? toStokvel(row) : undefined;
    },

    findMembers: async (stokvelId: StokvelId): Promise<Member[]> => {
      const rows = await db
        .select()
        .from(schema.members)
        .where(eq(schema.members.stokvelId, stokvelId));
      return rows.map(toMember);
    },

    findMemberByPhone: async (phone: string): Promise<Member | undefined> => {
      const [row] = await db.select().from(schema.members).where(eq(schema.members.phone, phone));
      return row ? toMember(row) : undefined;
    },

    findMemberById: async (id: string): Promise<Member | undefined> => {
      const [row] = await db.select().from(schema.members).where(eq(schema.members.id, id));
      return row ? toMember(row) : undefined;
    },

    findContributions: async (
      stokvelId: StokvelId,
      filters: ContributionFilters = {},
    ): Promise<Contribution[]> => {
      const wheres = [eq(schema.contributions.stokvelId, stokvelId)];
      if (filters.month) wheres.push(eq(schema.contributions.month, filters.month));
      if (filters.memberId) wheres.push(eq(schema.contributions.memberId, filters.memberId));

      const rows = await db
        .select()
        .from(schema.contributions)
        .where(and(...wheres));
      return rows.map(toContribution);
    },

    /**
     * Balance is computed on demand rather than stored. `reconciledAt` is the
     * latest confirmed contribution's createdAt, falling back to the stokvel's
     * createdAt when there are no confirmed contributions yet.
     */
    findBalance: async (stokvelId: StokvelId): Promise<BalanceSummary | undefined> => {
      const [stokvelRow] = await db
        .select()
        .from(schema.stokvels)
        .where(eq(schema.stokvels.id, stokvelId));
      if (!stokvelRow) return undefined;

      const [agg] = await db
        .select({
          total: sql<string>`coalesce(sum(${schema.contributions.amountCents}), 0)`,
          latest: sql<string | null>`max(${schema.contributions.createdAt})`,
        })
        .from(schema.contributions)
        .where(
          and(
            eq(schema.contributions.stokvelId, stokvelId),
            eq(schema.contributions.status, 'confirmed'),
          ),
        );

      return {
        stokvelId: toStokvelId(stokvelRow.id),
        totalBalance: Number(agg?.total ?? 0),
        monthlyTarget: stokvelRow.monthlyTargetCents,
        reconciledAt: agg?.latest ?? stokvelRow.createdAt,
      };
    },

    addContribution: async (contribution: Contribution): Promise<void> => {
      await db.insert(schema.contributions).values({
        id: contribution.id,
        memberId: contribution.memberId,
        stokvelId: contribution.stokvelId,
        amountCents: contribution.amount,
        month: contribution.month,
        status: contribution.status,
        createdAt: contribution.createdAt,
      });
    },
  };
}
