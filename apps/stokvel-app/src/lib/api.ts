import { createApiClient } from '@seyva/api-client';
import { setLastRequestId } from './logger.js';

export const api = createApiClient({
  onUnauthorized: () => {
    // Only trigger signOut when a previously-authenticated session expires.
    // If we're already on /login, a 401 is expected — don't loop.
    if (window.location.pathname === '/login') return;
    import('../features/auth/sign-out.js').then(({ signOut }) => signOut());
  },
  onVersionHeaders: (headers) => {
    import('./version-guard/store.js').then(({ versionGuardStore }) => {
      versionGuardStore.handleVersionHeaders(headers);
    });
  },
  // Capture the last request-id for error correlation in client logs.
  // Avoids monkey-patching globalThis.fetch — the api-client invokes the
  // callback after every response, including non-2xx.
  onRequestId: setLastRequestId,
});
