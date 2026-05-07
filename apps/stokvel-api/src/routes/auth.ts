import { DEMO_PHONE, DEMO_PIN } from '@seyva/db/seed';
import { LoginSchema } from '@seyva/validation';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { logger } from '../lib/logger.js';
import { computeUaFingerprint } from '../middleware/auth.js';
import { loginRateLimitMiddleware } from '../middleware/rate-limit.js';
import type { createSessionRepository } from '../repository/session.js';
import type { createStokvelRepository } from '../repository/stokvel.js';

const CONSTANT_RESPONSE_MS = 250;
const SESSION_COOKIE_MAX_AGE = 43200;

/**
 * Pad failed-login responses to a constant time so an attacker can't tell
 * "wrong PIN" from "no such user" by timing alone. CLAUDE.md mandates
 * identical-shape, identical-time responses across every failure path.
 */
async function constantTime<T>(fn: () => Promise<T>): Promise<T> {
  const [result] = await Promise.all([
    fn(),
    new Promise<void>((resolve) => setTimeout(resolve, CONSTANT_RESPONSE_MS)),
  ]);
  return result;
}

function generateSessionKey(): string {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...raw));
}

/**
 * Cookie attribute set used by both login (set sid) and logout (clear sid).
 *
 * The `secure` flag is HTTPS-only — WebKit (Safari) refuses to store Secure
 * cookies on http://localhost, breaking the dev/test flow. We let `secure`
 * default to off and explicitly enable it when the request URL is HTTPS.
 */
function sessionCookieOptions(c: { req: { url: string } }) {
  return {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Lax' as const,
    path: '/',
  };
}

export function createAuthRouter(
  stokvelRepo: ReturnType<typeof createStokvelRepository>,
  sessionRepo: ReturnType<typeof createSessionRepository>,
) {
  const router = new Hono();

  router.post('/login', loginRateLimitMiddleware, async (c) => {
    const requestId = c.get('requestId');
    // SECURITY: never log this body — it contains phone + PIN
    return constantTime(async () => {
      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: 'invalid_credentials' }, 401);
      }

      const parsed = LoginSchema.safeParse(body);
      if (!parsed.success) {
        // SECURITY: constant-time, identical-shape — do not differentiate
        return c.json({ error: 'invalid_credentials' }, 401);
      }

      const { phone } = parsed.data;

      // DEMO: accepts any credentials — replace with real lookup in production
      if (phone !== DEMO_PHONE) {
        return c.json({ error: 'invalid_credentials' }, 401);
      }
      if (parsed.data.pin !== DEMO_PIN) {
        return c.json({ error: 'invalid_credentials' }, 401);
      }

      const member = await stokvelRepo.findMemberByPhone(phone);
      if (!member) {
        return c.json({ error: 'invalid_credentials' }, 401);
      }

      const sessionId = crypto.randomUUID();
      const sessionKey = generateSessionKey();
      const uaFingerprint = await computeUaFingerprint(c.req.header('user-agent') ?? '');

      await sessionRepo.create(sessionId, {
        userId: member.id,
        createdAt: Date.now(),
        lastSeenAt: Date.now(),
        uaFingerprint,
        sessionKey,
      });

      logger.info('login_success', { requestId, memberId: member.id });

      setCookie(c, 'sid', sessionId, {
        ...sessionCookieOptions(c),
        maxAge: SESSION_COOKIE_MAX_AGE,
      });
      // SECURITY: Cache-Control prevents proxies/bfcache caching the AES key
      c.header('Cache-Control', 'no-store, private');
      c.header('Pragma', 'no-cache');

      return c.json({ member, sessionKey });
    });
  });

  router.post('/logout', async (c) => {
    const sessionId = getCookie(c, 'sid');
    if (sessionId) await sessionRepo.delete(sessionId);

    deleteCookie(c, 'sid', sessionCookieOptions(c));
    return c.body(null, 204);
  });

  return router;
}
