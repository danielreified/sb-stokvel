import { toStokvelId } from '@seyva/types';
import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod';
import { copy } from '../../copy/index.js';
import { ContributionsView } from '../../features/contributions/ContributionsView.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';

const DEMO_STOKVEL_ID = toStokvelId('00000000-0000-0000-0000-000000000001');

const contributionsSearchSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
  memberId: z.string().uuid().optional(),
});

export const Route = createFileRoute('/_authed/contributions')({
  validateSearch: contributionsSearchSchema,
  pendingComponent: DashboardSkeleton,
  errorComponent: ContributionsErrorComponent,
  component: ContributionsPage,
});

function ContributionsPage() {
  const { month, memberId } = Route.useSearch();
  const childMatches = useChildMatches();

  if (childMatches.length > 0) {
    return <Outlet />;
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{copy.contributions.pageTitle}</h1>
        <Link
          to="/contributions/new"
          className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white"
        >
          + {copy.contributions.makeContributionButton}
        </Link>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <ContributionsView stokvelId={DEMO_STOKVEL_ID} filters={{ month, memberId }} />
      </Suspense>
    </div>
  );
}

function ContributionsErrorComponent() {
  return <p className="p-4 text-center text-gray-500">{copy.contributions.loadFailed}</p>;
}
