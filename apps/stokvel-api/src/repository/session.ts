import type { SessionRecord, Store } from '../store/types.js';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

export function createSessionRepository(store: Store) {
  return {
    create: (sessionId: string, record: SessionRecord): void => {
      store.sessions.set(sessionId, record);
    },

    find: (sessionId: string): SessionRecord | undefined => store.sessions.get(sessionId),

    touch: (sessionId: string): void => {
      const session = store.sessions.get(sessionId);
      if (session) session.lastSeenAt = Date.now();
    },

    delete: (sessionId: string): void => {
      store.sessions.delete(sessionId);
    },

    isValid: (
      session: SessionRecord,
      incomingFingerprint: string,
    ): { valid: true } | { valid: false; reason: string } => {
      const now = Date.now();
      if (now - session.lastSeenAt > IDLE_TIMEOUT_MS)
        return { valid: false, reason: 'idle_timeout' };
      if (now - session.createdAt > ABSOLUTE_TIMEOUT_MS)
        return { valid: false, reason: 'absolute_timeout' };
      if (session.uaFingerprint !== incomingFingerprint)
        return { valid: false, reason: 'ua_mismatch' };
      return { valid: true };
    },
  };
}
