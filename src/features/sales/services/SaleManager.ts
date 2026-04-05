// Business logic layer for sales.
// Profit is NEVER stored in the DB — always computed here at runtime.
//
// Responsibilities:
//   - calculateProfit(item): number | null
//   - validateSalePrice(salePrice, purchasePrice): boolean
