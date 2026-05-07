/**
 * Apply pending Drizzle migrations to the database in DATABASE_URL.
 * Used by `bun run --cwd packages/db migrate` and by test setup.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from './index.js';

export async function runMigrations(databaseUrl: string): Promise<void> {
  const handle = createDb(databaseUrl);
  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = resolve(here, '..', 'migrations');
  try {
    await migrate(handle.db, { migrationsFolder });
  } finally {
    await handle.close();
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
