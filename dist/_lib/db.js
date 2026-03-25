"use strict";
// PostgreSQL connection pool for Neon serverless
// Uses the `pg` driver with SSL required by Neon
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.query = query;
exports.queryOne = queryOne;
const pg_1 = require("pg");
const DB_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_MQ2W1EOxuRwX@ep-curly-breeze-ang6ppqv-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";
if (!DB_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}
// Singleton pool — reused across serverless function invocations
let pool = null;
function getPool() {
    if (!pool) {
        pool = new pg_1.Pool({
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
async function query(text, params) {
    const client = getPool();
    const result = await client.query(text, params);
    return result.rows;
}
async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0] ?? null;
}
