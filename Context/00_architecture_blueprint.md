# Architektur-Blueprint: Full-Stack Next.js App

> Dieser Blueprint beschreibt die vollständige Architektur der Inventory-App als Referenz und Blaupause für neue Apps mit identischem Setup.
> Stand: Mai 2026

---

## Stack-Übersicht

| Bereich | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Sprache | TypeScript (strict mode) |
| Datenbank | PostgreSQL via Supabase |
| ORM | Prisma 6 (custom output path) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Server State | TanStack React Query v5 |
| Formulare | react-hook-form + Zod |
| Styling | Tailwind CSS v4 (PostCSS) |
| i18n | next-intl v4 (DE + EN) |
| E-Mail | Nodemailer (SMTP / Resend) |
| Observability | Sentry + Vercel Analytics + Speed Insights |
| Testing | Vitest (unit) + Playwright (e2e) + MSW (mocks) |
| Deployment | Vercel (Hobby, 1 Cron/Tag max) |
| CI | GitHub Actions |

---

## 1. Projektstruktur

```
/
├── prisma/
│   ├── schema.prisma          # Datenbankschema
│   ├── seed.ts                # Seed-Einstiegspunkt
│   ├── seed-badges.ts         # Badge-Seed (separates Script)
│   └── migrations/            # Prisma-Migrations (historisch)
├── supabase/
│   └── migrations/            # Manuelle SQL-Migrations (z.B. RLS)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root-Layout (Providers, i18n)
│   │   ├── providers.tsx      # QueryClient + Toaster
│   │   ├── globals.css        # Tailwind + Custom CSS-Klassen
│   │   ├── (auth)/            # Route Group: Auth-Seiten
│   │   ├── (dashboard)/       # Route Group: Geschützte Seiten
│   │   └── api/               # API-Routen (Cron, Auth-Callback)
│   ├── features/              # Feature-Module (Domain-driven)
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── badges/
│   │   ├── admin/
│   │   ├── reporting/
│   │   ├── leaderboard/
│   │   ├── olympiad/
│   │   ├── tutorial/
│   │   ├── invite/
│   │   └── auth/
│   ├── shared/
│   │   ├── components/        # AppErrorBoundary, Sidebar
│   │   ├── config/env.ts      # Zod-validierte Env-Vars
│   │   ├── hooks/             # Shared React Hooks
│   │   ├── lib/
│   │   │   ├── auth/getCurrentUserId.ts
│   │   │   ├── calculations.ts
│   │   │   ├── i18n/request.ts
│   │   │   ├── mailer.ts
│   │   │   ├── prisma.ts
│   │   │   ├── supabase/client.ts
│   │   │   ├── supabase/server.ts
│   │   │   └── utils.ts
│   │   └── types/
│   ├── generated/
│   │   └── prisma/            # Generierter Prisma-Client (custom output)
│   ├── locales/
│   │   ├── de.json
│   │   └── en.json
│   └── test/
│       └── setup.ts
├── e2e/                       # Playwright-Tests
├── Context/                   # DDD-Dokumentation pro Feature
├── middleware.ts              # Supabase Session Refresh (Edge)
├── instrumentation.ts         # Sentry Server
├── instrumentation-client.ts  # Sentry Client
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── vercel.json
└── docker-compose.yml         # Lokale PostgreSQL-Instanz
```

---

## 2. Datenbank & Prisma

