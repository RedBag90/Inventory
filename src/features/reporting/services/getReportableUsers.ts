'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

export type ReportableUser = { id: string; email: string };

export async function getReportableUsers(): Promise<ReportableUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } });
  if (!dbUser || dbUser.role !== 'ADMIN') throw new Error('Forbidden');

  return prisma.user.findMany({ select: { id: true, email: true }, orderBy: { email: 'asc' } });
}
