/**
 * Apply pending Drizzle migrations to the database in DATABASE_URL.
 * Used by `bun run --cwd packages/db migrate` and by test setup.
 *
 * This always uses the pg driver (not Neon HTTP) because:
 *   - Migrations run as a CLI from a developer machine or CI, never from
 *     Lambda — so the long-running TCP connection model is fine.
 *   - drizzle-orm/node-postgres/migrator wants a NodePgDatabase specifically;
 *     the neon-http migrator is a separate import with different ergonomics.
 *   - Both Neon and local Postgres accept pg connections, so one driver
 *     covers both targets.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema.js';

export async function runMigrations(databaseUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = resolve(here, '..', 'migrations');
  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}

if (import.meta.main) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  await runMigrations(url);
  console.log('migrations applied');
}
