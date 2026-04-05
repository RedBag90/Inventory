'use client';

// UserMenu — displays the current user's email and a sign-out button.
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function UserMenu() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">{user.email}</span>
      <button
        onClick={handleSignOut}
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
