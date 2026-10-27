import {
  AnyPgColumn,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const difficulties = pgTable(
  "difficulties",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 10 }).notNull(),
    level: integer().notNull(),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [unique("difficulties_name_unique").on(table.name)],
);

export type DifficultyRow = typeof difficulties.$inferSelect;
export type NewDifficultyRow = typeof difficulties.$inferInsert;
