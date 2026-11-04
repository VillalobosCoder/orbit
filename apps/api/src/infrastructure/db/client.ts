import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadDatabaseEnv } from "../config/env.js";

export function readDatabaseConfig(source: NodeJS.ProcessEnv = process.env) {
  const env = loadDatabaseEnv(source);

  return {
    host: env.DATABASE_URL,
    port: env.DATABASE_PORT,
    database: env.DATABASE_NAME,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    ssl: env.DATABASE_SSL?.toLowerCase() === "true",
  };
}

export function createDbClient() {
  const pool = new Pool(readDatabaseConfig());
  const db = drizzle({ client: pool });

  return { db, pool };
}
