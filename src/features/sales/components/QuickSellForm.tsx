'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QuickSellSchema, type QuickSellInput } from '../types/sales.types';

type Props = {
  onReview: (data: QuickSellInput) => void;
  onCancel: () => void;
};

const PLATFORMS = ['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER'] as const;

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function QuickSellForm({ onReview, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickSellInput>({
    resolver: zodResolver(QuickSellSchema),
    defaultValues: {
      shippingCostOut: 0,
      soldAt: todayISO() as unknown as Date,
    },
  });

  return (
    <form onSubmit={handleSubmit(onReview)} className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Schnell verkaufen</h2>

      {/* Item name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Artikelname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="z. B. iPhone 12"
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Sale price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verkaufspreis (€) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          {...register('salePrice', { valueAsNumber: true })}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="0.00"
        />
        {errors.salePrice && (
          <p className="text-xs text-red-600 mt-1">{errors.salePrice.message}</p>
        )}
      </div>

      {/* Sale platform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plattform <span className="text-red-500">*</span>
        </label>
        <select
          {...register('salePlatform')}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="">Plattform wählen…</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {errors.salePlatform && (
          <p className="text-xs text-red-600 mt-1">{errors.salePlatform.message}</p>
        )}
      </div>

      {/* Shipping out */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Versandkosten (€)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register('shippingCostOut', { valueAsNumber: true })}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="0.00"
        />
        {errors.shippingCostOut && (
          <p className="text-xs text-red-600 mt-1">{errors.shippingCostOut.message}</p>
        )}
      </div>

      {/* Sale date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verkaufsdatum <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('soldAt', { valueAsDate: true })}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        {errors.soldAt && (
          <p className="text-xs text-red-600 mt-1">{errors.soldAt.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex-1 bg-black text-white rounded py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Weiter →
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
