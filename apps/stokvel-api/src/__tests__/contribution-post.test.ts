import { beforeEach, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { computeUaFingerprint, createAuthMiddleware } from '../middleware/auth.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { createSessionRepository } from '../repository/session.js';
import { createStokvelRepository } from '../repository/stokvel.js';
import { createStokvelRouter } from '../routes/stokvel.js';
import { createStore } from '../store/seed.js';
import type { Store } from '../store/types.js';

const TEST_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const STOKVEL_ID = '00000000-0000-0000-0000-000000000001';
const MEMBER_ID = '10000000-0000-0000-0000-000000000001';
const SESSION_ID = 'test-session-id';

async function buildApp(store: Store) {
  const sessionRepo = createSessionRepository(store);
  const stokvelRepo = createStokvelRepository(store);
  const authMiddleware = createAuthMiddleware(sessionRepo);

  const fingerprint = await computeUaFingerprint(TEST_UA);

  sessionRepo.create(SESSION_ID, {
    userId: MEMBER_ID,
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    uaFingerprint: fingerprint,
    sessionKey: 'test-session-key',
  });

  const app = new Hono();
  app.use('*', requestIdMiddleware);
  app.route('/api/stokvel', createStokvelRouter(stokvelRepo, authMiddleware));

  return app;
}

describe('POST /api/stokvel/:stokvelId/contributions', () => {
  let store: Store;
  let app: Hono;

  beforeEach(async () => {
    store = createStore();
    app = await buildApp(store);
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

  it('persists the new contribution in the store', async () => {
    const before = store.contributions.size;

    await app.request(`/api/stokvel/${STOKVEL_ID}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sid=${SESSION_ID}`,
        'User-Agent': TEST_UA,
      },
      body: JSON.stringify({ memberId: MEMBER_ID, amount: 75000, month: '2025-06' }),
    });

    expect(store.contributions.size).toBe(before + 1);
  });
});
