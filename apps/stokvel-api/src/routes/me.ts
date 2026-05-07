import { Hono } from 'hono';
import type { createAuthMiddleware } from '../middleware/auth.js';
import type { createStokvelRepository } from '../repository/stokvel.js';

export function createMeRouter(
  stokvelRepo: ReturnType<typeof createStokvelRepository>,
  authMiddleware: ReturnType<typeof createAuthMiddleware>,
) {
  const router = new Hono();

  router.get('/me', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const sessionKey = c.get('sessionKey');

    const member = await stokvelRepo.findMemberById(userId);
    if (!member) return c.json({ error: 'not_found' }, 404);

    // SECURITY: Cache-Control prevents proxies/bfcache caching the AES key
    c.header('Cache-Control', 'no-store, private');
    c.header('Pragma', 'no-cache');

    return c.json({ member, sessionKey });
  });

  return router;
}
