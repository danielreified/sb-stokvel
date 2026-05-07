import { createDb } from '@seyva/db';
import { handle } from 'hono/aws-lambda';
import { createApp } from './app.js';
import { logger } from './lib/logger.js';
import { loadSecretsFromSsm } from './lib/secrets.js';

/**
 * AWS Lambda entry. The top-level await runs once per cold start: it
 * fetches every SSM SecureString listed in `lib/secrets.ts` and writes
 * the values to `process.env` before the Hono app is constructed.
 *
 * Once warm, the same `handler` (and its captured `app`, `db`) is reused
 * across invocations. The DB driver is Neon's HTTP-only one, so there is
 * no TCP pool to leak between invocations.
 */

const initStart = Date.now();

await loadSecretsFromSsm();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL not set after SSM load');
}

const { db } = createDb(databaseUrl);
const app = createApp(db);

const initDurationMs = Date.now() - initStart;

let isColdStart = true;
const honoHandler = handle(app);

/**
 * Wraps Hono's Lambda handler so the first invocation per container logs
 * `cold_start: true` with the init duration. Subsequent invocations on
 * the same warm container log `cold_start: false`.
 */
export const handler: typeof honoHandler = async (event, context) => {
  const wasCold = isColdStart;
  if (wasCold) {
    logger.info('lambda_cold_start', {
      initDurationMs,
      // process.uptime() includes Node.js startup + module load + our init.
      processUptimeS: process.uptime(),
    });
    isColdStart = false;
  }
  return honoHandler(event, context);
};
