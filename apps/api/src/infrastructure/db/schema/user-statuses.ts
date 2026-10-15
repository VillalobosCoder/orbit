import {
  AnyPgColumn,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const USER_STATUS_IDS = {
  ACTIVE: 1,
  PENDING: 2,
  SUSPENDED: 3,
} as const;

export const userStatuses = pgTable(
  "user_statuses",
  {
    id: integer().primaryKey(),
    code: varchar({ length: 25 }).notNull(),
    description: varchar({ length: 255 }),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [unique("user_statuses_code_unique").on(table.code)],
);

export type UserStatusRow = typeof userStatuses.$inferSelect;
export type NewUserStatusRow = typeof userStatuses.$inferInsert;
