'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/lib/supabase/client';
import { useCurrentUser }    from '../hooks/useCurrentUser';
import { useCurrentDbUser }  from '../hooks/useCurrentDbUser';
import { updateDisplayName } from '../actions/updateDisplayName';
import { useTutorial } from '@/features/tutorial/context/TutorialContext';
import { useLocale, useSetLocale } from '@/shared/hooks/useLocale';
import { toast } from 'sonner';
import { useMyBadgeCount } from '@/features/badges/hooks/useBadges';
import { badgeKeys } from '@/features/badges/hooks/badgeKeys';
import { BadgeToast } from '@/features/badges/components/BadgeToast';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function UserMenu() {
  const t = useTranslations('userMenu');
  const tc = useTranslations('common');
  const locale = useLocale();
  const setLocale = useSetLocale();
  const { user, isLoading }   = useCurrentUser();
  const { data: dbUser }      = useCurrentDbUser();
  const { data: badgeCount }  = useMyBadgeCount();
  const router                = useRouter();
  const queryClient           = useQueryClient();
  const { restart: restartTutorial } = useTutorial();
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');
  const containerRef          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setNameInput(dbUser?.displayName ?? '');
      setEditing(false);
      setSaveError('');
    }
  }, [open, dbUser?.displayName]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent)   { if (e.key === 'Escape') setOpen(false); }
    function onOutside(e: MouseEvent)  {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown',   onKey);
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('keydown',   onKey);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [open]);

  async function handleSaveName() {
    setSaving(true);
    setSaveError('');
    try {
      const { newBadges } = await updateDisplayName(nameInput);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'currentDbUser'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'leaderboard'] });
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: badgeKeys.all });
        for (const badge of newBadges as AwardedBadge[]) {
          toast.custom(() => <BadgeToast badge={badge} />, { duration: 6000 });
        }
      }
      setEditing(false);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  if (isLoading || !user) return null;

  const email      = user.email ?? '';
  const role       = dbUser?.role ?? 'USER';
  const memberId   = dbUser?.id   ?? user.id;
  const since      = user.created_at ? formatDate(user.created_at, locale) : '—';
  const displayLabel = dbUser?.displayName ?? email;

  const roleLabel =
    role === 'MASTER_ADMIN' ? t('roleMasterAdmin') :
    role === 'ADMIN'        ? t('roleInstanceOwner') :
                              t('roleMember');

  return (
    <div ref={containerRef} className="relative">
      <button
        data-tutorial="user-menu-button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:bg-slate-100 px-2 py-1 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initials(email)}
        </span>
        <span className="text-sm text-slate-700 hidden sm:inline max-w-[180px] truncate">{displayLabel}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-100 z-50 overflow-hidden">

          <div className="flex items-center gap-3 p-4 bg-slate-50 border-b border-slate-200">
            <span className="w-10 h-10 rounded-full bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center shrink-0">
              {initials(email)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {dbUser?.displayName ?? email}
              </p>
              {dbUser?.displayName && (
                <p className="text-xs text-slate-400 truncate">{email}</p>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                  role === 'MASTER_ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {roleLabel}
                </span>
                {badgeCount != null && badgeCount > 0 && (
                  <Link
                    href="/dashboard/badges"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    🏅 {badgeCount}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t('displayName')}</p>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
                    </svg>
                    {tc('edit')}
                  </button>
                )}
              </div>
              {editing ? (
                <div className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false); }}
                    maxLength={50}
                    placeholder={t('namePlaceholder')}
                    className="input-base"
                  />
                  {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="btn-primary flex-1 text-xs py-1.5"
                    >
                      {saving ? tc('saving') : tc('save')}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      className="btn-ghost text-xs px-3"
                    >
                      {tc('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-700">
                  {dbUser?.displayName ?? <span className="text-slate-400 italic">{t('noName')}</span>}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{t('accountId')}</p>
              <p className="text-xs font-mono text-slate-600 break-all">{memberId}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{t('memberSince')}</p>
              <p className="text-sm text-slate-700">{since}</p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400 mb-2">{t('language')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocale('de')}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    locale === 'de' ? 'bg-indigo-600 text-white' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🇩🇪 Deutsch
                </button>
                <button
                  onClick={() => setLocale('en')}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    locale === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 space-y-2">
            {role === 'USER' && (
              <Link
                href="/pending-assignment"
                onClick={() => setOpen(false)}
                className="block w-full text-center text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg py-2 font-medium transition-colors"
              >
                {t('becomeOrganizer')}
              </Link>
            )}
            <button
              onClick={() => { setOpen(false); restartTutorial(); }}
              className="w-full text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 rounded-lg py-2 font-medium transition-colors"
            >
              {t('restartTutorial')}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 rounded-lg py-2 font-medium transition-colors"
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
