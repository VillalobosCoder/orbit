import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createDbClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString?.trim()) {
    throw new Error("DATABASE_URL es obligatorio para iniciar la API.");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool });

  return { db, pool };
}
