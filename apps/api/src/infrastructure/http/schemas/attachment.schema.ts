import * as z from "zod";

const id = z.coerce.number().int().positive();

export const attachmentTargetSchema = z.object({
  id,
  issueId: id,
  commentId: id.optional(),
});

export const attachmentParamSchema = attachmentTargetSchema.extend({
  attachmentId: id,
});
