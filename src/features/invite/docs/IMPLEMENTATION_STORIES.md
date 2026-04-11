# Invite System — Implementation Stories

## Feature I-001 — Datenbankschema

### I-001-1: OlympiadInstance erweitern
`OlympiadInstance` erhält zwei neue Felder:
- `joinCode String? @unique` — auto-generierter Code (Format: `XXXX-XXXX`, Großbuchstaben + Zahlen)
- `autoAccept Boolean @default(true)` — steuert Approval-Flow

### I-001-2: JoinRequest-Tabelle anlegen
```prisma
model JoinRequest {
  id           String            @id @default(cuid())
  userId       String
  instanceId   String
  status       JoinRequestStatus @default(PENDING)
  createdAt    DateTime          @default(now())
  resolvedAt   DateTime?
  resolvedById String?
  user         User              @relation(fields: [userId], references: [id])
  instance     OlympiadInstance  @relation(fields: [instanceId], references: [id])
  resolvedBy   User?             @relation("ResolvedRequests", fields: [resolvedById], references: [id])

  @@unique([userId, instanceId, status])  // nur ein PENDING pro User+Instanz
  @@index([instanceId, status])
  @@index([userId])
}
```

### I-001-3: JoinRequestStatus Enum
```prisma
enum JoinRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

### I-001-4: Migration erstellen und deployen

---

## Feature I-002 — Admin: Code & Auto-Accept konfigurieren

### I-002-1: UI im OlympiadDetail
Neuer Abschnitt „Beitrittscode" im Edit-Bereich:
- Anzeige des aktuellen Codes (read-only Feld, kopierbar)
- Button „Neu generieren"
- Button „Deaktivieren" (setzt Code auf null)
- Checkbox: „Anfragen automatisch akzeptieren" (Standard: an)

### I-002-2: Serveraktion `generateJoinCode(instanceId)`
- Generiert `XXXX-XXXX` (8 zufällige Großbuchstaben/Zahlen mit Bindestrich)
- Prüft Uniqueness, regeneriert bei Kollision
- Speichert in DB

### I-002-3: Serveraktion `updateAutoAccept(instanceId, autoAccept: boolean)`
- Guard: assertOwner (ADMIN eigene Instanz, MASTER_ADMIN alle)

### I-002-4: Serveraktion `revokeJoinCode(instanceId)`
- Setzt `joinCode = null`
- Bestehende PENDING-Anfragen bleiben erhalten

---

## Feature I-003 — User: Code-Eingabe-Modal

### I-003-1: Modal auf /pending-assignment
Inhalt:
- Überschrift: „Du bist noch keiner Olympiade zugewiesen"
- Eingabefeld: „Beitrittscode (z.B. X7K2-M9QP)"
- Button: „Beitreten"
- Darunter (falls vorhanden): Liste eigener offener Anfragen mit Status

### I-003-2: Serveraktion `submitJoinRequest(joinCode: string)`
Logik:
1. Sucht Instanz anhand `joinCode` (case-insensitive)
2. Fehler wenn Code nicht gefunden
3. Fehler wenn User bereits Mitglied dieser Instanz
4. Fehler wenn bereits ein PENDING-Request für diese Instanz existiert
5. Bei `autoAccept = true`: erstellt direkt `InstanceMembership`
6. Bei `autoAccept = false`: erstellt `JoinRequest` mit Status PENDING, triggert Admin-Benachrichtigung

### I-003-3: Feedback-Zustände
- Auto-Accept: Toast „Willkommen bei [Olympiade-Name]!" → Redirect zu /dashboard
- Manual: „Anfrage für [Name] gesendet – warte auf Freigabe"
- Bereits Mitglied: „Du bist bereits Mitglied dieser Olympiade"
- PENDING existiert: „Du hast bereits eine offene Anfrage für diese Olympiade"
- Ungültiger Code: „Dieser Code ist nicht gültig"

### I-003-4: Status-Anzeige auf /pending-assignment
- Listet eigene JoinRequests (PENDING + REJECTED der letzten 7 Tage)
- REJECTED zeigt: „Abgelehnt – Du kannst es erneut versuchen"

---

## Feature I-004 — Admin: Anfragen verwalten

### I-004-1: Neuer Tab „Anfragen" im Admin-Panel
- Sichtbar für ADMIN und MASTER_ADMIN
- Tab-Label: „Anfragen (N)" mit Count der PENDING-Anfragen

### I-004-2: Listenansicht
Spalten: User-E-Mail · Olympiade · Eingangsdatum · Status · Aktionen
- ADMIN: sieht nur Anfragen für eigene Olympiaden
- MASTER_ADMIN: sieht alle Anfragen
- Standard-Filter: nur PENDING

### I-004-3: Serveraktion `resolveJoinRequest(requestId, decision: 'ACCEPTED' | 'REJECTED')`
- Guard: ADMIN nur eigene Instanzen, MASTER_ADMIN alle
- Bei ACCEPTED: erstellt `InstanceMembership`, setzt status/resolvedAt/resolvedById
- Bei REJECTED: setzt status/resolvedAt/resolvedById

### I-004-4: Query `getJoinRequests(filter?: { status?, instanceId? })`
- Guard: requireAdmin
- ADMIN: filtert automatisch auf eigene Instanzen
- MASTER_ADMIN: gibt alle zurück

---

## Feature I-005 — Benachrichtigungen

### I-005-1: In-App Badge
- Tab-Header zeigt `Anfragen (N)` wenn N > 0
- Sidebar-Link „Admin" zeigt roten Dot wenn offene Anfragen vorhanden
- Polled alle 60 Sekunden (TanStack Query `refetchInterval`)

### I-005-2: E-Mail via Supabase SMTP
- Trigger: neue PENDING-Anfrage erstellt
- Empfänger: Ersteller der Olympiade + alle MASTER_ADMIN
- Betreff: „Neue Beitrittsanfrage für [Olympiade-Name]"
- Inhalt: User-E-Mail, Olympiade-Name, Zeitstempel, Link zu /dashboard/admin
- Implementierung: Supabase `auth.admin` SMTP-Konfiguration oder Edge Function mit `nodemailer`

---

## Feature I-006 — Koexistenz URL-System

### I-006-1: Kein Breaking Change
- `/join/[token]` weiterhin aktiv (sofortige Aufnahme)
- Code-System separat, beide unabhängig konfigurierbar pro Instanz

---

## Implementierungsreihenfolge

1. **I-001** Schema + Migration
2. **I-002** Admin: Code generieren + Auto-Accept
3. **I-003** User: Modal + submitJoinRequest
4. **I-004** Admin: Anfragen-Tab
5. **I-005-1** In-App Badge
6. **I-005-2** E-Mail via Supabase SMTP
