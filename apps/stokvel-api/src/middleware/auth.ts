import { getCookie } from 'hono/cookie';
import { createFactory } from 'hono/factory';
import { UAParser } from 'ua-parser-js';
import { logger } from '../lib/logger.js';
import type { createSessionRepository } from '../repository/session.js';

declare module 'hono' {
  interface ContextVariableMap {
    sessionId: string;
    userId: string;
    sessionKey: string;
  }
}

/** sha256 of stable UA subset — resistant to Chrome auto-updates mid-session. */
export async function computeUaFingerprint(userAgent: string): Promise<string> {
  const ua = new UAParser(userAgent).getResult();
  const stable = `${ua.os.name ?? ''}|${ua.engine.name ?? ''}|${ua.engine.version?.split('.')[0] ?? ''}`;
  const encoded = new TextEncoder().encode(stable);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const factory = createFactory();

export function createAuthMiddleware(sessionRepo: ReturnType<typeof createSessionRepository>) {
  return factory.createMiddleware(async (c, next) => {
    const sessionId = getCookie(c, 'sid');
    if (!sessionId) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const session = await sessionRepo.find(sessionId);
    if (!session) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const incomingFingerprint = await computeUaFingerprint(c.req.header('user-agent') ?? '');
    const check = sessionRepo.isValid(session, incomingFingerprint);
    if (!check.valid) {
      await sessionRepo.delete(sessionId);
      logger.info('session_invalidated', { requestId: c.get('requestId'), reason: check.reason });
      return c.json({ error: 'unauthorized' }, 401);
    }

    await sessionRepo.touch(sessionId);
    c.set('sessionId', sessionId);
    c.set('userId', session.userId);
    c.set('sessionKey', session.sessionKey);

    await next();
  });
}
