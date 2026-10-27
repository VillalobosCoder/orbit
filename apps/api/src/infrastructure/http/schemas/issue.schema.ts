import * as z from "zod";

const id = z.number().int().positive();

export const saveIssueSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(20000).nullish(),
  typeId: id,
  priorityId: id.nullish(),
  difficultyId: id.nullish(),
  parentId: id.nullish(),
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
