---
Story ID: US-024
Epic: Observability & Quality
Title: Unit Tests for Business Logic (SaleManager, ItemManager, Utils)
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want unit tests covering all pure business logic functions,
So that I can refactor safely and catch calculation regressions immediately.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given `SaleManager.calculateProfit()`, when tested with all cost types present, then it returns the correct profit value
- [ ] Given `SaleManager.calculateProfit()`, when the item has no sale, then it returns `null`
- [ ] Given `SaleManager.calculateProfit()`, when additional costs are empty, then it returns `salePrice − purchasePrice − shippingIn − repairCost − shippingOut`
- [ ] Given `SaleManager.validateSalePrice()`, when sale price is 0 or negative, then it returns `false`
- [ ] Given `ItemManager.calculateStorageDays()`, when item is `IN_STOCK`, then it calculates days from `purchasedAt` to today
- [ ] Given `ItemManager.calculateStorageDays()`, when item is `SOLD`, then it calculates days from `purchasedAt` to `soldAt`
- [ ] Given `formatCurrency(25)`, when called, then it returns `"€25.00"` (or locale equivalent)
- [ ] Given the full unit test suite, when run, then all tests pass in under 5 seconds

## Definition of Done
- [ ] `SaleManager.test.ts` covers all `calculateProfit` and `validateSalePrice` cases
- [ ] `ItemManager.test.ts` covers all `calculateStorageDays` edge cases (0 days, same day, multi-year)
- [ ] `utils.test.ts` covers `formatCurrency` and `formatDate`
- [ ] Tests use Vitest — no Jest
- [ ] All tests pass in CI (US-027)
- [ ] Coverage for tested files ≥ 90%

## Assumptions
- Unit tests use no mocks — all tested functions are pure with no external dependencies

## Dependencies
- Business logic must be implemented before tests are written (US-013, US-015)

## Open Questions
- None

## Traceability
- Spec section 18: Testing-Strategie — Unit Tests
- Spec section 12: SaleManager
- Feature doc: 06_observability_quality.md