### schema.prisma Setup
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"   // Wichtig: custom output!
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")        // Gepoolte Verbindung (PgBouncer) — Runtime
  directUrl = env("DIRECT_DATABASE_URL") // Direkte Verbindung — nur für Migrations
}
```

**Wichtig:** Custom output-Pfad → alle Imports müssen `from '@/generated/prisma'` nutzen, NICHT `from '@prisma/client'`. Das gilt auch für Seed-Scripts (`from '../src/generated/prisma'`).

### Prisma Singleton (`src/shared/lib/prisma.ts`)
```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```
Verhindert Connection-Exhaustion bei Hot-Reload in der Entwicklung.

### Migrations-Workflow
- Schema ändern → `npx prisma db push` (dev, kein Migration-File nötig)
- Manuelle SQL (z.B. RLS) → `supabase/migrations/*.sql` + `npx prisma db execute --file ...`
- Seeds ausführen: `npx tsx prisma/seed-badges.ts`
- Seed-Scripts importieren vom custom Prisma-Client (`../src/generated/prisma`), niemals von `@prisma/client`

---

## 3. Authentifizierung

### Flow (3 Ebenen)

```
Browser → Middleware (Edge) → Dashboard-Layout (Server) → Server Action
          Session-Refresh      syncUser + Redirects        getCurrentUserId()
```

### Ebene 1: Middleware (`middleware.ts`)
- Läuft auf der **Edge Runtime** (kein DB-Zugriff, kein Prisma)
- Erneuert Supabase-Session-Cookies bei jedem Request
- Redirect zu `/sign-in` wenn kein User + Pfad beginnt mit `/dashboard`
- Public Routes überspringen den Supabase-Call komplett: `/sign-in`, `/sign-up`, `/auth/`, `/join/`

### Ebene 2: Dashboard-Layout (`src/app/(dashboard)/layout.tsx`)
```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/sign-in');
const syncedUser = await syncUser(user.id, user.email, user.user_metadata);
```

`syncUser` (`src/features/auth/actions/syncUser.ts`) macht:
1. Upsert User in lokaler Postgres-DB (Supabase-UUID → lokale CUID)
2. Liest `displayName` aus Supabase `user_metadata` bei Erstanlage
3. Redirect `/suspended` wenn `isActive = false`
4. Redirect `/pending-assignment` wenn USER ohne Instanz-Mitgliedschaft
5. Auto-Join via Cookie-Invite-Token oder E-Mail-basiertem `PendingEmailInvite`

### Ebene 3: Server Actions (`src/shared/lib/auth/getCurrentUserId.ts`)
```ts
export async function getCurrentUserId(): Promise<string>        // wirft bei Unauthentiziert
export async function getCurrentDbUser(): Promise<{ id: string; role: UserRole }>
```
**Jede Server Action ruft eine dieser Funktionen als allererstes auf.**

### Supabase-Clients
- **Server** (`src/shared/lib/supabase/server.ts`): `createServerClient` mit `cookies()` — `setAll()` mit `try/catch`, da Server Components read-only sind
- **Client** (`src/shared/lib/supabase/client.ts`): `createBrowserClient` mit `NEXT_PUBLIC_*` Env-Vars
- **Beide** nutzen den Anon-Key, NIEMALS den Service-Role-Key
- Supabase-Client wird **ausschließlich** für `supabase.auth.*` genutzt — alle Datenzugriffe laufen über Prisma

---

## 4. Feature-Modul-Struktur

Jedes Feature folgt exakt diesem Muster:

```
features/[feature]/
├── components/          # React-Komponenten ('use client')
├── hooks/
│   ├── [feature]Keys.ts # Query-Key-Factory (TanStack Query)
│   ├── use[Entity].ts   # Query-Hook (lesen)
│   ├── useCreate[].ts   # Mutation-Hooks
│   ├── useEdit[].ts
│   └── useDelete[].ts
├── services/
│   ├── [Entity]Repository.ts  # Prisma-Queries ('use server')
│   └── [Entity]Manager.ts     # Pure Business Logic (kein I/O)
├── types/
│   └── [feature].types.ts     # Zod-Schemas + TypeScript-Types
└── index.ts                   # Public API (barrel export)
```

### Die drei Service-Schichten

**Repository** (Datenzugriff — nur Prisma):
```ts
'use server';
export async function getItems(): Promise<ItemWithCosts[]> {
  const userId = await getCurrentUserId(); // Auth immer zuerst!
  return prisma.item.findMany({
    where: { userId },
    include: ITEM_INCLUDE,
    orderBy: { purchasedAt: 'desc' },
  });
}
```

**Manager** (Pure Business Logic — kein I/O):
```ts
export class ItemManager {
  static calculateStorageDays(item: ...): number { /* nur Math */ }
  static validateStatusTransition(from: ItemStatus, to: ItemStatus): boolean { /* nur Logik */ }
}
```

**Orchestration / Mutation** (koordiniert Repository + Manager + Transaktionen):
```ts
'use server';
export async function confirmPendingSale(itemId: string, overrides?) {
  const userId = await getCurrentUserId();
  // 1. validate → 2. transaction → 3. award badges → 4. revalidatePath()
  await prisma.$transaction([...]);
  revalidatePath('/dashboard/inventory');
  return { newBadges: [...] };
}
```

---

## 5. Datenzugriffs-Muster (Server → Client)

### Server Component als Einstiegspunkt
```ts
// app/(dashboard)/dashboard/inventory/[id]/page.tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const item = await getItemById((await params).id);
  if (!item) notFound();
  return <ItemDetailPage id={item.id} />;
}
```

### TanStack Query (Client-Side State)

**Query-Key-Factory:**
```ts
export const inventoryKeys = {
  all:    ['inventory'] as const,
  list:   (filters: Record<string, unknown>) => ['inventory', 'list', filters] as const,
  detail: (id: string) => ['inventory', id] as const,
};
```

**Query-Hook:**
```ts
export function useItems() {
  return useQuery({
    queryKey: inventoryKeys.list({}),
    queryFn:  () => getItems(),  // Server Action direkt als queryFn
    staleTime: 60_000,
  });
}
```

**Mutation-Hook:**
```ts
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemInput) => createItem(data),
    onSuccess: ({ newBadges }) => {
      toast.success('Gespeichert');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler'),
  });
}
```

**QueryClient-Setup (`src/app/providers.tsx`):**
```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (count, error) => {
        if (isClientError(error)) return false; // Kein Retry bei 4xx
        return count < 2;
      },
    },
  },
})
```

---

## 6. Formular-Muster

```ts
// 1. Zod-Schema in types/[feature].types.ts
export const CreateItemSchema = z.object({
  name:          z.string().min(1).max(200),
  purchasePrice: z.number().positive(),
  purchasedAt:   z.date(),
});
export type CreateItemInput = z.infer<typeof CreateItemSchema>;

