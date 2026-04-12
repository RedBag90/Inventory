'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';

type Stage = 'loading' | 'form' | 'success' | 'invalid';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [stage,    setStage]    = useState<Stage>('loading');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse the hash fragment that Supabase appends after the recovery link is clicked.
  // Format: #access_token=...&refresh_token=...&type=recovery
  useEffect(() => {
    const hash   = window.location.hash.slice(1); // remove leading #
    const params = new URLSearchParams(hash);
    const type   = params.get('type');
    const access  = params.get('access_token');
    const refresh = params.get('refresh_token');

    if (type !== 'recovery' || !access || !refresh) {
      setStage('invalid');
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token: access, refresh_token: refresh })
      .then(({ error }) => {
        if (error) { setStage('invalid'); }
        else       { setStage('form'); }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setStage('success');
    setTimeout(() => router.push('/dashboard/inventory'), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gray-900 px-8 py-8 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Neues Passwort</h1>
          <p className="text-gray-400 text-sm mt-1">Flohmarkt-Olympiade</p>
        </div>

        <div className="px-8 py-6">
          {stage === 'loading' && (
            <p className="text-sm text-gray-400 text-center py-4">Wird geprüft…</p>
          )}

          {stage === 'invalid' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-red-600">
                Dieser Link ist ungültig oder abgelaufen. Bitte fordere eine neue Passwort-Reset-E-Mail an.
              </p>
              <a href="/sign-in" className="block w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium text-center hover:bg-gray-700 transition-colors">
                Zurück zur Anmeldung
              </a>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Passwort gespeichert!</p>
              <p className="text-xs text-gray-400">Du wirst weitergeleitet…</p>
            </div>
          )}

          {stage === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Neues Passwort
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  placeholder="Mindestens 8 Zeichen"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder:text-gray-400"
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Speichern…' : 'Passwort speichern'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
