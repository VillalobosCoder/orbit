import {
  AnyPgColumn,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const modules = pgTable(
  "modules",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    parentId: integer("parent_id").references(
      (): AnyPgColumn => modules.id,
    ),
    key: varchar({ length: 25 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    icon: varchar({ length: 50 }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [unique("modules_key_unique").on(table.key)],
);

export const INITIAL_MODULES = [
  { key: "home", name: "Home", icon: "House", sortOrder: 0 },
  { key: "users", name: "Users", icon: "Users", sortOrder: 10 },
] as const;

export type ModuleRow = typeof modules.$inferSelect;
export type NewModuleRow = typeof modules.$inferInsert;
