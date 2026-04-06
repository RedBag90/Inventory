'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { ChartRow, ItemMeta } from '../../lib/dashboardUtils';

type Props = {
  data:        ChartRow[];
  items:       ItemMeta[];
  avgCostLine: number;
};

export function CostDistributionChart({ data, items, avgCostLine }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-10">No sales in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => `€${v}`} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={56} />
        <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
        <ReferenceLine
          y={avgCostLine}
          stroke="#ef4444"
          label={{ value: 'Avg cost/period', position: 'insideTopLeft', fontSize: 10, fill: '#ef4444' }}
        />
        {items.map((item) => (
          <Bar key={item.id} dataKey={item.id} name={item.name} fill={item.color} stackId="a" radius={[2, 2, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
