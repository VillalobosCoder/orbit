import * as z from "zod";

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const notificationParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const notificationPreferenceSchema = z.object({
  enabled: z.boolean(),
});
