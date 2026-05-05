import type { MiddlewareHandler } from 'hono';
import { logger } from '../lib/logger.js';

interface Bucket {
  count: number;
  windowStart: number;
}

function createBucket(windowMs: number, maxAttempts: number) {
  const buckets = new Map<string, Bucket>();

  return {
    isAllowed: (key: string): boolean => {
      const now = Date.now();
      let bucket = buckets.get(key);
      if (!bucket || now - bucket.windowStart > windowMs) {
        bucket = { count: 0, windowStart: now };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      return bucket.count <= maxAttempts;
    },
    retryAfterSeconds: (key: string): number => {
      const bucket = buckets.get(key);
      if (!bucket) return 0;
      return Math.ceil((bucket.windowStart + 15 * 60 * 1000 - Date.now()) / 1000);
    },
  };
}

/** Layered rate limiter for POST /api/auth/login. See CLAUDE.md for bucket rationale. */
const perPhoneBucket = createBucket(15 * 60 * 1000, 5);
const perIpBucket = createBucket(15 * 60 * 1000, 200);

export const loginRateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.get('requestId');
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const phone = typeof body.phone === 'string' ? body.phone : 'unknown';

  // Re-inject body since we consumed the stream
  c.req.raw = new Request(c.req.url, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: JSON.stringify(body),
  });

  const clientIp = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!perPhoneBucket.isAllowed(phone)) {
    const retryAfter = perPhoneBucket.retryAfterSeconds(phone);
    logger.warn('rate_limit_per_phone', { requestId, phone });
    c.res = new Response(JSON.stringify({ error: 'invalid_credentials' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    });
    return;
  }

  if (!perIpBucket.isAllowed(clientIp)) {
    logger.warn('rate_limit_per_ip', { requestId });
    // SECURITY: constant-time, identical-shape — do not differentiate
    c.res = new Response(JSON.stringify({ error: 'invalid_credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
    return;
  }

  await next();
};
