import * as z from "zod";

const date = z.iso.date();

export const saveSprintSchema = z.object({
  name: z.string().trim().min(1).max(100),
  goal: z.string().trim().max(1000).nullish(),
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
