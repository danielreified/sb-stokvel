import type { MiddlewareHandler } from 'hono';
import { logger } from '../lib/logger.js';

/** Second middleware. Logs method + path + status + duration. Never logs bodies. */
export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const requestId = c.get('requestId');
  await next();
  const ms = Date.now() - start;
  logger.info('request', {
    requestId,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    status: c.res.status,
    durationMs: ms,
  });
};
