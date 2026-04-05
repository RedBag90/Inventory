'use server';

import { prisma } from '@/shared/lib/prisma';

/**
 * US-008 — Upsert the Supabase-authenticated user into the local Prisma User table.
 * Called from the dashboard layout on every authenticated request.
 */
export async function syncUser(supabaseId: string, email: string): Promise<void> {
  await prisma.user.upsert({
    where: { supabaseId },
    update: { email },
    create: { supabaseId, email },
  });
}
