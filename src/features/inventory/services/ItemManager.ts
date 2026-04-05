// Business logic layer for inventory.
// Knows nothing about HTTP, UI, or Prisma directly.
// Depends on types only — not on ItemRepository.
//
// Responsibilities:
//   - calculateStorageDays(item)      US-013
//   - validateStatusTransition(from, to)

import type { ItemWithCosts, ItemStatus } from '../types/inventory.types';

export class ItemManager {
  /**
   * US-013 — Storage duration in whole days.
   * IN_STOCK: purchasedAt → today
   * SOLD:     purchasedAt → soldAt
   */
  static calculateStorageDays(item: Pick<ItemWithCosts, 'purchasedAt' | 'status' | 'sale'>): number {
    const endDate = item.status === 'SOLD' && item.sale ? item.sale.soldAt : new Date();
    return Math.floor((endDate.getTime() - item.purchasedAt.getTime()) / 86_400_000);
  }

  /**
   * Status transitions are one-way in v1.
   * Only IN_STOCK → SOLD is valid.
   */
  static validateStatusTransition(from: ItemStatus, to: ItemStatus): boolean {
    return from === 'IN_STOCK' && to === 'SOLD';
  }
}
