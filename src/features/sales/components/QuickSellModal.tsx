'use client';

import { useState, useEffect } from 'react';
import { QuickSellForm } from './QuickSellForm';
import { QuickSellConfirmation } from './QuickSellConfirmation';
import type { QuickSellInput } from '../types/sales.types';

type Props = {
  onClose: () => void;
};

type Step = 'form' | 'confirm';

export function QuickSellModal({ onClose }: Props) {
  const [step, setStep]               = useState<Step>('form');
  const [pendingSale, setPendingSale] = useState<QuickSellInput | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Schnell verkaufen</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Artikel anlegen und direkt verkaufen
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-4 mt-0.5"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === 'form' && (
            <QuickSellForm
              onReview={(data) => {
                setPendingSale(data);
                setStep('confirm');
              }}
              onCancel={onClose}
            />
          )}

          {step === 'confirm' && pendingSale && (
            <QuickSellConfirmation
              pendingSale={pendingSale}
              onBack={() => setStep('form')}
              onSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
