'use client';

import { useState, useEffect } from 'react';
import { useInstances, useInstanceOlympiads, useTransferOlympiadOwner } from '../../hooks/useInstances';
import { useOlympiadMembers, useUpdateOlympiad } from '@/features/olympiad/hooks/useOlympiads';
import type { AdminInstanceRecord } from '../../services/AdminRepository';

export function InstancesTab() {
  const { data: instances, isLoading, isError, refetch } = useInstances();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Use live-derived instance so it reflects refetch results after mutations
  const selectedInstance = selectedId
    ? (instances?.find(i => i.id === selectedId) ?? null)
    : null;

  if (selectedId) {
    if (!selectedInstance) return null;
    return <InstanceDetail instance={selectedInstance} onBack={() => setSelectedId(null)} />;
  }

  const grouped = instances?.reduce<Record<string, { ownerEmail: string; rows: AdminInstanceRecord[] }>>((acc, i) => {
    if (!acc[i.createdById]) acc[i.createdById] = { ownerEmail: i.createdByEmail, rows: [] };
    acc[i.createdById].rows.push(i);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-6">
      {isLoading && <p className="text-sm text-slate-400 py-8 text-center">Lade Instanzen…</p>}
      {isError   && (
        <div className="py-8 text-center space-y-2">
          <p className="text-sm text-red-600">Fehler beim Laden.</p>
          <button onClick={() => refetch()} className="text-xs text-slate-500 underline hover:text-slate-800">Erneut versuchen</button>
        </div>
      )}
      {instances?.length === 0 && (
        <p className="text-sm text-slate-400 py-8 text-center">Keine Instanzen vorhanden.</p>
      )}

      {Object.entries(grouped).map(([ownerId, { ownerEmail, rows }]) => (
        <div key={ownerId} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-slate-600">{ownerEmail[0].toUpperCase()}</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{ownerEmail}</p>
            <span className="text-xs text-slate-400">· {rows.length} Olympiade{rows.length !== 1 ? 'n' : ''}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-slate-100">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedId(r.id)}>
                    <td className="py-3 pl-5 pr-4">
                      <p className="text-sm font-medium text-slate-900">{r.name}</p>
                      {r.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{r.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(r.startsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' – '}
                      {new Date(r.endsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-500 text-center">{r.memberCount}</td>
                    <td className="py-3 pr-5">
                      <span className={[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500',
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
  const { mutate: update, error: updateError, reset: resetError } = useUpdateOlympiad();
  const { mutate: transfer, isPending: transferring, error: transferError, reset: resetTransfer } = useTransferOlympiadOwner();
  const [transferEmail, setTransferEmail] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [digestEnabled, setDigestEnabled] = useState(instance.weeklyDigestEnabled);
  const [digestToast, setDigestToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setDigestToast(msg);
    setTimeout(() => setDigestToast(null), 2500);
  }

  function toggleDigest() {
    const next = !digestEnabled;
    setDigestEnabled(next);
    update({ id: instance.id, data: { weeklyDigestEnabled: next } }, {
      onSuccess: () => showToast(next ? 'Digest aktiviert' : 'Digest deaktiviert'),
      onError:   () => setDigestEnabled(!next),
    });
  }

  function save(field: string, value: string) {
    resetError();
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
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Alle Instanzen
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{instance.name}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{fmtDisplay(instance.startsAt)} – {fmtDisplay(instance.endsAt)}</p>
          <p className="text-xs text-slate-400 mt-1">
            Inhaber: <span className="font-medium text-slate-600">{instance.createdByEmail}</span>
          </p>
        </div>
        <span className={[
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
          instance.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500',
        ].join(' ')}>
          {instance.isActive ? 'Aktiv' : 'Archiviert'}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Basiseinstellungen</p>
        <InstanceEditableField label="Name" value={instance.name} onSave={v => save('name', v)} />
        <InstanceEditableField label="Beschreibung" value={instance.description ?? ''} type="textarea" onSave={v => save('description', v)} />
        <div className="grid grid-cols-2 gap-4">
          <InstanceEditableField label="Startdatum" value={fmt(instance.startsAt)} type="date" onSave={v => save('startsAt', v)} />
          <InstanceEditableField label="Enddatum"   value={fmt(instance.endsAt)}   type="date" onSave={v => save('endsAt',   v)} />
          {updateError && (
            <p className="col-span-2 text-xs text-red-600">{(updateError as Error).message}</p>
          )}
        </div>
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Wöchentlicher Leaderboard-Digest</p>
              <p className="text-xs text-slate-400 mt-0.5">Jeden Sonntag erhalten alle Teilnehmer eine Ranglisten-E-Mail.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {digestToast && (
                <span className="text-xs text-emerald-600 font-medium animate-fade-in">{digestToast}</span>
              )}
              <button
                role="switch"
                aria-checked={digestEnabled}
                onClick={toggleDigest}
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  digestEnabled ? 'bg-indigo-600' : 'bg-slate-200',
                ].join(' ')}
              >
                <span className={[
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                  digestEnabled ? 'translate-x-6' : 'translate-x-1',
                ].join(' ')} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Teilnehmer {members ? `(${members.length})` : ''}
        </p>
        {membersLoading && <p className="text-sm text-slate-400">Laden…</p>}
        {members?.length === 0 && <p className="text-sm text-slate-400">Keine Teilnehmer.</p>}
        {members && members.length > 0 && (
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {members.map(m => (
              <li key={m.id} className="flex items-center px-4 py-2.5 gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-500">{(m.displayName ?? m.email)[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900">{m.displayName ?? m.email}</p>
                    {m.digestOptOut && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 shrink-0">
                        Digest abgemeldet
                      </span>
                    )}
                  </div>
                  {m.displayName && <p className="text-xs text-slate-400">{m.email}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Instanz übertragen</p>
        {transferSuccess ? (
          <p className="text-sm text-emerald-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            Instanz erfolgreich übertragen.
          </p>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              resetTransfer();
              setTransferSuccess(false);
              transfer({ instanceId: instance.id, newOwnerEmail: transferEmail.trim() }, {
                onSuccess: () => { setTransferSuccess(true); setTransferEmail(''); },
              });
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              value={transferEmail}
              onChange={e => { setTransferEmail(e.target.value); resetTransfer(); setTransferSuccess(false); }}
              placeholder="Neue Inhaber-E-Mail"
              required
              className="input-base flex-1"
            />
            <button type="submit" disabled={transferring || !transferEmail.trim()}
              className="btn-primary">
              {transferring ? '…' : 'Übertragen'}
            </button>
          </form>
        )}
        {transferError && (
          <p className="text-xs text-red-600">{(transferError as Error).message}</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Alle Olympiaden dieses Inhabers
        </p>
        {olympiads && olympiads.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="text-left py-2 pl-5 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Zeitraum</th>
                  <th className="text-center py-2 pr-4">Teilnehmer</th>
                  <th className="text-left py-2 pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {olympiads.map(o => (
                  <tr key={o.id} className={o.id === instance.id ? 'bg-blue-50' : ''}>
                    <td className="py-2.5 pl-5 pr-4 text-sm font-medium text-slate-900">
                      {o.name}
                      {o.id === instance.id && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">(diese)</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(o.startsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' – '}
                      {new Date(o.endsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-slate-500 text-center">{o.memberCount}</td>
                    <td className="py-2.5 pr-5">
                      <span className={[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        o.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500',
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

  useEffect(() => {
    if (!editing) setVal(value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    if (val.trim()) { onSave(val.trim()); setEditing(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
            Bearbeiten
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          {type === 'textarea' ? (
            <textarea value={val} onChange={e => setVal(e.target.value)} rows={2}
              className="input-base flex-1 py-1.5 resize-none" />
          ) : (
            <input type={type} value={val} onChange={e => setVal(e.target.value)}
              className="input-base flex-1 py-1.5" />
          )}
          <button onClick={save} className="btn-primary btn-sm">OK</button>
          <button onClick={() => { setVal(value); setEditing(false); }} className="text-xs text-slate-400 hover:text-slate-600 px-1 transition-colors">✕</button>
        </div>
      ) : (
        <p className="text-sm text-slate-800">{val || <span className="text-slate-400 italic">—</span>}</p>
      )}
    </div>
  );
}
