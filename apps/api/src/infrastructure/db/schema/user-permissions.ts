import {
  AnyPgColumn,
  boolean,
  foreignKey,
  integer,
  pgTable,
  unique,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { modules } from "./modules.js";
import { users } from "./users.js";

export const userPermissions = pgTable(
  "user_permissions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull(),
    moduleId: integer("module_id").notNull(),
    canRead: boolean("can_read").notNull().default(false),
    canWrite: boolean("can_write").notNull().default(false),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("user_permissions_user_module_unique").on(
      table.userId,
      table.moduleId,
    ),
    foreignKey({
      name: "user_permissions_user_fk",
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    foreignKey({
      name: "user_permissions_module_fk",
      columns: [table.moduleId],
      foreignColumns: [modules.id],
    }),
  ],
);

export type UserPermissionRow = typeof userPermissions.$inferSelect;
export type NewUserPermissionRow = typeof userPermissions.$inferInsert;
