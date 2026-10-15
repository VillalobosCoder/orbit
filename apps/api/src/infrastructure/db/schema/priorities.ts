import {
  AnyPgColumn,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const priorities = pgTable(
  "priorities",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    name: varchar({ length: 50 }).notNull(),
    level: integer().notNull(),
    color: varchar({ length: 20 }),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("priorities_project_id_name_unique").on(
      table.projectId,
      table.name,
    ),
  ],
);

export type PriorityRow = typeof priorities.$inferSelect;
export type NewPriorityRow = typeof priorities.$inferInsert;
