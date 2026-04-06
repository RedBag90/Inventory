import type { ItemWithCosts } from '@/features/inventory/types/inventory.types';

// Business logic layer for sales.
// Profit is NEVER stored in the DB — always computed here at runtime.

export class SaleManager {
  /**
   * Computes profit for a sold item.
   * Returns null if the item has no sale record (not yet sold).
   *
   * Formula: salePrice − purchasePrice − shippingCostIn − repairCost − shippingCostOut − Σ(additionalCosts)
   */
  static calculateProfit(item: ItemWithCosts): number | null {
    if (!item.sale) return null;

    const additionalCostsTotal = item.costs.reduce((sum, c) => sum + c.amount, 0);

    return (
      item.sale.salePrice
      - item.purchasePrice
      - item.shippingCostIn
      - item.repairCost
      - item.sale.shippingCostOut
      - additionalCostsTotal
    );
  }

  /**
   * Validates that a sale price is acceptable.
   * Returns false if salePrice is 0 or negative.
   */
  static validateSalePrice(salePrice: number): boolean {
    return salePrice > 0;
  }
}
