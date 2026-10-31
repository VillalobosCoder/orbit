import {
  AnyPgColumn,
  doublePrecision,
  foreignKey,
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { ISSUE_DESCRIPTION_MAX_LENGTH } from "@orbit/shared";
import { auditColumns } from "./audit-columns.js";
import { boardColumns } from "./board-columns.js";
import { difficulties } from "./difficulties.js";
import { issueTypes } from "./issue-types.js";
import { priorities } from "./priorities.js";
import { projects } from "./projects.js";
import { sprints } from "./sprints.js";
import { statuses } from "./statuses.js";
import { users } from "./users.js";

export const issues = pgTable(
  "issues",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
    statusId: integer("status_id")
      .notNull()
      .references(() => statuses.id),
    issueNumber: integer("issue_number").notNull(),
    typeId: integer("type_id")
      .notNull()
      .references(() => issueTypes.id),
    parentId: integer("parent_id"),
    columnId: integer("column_id")
      .notNull()
      .references(() => boardColumns.id),
    sprintId: integer("sprint_id").references(() => sprints.id),
    priorityId: integer("priority_id").references(() => priorities.id),
    difficultyId: integer("difficulty_id").references(() => difficulties.id),
    reporterId: integer("reporter_id")
      .notNull()
      .references(() => users.id),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: ISSUE_DESCRIPTION_MAX_LENGTH }),
    startAt: timestamp("start_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    estimateMinutes: integer("estimate_minutes"),
    storyPoints: integer("story_points"),
    boardPosition: doublePrecision("board_position").notNull().default(0),
    ...auditColumns((): AnyPgColumn => users.id),
  },
  (table) => [
    unique("issues_project_id_issue_number_unique").on(
      table.projectId,
      table.issueNumber,
    ),
    unique("issues_project_id_id_unique").on(table.projectId, table.id),
    foreignKey({
      name: "issues_project_parent_fk",
      columns: [table.projectId, table.parentId],
      foreignColumns: [table.projectId, table.id],
    }),
    foreignKey({
      name: "issues_project_column_fk",
      columns: [table.projectId, table.columnId],
      foreignColumns: [boardColumns.projectId, boardColumns.id],
    }),
    foreignKey({
      name: "issues_project_sprint_fk",
      columns: [table.projectId, table.sprintId],
      foreignColumns: [sprints.projectId, sprints.id],
    }),
  ],
);

export type IssueRow = typeof issues.$inferSelect;
export type NewIssueRow = typeof issues.$inferInsert;
