import {
  AnyPgColumn,
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const teams = pgTable(
  "teams",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ownerUserId: integer("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 500 }),
    ...auditColumns((): AnyPgColumn => users.id),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    unique("teams_owner_user_id_name_unique").on(
      table.ownerUserId,
      table.name,
    ),
    unique("teams_owner_user_id_id_unique").on(table.ownerUserId, table.id),
  ],
);

export type TeamRow = typeof teams.$inferSelect;
export type NewTeamRow = typeof teams.$inferInsert;
