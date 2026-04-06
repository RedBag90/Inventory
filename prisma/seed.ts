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
  { email: 'admin@test.com', password: 'Admin1234!', role: 'ADMIN' as const },
  { email: 'user@test.com',  password: 'User1234!',  role: 'USER'  as const },
  { email: 'user2@test.com', password: 'User1234!',  role: 'USER'  as const },
];

async function main() {
  for (const account of TEST_ACCOUNTS) {
    // Create (or re-use) the Supabase Auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // skip confirmation email in local dev
    });

    let supabaseId = data?.user?.id;

    if (error) {
      // User already exists — look them up
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === account.email);
      if (!existing) throw new Error(`Failed to create ${account.email}: ${error.message}`);
      supabaseId = existing.id;
      console.log(`ℹ️  ${account.email} already exists — upserting DB record`);
    }

    if (!supabaseId) {
      console.log(`⚠️  ${account.email} — could not resolve ID, skipping`);
      continue;
    }

    // Upsert the matching record in our app DB, including role
    await prisma.user.upsert({
      where:  { supabaseId },
      update: { role: account.role },
      create: { supabaseId, email: account.email, role: account.role },
    });

    console.log(`✓  ${account.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