// 2. Formular-Komponente ('use client')
const form = useForm<CreateItemInput>({
  resolver: zodResolver(CreateItemSchema),
  defaultValues: { name: '', purchasePrice: 0 },
});
const { mutate, isPending } = useCreateItem();
const onSubmit = form.handleSubmit((data) => mutate(data));
```

---

## 7. Routing & Route Groups

```
app/
├── (auth)/           # Kein shared Layout — jede Seite eigenständig
│   ├── sign-in/[[...sign-in]]/page.tsx    # [[...]] = Supabase Catch-All
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── suspended/page.tsx
│   ├── pending-assignment/page.tsx
│   └── update-password/page.tsx
│
├── (dashboard)/      # Shared Layout: Auth + syncUser + App-Shell
│   ├── layout.tsx
│   └── dashboard/
│       ├── inventory/page.tsx + loading.tsx
│       ├── inventory/[id]/page.tsx
│       ├── leaderboard/page.tsx + loading.tsx
│       ├── reporting/page.tsx
│       ├── badges/page.tsx
│       └── admin/page.tsx
│
├── api/
│   ├── auth/callback/route.ts       # Supabase OAuth-Callback
│   ├── cron/weekly-digest/route.ts  # Vercel Cron (Bearer-Token-Auth)
│   └── digest/opt-out/route.ts
│
└── join/[token]/page.tsx            # Invite-Link (öffentlich, kein Auth nötig)
```

`loading.tsx` neben jeder `page.tsx` → sofortiger Skeleton-UI beim Navigation.

---

## 8. Styling

### Tailwind v4 (PostCSS-Modus — keine separate `tailwind.config.js`)
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --font-sans:        var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --sidebar-bg:       oklch(0.22 0.06 275);
  --sidebar-border:   oklch(0.30 0.07 275);
  --sidebar-text:     oklch(0.75 0.05 275);
  --sidebar-active-bg: oklch(0.32 0.10 275);
}

@layer components {
  /* Buttons */
  .btn-primary   { @apply bg-indigo-600 text-white px-4 py-2 rounded-xl ... }
  .btn-secondary { @apply bg-white border border-slate-200 ... }
  .btn-danger    { @apply bg-red-600 text-white ... }

  /* Formulare */
  .input-base    { @apply w-full rounded-xl border border-slate-200 px-3 py-2 text-sm ... }
  .label-base    { @apply block text-sm font-medium text-slate-700 mb-1 }

  /* Layout */
  .page-title    { @apply text-xl font-bold text-slate-900 }
  .page-subtitle { @apply text-sm text-slate-500 }
  .card          { @apply bg-white rounded-2xl border border-slate-200 p-5 }
  .slide-panel   { @apply w-full max-w-md bg-white h-full overflow-y-auto shadow-xl }
  .modal-header  { @apply flex justify-between p-5 border-b border-slate-100 }

  /* Status-Chips */
  .status-in-stock { @apply bg-emerald-50 text-emerald-700 ... }
  .status-reserved { @apply bg-amber-50 text-amber-700 ... }
  .status-sold     { @apply bg-slate-100 text-slate-500 ... }
}
```

