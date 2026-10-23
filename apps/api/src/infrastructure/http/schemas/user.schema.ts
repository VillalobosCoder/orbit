import * as z from "zod";

export const createSchema = z.object({
  name: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  permissions: z
    .array(
      z.object({
        module: z.string().trim().min(1).max(25),
        canRead: z.boolean(),
        canWrite: z.boolean(),
      }),
    )
    .default([])
    .superRefine((permissions, context) => {
      const modules = new Set<string>();

      permissions.forEach((permission, index) => {
        if (modules.has(permission.module)) {
          context.addIssue({
            code: "custom",
            message: "No se puede repetir un módulo.",
            path: [index, "module"],
          });
        }
        modules.add(permission.module);

        if (!permission.canRead && !permission.canWrite) {
          context.addIssue({
            code: "custom",
            message: "Selecciona al menos un permiso para cada módulo.",
            path: [index],
          });
        }
      });
    }),
});

export const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});