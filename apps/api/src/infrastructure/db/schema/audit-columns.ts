import {
  AnyPgColumn,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export function auditColumns(userId: () => AnyPgColumn) {
  return {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdByUserId: integer("created_by_user_id").references(userId, {
      onDelete: "set null",
    }),
    updatedByUserId: integer("updated_by_user_id").references(userId, {
      onDelete: "set null",
    }),
  };
}
