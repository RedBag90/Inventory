---
Story ID: US-005
Epic: Auth
Title: User Registration via Clerk
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a new reseller,
I want to register for an account using my email address,
So that I can access my personal inventory dashboard.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given an unauthenticated user, when they visit `/sign-up`, then the Clerk registration UI is rendered
- [ ] Given a valid email and password, when the user submits the form, then Clerk creates the account and redirects to `/dashboard/inventory`
- [ ] Given a duplicate email, when the user submits, then Clerk displays an appropriate error message
- [ ] Given successful registration, when the Clerk webhook fires, then a `User` record is created in the DB (covered by US-008)
- [ ] Given a new user on the dashboard, when the page loads, then the inventory list is empty

## Definition of Done
- [ ] `app/(auth)/sign-up/[[...sign-up]]/page.tsx` renders Clerk `<SignUp />`
- [ ] `ClerkProvider` mounted in root layout
- [ ] Redirect after sign-up points to `/dashboard/inventory`
- [ ] Acceptance criteria verified manually and by E2E test (US-026)

## Assumptions
- Clerk handles all email verification — no custom flow needed
- No social login (Google, GitHub) required in v1

## Dependencies
- US-001 (DB running)
- US-003 (env variables include Clerk keys)
- US-008 (webhook creates DB User record post-registration)

## Open Questions
- None

## Traceability
- Spec section 5.4: Auth & Multi-User
- Feature doc: 01_auth.md
