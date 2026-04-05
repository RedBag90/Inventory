'use server';
// Data access layer — aggregation queries for reporting.
// No UI logic. Profit computed here — never read from DB.
// Auth check (Clerk) must happen before every query.
//
// Functions:
//   - getMonthlyReport(year, month): MonthlyReport
//   - getQuarterlyReport(year, quarter): QuarterlyReport
//   - getCumulativeReport(): CumulativeReport
