'use client';

// US-009 — Create item form. React Hook Form + Zod. Inline field errors.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateItemSchema, type CreateItemInput } from '../types/inventory.types';
import { useCreateItem } from '../hooks/useCreateItem';
import { PLATFORMS } from '@/shared/constants/platforms';

type Props = { onSuccess?: () => void };

export function ItemForm({ onSuccess }: Props) {
  const { mutate, isPending } = useCreateItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(CreateItemSchema),
    defaultValues: {
      purchasedAt:   new Date().toISOString().split('T')[0] as unknown as Date,
      shippingCostIn: 0,
      repairCost:    0,
    },
  });

  function onSubmit(data: CreateItemInput) {
    mutate(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="label-base">Name *</label>
        <input
          {...register('name')}
          className="input-base"
          placeholder="Item name"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Purchase price */}
      <div>
        <label className="label-base">Purchase price (€) *</label>
        <input
          {...register('purchasePrice', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0.01"
          className="input-base"
          placeholder="0.00"
        />
        {errors.purchasePrice && <p className="mt-1 text-xs text-red-600">{errors.purchasePrice.message}</p>}
      </div>

      {/* Platform */}
      <div>
        <label className="label-base">Platform *</label>
        <select
          {...register('purchasePlatform')}
          className="select-base"
        >
          {PLATFORMS.map(p => (
            <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
          ))}
        </select>
        {errors.purchasePlatform && <p className="mt-1 text-xs text-red-600">{errors.purchasePlatform.message}</p>}
      </div>

      {/* Purchase date */}
      <div>
        <label className="label-base">Purchase date *</label>
        <input
          {...register('purchasedAt', { valueAsDate: true })}
          type="date"
          className="input-base"
        />
        {errors.purchasedAt && <p className="mt-1 text-xs text-red-600">{errors.purchasedAt.message}</p>}
      </div>

      {/* Shipping cost in */}
      <div>
        <label className="label-base">Shipping cost in (€)</label>
        <input
          {...register('shippingCostIn', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="input-base"
          placeholder="0.00"
        />
        {errors.shippingCostIn && <p className="mt-1 text-xs text-red-600">{errors.shippingCostIn.message}</p>}
      </div>

      {/* Repair cost */}
      <div>
        <label className="label-base">Repair cost (€)</label>
        <input
          {...register('repairCost', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="input-base"
          placeholder="0.00"
        />
        {errors.repairCost && <p className="mt-1 text-xs text-red-600">{errors.repairCost.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label-base">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="input-base resize-none"
          placeholder="Optional notes"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full"
      >
        {isPending ? (
        <>
          <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Speichert…
        </>
      ) : 'Add item'}
      </button>
    </form>
  );
}
