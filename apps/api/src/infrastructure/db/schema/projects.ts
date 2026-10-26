import {
  AnyPgColumn,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { statuses } from "./statuses.js";
import { users } from "./users.js";

export const projects = pgTable(
  "projects",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ownerUserId: integer("owner_user_id")
      .notNull()
      .references(() => users.id),
    statusId: integer("status_id")
      .notNull()
      .references(() => statuses.id),
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
  ],
);

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
