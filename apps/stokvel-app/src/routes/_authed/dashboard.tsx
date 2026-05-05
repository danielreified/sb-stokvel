import { toStokvelId } from '@seyva/types';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { copy } from '../../copy/index.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';
import { DashboardView } from '../../features/dashboard/DashboardView.js';

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

function DashboardErrorComponent({ error }: { error: unknown }) {
  return (
    <div className="p-4 text-center">
      <p className="text-gray-500">{copy.errors.dashboardLoadFailed}</p>
      {error instanceof Error && <p className="mt-1 text-xs text-gray-400">{error.message}</p>}
    </div>
  );
}
