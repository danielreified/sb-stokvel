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
import { healthRouter } from './routes/health.js';
import { createMeRouter } from './routes/me.js';
import { createStokvelRouter } from './routes/stokvel.js';
import { versionRouter } from './routes/version.js';
import { createStore } from './store/seed.js';

const store = createStore();
const sessionRepo = createSessionRepository(store);
const stokvelRepo = createStokvelRepository(store);
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

// CORS only in dev (prod is same-origin via Vite proxy / CDN)
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

// Routes
app.route('/api', healthRouter);
app.route('/api', cspReportRouter);
app.route('/api/auth', createAuthRouter(store, sessionRepo));
app.route('/api', createMeRouter(store, authMiddleware));
app.route('/api/stokvel', createStokvelRouter(stokvelRepo, authMiddleware));
app.route('/api', versionRouter);

const PORT = Number(process.env.PORT ?? 3000);
export default {
  port: PORT,
  fetch: app.fetch,
};
