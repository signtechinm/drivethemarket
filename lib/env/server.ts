import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  INSTITUTION_TIMEZONE: z.string().min(1).default("Asia/Kolkata"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  VIDEO_PROVIDER: z.enum(["mock", "streaming"]).default("mock"),
  EMAIL_PROVIDER: z.enum(["log", "transactional", "gmail"]).default("log"),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  EMAIL_API_URL: z.string().url().optional(),
  EMAIL_API_TOKEN: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().min(16).optional(),
  MONITORING_WEBHOOK_URL: z.string().url().optional(),
  MONITORING_WEBHOOK_TOKEN: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(32).optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(
  environment: NodeJS.ProcessEnv,
): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    const details = result.error.issues
      .map(
        (issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`,
      )
      .join("; ");
    throw new Error(`Invalid server environment: ${details}`);
  }

  return result.data;
}

let cachedEnvironment: ServerEnvironment | undefined;

export function getServerEnvironment(): ServerEnvironment {
  cachedEnvironment ??= parseServerEnvironment(process.env);
  return cachedEnvironment;
}
