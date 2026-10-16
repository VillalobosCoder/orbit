import {
  AnyPgColumn,
  date,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const sprints = pgTable(
  "sprints",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
    name: varchar({ length: 100 }).notNull(),
    goal: varchar({ length: 1000 }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    status: varchar({ length: 20 }).notNull().default("planned"),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("sprints_project_id_id_unique").on(table.projectId, table.id),
    unique("sprints_project_id_name_unique").on(table.projectId, table.name),
  ],
);

export type SprintRow = typeof sprints.$inferSelect;
export type NewSprintRow = typeof sprints.$inferInsert;
