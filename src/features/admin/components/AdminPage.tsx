'use client';

// Admin dashboard — user management.
// ADMIN: sees Olympiaden tab only.
// MASTER_ADMIN: sees Olympiaden + Users (with role/status management).

import { useState } from 'react';
import { useAdminUsers, useSetUserRole, useSetUserActive } from '../hooks/useAdminUsers';
import { useJoinRequests, useResolveJoinRequest, usePendingJoinRequestCount } from '../hooks/useJoinRequests';
import { useInstanceRequests, useResolveInstanceRequest, usePendingInstanceRequestCount } from '../hooks/useInstanceRequests';
import { useInstances, useInstanceOlympiads } from '../hooks/useInstances';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import { useMyMemberships } from '@/features/olympiad/hooks/useOlympiads';
import { useOlympiadMembers, useUpdateOlympiad } from '@/features/olympiad/hooks/useOlympiads';
import type { AdminInstanceRecord } from '../services/AdminRepository';
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
    ADMIN:        'Instance Owner',
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

type AdminTab = 'users' | 'olympiads' | 'requests' | 'instanceRequests' | 'instances';

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
      ['instances', 'Instanzen'] as [AdminTab, string],
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
      {tab === 'instances'        && isMasterAdmin && <InstancesTab />}
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

// ── Instanzen Tab (MASTER_ADMIN) ──────────────────────────────────────────────

function InstancesTab() {
  const { data: instances, isLoading, isError } = useInstances();
  const [selectedInstance, setSelectedInstance] = useState<AdminInstanceRecord | null>(null);

  if (selectedInstance) {
    return <InstanceDetail instance={selectedInstance} onBack={() => setSelectedInstance(null)} />;
  }

  // Group by owner
  const grouped = instances?.reduce<Record<string, { ownerEmail: string; rows: AdminInstanceRecord[] }>>((acc, i) => {
    if (!acc[i.createdById]) acc[i.createdById] = { ownerEmail: i.createdByEmail, rows: [] };
    acc[i.createdById].rows.push(i);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-6">
      {isLoading && <p className="text-sm text-gray-400 py-8 text-center">Lade Instanzen…</p>}
      {isError   && <p className="text-sm text-red-600  py-8 text-center">Fehler beim Laden.</p>}
      {instances?.length === 0 && (
        <p className="text-sm text-gray-400 py-8 text-center">Keine Instanzen vorhanden.</p>
      )}

      {Object.entries(grouped).map(([ownerId, { ownerEmail, rows }]) => (
        <div key={ownerId} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-gray-600">{ownerEmail[0].toUpperCase()}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{ownerEmail}</p>
            <span className="text-xs text-gray-400">· {rows.length} Olympiade{rows.length !== 1 ? 'n' : ''}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedInstance(r)}>
                    <td className="py-3 pl-5 pr-4">
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      {r.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{r.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(r.startsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' – '}
                      {new Date(r.endsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500 text-center">{r.memberCount}</td>
                    <td className="py-3 pr-5">
                      <span className={[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500',
                      ].join(' ')}>
                        {r.isActive ? 'Aktiv' : 'Archiviert'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function InstanceDetail({ instance, onBack }: { instance: AdminInstanceRecord; onBack: () => void }) {
  const { data: olympiads } = useInstanceOlympiads(instance.createdById);
  const { data: members, isLoading: membersLoading } = useOlympiadMembers(instance.id);
  const { mutate: update } = useUpdateOlympiad();

  function save(field: string, value: string) {
    const data: Record<string, string | Date> = {};
    if (field === 'startsAt' || field === 'endsAt') data[field] = new Date(value);
    else data[field] = value;
    update({ id: instance.id, data });
  }

  function fmt(d: Date) { return new Date(d).toISOString().split('T')[0]; }
  function fmtDisplay(d: Date) {
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Alle Instanzen
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{instance.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{fmtDisplay(instance.startsAt)} – {fmtDisplay(instance.endsAt)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Inhaber: <span className="font-medium text-gray-600">{instance.createdByEmail}</span>
          </p>
        </div>
        <span className={[
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
          instance.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500',
        ].join(' ')}>
          {instance.isActive ? 'Aktiv' : 'Archiviert'}
        </span>
      </div>

      {/* Editable settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Basiseinstellungen</p>
        <InstanceEditableField label="Name" value={instance.name} onSave={v => save('name', v)} />
        <InstanceEditableField label="Beschreibung" value={instance.description ?? ''} type="textarea" onSave={v => save('description', v)} />
        <div className="grid grid-cols-2 gap-4">
          <InstanceEditableField label="Startdatum" value={fmt(instance.startsAt)} type="date" onSave={v => save('startsAt', v)} />
          <InstanceEditableField label="Enddatum"   value={fmt(instance.endsAt)}   type="date" onSave={v => save('endsAt',   v)} />
        </div>
      </div>

      {/* Members */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Teilnehmer {members ? `(${members.length})` : ''}
        </p>
        {membersLoading && <p className="text-sm text-gray-400">Laden…</p>}
        {members?.length === 0 && <p className="text-sm text-gray-400">Keine Teilnehmer.</p>}
        {members && members.length > 0 && (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
            {members.map(m => (
              <li key={m.id} className="flex items-center px-4 py-2.5 gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-500">{(m.displayName ?? m.email)[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.displayName ?? m.email}</p>
                  {m.displayName && <p className="text-xs text-gray-400">{m.email}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* All olympiads by this owner */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Alle Olympiaden dieses Inhabers
        </p>
        {olympiads && olympiads.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-2 pl-5 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Zeitraum</th>
                  <th className="text-center py-2 pr-4">Teilnehmer</th>
                  <th className="text-left py-2 pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {olympiads.map(o => (
                  <tr key={o.id} className={o.id === instance.id ? 'bg-blue-50' : ''}>
                    <td className="py-2.5 pl-5 pr-4 text-sm font-medium text-gray-900">
                      {o.name}
                      {o.id === instance.id && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">(diese)</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(o.startsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' – '}
                      {new Date(o.endsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-gray-500 text-center">{o.memberCount}</td>
                    <td className="py-2.5 pr-5">
                      <span className={[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        o.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500',
                      ].join(' ')}>
                        {o.isActive ? 'Aktiv' : 'Archiviert'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InstanceEditableField({
  label, value, type = 'text', onSave,
}: {
  label: string; value: string; type?: 'text' | 'date' | 'textarea'; onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  function save() {
    if (val.trim()) { onSave(val.trim()); setEditing(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
            Bearbeiten
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          {type === 'textarea' ? (
            <textarea value={val} onChange={e => setVal(e.target.value)} rows={2}
              className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none" />
          ) : (
            <input type={type} value={val} onChange={e => setVal(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
          )}
          <button onClick={save} className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">OK</button>
          <button onClick={() => { setVal(value); setEditing(false); }} className="text-xs text-gray-400 hover:text-gray-600 px-1 transition-colors">✕</button>
        </div>
      ) : (
        <p className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">—</span>}</p>
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
