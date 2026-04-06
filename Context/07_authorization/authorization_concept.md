# Authorization & Multi-Tenant Isolation Concept

**Module:** `features/admin/`
**Version:** 1.0 | April 2026
**Status:** Implemented

---

## Problem Statement

The app serves multiple independent resellers. Each user must see only their own inventory, sales, and reports. An operator (admin) needs to manage user accounts without being able to impersonate users or access their data from within the app UI.

---

## Role Model

| Role | Assignment | Capabilities |
|---|---|---|
| `USER` | Default on registration | Full CRUD on own inventory, sales, and reports. No visibility into other users' data. |
| `ADMIN` | Set manually via seed or admin panel | Everything a USER can do, plus: view all registered users, see per-user aggregate stats, promote/demote roles, suspend/reactivate accounts. |

Roles are stored in the `User.role` DB column — not in Supabase Auth JWT claims. This keeps role logic portable, auditable, and prevents privilege escalation via token manipulation.

---

## Three-Layer Isolation Model

```
┌──────────────────────────────────────────────────────────┐
│  Layer 1 — Edge Middleware                               │
│  /dashboard/* → Supabase session check (redirect if not) │
│  /dashboard/admin → no role check here (Edge has no DB)  │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  Layer 2 — Server (Route page + Server Actions)          │
│  /dashboard/admin/page.tsx → Prisma role check, redirect │
│  AdminRepository → requireAdmin() guard on every fn      │
│  ItemRepository, SaleRepository → userId scoping         │
│  ReportingRepository → userId scoping                    │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  Layer 3 — Database (Supabase RLS)                       │
│  Item, Sale, AdditionalCost have RLS policies enabled    │
│  SELECT/INSERT/UPDATE/DELETE scoped to auth.uid() user   │
│  Defense-in-depth: enforced even if app layer bypassed   │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Isolation

Every authenticated request follows this path:

```
Supabase Auth session
      ↓
supabase.auth.getUser() → supabaseId
      ↓
prisma.user.findUnique({ where: { supabaseId } }) → internal userId
      ↓
All Prisma queries: WHERE userId = <internalId>
```

No cross-user data leakage is possible at the application layer. The DB-level RLS policies provide a second enforcement point.

---

## Account Lifecycle

```
User registers (sign-up page)
      ↓
syncUser() called from dashboard layout
      ↓
prisma.user.upsert → role: USER, isActive: true (defaults)
      ↓
Normal dashboard access

[Admin suspends account]
      ↓
isActive = false
      ↓
Next dashboard load → syncUser() → redirect('/suspended')
      ↓
/suspended page shown (no data access)
```

---

## Admin Capabilities (v1)

| Action | Implemented |
|---|---|
| View all users with stats (items, sold, profit) | ✓ |
| Promote USER → ADMIN | ✓ |
| Demote ADMIN → USER | ✓ (self-demotion blocked) |
| Suspend account (isActive = false) | ✓ (self-suspension blocked) |
| Reactivate suspended account | ✓ |
| View individual user's inventory/sales | ✗ (not in v1) |
| Impersonate a user | ✗ (out of scope) |
| Delete a user account | ✗ (out of scope) |

---

## Key Files

| File | Role |
|---|---|
| `prisma/schema.prisma` | `UserRole` enum, `User.role`, `User.isActive` fields |
| `prisma/migrations/20260405234407_add_user_role_and_active/` | DB migration |
| `features/auth/actions/syncUser.ts` | Upserts user, checks isActive, returns role |
| `features/admin/services/AdminRepository.ts` | All admin mutations with `requireAdmin()` guard |
| `features/admin/hooks/useAdminUsers.ts` | TanStack Query hooks for user list + mutations |
| `features/admin/components/AdminPage.tsx` | Admin dashboard UI |
| `app/(dashboard)/dashboard/admin/page.tsx` | Route with server-side role guard |
| `shared/components/Sidebar.tsx` | Admin nav section shown only when `role === ADMIN` |
| `supabase/migrations/20260406000000_rls_user_data_isolation.sql` | RLS policies |
| `app/(auth)/suspended/page.tsx` | Landing page for deactivated accounts |

---

## RLS Migration

The file `supabase/migrations/20260406000000_rls_user_data_isolation.sql` must be applied to the Supabase project when deploying to production:

```bash
supabase db push   # applies all pending migrations to the linked project
```

For local development the migration can be applied with:

```bash
supabase db reset  # re-applies all migrations from scratch
```

---

## Security Properties

| Property | How enforced |
|---|---|
| Users see only their data | userId scoping in every repository query |
| DB-level isolation | Supabase RLS policies on Item, Sale, AdditionalCost |
| Admin routes inaccessible to USER role | Server-side role check in route page + AdminRepository guard |
| Deactivated users cannot access the dashboard | syncUser() redirects to /suspended |
| Admin cannot demote/suspend themselves | Guards in AdminRepository.setUserRole() / setUserActive() |
| Roles cannot be self-assigned | No user-facing role setting endpoint exists |

---

## Out of Scope (v1)

- Per-user data viewing from the admin panel (admin sees stats only, not individual items)
- User impersonation
- Account deletion
- Audit log of admin actions
- OAuth / SSO integration
- Organisation-level multi-tenancy (multiple users sharing one inventory)
