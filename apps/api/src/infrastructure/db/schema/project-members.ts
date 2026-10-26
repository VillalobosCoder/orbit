import {
  AnyPgColumn,
  index,
  integer,
  pgTable,
  primaryKey,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    primaryKey({
      name: "project_members_project_id_user_id_pk",
      columns: [table.projectId, table.userId],
    }),
    index("project_members_user_id_idx").on(table.userId),
  ],
);

export type ProjectMemberRow = typeof projectMembers.$inferSelect;
export type NewProjectMemberRow = typeof projectMembers.$inferInsert;
