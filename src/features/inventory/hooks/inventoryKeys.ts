// TanStack Query key factory for inventory.
// All query keys must be defined here — no inline strings elsewhere.
export const inventoryKeys = {
  all:    ['inventory'] as const,
  list:   (filters: Record<string, unknown>) => ['inventory', 'list', filters] as const,
  detail: (id: string) => ['inventory', id] as const,
};
