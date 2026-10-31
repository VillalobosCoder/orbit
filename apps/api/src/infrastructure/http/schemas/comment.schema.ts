import * as z from "zod";
import { COMMENT_MAX_LENGTH } from "@orbit/shared";

export const saveCommentSchema = z.object({
  body: z.string().trim().min(1).max(COMMENT_MAX_LENGTH),
});

export const commentParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  issueId: z.coerce.number().int().positive(),
  commentId: z.coerce.number().int().positive(),
});
