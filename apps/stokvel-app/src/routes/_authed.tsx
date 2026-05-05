import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ForcedUpdateGate } from '../components/ForcedUpdateGate.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { RecommendedUpdateBanner } from '../components/RecommendedUpdateBanner.js';

/**
 * Layout route wrapping all authenticated pages.
 * Redirects to /login if context.auth is not populated.
 * Wraps children in ForcedUpdateGate (version kill-switch + max-staleness guardrail).
 * Suspense boundaries are per-child route (see each feature route's pendingComponent).
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname + location.searchStr },
      });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <ForcedUpdateGate>
      <RecommendedUpdateBanner />
      <OfflineBanner />
      <Outlet />
    </ForcedUpdateGate>
  );
}
