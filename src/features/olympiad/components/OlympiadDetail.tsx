'use client';

import { useState } from 'react';
import {
  useOlympiadMembers,
  useUpdateOlympiad,
  useAssignUser,
  useRemoveUser,
  useGenerateInviteToken,
  useRevokeInviteToken,
  useGenerateJoinCode,
  useRevokeJoinCode,
  useUpdateAutoAccept,
} from '../hooks/useOlympiads';
import type { OlympiadRecord } from '../services/olympiadRepository';

function fmt(d: Date) {
  return new Date(d).toISOString().split('T')[0];
}

function fmtDisplay(d: Date) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Inline editable field ─────────────────────────────────────────────────────

function EditableField({
  label, value, type = 'text', onSave,
}: {
  label: string;
  value: string;
  type?: 'text' | 'date' | 'textarea';
  onSave: (v: string) => void;
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
          <button onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
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
          <button onClick={save}
            className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">
            OK
          </button>
          <button onClick={() => { setVal(value); setEditing(false); }}
            className="text-xs text-gray-400 hover:text-gray-600 px-1 transition-colors">
            ✕
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">—</span>}</p>
      )}
    </div>
  );
}

// ── Invite link section ───────────────────────────────────────────────────────

function InviteLinkSection({ instance, isOwner }: { instance: OlympiadRecord; isOwner: boolean }) {
  const { mutate: generate, isPending: generating } = useGenerateInviteToken();
  const { mutate: revoke,   isPending: revoking   } = useRevokeInviteToken();
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = instance.inviteToken ? `${origin}/join/${instance.inviteToken}` : null;

  function copy() {
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Einladungslink</p>
      {link ? (
        <>
          <div className="flex gap-2">
            <input readOnly value={link}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-gray-50 min-w-0" />
            <button onClick={copy}
              className="shrink-0 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </button>
          </div>
          {isOwner && (
            <div className="flex gap-3">
              <button onClick={() => generate(instance.id)} disabled={generating}
                className="text-xs text-gray-400 hover:text-gray-700 underline disabled:opacity-40 transition-colors">
                Neu generieren
              </button>
              <button onClick={() => { if (confirm('Link deaktivieren?')) revoke(instance.id); }} disabled={revoking}
                className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-40 transition-colors">
                Deaktivieren
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Kein aktiver Einladungslink.</p>
          {isOwner && (
            <button onClick={() => generate(instance.id)} disabled={generating}
              className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {generating ? 'Generieren…' : 'Link generieren'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Join code section ─────────────────────────────────────────────────────────

function JoinCodeSection({ instance, isOwner }: { instance: OlympiadRecord; isOwner: boolean }) {
  const { mutate: generate, isPending: generating } = useGenerateJoinCode();
  const { mutate: revoke,   isPending: revoking   } = useRevokeJoinCode();
  const { mutate: setAutoAccept } = useUpdateAutoAccept();
  const [copied, setCopied] = useState(false);

  function copy() {
    if (instance.joinCode) {
      navigator.clipboard.writeText(instance.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Beitrittscode</p>
      {instance.joinCode ? (
        <>
          <div className="flex gap-2 items-center">
            <span className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold text-gray-800 bg-gray-50 tracking-widest">
              {instance.joinCode}
            </span>
            <button onClick={copy}
              className="shrink-0 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </button>
          </div>
          {isOwner && (
            <>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={instance.autoAccept}
                  onChange={e => setAutoAccept({ instanceId: instance.id, autoAccept: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                />
                <span className="text-xs text-gray-600">Anfragen automatisch akzeptieren</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => generate(instance.id)} disabled={generating}
                  className="text-xs text-gray-400 hover:text-gray-700 underline disabled:opacity-40 transition-colors">
                  Neu generieren
                </button>
                <button onClick={() => { if (confirm('Code deaktivieren?')) revoke(instance.id); }} disabled={revoking}
                  className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-40 transition-colors">
                  Deaktivieren
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Kein aktiver Beitrittscode.</p>
          {isOwner && (
            <button onClick={() => generate(instance.id)} disabled={generating}
              className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {generating ? 'Generieren…' : 'Code generieren'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Member management ─────────────────────────────────────────────────────────

function MembersSection({ instance, isOwner }: { instance: OlympiadRecord; isOwner: boolean }) {
  const { data: members, isLoading } = useOlympiadMembers(instance.id);
  const { mutate: assign, isPending: assigning, error: assignError, reset } = useAssignUser();
  const { mutate: remove } = useRemoveUser();
  const [email, setEmail] = useState('');

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    assign(
      { email, instanceId: instance.id },
      {
        onSuccess: () => {
          setEmail('');
          reset();
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        Teilnehmer {members ? `(${members.length})` : ''}
      </p>

      {isOwner && (
        <form onSubmit={handleAssign} className="flex gap-2">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="E-Mail-Adresse" required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button type="submit" disabled={assigning}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {assigning ? '…' : 'Hinzufügen'}
          </button>
        </form>
      )}

      {assignError && (
        <p className="text-xs text-red-600">{(assignError as Error).message}</p>
      )}
{isLoading && <p className="text-sm text-gray-400">Laden…</p>}

      {members && members.length === 0 && (
        <p className="text-sm text-gray-400">Noch keine Teilnehmer.</p>
      )}

      {members && members.length > 0 && (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{m.displayName ?? m.email}</p>
                {m.displayName && <p className="text-xs text-gray-400">{m.email}</p>}
              </div>
              {isOwner && (
                <button
                  onClick={() => { if (confirm(`${m.email} entfernen?`)) remove({ userId: m.id, instanceId: instance.id }); }}
                  className="text-xs text-red-500 hover:text-red-700 underline transition-colors">
                  Entfernen
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main detail ───────────────────────────────────────────────────────────────

export function OlympiadDetail({
  instance,
  isOwner,
  onBack,
}: {
  instance: OlympiadRecord;
  isOwner: boolean;
  onBack: () => void;
}) {
  const { mutate: update } = useUpdateOlympiad();

  function save(field: string, value: string) {
    const data: Record<string, string | Date> = {};
    if (field === 'startsAt' || field === 'endsAt') data[field] = new Date(value);
    else data[field] = value;
    update({ id: instance.id, data });
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Alle Olympiaden
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{instance.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {fmtDisplay(instance.startsAt)} – {fmtDisplay(instance.endsAt)}
          </p>
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

      {/* Editable fields (owner only) */}
      {isOwner && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <EditableField label="Name" value={instance.name} onSave={v => save('name', v)} />
          <EditableField label="Beschreibung" value={instance.description ?? ''} type="textarea" onSave={v => save('description', v)} />
          <div className="grid grid-cols-2 gap-4">
            <EditableField label="Startdatum" value={fmt(instance.startsAt)} type="date" onSave={v => save('startsAt', v)} />
            <EditableField label="Enddatum"   value={fmt(instance.endsAt)}   type="date" onSave={v => save('endsAt',   v)} />
          </div>
        </div>
      )}

      {/* Invite link */}
      <InviteLinkSection instance={instance} isOwner={isOwner} />

      {/* Join code */}
      <JoinCodeSection instance={instance} isOwner={isOwner} />

      {/* Members */}
      <MembersSection instance={instance} isOwner={isOwner} />
    </div>
  );
}
