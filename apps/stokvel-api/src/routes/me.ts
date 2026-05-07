import { Hono } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { logger } from '../lib/logger.js';
import type { createAuthMiddleware } from '../middleware/auth.js';
import type { createSessionRepository } from '../repository/session.js';
import type { createStokvelRepository } from '../repository/stokvel.js';

export function createMeRouter(
  stokvelRepo: ReturnType<typeof createStokvelRepository>,
  sessionRepo: ReturnType<typeof createSessionRepository>,
  authMiddleware: ReturnType<typeof createAuthMiddleware>,
) {
  const router = new Hono();

  router.get('/me', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const sessionId = c.get('sessionId');
    const sessionKey = c.get('sessionKey');

    const member = await stokvelRepo.findMemberById(userId);
    if (!member) {
      // SECURITY: a valid session pointing at a non-existent user is
      // observable as "session-valid-but-purged" if we 404 here. Destroy
      // the session and return 401 with the same shape as the standard
      // unauthorized path so the two cases are indistinguishable.
      await sessionRepo.delete(sessionId);
      deleteCookie(c, 'sid', { path: '/' });
      logger.warn('me_user_not_found', { userId, sessionId });
      return c.json({ error: 'unauthorized' }, 401);
    }

    // SECURITY: Cache-Control prevents proxies/bfcache caching the AES key
    c.header('Cache-Control', 'no-store, private');
    c.header('Pragma', 'no-cache');

    return c.json({ member, sessionKey });
  });

  return router;
}
