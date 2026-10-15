import {
  AnyPgColumn,
  bigint,
  integer,
  pgTable,
  timestamp,
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
      .references(() => users.id, { onDelete: "restrict" }),
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

export const fileVariants = pgTable(
  "file_variants",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fileId: integer("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    variant: varchar({ length: 50 }).notNull(),
    storageKey: varchar("storage_key", { length: 1024 }).notNull().unique(),
    width: integer(),
    height: integer(),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("file_variants_file_id_variant_unique").on(
      table.fileId,
      table.variant,
    ),
  ],
);

export type FileRow = typeof files.$inferSelect;
export type NewFileRow = typeof files.$inferInsert;
export type FileVariantRow = typeof fileVariants.$inferSelect;
export type NewFileVariantRow = typeof fileVariants.$inferInsert;
