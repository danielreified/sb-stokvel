import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ForcedUpdateGate } from '../components/ForcedUpdateGate.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { RecommendedUpdateBanner } from '../components/RecommendedUpdateBanner.js';
import { meQueryOptions } from '../features/auth/queries.js';
import { signOut } from '../features/auth/sign-out.js';
import { AppWindow } from '../layout/AppWindow.js';
import { MarketingShell } from '../layout/MarketingShell.js';
import { PinLockScreen } from '../layout/PinLockScreen.js';
import { api } from '../lib/api.js';
import { useIdleLock } from '../lib/use-idle-lock.js';

const IDLE_LOCK_MS = 60_000;

/**
 * Layout route wrapping all authenticated pages.
 * Awaits meQueryOptions so hard navigations (refresh, direct URL) wait for auth
 * before deciding whether to redirect — prevents the flash-redirect-to-login bug.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
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
  const { data } = useQuery(meQueryOptions);
  const member = data?.member ? { name: data.member.name, phone: data.member.phone } : null;

  const { isLocked, unlock } = useIdleLock({
    thresholdMs: IDLE_LOCK_MS,
    enabled: member !== null,
  });

  const handleVerify = async (pin: string) => {
    if (!data?.member) return false;
    try {
      await api.auth.login({ phone: data.member.phone, pin });
      unlock();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ForcedUpdateGate>
      <RecommendedUpdateBanner />
      <MarketingShell>
        <AppWindow member={member}>
          <OfflineBanner />
          {isLocked && member ? (
            <PinLockScreen
              name={member.name.split(' ')[0] ?? member.name}
              onVerify={handleVerify}
              onSignOut={() => void signOut()}
            />
          ) : (
            <Outlet />
          )}
        </AppWindow>
      </MarketingShell>
    </ForcedUpdateGate>
  );
}
