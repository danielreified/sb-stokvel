import { createApiClient } from '@seyva/api-client';
import { setLastRequestId } from './logger.js';

/**
 * Singleton API client.
 * onUnauthorized is wired at bootstrap in main.tsx once the router is available.
 * onVersionHeaders is wired to the version-guard store.
 */
export const api = createApiClient({
  onVersionHeaders: (headers) => {
    // Lazy import to avoid circular deps between api + version-guard store
    import('./version-guard/store.js').then(({ versionGuardStore }) => {
      versionGuardStore.handleVersionHeaders(headers);
    });
  },
});

/** Capture the last request-id for error correlation in client logs. */
const _originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const response = await _originalFetch(...args);
  const requestId = response.headers.get('x-request-id');
  if (requestId) setLastRequestId(requestId);
  return response;
};
