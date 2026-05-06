import { createFileRoute } from '@tanstack/react-router';
import { useCopy } from '../../copy/index.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';
import { DashboardView } from '../../features/dashboard/DashboardView.js';
import { RouteErrorPanel } from '../../layout/RouteErrorPanel.js';
import { DEMO_STOKVEL_ID } from '../../lib/demo.js';

export const Route = createFileRoute('/_authed/dashboard')({
  pendingComponent: DashboardSkeleton,
  errorComponent: DashboardErrorComponent,
  component: DashboardPage,
});

function DashboardPage() {
  return <DashboardView stokvelId={DEMO_STOKVEL_ID} />;
}

function DashboardErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const copy = useCopy();
  return (
    <RouteErrorPanel
      message={copy.errors.dashboardLoadFailed}
      detail={error instanceof Error ? error.message : undefined}
      onRetry={reset}
    />
  );
}
