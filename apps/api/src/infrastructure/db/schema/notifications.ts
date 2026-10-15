import {
  AnyPgColumn,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const notifications = pgTable("notifications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: integer("actor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  type: varchar({ length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  payload: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...auditColumns((): AnyPgColumn => users.id),
});

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
