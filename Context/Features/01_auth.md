# Feature: Auth

**Module:** `features/auth/`  
**Priority:** Must Have  
**Depends On:** Infrastructure & Platform  
**Blocks:** All other features  

---

## Purpose

Manages user identity, session lifecycle, and route protection. Every piece of data in the app is scoped to an authenticated user — auth is the foundation everything else builds on.

---

## Responsibilities

| Responsibility | Description |
|---|---|
| User registration & login | Handled entirely by Clerk — no custom auth UI needed |
| Session management | Access token stored in memory only — never in localStorage |
| Route protection | Clerk middleware protects all `/dashboard/*` and `/api/*` (except webhooks) at the Edge |
| User sync | On first Clerk login, a `User` record is created in the DB via webhook |
| Data isolation | Every DB query filters by `userId` — users never see each other's data |

---

## Key Files

| File | Role |
|---|---|
| `middleware.ts` | Edge middleware — protects routes before any server code runs |
| `features/auth/components/AuthGuard.tsx` | Server-side auth check used in dashboard layout |
| `features/auth/components/UserMenu.tsx` | Clerk `<UserButton />` wrapper for the UI |
| `features/auth/hooks/useCurrentUser.ts` | Client hook — returns the authenticated Clerk user |
| `app/api/webhooks/clerk/route.ts` | Receives Clerk `user.created` event → creates DB User record |
| `app/(auth)/sign-in/` | Clerk-hosted sign-in page |
| `app/(auth)/sign-up/` | Clerk-hosted sign-up page |

---

## Data Model

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique   // maps to Clerk user ID
  email     String   @unique
  createdAt DateTime @default(now())
  items     Item[]
}
```

The `User` record in the DB is created by the Clerk webhook — not by the app itself. The `clerkId` is used to look up the internal `userId` at the start of every authenticated Server Action.

---

## Auth Flow

```
User opens /dashboard/*
      ↓
Clerk middleware (Edge) checks session token
      ↓ (no session)          ↓ (valid session)
Redirect to /sign-in      Request continues
                                ↓
                     Server Action / API Route
                                ↓
                     auth() → clerkId
                                ↓
                     prisma.user.findUniqueOrThrow({ clerkId })
                                ↓
                     dbUser.id used for all subsequent queries
```

---

## Constraints & Rules

- Access token is **never** stored in `localStorage` or `sessionStorage`
- The Clerk webhook endpoint (`/api/webhooks/clerk`) is **excluded** from auth protection in middleware
- No custom auth logic — Clerk handles all token validation, refresh, and revocation
- Supabase Auth is **not used** — Clerk is the sole identity provider
- Row Level Security (RLS) is **not required** — isolation is enforced at the query level

---

## Out of Scope

- OAuth providers beyond what Clerk offers out of the box
- Role-based access control (RBAC)
- Admin panel or user management UI
