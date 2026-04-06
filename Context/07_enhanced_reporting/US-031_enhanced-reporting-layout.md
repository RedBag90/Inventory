---
Story ID: US-031
Epic: Enhanced Reporting
Title: Enhanced Reporting Dashboard Layout (7-Panel)
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want a comprehensive reporting dashboard with multiple analytical panels arranged in an executive-level layout,
So that I can understand my business performance from multiple perspectives at a glance.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the reporting page, when a user navigates to it, then 7 chart panels are displayed in a 2-row grid (3 top + 4 bottom)
- [ ] Given the layout, when viewed on desktop, then all panels are visible without horizontal scrolling
- [ ] Given the dashboard, when any global filter changes, then all panels update simultaneously
- [ ] Given the layout, when a panel is loading data, then a skeleton placeholder is shown for that panel only (not the whole page)
- [ ] Given the dashboard, when on mobile, then panels stack vertically in a readable single-column layout

## Panel Inventory
| Position | Panel Name | Story |
|---|---|---|
| Top-Left | Benefit Velocity | US-035 |
| Top-Center | Cost Distribution | US-036 |
| Top-Right | ROI Comparison | US-037 |
| Bottom-1 | Gained Value Analysis | US-038 |
| Bottom-2 | Cumulative Cost Analysis | US-039 |
| Bottom-3 | Cash Flow (Positive/Negative) | US-040 |
| Bottom-4 | Break-Even Analysis | US-041 |

## Definition of Done
- [ ] `ReportingDashboard.tsx` composes all 7 panels with shared filter context
- [ ] Global filter state (time scale, date range, item selection) passed via React Context or props
- [ ] Each panel renders independently with its own loading state
- [ ] Layout uses CSS Grid, responsive at sm/md/lg breakpoints
- [ ] Page navigation shell (US-042) is integrated

## Dependencies
- US-017 through US-021 (existing reporting must be functional)
- US-032 (time scale toggle)
- US-033 (date range filter)
- US-034 (item filter)

## Open Questions
- Should existing monthly/quarterly/cumulative tabs coexist with the new dashboard, or replace them?
  → Recommendation: add as a new "Dashboard" tab alongside existing views
