import {
  AnyPgColumn,
  foreignKey,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { StatusTypeKey, TeamStatusKey } from "@orbit/shared";
import { auditColumns } from "./audit-columns.js";
import { statuses } from "./statuses.js";
import { users } from "./users.js";

export const teams = pgTable(
  "teams",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ownerUserId: integer("owner_user_id")
      .notNull()
      .references(() => users.id),
    statusTypeKey: varchar("status_type_key", { length: 25 })
      .notNull()
      .default(StatusTypeKey.TEAM),
    statusKey: varchar("status_key", { length: 25 })
      .notNull()
      .default(TeamStatusKey.ACTIVE),
    name: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 255 }),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("teams_owner_user_id_name_unique").on(
      table.ownerUserId,
      table.name,
    ),
    unique("teams_owner_user_id_id_unique").on(table.ownerUserId, table.id),
    foreignKey({
      name: "teams_status_fk",
      columns: [table.statusTypeKey, table.statusKey],
      foreignColumns: [statuses.statusTypeKey, statuses.key],
    }),
  ],
);

export type TeamRow = typeof teams.$inferSelect;
export type NewTeamRow = typeof teams.$inferInsert;
