// Seed script — creates two test accounts in Supabase Auth and the local DB.
// Run with: npm run db:seed
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const prisma = new PrismaClient();

const TEST_ACCOUNTS = [
  { email: 'admin@test.com', password: 'Admin1234!' },
  { email: 'user@test.com',  password: 'User1234!'  },
];

async function main() {
  for (const account of TEST_ACCOUNTS) {
    // Create (or re-use) the Supabase Auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // skip confirmation email in local dev
    });

    if (error && error.message !== 'User already registered') {
      throw new Error(`Failed to create ${account.email}: ${error.message}`);
    }

    const supabaseId = data?.user?.id;
    if (!supabaseId) {
      console.log(`⚠️  ${account.email} already exists — skipping DB upsert`);
      continue;
    }

    // Upsert the matching record in our app DB
    await prisma.user.upsert({
      where:  { supabaseId },
      update: {},
      create: { supabaseId, email: account.email },
    });

    console.log(`✓  ${account.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
