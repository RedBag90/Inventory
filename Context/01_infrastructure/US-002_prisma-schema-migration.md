---
Story ID: US-002
Epic: Infrastructure & Platform
Title: Prisma Schema, Migrations & Singleton Client
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want Prisma configured with the full schema, an initial migration, and a singleton client,
So that all features have a type-safe, consistent way to access the database.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given `prisma/schema.prisma`, when `prisma migrate dev` is run, then all models (User, Item, Sale, AdditionalCost) and enums (ItemStatus, Platform) are created in the DB
- [ ] Given the schema, when `prisma generate` is run, then the Prisma client is generated with full TypeScript types
- [ ] Given `shared/lib/prisma.ts`, when the app hot-reloads in development, then no "too many clients" warning appears (singleton pattern active)
- [ ] Given `schema.prisma`, when it contains both `url` and `directUrl`, then `prisma migrate deploy` uses the direct URL and runtime queries use the pooled URL
- [ ] Given the schema, when DB indexes are inspected, then `(userId, status)`, `(userId, purchasedAt)`, and `(soldAt)` indexes exist

## Definition of Done
- [ ] `prisma/schema.prisma` complete with all models, enums, and indexes
- [ ] Initial migration file committed to `prisma/migrations/`
- [ ] `src/shared/lib/prisma.ts` implements singleton pattern
- [ ] Both `DATABASE_URL` and `DIRECT_DATABASE_URL` present in `EnvSchema`
- [ ] `prisma generate` runs cleanly in CI

## Assumptions
- `Decimal(10,2)` is used for all monetary fields — never `Float`
- Profit is never added as a DB column

## Dependencies
- US-001 (Docker PostgreSQL running)
- US-003 (env variables validated before Prisma client initialises)

## Open Questions
- None

## Traceability
- Spec section 17: Database schema
- Spec section 20, Step 3: Prisma Setup
- Feature doc: 05_infrastructure.md
