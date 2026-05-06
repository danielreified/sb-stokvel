import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ForcedUpdateGate } from '../components/ForcedUpdateGate.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { RecommendedUpdateBanner } from '../components/RecommendedUpdateBanner.js';
import { meQueryOptions } from '../features/auth/queries.js';
import { AppWindow } from '../layout/AppWindow.js';
import { MarketingShell } from '../layout/MarketingShell.js';

/**
 * Layout route wrapping all authenticated pages.
 * Awaits meQueryOptions so hard navigations (refresh, direct URL) wait for auth
 * before deciding whether to redirect — prevents the flash-redirect-to-login bug.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    // On hard navigation the me query hasn't resolved yet; ensureQueryData waits for it.
    // On soft navigation the cache is already populated — returns immediately.
    const me = await context.queryClient.ensureQueryData(meQueryOptions).catch(() => null);
    if (!me?.member) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname + location.searchStr },
      });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  // beforeLoad has already gated this — me is guaranteed populated here.
  // Read from the cache directly so we don't depend on RouterProvider's
  // context prop having flushed the latest auth state.
  const { data } = useQuery(meQueryOptions);
  const member = data?.member ? { name: data.member.name, phone: data.member.phone } : null;

  return (
    <ForcedUpdateGate>
      <RecommendedUpdateBanner />
      <MarketingShell>
        <AppWindow member={member}>
          <OfflineBanner />
          <Outlet />
        </AppWindow>
      </MarketingShell>
    </ForcedUpdateGate>
  );
}
