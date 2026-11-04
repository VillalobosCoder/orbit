import * as z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  HOSTNAME: z.string().trim().min(1),
  DATABASE_URL: z.string().trim().min(1),
  DATABASE_PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_NAME: z.string().trim().min(1),
  DATABASE_USER: z.string().trim().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_SSL: z.string().trim().optional(),
  JWT_SECRET: z
    .string()
    .refine((value) => Buffer.byteLength(value, "utf8") >= 32, {
      message: "must be at least 32 bytes",
    }),
  STORAGE_DIR: z.string().trim().min(1).default("storage"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse({
    ...source,
    TRUST_PROXY: source.TRUST_PROXY || undefined,
    STORAGE_DIR: source.STORAGE_DIR || undefined,
  });

  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${problems}`);
  }

  return parsed.data;
}
