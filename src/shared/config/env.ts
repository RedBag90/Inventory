// Zod-validated environment variables.
// App will not start if any required variable is missing or malformed.
// Import `env` from here everywhere — never access process.env directly.
import { z } from 'zod';

const EnvSchema = z.object({
  // Database
  DATABASE_URL:        z.string().url(), // Pooled (PgBouncer) — runtime
  DIRECT_DATABASE_URL: z.string().url(), // Direct — prisma migrate only

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // SMTP (join-request email notifications — optional, logs to console if absent)
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().optional(),

  // Weekly digest cron — must match Authorization header sent by Vercel Cron
  CRON_SECRET: z.string().min(1).optional(),

  // Public app URL (used in digest emails for links)
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Sentry (optional — app boots without it; NEXT_PUBLIC_ so client can init too)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Runtime
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// eslint-disable-next-line no-restricted-syntax
export const env = EnvSchema.parse(process.env);

export type Env = z.infer<typeof EnvSchema>;
