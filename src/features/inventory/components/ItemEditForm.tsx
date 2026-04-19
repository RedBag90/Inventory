'use client';

// US-030 — Edit item metadata. Pre-filled via defaultValues.
// Only rendered for IN_STOCK items.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditItemSchema, type EditItemInput, type ItemWithCosts } from '../types/inventory.types';
import { useEditItem } from '../hooks/useEditItem';
import { PLATFORMS } from '@/shared/constants/platforms';

type Props = { item: ItemWithCosts; onSuccess?: () => void };

export function ItemEditForm({ item, onSuccess }: Props) {
  const { mutate, isPending } = useEditItem(item.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditItemInput>({
    resolver: zodResolver(EditItemSchema),
    defaultValues: {
      name:             item.name,
      description:      item.description ?? '',
      purchasePrice:    item.purchasePrice,
      purchasePlatform: item.purchasePlatform as EditItemInput['purchasePlatform'],
      purchasedAt:      new Date(item.purchasedAt),
    },
  });

  function onSubmit(data: EditItemInput) {
    mutate(data, { onSuccess: () => onSuccess?.() });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Edit item</h3>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          {...register('name')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Purchase price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purchase price (€) *</label>
        <input
          {...register('purchasePrice', { valueAsNumber: true })}
          type="number" step="0.01" min="0.01"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
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
          defaultValue={new Date(item.purchasedAt).toISOString().split('T')[0]}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        {errors.purchasedAt && <p className="mt-1 text-xs text-red-600">{errors.purchasedAt.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Speichert…
          </>
        ) : 'Save changes'}
      </button>
    </form>
  );
}
