# Reseller Inventory & Profit Tracker — Product Spec

**Version:** 2.1 (Hosting & Database Strategy Update)
**Status:** Draft
**Datum:** April 2026
**Stack-Baseline:** Next.js 15 · React 19 · TypeScript strict · TanStack Query v5 · Zustand · Tailwind v4 · shadcn/ui · Prisma · Clerk · Vitest · Playwright

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 2.0 | April 2026 | — | Initial Best-Practice Draft |
| 2.1 | April 2026 | — | Hosting-Strategie präzisiert: Vercel + Supabase (Phase 2); Prisma Dual-URL Pattern ergänzt; Env-Schema erweitert |

---

## 1. Zusammenfassung

Eine Web-App für Reseller, die Artikel auf Plattformen wie Kleinanzeigen und eBay kaufen und weiterverkaufen. Die App bildet den gesamten Lebenszyklus eines Items ab — vom Einkauf bis zum Verkauf — und liefert klare finanzielle Auswertungen auf Monats-, Quartals- und kumulierter Basis.

---

## 2. Problem

Wer regelmäßig Artikel kauft und auf verschiedenen Plattformen weiterverkauft, verliert schnell den Überblick über:

- Was liegt aktuell im Lager?
- Was hat ein Item wirklich gekostet (inkl. Versand, Reparaturen)?
- Wie viel Gewinn wurde tatsächlich gemacht — und wann?

Bestehende Werkzeuge (Excel, Notizbücher) sind fehleranfällig und liefern kein strukturiertes Reporting.

---

## 3. Zielgruppe

| Phase | Nutzer |
|---|---|
| Initial | Einzelnutzer (Entwickler selbst) |
| Später | Beliebige Reseller mit eigenem Portfolio |

Jeder Nutzer verwaltet sein Portfolio vollständig unabhängig von anderen.

---

## 4. Tech-Stack (konkretisiert)

| Schicht | Technologie | Begründung |
|---|---|---|
| Framework | **Next.js 15** (App Router, React 19) | Hybrid Rendering, Server Components, Server Actions |
| Sprache | **TypeScript strict** | `strict: true` in tsconfig, keine `any`s |
| UI | **Tailwind CSS v4 + shadcn/ui** | Zero Runtime, RSC-kompatibel, Code liegt lokal |
| Varianten | **CVA** (Class Variance Authority) | Typsichere Komponentenvarianten |
| Charts | **Recharts** | React-nativ, kompatibel mit RSC (nur in Client Components) |
| Server State | **TanStack Query v5** | Caching, Deduplication, Retry, staleTime-Kontrolle |
| Client State | **Zustand** | UI-State (z.B. Filterauswahl), keine Server-Daten |
| Formulare | **React Hook Form + Zod** | Perf, typsichere Validierung ohne Boilerplate |
| ORM | **Prisma** | Typsicherheit, einfache Migrations |
| Datenbank (lokal) | **PostgreSQL** via Docker Compose | Entwicklung & Tests ohne externe Abhängigkeit |
| Datenbank (prod) | **Supabase** (PostgreSQL) | Managed Postgres, Connection Pooling via PgBouncer, Phase 2 |
| Auth | **Clerk** | Multi-User, prebuilt UI, Next.js-native |
| Fehlermonitoring | **Sentry** | Automatisches Capturing via React 19 Root Hooks |
| Testing | **Vitest + RTL + Playwright + MSW** | 2–4× schneller als Jest, reale Netzwerk-Mocks |
| Hosting | **Vercel** | Next.js-nativ, Preview URLs per PR, Zero Config mit GitHub App |

> **Wichtig:** TanStack Query war im ursprünglichen Stack nicht enthalten. Er ist jedoch **Pflicht** — ohne ihn werden Inventar-, Verkaufs- und Reporting-Daten in Zustand oder useState zwischengespeichert, was zu Stale-Data-Bugs und doppeltem Refetching führt.

---

## 5. Kernfunktionen

