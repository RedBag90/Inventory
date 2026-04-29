// Business logic layer for inventory.
// Knows nothing about HTTP, UI, or Prisma directly.
// Depends on types only — not on ItemRepository.
//
// Responsibilities:
//   - calculateStorageDays(item)      US-013
//   - validateStatusTransition(from, to)

import type { ItemWithCosts, ItemStatus } from '../types/inventory.types';
import { calculateStorageDays } from '@/shared/lib/calculations';

export class ItemManager {
  static calculateStorageDays(item: Pick<ItemWithCosts, 'purchasedAt' | 'status' | 'sale'>): number {
    const endDate = item.status === 'SOLD' && item.sale ? item.sale.soldAt : new Date();
    return calculateStorageDays(item.purchasedAt, endDate);
  }

  static validateStatusTransition(from: ItemStatus, to: ItemStatus): boolean {
    if (from === 'IN_STOCK'  && to === 'RESERVED') return true;
    if (from === 'IN_STOCK'  && to === 'SOLD')     return true;
    if (from === 'RESERVED'  && to === 'SOLD')     return true;
    if (from === 'RESERVED'  && to === 'IN_STOCK') return true;
    return false;
  }
}
