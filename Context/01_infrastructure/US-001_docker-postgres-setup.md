---
Story ID: US-001
Epic: Infrastructure & Platform
Title: Docker Compose PostgreSQL Local Setup
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want a Docker Compose configuration that spins up a local PostgreSQL instance,
So that I can develop and test the app without any external database dependency.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given a fresh clone of the repo, when `docker compose up -d` is run, then a PostgreSQL 16 instance is running on port 5432
- [ ] Given the container is running, when a Prisma migration is executed, then the schema is applied without errors
- [ ] Given the `.env` file, when `DATABASE_URL` and `DIRECT_DATABASE_URL` both point to the local instance, then the app connects successfully
- [ ] Given `docker compose down`, when it is run, then the container stops cleanly with no dangling volumes

## Definition of Done
- [ ] `docker-compose.yml` committed to repo root
- [ ] `.env.example` includes both `DATABASE_URL` and `DIRECT_DATABASE_URL` pointing to local instance
- [ ] `.env` is in `.gitignore`
- [ ] README documents `docker compose up -d` as the setup step
- [ ] Connection verified by running `prisma db push`

## Assumptions
- PostgreSQL version 16 is used to match Supabase's managed offering
- pgAdmin is optional and not required for CI

## Dependencies
- None — this is the first infrastructure story

## Open Questions
- None

## Traceability
- Spec section 20, Step 2: Docker Compose setup
- Feature doc: 05_infrastructure.md
