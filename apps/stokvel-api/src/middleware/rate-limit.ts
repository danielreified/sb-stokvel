import type { MiddlewareHandler } from 'hono';
import { logger } from '../lib/logger.js';

interface Bucket {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 15 * 60 * 1000;

function createBucket(windowMs: number, maxAttempts: number) {
  const buckets = new Map<string, Bucket>();

  const tick = (key: string): Bucket => {
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart > windowMs) {
      bucket = { count: 0, windowStart: now };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  return {
    /** True if the bucket has remaining capacity. Read-only — does NOT count this attempt. */
    canAttempt: (key: string): boolean => {
      const bucket = tick(key);
      return bucket.count < maxAttempts;
    },
    /** Record a failed attempt. Only failures count toward the bucket. */
    recordFailure: (key: string): void => {
      tick(key).count += 1;
    },
    retryAfterSeconds: (key: string): number => {
      const bucket = buckets.get(key);
      if (!bucket) return 0;
      return Math.ceil((bucket.windowStart + windowMs - Date.now()) / 1000);
    },
  };
}

/** Layered rate limiter for POST /api/auth/login. See CLAUDE.md for bucket rationale. */
const perPhoneBucket = createBucket(WINDOW_MS, 5);
const perIpBucket = createBucket(WINDOW_MS, 200);

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

  // Pre-flight: refuse if either bucket is already saturated by past failures.
  if (!perPhoneBucket.canAttempt(phone)) {
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

  if (!perIpBucket.canAttempt(clientIp)) {
    logger.warn('rate_limit_per_ip', { requestId });
    // SECURITY: constant-time, identical-shape — do not differentiate
    c.res = new Response(JSON.stringify({ error: 'invalid_credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
    return;
  }

  await next();

  // Post-flight: only failed logins (401 from the handler) count toward the
  // buckets. Successful logins must not consume the user's failure budget.
  if (c.res.status === 401) {
    perPhoneBucket.recordFailure(phone);
    perIpBucket.recordFailure(clientIp);
  }
};
