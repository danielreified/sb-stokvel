import type { Db } from '@seyva/db';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { VERSION_CONFIG } from './config/versions.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { loggerMiddleware } from './middleware/logger.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { securityHeadersMiddleware } from './middleware/security-headers.js';
import { createSessionRepository } from './repository/session.js';
import { createStokvelRepository } from './repository/stokvel.js';
import { createAuthRouter } from './routes/auth.js';
import { cspReportRouter } from './routes/csp-report.js';
import { createHealthRouter } from './routes/health.js';
import { createMeRouter } from './routes/me.js';
import { createStokvelRouter } from './routes/stokvel.js';
import { versionRouter } from './routes/version.js';

/**
 * Build the Hono app. Pure factory — no env-reading, no module-level side
 * effects. Both `index.ts` (Bun dev) and `lambda.ts` (AWS Lambda) call this
 * once at startup.
 *
 * The single dependency is a Drizzle `Db`; passing it in keeps repos
 * pluggable for tests and lets the lambda entry create the db only after
 * SSM secrets have been loaded into process.env.
 */
export function createApp(db: Db): Hono {
  const sessionRepo = createSessionRepository(db);
  const stokvelRepo = createStokvelRepository(db);
  const authMiddleware = createAuthMiddleware(sessionRepo);

  const app = new Hono();

  // Middleware chain order: request-id → logger → security headers
  app.use('*', requestIdMiddleware);
  app.use('*', loggerMiddleware);
  app.use('*', securityHeadersMiddleware);

  // Version headers on every authenticated response
  app.use('/api/*', async (c, next) => {
    await next();
    c.res.headers.set('X-Min-Client-Version', VERSION_CONFIG.minVersion);
    c.res.headers.set('X-Latest-Client-Version', VERSION_CONFIG.latestVersion);
  });

  // Dev-only CORS — Vite proxy fronts the BFF in dev.
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      '/api/*',
      cors({
        origin: 'http://localhost:5173',
        credentials: true,
        allowHeaders: ['Content-Type', 'x-request-id'],
      }),
    );
  }

  // Preflight short-circuit. API Gateway HTTP API's auto-CORS does NOT
  // intercept OPTIONS when a `$default` route exists (the catch-all
  // forwards everything to the Lambda). Without this, browsers receive a
  // 404 for the preflight + the actual fetch fails with a CORS error.
  // APIGW still injects the configured allow-* headers on top of our 204,
  // so the response shape is correct. In dev, Hono's cors() above already
  // handles preflights — this handler is reached only in prod.
  app.options('*', (c) => c.body(null, 204));

  app.route('/api', createHealthRouter(db));
  app.route('/api', cspReportRouter);
  app.route('/api/auth', createAuthRouter(stokvelRepo, sessionRepo));
  app.route('/api', createMeRouter(stokvelRepo, sessionRepo, authMiddleware));
  app.route('/api/stokvel', createStokvelRouter(stokvelRepo, authMiddleware));
  app.route('/api', versionRouter);

  return app;
}
