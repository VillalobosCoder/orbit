import {
  AnyPgColumn,
  integer,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { issues } from "./issues.js";
import { users } from "./users.js";

export const timeLogs = pgTable("time_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  minutes: integer().notNull(),
  ...auditColumns((): AnyPgColumn => users.id),
});

export type TimeLogRow = typeof timeLogs.$inferSelect;
export type NewTimeLogRow = typeof timeLogs.$inferInsert;
