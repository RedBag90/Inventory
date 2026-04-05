---
Story ID: US-021
Epic: Reporting
Title: URL-Driven Filter State for Reporting Dashboard
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want my reporting filter selections (view, year, month, quarter) to be reflected in the URL,
So that I can bookmark or share a specific report view and it opens exactly as I left it.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given the reporting page, when the user selects monthly view for April 2026, then the URL becomes `?view=monthly&year=2026&month=4`
- [ ] Given the reporting page, when the user selects quarterly view for Q2 2026, then the URL becomes `?view=quarterly&year=2026&quarter=2`
- [ ] Given the reporting page, when the user selects cumulative view, then the URL becomes `?view=cumulative`
- [ ] Given a bookmarked URL with filters, when visited directly, then the correct report loads immediately without user interaction
- [ ] Given the browser back button, when pressed after changing filters, then the previous filter state is restored
- [ ] Given no URL params, when the reporting page loads, then it defaults to `?view=monthly` for the current year and month

## Definition of Done
- [ ] Filter state read and written exclusively via `useSearchParams` and `router.push`
- [ ] No Zustand store used for filter state
- [ ] Default values applied when URL params are absent (current month/year)
- [ ] Filter component updates URL on change — no intermediate local state
- [ ] Integration test: changing filter updates URL; navigating to URL pre-selects correct filter

## Assumptions
- `next/navigation` `useSearchParams` is used — not a third-party router library
- Filter component is a Client Component (`'use client'`)

## Dependencies
- US-017, US-018, US-019 (reports consume the filter values from URL)

## Open Questions
- None

## Traceability
- Spec section 5.3: Implementierungshinweis — URL-State
- Spec section 9: State Management — Filterauswahl → URL State
- Feature doc: 04_reporting.md — Filter State: URL, Not Zustand
