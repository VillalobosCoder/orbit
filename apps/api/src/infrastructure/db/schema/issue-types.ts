import {
  AnyPgColumn,
  boolean,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const issueTypes = pgTable(
  "issue_types",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar({ length: 50 }).notNull(),
    isSubtask: boolean("is_subtask").notNull().default(false),
    icon: varchar({ length: 50 }),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("issue_types_project_id_name_unique").on(
      table.projectId,
      table.name,
    ),
  ],
);

export type IssueTypeRow = typeof issueTypes.$inferSelect;
export type NewIssueTypeRow = typeof issueTypes.$inferInsert;
