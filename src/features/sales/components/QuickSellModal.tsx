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

      <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{t('modalTitle')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('modalSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors text-sm"
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
              <h3 className="text-sm font-semibold text-gray-700">Schnellverkauf inserieren</h3>
              <p className="text-sm text-gray-500">
                Der Artikel wird als <span className="font-medium text-amber-700">Inseriert</span> gespeichert.
                Du kannst den Verkauf später mit einem Klick bestätigen.
              </p>
              <div className="bg-gray-50 rounded-md border border-gray-200 p-4 text-sm text-gray-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Artikel</span>
                  <span className="font-medium">{pendingSale.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verkaufspreis</span>
                  <span className="font-medium">{pendingSale.salePrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plattform</span>
                  <span className="font-medium">{pendingSale.salePlatform.charAt(0) + pendingSale.salePlatform.slice(1).toLowerCase()}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handlePreMark}
                  disabled={isPreMarking}
                  className="flex-1 bg-amber-500 text-white rounded-md py-2 text-sm font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {isPreMarking ? 'Speichert…' : 'Inserieren'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={isPreMarking}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
