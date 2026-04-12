'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/shared/lib/supabase/client';
import { useCurrentUser }    from '../hooks/useCurrentUser';
import { useCurrentDbUser }  from '../hooks/useCurrentDbUser';
import { updateDisplayName } from '../actions/updateDisplayName';
import { useTutorial } from '@/features/tutorial/context/TutorialContext';

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function UserMenu() {
  const { user, isLoading }   = useCurrentUser();
  const { data: dbUser }      = useCurrentDbUser();
  const router                = useRouter();
  const queryClient           = useQueryClient();
  const { restart: restartTutorial } = useTutorial();
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');
  const containerRef          = useRef<HTMLDivElement>(null);

  // Sync input with current displayName whenever popover opens
  useEffect(() => {
    if (open) {
      setNameInput(dbUser?.displayName ?? '');
      setEditing(false);
      setSaveError('');
    }
  }, [open, dbUser?.displayName]);

  // Close on outside click or Escape
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
      await updateDisplayName(nameInput);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'currentDbUser'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'leaderboard'] });
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
  const since      = user.created_at ? formatDate(user.created_at) : '—';
  const displayLabel = dbUser?.displayName ?? email;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:bg-gray-100 px-2 py-1 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initials(email)}
        </span>
        <span className="text-sm text-gray-700 hidden sm:inline max-w-[180px] truncate">{displayLabel}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
            <span className="w-10 h-10 rounded-full bg-gray-800 text-white text-sm font-semibold flex items-center justify-center shrink-0">
              {initials(email)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {dbUser?.displayName ?? email}
              </p>
              {dbUser?.displayName && (
                <p className="text-xs text-gray-400 truncate">{email}</p>
              )}
              <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                role === 'MASTER_ADMIN'
                  ? 'bg-purple-100 text-purple-800'
                  : role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {role === 'MASTER_ADMIN' ? 'Master Admin' : role === 'ADMIN' ? 'Instance Owner' : 'Mitglied'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-4">

            {/* Display name edit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Anzeigename</p>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
                    </svg>
                    Bearbeiten
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
                    placeholder="z. B. FlohmarktKönig"
                    className="w-full border rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="flex-1 bg-gray-900 text-white text-xs rounded py-1.5 font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Speichern…' : 'Speichern'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      className="px-3 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  {dbUser?.displayName ?? <span className="text-gray-400 italic">Noch kein Name gesetzt</span>}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Account-ID</p>
              <p className="text-xs font-mono text-gray-600 break-all">{memberId}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mitglied seit</p>
              <p className="text-sm text-gray-700">{since}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 space-y-2">
            <button
              onClick={() => { setOpen(false); restartTutorial(); }}
              className="w-full text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-lg py-2 font-medium transition-colors"
            >
              Tutorial neu starten
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 rounded-lg py-2 font-medium transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
