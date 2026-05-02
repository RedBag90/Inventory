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
  onReview:   (data: QuickSellInput) => void;
  onPreMark?: (data: QuickSellInput) => void;
  onCancel:   () => void;
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function QuickSellForm({ onReview, onPreMark, onCancel }: Props) {
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
      <div>
        <label className="label-base">
          {t('itemName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className="input-base"
          placeholder={t('itemNamePlaceholder')}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="label-base">
          {t('salePrice')} <span className="text-red-500">*</span>
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
          {t('platform')} <span className="text-red-500">*</span>
        </label>
        <select
          {...register('salePlatform')}
          className="select-base"
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
        <label className="label-base">
          {t('shippingCost')}
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
          {t('saleDate')} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('soldAt', { valueAsDate: true })}
          className="input-base"
        />
        {errors.soldAt && (
          <p className="text-xs text-red-600 mt-1">{errors.soldAt.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-1 flex-wrap">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          {t('sellButton')}
        </button>
        {onPreMark && (
          <button
            type="button"
            onClick={handleSubmit(onPreMark)}
            className="btn-amber flex-1"
          >
            {t('preMarkButton')}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost flex-1"
        >
          {tc('cancel')}
        </button>
      </div>
    </form>
  );
}
