import {
  AnyPgColumn,
  foreignKey,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { StatusTypeKey, UserStatusKey } from "@orbit/shared";
import { auditColumns } from "./audit-columns.js";
import { statuses } from "./statuses.js";

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 30 }).notNull().unique(),
    password: varchar("password_hash", { length: 255 }).notNull(),
    statusTypeKey: varchar("status_type_key", { length: 25 })
      .notNull()
      .default(StatusTypeKey.USER),
    statusKey: varchar("status_key", { length: 25 })
      .notNull()
      .default(UserStatusKey.ACTIVE),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    foreignKey({
      name: "users_status_fk",
      columns: [table.statusTypeKey, table.statusKey],
      foreignColumns: [statuses.statusTypeKey, statuses.key],
    }),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
