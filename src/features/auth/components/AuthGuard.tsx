// Server-side auth guard — redirects unauthenticated users to /sign-in.
// Used inside (dashboard)/layout.tsx. Middleware handles the primary redirect;
// this is a defence-in-depth fallback for Server Components that need the user.
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  return <>{children}</>;
}
