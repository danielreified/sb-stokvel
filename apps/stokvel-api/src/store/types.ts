import type { BalanceSummary, Contribution, Member, Stokvel, StokvelId } from '@seyva/types';

export interface SessionRecord {
  userId: string;
  createdAt: number;
  lastSeenAt: number;
  /** sha256(osFamily + browserEngineName + browserEngineMajorVersion) */
  uaFingerprint: string;
  /** Base64-encoded per-session AES-256 key. In-memory only. */
  sessionKey: string;
}

export interface Store {
  stokvels: Map<StokvelId, Stokvel>;
  members: Map<string, Member>;
  contributions: Map<string, Contribution>;
  balances: Map<StokvelId, BalanceSummary>;
  sessions: Map<string, SessionRecord>;
}
