import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { issues } from "./issues.js";
import { users } from "./users.js";

export const comments = pgTable(
  "comments",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    body: text().notNull(),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("comments_issue_id_id_unique").on(table.issueId, table.id),
  ],
);

export type CommentRow = typeof comments.$inferSelect;
export type NewCommentRow = typeof comments.$inferInsert;
