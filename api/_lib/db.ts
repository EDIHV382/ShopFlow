// PostgreSQL connection pool for Neon serverless
// Uses the `pg` driver with SSL required by Neon

import { Pool } from 'pg';

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    const DB_URL = process.env.DATABASE_URL;
    if (!DB_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    _pool = new Pool({
      connectionString: DB_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return _pool;
}

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    return Reflect.get(getPool(), prop);
  },
});

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const client = getPool();
  const result = await client.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
