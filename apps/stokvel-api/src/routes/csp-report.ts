import { Hono } from 'hono';
import { logger } from '../lib/logger.js';

const perIpCounts = new Map<string, { count: number; windowStart: number }>();
const BUCKET_MS = 60_000;
const MAX_PER_IP = 50;

export const cspReportRouter = new Hono();

cspReportRouter.post('/csp-report', async (c) => {
  const clientIp = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  let entry = perIpCounts.get(clientIp);
  if (!entry || now - entry.windowStart > BUCKET_MS) {
    entry = { count: 0, windowStart: now };
    perIpCounts.set(clientIp, entry);
  }
  entry.count += 1;
  if (entry.count > MAX_PER_IP) return c.body(null, 204);

  try {
    const body: unknown = await c.req.json();
    logger.warn('csp_violation', { report: body });
  } catch {
    // Malformed body — log nothing, return 204
  }
  return c.body(null, 204);
});
