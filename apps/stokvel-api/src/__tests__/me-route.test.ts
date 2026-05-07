import { beforeEach, describe, expect, it } from 'bun:test';
import { eq, schema } from '@seyva/db';
import { Hono } from 'hono';
import { computeUaFingerprint, createAuthMiddleware } from '../middleware/auth.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { createSessionRepository } from '../repository/session.js';
import { createStokvelRepository } from '../repository/stokvel.js';
import { createMeRouter } from '../routes/me.js';
import { getTestDb, resetAndSeed } from './_db.js';

const REAL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MEMBER_ID = '10000000-0000-0000-0000-000000000001';
const ORPHAN_USER_ID = '99999999-9999-9999-9999-999999999999';

describe('GET /api/me', () => {
  let db: Awaited<ReturnType<typeof getTestDb>>;
  let app: Hono;
  let sessionRepo: ReturnType<typeof createSessionRepository>;

  beforeEach(async () => {
    db = await getTestDb();
    await resetAndSeed(db);

    sessionRepo = createSessionRepository(db.db);
    const stokvelRepo = createStokvelRepository(db.db);
    const authMiddleware = createAuthMiddleware(sessionRepo);

    app = new Hono();
    app.use('*', requestIdMiddleware);
    app.route('/api', createMeRouter(stokvelRepo, sessionRepo, authMiddleware));
  });

  it('returns 200 with member + sessionKey on a valid session', async () => {
    const sid = 'sid-me-valid';
    const fingerprint = await computeUaFingerprint(REAL_UA);
    await sessionRepo.create(sid, {
      userId: MEMBER_ID,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      uaFingerprint: fingerprint,
      sessionKey: 'rehydrate-me',
    });

    const res = await app.request('/api/me', {
      headers: { 'User-Agent': REAL_UA, Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.member.id).toBe(MEMBER_ID);
    expect(body.sessionKey).toBe('rehydrate-me');
  });

  it('returns 401 + destroys session when the session points at a deleted user', async () => {
    // SECURITY: a 404 here would let an attacker tell "session valid but
    // user purged" from "session invalid". We collapse the two into the
    // same 401 + cookie clear + session destroy.
    const sid = 'sid-me-orphan';
    const fingerprint = await computeUaFingerprint(REAL_UA);
    await sessionRepo.create(sid, {
      userId: ORPHAN_USER_ID,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      uaFingerprint: fingerprint,
      sessionKey: 'sk',
    });

    const res = await app.request('/api/me', {
      headers: { 'User-Agent': REAL_UA, Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });

    const remaining = await db.db.select().from(schema.sessions).where(eq(schema.sessions.id, sid));
    expect(remaining.length).toBe(0);
  });
});
