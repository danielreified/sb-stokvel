import type { Db } from '@seyva/db';
import { eq, schema } from '@seyva/db';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

export interface SessionRecord {
  userId: string;
  createdAt: number;
  lastSeenAt: number;
  /** sha256(osFamily + browserEngineName + browserEngineMajorVersion) */
  uaFingerprint: string;
  /** Base64-encoded per-session AES-256 key. */
  sessionKey: string;
}

export function createSessionRepository(db: Db) {
  return {
    create: async (sessionId: string, record: SessionRecord): Promise<void> => {
      await db.insert(schema.sessions).values({
        id: sessionId,
        userId: record.userId,
        createdAt: record.createdAt,
        lastSeenAt: record.lastSeenAt,
        uaFingerprint: record.uaFingerprint,
        sessionKey: record.sessionKey,
      });
    },

    find: async (sessionId: string): Promise<SessionRecord | undefined> => {
      const [row] = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.id, sessionId));
      if (!row) return undefined;
      return {
        userId: row.userId,
        createdAt: row.createdAt,
        lastSeenAt: row.lastSeenAt,
        uaFingerprint: row.uaFingerprint,
        sessionKey: row.sessionKey,
      };
    },

    touch: async (sessionId: string): Promise<void> => {
      await db
        .update(schema.sessions)
        .set({ lastSeenAt: Date.now() })
        .where(eq(schema.sessions.id, sessionId));
    },

    delete: async (sessionId: string): Promise<void> => {
      await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
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