### 5.1 Lagerverwaltung (Feature: `inventory`)
- Items erfassen: Name, Beschreibung (optional), Einkaufspreis, Einkaufsplattform, Kaufdatum
- Kosten pro Item: Versandkosten (Einkauf), Reparaturkosten, beliebige Zusatzkosten (Label + Betrag)
- Lagerzeit: automatisch berechnet (`Kaufdatum → Verkaufsdatum`)
- Item-Status: `IN_STOCK` / `SOLD` (erweiterbar)

### 5.2 Verkaufserfassung (Feature: `sales`)
- Verkauf erfassen: Verkaufspreis, Plattform, Versandkosten (Ausgang), Datum
- Automatische Gewinnberechnung (nur zur Laufzeit, nicht in DB gespeichert):

```
Gewinn = Verkaufspreis
       − Einkaufspreis
       − Versandkosten (Eingang)
       − Reparaturkosten
       − Versandkosten (Ausgang)
       − Σ(Zusatzkosten)
```

### 5.3 Reporting & Auswertungen (Feature: `reporting`)

| Zeitraum | Kosten | Umsatz | Gewinn |
|---|---|---|---|
| Monat | ✓ | ✓ | ✓ |
| Quartal | ✓ | ✓ | ✓ |
| Kumuliert | ✓ | ✓ | ✓ |

Weitere Kennzahlen: Gesamtgewinn, ⌀ Lagerzeit, Zeitreihe (Umsatz/Kosten/Gewinn).

> **Implementierungshinweis:** Filterauswahl (Monat/Quartal/Jahr) gehört in den **URL-State** (`useSearchParams`), nicht in Zustand — damit sind Dashboards bookmarkbar und shareable.

### 5.4 Auth & Multi-User (Feature: `auth`)
- Clerk Session Management (Access Token in Memory, kein localStorage)
- Datentrennung per `userId` auf Datenbankebene
- Clerk Middleware schützt alle `/dashboard/*`-Routen serverseitig

---

## 6. Bewusst ausgeklammert (vorerst)

| Feature | Status |
|---|---|
| Fotos pro Item | Spätere Version |
| Erweiterte Item-Status-Stufen | Später |
| Mobile App | Phase 2 |
| API-Anbindung Kleinanzeigen/eBay | Phase 2 |
| CSV / PDF Export | Zukünftiges Modul |

---

## 7. Architektur: 4-Schichten-Prinzip

Jedes Feature hält sich strikt an diese Hierarchie. Schichten kommunizieren nur mit der direkt darunterliegenden.

```
UI Layer          → Components / Pages (nur Rendering, kein fetch())
    ↓
Hooks Layer       → Custom Hooks (TanStack Query + Mutations)
    ↓
Service Layer     → Manager (Business-Logik) + Repository (HTTP/Server Actions)
    ↓
Data Layer        → Prisma (DB) via Server Actions / API Routes
```

**Regel:** Komponenten rufen niemals direkt `fetch()` auf. Kein Business-Logik in JSX.

---

## 8. Projektstruktur (Feature-basiert)

> **Umstellung:** `modules/` → `features/` entspricht dem 2025-Standard. Jedes Feature ist eine eigenständige Mini-App mit klar definierter Public API via `index.ts`.

