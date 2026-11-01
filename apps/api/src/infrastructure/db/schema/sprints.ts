import {
  AnyPgColumn,
  date,
  integer,
  pgTable,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { SPRINT_GOAL_MAX_LENGTH, SPRINT_NAME_MAX_LENGTH } from "@orbit/shared";
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
    name: varchar({ length: SPRINT_NAME_MAX_LENGTH }).notNull(),
    goal: varchar({ length: SPRINT_GOAL_MAX_LENGTH }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    status: varchar({ length: 20 }).notNull().default("planned"),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("sprints_project_id_id_unique").on(table.projectId, table.id),
    unique("sprints_project_id_name_unique").on(table.projectId, table.name),
    // A lo sumo un sprint activo por proyecto, incluso con peticiones simultáneas.
    uniqueIndex("sprints_one_active_per_project")
      .on(table.projectId)
      .where(sql`${table.status} = 'active'`),
  ],
);

export type SprintRow = typeof sprints.$inferSelect;
export type NewSprintRow = typeof sprints.$inferInsert;
