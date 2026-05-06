import type { StokvelId } from '@seyva/types';
import { Badge } from '@seyva/ui';
import { formatMoney, formatRelativeTime } from '@seyva/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { MemberAvatar } from '../../components/MemberAvatar.js';
import { interpolate, plural, useCopy } from '../../copy/index.js';
import { getCurrentMonth } from '../../lib/date.js';
import { contributionsQueryOptions } from '../contributions/queries.js';
import { getStatusLabel, STATUS_VARIANT } from '../contributions/status.js';
import { balanceQueryOptions, membersQueryOptions, stokvelQueryOptions } from './queries.js';

interface DashboardViewProps {
  stokvelId: StokvelId;
}

export function DashboardView({ stokvelId }: DashboardViewProps) {
  const copy = useCopy();
  const { data: stokvel } = useSuspenseQuery(stokvelQueryOptions(stokvelId));
  const { data: balance } = useSuspenseQuery(balanceQueryOptions(stokvelId));
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));
  const currentMonth = getCurrentMonth();
  const { data: monthContributions } = useSuspenseQuery(
    contributionsQueryOptions(stokvelId, { month: currentMonth }),
  );
  const { data: recent } = useSuspenseQuery(contributionsQueryOptions(stokvelId, {}));

  const memberById = new Map(members.map((m) => [m.id, m]));
  const paidThisMonth = monthContributions.filter((c) => c.status === 'confirmed').length;
  const recentSorted = [...recent]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold">{copy.nav.dashboard}</h2>
        <p className="text-sm text-muted-foreground">
          {stokvel.name} · {plural(copy.dashboard.memberCountLabel, members.length)}
        </p>
      </div>

      <div className="rounded-xl bg-primary p-6 text-white">
        <p className="text-xs font-medium uppercase tracking-widest opacity-70">
          {copy.dashboard.balanceTitle}
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {formatMoney(balance.totalBalance)}
        </p>
        <p className="mt-1.5 text-xs opacity-60">
          {interpolate(copy.dashboard.reconciledAtLabel, {
            date: formatRelativeTime(balance.reconciledAt),
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">{copy.dashboard.monthlyTargetLabel}</p>
          <p className="mt-1 font-semibold">{formatMoney(balance.monthlyTarget)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">{copy.dashboard.paidThisMonthLabel}</p>
          <p className="mt-1 font-semibold">
            {interpolate(copy.dashboard.paidThisMonthValue, {
              paid: paidThisMonth,
              total: members.length,
            })}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">{copy.dashboard.nextPayoutLabel}</p>
          <p className="mt-1 truncate font-semibold">{members[0]?.name.split(' ')[0] ?? '—'}</p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">{copy.dashboard.recentActivityLabel}</p>
        <div className="space-y-2">
          {recentSorted.map((c) => {
            const member = memberById.get(c.memberId);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {member ? (
                    <MemberAvatar name={member.name} size="sm" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      —
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{member?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(c.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatMoney(c.amount)}</span>
                  <Badge variant={STATUS_VARIANT[c.status]}>{getStatusLabel(copy, c.status)}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
