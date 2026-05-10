import type { ItemWithCosts } from '@/features/inventory';
import { computeProfit } from '../lib/computeProfit';

// Business logic layer for sales.
// Profit is NEVER stored in the DB — always computed here at runtime.

export class SaleManager {
  static calculateProfit(item: ItemWithCosts): number | null {
    if (!item.sale) return null;
    return computeProfit({
      salePrice:       item.sale.salePrice,
      purchasePrice:   item.purchasePrice,
      shippingCostIn:  item.shippingCostIn,
      repairCost:      item.repairCost,
      shippingCostOut: item.sale.shippingCostOut,
      additionalCosts: item.costs.map(c => c.amount),
    });
  }

  /**
   * Validates that a sale price is acceptable.
   * Returns false if salePrice is 0 or negative.
   */
  static validateSalePrice(salePrice: number): boolean {
    return salePrice > 0;
  }
}
