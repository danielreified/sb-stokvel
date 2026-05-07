import { createApiClient } from '@seyva/api-client';
import { setLastRequestId } from './logger.js';

// In dev, baseUrl is '' so requests go to the Vite proxy → BFF on localhost.
// In prod the build is invoked with VITE_API_BASE_URL set to the deployed API
// origin (e.g. https://api.dev.seyva.daniellourie.me) and Vite freezes that
// value into the bundle. Cross-subdomain credentialed CORS works because the
// API GW config + Hono dev CORS already allow the viewer origin.
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export const api = createApiClient({
  baseUrl,
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
