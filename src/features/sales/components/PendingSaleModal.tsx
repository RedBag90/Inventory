'use client';

// Modal for pre-marking an existing IN_STOCK item for sale.
// Shows profit preview and saves as PendingSale (status → RESERVED).

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaleManager } from '../services/SaleManager';
import { useCreatePendingSale } from '@/features/inventory/hooks/usePendingSale';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import { PLATFORMS } from '@/shared/constants/platforms';
import { CreatePendingSaleSchema, type CreatePendingSaleInput } from '../types/sales.types';
import type { ItemWithCosts } from '@/features/inventory/types/inventory.types';

type Props = {
  item:    ItemWithCosts;
  onClose: () => void;
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function PendingSaleModal({ item, onClose }: Props) {
  const { mutate, isPending } = useCreatePendingSale();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePendingSaleInput>({
    resolver: zodResolver(CreatePendingSaleSchema),
    defaultValues: {
      itemId:          item.id,
      shippingCostOut: 0,
      soldAt:          new Date(),
    },
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const watchedSalePrice       = watch('salePrice') ?? 0;
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

  function onSubmit(data: CreatePendingSaleInput) {
    mutate(data, { onSuccess: onClose });
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
          <h3 className="text-sm font-semibold text-gray-700">Verkauf vormerken</h3>

          <input type="hidden" {...register('itemId')} />

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geplantes Verkaufsdatum <span className="text-red-500">*</span>
            </label>
            <input
              type="date" defaultValue={todayISO()}
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
              disabled={isPending}
              className="flex-1 bg-amber-500 text-white rounded py-2 text-sm font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Speichert…' : 'Vormerken'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
