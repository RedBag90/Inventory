import { http } from 'msw';

// Add request handlers here as features are tested.
// Example: http.get('/api/items', () => HttpResponse.json([]))
export const handlers = [
  // placeholder — populated per feature test
] satisfies ReturnType<typeof http.get>[];
