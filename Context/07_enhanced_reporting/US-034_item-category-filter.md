---
Story ID: US-034
Epic: Enhanced Reporting
Title: Item / Category Multi-Select Filter
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to filter the dashboard to show data for specific items or item categories,
So that I can analyze the performance of a subset of my inventory (e.g. electronics vs. clothing).

## MoSCoW Priority
- [ ] Should Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the filter bar, when the user opens the item filter, then a multi-select dropdown lists all items the user has ever sold (deduplicated by name or category)
- [ ] Given items are selected, when all panels render, then only those items contribute to the data
- [ ] Given all items are deselected, when the filter is applied, then charts show zero values (not all items)
- [ ] Given no filter is applied (default), when the dashboard loads, then all items are included
- [ ] Given a selection, when the URL is shared, then `?items=id1,id2,id3` preserves the selection
- [ ] Given the filter, when an admin views another user's report, then the item list is populated from that user's items (not the admin's)

## Note on "Projects" → Items mapping
In this tracker, the concept of "Projects" from the portfolio dashboard maps to individual sold **items**. Each item contributes its revenue and costs as a distinct unit of analysis. Color coding in stacked charts will assign a stable color per item (cycling through a defined palette of 14+ colors).

## Definition of Done
- [ ] `Item` name/ID multi-select rendered in global filter bar
- [ ] `itemIds` added to URL state and `useReportingFilters()`
- [ ] Repository layer accepts optional `itemIds: string[]` to filter `WHERE sale.itemId IN (...)`
- [ ] Color palette of 14 distinct colors defined in `reportingColors.ts`
- [ ] Each item consistently mapped to the same color index within a session

## Dependencies
- US-031 (dashboard layout)
- US-033 (date range filter — must integrate into same filter bar)

## Open Questions
- Should filters be per-item (granular) or per-category (grouped by `Item.name` prefix)?
  → v1: per-item. Categories can be derived in a later story once `Item.category` field is added to the schema.