### Utility-Funktion
```ts
// src/shared/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

---

## 9. i18n (next-intl)

```ts
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n/request.ts');
export default withNextIntl(nextConfig);
```

```ts
// src/shared/lib/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const locale = (await cookies()).get('NEXT_LOCALE')?.value ?? 'de';
  return {
    locale,
    messages: (await import(`@/locales/${locale}.json`)).default,
  };
});
```

```tsx
// src/app/layout.tsx (Root Layout)
const messages = await getMessages();
<NextIntlClientProvider messages={messages}>
  {children}
</NextIntlClientProvider>
```

```tsx
// In Client-Komponenten
const t = useTranslations('inventory');
<h1>{t('title')}</h1>  // → "Inventar" (de) oder "Inventory" (en)
```

Locale-Dateien: `src/locales/de.json` und `src/locales/en.json` — flache JSON-Struktur mit Feature-Namespaces.

---

## 10. Umgebungsvariablen

**Niemals `process.env` direkt nutzen** — immer `import { env } from '@/shared/config/env'`.
ESLint-Regel erzwingt dies projektübergreifend.

```ts
// src/shared/config/env.ts
const EnvSchema = z.object({
  DATABASE_URL:                  z.string().url(),
  DIRECT_DATABASE_URL:           z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SMTP_HOST:                     z.string().optional(),
  SMTP_PORT:                     z.string().optional(),
  SMTP_USER:                     z.string().optional(),
  SMTP_PASS:                     z.string().optional(),
  SMTP_FROM:                     z.string().optional(),
  CRON_SECRET:                   z.string().optional(),
  NEXT_PUBLIC_APP_URL:           z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});
