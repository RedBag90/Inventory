// Dashboard shell — auth check, user sync (US-008), sidebar (US-028), header with UserMenu (US-029).
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { syncUser } from '@/features/auth/actions/syncUser';
import { Sidebar } from '@/shared/components/Sidebar';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { TutorialShell } from '@/features/tutorial/components/TutorialShell';
import { ActiveOlympiadProvider } from '@/features/olympiad/context/ActiveOlympiadContext';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  // US-008 — ensure the authenticated user exists in the local DB
  // syncUser redirects to /suspended if the account is deactivated
  const syncedUser = await syncUser(user.id, user.email!);

  return (
    <ActiveOlympiadProvider>
    <TutorialShell tutorialCompleted={syncedUser.tutorialCompletedAt !== null}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar role={syncedUser.role} />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header — US-029 */}
          <header className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center justify-end px-6">
            <UserMenu />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </TutorialShell>
    </ActiveOlympiadProvider>
  );
}