```
/src
│
├── features/
│   ├── inventory/
│   │   ├── components/          # UI: ItemCard, ItemForm, ItemTable
│   │   ├── hooks/               # useItems(), useCreateItem(), useUpdateItem()
│   │   ├── services/
│   │   │   ├── ItemManager.ts   # Business-Logik: Lagerzeit berechnen, Status-Übergänge
│   │   │   └── ItemRepository.ts # Server Actions wrappen oder fetch() — kein UI
│   │   ├── types/
│   │   │   └── inventory.types.ts
│   │   └── index.ts             # ← Einziger Einstiegspunkt für andere Features
│   │
│   ├── sales/
│   │   ├── components/          # SaleForm, SaleConfirmation
│   │   ├── hooks/               # useSales(), useRecordSale()
│   │   ├── services/
│   │   │   ├── SaleManager.ts   # Gewinnberechnung, Validierung
│   │   │   └── SaleRepository.ts
│   │   ├── types/
│   │   │   └── sales.types.ts
│   │   └── index.ts
│   │
│   ├── reporting/
│   │   ├── components/          # RevenueChart, ProfitTable, KPICard
│   │   ├── hooks/               # useMonthlyReport(), useQuarterlyReport()
│   │   ├── services/
│   │   │   └── ReportingRepository.ts
│   │   ├── types/
│   │   │   └── reporting.types.ts
│   │   └── index.ts
│   │
│   └── auth/
│       ├── components/          # UserMenu, AuthGuard
│       ├── hooks/               # useCurrentUser()
│       └── index.ts
│
├── shared/
│   ├── components/              # Button, Modal, Table, DataCard (generisch)
│   ├── hooks/                   # useDebounce, useLocalStorage
│   ├── lib/
│   │   ├── prisma.ts            # Singleton PrismaClient
│   │   └── utils.ts             # cn(), formatCurrency(), formatDate()
│   ├── types/                   # Globale Enums, Shared Types
│   └── config/                  # Env-Validierung via Zod
│
├── app/                         # Next.js App Router — nur Routing, kein Logik
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Auth-Check via Clerk, Sidebar
│   │   ├── inventory/
│   │   │   ├── page.tsx         # Thin: nur <InventoryPage /> rendern
│   │   │   └── [id]/page.tsx
│   │   ├── sales/page.tsx
│   │   └── reporting/page.tsx
│   ├── api/                     # Nur für Webhooks (z.B. Clerk) oder externe APIs
│   │   └── webhooks/clerk/route.ts
│   └── layout.tsx               # ClerkProvider, QueryClientProvider, Toaster
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### Modul-Regeln

| Regel | Umsetzung |
|---|---|
| Import nur via `index.ts` | ESLint `import/no-internal-modules` erzwingen |
| App-Layer ist dünn | Seiten rendern nur Feature-Komponenten, keine Logik |
| `shared/` ist neutral | Keine Feature-Importe in `shared/` |
| Server Actions in `services/` | Niemals direkt in Komponenten |
| Gewinn nie in DB | Immer zur Laufzeit aus DB-Werten berechnen |

---

## 9. State Management

```
Kommt von DB/API?                → TanStack Query (useItems, useSales, ...)
Filterauswahl / Zeitraum?        → URL State (useSearchParams)
Globale UI-Preferences?          → Zustand
Formular-State?                  → React Hook Form (lokal)
Sonst                            → useState / useReducer
```

> **Anti-Pattern vermeiden:** Inventory-Daten NICHT in Zustand ablegen. TanStack Query cached, dedupliciert und revalidiert automatisch. Zustand ist nur für UI-State, der keine Server-Herkunft hat.

---

## 10. API-Schicht: 3-Layer-Pattern

In Next.js 15 mit App Router werden **Server Actions** für Mutations bevorzugt. Queries laufen über TanStack Query mit einem Repository als Datenzugriffslayer.

### Query Keys (typisiert, als Konstanten)

```typescript
// features/inventory/hooks/inventoryKeys.ts
export const inventoryKeys = {
  all:    ['inventory']                        as const,
  list:   (filters: ItemFilters) =>            ['inventory', 'list', filters] as const,
  detail: (id: string) =>                      ['inventory', id]              as const,
};
```

### Repository (Server Actions wrappen, kein UI)

```typescript
// features/inventory/services/ItemRepository.ts
'use server'; // Nur wenn direkt Server Action, sonst normaler fetch

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getItems(filters: ItemFilters): Promise<Item[]> {
  const { userId } = auth(); // Clerk serverseitig
  if (!userId) throw new Error('Unauthorized');

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: userId } });

  return prisma.item.findMany({
    where: {
      userId: dbUser.id,
      status: filters.status ?? undefined,
    },
    include: { sale: true, costs: true },
    orderBy: { purchasedAt: 'desc' },
  });
}
```

### Custom Hook (TanStack Query)

```typescript
// features/inventory/hooks/useItems.ts
import { useQuery } from '@tanstack/react-query';
import { getItems } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';

