import {
  AnyPgColumn,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { COMMENT_MAX_LENGTH } from "@orbit/shared";
import { auditColumns } from "./audit-columns.js";
import { issues } from "./issues.js";
import { users } from "./users.js";

export const comments = pgTable(
  "comments",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id),
    body: varchar({ length: COMMENT_MAX_LENGTH }).notNull(),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("comments_issue_id_id_unique").on(table.issueId, table.id),
  ],
);

export type CommentRow = typeof comments.$inferSelect;
export type NewCommentRow = typeof comments.$inferInsert;
