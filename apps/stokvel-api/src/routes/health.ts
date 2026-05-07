import type { Db } from '@seyva/db';
import { sql } from '@seyva/db';
import { Hono } from 'hono';
import { VERSION_CONFIG } from '../config/versions.js';
import { logger } from '../lib/logger.js';

const startTime = Date.now();

/**
 * The probe budget. Synthetic monitors poll /api/health every 30s+, so
 * a 2s upper bound keeps the response from sitting on a stalled DB
 * connection. If we hit it, the DB is degraded enough to fail the probe.
 */
const DB_PROBE_TIMEOUT_MS = 2000;

interface HealthBody {
  status: 'ok' | 'degraded';
  version: string;
  uptimeSeconds: number;
  dbDurationMs: number;
}

/**
 * GET /api/health — readiness probe used by synthetic monitors and the
 * load balancer. Returns 200 only when the DB round-trip succeeds; a
 * timeout or any DB error degrades the response to 503 so paging tools
 * fire instead of silently masking an outage.
 */
export function createHealthRouter(db: Db) {
  const router = new Hono();

  router.get('/health', async (c) => {
    const requestId = c.get('requestId');
    const probeStart = Date.now();
    let dbOk = false;

    try {
      await Promise.race([
        db.execute(sql`select 1`),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('db_probe_timeout')), DB_PROBE_TIMEOUT_MS),
        ),
      ]);
      dbOk = true;
    } catch (err) {
      logger.warn('health_db_probe_failed', {
        requestId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const body: HealthBody = {
      status: dbOk ? 'ok' : 'degraded',
      version: VERSION_CONFIG.serverVersion,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      dbDurationMs: Date.now() - probeStart,
    };

    return c.json(body, dbOk ? 200 : 503);
  });

  return router;
}
