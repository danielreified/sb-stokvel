import { LoginSchema } from '@seyva/validation';
import { Hono } from 'hono';
import { logger } from '../lib/logger.js';
import { computeUaFingerprint } from '../middleware/auth.js';
import { loginRateLimitMiddleware } from '../middleware/rate-limit.js';
import type { createSessionRepository } from '../repository/session.js';
import type { createStokvelRepository } from '../repository/stokvel.js';

/** DEMO: hardcoded credentials. Replace with real auth in production. */
export const DEMO_PHONE = '+27821000001';
export const DEMO_PIN = '1234';

const CONSTANT_RESPONSE_MS = 250;

/**
 * The Secure cookie flag is HTTPS-only — WebKit (Safari) refuses to store
 * Secure cookies on http://localhost, breaking the dev/test flow. Emit
 * `Secure` only when the request itself was HTTPS so prod still gets it.
 */
function secureFlag(url: string): string {
  return new URL(url).protocol === 'https:' ? ' Secure;' : '';
}

/** Pad response time to ~250ms to prevent timing-based user enumeration. */
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

      c.header(
        'Set-Cookie',
        `sid=${sessionId}; HttpOnly;${secureFlag(c.req.url)} SameSite=Lax; Path=/; Max-Age=43200`,
      );
      // SECURITY: Cache-Control prevents proxies/bfcache caching the AES key
      c.header('Cache-Control', 'no-store, private');
      c.header('Pragma', 'no-cache');

      return c.json({ member, sessionKey });
    });
  });

  router.post('/logout', async (c) => {
    const cookieHeader = c.req.header('cookie') ?? '';
    const sessionId = cookieHeader
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('sid='))
      ?.slice(4);

    if (sessionId) await sessionRepo.delete(sessionId);

    c.header(
      'Set-Cookie',
      `sid=; HttpOnly;${secureFlag(c.req.url)} SameSite=Lax; Path=/; Max-Age=0`,
    );
    return c.body(null, 204);
  });

  return router;
}
