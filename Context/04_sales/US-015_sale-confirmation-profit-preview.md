---
Story ID: US-015
Epic: Sales
Title: Sale Confirmation Step with Profit Preview
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see a profit preview before confirming a sale,
So that I can verify the numbers are correct before the record is committed.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given a completed sale form, when the user clicks "Review Sale", then a confirmation screen shows the computed profit breakdown before any DB write
- [ ] Given the confirmation screen, when the profit is positive, then it is displayed in green
- [ ] Given the confirmation screen, when the profit is zero or negative, then it is displayed in amber/red with a warning
- [ ] Given the confirmation screen, when the user clicks "Confirm", then the sale is committed (US-014 flow executes)
- [ ] Given the confirmation screen, when the user clicks "Back", then they return to the form with all values intact
- [ ] Given the profit breakdown, when displayed, then it shows each cost line individually (not just the total)

## Definition of Done
- [ ] `SaleConfirmation.tsx` component renders profit breakdown using `SaleManager.calculateProfit()`
- [ ] Profit formula verified matches spec: `salePrice − purchasePrice − shippingIn − repairCost − shippingOut − Σ(additionalCosts)`
- [ ] No DB write occurs until the user explicitly confirms
- [ ] Unit test: `SaleManager.calculateProfit()` returns correct value for all cost combinations

## Assumptions
- Profit is computed from form values + existing item costs — no DB read required for the preview
- The confirmation is a UI step only — no separate API call

## Dependencies
- US-014 (sale form provides the input values)
- Spec section 12: `SaleManager.calculateProfit()`

## Open Questions
- None

## Traceability
- Spec section 5.2: Automatische Gewinnberechnung
- Spec section 12: Gewinnberechnung Manager-Schicht
- Feature doc: 03_sales.md
