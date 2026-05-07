import { beforeEach, describe, expect, it } from 'bun:test';
import { eq, schema } from '@seyva/db';
import { Hono } from 'hono';
import { computeUaFingerprint } from '../middleware/auth.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { createSessionRepository } from '../repository/session.js';
import { createStokvelRepository } from '../repository/stokvel.js';
import { createAuthRouter } from '../routes/auth.js';
import { getTestDb, resetAndSeed } from './_db.js';

const REAL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MEMBER_ID = '10000000-0000-0000-0000-000000000001';

describe('POST /api/auth/logout', () => {
  let db: Awaited<ReturnType<typeof getTestDb>>;
  let app: Hono;
  let sessionRepo: ReturnType<typeof createSessionRepository>;

  beforeEach(async () => {
    db = await getTestDb();
    await resetAndSeed(db);

    sessionRepo = createSessionRepository(db.db);
    const stokvelRepo = createStokvelRepository(db.db);

    app = new Hono();
    app.use('*', requestIdMiddleware);
    app.route('/api/auth', createAuthRouter(stokvelRepo, sessionRepo));
  });

  it('returns 204, clears the cookie, and deletes the session row', async () => {
    const sid = 'sid-logout-target';
    const fingerprint = await computeUaFingerprint(REAL_UA);
    await sessionRepo.create(sid, {
      userId: MEMBER_ID,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      uaFingerprint: fingerprint,
      sessionKey: 'sk',
    });

    const res = await app.request('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(204);
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('sid=;');
    expect(setCookie).toMatch(/Max-Age=0/i);

    const remaining = await db.db.select().from(schema.sessions).where(eq(schema.sessions.id, sid));
    expect(remaining.length).toBe(0);
  });

  it('is idempotent — returns 204 even with no cookie', async () => {
    const res = await app.request('/api/auth/logout', { method: 'POST' });
    expect(res.status).toBe(204);
  });
});
