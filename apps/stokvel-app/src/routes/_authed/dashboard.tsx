import { toStokvelId } from '@seyva/types';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { copy } from '../../copy/index.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';
import { DashboardView } from '../../features/dashboard/DashboardView.js';
import { RouteErrorPanel } from '../../layout/RouteErrorPanel.js';

// Fixed UUID from the seed — matches apps/stokvel-api/src/store/seed.ts
const DEMO_STOKVEL_ID = toStokvelId('00000000-0000-0000-0000-000000000001');

export const Route = createFileRoute('/_authed/dashboard')({
  pendingComponent: DashboardSkeleton,
  errorComponent: DashboardErrorComponent,
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView stokvelId={DEMO_STOKVEL_ID} />
    </Suspense>
  );
}

function DashboardErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  return (
    <RouteErrorPanel
      message={copy.errors.dashboardLoadFailed}
      detail={error instanceof Error ? error.message : undefined}
      onRetry={reset}
    />
  );
}
