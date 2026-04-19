// TanStack Query key factory for reporting.
// All query keys must be defined here — no inline strings elsewhere.
export const reportingKeys = {
  all:          ['reporting'] as const,
  monthly:      (year: number, month: number)   => ['reporting', 'monthly', year, month] as const,
  quarterly:    (year: number, quarter: number) => ['reporting', 'quarterly', year, quarter] as const,
  cumulative:   ()                              => ['reporting', 'cumulative'] as const,
  range:        (from: string, to: string, userId: string) =>
    ['reporting', 'range', from, to, userId] as const,
  rangeAll:     ()                              => ['reporting', 'range'] as const,
  dashboard:    (from: string, to: string, userId: string) =>
    ['reporting', 'dashboard', from, to, userId] as const,
  dashboardAll: ()                              => ['reporting', 'dashboard'] as const,
  lineItems:    (from: string | null, to: string | null, userId: string) =>
    ['reporting', 'line-items', from, to, userId] as const,
  lineItemsAll: ()                              => ['reporting', 'line-items'] as const,
};
