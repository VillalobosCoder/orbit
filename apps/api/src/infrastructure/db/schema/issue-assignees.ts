import {
  AnyPgColumn,
  integer,
  pgTable,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { issues } from "./issues.js";
import { users } from "./users.js";

export const issueAssignees = pgTable(
  "issue_assignees",
  {
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignedByUserId: integer("assigned_by_user_id").references(
      (): AnyPgColumn => users.id,
      { onDelete: "set null" },
    ),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    primaryKey({
      name: "issue_assignees_issue_id_user_id_pk",
      columns: [table.issueId, table.userId],
    }),
  ],
);

export type IssueAssigneeRow = typeof issueAssignees.$inferSelect;
export type NewIssueAssigneeRow = typeof issueAssignees.$inferInsert;
