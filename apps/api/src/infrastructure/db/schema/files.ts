import {
  AnyPgColumn,
  bigint,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { auditColumns } from "./audit-columns.js";
import { users } from "./users.js";

export const files = pgTable(
  "files",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uploadedByUserId: integer("uploaded_by_user_id")
      .notNull()
      .references(() => users.id),
    bucket: varchar({ length: 100 }).notNull(),
    storageKey: varchar("storage_key", { length: 1024 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "bigint" }).notNull(),
    checksumSha256: varchar("checksum_sha256", { length: 64 }),
    width: integer(),
    height: integer(),
    durationSeconds: integer("duration_seconds"),
    status: varchar({ length: 20 }).notNull().default("pending"),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("files_storage_key_unique").on(table.storageKey),
  ],
);

export type FileRow = typeof files.$inferSelect;
export type NewFileRow = typeof files.$inferInsert;
