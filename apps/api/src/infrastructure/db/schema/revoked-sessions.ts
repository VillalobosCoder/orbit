import { index, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const revokedSessions = pgTable(
  "revoked_sessions",
  {
    id: varchar({ length: 36 }).primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("revoked_sessions_expires_at_idx").on(table.expiresAt)],
);
