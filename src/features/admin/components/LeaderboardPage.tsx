'use client';

import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatCurrency } from '@/shared/lib/utils';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-semibold text-gray-500 tabular-nums w-6 text-center inline-block">{rank}</span>;
}

export function LeaderboardPage() {
  const { data: users, isLoading, isError } = useLeaderboard();

  const ranked = users
    ? [...users].sort((a, b) => b.totalProfit - a.totalProfit)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Leaderboard</h1>
        {ranked.length > 0 && (
          <p className="text-sm text-gray-500 mt-0.5">
            {ranked.length} users · ranked by all-time profit
          </p>
        )}
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500 py-8 text-center">Loading…</div>
      )}

      {isError && (
        <div className="text-sm text-red-600 py-8 text-center">Failed to load leaderboard.</div>
      )}

      {ranked.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

          {/* Top-3 podium */}
          <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-200">
            {ranked.slice(0, 3).map((user, i) => (
              <div key={user.id} className={[
                'bg-white px-6 py-5 text-center',
                i === 0 ? 'border-b-4 border-yellow-400' : '',
                i === 1 ? 'border-b-4 border-gray-300' : '',
                i === 2 ? 'border-b-4 border-orange-400' : '',
              ].join(' ')}>
                <div className="text-2xl mb-1">
                  <RankBadge rank={i + 1} />
                </div>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <p className={[
                  'text-lg font-bold mt-1',
                  user.totalProfit > 0 ? 'text-green-700' : user.totalProfit < 0 ? 'text-red-600' : 'text-gray-500',
                ].join(' ')}>
                  {formatCurrency(user.totalProfit)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{user.soldCount} sold</p>
              </div>
            ))}
          </div>

          {/* Full table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pl-5 pr-4 w-12">#</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">User</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Items</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Sold</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-5">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ranked.map((user, i) => (
                  <tr
                    key={user.id}
                    className={[
                      'transition-colors',
                      i < 3 ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <td className="py-3 pl-5 pr-4">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500 text-right">{user.itemCount}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500 text-right">{user.soldCount}</td>
                    <td className={[
                      'py-3 pr-5 text-sm font-semibold text-right',
                      user.totalProfit > 0 ? 'text-green-700' : user.totalProfit < 0 ? 'text-red-600' : 'text-gray-500',
                    ].join(' ')}>
                      {formatCurrency(user.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
