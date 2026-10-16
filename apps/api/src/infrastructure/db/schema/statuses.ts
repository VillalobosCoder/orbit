import {
  AnyPgColumn,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import {
  IssueStatusKey,
  ProjectStatusKey,
  StatusTypeKey,
  TeamStatusKey,
  UserStatusKey,
} from "@orbit/shared";
import { auditColumns } from "./audit-columns.js";
import { statusTypes } from "./status-types.js";
import { users } from "./users.js";

export const statuses = pgTable(
  "statuses",
  {
    key: varchar({ length: 25 }).primaryKey(),
    statusTypeKey: varchar("status_type_key", { length: 25 })
      .notNull()
      .references(() => statusTypes.key),
    name: varchar({ length: 100 }).notNull(),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("statuses_status_type_key_key_unique").on(
      table.statusTypeKey,
      table.key,
    ),
  ],
);

export const INITIAL_STATUSES = [
  {
    key: UserStatusKey.ACTIVE,
    statusTypeKey: StatusTypeKey.USER,
    name: "Active",
  },
  {
    key: UserStatusKey.PENDING,
    statusTypeKey: StatusTypeKey.USER,
    name: "Pending",
  },
  {
    key: UserStatusKey.SUSPENDED,
    statusTypeKey: StatusTypeKey.USER,
    name: "Suspended",
  },
  {
    key: UserStatusKey.DELETED,
    statusTypeKey: StatusTypeKey.USER,
    name: "Deleted",
  },
  {
    key: TeamStatusKey.ACTIVE,
    statusTypeKey: StatusTypeKey.TEAM,
    name: "Active",
  },
  {
    key: TeamStatusKey.ARCHIVED,
    statusTypeKey: StatusTypeKey.TEAM,
    name: "Archived",
  },
  {
    key: TeamStatusKey.DELETED,
    statusTypeKey: StatusTypeKey.TEAM,
    name: "Deleted",
  },
  {
    key: ProjectStatusKey.ACTIVE,
    statusTypeKey: StatusTypeKey.PROJECT,
    name: "Active",
  },
  {
    key: ProjectStatusKey.ARCHIVED,
    statusTypeKey: StatusTypeKey.PROJECT,
    name: "Archived",
  },
  {
    key: ProjectStatusKey.DELETED,
    statusTypeKey: StatusTypeKey.PROJECT,
    name: "Deleted",
  },
  {
    key: IssueStatusKey.ACTIVE,
    statusTypeKey: StatusTypeKey.ISSUE,
    name: "Active",
  },
  {
    key: IssueStatusKey.DELETED,
    statusTypeKey: StatusTypeKey.ISSUE,
    name: "Deleted",
  },
] as const;

export type StatusRow = typeof statuses.$inferSelect;
export type NewStatusRow = typeof statuses.$inferInsert;
