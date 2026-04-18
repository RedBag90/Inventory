'use client';

import { useTranslations } from 'next-intl';
import { useQuickSell } from '../hooks/useQuickSell';
import { formatCurrency } from '@/shared/lib/utils';
import type { QuickSellInput } from '../types/sales.types';

type Props = {
  pendingSale: QuickSellInput;
  onBack: () => void;
  onSuccess: () => void;
};

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className={`text-sm ${muted ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

export function QuickSellConfirmation({ pendingSale, onBack, onSuccess }: Props) {
  const t = useTranslations('sales');
  const tc = useTranslations('common');
  const { mutate, isPending, error } = useQuickSell();

  const profit = pendingSale.salePrice - (pendingSale.shippingCostOut ?? 0);
  const isLoss      = profit < 0;
  const isBreakEven = profit === 0;

  const profitColor = isLoss
    ? 'text-red-600'
    : isBreakEven
    ? 'text-gray-500'
    : 'text-green-700';

  function handleConfirm() {
    mutate(pendingSale, { onSuccess });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">{t('confirmTitle')}</h2>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-0.5">
        <Row label={t('confirmSalePrice')} value={formatCurrency(pendingSale.salePrice)} />

        <div className="border-t border-gray-200 my-2" />
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('confirmCosts')}</p>

        <Row label={t('confirmPurchasePrice')} value={`− ${formatCurrency(0)}`} muted />
        <Row label={t('confirmShipping')}      value={`− ${formatCurrency(pendingSale.shippingCostOut ?? 0)}`} muted />

        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-gray-700">{t('confirmProfit')}</span>
            <span className={`text-sm font-semibold ${profitColor}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        </div>
      </div>

      {isLoss && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {t('lossWarning')}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600">{(error as Error).message}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="flex-1 bg-black text-white rounded py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? tc('saving') : t('confirmTitle')}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t('backButton')}
        </button>
      </div>
    </div>
  );
}
