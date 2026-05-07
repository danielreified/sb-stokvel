import { afterAll, beforeEach, describe, expect, it } from 'bun:test';
import { eq, schema } from '@seyva/db';
import { Hono } from 'hono';
import { computeUaFingerprint, createAuthMiddleware } from '../middleware/auth.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { createSessionRepository } from '../repository/session.js';
import { createStokvelRepository } from '../repository/stokvel.js';
import { createStokvelRouter } from '../routes/stokvel.js';
import { getTestDb, resetAndSeed } from './_db.js';

const TEST_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const STOKVEL_ID = '00000000-0000-0000-0000-000000000001';
const MEMBER_ID = '10000000-0000-0000-0000-000000000001';
const SESSION_ID = 'test-session-id-contributions';

describe('POST /api/stokvel/:stokvelId/contributions', () => {
  let app: Hono;
  let db: Awaited<ReturnType<typeof getTestDb>>;

  beforeEach(async () => {
    db = await getTestDb();
    await resetAndSeed(db);

    const sessionRepo = createSessionRepository(db.db);
    const stokvelRepo = createStokvelRepository(db.db);
    const authMiddleware = createAuthMiddleware(sessionRepo);

    const fingerprint = await computeUaFingerprint(TEST_UA);
    await sessionRepo.create(SESSION_ID, {
      userId: MEMBER_ID,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      uaFingerprint: fingerprint,
      sessionKey: 'test-session-key',
    });

    app = new Hono();
    app.use('*', requestIdMiddleware);
    app.route('/api/stokvel', createStokvelRouter(stokvelRepo, authMiddleware));
  });

  afterAll(async () => {
    await db.close();
  });

  it('creates a contribution and returns 201', async () => {
    const res = await app.request(`/api/stokvel/${STOKVEL_ID}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sid=${SESSION_ID}`,
        'User-Agent': TEST_UA,
      },
      body: JSON.stringify({ memberId: MEMBER_ID, amount: 50000, month: '2025-05' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe('pending');
    expect(body.amount).toBe(50000);
    expect(body.month).toBe('2025-05');
  });

  it('returns 422 for invalid body (negative amount)', async () => {
    const res = await app.request(`/api/stokvel/${STOKVEL_ID}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sid=${SESSION_ID}`,
        'User-Agent': TEST_UA,
      },
      body: JSON.stringify({ memberId: MEMBER_ID, amount: -1, month: '2025-05' }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe('validation_failed');
  });

  it('returns 422 for invalid month format', async () => {
    const res = await app.request(`/api/stokvel/${STOKVEL_ID}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sid=${SESSION_ID}`,
        'User-Agent': TEST_UA,
      },
      body: JSON.stringify({ memberId: MEMBER_ID, amount: 50000, month: '2025-13' }),
    });

    expect(res.status).toBe(422);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await app.request(`/api/stokvel/${STOKVEL_ID}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sid=${SESSION_ID}`,
        'User-Agent': TEST_UA,
      },
      body: 'not json',
    });

    expect(res.status).toBe(400);
  });

  it('returns 401 when no session cookie is provided', async () => {
    const res = await app.request(`/api/stokvel/${STOKVEL_ID}/contributions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': TEST_UA },
      body: JSON.stringify({ memberId: MEMBER_ID, amount: 50000, month: '2025-05' }),
    });

    expect(res.status).toBe(401);
  });

  it('persists the new contribution in the database', async () => {
    const before = await db.db
      .select()
      .from(schema.contributions)
      .where(eq(schema.contributions.stokvelId, STOKVEL_ID));

    await app.request(`/api/stokvel/${STOKVEL_ID}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sid=${SESSION_ID}`,
        'User-Agent': TEST_UA,
      },
      body: JSON.stringify({ memberId: MEMBER_ID, amount: 75000, month: '2025-06' }),
    });

    const after = await db.db
      .select()
      .from(schema.contributions)
      .where(eq(schema.contributions.stokvelId, STOKVEL_ID));
    expect(after.length).toBe(before.length + 1);
  });
});
