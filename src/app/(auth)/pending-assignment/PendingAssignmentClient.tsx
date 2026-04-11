'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubmitJoinRequest, useMyJoinRequests } from '@/features/olympiad/hooks/useOlympiads';
import { createClient } from '@/shared/lib/supabase/client';

export function PendingAssignmentClient({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const { mutate: submit, isPending, error, reset } = useSubmitJoinRequest();
  const { data: myRequests } = useMyJoinRequests();

  async function signOut() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push('/sign-in');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setSuccess(null);
    submit(code.trim(), {
      onSuccess: (result) => {
        if (result.autoAccepted) {
          router.push('/dashboard/inventory');
        } else {
          setSuccess(`Anfrage für „${result.instanceName}" gesendet – warte auf Freigabe.`);
          setCode('');
        }
      },
    });
  }

  const pendingRequests = myRequests?.filter(r => r.status === 'PENDING') ?? [];
  const rejectedRequests = myRequests?.filter(r => r.status === 'REJECTED') ?? [];

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
        <div className="px-8 py-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900">Noch nicht zugewiesen</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Du bist noch keiner Olympiade zugewiesen. Gib einen Beitrittscode ein oder warte auf eine Einladung.
            </p>
          </div>

          {/* Code input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Beitrittscode
              </label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); reset(); setSuccess(null); }}
                placeholder="z.B. X7K2-M9QP"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600">{(error as Error).message}</p>
            )}
            {success && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{success}</p>
            )}
            <button
              type="submit"
              disabled={isPending || !code.trim()}
              className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Prüfen…' : 'Beitreten'}
            </button>
          </form>

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Offene Anfragen</p>
              {pendingRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">{r.instanceName}</p>
                  <span className="text-xs text-amber-700 font-medium">Wartend</span>
                </div>
              ))}
            </div>
          )}

          {/* Rejected requests */}
          {rejectedRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Abgelehnte Anfragen</p>
              {rejectedRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">{r.instanceName}</p>
                  <span className="text-xs text-red-600 font-medium">Abgelehnt</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Eingeloggt als <span className="font-medium text-gray-600">{email}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <button
            onClick={signOut}
            className="w-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            Abmelden
          </button>
        </div>

      </div>
    </div>
  );
}
