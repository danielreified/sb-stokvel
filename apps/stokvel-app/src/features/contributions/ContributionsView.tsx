import type { StokvelId } from '@seyva/types';
import { cn } from '@seyva/ui';
import { formatMoney, formatMonth } from '@seyva/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { copy } from '../../copy/index.js';
import type { ContributionFilters } from './queries.js';
import { contributionsQueryOptions } from './queries.js';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  missed: 'bg-red-100 text-red-800',
} as const;

const STATUS_LABELS = {
  confirmed: copy.contributions.statusConfirmed,
  pending: copy.contributions.statusPending,
  missed: copy.contributions.statusMissed,
} as const;

interface ContributionsViewProps {
  stokvelId: StokvelId;
  filters: ContributionFilters;
}

export function ContributionsView({ stokvelId, filters }: ContributionsViewProps) {
  const { data: contributions } = useSuspenseQuery(contributionsQueryOptions(stokvelId, filters));

  if (contributions.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-gray-500">
        No contributions found for the selected filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {contributions.map((contribution) => (
        <li key={contribution.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{formatMonth(contribution.month)}</p>
            <p className="text-xs text-gray-400">{formatMoney(contribution.amount)}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_STYLES[contribution.status],
            )}
          >
            {STATUS_LABELS[contribution.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
