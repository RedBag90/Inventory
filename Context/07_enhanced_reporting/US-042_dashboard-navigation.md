---
Story ID: US-042
Epic: Enhanced Reporting
Title: Dashboard Sub-Page Navigation Panel
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want a navigation panel within the reporting section to switch between the classic reports and the new enhanced dashboard,
So that I can access different reporting views without losing my current filter state.

## MoSCoW Priority
- [ ] Should Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given the reporting section, when the user lands on it, then a top-level tab or left navigation panel shows: "Overview" (existing monthly/quarterly/cumulative) and "Dashboard" (new 7-panel view)
- [ ] Given the "Dashboard" tab, when selected, then the new multi-panel layout (US-031) is shown
- [ ] Given the "Overview" tab, when selected, then the existing ReportingPage behavior is preserved
- [ ] Given navigation between tabs, when the user switches, then the URL reflects the active page (`/dashboard/reporting` vs `/dashboard/reporting/dashboard`)
- [ ] Given admin user-select, when present, then the selected userId is preserved across tab switches

## Definition of Done
- [ ] Reporting section has a secondary navigation (tabs or left sidebar sub-links)
- [ ] Routes: `/dashboard/reporting` → existing view; `/dashboard/reporting/dashboard` → new 7-panel view
- [ ] Active tab highlighted
- [ ] Admin user selector shared between both views via URL param

## Dependencies
- US-031 (new dashboard page)
- US-028 (existing nav shell)

## Open Questions
- None
