import {
  AnyPgColumn,
  boolean,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { statuses } from "./statuses.js";

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }).notNull(),
    lastName: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 254 }).notNull().unique(),
    password: varchar("password_hash", { length: 255 }).notNull(),
    mustChangePassword: boolean("must_change_password")
      .notNull()
      .default(false),
    statusId: integer("status_id")
      .notNull()
      .references(() => statuses.id),
    ...auditColumns((): AnyPgColumn => users.id),
  },
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
