'use client';

// Modal that hosts the full 2-step sale recording flow (form → confirmation).
// Opened from the inventory list when the user clicks "Record sale" on an IN_STOCK item.

import { useState, useEffect } from 'react';
import { SaleForm } from './SaleForm';
import { SaleConfirmation } from './SaleConfirmation';
import type { ItemWithCosts } from '@/features/inventory/types/inventory.types';
import type { RecordSaleInput } from '../types/sales.types';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

type Props = {
  item: ItemWithCosts;
  onClose: () => void;
};

type Step = 'form' | 'confirm';

export function SaleModal({ item, onClose }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [pendingSale, setPendingSale] = useState<RecordSaleInput | null>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const totalCost =
    item.purchasePrice +
    item.shippingCostIn +
    item.repairCost +
    item.costs.reduce((sum, c) => sum + c.amount, 0);

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
            <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Purchased {formatDate(new Date(item.purchasedAt))} · Total cost {formatCurrency(totalCost)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-4 mt-0.5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === 'form' && (
            <SaleForm
              itemId={item.id}
              onReview={(data) => {
                setPendingSale(data);
                setStep('confirm');
              }}
              onCancel={onClose}
            />
          )}

          {step === 'confirm' && pendingSale && (
            <SaleConfirmation
              item={item}
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
