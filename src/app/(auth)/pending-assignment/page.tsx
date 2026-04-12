import { createClient } from '@/shared/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/shared/lib/prisma';
import { PendingAssignmentClient } from './PendingAssignmentClient';

export default async function PendingAssignmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // Check for a pending email invite — created when the user registered via an invite link.
  // This handles the case where the confirmation email redirects to a different deployment
  // (e.g. main branch) that may not have processed the PendingEmailInvite in syncUser.
  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, email: true },
  });

  if (dbUser) {
    const pendingInvite = await prisma.pendingEmailInvite.findFirst({
      where: { email: dbUser.email },
    });

    if (pendingInvite) {
      await prisma.instanceMembership.upsert({
        where:  { userId_instanceId: { userId: dbUser.id, instanceId: pendingInvite.instanceId } },
        update: {},
        create: { userId: dbUser.id, instanceId: pendingInvite.instanceId },
      });
      await prisma.pendingEmailInvite.deleteMany({ where: { email: dbUser.email } });
      redirect('/dashboard/leaderboard');
    }
  }

  return <PendingAssignmentClient email={user.email!} />;
}
