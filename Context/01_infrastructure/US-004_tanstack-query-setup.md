---
Story ID: US-004
Epic: Infrastructure & Platform
Title: TanStack Query Provider & DevTools Setup
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want TanStack Query configured at the root of the app with DevTools available in development,
So that all features can use consistent server-state caching without duplicating setup.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given `app/layout.tsx`, when it renders, then `QueryClientProvider` wraps all children
- [ ] Given the app running in `development` mode, when the UI loads, then TanStack Query DevTools are visible and accessible
- [ ] Given the app running in `production` mode, when the UI loads, then DevTools are not included in the bundle
- [ ] Given any `useQuery` call in any feature, when it executes, then it has access to the shared `QueryClient`
- [ ] Given a `useQuery` call without an explicit `staleTime`, when reviewed in a PR, then CI lint rule flags it as a violation

## Definition of Done
- [ ] `QueryClientProvider` mounted in `src/app/layout.tsx`
- [ ] `ReactQueryDevtools` imported conditionally (`process.env.NODE_ENV === 'development'`)
- [ ] ESLint rule or custom lint check in place to enforce explicit `staleTime` on all `useQuery` calls
- [ ] No feature-level `QueryClient` instantiation — one shared instance only

## Assumptions
- `QueryClient` is instantiated once at the module level, not inside a component

## Dependencies
- US-003 (env validated before layout mounts)

## Open Questions
- How should the `staleTime` requirement be enforced? Two options: (a) `eslint-plugin-query` — has a built-in rule that flags `useQuery` calls missing explicit `staleTime`; (b) a custom ESLint rule. Option (a) is preferred as it requires no custom code, but the specific rule name must be confirmed against the installed plugin version.

## Traceability
- Spec section 20, Step 5: TanStack Query Setup
- Feature doc: 05_infrastructure.md
