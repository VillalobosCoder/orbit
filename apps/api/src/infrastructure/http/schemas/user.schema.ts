import * as z from "zod";
import { USER_SORT_FIELDS } from "@orbit/shared";

const permissionsSchema = z
    .array(
      z.object({
        module: z.string().trim().min(1).max(25),
        canRead: z.boolean(),
        canWrite: z.boolean(),
      }),
    )
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
    });

export const saveSchema = z.object({
  name: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  permissions: permissionsSchema.optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listUsersQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(USER_SORT_FIELDS).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
