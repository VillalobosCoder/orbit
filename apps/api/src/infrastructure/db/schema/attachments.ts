import {
  AnyPgColumn,
  foreignKey,
  integer,
  pgTable,
  unique,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { comments } from "./comments.js";
import { files } from "./files.js";
import { issues } from "./issues.js";
import { users } from "./users.js";

export const attachments = pgTable(
  "attachments",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id),
    commentId: integer("comment_id").references(() => comments.id),
    fileId: integer("file_id")
      .notNull()
      .references(() => files.id),
    uploadedByUserId: integer("uploaded_by_user_id")
      .notNull()
      .references(() => users.id),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("attachments_issue_id_comment_id_file_id_unique").on(
      table.issueId,
      table.commentId,
      table.fileId,
    ),
    foreignKey({
      name: "attachments_comment_issue_fk",
      columns: [table.issueId, table.commentId],
      foreignColumns: [comments.issueId, comments.id],
    }),
  ],
);

export type AttachmentRow = typeof attachments.$inferSelect;
export type NewAttachmentRow = typeof attachments.$inferInsert;
