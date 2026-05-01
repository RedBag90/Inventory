'use client';

import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { SaleLineItem } from '../services/ReportingRepository';

type Props = { items: SaleLineItem[] };

export function ProfitTable({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">No sales in this period.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide pb-2">Item</th>
            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-2">Sold</th>
            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-2">Revenue</th>
            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-2">Costs</th>
            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-2">Profit</th>
            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-2">Storage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-2.5 pr-4 font-medium text-slate-900 max-w-[200px] truncate">{item.name}</td>
              <td className="py-2.5 text-right text-slate-500">{formatDate(new Date(item.soldAt))}</td>
              <td className="py-2.5 text-right text-slate-700">{formatCurrency(item.revenue)}</td>
              <td className="py-2.5 text-right text-slate-500">{formatCurrency(item.costs)}</td>
              <td className={`py-2.5 text-right font-medium ${item.profit > 0 ? 'text-emerald-600' : item.profit < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                {formatCurrency(item.profit)}
              </td>
              <td className="py-2.5 text-right text-slate-500">{item.storageDays}d</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
