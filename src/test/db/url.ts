/**
 * The single source of truth for which database integration tests talk to.
 *
 * Deliberately does NOT fall back to `DATABASE_URL`: that variable is loaded from `.env` and
 * points at the real (Supabase) database. `globalSetup` drops and recreates the schema, so
 * reading the ambient `DATABASE_URL` there would be catastrophic. Integration tests use
 * `TEST_DATABASE_URL`, or a local default, and nothing else.
 */
// Test bootstrap reads process.env directly, like prisma.ts and supabase/client.ts do:
// `@/shared/config/env` does not define TEST_DATABASE_URL (it is not an app runtime
// variable), and importing it here would require DATABASE_URL to be present — the very
// variable this module exists to avoid reading.
export const TEST_DATABASE_URL =
  // eslint-disable-next-line no-restricted-syntax
  process.env.TEST_DATABASE_URL ??
  'postgresql://inventory:inventory@localhost:5432/inventory_test';

/** Guard against ever pointing the destructive reset at a non-test database. */
export function assertIsTestDatabase(url: string): void {
  if (!/test/i.test(url)) {
    throw new Error(
      `Refusing to reset a database whose URL does not contain "test": ${url}\n` +
      'Integration tests drop the entire schema — point TEST_DATABASE_URL at a dedicated test database.',
    );
  }
}
