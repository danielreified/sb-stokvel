import { useSyncExternalStore } from 'react';

/**
 * Subscribe to the browser's online/offline events and return the current
 * `navigator.onLine` value as React state.
 *
 * Single source of truth: both the OfflineBanner and the header status
 * pill read from this so the two never disagree (the pill used to be
 * hardcoded green which contradicted the banner when actually offline).
 */

function subscribe(cb: () => void): () => void {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

function getSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// SSR / no-window guard — assume online so the markup matches the most
// common first-paint case. Hydration corrects it on mount.
function getServerSnapshot(): boolean {
  return true;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
