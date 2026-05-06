import { toStokvelId } from '@seyva/types';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { copy } from '../../copy/index.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';
import { MembersView } from '../../features/members/MembersView.js';
import { RouteErrorPanel } from '../../layout/RouteErrorPanel.js';

const DEMO_STOKVEL_ID = toStokvelId('00000000-0000-0000-0000-000000000001');

export const Route = createFileRoute('/_authed/members')({
  pendingComponent: DashboardSkeleton,
  errorComponent: MembersErrorComponent,
  component: MembersPage,
});

function MembersPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <MembersView stokvelId={DEMO_STOKVEL_ID} />
    </Suspense>
  );
}

function MembersErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  return (
    <RouteErrorPanel
      message={copy.errors.membersLoadFailed}
      detail={error instanceof Error ? error.message : undefined}
      onRetry={reset}
    />
  );
}
