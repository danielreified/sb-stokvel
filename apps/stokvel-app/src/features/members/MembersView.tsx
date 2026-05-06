import type { StokvelId } from '@seyva/types';
import { Badge, ScrollArea, Separator } from '@seyva/ui';
import { formatDate, formatMoney, formatPhone } from '@seyva/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { copy } from '../../copy/index.js';
import { initialsOf } from '../../lib/initials.js';
import { contributionsQueryOptions } from '../contributions/queries.js';
import { balanceQueryOptions, membersQueryOptions } from '../dashboard/queries.js';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  confirmed: 'default',
  pending: 'secondary',
  missed: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: copy.contributions.statusConfirmed,
  pending: copy.contributions.statusPending,
  missed: copy.contributions.statusMissed,
};

interface MembersViewProps {
  stokvelId: StokvelId;
}

export function MembersView({ stokvelId }: MembersViewProps) {
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));
  const { data: balance } = useSuspenseQuery(balanceQueryOptions(stokvelId));
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: monthContributions } = useSuspenseQuery(
    contributionsQueryOptions(stokvelId, { month: currentMonth }),
  );

  const [selectedId, setSelectedId] = useState<string>(members[0]?.id ?? '');
  const selected = members.find((m) => m.id === selectedId) ?? members[0];

  const statusByMemberId = new Map<string, string>();
  for (const c of monthContributions) statusByMemberId.set(c.memberId, c.status);

  if (!selected) return null;

  const selectedStatus = statusByMemberId.get(selected.id);

  return (
    <div className="flex h-full">
      <div className="w-60 shrink-0 border-r">
        <div className="border-b px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {copy.members.pageTitle}
          </p>
        </div>
        <ScrollArea className="h-[calc(100%-2.75rem)]">
          {members.map((m) => {
            const status = statusByMemberId.get(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                  selected.id === m.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initialsOf(m.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {status ? STATUS_LABEL[status] : copy.members.statusNoContribution}
                  </p>
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {initialsOf(selected.name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{selected.name}</h2>
            <p className="text-sm text-muted-foreground">{formatPhone(selected.phone)}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{copy.members.contributionLabel}</p>
            <p className="mt-1 font-semibold">{formatMoney(balance.monthlyTarget)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{copy.dashboard.nextPayoutLabel}</p>
            <p className="mt-1 font-semibold">{formatDate(selected.joinedAt)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{copy.members.statusLabel}</p>
            <p className="mt-1">
              {selectedStatus ? (
                <Badge variant={STATUS_VARIANT[selectedStatus]}>
                  {STATUS_LABEL[selectedStatus]}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {copy.members.statusNoContribution}
                </span>
              )}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{copy.members.memberSinceLabel}</p>
            <p className="mt-1 font-semibold">{formatDate(selected.joinedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
