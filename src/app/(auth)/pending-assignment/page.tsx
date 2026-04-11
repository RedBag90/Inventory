import { createClient } from '@/shared/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PendingAssignmentClient } from './PendingAssignmentClient';

export default async function PendingAssignmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  return <PendingAssignmentClient email={user.email!} />;
}