export function useItems(filters: ItemFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn:  () => getItems(filters),
    staleTime: 60_000, // 1 Min — Inventar ändert sich selten spontan
  });
}
```

### staleTime-Guide für dieses Projekt

| Datentyp | staleTime |
|---|---|
| Inventar-Liste | `60_000` (1 Min) |
| Item-Detail | `60_000` (1 Min) |
| Verkäufe | `60_000` (1 Min) |
| Reporting (Monat/Quartal) | `5 * 60_000` (5 Min) |

### Mutations (Server Actions)

```typescript
// features/inventory/services/ItemRepository.ts (Mutation)
export async function createItem(data: CreateItemInput): Promise<Item> {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: userId } });

  return prisma.item.create({
    data: { ...data, userId: dbUser.id },
  });
}

// features/inventory/hooks/useCreateItem.ts
export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all }); // Alle Listen invalidieren
      toast.success('Item erfasst');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });
}
```

---

## 11. TypeScript-Konfiguration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

### Zod: Runtime-Validierung für API-Responses & Formulare

Zod validiert **zur Laufzeit**, TypeScript nur zur Compilezeit. Beides ist notwendig.

```typescript
// features/inventory/types/inventory.types.ts
import { z } from 'zod';

export const CreateItemSchema = z.object({
  name:             z.string().min(1, 'Name ist Pflicht').max(200),
  description:      z.string().max(1000).optional(),
  purchasePrice:    z.number().positive('Muss positiv sein'),
  purchasePlatform: z.enum(['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER']),
  purchasedAt:      z.coerce.date(),
  shippingCostIn:   z.number().min(0).default(0),
  repairCost:       z.number().min(0).default(0),
});

// TypeScript-Typ wird aus dem Schema abgeleitet — keine Duplizierung
export type CreateItemInput = z.infer<typeof CreateItemSchema>;

// In React Hook Form:
const form = useForm<CreateItemInput>({
  resolver: zodResolver(CreateItemSchema),
});
```

### Discriminated Unions für Item-State

```typescript
// Statt: isLoading: boolean, data?: Item[], error?: string
type ItemFetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Item[] }
  | { status: 'error'; message: string };

// TanStack Query gibt das automatisch korrekt typisiert zurück:
const { status, data, error } = useItems();
// status: 'pending' | 'success' | 'error' — immer narrowable
```

---

## 12. Gewinnberechnung: Manager-Schicht

Business-Logik gehört in den Manager, nicht in Komponenten oder Repositories.

```typescript
// features/sales/services/SaleManager.ts
import type { Item, Sale, AdditionalCost } from '@prisma/client';

type ItemWithRelations = Item & {
  sale: Sale | null;
  costs: AdditionalCost[];
};

export class SaleManager {
  static calculateProfit(item: ItemWithRelations): number | null {
    if (!item.sale) return null; // Noch nicht verkauft

    const totalAdditionalCosts = item.costs.reduce(
      (sum, c) => sum + Number(c.amount), 0
    );

    return (
      Number(item.sale.salePrice)
      - Number(item.purchasePrice)
      - Number(item.shippingCostIn)
      - Number(item.repairCost)
      - Number(item.sale.shippingCostOut)
      - totalAdditionalCosts
    );
  }

  static calculateStorageDays(item: ItemWithRelations): number {
    const end = item.sale?.soldAt ?? new Date();
    const diff = end.getTime() - item.purchasedAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  static validateSalePrice(salePrice: number, purchasePrice: number): boolean {
    return salePrice > 0 && salePrice !== purchasePrice;
  }
}
```

---

## 13. Reporting-Queries (Server-Schicht)

```typescript
// features/reporting/services/ReportingRepository.ts
export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const { userId } = auth();
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: userId! } });

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  const sales = await prisma.sale.findMany({
    where: {
      soldAt: { gte: start, lte: end },
      item: { userId: dbUser.id },
    },
    include: { item: { include: { costs: true } } },
  });

  const revenue    = sales.reduce((s, sale) => s + Number(sale.salePrice), 0);
  const totalCosts = sales.reduce((s, sale) => {
    const item = sale.item;
    const extraCosts = item.costs.reduce((c, ac) => c + Number(ac.amount), 0);
    return s + Number(item.purchasePrice) + Number(item.shippingCostIn)
              + Number(item.repairCost) + Number(sale.shippingCostOut) + extraCosts;
  }, 0);

  return {
    year, month,
    revenue:   parseFloat(revenue.toFixed(2)),
    costs:     parseFloat(totalCosts.toFixed(2)),
    profit:    parseFloat((revenue - totalCosts).toFixed(2)),
    itemsSold: sales.length,
  };
}
```

---

## 14. Auth-Integration (Clerk + Next.js 15)

### Middleware (schützt alle Dashboard-Routen serverseitig)

```typescript
// middleware.ts (im Root)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtected = createRouteMatcher(['/dashboard(.*)', '/api/(?!webhooks)(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
};
```

### User-Sync beim ersten Login

```typescript
// app/api/webhooks/clerk/route.ts
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';

