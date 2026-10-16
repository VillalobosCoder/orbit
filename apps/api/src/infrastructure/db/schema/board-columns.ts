import {
  AnyPgColumn,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const boardColumns = pgTable(
  "board_columns",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
    name: varchar({ length: 50 }).notNull(),
    category: varchar({ length: 25 }).notNull(),
    position: integer().notNull(),
    color: varchar({ length: 25 }),
    wipLimit: integer("wip_limit"),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("board_columns_project_id_id_unique").on(
      table.projectId,
      table.id,
    ),
    unique("board_columns_project_id_name_unique").on(
      table.projectId,
      table.name,
    ),
  ],
);

export type BoardColumnRow = typeof boardColumns.$inferSelect;
export type NewBoardColumnRow = typeof boardColumns.$inferInsert;
