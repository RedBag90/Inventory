import { createClient } from '@/shared/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PendingAssignmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  async function signOut() {
    'use server';
    const sb = await createClient();
    await sb.auth.signOut();
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gray-900 px-8 py-8 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Flohmarkt-Olympiade</h1>
        </div>

        {/* Content */}
        <div className="px-8 py-8 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Noch nicht zugewiesen</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Du wurdest noch keiner Olympiade zugewiesen. Warte auf eine Einladung vom Organisator oder nutze einen Einladungslink.
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Eingeloggt als <span className="font-medium text-gray-600">{user.email}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              Abmelden
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
