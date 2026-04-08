'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { MonthlyReport } from '../types/reporting.types';

type Props = { data: MonthlyReport[] };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function RevenueChart({ data }: Props) {
  // Build chart rows; accumulate profit for the running total line
  let runningProfit = 0;
  const chartData = data.map((d) => {
    runningProfit += d.profit;
    return {
      month:             MONTHS[d.month - 1],
      Revenue:           parseFloat(d.revenue.toFixed(2)),
      Costs:             -parseFloat(d.costs.toFixed(2)),   // negative → bars go down
      'Kum. Gewinn':     parseFloat(runningProfit.toFixed(2)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `€${v}`}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={0} stroke="#d1d5db" />
        <Bar dataKey="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Costs"   fill="#ef4444" radius={[0, 0, 3, 3]} />
        <Line
          type="monotone"
          dataKey="Kum. Gewinn"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3, fill: '#22c55e' }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
