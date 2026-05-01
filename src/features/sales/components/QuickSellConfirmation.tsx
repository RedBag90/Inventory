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
      <span className={`text-sm ${muted ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
      <span className={`text-sm ${muted ? 'text-slate-400' : 'text-slate-700'}`}>{value}</span>
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
    ? 'text-slate-500'
    : 'text-emerald-600';

  function handleConfirm() {
    mutate(pendingSale, { onSuccess });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-700">{t('confirmTitle')}</h2>

      <div className="profit-panel space-y-0.5">
        <Row label={t('confirmSalePrice')} value={formatCurrency(pendingSale.salePrice)} />

        <div className="border-t border-slate-200 my-2" />
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{t('confirmCosts')}</p>

        <Row label={t('confirmPurchasePrice')} value={`− ${formatCurrency(0)}`} muted />
        <Row label={t('confirmShipping')}      value={`− ${formatCurrency(pendingSale.shippingCostOut ?? 0)}`} muted />

        <div className="border-t border-slate-200 mt-2 pt-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-slate-700">{t('confirmProfit')}</span>
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
          className="btn-primary flex-1"
        >
          {isPending ? tc('saving') : t('confirmTitle')}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="btn-ghost"
        >
          {t('backButton')}
        </button>
      </div>
    </div>
  );
}