export const env = EnvSchema.parse(process.env);
```

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `DATABASE_URL` | ✅ | PgBouncer-Pool-URL (Vercel Runtime) |
| `DIRECT_DATABASE_URL` | ✅ | Direkte DB-URL (nur Prisma Migrations) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase-Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Anon-Key |
| `SMTP_*` | ⬜ | E-Mail-Versand via Resend/SMTP |
| `CRON_SECRET` | ⬜ | Bearer-Token für Cron-Endpunkt |
| `NEXT_PUBLIC_APP_URL` | ⬜ | Öffentliche URL (für E-Mail-Links) |
| `NEXT_PUBLIC_SENTRY_DSN` | ⬜ | Sentry DSN |

---

## 11. Fehlerbehandlung

- **AppErrorBoundary** (`src/shared/components/AppErrorBoundary.tsx`): React Class Component, fängt Render-Fehler, reportet an Sentry, zeigt "Erneut versuchen"-Button
- **Sentry**: `withSentryConfig()` in `next.config.ts` + `instrumentation.ts` (Server) + `instrumentation-client.ts` (Browser)
- **React Query**: Globale Retry-Logik (kein Retry bei 4xx), `onError`-Callbacks in Mutation-Hooks mit `sonner` Toast
- **Server Actions**: Throws mit aussagekräftigen Fehlermeldungen → werden in Mutation-Hooks mit `toast.error()` angezeigt

---

## 12. Sicherheit

- **RLS (Row Level Security)**: Auf allen Tabellen aktiviert (`supabase/migrations/enable_rls.sql`). Prisma-Verbindung als Postgres-Superuser bypassed RLS automatisch — keine Policies nötig, solange kein PostgREST/Supabase-Client für Daten genutzt wird
- **Ownership-Checks**: Jede Server Action prüft `userId` in der Prisma `WHERE`-Clause
- **Input-Validierung**: Zod-Schemas validieren alle Server-Action-Inputs (niemals rohe Daten vertrauen)
- **Auth-Triple-Check**: Middleware (Edge) → Layout (Server) → Action (Server)

---

## 13. Deployment

### vercel.json
```json
{
  "crons": [{ "path": "/api/cron/weekly-digest", "schedule": "0 8 * * 0" }]
}
```
**Achtung:** Vercel Hobby Plan = max. **1 Cron-Ausführung pro Tag**. Kein stündlicher Cron möglich.

### Build-Script in package.json
```json
"build": "prisma generate && prisma migrate deploy && next build"
```
Reihenfolge: Prisma-Client generieren → ausstehende Migrations anwenden → Next.js bauen.

### Git-Workflow
- **Entwicklung** auf `develop` Branch
- **Merge in `main`** nur auf explizite Anfrage (Merge → Vercel Production Deploy)
- CI via `.github/workflows/ci.yml`: Type-Check + Lint + Tests bei jedem PR

---

## 14. Testing

| Art | Tool | Konfiguration |
|---|---|---|
| Unit / Integration | Vitest | `vitest.config.ts` — jsdom, forks-pool, globale Imports |
| E2E Browser | Playwright | `playwright.config.ts` |
| API-Mocks | MSW v2 | `src/test/setup.ts` |
| Komponenten | Testing Library | mit Vitest |
| Coverage | v8 | `npm run test:coverage` |

---

## 15. Schritt-für-Schritt für eine neue App

1. `npx create-next-app@latest` → TypeScript, App Router, Tailwind, `src/`-Verzeichnis
2. Supabase-Projekt anlegen → E-Mail-Auth aktivieren → Redirect-URLs konfigurieren
3. Prisma installieren + `schema.prisma` mit **custom output** (`../src/generated/prisma`) einrichten
4. `src/shared/lib/` Basis anlegen:
   - `prisma.ts` (Singleton)
   - `supabase/server.ts` + `supabase/client.ts`
   - `auth/getCurrentUserId.ts`
   - `config/env.ts` (Zod-Schema)
5. `middleware.ts` einrichten (Supabase Session-Refresh + `/dashboard`-Schutz)
6. Route Groups anlegen: `(auth)/` + `(dashboard)/`
7. Dashboard-Layout mit `syncUser`-Pattern implementieren
8. `src/app/providers.tsx` mit QueryClient + Toaster
9. next-intl konfigurieren (`next.config.ts` → `i18n/request.ts` → Locale-Dateien)
10. `globals.css` mit Tailwind v4 + Custom CSS-Klassen
11. Erstes Feature-Modul nach dem 3-Schichten-Muster (Repository → Manager → Hooks → Components)
12. Sentry + Vercel Analytics + Speed Insights einbinden
13. RLS auf allen DB-Tabellen aktivieren
14. `vercel.json` + GitHub Actions CI einrichten
