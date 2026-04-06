import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';
import { AdminPage } from '@/features/admin';

// Server-side role guard — non-admins are redirected before any client code runs.
export default async function AdminRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { role: true },
  });
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/dashboard/inventory');

  return <AdminPage />;
}
