---
Story ID: US-007
Epic: Auth
Title: Dashboard Route Protection via Clerk Middleware
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a system,
I want all `/dashboard/*` and `/api/*` routes (except webhooks) protected by Clerk middleware at the Edge,
So that unauthenticated requests are rejected before any server code or database query runs.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given an unauthenticated request to `/dashboard/inventory`, when it hits the middleware, then the user is redirected to `/sign-in`
- [ ] Given an authenticated request to `/dashboard/inventory`, when it hits the middleware, then the request proceeds normally
- [ ] Given a request to `/api/webhooks/clerk`, when it hits the middleware, then it is NOT blocked (webhook route is excluded)
- [ ] Given a request to any `/api/*` route (except webhooks), when unauthenticated, then a 401 is returned
- [ ] Given a static asset request (`/_next/*`, `*.png`, etc.), when it hits the middleware, then it is not intercepted

## Definition of Done
- [ ] `middleware.ts` at repo root with `clerkMiddleware` and `createRouteMatcher`
- [ ] Middleware matcher excludes static assets and Next.js internals
- [ ] Webhook route explicitly excluded from protection
- [ ] Middleware runs at the Edge (no Node.js runtime)

## Assumptions
- No public API routes in v1 — all `/api/*` except webhooks require auth

## Dependencies
- US-003 (Clerk keys available via validated env)
- US-005, US-006 (sign-in/sign-up routes must exist as redirect targets)

## Open Questions
- None

## Traceability
- Spec section 14: Auth Integration — Middleware
- Feature doc: 01_auth.md
