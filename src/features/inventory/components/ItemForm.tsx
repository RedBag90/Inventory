'use client';

// US-009 — Create item form. React Hook Form + Zod. Inline field errors.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateItemSchema, type CreateItemInput } from '../types/inventory.types';
import { useCreateItem } from '../hooks/useCreateItem';

const PLATFORMS = ['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER'] as const;

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
      purchasedAt:   new Date(),
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          {...register('name')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Item name"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Purchase price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purchase price (€) *</label>
        <input
          {...register('purchasePrice', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0.01"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="0.00"
        />
        {errors.purchasePrice && <p className="mt-1 text-xs text-red-600">{errors.purchasePrice.message}</p>}
      </div>

      {/* Platform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
        <select
          {...register('purchasePlatform')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
        >
          {PLATFORMS.map(p => (
            <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
          ))}
        </select>
        {errors.purchasePlatform && <p className="mt-1 text-xs text-red-600">{errors.purchasePlatform.message}</p>}
      </div>

      {/* Purchase date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purchase date *</label>
        <input
          {...register('purchasedAt')}
          type="date"
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        {errors.purchasedAt && <p className="mt-1 text-xs text-red-600">{errors.purchasedAt.message}</p>}
      </div>

      {/* Shipping cost in */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shipping cost in (€)</label>
        <input
          {...register('shippingCostIn', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="0.00"
        />
        {errors.shippingCostIn && <p className="mt-1 text-xs text-red-600">{errors.shippingCostIn.message}</p>}
      </div>

      {/* Repair cost */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Repair cost (€)</label>
        <input
          {...register('repairCost', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="0.00"
        />
        {errors.repairCost && <p className="mt-1 text-xs text-red-600">{errors.repairCost.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          placeholder="Optional notes"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Saving…' : 'Add item'}
      </button>
    </form>
  );
}
