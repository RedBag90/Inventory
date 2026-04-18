import * as Sentry from '@sentry/nextjs';
import { env } from '@/shared/config/env';

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: env.NODE_ENV === 'production',
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
