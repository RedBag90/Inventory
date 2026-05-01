'use client';

import { useState } from 'react';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import {
  useOlympiads,
  useCreateOlympiad,
  useArchiveOlympiad,
  useReactivateOlympiad,
  useDeleteOlympiad,
  useMyMemberships,
} from '../hooks/useOlympiads';
import type { OlympiadRecord } from '../services/olympiadRepository';
import { OlympiadDetail } from './OlympiadDetail';

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

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
        <label className="label-base">Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} required
          className="input-base"
          placeholder="z.B. Sommer 2026" />
      </div>
      <div>
        <label className="label-base">Beschreibung</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
          className="input-base resize-none"
          placeholder="Optional" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-base">Startdatum *</label>
          <input type="date" value={starts} onChange={e => setStarts(e.target.value)} required
            className="input-base" />
        </div>
        <div>
          <label className="label-base">Enddatum *</label>
          <input type="date" value={ends} onChange={e => setEnds(e.target.value)} required min={starts}
            className="input-base" />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{(error as Error).message}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="btn-primary flex-1">
          {isPending ? 'Anlegen…' : 'Anlegen'}
        </button>
        <button type="button" onClick={onClose}
          className="btn-ghost">
          Abbrechen
        </button>
      </div>
    </form>
  );
}

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
  const { mutate: del,        isPending: deleting,    error: deleteError } = useDeleteOlympiad();
  const busy = archiving || reactivating || deleting;

  return (
    <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={onSelect}>
      <td className="py-3 pl-5 pr-4">
        <p className="text-sm font-medium text-slate-900">{instance.name}</p>
        {instance.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{instance.description}</p>
        )}
        <p className="text-xs text-slate-400 mt-0.5">{instance.createdByEmail}</p>
      </td>
      <td className="py-3 pr-4 text-sm text-slate-500 whitespace-nowrap">
        {fmt(instance.startsAt)} – {fmt(instance.endsAt)}
      </td>
      <td className="py-3 pr-4 text-sm text-slate-500 text-center">{instance.memberCount}</td>
      <td className="py-3 pr-4">
        <span className={[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          instance.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500',
        ].join(' ')}>
          {instance.isActive ? 'Aktiv' : 'Archiviert'}
        </span>
      </td>
      <td className="py-3 pr-5">
        {isOwner && (
          <div className="flex items-center gap-3 justify-end" onClick={e => e.stopPropagation()}>
            {instance.isActive ? (
              <button onClick={() => archive(instance.id)} disabled={busy}
                className="text-xs text-slate-400 hover:text-slate-700 underline disabled:opacity-40 transition-colors">
                Archivieren
              </button>
            ) : (
              <button onClick={() => reactivate(instance.id)} disabled={busy}
                className="text-xs text-emerald-600 hover:text-emerald-800 underline disabled:opacity-40 transition-colors">
                Reaktivieren
              </button>
            )}
            {instance.memberCount === 0 && (
              <div className="flex flex-col items-end gap-0.5">
                <button
                  onClick={() => { if (confirm('Olympiade wirklich löschen?')) del(instance.id); }}
                  disabled={busy}
                  className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-40 transition-colors">
                  Löschen
                </button>
                {deleteError && (
                  <p className="text-xs text-red-600">{(deleteError as Error).message}</p>
                )}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

export function OlympiadPanel() {
  const { data: currentUser } = useCurrentDbUser();
  const { data: myMemberships = [] } = useMyMemberships();
  const { data: olympiads, isLoading } = useOlympiads();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? (olympiads?.find(o => o.id === selectedId) ?? null) : null;

  const isOwnerOf = (o: { id: string; createdById: string }) =>
    currentUser?.role === 'MASTER_ADMIN' ||
    o.createdById === currentUser?.id ||
    myMemberships.some(m => m.instanceId === o.id && m.memberRole === 'ADMIN');

  if (selected) {
    return (
      <OlympiadDetail
        instance={selected}
        isOwner={isOwnerOf(selected)}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Olympiaden</h2>
          {olympiads && (
            <p className="text-xs text-slate-500 mt-0.5">
              {olympiads.filter(o => o.isActive).length} aktiv · {olympiads.length} gesamt
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary">
          + Neue Olympiade
        </button>
      </div>

      {showCreate && (
        <div className="card-section">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Neue Olympiade anlegen</h3>
          <CreateOlympiadForm onClose={() => setShowCreate(false)} />
        </div>
      )}

      {isLoading && <div className="text-sm text-slate-400 py-8 text-center">Laden…</div>}

      {olympiads && olympiads.length === 0 && (
        <div className="text-sm text-slate-400 py-8 text-center">Noch keine Olympiaden angelegt.</div>
      )}

      {olympiads && olympiads.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="text-left py-3 pl-5 pr-4">Name</th>
                <th className="text-left py-3 pr-4">Zeitraum</th>
                <th className="text-center py-3 pr-4">Teilnehmer</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="py-3 pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {olympiads.map((o) => (
                <OlympiadRow
                  key={o.id}
                  instance={o}
                  isOwner={isOwnerOf(o)}
                  onSelect={() => setSelectedId(o.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
