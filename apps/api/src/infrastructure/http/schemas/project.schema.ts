import * as z from "zod";
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from "@orbit/shared";

const description = z.string().trim().max(PROJECT_DESCRIPTION_MAX_LENGTH).nullish();

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(PROJECT_NAME_MAX_LENGTH),
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
