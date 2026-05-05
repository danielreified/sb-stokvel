import { createApiClient } from '@seyva/api-client';
import { setLastRequestId } from './logger.js';

export const api = createApiClient({
  onUnauthorized: () => {
    // Lazy import avoids circular: api → sign-out → api
    import('../features/auth/sign-out.js').then(({ signOut }) => signOut());
  },
  onVersionHeaders: (headers) => {
    import('./version-guard/store.js').then(({ versionGuardStore }) => {
      versionGuardStore.handleVersionHeaders(headers);
    });
  },
});

// Capture the last request-id from every response for error correlation in client logs
const _originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const response = await _originalFetch(...args);
  const requestId = response.headers.get('x-request-id');
  if (requestId) setLastRequestId(requestId);
  return response;
};
