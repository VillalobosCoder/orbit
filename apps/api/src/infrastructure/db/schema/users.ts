import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const DEFAULT_USER_STATUS_ID = 1;

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 30 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  statusId: integer().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userCreated: integer(),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
  userModified: integer(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;