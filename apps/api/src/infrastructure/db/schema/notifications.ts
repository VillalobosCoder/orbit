import {
  AnyPgColumn,
  integer,
  jsonb,
  pgTable,
  index,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const notifications = pgTable(
  "notifications",
  {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id),
  actorId: integer("actor_id").references(() => users.id),
  type: varchar({ length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  payload: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("notifications_recipient_type_entity_unique").on(
      table.recipientId,
      table.type,
      table.entityType,
      table.entityId,
    ),
    index("notifications_recipient_created_idx").on(
      table.recipientId,
      table.createdAt,
    ),
  ],
);

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
