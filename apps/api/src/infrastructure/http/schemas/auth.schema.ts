import * as z from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});
