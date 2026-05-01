'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/lib/supabase/client';

export default function SignInPage() {
  const t = useTranslations('auth.signIn');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search);
    const code = p.get('error_code');
    if (code === 'otp_expired') return t('errorOtpExpired');
    if (p.get('error')) return t('errorInvalidLink');
    return null;
  });

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

    window.location.href = '/dashboard/leaderboard';
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

  const FEATURES = [
    { title: t('feature1Title'), detail: t('feature1Detail') },
    { title: t('feature2Title'), detail: t('feature2Detail') },
    { title: t('feature3Title'), detail: t('feature3Detail') },
  ];

  const FEATURE_ICONS = [
    <svg key="team" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>,
    <svg key="sell" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>,
    <svg key="points" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — dark indigo branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-950 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">{t('appName')}</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight whitespace-pre-line">
              {t('heroHeadline')}
            </h1>
            <p className="text-indigo-300 text-base leading-relaxed max-w-xs">
              {t('heroSubtitle')}
            </p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map((f, i) => (
              <li key={f.title} className="flex items-start gap-4">
                <div className="mt-0.5 w-9 h-9 rounded-lg bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-300">
                  {FEATURE_ICONS[i]}
                </div>
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-indigo-400 text-sm mt-0.5">{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-indigo-700">{t('season')}</p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-amber-400 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">{t('appName')}</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('title')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
          </div>

          {showForgot ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('resetTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('resetSubtitle')}</p>
              </div>
              {forgotSent ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
                    {t('resetSent')}
                  </div>
                  <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                    className="btn-secondary w-full py-2.5">
                    {t('resetBackToLogin')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="label-base">{t('email')}</label>
                    <input
                      type="email" required autoFocus
                      placeholder={t('emailPlaceholder')}
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="input-base py-2.5"
                    />
                  </div>
                  {forgotError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{forgotError}</p>
                  )}
                  <button type="submit" disabled={forgotLoading}
                    className="btn-primary w-full py-2.5">
                    {forgotLoading ? t('resetSubmitting') : t('resetSubmit')}
                  </button>
                  <button type="button" onClick={() => setShowForgot(false)}
                    className="w-full text-sm text-slate-400 hover:text-slate-600 py-1 transition-colors">
                    {t('resetBackToLogin')}
                  </button>
                </form>
              )}
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label-base">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base py-2.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  {t('password')}
                </label>
                <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                  {t('forgotPassword')}
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base py-2.5"
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
              className="btn-primary w-full py-2.5"
            >
              {isLoading ? t('submitting') : t('submit')}
            </button>
          </form>
          )}

          <p className="text-center text-sm text-slate-500">
            {t('noAccount')}{' '}
            <Link href="/sign-up" className="font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
              {t('register')}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
