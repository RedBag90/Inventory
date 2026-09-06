# ADR 0001 — The leaderboard has two entry points, on purpose

**Status:** Accepted
**Date:** 2026-09-06

## Context

`getLeaderboardData` was a ten-line pass-through to `computeLeaderboardForInstance`. It looked
like pure indirection — it failed the deletion test, and an architecture review flagged it as
such.

It was not pure indirection. It was a missing guard. The file carried `'use server'` and was
exported from the `@/features/leaderboard` barrel, so it was a live server action reachable
from the browser. It performed no authorization: any authenticated user could pass any
`instanceId` and read that instance's full leaderboard — display names and total profits for
every member. The membership check existed only in `features/admin/services/getLeaderboard.ts`,
which then delegated to the unguarded function.

The obvious fix — add a caller-membership check inside `getLeaderboardData` — would have
broken production. The function had three callers at two different trust levels:

- `app/api/cron/weekly-digest/route.ts` — authenticated by a `CRON_SECRET` bearer token, with
  **no user session at all**. A `getCurrentDbUser()` call throws `Unauthenticated` there, and
  the weekly digest would have failed silently.
- `features/admin/services/getLeaderboard.ts` — resolves membership and `MASTER_ADMIN` itself
  before delegating.
- `features/leaderboard/hooks/useLeaderboard.ts` — the genuinely unguarded browser path.

## Decision

Keep two entry points, named so the trust level is obvious at the call site:

- **`computeLeaderboardForInstance`** — the system path. Unguarded by design. For callers that
  carry their own authorization: the digest cron and the admin preview. Not a server action, so
  it can never be reached from the browser.
- **`getLeaderboardData`** — the client-facing server action. Guarded: the caller must be a
  member of the instance, or `MASTER_ADMIN` (matching what the admin path already permitted).

This is a real seam in the deepening sense — two adapters, not one. Something genuinely varies
across it: whether the caller has a user session to authorize against.

## Consequences

- Do **not** collapse these two functions. They are not duplicates; they serve different trust
  levels, and merging them either breaks the cron or reopens the data leak.
- Do **not** add an authorization check to `computeLeaderboardForInstance`. Its lack of a guard
  is the point. If you need a guarded call, use `getLeaderboardData`.
- Any new caller must pick a side explicitly: does it have a user session, or does it carry its
  own authorization?
- Regression coverage lives in
  `src/features/leaderboard/actions/getLeaderboardData.integration.test.ts`, which asserts both
  that a non-member is refused and that the system path works with no caller at all.
