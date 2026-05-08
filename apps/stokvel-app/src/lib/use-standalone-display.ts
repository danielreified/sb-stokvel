import { useSyncExternalStore } from 'react';

/**
 * True when the app is running as an installed PWA (homescreen icon on
 * iOS/Android, dedicated standalone window in Chrome). False in a regular
 * browser tab.
 *
 * Used to swap between the Standard Bank marketing chrome (browser tab —
 * we want the demo to look like a bank product page) and the bare app
 * shell (installed PWA — feels native, no browser-like decorations).
 *
 * Two detection paths because Safari hasn't shipped the standard media
 * query in installed-PWA mode yet:
 *   - matchMedia('(display-mode: standalone)') — Chromium, Firefox
 *   - navigator.standalone — iOS Safari add-to-homescreen
 */

const QUERY = '(display-mode: standalone)';

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia(QUERY).matches) return true;
  // reason: Navigator.standalone is a non-standard iOS Safari API not in
  // lib.dom; presence of the property is the only signal we have.
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function subscribe(cb: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function getServerSnapshot(): boolean {
  return false;
}

export function useStandaloneDisplay(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
