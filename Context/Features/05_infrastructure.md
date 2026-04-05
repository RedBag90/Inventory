# Feature: Infrastructure & Platform

**Module:** `shared/`, `prisma/`, root config files  
**Priority:** Must Have  
**Depends On:** Nothing  
**Blocks:** All features  

---

## Purpose

Provides the foundational layer all features depend on: database access, environment configuration, type safety, and the shared utilities consumed across the entire app. Nothing works without this layer being correct.

---

## Responsibilities

| Responsibility | Description |
|---|---|
| Database (local) | PostgreSQL via Docker Compose — zero external dependencies during development |
| Database (production) | Supabase (managed PostgreSQL) — connection pooling via PgBouncer |
| ORM | Prisma with strict TypeScript types, migrations, and singleton client |
| Env validation | All environment variables validated via Zod at startup — app won't boot if any are missing |
| Shared utilities | `cn()`, `formatCurrency()`, `formatDate()` — pure functions, no side effects |
| Type safety | `tsconfig.json` with `strict: true` — no `any`, no implicit nulls |
| Import boundaries | ESLint `import/no-internal-modules` — features only accessible via `index.ts` |
| Query provider | TanStack Query `QueryClientProvider` in root layout — available to all features |

---

## Key Files

| File | Role |
|---|---|
| `prisma/schema.prisma` | Single source of truth for the DB schema |
| `prisma/migrations/` | Versioned migration history |
| `src/shared/lib/prisma.ts` | Singleton `PrismaClient` — prevents connection exhaustion on hot reload |
| `src/shared/lib/utils.ts` | `cn()`, `formatCurrency()`, `formatDate()` |
| `src/shared/config/env.ts` | Zod-validated env schema — import `env`, never `process.env` directly |
| `src/shared/types/index.ts` | Cross-feature shared types (`Platform`, `ItemStatus`) |
| `src/shared/components/AppErrorBoundary.tsx` | Reusable feature-level error boundary |
| `src/app/layout.tsx` | Root layout — mounts `ClerkProvider`, `QueryClientProvider`, `Toaster` |
| `middleware.ts` | Clerk Edge middleware — route protection |

---

## Database Setup

### Local Development (Docker)

```yaml
# docker-compose.yml (to be created)
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: inventory
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
```

Both `DATABASE_URL` and `DIRECT_DATABASE_URL` point to the same Docker instance locally.

### Production (Supabase + Vercel)

Supabase provides two connection strings — both are required:

| Variable | URL Type | Port | Used For |
|---|---|---|---|
| `DATABASE_URL` | Pooled (PgBouncer) | 6543 | Runtime queries on Vercel serverless |
| `DIRECT_DATABASE_URL` | Direct | 5432 | `prisma migrate deploy` only |

> **Critical:** Using the direct URL at runtime on Vercel will exhaust PostgreSQL connections under load. Always use the pooled URL for runtime.

---

## Prisma Singleton Pattern

```typescript
// src/shared/lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

This prevents Next.js hot reload from creating multiple `PrismaClient` instances in development.

---

## Environment Variables

```typescript
// src/shared/config/env.ts
const EnvSchema = z.object({
  DATABASE_URL:                      z.string().url(),   // pooled — runtime
  DIRECT_DATABASE_URL:               z.string().url(),   // direct — migrations
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY:                  z.string().min(1),
  CLERK_WEBHOOK_SECRET:              z.string().min(1),
  SENTRY_DSN:                        z.string().url().optional(),
  NODE_ENV:                          z.enum(['development', 'test', 'production']),
});
```

If any required variable is absent or malformed, the app throws at startup — not silently at runtime.

---

## TypeScript Configuration

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

Zero `any` types permitted in production code.

---

## Import Boundary Rule

```
✓  import { InventoryPage } from '@/features/inventory'         (via index.ts)
✗  import { ItemForm } from '@/features/inventory/components/ItemForm'  (internal path)
```

Enforced by ESLint `import/no-internal-modules`. Violations fail CI.

---

## TanStack Query Setup

`QueryClientProvider` is mounted in `src/app/layout.tsx`. TanStack Query DevTools are included in development builds only.

All `useQuery` calls must set `staleTime` explicitly — no implicit refetch-on-every-focus.

---

## Hosting Environments

| Environment | DB | Host |
|---|---|---|
| Local | Docker Compose (PostgreSQL) | — |
| Preview | Supabase | Vercel Preview (per PR) |
| Production | Supabase | Vercel |
