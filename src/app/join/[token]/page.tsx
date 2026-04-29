import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';
import { joinViaToken } from '@/features/olympiad/actions/olympiadActions';
import { JoinAuthClient } from './JoinAuthClient';

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Validate token first — bail early with a user-friendly error if invalid
  const instance = await prisma.olympiadInstance.findUnique({
    where:  { inviteToken: token },
    select: { id: true, name: true },
  });

  if (!instance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div className="bg-gray-900 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Flohmarkt-Olympiade</h1>
          </div>
          <div className="px-8 py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900">Ungültiger Einladungslink</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Dieser Einladungslink ist nicht mehr gültig oder wurde deaktiviert. Bitte wende dich an den Organisator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser) {
    const { autoAccepted } = await joinViaToken(token);
    redirect(autoAccepted ? '/dashboard/leaderboard' : '/pending-assignment');
  }

  // Not logged in — show branded auth page
  return (
    <JoinAuthClient
      instanceId={instance.id}
      instanceName={instance.name}
      token={token}
    />
  );
}
