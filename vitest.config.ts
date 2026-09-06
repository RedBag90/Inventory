import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',
    // Integration tests live in vitest.integration.config.ts — they need a real Postgres.
    exclude: ['**/node_modules/**', '**/e2e/**', 'src/**/*.integration.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.test.*', 'src/**/*.spec.*'],
      // No global threshold — critical logic (calculations, auth) tested at 100%
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
