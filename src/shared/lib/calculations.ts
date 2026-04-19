export type SaleForProfit = {
  salePrice:       { toNumber(): number };
  shippingCostOut: { toNumber(): number };
  item: {
    purchasePrice:  { toNumber(): number };
    shippingCostIn: { toNumber(): number };
    repairCost:     { toNumber(): number };
    costs:          Array<{ amount: { toNumber(): number } }>;
  };
};

export function computeProfit(sale: SaleForProfit): number {
  return (
    sale.salePrice.toNumber()
    - sale.item.purchasePrice.toNumber()
    - sale.item.shippingCostIn.toNumber()
    - sale.item.repairCost.toNumber()
    - sale.shippingCostOut.toNumber()
    - sale.item.costs.reduce((s, c) => s + c.amount.toNumber(), 0)
  );
}
