import * as z from "zod";

export const saveTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(255).nullish(),
});

export const teamIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
