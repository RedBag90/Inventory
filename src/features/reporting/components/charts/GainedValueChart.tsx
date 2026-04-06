'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartRow, ItemMeta } from '../../lib/dashboardUtils';

type Props = { data: ChartRow[]; items: ItemMeta[] };

export function GainedValueChart({ data, items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-10">No sales in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => `€${v}`} tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={52} />
        <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
        {items.map((item) => (
          <Bar key={item.id} dataKey={item.id} name={item.name} fill={item.color} stackId="a" radius={[1, 1, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
