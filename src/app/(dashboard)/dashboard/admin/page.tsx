import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';
import { AdminPage } from '@/features/admin';

export const dynamic = 'force-dynamic';

// Server-side role guard — non-admins are redirected before any client code runs.
export default async function AdminRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: {
      role:        true,
      memberships: { select: { memberRole: true }, take: 1, where: { memberRole: 'ADMIN' } },
    },
  });
  const role           = dbUser?.role as string | undefined;
  const isGlobalAdmin  = role === 'ADMIN' || role === 'MASTER_ADMIN';
  const isInstanceAdmin = (dbUser?.memberships.length ?? 0) > 0;
  if (!isGlobalAdmin && !isInstanceAdmin) redirect('/dashboard/inventory');

  return <AdminPage />;
}
