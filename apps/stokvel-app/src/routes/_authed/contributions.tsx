import { toStokvelId } from '@seyva/types';
import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod';
import { copy } from '../../copy/index.js';
import { ContributionsView } from '../../features/contributions/ContributionsView.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';
import { RouteErrorPanel } from '../../layout/RouteErrorPanel.js';

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
    <Suspense fallback={<DashboardSkeleton />}>
      <ContributionsView stokvelId={DEMO_STOKVEL_ID} filters={{ month, memberId }} />
    </Suspense>
  );
}

function ContributionsErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  return (
    <RouteErrorPanel
      message={copy.errors.contributionsLoadFailed}
      detail={error instanceof Error ? error.message : undefined}
      onRetry={reset}
    />
  );
}
