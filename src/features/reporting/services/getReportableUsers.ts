'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

export type ReportableUser = { id: string; email: string };

export async function getReportableUsers(): Promise<ReportableUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: {
      id:   true,
      role: true,
      memberships: { where: { memberRole: 'ADMIN' }, select: { instanceId: true } },
    },
  });
  if (!dbUser) throw new Error('Unauthenticated');

  const isGlobalAdmin   = dbUser.role === 'ADMIN' || dbUser.role === 'MASTER_ADMIN';
  const adminInstanceIds = dbUser.memberships.map(m => m.instanceId);
  if (!isGlobalAdmin && adminInstanceIds.length === 0) throw new Error('Forbidden');

  // MASTER_ADMIN sees all users
  if (dbUser.role === 'MASTER_ADMIN') {
    return prisma.user.findMany({ select: { id: true, email: true }, orderBy: { email: 'asc' } });
  }

  // ADMIN (instance owner): only members of their own instance(s)
  const memberships = await prisma.instanceMembership.findMany({
    where:  { instanceId: { in: adminInstanceIds } },
    select: { userId: true },
  });
  const memberIds = [...new Set(memberships.map(m => m.userId))];

  return prisma.user.findMany({
    where:   { id: { in: memberIds } },
    select:  { id: true, email: true },
    orderBy: { email: 'asc' },
  });
}
