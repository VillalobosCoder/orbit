import * as z from "zod";
import { SPRINT_GOAL_MAX_LENGTH, SPRINT_NAME_MAX_LENGTH } from "@orbit/shared";

const date = z.iso.date();

export const saveSprintSchema = z.object({
  name: z.string().trim().min(1).max(SPRINT_NAME_MAX_LENGTH),
  goal: z.string().trim().max(SPRINT_GOAL_MAX_LENGTH).nullish(),
  startDate: date.nullish(),
  endDate: date.nullish(),
});

export const sprintParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  sprintId: z.coerce.number().int().positive(),
});

export const assignSprintSchema = z.object({
  sprintId: z.number().int().positive().nullable(),
});
