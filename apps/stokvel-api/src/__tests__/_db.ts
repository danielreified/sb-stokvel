/**
 * Test-DB harness. Connects to the postgres_test docker service, runs the
 * Drizzle migrations once per process, and exposes truncate/seed helpers
 * for `beforeEach` to call.
 */
import { createDb, type DbHandle, sql } from '@seyva/db';
import { runMigrations } from '@seyva/db/migrate';
import { seed } from '@seyva/db/seed';

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://seyva:seyva@localhost:5433/seyva_test';

let migrated = false;
let cached: DbHandle | null = null;

export async function getTestDb(): Promise<DbHandle> {
  if (!migrated) {
    await runMigrations(TEST_DATABASE_URL);
    migrated = true;
  }
  if (!cached) cached = createDb(TEST_DATABASE_URL);
  return cached;
}

export async function resetAndSeed(handle: DbHandle): Promise<void> {
  await handle.db.execute(
    sql`TRUNCATE TABLE contributions, members, sessions, stokvels RESTART IDENTITY CASCADE`,
  );
  await seed(TEST_DATABASE_URL);
}
