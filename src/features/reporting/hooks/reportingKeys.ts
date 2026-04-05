// TanStack Query key factory for reporting.
// All query keys must be defined here — no inline strings elsewhere.
export const reportingKeys = {
  all:       ['reporting'] as const,
  monthly:   (year: number, month: number)   => ['reporting', 'monthly', year, month] as const,
  quarterly: (year: number, quarter: number) => ['reporting', 'quarterly', year, quarter] as const,
  cumulative: ()                             => ['reporting', 'cumulative'] as const,
};
