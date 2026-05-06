import type { ContributionStatus, StokvelId } from '@seyva/types';
import { Badge, ScrollArea, Separator } from '@seyva/ui';
import { formatDate, formatMoney, formatPhone } from '@seyva/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MemberAvatar } from '../../components/MemberAvatar.js';
import { useCopy } from '../../copy/index.js';
import { getCurrentMonth } from '../../lib/date.js';
import { contributionsQueryOptions } from '../contributions/queries.js';
import { getStatusLabel, STATUS_VARIANT } from '../contributions/status.js';
import { balanceQueryOptions, membersQueryOptions } from '../dashboard/queries.js';

interface MembersViewProps {
  stokvelId: StokvelId;
}

export function MembersView({ stokvelId }: MembersViewProps) {
  const copy = useCopy();
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));
  const { data: balance } = useSuspenseQuery(balanceQueryOptions(stokvelId));
  const currentMonth = getCurrentMonth();
  const { data: monthContributions } = useSuspenseQuery(
    contributionsQueryOptions(stokvelId, { month: currentMonth }),
  );

  const [selectedId, setSelectedId] = useState<string>(members[0]?.id ?? '');
  const selected = members.find((m) => m.id === selectedId) ?? members[0];

  const statusByMemberId = new Map<string, ContributionStatus>();
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
                <MemberAvatar name={m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {status ? getStatusLabel(copy, status) : copy.members.statusNoContribution}
                  </p>
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div className="flex items-center gap-4">
          <MemberAvatar name={selected.name} size="md" tone="solid" />
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
                  {getStatusLabel(copy, selectedStatus)}
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
