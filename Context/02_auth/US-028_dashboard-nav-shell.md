---
Story ID: US-028
Epic: Auth
Title: Dashboard Navigation Shell
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As an authenticated user,
I want a persistent navigation shell in the dashboard with links to all sections,
So that I can move between Inventory and Reporting without losing context or needing to use the browser's back button.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given any `/dashboard/*` page, when it renders, then the navigation shell is visible with links to "Inventory" (`/dashboard/inventory`) and "Reporting" (`/dashboard/reporting`)
- [ ] Given the user is on the Inventory page, when the nav renders, then the Inventory link is styled as active
- [ ] Given the user is on the Reporting page, when the nav renders, then the Reporting link is styled as active
- [ ] Given the nav shell, when it renders, then it displays the signed-in user's name or email
- [ ] Given the nav shell, when it renders, then a sign-out control is accessible (delegates to US-029)
- [ ] Given a mobile viewport, when the nav renders, then it remains usable (no horizontal overflow or hidden links)

## Definition of Done
- [ ] `app/(dashboard)/layout.tsx` implements the shared dashboard shell
- [ ] `DashboardNav.tsx` component uses `usePathname()` for active link detection
- [ ] Nav is a Server Component where possible; active-state logic is in a Client Component child
- [ ] Links use `next/link` — no `<a>` tags
- [ ] No duplicate `QueryClientProvider` or `ClerkProvider` — layout nesting handled correctly

## Assumptions
- No mobile hamburger menu required in v1 — a simple responsive flex layout is sufficient
- Logo/brand mark is optional in v1

## Dependencies
- US-007 (dashboard routes are protected — only authenticated users reach this layout)
- US-005, US-006 (authenticated user identity available via Clerk)
- US-029 (sign-out control referenced in nav)

## Open Questions
- None

## Traceability
- Spec section 5: Feature-Übersicht — Dashboard shell implied by multi-section navigation
- Feature doc: 01_auth.md
