// TanStack Query key factory for sales.
// All query keys must be defined here — no inline strings elsewhere.
export const salesKeys = {
  all:    ['sales'] as const,
  list:   (filters: Record<string, unknown>) => ['sales', 'list', filters] as const,
  detail: (id: string) => ['sales', id] as const,
};
