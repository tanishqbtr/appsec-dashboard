import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";
import { config } from "./config";

const { Pool } = pg;

if (!config.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const isLocalDb = /localhost|127\.0\.0\.1/.test(config.DATABASE_URL || "");

export const pool = new Pool({ 
  connectionString: config.DATABASE_URL,
  // Disable SSL for local/test containers even if NODE_ENV=production
  ssl: config.NODE_ENV === 'production' && !isLocalDb ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });