import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeonHttp, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

type Schema = typeof schema;

/**
 * `Db` is a union over the two driver-specific Drizzle types because we use
 * different drivers for different runtimes:
 *
 *   - Lambda → `@neondatabase/serverless` HTTP driver. Stateless: every
 *     query is one HTTPS request to Neon's edge. No TCP handshake on cold
 *     start, no connection pool to leak, ideal for short-lived containers.
 *
 *   - Local dev / tests → node-postgres `Pool`. TCP, persistent
 *     connections, supports any Postgres including the docker container.
 *
 * Repository code uses only methods present on both (`select`, `insert`,
 * `update`, `delete`, `execute`), which TypeScript narrows correctly.
 */
export type Db = NeonHttpDatabase<Schema> | NodePgDatabase<Schema>;

export interface DbHandle {
  db: Db;
  /** No-op for the Neon HTTP driver; ends the pg Pool for tests. */
  close: () => Promise<void>;
}

/**
 * Pick the driver from the URL host. Neon's hosted endpoints all match
 * `*.neon.tech`; anything else falls through to pg.
 */
const NEON_HOSTNAME = /(?:^|\.)neon\.tech\b/;

export function createDb(databaseUrl: string): DbHandle {
  if (NEON_HOSTNAME.test(databaseUrl)) {
    const sql = neon(databaseUrl);
    const db = drizzleNeonHttp(sql, { schema });
    return { db, close: async () => {} };
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzleNode(pool, { schema });
  return { db, close: () => pool.end() };
}

export { and, asc, desc, eq, sql } from 'drizzle-orm';
export { schema };
