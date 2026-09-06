import { defineConfig } from 'vitest/config';
import path from 'path';
import { TEST_DATABASE_URL } from './src/test/db/url';

/**
 * Integration tests — run against a real Postgres.
 *
 * Kept separate from `vitest.config.ts` so the pure unit suite still runs with no database
 * and no Docker. Run with `npm run test:integration`.
 *
 * Postgres rather than an in-memory stand-in is deliberate: every profit number in this app
 * comes out of `Decimal(10,2)` columns, and that arithmetic should be exercised against the
 * real engine.
 */
export default defineConfig({
  test: {
    name:        'integration',
    environment: 'node',
    globals:     true,
    include:     ['src/**/*.integration.test.{ts,tsx}'],
    exclude:     ['**/node_modules/**', '**/e2e/**'],
    globalSetup: ['./src/test/db/globalSetup.ts'],
    setupFiles:  ['./src/test/db/setup.ts'],
    pool:        'forks',
    // One fork: these tests share a single database and truncate between cases.
    poolOptions: { forks: { singleFork: true } },
    env: {
      DATABASE_URL:                  TEST_DATABASE_URL,
      DIRECT_DATABASE_URL:           TEST_DATABASE_URL,
      // env.ts validates these at import time; integration tests never call Supabase.
      NEXT_PUBLIC_SUPABASE_URL:      'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NODE_ENV:                      'test',
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
