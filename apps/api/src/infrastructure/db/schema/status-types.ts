import { AnyPgColumn, pgTable, varchar } from "drizzle-orm/pg-core";
import { StatusTypeKey } from "@orbit/shared";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const statusTypes = pgTable("status_types", {
    key: varchar({ length: 25 }).primaryKey(),
    name: varchar({ length: 100 }).notNull(),
    ...auditColumns((): AnyPgColumn => users.id),
  });

export const INITIAL_STATUS_TYPES = [
  { key: StatusTypeKey.USER, name: "User" },
  { key: StatusTypeKey.TEAM, name: "Team" },
  { key: StatusTypeKey.PROJECT, name: "Project" },
  { key: StatusTypeKey.ISSUE, name: "Issue" },
] as const;

export type StatusTypeRow = typeof statusTypes.$inferSelect;
export type NewStatusTypeRow = typeof statusTypes.$inferInsert;
