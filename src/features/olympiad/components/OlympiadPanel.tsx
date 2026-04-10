'use client';

import { useState } from 'react';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import {
  useOlympiads,
  useCreateOlympiad,
  useArchiveOlympiad,
  useReactivateOlympiad,
  useDeleteOlympiad,
} from '../hooks/useOlympiads';
import type { OlympiadRecord } from '../services/olympiadRepository';
import { OlympiadDetail } from './OlympiadDetail';

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Create form ───────────────────────────────────────────────────────────────

function CreateOlympiadForm({ onClose }: { onClose: () => void }) {
  const { mutate, isPending, error } = useCreateOlympiad();
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [starts, setStarts]     = useState('');
  const [ends, setEnds]         = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      { name, description: desc || undefined, startsAt: new Date(starts), endsAt: new Date(ends) },
      { onSuccess: onClose },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="z.B. Sommer 2026" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Beschreibung</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          placeholder="Optional" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Startdatum *</label>
          <input type="date" value={starts} onChange={e => setStarts(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Enddatum *</label>
          <input type="date" value={ends} onChange={e => setEnds(e.target.value)} required min={starts}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{(error as Error).message}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Anlegen…' : 'Anlegen'}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          Abbrechen
        </button>
      </div>
    </form>
  );
}

// ── Olympiad row ──────────────────────────────────────────────────────────────

function OlympiadRow({
  instance,
  isOwner,
  onSelect,
}: {
  instance: OlympiadRecord;
  isOwner: boolean;
  onSelect: () => void;
}) {
  const { mutate: archive,    isPending: archiving    } = useArchiveOlympiad();
  const { mutate: reactivate, isPending: reactivating } = useReactivateOlympiad();
  const { mutate: del,        isPending: deleting     } = useDeleteOlympiad();
  const busy = archiving || reactivating || deleting;

  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={onSelect}>
      <td className="py-3 pl-5 pr-4">
        <p className="text-sm font-medium text-gray-900">{instance.name}</p>
        {instance.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{instance.description}</p>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 whitespace-nowrap">
        {fmt(instance.startsAt)} – {fmt(instance.endsAt)}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 text-center">{instance.memberCount}</td>
      <td className="py-3 pr-4">
        <span className={[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          instance.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500',
        ].join(' ')}>
          {instance.isActive ? 'Aktiv' : 'Archiviert'}
        </span>
      </td>
      <td className="py-3 pr-5">
        {isOwner && (
          <div className="flex items-center gap-3 justify-end" onClick={e => e.stopPropagation()}>
            {instance.isActive ? (
              <button onClick={() => archive(instance.id)} disabled={busy}
                className="text-xs text-gray-400 hover:text-gray-700 underline disabled:opacity-40 transition-colors">
                Archivieren
              </button>
            ) : (
              <button onClick={() => reactivate(instance.id)} disabled={busy}
                className="text-xs text-green-600 hover:text-green-800 underline disabled:opacity-40 transition-colors">
                Reaktivieren
              </button>
            )}
            {instance.memberCount === 0 && (
              <button
                onClick={() => { if (confirm('Olympiade wirklich löschen?')) del(instance.id); }}
                disabled={busy}
                className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-40 transition-colors">
                Löschen
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function OlympiadPanel() {
  const { data: currentUser } = useCurrentDbUser();
  const { data: olympiads, isLoading } = useOlympiads();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected]     = useState<OlympiadRecord | null>(null);

  if (selected) {
    return (
      <OlympiadDetail
        instance={selected}
        isOwner={currentUser?.role === 'MASTER_ADMIN' || (currentUser?.role === 'ADMIN' && selected.createdById === currentUser?.id)}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Olympiaden</h2>
          {olympiads && (
            <p className="text-xs text-gray-500 mt-0.5">
              {olympiads.filter(o => o.isActive).length} aktiv · {olympiads.length} gesamt
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          + Neue Olympiade
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Neue Olympiade anlegen</h3>
          <CreateOlympiadForm onClose={() => setShowCreate(false)} />
        </div>
      )}

      {isLoading && <div className="text-sm text-gray-400 py-8 text-center">Laden…</div>}

      {olympiads && olympiads.length === 0 && (
        <div className="text-sm text-gray-400 py-8 text-center">Noch keine Olympiaden angelegt.</div>
      )}

      {olympiads && olympiads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="text-left py-3 pl-5 pr-4">Name</th>
                <th className="text-left py-3 pr-4">Zeitraum</th>
                <th className="text-center py-3 pr-4">Teilnehmer</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="py-3 pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {olympiads.map((o) => (
                <OlympiadRow
                  key={o.id}
                  instance={o}
                  isOwner={currentUser?.role === 'MASTER_ADMIN' || (currentUser?.role === 'ADMIN' && o.createdById === currentUser?.id)}
                  onSelect={() => setSelected(o)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
