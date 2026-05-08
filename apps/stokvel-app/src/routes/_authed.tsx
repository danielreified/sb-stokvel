import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useEffect, useState, useSyncExternalStore } from 'react';
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
import { idbCache } from '../lib/persist/idb-cache.js';
import { useIdleLock } from '../lib/use-idle-lock.js';
import { useStandaloneDisplay } from '../lib/use-standalone-display.js';

const IDLE_LOCK_MS = 60_000;
const EVICTION_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Layout route wrapping all authenticated pages.
 *
 * Boot-time gating priority:
 *   1. /api/me succeeds → key restored from response, app proceeds.
 *   2. /api/me fails AND a wrapped session-key blob exists in IDB →
 *      let the route mount; the component shows PinLockScreen for offline
 *      unlock. This is the cold-start path that closes the prior gap
 *      where every refresh while offline kicked the user to /login.
 *   3. /api/me fails AND no wrapped blob → user has no recoverable
 *      session, redirect to /login.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions).catch(() => null);
    if (me?.member) return;

    // /api/me failed (offline, expired session, etc.). If we have a
    // wrapped key, the user can unlock locally; the component handles it.
    const wrapped = await wrappedKeyStore.load();
    if (wrapped) return;

    throw redirect({
      to: '/login',
      search: { redirect: location.pathname + location.searchStr },
    });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  // hasKey is the source of truth for "is the app unlocked." Subscribed to
  // keyStore so login/PIN-unlock/idle-clear all flip the lock UI naturally.
  const hasKey = useSyncExternalStore(keyStore.subscribe, keyStore.hasKey, keyStore.hasKey);

  // me may be null on offline cold-start (network unreachable); the cached
  // member info from idbCache will populate the sidebar after key restore.
  const { data } = useQuery(meQueryOptions);
  const member = data?.member ? { name: data.member.name, phone: data.member.phone } : null;

  // Idle timer only runs while we have a key — no point arming it when
  // we're already in the locked state.
  const { isLocked, unlock } = useIdleLock({
    thresholdMs: IDLE_LOCK_MS,
    enabled: hasKey,
  });

  // Clear the in-memory AES key on idle-lock fire. The keyStore subscription
  // re-renders the component, which then shows PinLockScreen via !hasKey.
  useEffect(() => {
    if (isLocked) keyStore.clearKey();
  }, [isLocked]);

  // Run eviction (TTL + LRU + cold-tail) once on key-restore, then hourly
  // while the tab stays unlocked. evict() is no-op-safe without a key, but
  // gating on hasKey avoids futile runs during the lock screen.
  useEffect(() => {
    if (!hasKey) return;
    void idbCache.evict();
    const interval = setInterval(() => {
      void idbCache.evict();
    }, EVICTION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasKey]);

  // Track whether a wrapped blob exists at all — without it, the lock screen
  // would prompt for a PIN that can't unwrap anything. Async-resolved on mount.
  const [wrappedBlobReady, setWrappedBlobReady] = useState<boolean | null>(null);
  useEffect(() => {
    void wrappedKeyStore.load().then((blob) => setWrappedBlobReady(!!blob));
  }, []);

  // Unlock path: unwrap the IDB blob with the entered PIN, restore the key
  // in memory. Pure client-side — no BFF roundtrip; works offline.
  const handleVerify = async (pin: string) => {
    const blob = await wrappedKeyStore.load();
    if (!blob) return false;
    const sessionKeyBytes = await unwrapSessionKey(pin, blob);
    if (!sessionKeyBytes) return false;
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      // reason: Uint8Array<ArrayBufferLike> isn't narrowed to BufferSource by
      // current TS lib.dom; runtime-compatible. Same workaround as in pin-wrap.ts.
      sessionKeyBytes as BufferSource,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
    keyStore.setKey(cryptoKey);
    unlock();
    return true;
  };

  // Lock UI shows whenever we don't have a key AND there's a blob to unwrap.
  // Until wrappedBlobReady is resolved we show nothing (avoids a flash of the
  // app shell before the lock decision is made).
  const showLock = !hasKey && wrappedBlobReady === true;

  const isStandalone = useStandaloneDisplay();

  // Bare AppWindow for installed PWA (no SB marketing chrome — feels
  // native); MarketingShell-wrapped on the web tab where the demo wants
  // to read like a Standard Bank product page.
  const shell = (
    <AppWindow member={member}>
      <OfflineBanner />
      <Outlet />
      {showLock && (
        <PinLockScreen
          name={member?.name.split(' ')[0] ?? 'there'}
          onVerify={handleVerify}
          onSignOut={() => void signOut()}
        />
      )}
    </AppWindow>
  );

  return (
    <ForcedUpdateGate>
      <RecommendedUpdateBanner />
      {isStandalone ? shell : <MarketingShell>{shell}</MarketingShell>}
    </ForcedUpdateGate>
  );
}
