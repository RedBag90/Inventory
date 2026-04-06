'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/client';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
      </svg>
    ),
    title:  'Inventar verwalten',
    detail: 'Artikel erfassen, Einkaufspreise und Kosten tracken.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title:  'Verkäufe dokumentieren',
    detail: 'Plattform, Verkaufspreis und Versandkosten festhalten.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title:  'Gewinn analysieren',
    detail: 'Dashboard und Rangliste zeigen deinen Fortschritt.',
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — dark branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between p-12">
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Inventory</span>
        </div>

        {/* Headline + sub */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight">
              Mehr Übersicht.<br />Mehr Gewinn.
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Tracke deine Einkäufe, Verkäufe und Gewinne — alles an einem Ort.
              Sieh auf der Rangliste, wer am meisten herausholt.
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
          Jeder Euro Gewinn zählt — live in der Rangliste.
        </p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Inventory</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Willkommen zurück</h2>
            <p className="mt-1 text-sm text-gray-500">Melde dich an und sieh, wo du in der Rangliste stehst.</p>
          </div>

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

          <p className="text-center text-sm text-gray-500">
            Noch kein Konto?{' '}
            <Link href="/sign-up" className="font-medium text-gray-900 underline underline-offset-2">
              Registrieren
            </Link>
          </p>

          {/* Test accounts */}
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-1.5 text-xs text-gray-500">
            <p className="font-semibold text-gray-600 mb-2">Test-Zugänge</p>
            <div><span className="font-medium text-gray-700">Admin:</span> admin@test.com / Admin1234!</div>
            <div><span className="font-medium text-gray-700">User 1:</span> user@test.com / User1234!</div>
            <div><span className="font-medium text-gray-700">User 2:</span> user2@test.com / User1234!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