export async function POST(req: Request) {
  const evt = (await req.json()) as WebhookEvent;

  if (evt.type === 'user.created') {
    await prisma.user.create({
      data: {
        clerkId: evt.data.id,
        email:   evt.data.email_addresses[0].email_address,
      },
    });
  }

  return new Response('OK', { status: 200 });
}
```

---

## 15. Error Handling

### Feature-Level Error Boundaries (nicht ein globales)

```typescript
// app/(dashboard)/inventory/page.tsx
import { AppErrorBoundary } from '@/shared/components/AppErrorBoundary';
import { InventoryPage } from '@/features/inventory';

export default function Page() {
  return (
    <AppErrorBoundary onReset={() => queryClient.invalidateQueries({ queryKey: inventoryKeys.all })}>
      <InventoryPage />
    </AppErrorBoundary>
  );
}
```

```typescript
// shared/components/AppErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6">
      <p className="font-semibold text-red-800">Etwas ist schiefgelaufen</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-2 text-sm text-red-700">{error.message}</pre>
      )}
      <button onClick={resetErrorBoundary} className="mt-4 btn-primary">
        Erneut versuchen
      </button>
    </div>
  );
}

export function AppErrorBoundary({ children, onReset }: { children: ReactNode; onReset?: () => void }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(err, info) => Sentry.captureException(err, { extra: { componentStack: info.componentStack } })}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### React 19 Root-Level Error Reporting

```typescript
// Für Next.js: In instrumentation.ts oder via Sentry Next.js SDK
// Für lokale Entwicklung ohne Next.js:
createRoot(document.getElementById('root')!, {
  onUncaughtError:    Sentry.reactErrorHandler(),
  onCaughtError:      Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(<App />);
```

---

## 16. Umgebungsvariablen (Zod-validiert)

```typescript
// shared/config/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL:                      z.string().url(), // Pooled URL (PgBouncer) — Runtime
  DIRECT_DATABASE_URL:               z.string().url(), // Direct URL — prisma migrate only
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY:                  z.string().min(1),
  CLERK_WEBHOOK_SECRET:              z.string().min(1),
  SENTRY_DSN:                        z.string().url().optional(),
  NODE_ENV:                          z.enum(['development', 'test', 'production']).default('development'),
});

export const env = EnvSchema.parse(process.env);
// → App startet nicht, wenn ein Pflichtfeld fehlt. Kein Rätseln zur Laufzeit.
```

> **Hinweis lokale Entwicklung:** In `.env.local` können beide URLs auf dieselbe Docker-Postgres-Instanz zeigen. Das Dual-URL Pattern ist nur für Supabase/Vercel (Production) relevant.

---

## 17. Datenbankschema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")        // Pooled (PgBouncer) — für Runtime/Vercel
  directUrl = env("DIRECT_DATABASE_URL") // Direct — nur für prisma migrate
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique          // Verknüpfung mit Clerk
  email     String   @unique
  createdAt DateTime @default(now())
  items     Item[]
}

model Item {
  id               String           @id @default(cuid())
  name             String
  description      String?
  purchasePrice    Decimal          @db.Decimal(10, 2)   // Decimal statt Float: keine Rundungsfehler
  purchasePlatform Platform
  purchasedAt      DateTime
  shippingCostIn   Decimal          @db.Decimal(10, 2) @default(0)
  repairCost       Decimal          @db.Decimal(10, 2) @default(0)
  status           ItemStatus       @default(IN_STOCK)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  userId           String
  user             User             @relation(fields: [userId], references: [id])
  sale             Sale?
  costs            AdditionalCost[]

  @@index([userId, status])         // Index für häufige Abfragen (userId + Statusfilter)
  @@index([userId, purchasedAt])    // Index für Reporting-Queries (Zeitraum-Filterung)
}

