import type { StokvelId } from '@seyva/types';
import { formatMoney, formatRelativeTime } from '@seyva/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { copy, interpolate, plural } from '../../copy/index.js';
import { balanceQueryOptions, membersQueryOptions, stokvelQueryOptions } from './queries.js';

interface DashboardViewProps {
  stokvelId: StokvelId;
}

export function DashboardView({ stokvelId }: DashboardViewProps) {
  const { data: stokvel } = useSuspenseQuery(stokvelQueryOptions(stokvelId));
  const { data: balance } = useSuspenseQuery(balanceQueryOptions(stokvelId));
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">{stokvel.name}</h1>

      <div className="rounded-2xl bg-brand p-5 text-white shadow-sm">
        <p className="text-sm font-medium text-white/70">{copy.dashboard.balanceTitle}</p>
        <p className="mt-1 text-3xl font-bold">{formatMoney(balance.totalBalance)}</p>
        <p className="mt-1 text-xs text-white/60">
          {interpolate(copy.dashboard.reconciledAtLabel, {
            date: formatRelativeTime(balance.reconciledAt),
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">{copy.dashboard.monthlyTargetLabel}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatMoney(balance.monthlyTarget)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">Members</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {plural(copy.dashboard.memberCountLabel, members.length)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-medium text-gray-600">Rules</p>
        <p className="mt-1 text-sm text-gray-700">{stokvel.rules}</p>
      </div>
    </div>
  );
}
