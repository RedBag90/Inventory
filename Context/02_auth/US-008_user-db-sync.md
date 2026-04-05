---
Story ID: US-008
Epic: Auth
Title: User DB Sync on First Login via Clerk Webhook
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a system,
I want to create a `User` record in the database when a new Clerk user registers,
So that inventory items can be associated with an internal user ID for data isolation.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given a new Clerk user registers, when the `user.created` webhook fires, then a `User` row is created in the DB with `clerkId` and `email`
- [ ] Given a duplicate `user.created` event (webhook retry), when it fires, then the handler does not create a duplicate `User` row (idempotent)
- [ ] Given an invalid webhook signature, when the request hits the endpoint, then a `400` is returned and no DB write occurs
- [ ] Given the webhook handler, when a Server Action later calls `auth()`, then `prisma.user.findUniqueOrThrow({ clerkId })` resolves to the correct user
- [ ] Given the webhook endpoint, when hit without a valid Clerk signature header, then the request is rejected

## Definition of Done
- [ ] `app/api/webhooks/clerk/route.ts` handles `POST` with `user.created` event
- [ ] Clerk webhook signature verified using `CLERK_WEBHOOK_SECRET`
- [ ] Handler is idempotent — `upsert` or existence check before `create`
- [ ] Webhook URL registered in Clerk dashboard (documented in README)
- [ ] `CLERK_WEBHOOK_SECRET` in `EnvSchema` (already covered by US-003)

## Assumptions
- Only `user.created` events are handled in v1 — `user.deleted` is out of scope
- User deletion / data cleanup is out of scope for v1

## Dependencies
- US-002 (Prisma `User` model exists)
- US-003 (webhook secret available via env)
- US-007 (webhook route excluded from auth middleware)

## Open Questions
- Should `user.deleted` events clean up inventory data? → Out of scope v1, flag for v2
- Should `user.updated` events (e.g. email change in Clerk) sync the updated email to the `User` DB record? → The current handler only listens to `user.created`. If the email drifts the user will see their old email in the UI. Flag for v2: add a `user.updated` handler that patches `User.email`.

## Traceability
- Spec section 14: User-Sync beim ersten Login
- Feature doc: 01_auth.md
