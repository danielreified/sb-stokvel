import type { Member, UpdateLevel } from './domain.js';

export interface LoginResponse {
  member: Member;
  /** Base64-encoded AES-256 session key. In-memory only — never persist. */
  sessionKey: string;
}

export interface MeResponse {
  member: Member;
  /** Re-delivered on session resume so the in-memory key can be restored after a page refresh. */
  sessionKey: string;
}

export interface VersionCheckResponse {
  clientVersion: string;
  minVersion: string;
  latestVersion: string;
  updateLevel: UpdateLevel;
  message?: string;
  serverTime: string;
}

export interface ApiErrorBody {
  error: string;
}

export interface HealthResponse {
  status: 'ok';
  version: string;
  uptimeSeconds: number;
}
