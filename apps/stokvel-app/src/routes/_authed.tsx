import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ForcedUpdateGate } from '../components/ForcedUpdateGate.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { RecommendedUpdateBanner } from '../components/RecommendedUpdateBanner.js';
import { meQueryOptions } from '../features/auth/queries.js';
import { signOut } from '../features/auth/sign-out.js';
import { AppWindow } from '../layout/AppWindow.js';
import { MarketingShell } from '../layout/MarketingShell.js';
import { PinLockScreen } from '../layout/PinLockScreen.js';
import { keyStore } from '../lib/crypto/key-store.js';
import { unwrapSessionKey } from '../lib/crypto/pin-wrap.js';
import { wrappedKeyStore } from '../lib/crypto/wrapped-key-store.js';
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

  // When the lock engages, zero out the in-memory AES key. The wrapped blob
  // stays in IDB; PIN unwraps it on unlock.
  useEffect(() => {
    if (isLocked) keyStore.clearKey();
  }, [isLocked]);

  // Verify offline by unwrapping the IDB-stored blob with the entered PIN.
  // No BFF call required — works without a network.
  const handleVerify = async (pin: string) => {
    const blob = await wrappedKeyStore.load();
    if (!blob) return false;
    const sessionKeyBytes = await unwrapSessionKey(pin, blob);
    if (!sessionKeyBytes) return false;
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      sessionKeyBytes as BufferSource,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
    keyStore.setKey(cryptoKey);
    unlock();
    return true;
  };

  return (
    <ForcedUpdateGate>
      <RecommendedUpdateBanner />
      <MarketingShell>
        <AppWindow member={member}>
          <OfflineBanner />
          <Outlet />
          {isLocked && member && (
            <PinLockScreen
              name={member.name.split(' ')[0] ?? member.name}
              onVerify={handleVerify}
              onSignOut={() => void signOut()}
            />
          )}
        </AppWindow>
      </MarketingShell>
    </ForcedUpdateGate>
  );
}
