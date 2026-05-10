export function computeProfit(inputs: {
  salePrice: number;
  purchasePrice: number;
  shippingCostIn: number;
  repairCost: number;
  shippingCostOut: number;
  additionalCosts: number[];
}): number {
  return (
    inputs.salePrice
    - inputs.purchasePrice
    - inputs.shippingCostIn
    - inputs.repairCost
    - inputs.shippingCostOut
    - inputs.additionalCosts.reduce((sum, c) => sum + c, 0)
  );
}

export function computeQuickSellProfit(inputs: {
  salePrice: number;
  shippingCostOut: number;
}): number {
  return inputs.salePrice - inputs.shippingCostOut;
}
