import type { StokvelId } from '@seyva/types';
import { Badge, Button } from '@seyva/ui';
import { formatMoney, formatMonth } from '@seyva/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MemberAvatar } from '../../components/MemberAvatar.js';
import { interpolate, useCopy } from '../../copy/index.js';
import { getCurrentMonth } from '../../lib/date.js';
import { membersQueryOptions } from '../dashboard/queries.js';
import type { ContributionFilters } from './queries.js';
import { contributionsQueryOptions } from './queries.js';
import { getStatusLabel, STATUS_VARIANT } from './status.js';

interface ContributionsViewProps {
  stokvelId: StokvelId;
  filters: ContributionFilters;
}

export function ContributionsView({ stokvelId, filters }: ContributionsViewProps) {
  const copy = useCopy();
  const { data: contributions } = useSuspenseQuery(contributionsQueryOptions(stokvelId, filters));
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));
  const memberById = new Map(members.map((m) => [m.id, m]));

  const summaryMonth = filters.month ?? getCurrentMonth();
  const paidCount = contributions.filter((c) => c.status === 'confirmed').length;

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{copy.contributions.pageTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {interpolate(copy.contributions.summaryLabel, {
              month: formatMonth(summaryMonth),
              paid: paidCount,
              total: contributions.length || members.length,
            })}
          </p>
        </div>
        <Button asChild>
          <Link to="/contributions/new">+ {copy.contributions.makeContributionButton}</Link>
        </Button>
      </div>

      {contributions.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          {copy.contributions.emptyMessage}
        </p>
      ) : (
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
      )}
    </div>
  );
}
