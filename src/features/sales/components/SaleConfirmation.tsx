'use client';

// Confirmation step shown before committing a sale.
// Displays computed profit preview (via SaleManager.calculateProfit).
// No DB write occurs here — the user must explicitly confirm.

import { SaleManager } from '../services/SaleManager';
import { useRecordSale } from '../hooks/useRecordSale';
import { formatCurrency } from '@/shared/lib/utils';
import type { ItemWithCosts } from '@/features/inventory/types/inventory.types';
import type { RecordSaleInput } from '../types/sales.types';

type Props = {
  item: ItemWithCosts;
  pendingSale: RecordSaleInput;
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

export function SaleConfirmation({ item, pendingSale, onBack, onSuccess }: Props) {
  const { mutate, isPending, error } = useRecordSale();

  // Build synthetic item with pending sale values so SaleManager can compute profit
  const syntheticItem: ItemWithCosts = {
    ...item,
    sale: {
      id:              '',
      salePrice:       pendingSale.salePrice,
      salePlatform:    pendingSale.salePlatform,
      shippingCostOut: pendingSale.shippingCostOut ?? 0,
      soldAt:          pendingSale.soldAt,
    },
  };

  const profit = SaleManager.calculateProfit(syntheticItem)!;
  const isLoss = profit < 0;
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
      <h2 className="text-sm font-semibold text-gray-700">Review sale</h2>

      {/* Cost breakdown */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-0.5">
        <Row label="Sale price"    value={formatCurrency(pendingSale.salePrice)} />

        <div className="border-t border-gray-200 my-2" />
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Costs</p>

        <Row label="Purchase price"   value={`− ${formatCurrency(item.purchasePrice)}`} muted />
        <Row label="Shipping in"      value={`− ${formatCurrency(item.shippingCostIn)}`} muted />
        <Row label="Repair cost"      value={`− ${formatCurrency(item.repairCost)}`} muted />
        {item.costs.map((c) => (
          <Row key={c.id} label={c.label} value={`− ${formatCurrency(c.amount)}`} muted />
        ))}
        <Row label="Shipping out"     value={`− ${formatCurrency(pendingSale.shippingCostOut ?? 0)}`} muted />

        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-gray-700">Profit</span>
            <span className={`text-sm font-semibold ${profitColor}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        </div>
      </div>

      {/* Loss warning */}
      {isLoss && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          This sale results in a loss. Confirm only if intentional.
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
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Speichert…
            </>
          ) : 'Confirm sale'}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
