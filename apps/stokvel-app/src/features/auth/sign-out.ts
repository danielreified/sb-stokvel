import { api } from '../../lib/api.js';
import { keyStore } from '../../lib/crypto/key-store.js';
import { logger } from '../../lib/logger.js';
import { queryClient } from '../../lib/query-client.js';

/**
 * Canonical logout sequence. Order matters — see CLAUDE.md persistence + logout flow.
 * 1. BFF clears session record + cookie.
 * 2. In-memory AES key cleared.
 * 3. React Query cache cleared.
 * 4. IndexedDB database dropped (not just the key — drops the whole DB).
 * 5. Hard reload to /login (restarts SW cleanly).
 *
 * Do NOT wipe Workbox caches here — the SW precache needs to survive so /login
 * loads on a flaky connection. Only forceUpdate() clears all caches.
 */
export async function signOut(): Promise<void> {
  try {
    await api.auth.logout();
  } catch {
    // Proceed with local cleanup even if BFF is unreachable
    logger.warn('signout_logout_failed');
  }

  keyStore.clearKey();
  queryClient.clear();

  try {
    await indexedDB.deleteDatabase('keyval-store');
  } catch {
    logger.warn('signout_idb_delete_failed');
  }

  window.location.href = '/login';
}
