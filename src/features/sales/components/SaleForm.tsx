'use client';

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
      <h2 className="text-sm font-semibold text-slate-700">Record sale</h2>

      <div>
        <label className="label-base">
          Sale price (€) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register('salePrice', { valueAsNumber: true })}
          className="input-base"
          placeholder="0.00"
        />
        {errors.salePrice && (
          <p className="text-xs text-red-600 mt-1">{errors.salePrice.message}</p>
        )}
      </div>

      <div>
        <label className="label-base">
          Platform <span className="text-red-500">*</span>
        </label>
        <select
          {...register('salePlatform')}
          className="select-base"
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

      <div>
        <label className="label-base">
          Outbound shipping (€)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register('shippingCostOut', { valueAsNumber: true })}
          className="input-base"
          placeholder="0.00"
        />
        {errors.shippingCostOut && (
          <p className="text-xs text-red-600 mt-1">{errors.shippingCostOut.message}</p>
        )}
      </div>

      <div>
        <label className="label-base">
          Sale date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          defaultValue={todayISO()}
          {...register('soldAt', { valueAsDate: true })}
          className="input-base"
        />
        {errors.soldAt && (
          <p className="text-xs text-red-600 mt-1">{errors.soldAt.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          Review sale →
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
