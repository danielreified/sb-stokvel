import { beforeEach, describe, expect, it } from 'bun:test';
import { DEMO_PHONE, DEMO_PIN } from '@seyva/db/seed';
import { Hono } from 'hono';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { createSessionRepository } from '../repository/session.js';
import { createStokvelRepository } from '../repository/stokvel.js';
import { createAuthRouter } from '../routes/auth.js';
import { getTestDb, resetAndSeed } from './_db.js';

const REAL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** sid cookie attribute extracted from the response Set-Cookie. */
function extractSid(res: Response): string | undefined {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return undefined;
  return /sid=([^;]+)/.exec(setCookie)?.[1];
}

describe('POST /api/auth/login', () => {
  let app: Hono;
  let db: Awaited<ReturnType<typeof getTestDb>>;

  beforeEach(async () => {
    db = await getTestDb();
    await resetAndSeed(db);

    const sessionRepo = createSessionRepository(db.db);
    const stokvelRepo = createStokvelRepository(db.db);

    app = new Hono();
    app.use('*', requestIdMiddleware);
    app.route('/api/auth', createAuthRouter(stokvelRepo, sessionRepo));
  });

  it('returns 200 with member + sessionKey + sid cookie on success', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': REAL_UA },
      body: JSON.stringify({ phone: DEMO_PHONE, pin: DEMO_PIN }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.member.phone).toBe(DEMO_PHONE);
    expect(typeof body.sessionKey).toBe('string');
    expect(body.sessionKey.length).toBeGreaterThan(20);

    const sid = extractSid(res);
    expect(sid).toBeDefined();
    expect(sid?.length).toBeGreaterThan(20);
  });

  it('returns 401 with identical body shape on wrong PIN', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': REAL_UA },
      body: JSON.stringify({ phone: DEMO_PHONE, pin: '9999' }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid_credentials' });
    expect(extractSid(res)).toBeUndefined();
  });

  it('returns 401 with identical body shape on unknown phone', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': REAL_UA },
      body: JSON.stringify({ phone: '+27820000000', pin: '1234' }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid_credentials' });
    expect(extractSid(res)).toBeUndefined();
  });

  it('returns 401 when User-Agent header is missing', async () => {
    // SECURITY: a missing UA makes UA-binding tautological. Same shape as
    // wrong-PIN so the two cases are externally indistinguishable.
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: DEMO_PHONE, pin: DEMO_PIN }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid_credentials' });
    expect(extractSid(res)).toBeUndefined();
  });

  it('returns 401 on malformed JSON body', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': REAL_UA },
      body: 'not json',
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid_credentials' });
  });

  it('returns 401 on schema-invalid body', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': REAL_UA },
      body: JSON.stringify({ phone: 'not-a-phone', pin: 'abc' }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid_credentials' });
  });

  it('login_success persists a session row in postgres', async () => {
    const before = await db.db.query.sessions.findMany();
    await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': REAL_UA },
      body: JSON.stringify({ phone: DEMO_PHONE, pin: DEMO_PIN }),
    });
    const after = await db.db.query.sessions.findMany();
    expect(after.length).toBe(before.length + 1);
  });

  it('rate-limits the same phone after 5 failed attempts (Retry-After present on 6th)', async () => {
    // Use a phone that's NOT the demo so we don't pollute the demo-user
    // bucket for the other tests in this file (the bucket is module-scoped).
    const phone = '+27821999777';
    const attempt = () =>
      app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': REAL_UA },
        body: JSON.stringify({ phone, pin: '0000' }),
      });

    for (let i = 0; i < 5; i++) {
      const res = await attempt();
      expect(res.status).toBe(401);
      expect(res.headers.get('retry-after')).toBeNull();
    }

    const limited = await attempt();
    expect(limited.status).toBe(401);
    expect(limited.headers.get('retry-after')).not.toBeNull();
    expect(await limited.json()).toEqual({ error: 'invalid_credentials' });
  });
});
