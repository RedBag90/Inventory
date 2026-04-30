'use client';

// Modal to confirm (or edit then confirm) a pending sale.
// Fields are pre-filled from the existing PendingSale record.
// Also allows cancelling the pending sale via a cancel link.

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaleManager } from '../services/SaleManager';
import { useConfirmPendingSale, useCancelPendingSale } from '@/features/inventory/hooks/usePendingSale';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import { PLATFORMS } from '@/shared/constants/platforms';
import { UpdatePendingSaleSchema, type UpdatePendingSaleInput } from '../types/sales.types';
import type { ItemWithCosts } from '@/features/inventory/types/inventory.types';

type Props = {
  item:    ItemWithCosts;
  onClose: () => void;
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function ConfirmPendingSaleModal({ item, onClose }: Props) {
  const { mutate: confirm, isPending: isConfirming } = useConfirmPendingSale();
  const { mutate: cancel,  isPending: isCancelling  } = useCancelPendingSale();

  const ps = item.pendingSale;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdatePendingSaleInput>({
    resolver: zodResolver(UpdatePendingSaleSchema),
    defaultValues: {
      salePrice:       ps?.salePrice       ?? 0,
      salePlatform:    (ps?.salePlatform as 'KLEINANZEIGEN' | 'EBAY' | 'FACEBOOK' | 'OTHER') ?? undefined,
      shippingCostOut: ps?.shippingCostOut ?? 0,
      soldAt:          ps ? new Date(ps.soldAt) : new Date(),
    },
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const watchedSalePrice       = watch('salePrice')       ?? 0;
  const watchedShippingCostOut = watch('shippingCostOut') ?? 0;

  const previewProfit = SaleManager.calculateProfit({
    ...item,
    sale: {
      id:              '',
      salePrice:       Number(watchedSalePrice)       || 0,
      salePlatform:    '',
      shippingCostOut: Number(watchedShippingCostOut) || 0,
      soldAt:          new Date(),
    },
  });

  const totalCost =
    item.purchasePrice + item.shippingCostIn + item.repairCost +
    item.costs.reduce((sum, c) => sum + c.amount, 0);

  function onSubmit(data: UpdatePendingSaleInput) {
    confirm({ itemId: item.id, overrides: data }, { onSuccess: onClose });
  }

  function handleCancel() {
    cancel(item.id, { onSuccess: onClose });
  }

  const profitColor =
    previewProfit === null ? 'text-gray-500' :
    previewProfit < 0      ? 'text-red-600'  :
    previewProfit === 0    ? 'text-gray-500'  :
                             'text-emerald-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">

        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gekauft {formatDate(new Date(item.purchasedAt))} · Einkaufskosten {formatCurrency(totalCost)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-4 mt-0.5" aria-label="Schließen">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Verkauf bestätigen</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verkaufspreis (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" step="0.01" min="0" autoFocus
              {...register('salePrice', { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="0.00"
            />
            {errors.salePrice && <p className="text-xs text-red-600 mt-1">{errors.salePrice.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plattform <span className="text-red-500">*</span>
            </label>
            <select
              {...register('salePlatform')}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="">Plattform auswählen…</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
            {errors.salePlatform && <p className="text-xs text-red-600 mt-1">{errors.salePlatform.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Versandkosten Ausgang (€)</label>
            <input
              type="number" step="0.01" min="0"
              {...register('shippingCostOut', { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="0.00"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Verkaufsdatum <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setValue('soldAt', new Date(todayISO()) as unknown as Date)}
                className="text-xs text-gray-500 underline hover:text-gray-800"
              >
                Heute
              </button>
            </div>
            <input
              type="date"
              {...register('soldAt', { valueAsDate: true })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {errors.soldAt && <p className="text-xs text-red-600 mt-1">{errors.soldAt.message}</p>}
          </div>

          {/* Profit preview */}
          {previewProfit !== null && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">Erwarteter Gewinn</span>
              <span className={`text-sm font-semibold ${profitColor}`}>
                {previewProfit > 0 ? '+' : ''}{formatCurrency(previewProfit)}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isConfirming || isCancelling}
              className="flex-1 bg-emerald-600 text-white rounded py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {isConfirming ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Speichert…
                </>
              ) : 'Verkauf bestätigen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isConfirming || isCancelling}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Abbrechen
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isConfirming || isCancelling}
              className="text-xs text-gray-400 hover:text-red-600 underline transition-colors"
            >
              {isCancelling ? 'Wird aufgehoben…' : 'Inserat aufheben'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
