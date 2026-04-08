'use client';

import { useLeaderboard } from '../hooks/useLeaderboard';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import { formatCurrency } from '@/shared/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  const parts = name.split(/[@.\s]+/).filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function profitColor(v: number) {
  if (v > 0)  return 'text-emerald-600';
  if (v < 0)  return 'text-red-500';
  return 'text-gray-400';
}

// ── podium card ───────────────────────────────────────────────────────────────

function RankChange({ value }: { value: number | null }) {
  if (value === null) return (
    <span className="inline-flex items-center justify-center text-gray-300 bg-gray-50 border border-gray-100 w-6 h-6 rounded-full text-xs font-medium">
      —
    </span>
  );
  if (value === 0) return (
    <span className="inline-flex items-center justify-center text-gray-400 bg-gray-50 border border-gray-100 w-6 h-6 rounded-full">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" />
      </svg>
    </span>
  );
  return value > 0 ? (
    <span className="inline-flex items-center justify-center text-emerald-700 bg-emerald-50 border border-emerald-100 w-6 h-6 rounded-full">
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center text-red-600 bg-red-50 border border-red-100 w-6 h-6 rounded-full">
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

type Entry = {
  id: string;
  email: string;
  displayName: string | null;
  itemCount: number;
  soldCount: number;
  totalProfit: number;
  rankChange: number | null;
};

const PODIUM_CONFIG = [
  { rank: 2, medal: '🥈', accent: 'bg-slate-100',  border: 'border-slate-300',  size: 'w-10 h-10 text-sm',  order: 'order-first',  mt: 'mt-6'  },
  { rank: 1, medal: '🥇', accent: 'bg-amber-50',   border: 'border-amber-300',  size: 'w-12 h-12 text-base', order: 'order-none',   mt: 'mt-0'  },
  { rank: 3, medal: '🥉', accent: 'bg-orange-50',  border: 'border-orange-300', size: 'w-10 h-10 text-sm',  order: 'order-last',   mt: 'mt-6'  },
] as const;

function PodiumCard({ user, config, isMe }: { user: Entry; config: typeof PODIUM_CONFIG[number]; isMe: boolean }) {
  const label = user.displayName ?? user.email;
  return (
    <div className={[
      'relative flex flex-col items-center gap-2 rounded-2xl border-2 px-5 py-5 text-center transition-shadow hover:shadow-md',
      config.accent, config.border, config.mt,
    ].join(' ')}>
      {isMe && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
          Du
        </span>
      )}
      <span className="text-2xl">{config.medal}</span>
      <div className={[
        'rounded-full bg-gray-800 text-white font-semibold flex items-center justify-center shrink-0',
        config.size,
      ].join(' ')}>
        {initials(label)}
      </div>
      <div className="min-w-0 w-full">
        <p className="text-sm font-semibold text-gray-900 truncate">{label}</p>
        {user.displayName && (
          <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
        )}
      </div>
      <p className={['text-xl font-bold', profitColor(user.totalProfit)].join(' ')}>
        {formatCurrency(user.totalProfit)}
      </p>
      <div className="flex gap-3 text-xs text-gray-400">
        <span>{user.itemCount} Items</span>
        <span>·</span>
        <span>{user.soldCount} verkauft</span>
      </div>
      <RankChange value={user.rankChange} />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const { data: users, isLoading, isError } = useLeaderboard();
  const { data: me } = useCurrentDbUser();

  const ranked = users
    ? [...users].sort((a, b) => b.totalProfit - a.totalProfit)
    : [];

  const top3 = ranked.slice(0, 3);

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rangliste</h1>
          <p className="text-sm text-gray-500 mt-0.5">All-time Gewinn-Ranking · Veränderung seit letztem Sonntag</p>
        </div>
        {ranked.length > 0 && (
          <span className="text-sm text-gray-400 font-medium">
            {ranked.length} Teilnehmer
          </span>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map((i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-100 bg-gray-50 h-48 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-sm text-red-600 py-8 text-center">Rangliste konnte nicht geladen werden.</div>
      )}

      {ranked.length > 0 && (
        <>
          {/* ── Podium ── */}
          <div className="grid grid-cols-3 gap-3 items-end">
            {PODIUM_CONFIG.map((config) => {
              const user = top3[config.rank - 1];
              if (!user) return <div key={config.rank} />;
              return (
                <PodiumCard
                  key={user.id}
                  user={user}
                  config={config}
                  isMe={user.id === me?.id}
                />
              );
            })}
          </div>

          {/* ── Full rankings list ── */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Alle Teilnehmer</p>
            </div>
            <ul className="divide-y divide-gray-100">
              {ranked.map((user, i) => {
                const isMe = user.id === me?.id;
                const label = user.displayName ?? user.email;
                return (
                  <li
                    key={user.id}
                    className={[
                      'flex items-center gap-4 px-5 py-3.5 transition-colors',
                      isMe ? 'bg-amber-50/60' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {/* Rank */}
                    <span className="w-7 shrink-0 text-center">
                      {i === 0 ? <span className="text-lg">🥇</span>
                       : i === 1 ? <span className="text-lg">🥈</span>
                       : i === 2 ? <span className="text-lg">🥉</span>
                       : <span className="text-sm font-semibold text-gray-400 tabular-nums">{i + 1}</span>}
                    </span>

                    {/* Rank change */}
                    <RankChange value={user.rankChange} />

                    {/* Avatar */}
                    <span className="w-8 h-8 rounded-full bg-gray-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {initials(label)}
                    </span>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                        {isMe && (
                          <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            Du
                          </span>
                        )}
                      </div>
                      {user.displayName && (
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400 shrink-0">
                      <span>{user.itemCount} Items</span>
                      <span>{user.soldCount} verkauft</span>
                    </div>

                    {/* Profit */}
                    <span className={['text-sm font-bold tabular-nums shrink-0', profitColor(user.totalProfit)].join(' ')}>
                      {formatCurrency(user.totalProfit)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {!isLoading && ranked.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-16">Noch keine Einträge.</div>
      )}
    </div>
  );
}
