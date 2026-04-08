'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import { useCurrentUser }   from '../hooks/useCurrentUser';
import { useCurrentDbUser } from '../hooks/useCurrentDbUser';

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function UserMenu() {
  const { user, isLoading }    = useCurrentUser();
  const { data: dbUser }       = useCurrentDbUser();
  const router                 = useRouter();
  const [open, setOpen]        = useState(false);
  const containerRef           = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent)  { if (e.key === 'Escape') setOpen(false); }
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown',  onKey);
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('keydown',  onKey);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  if (isLoading || !user) return null;

  const email    = user.email ?? '';
  const role     = dbUser?.role ?? 'USER';
  const memberId = dbUser?.id   ?? user.id;
  const since    = user.created_at ? formatDate(user.created_at) : '—';

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:bg-gray-100 px-2 py-1 transition-colors"
      >
        {/* Avatar */}
        <span className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initials(email)}
        </span>
        <span className="text-sm text-gray-700 hidden sm:inline">{email}</span>
        {/* Chevron */}
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
              <p className="text-sm font-semibold text-gray-900 truncate">{email}</p>
              <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                role === 'ADMIN'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {role === 'ADMIN' ? 'Admin' : 'Mitglied'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
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
          <div className="px-4 pb-4">
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
