import * as z from "zod";

export const createSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.email().max(30),
  password: z.string().min(8),
});

export const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});