import { execSync } from 'node:child_process';
import { TEST_DATABASE_URL, assertIsTestDatabase } from './url';

/**
 * Runs once before the integration suite.
 *
 * `prisma db push --force-reset` creates the test database if it does not exist, drops any
 * existing schema, and applies the current `schema.prisma`. We use `db push` rather than
 * `migrate deploy` deliberately: the project's own workflow evolves the schema with
 * `db push` (see Context/00_architecture_blueprint.md §2), so the migration history is not
 * guaranteed to reproduce the current schema.
 *
 * Note this runs in vitest's main process, where the config's `test.env` does not apply —
 * hence the URL comes from ./url, never from the ambient DATABASE_URL.
 */
export default function setup() {
  assertIsTestDatabase(TEST_DATABASE_URL);

  execSync('npx prisma db push --force-reset --skip-generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL:        TEST_DATABASE_URL,
      DIRECT_DATABASE_URL: TEST_DATABASE_URL,
    },
  });
}
