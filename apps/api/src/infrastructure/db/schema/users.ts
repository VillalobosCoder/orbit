import {
  AnyPgColumn,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { userStatuses } from "./user-statuses.js";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 30 }).notNull().unique(),
  password: varchar("password_hash", { length: 255 }).notNull(),
  statusId: integer("status_id")
    .notNull()
    .references((): AnyPgColumn => userStatuses.id),
  ...auditColumns((): AnyPgColumn => users.id),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
