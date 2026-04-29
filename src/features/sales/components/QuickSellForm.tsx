'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { QuickSellSchema, type QuickSellInput } from '../types/sales.types';
import { PLATFORMS } from '@/shared/constants/platforms';

const PLATFORM_KEYS = {
  KLEINANZEIGEN: 'kleinanzeigen',
  EBAY:          'ebay',
  FACEBOOK:      'facebook',
  OTHER:         'other',
} as const;

type Props = {
  onReview: (data: QuickSellInput) => void;
  onCancel: () => void;
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function QuickSellForm({ onReview, onCancel }: Props) {
  const t = useTranslations('sales');
  const tc = useTranslations('common');
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
      <h2 className="text-sm font-semibold text-gray-700">{t('quickSellTitle')}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('itemName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder={t('itemNamePlaceholder')}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('salePrice')} <span className="text-red-500">*</span>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('platform')} <span className="text-red-500">*</span>
        </label>
        <select
          {...register('salePlatform')}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="">{t('platformPlaceholder')}</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {t(`platforms.${PLATFORM_KEYS[p]}`)}
            </option>
          ))}
        </select>
        {errors.salePlatform && (
          <p className="text-xs text-red-600 mt-1">{errors.salePlatform.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('shippingCost')}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('saleDate')} <span className="text-red-500">*</span>
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
          {t('nextButton')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {tc('cancel')}
        </button>
      </div>
    </form>
  );
}