enum ItemStatus {
  IN_STOCK
  SOLD
  // IN_REPAIR  — Später
  // RESERVED   — Später
}

enum Platform {
  KLEINANZEIGEN
  EBAY
  FACEBOOK
  OTHER
}

model Sale {
  id              String   @id @default(cuid())
  salePrice       Decimal  @db.Decimal(10, 2)
  salePlatform    Platform
  shippingCostOut Decimal  @db.Decimal(10, 2) @default(0)
  soldAt          DateTime
  createdAt       DateTime @default(now())
  itemId          String   @unique
  item            Item     @relation(fields: [itemId], references: [id])

  @@index([soldAt])                // Index für Reporting nach Verkaufsdatum
}

model AdditionalCost {
  id        String   @id @default(cuid())
  label     String
  amount    Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  itemId    String
  item      Item     @relation(fields: [itemId], references: [id])
}
```

**DB-Indizes** auf `userId + status` und `userId + purchasedAt` für performante Reporting-Queries.

---

## 18. Testing-Strategie

**Testing Trophy (angestrebte Verteilung):**

```
Static (TypeScript + ESLint)   10%
Unit (Manager, pure fns)       20%
Integration (RTL + MSW)        60%  ← Wichtigste Schicht
E2E (Playwright)               10%
Coverage-Ziel: ≥ 70%
```

### Tool-Stack

| Tool | Zweck |
|---|---|
| **Vitest** | Unit- und Integrationstests (2–4× schneller als Jest) |
| **React Testing Library** | Komponententests aus Nutzerperspektive |
| **MSW (Mock Service Worker)** | Netzwerk-Mocks auf Netzwerkebene, shared zwischen Tests und Browser |
| **Playwright** | E2E: Login, Item erstellen, Gewinnberechnung prüfen |

### Beispiel: SaleManager-Unittest

```typescript
// features/sales/services/SaleManager.test.ts
import { describe, it, expect } from 'vitest';
import { SaleManager } from './SaleManager';

