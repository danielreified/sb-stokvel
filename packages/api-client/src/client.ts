import type { MeResponse } from '@seyva/types';
import { createAuthEndpoints } from './endpoints/auth.js';
import { createStokvelEndpoints } from './endpoints/stokvel.js';
import { createVersionEndpoints } from './endpoints/version.js';
import { ApiClientError, UnauthorizedError } from './errors.js';
import type { ApiClientOptions, RequestFn } from './types.js';

export interface ApiClient {
  auth: ReturnType<typeof createAuthEndpoints>;
  stokvel: ReturnType<typeof createStokvelEndpoints>;
  version: ReturnType<typeof createVersionEndpoints>;
  me: () => Promise<MeResponse>;
}

function extractVersionHeaders(
  headers: Headers,
): { minVersion?: string; latestVersion?: string } | null {
  const minVersion = headers.get('x-min-client-version') ?? undefined;
  const latestVersion = headers.get('x-latest-client-version') ?? undefined;
  if (!minVersion && !latestVersion) return null;
  return { minVersion, latestVersion };
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const { baseUrl = '', onUnauthorized, onVersionHeaders, onRequestId } = options;

  const request: RequestFn = async <T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> => {
    const url = `${baseUrl}${path}`;
    const init: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      // Required for cross-subdomain cookie auth (PWA at dev.seyva.* calling
      // api.dev.seyva.*). Same-origin requests are unaffected — the browser
      // sends cookies on those by default.
      credentials: 'include',
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    const requestId = response.headers.get('x-request-id') ?? undefined;
    if (requestId && onRequestId) onRequestId(requestId);

    const versionHeaders = extractVersionHeaders(response.headers);
    if (versionHeaders && onVersionHeaders) {
      onVersionHeaders(versionHeaders);
    }

    if (response.status === 401) {
      onUnauthorized?.();
      throw new UnauthorizedError(requestId);
    }

    if (!response.ok) {
      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = { error: response.statusText };
      }
      throw new ApiClientError(response.status, responseBody, requestId);
    }

    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  };

  return {
    auth: createAuthEndpoints(request),
    stokvel: createStokvelEndpoints(request),
    version: createVersionEndpoints(request),
    me: (): Promise<MeResponse> => request('GET', '/api/me'),
  };
}
