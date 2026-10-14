import { defineConfig } from "drizzle-kit";
import { readDatabaseConfig } from "./client.js";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/infrastructure/db/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: readDatabaseConfig(),
});
