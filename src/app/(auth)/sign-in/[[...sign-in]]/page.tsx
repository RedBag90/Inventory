'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/client';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title:  'Team anmelden',
    detail: 'Haushalt registrieren und in die Bestenliste einsteigen.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    title:  'Verkaufen & kaufen',
    detail: 'Inserieren, handeln und günstig einkaufen, um weiterzuverkaufen.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title:  'Punkte sammeln',
    detail: 'Jeder Euro Gewinn zählt — live in der Bestenliste.',
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show error from URL params (e.g. expired recovery link → ?error=access_denied)
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search);
    const code = p.get('error_code');
    if (code === 'otp_expired') return 'Der Link ist abgelaufen. Bitte fordere einen neuen an.';
    if (p.get('error')) return 'Der Link ist ungültig. Bitte fordere einen neuen an.';
    return null;
  });

  // Forgot password state
  const [showForgot, setShowForgot]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSent, setForgotSent]     = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    router.push('/dashboard/leaderboard');
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    setForgotLoading(false);
    if (resetError) {
      setForgotError(resetError.message);
    } else {
      setForgotSent(true);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — dark branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between p-12">
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Flohmarkt Olympiade</span>
        </div>

        {/* Headline + sub */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight">
              Der große<br />Kleinanzeigen-<br />Wettbewerb.
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Tritt gegen andere Haushalte an. Wer am meisten aus alten Sachen macht, gewinnt die Goldmedaille.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <div className="mt-0.5 w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-300">
                  {f.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-gray-600">
          Aktuell läuft die Frühjahrssaison 2026.
        </p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-amber-400 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Flohmarkt Olympiade</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Willkommen zurück</h2>
            <p className="mt-1 text-sm text-gray-500">Melde dich an und sieh, wo du in der Rangliste stehst.</p>
          </div>

          {/* ── Forgot password panel ── */}
          {showForgot ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Passwort zurücksetzen</h2>
                <p className="mt-1 text-sm text-gray-500">Wir schicken dir einen Link per E-Mail.</p>
              </div>
              {forgotSent ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                    E-Mail gesendet! Bitte prüfe dein Postfach und klicke auf den Link.
                  </div>
                  <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                    className="w-full border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:border-gray-400 transition-colors">
                    Zurück zur Anmeldung
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
                    <input
                      type="email" required autoFocus
                      placeholder="du@beispiel.de"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
                    />
                  </div>
                  {forgotError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{forgotError}</p>
                  )}
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
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="du@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Passwort
                </label>
                <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Passwort vergessen?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>
          )}

          <p className="text-center text-sm text-gray-500">
            Noch kein Konto?{' '}
            <Link href="/sign-up" className="font-medium text-gray-900 underline underline-offset-2">
              Registrieren
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
