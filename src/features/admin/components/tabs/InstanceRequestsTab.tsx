'use client';

import { useState } from 'react';
import { useInstanceRequests, useResolveInstanceRequest } from '../../hooks/useInstanceRequests';
import { formatDate } from '@/shared/lib/utils';
import type { InstanceRequestRecord } from '../../services/AdminRepository';

export function InstanceRequestsTab() {
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
              filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}>
            {f === 'PENDING' ? 'Offen' : 'Alle'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-400 py-6 text-center">Lade Anfragen…</p>}
      {isError   && <p className="text-sm text-red-600  py-6 text-center">Fehler beim Laden.</p>}
      {requests && requests.length === 0 && (
        <p className="text-sm text-slate-400 py-6 text-center">
          {filter === 'PENDING' ? 'Keine offenen Anfragen.' : 'Keine Anfragen vorhanden.'}
        </p>
      )}

      {requests && requests.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
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
    APPROVED: 'bg-green-50 text-emerald-600',
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
          <p className="text-sm font-medium text-slate-900 truncate">{request.userEmail}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Instanz: <strong>{request.instanceName}</strong> · {formatDate(new Date(request.createdAt))}
          </p>
          {request.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{request.description}</p>
          )}
        </div>
        <span className={[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
          statusStyles[request.status] ?? 'bg-slate-100 text-slate-500',
        ].join(' ')}>
          {statusLabels[request.status] ?? request.status}
        </span>
        {request.status === 'PENDING' && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onResolve('APPROVED')} disabled={busy}
              className="btn-primary btn-sm">
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
