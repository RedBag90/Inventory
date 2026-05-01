'use client';

type Trend = 'positive' | 'negative' | 'neutral';
type Props = { label: string; value: string; trend?: Trend };

const TREND_STYLES: Record<Trend, string> = {
  positive: 'text-emerald-600',
  negative: 'text-red-600',
  neutral:  'text-slate-900',
};

export function KPICard({ label, value, trend = 'neutral' }: Props) {
  return (
    <div className="card-section">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${TREND_STYLES[trend]}`}>{value}</p>
    </div>
  );
}
