// Public API — only import from here, never from internal paths

export { ReportingPage }   from './components/ReportingPage';
export { DashboardPage }   from './components/DashboardPage';
export { KPICard }         from './components/KPICard';
export { RevenueChart }    from './components/RevenueChart';
export { ProfitTable }     from './components/ProfitTable';
export { useMonthlyReport }      from './hooks/useMonthlyReport';
export { useQuarterlyReport }    from './hooks/useQuarterlyReport';
export { useCumulativeReport }   from './hooks/useCumulativeReport';
export { useAllMonthlyReports }  from './hooks/useAllMonthlyReports';
export { useDashboardData }      from './hooks/useDashboardData';
export { useDashboardFilters }   from './hooks/useDashboardFilters';
export { reportingKeys }         from './hooks/reportingKeys';
export type { MonthlyReport, QuarterlyReport, CumulativeReport } from './types/reporting.types';
export type { DashboardSale }   from './services/getDashboardData';
export type { Granularity, ItemMeta } from './lib/dashboardUtils';
