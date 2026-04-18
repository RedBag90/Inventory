import { describe, it, expect } from 'vitest';
import { SaleManager } from './SaleManager';
import type { ItemWithCosts } from '@/features/inventory/types/inventory.types';

function makeItem(overrides: Partial<ItemWithCosts> = {}): ItemWithCosts {
  return {
    id:               'item-1',
    name:             'Test Item',
    description:      null,
    purchasePrice:    10,
    purchasePlatform: 'KLEINANZEIGEN',
    purchasedAt:      new Date('2026-01-01'),
    shippingCostIn:   2,
    repairCost:       1,
    status:           'SOLD',
    createdAt:        new Date('2026-01-01'),
    updatedAt:        new Date('2026-01-01'),
    userId:           'user-1',
    costs:            [],
    sale:             {
      id:              'sale-1',
      salePrice:       20,
      salePlatform:    'KLEINANZEIGEN',
      shippingCostOut: 3,
      soldAt:          new Date('2026-02-01'),
    },
    ...overrides,
  };
}

describe('SaleManager.calculateProfit', () => {
  it('computes profit with all cost types', () => {
    const item = makeItem({
      purchasePrice:   10,
      shippingCostIn:  2,
      repairCost:      1,
      costs:           [{ id: 'c1', label: 'Reinigung', amount: 0.5, itemId: 'item-1' }],
      sale:            { id: 's1', salePrice: 20, salePlatform: 'EBAY', shippingCostOut: 3, soldAt: new Date() },
    });
    // 20 - 10 - 2 - 1 - 3 - 0.5 = 3.5
    expect(SaleManager.calculateProfit(item)).toBe(3.5);
  });

  it('computes profit with no additional costs', () => {
    const item = makeItem({
      purchasePrice:   10,
      shippingCostIn:  0,
      repairCost:      0,
      costs:           [],
      sale:            { id: 's1', salePrice: 15, salePlatform: 'EBAY', shippingCostOut: 0, soldAt: new Date() },
    });
    // 15 - 10 = 5
    expect(SaleManager.calculateProfit(item)).toBe(5);
  });

  it('returns null for unsold item', () => {
    const item = makeItem({ sale: null, status: 'IN_STOCK' });
    expect(SaleManager.calculateProfit(item)).toBeNull();
  });

  it('returns negative profit when costs exceed revenue', () => {
    const item = makeItem({
      purchasePrice:  50,
      shippingCostIn: 5,
      repairCost:     5,
      costs:          [],
      sale:           { id: 's1', salePrice: 20, salePlatform: 'EBAY', shippingCostOut: 5, soldAt: new Date() },
    });
    // 20 - 50 - 5 - 5 - 5 = -45
    expect(SaleManager.calculateProfit(item)).toBe(-45);
  });

  it('sums multiple additional costs', () => {
    const item = makeItem({
      purchasePrice:  10,
      shippingCostIn: 0,
      repairCost:     0,
      costs:          [
        { id: 'c1', label: 'A', amount: 1, itemId: 'item-1' },
        { id: 'c2', label: 'B', amount: 2, itemId: 'item-1' },
        { id: 'c3', label: 'C', amount: 3, itemId: 'item-1' },
      ],
      sale: { id: 's1', salePrice: 20, salePlatform: 'EBAY', shippingCostOut: 0, soldAt: new Date() },
    });
    // 20 - 10 - 0 - 0 - 0 - 6 = 4
    expect(SaleManager.calculateProfit(item)).toBe(4);
  });
});

describe('SaleManager.validateSalePrice', () => {
  it('returns true for positive price', () => {
    expect(SaleManager.validateSalePrice(9.99)).toBe(true);
    expect(SaleManager.validateSalePrice(100)).toBe(true);
  });

  it('returns false for zero', () => {
    expect(SaleManager.validateSalePrice(0)).toBe(false);
  });

  it('returns false for negative price', () => {
    expect(SaleManager.validateSalePrice(-1)).toBe(false);
    expect(SaleManager.validateSalePrice(-0.01)).toBe(false);
  });
});
