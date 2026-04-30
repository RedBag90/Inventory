'use client';

// Form to record a sale against an existing inventory item.
// Uses React Hook Form + Zod (RecordSaleSchema).
// Does NOT write to DB — calls onReview() so the parent can show the confirmation step.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecordSaleSchema, type RecordSaleInput } from '../types/sales.types';
import { PLATFORMS } from '@/shared/constants/platforms';

type Props = {
  itemId: string;
  onReview: (data: RecordSaleInput) => void;
  onCancel: () => void;
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function SaleForm({ itemId, onReview, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordSaleInput>({
    resolver: zodResolver(RecordSaleSchema),
    defaultValues: {
      itemId,
      shippingCostOut: 0,
      soldAt: new Date(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onReview)} className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Record sale</h2>

      {/* Sale price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sale price (€) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
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
          Platform <span className="text-red-500">*</span>
        </label>
        <select
          {...register('salePlatform')}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="">Select platform…</option>
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
          Outbound shipping (€)
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
          Sale date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          defaultValue={todayISO()}
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
          Review sale →
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
