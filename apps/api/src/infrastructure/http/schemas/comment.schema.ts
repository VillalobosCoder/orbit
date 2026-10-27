import * as z from "zod";

export const saveCommentSchema = z.object({
  body: z.string().trim().min(1).max(10000),
});

export const commentParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  issueId: z.coerce.number().int().positive(),
  commentId: z.coerce.number().int().positive(),
});
