import { createDb } from '@seyva/db';
import { createApp } from './app.js';

/**
 * Bun dev entry. Reads DATABASE_URL from the local `.env` (loaded via
 * `bun --env-file=.env` in `package.json`'s `dev` script).
 *
 * `lambda.ts` is the production entry; this file is never imported there.
 */

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const { db } = createDb(databaseUrl);
const app = createApp(db);

const PORT = Number(process.env.PORT ?? 3000);
export default {
  port: PORT,
  fetch: app.fetch,
};
