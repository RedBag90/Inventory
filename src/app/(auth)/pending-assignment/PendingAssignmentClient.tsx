'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSubmitJoinRequest, useMyJoinRequests } from '@/features/olympiad/hooks/useOlympiads';
import { checkHasMembership } from '@/features/olympiad/actions/olympiadActions';
import { createClient } from '@/shared/lib/supabase/client';
import { useSubmitInstanceRequest, useMyInstanceRequest } from '@/features/admin/hooks/useInstanceRequests';

export function PendingAssignmentClient({ email }: { email: string }) {
  const t = useTranslations('auth.pending');
  const tc = useTranslations('common');
  const router = useRouter();
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const { mutate: submit, isPending, error, reset } = useSubmitJoinRequest();
  const { data: myRequests } = useMyJoinRequests();

  const [showInstanceForm, setShowInstanceForm] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [instanceDesc, setInstanceDesc] = useState('');
  const { mutate: submitInstance, isPending: instancePending, error: instanceError, reset: resetInstance } = useSubmitInstanceRequest();
  const { data: myInstanceRequest } = useMyInstanceRequest();

  const pendingRequests = myRequests?.filter(r => r.status === 'PENDING') ?? [];

  const { data: hasMembership } = useQuery({
    queryKey:        ['hasMembership'],
    queryFn:         checkHasMembership,
    enabled:         pendingRequests.length > 0,
    refetchInterval: 10_000,
    staleTime:       0,
  });

  useEffect(() => {
    if (hasMembership) {
      router.push('/dashboard/inventory');
    }
  }, [hasMembership, router]);

  async function signOut() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push('/sign-in');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setSuccess(null);
    submit(code.trim(), {
      onSuccess: (result) => {
        if (result.autoAccepted) {
          router.push('/dashboard/inventory');
        } else {
          setSuccess(`Anfrage für „${result.instanceName}" gesendet – warte auf Freigabe.`);
          setCode('');
        }
      },
    });
  }

  const rejectedRequests = myRequests?.filter(r => r.status === 'REJECTED') ?? [];

  function handleInstanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetInstance();
    submitInstance({ instanceName: instanceName.trim(), description: instanceDesc.trim() || undefined }, {
      onSuccess: () => {
        setInstanceName('');
        setInstanceDesc('');
        setShowInstanceForm(false);
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        <div className="bg-indigo-950 px-8 py-8 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Flohmarkt-Olympiade</h1>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-white">{t('title')}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {t('joinCode')}
              </label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); reset(); setSuccess(null); }}
                placeholder={t('joinCodePlaceholder')}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600">{(error as Error).message}</p>
            )}
            {success && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{success}</p>
            )}
            <button
              type="submit"
              disabled={isPending || !code.trim()}
              className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-800 disabled:opacity-50 transition-colors"
            >
              {isPending ? t('joining') : t('joinSubmit')}
            </button>
          </form>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">{t('or')}</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {myInstanceRequest?.status === 'PENDING' ? (
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-sm text-amber-800">
                {t('requestFor')} <strong>&bdquo;{myInstanceRequest.instanceName}&ldquo;</strong> {t('requestPending')}.
              </div>
            ) : myInstanceRequest?.status === 'REJECTED' ? (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-sm text-red-700">
                {t('requestFor')} <strong>&bdquo;{myInstanceRequest.instanceName}&ldquo;</strong> {t('requestRejected')}.
              </div>
            ) : showInstanceForm ? (
              <form onSubmit={handleInstanceSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('instanceName')} *</label>
                  <input
                    required
                    autoFocus
                    value={instanceName}
                    onChange={e => { setInstanceName(e.target.value); resetInstance(); }}
                    placeholder={t('instanceNamePlaceholder')}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('instanceDescription')}</label>
                  <textarea
                    rows={2}
                    value={instanceDesc}
                    onChange={e => setInstanceDesc(e.target.value)}
                    placeholder={t('instanceDescriptionPlaceholder')}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
                  />
                </div>
                {instanceError && (
                  <p className="text-xs text-red-600">{(instanceError as Error).message}</p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={instancePending || !instanceName.trim()}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-800 disabled:opacity-50 transition-colors">
                    {instancePending ? t('requesting') : t('requestSubmit')}
                  </button>
                  <button type="button" onClick={() => { setShowInstanceForm(false); resetInstance(); }}
                    className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    {tc('cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowInstanceForm(true)}
                className="w-full border border-dashed border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                {t('requestInstance')}
              </button>
            )}
          </div>

          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('openRequests')}</p>
              {pendingRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{r.instanceName}</p>
                  <span className="text-xs text-amber-700 font-medium">{tc('pending')}</span>
                </div>
              ))}
            </div>
          )}

          {rejectedRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('rejectedRequests')}</p>
              {rejectedRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{r.instanceName}</p>
                  <span className="text-xs text-red-600 font-medium">{tc('rejected')}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">
            {t('loggedInAs')} <span className="font-medium text-slate-600">{email}</span>
          </p>
        </div>

        <div className="px-8 pb-8">
          <button
            onClick={signOut}
            className="w-full border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            {t('signOut')}
          </button>
        </div>

      </div>
    </div>
  );
}
