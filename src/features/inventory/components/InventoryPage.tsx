'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { ItemTable } from './ItemTable';
import { ItemForm } from './ItemForm';
import { SaleModal }      from '@/features/sales/components/SaleModal';
import { QuickSellModal } from '@/features/sales/components/QuickSellModal';
import type { ItemWithCosts } from '../types/inventory.types';

export function InventoryPage() {
  const t = useTranslations('inventory');
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [showQuickSell,  setShowQuickSell]  = useState(false);
  const [sellingItem,    setSellingItem]    = useState<ItemWithCosts | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-tutorial="quick-sell-button"
            onClick={() => setShowQuickSell(true)}
            className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {t('quickSellButton')}
          </button>
          <button
            data-tutorial="buy-button"
            onClick={() => setShowAddForm(true)}
            className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            {t('quickSellDescription')}
          </button>
        </div>
      </div>

      <Suspense fallback={<div className="text-sm text-gray-500 py-8 text-center">{t('loading')}</div>}>
        <ItemTable onRecordSale={setSellingItem} />
      </Suspense>

      {/* Add item panel */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowAddForm(false)}
          />
          <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{t('buyButton')}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t('buyDescription')}</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors text-sm"
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
    </div>
  );
}
