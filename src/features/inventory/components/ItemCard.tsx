'use client';

import { useTranslations } from 'next-intl';
import { ItemManager } from '../services/ItemManager';
import { SaleManager } from '@/features/sales/services/SaleManager';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { ItemWithCosts } from '../types/inventory.types';

type Props = {
  item:                ItemWithCosts;
  onRecordSale?:       (item: ItemWithCosts) => void;
  onPreMarkSale?:      (item: ItemWithCosts) => void;
  onConfirmSale?:      (item: ItemWithCosts) => void;
  onCancelPendingSale?:(item: ItemWithCosts) => void;
};

const PLATFORM_STYLE: Record<string, string> = {
  KLEINANZEIGEN: 'bg-teal-50 text-teal-700',
  EBAY:          'bg-blue-50 text-blue-700',
  FACEBOOK:      'bg-indigo-50 text-indigo-700',
  OTHER:         'bg-slate-100 text-slate-500',
};

export function ItemCard({ item, onRecordSale, onPreMarkSale, onConfirmSale, onCancelPendingSale }: Props) {
  const t = useTranslations('inventory');
  const ts = useTranslations('sales.platforms');
  const storageDays = ItemManager.calculateStorageDays(item);
  const profit      = SaleManager.calculateProfit(item);
  const isSold      = item.status === 'SOLD';
  const isReserved  = item.status === 'RESERVED';

  const profitColor =
    profit === null    ? '' :
    profit < 0         ? 'text-red-500' :
    profit === 0       ? 'text-slate-400' :
                         'text-emerald-600';

  const platformLabelMap: Record<string, string> = {
    KLEINANZEIGEN: ts('kleinanzeigen'),
    EBAY:          ts('ebay'),
    FACEBOOK:      ts('facebook'),
    OTHER:         ts('other'),
  };

  const platformLabel = platformLabelMap[item.purchasePlatform] ?? item.purchasePlatform;
  const platformStyle = PLATFORM_STYLE[item.purchasePlatform] ?? 'bg-slate-100 text-slate-500';

  // Pending sale profit preview
  const pendingProfit = isReserved && item.pendingSale
    ? SaleManager.calculateProfit({ ...item, sale: item.pendingSale })
    : null;

  const pendingProfitColor =
    pendingProfit === null ? '' :
    pendingProfit < 0      ? 'text-red-400' :
    pendingProfit === 0    ? 'text-slate-400' :
                             'text-amber-600';

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors group">

      <span className={[
        'w-2 h-2 rounded-full shrink-0 mt-0.5',
        isSold     ? 'bg-slate-300'   :
        isReserved ? 'bg-amber-400'  :
                     'bg-emerald-400',
      ].join(' ')} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={['text-[11px] font-medium px-1.5 py-0.5 rounded', platformStyle].join(' ')}>
            {platformLabel}
          </span>
          <span className="text-xs text-slate-400">{formatDate(new Date(item.purchasedAt))}</span>
          {!isSold && (
            <span className={[
              'text-[11px] font-medium px-1.5 py-0.5 rounded',
              storageDays > 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500',
            ].join(' ')}>
              {t('daysInStock', { days: storageDays })}
            </span>
          )}
          {isReserved && item.pendingSale && (
            <span className="text-[11px] text-slate-400">
              inseriert {formatCurrency(item.pendingSale.salePrice)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-sm text-slate-500">{formatCurrency(item.purchasePrice)}</span>
          {profit !== null && (
            <>
              <span className="mx-1.5 text-slate-200">→</span>
              <span className={['text-sm font-semibold', profitColor].join(' ')}>
                {profit > 0 ? '+' : ''}{formatCurrency(profit)}
              </span>
            </>
          )}
          {isReserved && pendingProfit !== null && (
            <>
              <span className="mx-1.5 text-slate-200">→</span>
              <span className={['text-sm font-semibold', pendingProfitColor].join(' ')}>
                {pendingProfit > 0 ? '+' : ''}{formatCurrency(pendingProfit)}
              </span>
            </>
          )}
        </div>

        {isSold && (
          <span className="status-sold">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            {t('statusSold')}
          </span>
        )}

        {isReserved && (
          <span className="status-reserved">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Inseriert
          </span>
        )}

        {!isSold && !isReserved && (
          <span className="status-in-stock">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('statusInStock')}
          </span>
        )}

        {/* IN_STOCK: sell + pre-mark buttons */}
        {!isSold && !isReserved && (
          <div className="flex gap-1.5 opacity-100 pointer-events-auto [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto">
            {onPreMarkSale && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPreMarkSale(item); }}
                className="btn-secondary btn-sm shrink-0"
              >
                Inserieren
              </button>
            )}
            {onRecordSale && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRecordSale(item); }}
                className="btn-primary btn-sm shrink-0"
              >
                {t('sellButton')}
              </button>
            )}
          </div>
        )}

        {/* RESERVED: confirm + cancel buttons */}
        {isReserved && (
          <div className="flex gap-1.5 opacity-100 pointer-events-auto [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto">
            {onCancelPendingSale && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancelPendingSale(item); }}
                className="btn-secondary btn-sm shrink-0"
              >
                Aufheben
              </button>
            )}
            {onConfirmSale && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirmSale(item); }}
                className="btn-emerald btn-sm shrink-0"
              >
                Bestätigen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
