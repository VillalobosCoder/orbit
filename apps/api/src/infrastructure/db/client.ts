import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function readDatabaseConfig(env: NodeJS.ProcessEnv = process.env) {
  const database = env.DATABASE_NAME!;
  const user = env.DATABASE_USER!;
  const password = env.DATABASE_PASSWORD!;
  const host = env.DATABASE_URL!;
  const port = Number(env.DATABASE_PORT);
  const sslSetting = env.DATABASE_SSL?.trim().toLowerCase();

  if (!database || !user || !password) {
    throw new Error(
      "DATABASE_NAME, DATABASE_USER y DATABASE_PASSWORD son obligatorios.",
    );
  }

  const ssl = sslSetting === "true";

  return { host, port, database, user, password, ssl };
}

export function createDbClient() {
  const pool = new Pool(readDatabaseConfig());
  const db = drizzle({ client: pool });

  return { db, pool };
}
