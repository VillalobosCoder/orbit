import * as z from "zod";

export const attachmentParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  issueId: z.coerce.number().int().positive(),
  attachmentId: z.coerce.number().int().positive(),
});
