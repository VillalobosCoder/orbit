import * as z from "zod";
import {
  ISSUE_DESCRIPTION_MAX_LENGTH,
  ISSUE_TITLE_MAX_LENGTH,
} from "@orbit/shared";

const id = z.number().int().positive();

export const saveIssueSchema = z.object({
  title: z.string().trim().min(1).max(ISSUE_TITLE_MAX_LENGTH),
  description: z.string().trim().max(ISSUE_DESCRIPTION_MAX_LENGTH).nullish(),
  typeId: id,
  priorityId: id.nullish(),
  difficultyId: id.nullish(),
  parentId: id.nullish(),
  sprintId: id.nullish(),
  columnId: id.optional(),
  assigneeIds: z.array(id).max(50).optional(),
});

export const moveIssueSchema = z.object({
  columnId: id,
  previousIssueId: id.nullish(),
  nextIssueId: id.nullish(),
});

export const issueParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  issueId: z.coerce.number().int().positive(),
});
