'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import { storePendingEmailInvite } from '@/features/olympiad/actions/olympiadActions';

type Tab = 'login' | 'register';

type Props = {
  instanceId:   string;
  instanceName: string;
  token:        string;
};

export function JoinAuthClient({ instanceId, instanceName, token }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gray-900 px-8 py-8 text-center">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-1">Du wurdest eingeladen zu</p>
          <h1 className="text-lg font-bold text-white leading-tight">{instanceName}</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('login')}
            className={[
              'flex-1 py-3 text-sm font-medium transition-colors',
              tab === 'login'
                ? 'text-gray-900 border-b-2 border-gray-900 -mb-px'
                : 'text-gray-400 hover:text-gray-700',
            ].join(' ')}
          >
            Anmelden
          </button>
          <button
            onClick={() => setTab('register')}
            className={[
              'flex-1 py-3 text-sm font-medium transition-colors',
              tab === 'register'
                ? 'text-gray-900 border-b-2 border-gray-900 -mb-px'
                : 'text-gray-400 hover:text-gray-700',
            ].join(' ')}
          >
            Neu registrieren
          </button>
        </div>

        {/* Form area */}
        <div className="px-8 py-6">
          {tab === 'login' ? (
            <LoginForm token={token} />
          ) : (
            <RegisterForm instanceId={instanceId} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({ token }: { token: string }) {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showForgot, setShowForgot]         = useState(false);
  const [forgotEmail, setForgotEmail]       = useState('');
  const [forgotSent, setForgotSent]         = useState(false);
  const [forgotLoading, setForgotLoading]   = useState(false);
  const [forgotError, setForgotError]       = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // Reload the join page — server will now see the logged-in user, create membership, redirect to dashboard
    router.push(`/join/${token}`);
    router.refresh();
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    setForgotLoading(false);
    if (err) { setForgotError(err.message); } else { setForgotSent(true); }
  }

  if (showForgot) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Passwort zurücksetzen</h2>
          <p className="text-xs text-gray-500 mt-0.5">Wir schicken dir einen Link per E-Mail.</p>
        </div>
        {forgotSent ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              E-Mail gesendet! Bitte prüfe dein Postfach.
            </div>
            <button onClick={() => { setShowForgot(false); setForgotSent(false); }}
              className="w-full border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:border-gray-400 transition-colors">
              Zurück zur Anmeldung
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <input type="email" required autoFocus placeholder="du@beispiel.de"
              value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400" />
            {forgotError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{forgotError}</p>}
            <button type="submit" disabled={forgotLoading}
              className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {forgotLoading ? 'Senden…' : 'Link senden'}
            </button>
            <button type="button" onClick={() => setShowForgot(false)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-1 transition-colors">
              Zurück zur Anmeldung
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">E-Mail</label>
        <input type="email" required autoComplete="email" placeholder="du@beispiel.de"
          value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-700">Passwort</label>
          <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); }}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
            Passwort vergessen?
          </button>
        </div>
        <input type="password" required autoComplete="current-password"
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
        {loading ? 'Anmelden…' : 'Anmelden'}
      </button>
    </form>
  );
}

// ── Register form ─────────────────────────────────────────────────────────────

function RegisterForm({ instanceId }: { instanceId: string }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Store invite by email so membership is created on confirmation (even cross-device)
    await storePendingEmailInvite(email, instanceId);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center space-y-3 py-2">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Prüfe deine E-Mail</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Wir haben einen Bestätigungslink an <strong>{email}</strong> geschickt.
          Nach der Bestätigung bist du direkt in der Olympiade.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">E-Mail</label>
        <input type="email" required autoComplete="email" placeholder="du@beispiel.de"
          value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Passwort</label>
        <input type="password" required minLength={8} autoComplete="new-password"
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <p className="text-xs text-gray-400 mt-1">Mindestens 8 Zeichen</p>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
        {loading ? 'Konto erstellen…' : 'Konto erstellen'}
      </button>
    </form>
  );
}