describe('SaleManager.calculateProfit', () => {
  it('berechnet Gewinn korrekt', () => {
    const item = {
      purchasePrice: 50,
      shippingCostIn: 5,
      repairCost: 10,
      costs: [{ amount: 2 }],
      sale: { salePrice: 100, shippingCostOut: 8 },
    } as any;

    expect(SaleManager.calculateProfit(item)).toBe(25); // 100 - 50 - 5 - 10 - 8 - 2
  });

  it('gibt null zurück wenn Item nicht verkauft', () => {
    const item = { sale: null, costs: [] } as any;
    expect(SaleManager.calculateProfit(item)).toBeNull();
  });
});
```

### Kritische E2E-Szenarien (Playwright)

1. Nutzer registriert sich → Dashboard sieht leer aus
2. Item erstellen → erscheint in Inventarliste
3. Item als verkauft markieren → Gewinn wird korrekt angezeigt
4. Reporting-Dashboard: Monatsfilter wechseln → URL ändert sich, Daten aktualisieren sich

---

## 19. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true    # Alte Runs bei neuem Push abbrechen

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }

      - run: npm ci              # npm ci statt npm install (deterministische Builds)
      - run: npm run type-check  # tsc --noEmit
      - run: npm run lint
      - run: npm run test        # Vitest
      - run: npm audit --audit-level=high  # Dependency-Scan

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**Vercel:** Preview Deployments automatisch für jeden PR (Zero Config mit Vercel GitHub App).

---

## 20. Nächste Schritte (konkretisiert)

| # | Schritt | Details |
|---|---|---|
| 1 | **Projektsetup** | `npx create-next-app@latest` mit TypeScript, Tailwind, App Router. `tsconfig.json` auf `strict: true` + Paths setzen. |
| 2 | **Docker Compose** | PostgreSQL + optional pgAdmin für lokale Entwicklung. `.env` mit Zod validieren. Beide URLs (`DATABASE_URL`, `DIRECT_DATABASE_URL`) auf lokale Instanz zeigen lassen. |
| 3 | **Prisma Setup** | Schema deployen, `prisma generate`, Singleton-Client in `shared/lib/prisma.ts`. Dual-URL in `schema.prisma` (`url` + `directUrl`). DB-Indizes prüfen. |
| 4 | **Clerk Integration** | `ClerkProvider` in `app/layout.tsx`, Middleware, Webhook für User-Sync. |
| 5 | **TanStack Query Setup** | `QueryClientProvider` in Root-Layout, DevTools für Entwicklung einbinden. |
| 6 | **Inventory-Feature** | Schema → Repository → Manager → Hooks → Komponenten (Bottom-up). Zod-Schema für Formulare zuerst. |
| 7 | **Sales-Feature** | Gewinnberechnung im SaleManager unit-testen, bevor UI gebaut wird. |
| 8 | **Reporting-Feature** | SQL-Queries benchmarken mit `EXPLAIN ANALYZE`. Indizes validieren. URL-State für Filter. |
| 9 | **Sentry** | `@sentry/nextjs` installieren, React 19 Root Hooks konfigurieren. |
| 10 | **CI/CD** | GitHub Actions Workflow, Playwright E2E für Happy Paths. |

---

## 21. Hosting & Deployment-Strategie

### Umgebungen

| Umgebung | Datenbank | Hosting | Zweck |
|---|---|---|---|
| **Local** | Docker Compose (PostgreSQL) | — | Entwicklung & Tests |
| **Preview** | Supabase (Branch DB oder shared dev) | Vercel Preview | PR-Reviews, Staging |
| **Production** | Supabase (PostgreSQL) | Vercel | Live-Betrieb |

### Supabase Connection Setup (Produktion)

Supabase stellt zwei Connection Strings bereit. Beide müssen als Env-Vars hinterlegt sein:

```env
# .env.production (Vercel Environment Variables)

# Pooled URL — für alle Runtime-Queries (Vercel Serverless)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct URL — nur für prisma migrate deploy (nie im Runtime-Pfad)
DIRECT_DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

> **Wichtig:** Vercel-Funktionen sind serverless — jede Invokation öffnet eine neue DB-Verbindung. Ohne PgBouncer (gepoolte URL) erschöpfen sich die Postgres-Connections unter Last. Die direkte URL darf **niemals** als `DATABASE_URL` in Production verwendet werden.

### Clerk + Supabase Abgrenzung

Supabase hat ein eigenes Auth-System. Dieses wird **nicht** genutzt. Clerk ist alleiniger Identity Provider. Datenisolierung erfolgt über `WHERE userId = dbUser.id` auf Query-Ebene — Row Level Security (RLS) ist nicht erforderlich.

---

## 22. Checkliste vor erstem Deployment

- [ ] `strict: true` in tsconfig aktiv, null `any`s im Code
- [ ] Alle Umgebungsvariablen via Zod validiert (App startet nicht bei fehlender Variable)
- [ ] `DATABASE_URL` zeigt auf gepoolte Supabase URL (PgBouncer, Port 6543)
- [ ] `DIRECT_DATABASE_URL` hinterlegt für `prisma migrate deploy`
- [ ] Jede API/Server Action prüft `auth()` vor DB-Zugriff
- [ ] `staleTime` in jedem `useQuery`-Aufruf explizit gesetzt
- [ ] Query Keys als typisierte Konstanten, keine Inline-Strings
- [ ] Error Boundaries auf Feature-Ebene (nicht nur Root)
- [ ] `npm audit --audit-level=high` schlägt nicht an
- [ ] DB-Indizes auf häufige Queries (userId + status, soldAt) vorhanden
- [ ] Kein Business-Logik in Komponenten oder App-Routen
- [ ] Vercel Environment Variables für alle drei Umgebungen (local / preview / production) konfiguriert

---

*Dieses Dokument ist eine lebendige Spezifikation. Änderungen sollten versioniert werden.*
