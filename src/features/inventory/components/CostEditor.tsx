'use client';

// US-010 — Editing shippingCostIn, repairCost, and AdditionalCost[] rows.
// Only shown for IN_STOCK items.

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateItemCostsSchema, type UpdateItemCostsInput, type ItemWithCosts } from '../types/inventory.types';
import { useUpdateItem } from '../hooks/useUpdateItem';

type Props = { item: ItemWithCosts };

export function CostEditor({ item }: Props) {
  const { mutate, isPending } = useUpdateItem(item.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateItemCostsInput>({
    resolver: zodResolver(UpdateItemCostsSchema),
    defaultValues: {
      shippingCostIn:  item.shippingCostIn,
      repairCost:      item.repairCost,
      additionalCosts: item.costs.map(c => ({ label: c.label, amount: c.amount })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'additionalCosts' });

  function onSubmit(data: UpdateItemCostsInput) {
    mutate(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Costs</h3>

      {/* Shipping cost in */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 w-40 shrink-0">Shipping in (€)</label>
        <input
          {...register('shippingCostIn', { valueAsNumber: true })}
          type="number" step="0.01" min="0"
          className="input-base py-1.5"
        />
        {errors.shippingCostIn && <p className="text-xs text-red-600">{errors.shippingCostIn.message}</p>}
      </div>

      {/* Repair cost */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 w-40 shrink-0">Repair cost (€)</label>
        <input
          {...register('repairCost', { valueAsNumber: true })}
          type="number" step="0.01" min="0"
          className="input-base py-1.5"
        />
        {errors.repairCost && <p className="text-xs text-red-600">{errors.repairCost.message}</p>}
      </div>

      {/* Additional costs */}
      <div className="space-y-2">
        <p className="text-sm text-slate-600">Additional costs</p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              {...register(`additionalCosts.${index}.label`)}
              placeholder="Label"
              className="input-base py-1.5"
            />
            <input
              {...register(`additionalCosts.${index}.amount`, { valueAsNumber: true })}
              type="number" step="0.01" min="0"
              placeholder="€"
              className="input-base py-1.5 w-24"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-slate-400 hover:text-red-600 text-sm transition-colors px-1"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ label: '', amount: 0 })}
          className="text-xs text-slate-500 hover:text-slate-800 underline"
        >
          + Add cost
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? 'Saving…' : 'Save costs'}
      </button>
    </form>
  );
}
