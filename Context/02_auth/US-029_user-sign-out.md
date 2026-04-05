---
Story ID: US-029
Epic: Auth
Title: User Sign-Out
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As an authenticated user,
I want to sign out of my account,
So that my session ends and no one else using the device can access my inventory data.

## MoSCoW Priority
- [x] Must Have

## Story Points: 1

## Acceptance Criteria
- [ ] Given the dashboard navigation shell, when the user clicks the sign-out control, then the Clerk session is terminated and the user is redirected to `/sign-in`
- [ ] Given a signed-out state, when the user presses the browser back button, then they are NOT returned to the dashboard (session is genuinely cleared)
- [ ] Given a signed-out state, when the user navigates directly to `/dashboard/inventory`, then they are redirected to `/sign-in` (middleware still enforces protection)
- [ ] Given the sign-out control, when it is rendering, then it is clearly labelled (e.g. "Sign out") — not hidden behind an ambiguous icon

## Definition of Done
- [ ] Clerk `useClerk().signOut()` or `<SignOutButton>` used — no custom session clearing logic
- [ ] `afterSignOutUrl` configured to redirect to `/sign-in`
- [ ] Sign-out control rendered within `DashboardNav.tsx` (US-028)

## Assumptions
- Clerk handles all token revocation — no custom server-side session invalidation needed
- A confirmation dialog before sign-out is not required in v1

## Dependencies
- US-006 (user must be signed in for sign-out to apply)
- US-028 (sign-out control lives in the nav shell)

## Open Questions
- None

## Traceability
- Spec section 5.4: Auth & Multi-User — session management
- Feature doc: 01_auth.md
