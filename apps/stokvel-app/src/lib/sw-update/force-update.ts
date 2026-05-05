import { logger } from '../logger.js';

/**
 * Force an update to the latest service worker.
 * Clears ALL caches including the Workbox precache — user must be online to re-download the shell.
 * This differs from signOut() which preserves the precache so /login loads offline.
 * See CLAUDE.md → forceUpdate() vs signOut() asymmetry.
 */
export async function forceUpdate(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const reg of registrations) {
    try {
      // Ask the waiting SW to skip waiting and activate
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
      }
    } catch {
      // Fall through to nuclear path
    }
  }

  // Nuclear path: unregister all SWs and clear all caches
  await Promise.allSettled(registrations.map((reg) => reg.unregister()));

  const cacheKeys = await caches.keys();
  await Promise.allSettled(cacheKeys.map((key) => caches.delete(key)));

  logger.info('force_update_triggered');
  window.location.reload();
}
