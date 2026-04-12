'use client';

// Admin dashboard — user management.
// ADMIN: sees Olympiaden tab only.
// MASTER_ADMIN: sees Olympiaden + Users (with role/status management).

import { useState } from 'react';
import { useAdminUsers, useSetUserRole, useSetUserActive } from '../hooks/useAdminUsers';
import { useJoinRequests, useResolveJoinRequest, usePendingJoinRequestCount } from '../hooks/useJoinRequests';
import { useInstanceRequests, useResolveInstanceRequest, usePendingInstanceRequestCount } from '../hooks/useInstanceRequests';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import { useMyMemberships } from '@/features/olympiad/hooks/useOlympiads';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { AdminUserRecord, UserRole } from '../types/admin.types';
import type { JoinRequestRecord, InstanceRequestRecord } from '../services/AdminRepository';
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

type AdminTab = 'users' | 'olympiads' | 'requests' | 'instanceRequests';

export function AdminPage() {
  const { data: me } = useCurrentDbUser();
  const { data: memberships = [] } = useMyMemberships();
  const isMasterAdmin   = me?.role === 'MASTER_ADMIN';
  const isInstanceAdmin = memberships.some(m => m.memberRole === 'ADMIN');
  const [tab, setTab] = useState<AdminTab>('olympiads');
  const { data: pendingCount } = usePendingJoinRequestCount();
  const { data: pendingInstanceCount } = usePendingInstanceRequestCount(isMasterAdmin);

  const tabs: [AdminTab, string, number?][] = [
    ['olympiads', 'Olympiaden'],
    ['requests',  'Anfragen', pendingCount ?? 0],
    ...(isMasterAdmin ? [
      ['instanceRequests', 'Instanz-Anfragen', pendingInstanceCount ?? 0] as [AdminTab, string, number],
    ] : []),
    ...((isMasterAdmin || isInstanceAdmin) ? [
      ['users', 'Nutzer'] as [AdminTab, string],
    ] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(([value, label, count]) => (
          <button key={value} onClick={() => setTab(value)}
            className={[
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === value ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}>
            {label}
            {count != null && count > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'olympiads'        && <OlympiadPanel />}
      {tab === 'requests'         && <JoinRequestsTab />}
      {tab === 'instanceRequests' && isMasterAdmin && <InstanceRequestsTab />}
      {tab === 'users'            && (isMasterAdmin || isInstanceAdmin) && <UserManagement />}
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

// ── Join Requests Tab ─────────────────────────────────────────────────────────

function JoinRequestsTab() {
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const { data: requests, isLoading, isError } = useJoinRequests(filter);
  const { mutate: resolve, isPending: resolving, variables } = useResolveJoinRequest();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['PENDING', 'ALL'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}>
              {f === 'PENDING' ? 'Offen' : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-400 py-6 text-center">Lade Anfragen…</p>}
      {isError   && <p className="text-sm text-red-600  py-6 text-center">Fehler beim Laden.</p>}
      {requests && requests.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">
          {filter === 'PENDING' ? 'Keine offenen Anfragen.' : 'Keine Anfragen vorhanden.'}
        </p>
      )}

      {requests && requests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {requests.map((r) => (
            <JoinRequestRow
              key={r.id}
              request={r}
              onResolve={(decision) => resolve({ requestId: r.id, decision })}
              busy={resolving && variables?.requestId === r.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JoinRequestRow({
  request,
  onResolve,
  busy,
}: {
  request: JoinRequestRecord;
  onResolve: (decision: 'ACCEPTED' | 'REJECTED') => void;
  busy: boolean;
}) {
  const statusStyles: Record<string, string> = {
    PENDING:  'bg-amber-50 text-amber-700',
    ACCEPTED: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-600',
  };
  const statusLabels: Record<string, string> = {
    PENDING:  'Wartend',
    ACCEPTED: 'Akzeptiert',
    REJECTED: 'Abgelehnt',
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{request.userEmail}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {request.instanceName} · {formatDate(new Date(request.createdAt))}
        </p>
      </div>
      <span className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
        statusStyles[request.status] ?? 'bg-gray-100 text-gray-500',
      ].join(' ')}>
        {statusLabels[request.status] ?? request.status}
      </span>
      {request.status === 'PENDING' && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onResolve('ACCEPTED')}
            disabled={busy}
            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {busy ? '…' : 'Annehmen'}
          </button>
          <button
            onClick={() => onResolve('REJECTED')}
            disabled={busy}
            className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Ablehnen
          </button>
        </div>
      )}
    </div>
  );
}

// ── Instance Requests Tab ─────────────────────────────────────────────────────

function InstanceRequestsTab() {
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const { data: requests, isLoading, isError } = useInstanceRequests(filter);
  const { mutate: resolve, isPending: resolving, variables } = useResolveInstanceRequest();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['PENDING', 'ALL'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}>
            {f === 'PENDING' ? 'Offen' : 'Alle'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-gray-400 py-6 text-center">Lade Anfragen…</p>}
      {isError   && <p className="text-sm text-red-600  py-6 text-center">Fehler beim Laden.</p>}
      {requests && requests.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">
          {filter === 'PENDING' ? 'Keine offenen Anfragen.' : 'Keine Anfragen vorhanden.'}
        </p>
      )}

      {requests && requests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {requests.map((r) => (
            <InstanceRequestRow
              key={r.id}
              request={r}
              onResolve={(decision) => resolve({ requestId: r.id, decision })}
              busy={resolving && variables?.requestId === r.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InstanceRequestRow({
  request,
  onResolve,
  busy,
}: {
  request: InstanceRequestRecord;
  onResolve: (decision: 'APPROVED' | 'REJECTED') => void;
  busy: boolean;
}) {
  const statusStyles: Record<string, string> = {
    PENDING:  'bg-amber-50 text-amber-700',
    APPROVED: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-600',
  };
  const statusLabels: Record<string, string> = {
    PENDING:  'Wartend',
    APPROVED: 'Genehmigt',
    REJECTED: 'Abgelehnt',
  };

  return (
    <div className="px-4 py-3 space-y-1">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{request.userEmail}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Instanz: <strong>{request.instanceName}</strong> · {formatDate(new Date(request.createdAt))}
          </p>
          {request.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{request.description}</p>
          )}
        </div>
        <span className={[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
          statusStyles[request.status] ?? 'bg-gray-100 text-gray-500',
        ].join(' ')}>
          {statusLabels[request.status] ?? request.status}
        </span>
        {request.status === 'PENDING' && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onResolve('APPROVED')} disabled={busy}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {busy ? '…' : 'Genehmigen'}
            </button>
            <button onClick={() => onResolve('REJECTED')} disabled={busy}
              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors">
              Ablehnen
            </button>
          </div>
        )}
      </div>
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
