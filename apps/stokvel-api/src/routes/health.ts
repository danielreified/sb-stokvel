import { Hono } from 'hono';
import { VERSION_CONFIG } from '../config/versions.js';

const startTime = Date.now();

export const healthRouter = new Hono();

healthRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: VERSION_CONFIG.serverVersion,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
  });
});
