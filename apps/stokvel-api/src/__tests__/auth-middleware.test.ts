import { beforeEach, describe, expect, it } from 'bun:test';
import { eq, schema } from '@seyva/db';
import { Hono } from 'hono';
import { computeUaFingerprint, createAuthMiddleware } from '../middleware/auth.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { createSessionRepository } from '../repository/session.js';
import { getTestDb, resetAndSeed } from './_db.js';

const REAL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const OTHER_UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0';

const MEMBER_ID = '10000000-0000-0000-0000-000000000001';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

/**
 * Build a tiny Hono app with the auth middleware on `/protected` so each
 * test can hit a single endpoint and observe the middleware's behaviour
 * without dragging in the rest of the route tree.
 */
async function buildApp(db: Awaited<ReturnType<typeof getTestDb>>) {
  const sessionRepo = createSessionRepository(db.db);
  const authMiddleware = createAuthMiddleware(sessionRepo);

  const app = new Hono();
  app.use('*', requestIdMiddleware);
  app.use('/protected', authMiddleware);
  app.get('/protected', (c) => c.json({ ok: true }));

  return { app, sessionRepo };
}

describe('auth middleware', () => {
  let db: Awaited<ReturnType<typeof getTestDb>>;
  let app: Hono;
  let sessionRepo: ReturnType<typeof createSessionRepository>;

  beforeEach(async () => {
    db = await getTestDb();
    await resetAndSeed(db);
    ({ app, sessionRepo } = await buildApp(db));
  });

  it('returns 401 when no sid cookie is present', async () => {
    const res = await app.request('/protected', {
      headers: { 'User-Agent': REAL_UA },
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('returns 401 when sid cookie points at no session row', async () => {
    const res = await app.request('/protected', {
      headers: { 'User-Agent': REAL_UA, Cookie: 'sid=nosuch-session-id' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 + destroys session when User-Agent is missing', async () => {
    const sid = 'sid-missing-ua';
    const fingerprint = await computeUaFingerprint(REAL_UA);
    await sessionRepo.create(sid, {
      userId: MEMBER_ID,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      uaFingerprint: fingerprint,
      sessionKey: 'sk',
    });

    const res = await app.request('/protected', {
      headers: { Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(401);
    const remaining = await db.db.select().from(schema.sessions).where(eq(schema.sessions.id, sid));
    expect(remaining.length).toBe(0);
  });

  it('returns 401 + destroys session on UA fingerprint mismatch', async () => {
    const sid = 'sid-ua-mismatch';
    const fingerprintAtLogin = await computeUaFingerprint(REAL_UA);
    await sessionRepo.create(sid, {
      userId: MEMBER_ID,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      uaFingerprint: fingerprintAtLogin,
      sessionKey: 'sk',
    });

    const res = await app.request('/protected', {
      headers: { 'User-Agent': OTHER_UA, Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(401);
    const remaining = await db.db.select().from(schema.sessions).where(eq(schema.sessions.id, sid));
    expect(remaining.length).toBe(0);
  });

  it('returns 401 + destroys session past the idle timeout', async () => {
    const sid = 'sid-idle-timeout';
    const fingerprint = await computeUaFingerprint(REAL_UA);
    const now = Date.now();
    await sessionRepo.create(sid, {
      userId: MEMBER_ID,
      createdAt: now - IDLE_TIMEOUT_MS - 1000,
      lastSeenAt: now - IDLE_TIMEOUT_MS - 1000,
      uaFingerprint: fingerprint,
      sessionKey: 'sk',
    });

    const res = await app.request('/protected', {
      headers: { 'User-Agent': REAL_UA, Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(401);
    const remaining = await db.db.select().from(schema.sessions).where(eq(schema.sessions.id, sid));
    expect(remaining.length).toBe(0);
  });

  it('returns 401 + destroys session past the absolute timeout', async () => {
    const sid = 'sid-absolute-timeout';
    const fingerprint = await computeUaFingerprint(REAL_UA);
    const now = Date.now();
    await sessionRepo.create(sid, {
      userId: MEMBER_ID,
      // createdAt is 13h ago but lastSeenAt is fresh — only the absolute
      // limit should kick.
      createdAt: now - ABSOLUTE_TIMEOUT_MS - 1000,
      lastSeenAt: now,
      uaFingerprint: fingerprint,
      sessionKey: 'sk',
    });

    const res = await app.request('/protected', {
      headers: { 'User-Agent': REAL_UA, Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(401);
    const remaining = await db.db.select().from(schema.sessions).where(eq(schema.sessions.id, sid));
    expect(remaining.length).toBe(0);
  });

  it('passes through and updates lastSeenAt on a valid session', async () => {
    const sid = 'sid-valid';
    const fingerprint = await computeUaFingerprint(REAL_UA);
    const oldLastSeen = Date.now() - 60_000;
    await sessionRepo.create(sid, {
      userId: MEMBER_ID,
      createdAt: oldLastSeen,
      lastSeenAt: oldLastSeen,
      uaFingerprint: fingerprint,
      sessionKey: 'sk',
    });

    const res = await app.request('/protected', {
      headers: { 'User-Agent': REAL_UA, Cookie: `sid=${sid}` },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const [row] = await db.db.select().from(schema.sessions).where(eq(schema.sessions.id, sid));
    expect(row).toBeDefined();
    expect(Number(row.lastSeenAt)).toBeGreaterThan(oldLastSeen);
  });
});
