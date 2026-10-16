import {
  AnyPgColumn,
  integer,
  foreignKey,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { ProjectStatusKey, StatusTypeKey } from "@orbit/shared";
import { auditColumns } from "./audit-columns.js";
import { statuses } from "./statuses.js";
import { teams } from "./teams.js";
import { users } from "./users.js";

export const projects = pgTable(
  "projects",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ownerUserId: integer("owner_user_id")
      .notNull()
      .references(() => users.id),
    statusTypeKey: varchar("status_type_key", { length: 25 })
      .notNull()
      .default(StatusTypeKey.PROJECT),
    statusKey: varchar("status_key", { length: 25 })
      .notNull()
      .default(ProjectStatusKey.ACTIVE),
    teamId: integer("team_id"),
    projectKey: varchar("project_key", { length: 10 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 1000 }),
    issueCounter: integer("issue_counter").notNull().default(0),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("projects_owner_user_id_project_key_unique").on(
      table.ownerUserId,
      table.projectKey,
    ),
    foreignKey({
      name: "projects_owner_team_fk",
      columns: [table.ownerUserId, table.teamId],
      foreignColumns: [teams.ownerUserId, teams.id],
    }),
    foreignKey({
      name: "projects_status_fk",
      columns: [table.statusTypeKey, table.statusKey],
      foreignColumns: [statuses.statusTypeKey, statuses.key],
    }),
  ],
);

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
