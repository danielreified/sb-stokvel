import type { LoginResponse } from '@seyva/types';
import type { LoginInput } from '@seyva/validation';
import type { RequestFn } from '../types.js';

export function createAuthEndpoints(request: RequestFn) {
  return {
    login: (credentials: LoginInput): Promise<LoginResponse> =>
      request('POST', '/api/auth/login', credentials),

    logout: (): Promise<void> => request('POST', '/api/auth/logout'),
  };
}
