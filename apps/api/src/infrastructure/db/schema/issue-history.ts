import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { issues } from "./issues.js";
import { users } from "./users.js";

export const issueHistory = pgTable("issue_history", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  actorId: integer("actor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  field: varchar({ length: 100 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedAt: timestamp("changed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ...auditColumns((): AnyPgColumn => users.id),
});

export type IssueHistoryRow = typeof issueHistory.$inferSelect;
export type NewIssueHistoryRow = typeof issueHistory.$inferInsert;
