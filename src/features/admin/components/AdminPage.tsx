'use client';

// Admin dashboard — user management.
// Only accessible to ADMIN users (enforced at middleware + repository level).

import { useAdminUsers, useSetUserRole, useSetUserActive } from '../hooks/useAdminUsers';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { AdminUserRecord } from '../types/admin.types';

function RoleBadge({ role }: { role: AdminUserRecord['role'] }) {
  return (
    <span className={[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      role === 'ADMIN'
        ? 'bg-purple-100 text-purple-800'
        : 'bg-gray-100 text-gray-600',
    ].join(' ')}>
      {role}
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

export function AdminPage() {
  const { data: users, isLoading, isError } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Admin — Users</h1>
          {users && (
            <p className="text-sm text-gray-500 mt-0.5">
              {users.length} registered · {users.filter(u => u.isActive).length} active
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500 py-8 text-center">Loading users…</div>
      )}

      {isError && (
        <div className="text-sm text-red-600 py-8 text-center">Failed to load users.</div>
      )}

      {users && users.length === 0 && (
        <div className="text-sm text-gray-400 py-8 text-center">No users found.</div>
      )}

      {users && users.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-0 py-3 pr-4 pl-5">User</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Role</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Items</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Sold</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-4">Profit</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 px-5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 pl-5">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Since {formatDate(new Date(user.createdAt))}</p>
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

  return (
    <>
      <button
        onClick={() => setRole({ userId: user.id, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
        disabled={busy}
        className="text-xs text-gray-500 hover:text-gray-800 underline disabled:opacity-40"
      >
        {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
      </button>
      <button
        onClick={() => setActive({ userId: user.id, isActive: !user.isActive })}
        disabled={busy}
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
