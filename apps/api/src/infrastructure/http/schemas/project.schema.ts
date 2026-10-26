import * as z from "zod";

const description = z.string().trim().max(1000).nullish();

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description,
});

export const createProjectSchema = updateProjectSchema.extend({
  projectKey: z.string().trim().min(2).max(10),
});

export const projectIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const projectMemberParamSchema = projectIdParamSchema.extend({
  userId: z.coerce.number().int().positive(),
});

export const addProjectMemberSchema = z.object({
  userId: z.number().int().positive(),
});
