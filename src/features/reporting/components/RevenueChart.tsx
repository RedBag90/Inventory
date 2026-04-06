'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyReport } from '../types/reporting.types';

type Props = { data: MonthlyReport[] };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function RevenueChart({ data }: Props) {
  const chartData = data.map((d) => ({
    month:   MONTHS[d.month - 1],
    Revenue: parseFloat(d.revenue.toFixed(2)),
    Costs:   parseFloat(d.costs.toFixed(2)),
    Profit:  parseFloat(d.profit.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => `€${v}`} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Revenue" fill="#3b82f6" radius={[3,3,0,0]} />
        <Bar dataKey="Costs"   fill="#ef4444" radius={[3,3,0,0]} />
        <Bar dataKey="Profit"  fill="#22c55e" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
