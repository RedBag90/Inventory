---
Story ID: US-006
Epic: Auth
Title: User Sign-In via Clerk
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a returning reseller,
I want to sign in with my email and password,
So that I can access my inventory and reporting data.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given an unauthenticated user, when they visit `/sign-in`, then the Clerk sign-in UI is rendered
- [ ] Given valid credentials, when the user submits, then they are redirected to `/dashboard/inventory`
- [ ] Given invalid credentials, when the user submits, then Clerk displays an error — no redirect occurs
- [ ] Given an authenticated session, when the user visits `/sign-in`, then they are redirected to `/dashboard/inventory` (no double login)
- [ ] Given a valid session, when the user closes and reopens the browser, then the session is restored without requiring re-authentication

## Definition of Done
- [ ] `app/(auth)/sign-in/[[...sign-in]]/page.tsx` renders Clerk `<SignIn />`
- [ ] Redirect after sign-in points to `/dashboard/inventory`
- [ ] Session token is stored in memory only — not in `localStorage`

## Assumptions
- Session persistence is managed entirely by Clerk — no custom token storage

## Dependencies
- US-005 (user must have registered first)
- US-007 (dashboard routes are protected and require valid session)

## Open Questions
- None

## Traceability
- Spec section 5.4: Auth & Multi-User
- Feature doc: 01_auth.md
