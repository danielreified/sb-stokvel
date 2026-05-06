import { createFileRoute } from '@tanstack/react-router';
import { useCopy } from '../../copy/index.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';
import { MembersView } from '../../features/members/MembersView.js';
import { RouteErrorPanel } from '../../layout/RouteErrorPanel.js';
import { DEMO_STOKVEL_ID } from '../../lib/demo.js';

export const Route = createFileRoute('/_authed/members')({
  pendingComponent: DashboardSkeleton,
  errorComponent: MembersErrorComponent,
  component: MembersPage,
});

function MembersPage() {
  return <MembersView stokvelId={DEMO_STOKVEL_ID} />;
}

function MembersErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const copy = useCopy();
  return (
    <RouteErrorPanel
      message={copy.errors.membersLoadFailed}
      detail={error instanceof Error ? error.message : undefined}
      onRetry={reset}
    />
  );
}
