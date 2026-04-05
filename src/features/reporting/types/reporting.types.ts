// Reporting data shapes — derived from DB aggregations, never stored.

export type MonthlyReport = {
  year: number;
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  itemsSold: number;
};

export type QuarterlyReport = {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  revenue: number;
  costs: number;
  profit: number;
  itemsSold: number;
};

export type CumulativeReport = {
  revenue: number;
  costs: number;
  profit: number;
  itemsSold: number;
  avgStorageDays: number;
};
