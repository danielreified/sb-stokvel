import type { VersionCheckResponse } from '@seyva/types';
import type { RequestFn } from '../types.js';

export function createVersionEndpoints(request: RequestFn) {
  return {
    check: (clientVersion: string): Promise<VersionCheckResponse> =>
      request('GET', `/api/app/version-check?version=${encodeURIComponent(clientVersion)}`),
  };
}
