'use client';

// Admin dashboard — user management.
// ADMIN: sees Olympiaden tab only.
// MASTER_ADMIN: sees Olympiaden + Users (with role/status management).

import { useState } from 'react';
import { useAdminUsers, useSetUserRole, useSetUserActive } from '../hooks/useAdminUsers';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { AdminUserRecord, UserRole } from '../types/admin.types';
import { OlympiadPanel } from '@/features/olympiad/components/OlympiadPanel';

function RoleBadge({ role }: { role: AdminUserRecord['role'] }) {
  const styles: Record<string, string> = {
    MASTER_ADMIN: 'bg-purple-100 text-purple-800',
    ADMIN:        'bg-amber-100 text-amber-800',
    USER:         'bg-gray-100 text-gray-600',
  };
  const labels: Record<string, string> = {
    MASTER_ADMIN: 'Master Admin',
    ADMIN:        'Admin',
    USER:         'Mitglied',
  };
  return (
    <span className={[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      styles[role] ?? 'bg-gray-100 text-gray-600',
    ].join(' ')}>
      {labels[role] ?? role}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      isActive
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-700',
    ].join(' ')}>
      {isActive ? 'Active' : 'Suspended'}
    </span>
  );
}

type AdminTab = 'users' | 'olympiads';

export function AdminPage() {
  const { data: me } = useCurrentDbUser();
  const isMasterAdmin = me?.role === 'MASTER_ADMIN';
  const [tab, setTab] = useState<AdminTab>('olympiads');

  const tabs: [AdminTab, string][] = isMasterAdmin
    ? [['olympiads', 'Olympiaden'], ['users', 'Users']]
    : [['olympiads', 'Olympiaden']];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(([value, label]) => (
          <button key={value} onClick={() => setTab(value)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === value ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'olympiads' && <OlympiadPanel />}

      {tab === 'users' && isMasterAdmin && <UserManagement />}
    </div>
  );
}

function UserManagement() {
  const { data: users, isLoading, isError } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        {users && (
          <p className="text-sm text-gray-500">
            {users.length} registriert · {users.filter(u => u.isActive).length} aktiv
          </p>
        )}
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500 py-8 text-center">Lade Users…</div>
      )}
      {isError && (
        <div className="text-sm text-red-600 py-8 text-center">Fehler beim Laden.</div>
      )}
      {users && users.length === 0 && (
        <div className="text-sm text-gray-400 py-8 text-center">Keine Users gefunden.</div>
      )}
      {users && users.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-0 py-3 pr-4 pl-5">User</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Rolle</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Items</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Verkauft</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Profit</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-5">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 pl-5">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Seit {formatDate(new Date(user.createdAt))}</p>
                    </td>
                    <td className="py-3 pr-4"><RoleBadge role={user.role} /></td>
                    <td className="py-3 pr-4"><StatusBadge isActive={user.isActive} /></td>
                    <td className="py-3 pr-4 text-sm text-gray-600 text-right">{user.itemCount}</td>
                    <td className="py-3 pr-4 text-sm text-gray-600 text-right">{user.soldCount}</td>
                    <td className={`py-3 pr-4 text-sm font-medium text-right ${
                      user.totalProfit > 0 ? 'text-green-700' : user.totalProfit < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {formatCurrency(user.totalProfit)}
                    </td>
                    <td className="py-3 pr-5">
                      <div className="flex items-center gap-2 justify-end">
                        <RoleToggle user={user} />
                      </div>
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

function RoleToggle({ user }: { user: AdminUserRecord }) {
  const { mutate: setRole,   isPending: roleLoading   } = useSetUserRole();
  const { mutate: setActive, isPending: activeLoading } = useSetUserActive();
  const busy = roleLoading || activeLoading;

  // MASTER_ADMIN cannot be demoted via this UI
  const canChangeRole = user.role !== 'MASTER_ADMIN';
  const nextRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
  const roleLabel = user.role === 'ADMIN' ? 'Demote' : 'Promote';

  return (
    <>
      {canChangeRole && (
        <button
          onClick={() => setRole({ userId: user.id, role: nextRole })}
          disabled={busy}
          className="text-xs text-gray-500 hover:text-gray-800 underline disabled:opacity-40"
        >
          {roleLabel}
        </button>
      )}
      <button
        onClick={() => setActive({ userId: user.id, isActive: !user.isActive })}
        disabled={busy || user.role === 'MASTER_ADMIN'}
        className={[
          'text-xs underline disabled:opacity-40',
          user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800',
        ].join(' ')}
      >
        {user.isActive ? 'Suspend' : 'Reactivate'}
      </button>
    </>
  );
}
