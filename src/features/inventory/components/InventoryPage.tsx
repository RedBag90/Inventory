'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { ItemTable } from './ItemTable';
import { ItemForm } from './ItemForm';
import { SaleModal }              from '@/features/sales/components/SaleModal';
import { QuickSellModal }         from '@/features/sales/components/QuickSellModal';
import { PendingSaleModal }       from '@/features/sales/components/PendingSaleModal';
import { ConfirmPendingSaleModal } from '@/features/sales/components/ConfirmPendingSaleModal';
import { useCancelPendingSale }   from '../hooks/usePendingSale';
import type { ItemWithCosts } from '../types/inventory.types';

export function InventoryPage() {
  const t = useTranslations('inventory');
  const [showAddForm,       setShowAddForm]       = useState(false);
  const [showQuickSell,     setShowQuickSell]     = useState(false);
  const [sellingItem,       setSellingItem]       = useState<ItemWithCosts | null>(null);
  const [preMarkItem,       setPreMarkItem]       = useState<ItemWithCosts | null>(null);
  const [confirmItem,       setConfirmItem]       = useState<ItemWithCosts | null>(null);

  const { mutate: cancelPendingSale } = useCancelPendingSale();

  function handleCancelPendingSale(item: ItemWithCosts) {
    cancelPendingSale(item.id);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            data-tutorial="quick-sell-button"
            onClick={() => setShowQuickSell(true)}
            className="btn-secondary flex-1 sm:flex-none"
          >
            {t('quickSellButton')}
          </button>
          <button
            data-tutorial="buy-button"
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex-1 sm:flex-none"
          >
            {t('buyButton')}
          </button>
        </div>
      </div>

      <Suspense fallback={<div className="text-sm text-slate-500 py-8 text-center">{t('loading')}</div>}>
        <ItemTable
          onRecordSale={setSellingItem}
          onPreMarkSale={setPreMarkItem}
          onConfirmSale={setConfirmItem}
          onCancelPendingSale={handleCancelPendingSale}
        />
      </Suspense>

      {/* Add item panel */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowAddForm(false)}
          />
          <div className="slide-panel">
            <div className="modal-header items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{t('buyButton')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('buyDescription')}</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <ItemForm onSuccess={() => setShowAddForm(false)} />
            </div>
          </div>
        </div>
      )}

      {showQuickSell && (
        <QuickSellModal onClose={() => setShowQuickSell(false)} />
      )}

      {sellingItem && (
        <SaleModal
          item={sellingItem}
          onClose={() => setSellingItem(null)}
        />
      )}

      {preMarkItem && (
        <PendingSaleModal
          item={preMarkItem}
          onClose={() => setPreMarkItem(null)}
        />
      )}

      {confirmItem && (
        <ConfirmPendingSaleModal
          item={confirmItem}
          onClose={() => setConfirmItem(null)}
        />
      )}
    </div>
  );
}
