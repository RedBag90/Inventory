'use client';

import { useTranslations } from 'next-intl';
import { useTutorial } from '../context/TutorialContext';

function IconBox() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.375c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 3a6 6 0 0 0 6 6 6 6 0 0 0 6-6M6 3H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h.5M18 3h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4h-.5M12 9v6m0 0H9m3 0h3m-3 3v0a3 3 0 0 1-3 3h6a3 3 0 0 1-3-3v0" />
    </svg>
  );
}

export function WelcomeOverlay() {
  const t = useTranslations('tutorial.welcome');
  const { step, next, skip } = useTutorial();
  if (step !== 'welcome') return null;

  const FEATURES = [
    { icon: <IconBox />,    title: t('feature1Title'), desc: t('feature1Detail') },
    { icon: <IconChart />,  title: t('feature2Title'), desc: t('feature2Detail') },
    { icon: <IconTrophy />, title: t('feature3Title'), desc: t('feature3Detail') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 px-8 py-8 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <h1 className="text-2xl font-bold text-amber-400">{t('appName')}</h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">{t('subtitle')}</p>
        </div>

        {/* Features */}
        <div className="px-8 py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
            {t('whatsInside')}
          </p>
          <div className="space-y-3">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex flex-col gap-2">
          <button
            onClick={next}
            className="w-full btn-primary w-full py-2.5"
          >
            {t('startButton')}
          </button>
          <button
            onClick={skip}
            className="w-full text-slate-400 py-2 text-xs hover:text-slate-600 transition-colors"
          >
            {t('skipButton')}
          </button>
        </div>

      </div>
    </div>
  );
}
