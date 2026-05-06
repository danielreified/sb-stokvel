import type { Contribution, Member, StokvelId } from '@seyva/types';
import { Badge, Button } from '@seyva/ui';
import { formatMoney, formatMonth } from '@seyva/utils';
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MemberAvatar } from '../../components/MemberAvatar.js';
import { type Copy, interpolate, useCopy } from '../../copy/index.js';
import { getCurrentMonth } from '../../lib/date.js';
import { idbCache } from '../../lib/persist/idb-cache.js';
import { membersQueryOptions } from '../dashboard/queries.js';
import type { ContributionFilters } from './queries.js';
import { contributionsInfiniteQueryOptions, contributionsQueryOptions } from './queries.js';
import { getStatusLabel, STATUS_VARIANT } from './status.js';

interface ContributionsViewProps {
  stokvelId: StokvelId;
  filters: ContributionFilters;
}

export function ContributionsView({ stokvelId, filters }: ContributionsViewProps) {
  // When the user has narrowed by month (?month=YYYY-MM), show only that month —
  // the regular single-page query. With no month filter we paginate by month
  // backwards through history so the list scales without RAM blowing up.
  if (filters.month) {
    return <FilteredView stokvelId={stokvelId} filters={filters} />;
  }
  return <InfiniteView stokvelId={stokvelId} />;
}

function FilteredView({ stokvelId, filters }: ContributionsViewProps) {
  const copy = useCopy();
  const { data: contributions } = useSuspenseQuery(contributionsQueryOptions(stokvelId, filters));
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));
  const memberById = new Map(members.map((m) => [m.id, m]));

  const summaryMonth = filters.month ?? getCurrentMonth();
  const paidCount = contributions.filter((c) => c.status === 'confirmed').length;

  return (
    <Layout
      copy={copy}
      summary={interpolate(copy.contributions.summaryLabel, {
        month: formatMonth(summaryMonth),
        paid: paidCount,
        total: contributions.length || members.length,
      })}
    >
      {contributions.length === 0 ? (
        <EmptyState copy={copy} />
      ) : (
        <Table copy={copy} contributions={contributions} memberById={memberById} />
      )}
    </Layout>
  );
}

function InfiniteView({ stokvelId }: { stokvelId: StokvelId }) {
  const copy = useCopy();
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));
  const memberById = new Map(members.map((m) => [m.id, m]));

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    contributionsInfiniteQueryOptions(stokvelId),
  );

  const allContributions = data.pages.flat();
  const currentMonthContributions = data.pages[0] ?? [];
  const paidThisMonth = currentMonthContributions.filter((c) => c.status === 'confirmed').length;

  return (
    <Layout
      copy={copy}
      summary={interpolate(copy.contributions.summaryLabel, {
        month: formatMonth(getCurrentMonth()),
        paid: paidThisMonth,
        total: members.length,
      })}
    >
      {allContributions.length === 0 ? (
        <EmptyState copy={copy} />
      ) : (
        <>
          <Table copy={copy} contributions={allContributions} memberById={memberById} />
          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={async () => {
                  await fetchNextPage();
                  // Run eviction after a fresh page lands so the cache doesn't
                  // grow unbounded if the user paginates deep into history.
                  void idbCache.evict();
                }}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? copy.contributions.loadingOlder
                  : copy.contributions.loadOlder}
              </Button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

function Layout({
  copy,
  summary,
  children,
}: {
  copy: Copy;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{copy.contributions.pageTitle}</h2>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
        <Button asChild>
          <Link to="/contributions/new">+ {copy.contributions.makeContributionButton}</Link>
        </Button>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ copy }: { copy: Copy }) {
  return (
    <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
      {copy.contributions.emptyMessage}
    </p>
  );
}

function Table({
  copy,
  contributions,
  memberById,
}: {
  copy: Copy;
  contributions: Contribution[];
  memberById: Map<string, Member>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{copy.contributions.columnMember}</span>
        <span>{copy.contributions.columnMonth}</span>
        <span>{copy.contributions.columnAmount}</span>
        <span className="text-right">{copy.contributions.columnStatus}</span>
      </div>
      {contributions.map((c, i) => {
        const member = memberById.get(c.memberId);
        return (
          <div
            key={c.id}
            className={`grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 ${
              i < contributions.length - 1 ? 'border-b' : ''
            }`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {member ? (
                <MemberAvatar name={member.name} size="xs" />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  —
                </div>
              )}
              <span className="truncate text-sm font-medium">{member?.name ?? 'Unknown'}</span>
            </div>
            <span className="text-sm text-muted-foreground">{formatMonth(c.month)}</span>
            <span className="text-sm font-semibold">{formatMoney(c.amount)}</span>
            <div className="flex justify-end">
              <Badge variant={STATUS_VARIANT[c.status]}>{getStatusLabel(copy, c.status)}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
