'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { QuickSellForm } from './QuickSellForm';
import { QuickSellConfirmation } from './QuickSellConfirmation';
import { useCreateQuickPendingSale } from '@/features/inventory/hooks/usePendingSale';
import type { QuickSellInput, QuickPendingSaleInput } from '../types/sales.types';

type Props = {
  onClose: () => void;
};

type Step = 'form' | 'confirm';
type Mode = 'sell' | 'premark';

export function QuickSellModal({ onClose }: Props) {
  const t = useTranslations('sales');
  const [step, setStep]       = useState<Step>('form');
  const [mode, setMode]       = useState<Mode>('sell');
  const [pendingSale, setPendingSale] = useState<QuickSellInput | null>(null);

  const { mutate: preMarkSale, isPending: isPreMarking } = useCreateQuickPendingSale();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleReview(data: QuickSellInput, reviewMode: Mode) {
    setPendingSale(data);
    setMode(reviewMode);
    setStep('confirm');
  }

  function handlePreMark() {
    if (!pendingSale) return;
    preMarkSale(pendingSale as QuickPendingSaleInput, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} aria-hidden="true" />

      <div className="slide-panel">
        <div className="modal-header items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{t('modalTitle')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('modalSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors text-sm"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {step === 'form' && (
            <QuickSellForm
              onReview={(data) => handleReview(data, 'sell')}
              onPreMark={(data) => handleReview(data, 'premark')}
              onCancel={onClose}
            />
          )}

          {step === 'confirm' && pendingSale && mode === 'sell' && (
            <QuickSellConfirmation
              pendingSale={pendingSale}
              onBack={() => setStep('form')}
              onSuccess={onClose}
            />
          )}

          {step === 'confirm' && pendingSale && mode === 'premark' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Schnellverkauf inserieren</h3>
              <p className="text-sm text-slate-500">
                Der Artikel wird als <span className="font-medium text-amber-700">Inseriert</span> gespeichert.
                Du kannst den Verkauf später mit einem Klick bestätigen.
              </p>
              <div className="profit-panel text-sm text-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Artikel</span>
                  <span className="font-medium">{pendingSale.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verkaufspreis</span>
                  <span className="font-medium">{pendingSale.salePrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plattform</span>
                  <span className="font-medium">{pendingSale.salePlatform.charAt(0) + pendingSale.salePlatform.slice(1).toLowerCase()}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handlePreMark}
                  disabled={isPreMarking}
                  className="btn-amber flex-1"
                >
                  {isPreMarking ? 'Speichert…' : 'Inserieren'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={isPreMarking}
                  className="btn-ghost"
                >
                  ← Zurück
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
