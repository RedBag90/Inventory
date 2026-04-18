export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs');
    const { env } = await import('@/shared/config/env');
    init({
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      enabled: env.NODE_ENV === 'production',
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('@sentry/nextjs');
    const { env } = await import('@/shared/config/env');
    init({
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      enabled: env.NODE_ENV === 'production',
    });
  }
}
