import { prisma } from '@/shared/lib/prisma';

let cachedTables: string[] | null = null;

async function tableNames(): Promise<string[]> {
  if (cachedTables) return cachedTables;
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  cachedTables = rows.map((r) => r.tablename);
  return cachedTables;
}

/**
 * Empties every table. Called between integration tests so each one starts from a known
 * empty database. TRUNCATE ... CASCADE is used rather than per-model deleteMany so we do
 * not have to maintain a deletion order as the schema grows.
 */
export async function resetDb(): Promise<void> {
  const tables = await tableNames();
  if (tables.length === 0) return;
  const list = tables.map((t) => `"public"."${t}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
}
