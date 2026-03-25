// PostgreSQL connection pool for Neon serverless
// Uses the `pg` driver with SSL required by Neon

import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_MQ2W1EOxuRwX@ep-curly-breeze-ang6ppqv-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!DB_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Singleton pool — reused across serverless function invocations
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: DB_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Neon serverless
      },
      max: 5, // Keep pool small for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = getPool();
  const result = await client.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
