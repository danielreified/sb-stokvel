import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export type Db = ReturnType<typeof drizzle<typeof schema>>;

export interface DbHandle {
  db: Db;
  pool: Pool;
  close: () => Promise<void>;
}

/**
 * Create a Drizzle client backed by a node-postgres Pool.
 *
 * The Pool is exposed for migrations / direct SQL tasks; route code should
 * never reach for it. `close()` ends the pool — call it from test teardown.
 */
export function createDb(databaseUrl: string): DbHandle {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  return { db, pool, close: () => pool.end() };
}

export { and, asc, desc, eq, sql } from 'drizzle-orm';
export { schema };
