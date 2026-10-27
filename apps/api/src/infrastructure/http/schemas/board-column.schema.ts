import * as z from "zod";
import { BoardColumnCategory } from "@orbit/shared";

const color = z.string().trim().max(25).nullish();
const wipLimit = z.number().int().positive().max(1000).nullish();

export const saveBoardColumnSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color,
  wipLimit,
});

export const createBoardColumnSchema = saveBoardColumnSchema.extend({
  category: z.enum([
    BoardColumnCategory.TODO,
    BoardColumnCategory.IN_PROGRESS,
    BoardColumnCategory.DONE,
  ]),
});

export const boardColumnParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  columnId: z.coerce.number().int().positive(),
});

export const reorderBoardColumnsSchema = z.object({
  columnIds: z.array(z.number().int().positive()).min(1).max(50),
});

export const deleteBoardColumnSchema = z.object({
  moveIssuesToColumnId: z.number().int().positive(),
});
