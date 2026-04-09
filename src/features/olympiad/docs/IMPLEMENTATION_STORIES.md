# Implementation Stories: Multi-Olympiade

## Abhängigkeiten & Reihenfolge

```
O-001 (DB-Schema)
  ├─ O-002 (Auth-Gate)
  └─ O-003 (Admin: Instanz CRUD)
       ├─ O-004 (Admin: User-Zuweisung per E-Mail)
       │    └─ O-005 (Rangliste: Instanz-Filter + Zeitfenster)
       │         └─ O-006 (Admin: Instanz-Dropdown in Rangliste)
       └─ O-007 (Einladungslink)
            └─ O-002 (Join-Flow beim Login)
```

---

## Story O-001 — Datenmodell: OlympiadInstance + InstanceMembership

**Als** Entwickler  
**möchte ich** die Datenbankstruktur für Olympiade-Instanzen anlegen,  
**damit** alle weiteren Features darauf aufbauen können.

### Akzeptanzkriterien
- [ ] Neues Prisma-Model `OlympiadInstance`:
  - `id String @id @default(cuid())`
  - `name String`
  - `description String?`
  - `startsAt DateTime` (Pflicht)
  - `endsAt DateTime` (Pflicht)
  - `isActive Boolean @default(true)`
  - `createdAt DateTime @default(now())`
  - `createdById String` (Relation zu `User.id`, kein Cascade-Delete)
  - `inviteToken String? @unique`
  - Relation `memberships InstanceMembership[]`
- [ ] Neues Prisma-Model `InstanceMembership`:
  - `id String @id @default(cuid())`
  - `userId String @unique` ← DB-Constraint: max. eine Instanz pro User
  - `instanceId String`
  - `joinedAt DateTime @default(now())`
  - Relationen zu `User` und `OlympiadInstance`
- [ ] `User` bekommt Relation `membership InstanceMembership?`
- [ ] Migration angelegt und deployed
- [ ] Prisma Client neu generiert

### Technische Hinweise
- Dateien: `prisma/schema.prisma`, neue Migration
- `createdById` → kein `onDelete: Cascade` (Instanz bleibt, auch wenn Admin-Account gelöscht wird)
- Index empfohlen: `@@index([instanceId])` auf `InstanceMembership`

---

## Story O-002 — Auth-Gate: Login blockieren ohne Instanz-Zuordnung

**Als** User ohne Instanz-Zuordnung  
**möchte ich** nach dem Login eine verständliche Meldung sehen,  
**damit** ich weiß, dass ich auf eine Einladung warten muss.

### Akzeptanzkriterien
- [ ] `syncUser` prüft nach Login: Hat der User eine `InstanceMembership`?
- [ ] Kein Membership + `role !== 'ADMIN'` → Redirect zu `/pending-assignment`
- [ ] `/pending-assignment`-Seite: App-Logo, Text "Du wurdest noch keiner Olympiade zugewiesen. Warte auf eine Einladung oder nutze einen Einladungslink.", Abmelden-Button
- [ ] Admins (`role === 'ADMIN'`) werden nie geblockt
- [ ] Prüfreihenfolge in `syncUser`: 1. `isActive` → 2. `role === ADMIN` (bypass) → 3. `membership`
- [ ] Wenn User einen Einladungslink (`/join/[token]`) geöffnet hat und noch nicht eingeloggt ist: nach Login automatisch der Instanz zuordnen und zu `/dashboard` weiterleiten (Token wird in Session/Cookie zwischengespeichert)

### Technische Hinweise
- `syncUser` in `src/features/auth/actions/syncUser.ts`
- Neue Route: `src/app/(auth)/pending-assignment/page.tsx`
- Pending-invite-Cookie: `pending_invite_token` — wird vor dem Login-Redirect gesetzt, nach Zuweisung gelöscht
- Bestehende `/suspended`-Logik bleibt unverändert (wird vor der Instanz-Prüfung ausgeführt)

---

## Story O-003 — Admin: Olympiade-Instanzen anlegen und verwalten

**Als** Admin  
**möchte ich** Olympiade-Instanzen erstellen, bearbeiten und archivieren können,  
**damit** ich mehrere unabhängige Wettbewerbe parallel betreiben kann.

### Akzeptanzkriterien
- [ ] Neuer Tab "Olympiaden" auf `/dashboard/admin` (neben bestehendem "Users"-Tab)
- [ ] Instanz-Liste zeigt: Name, Zeitraum (Start–Ende), Teilnehmeranzahl, Status
- [ ] "Neue Olympiade"-Button öffnet Slide-Panel: Name (Pflicht), Beschreibung, Startdatum (Pflicht), Enddatum (Pflicht)
- [ ] Klick auf Instanz → Detailseite mit Inline-Edit für Name, Beschreibung, Start- und Enddatum
- [ ] Nur der Ersteller-Admin (`createdById === currentUser.id`) sieht Bearbeiten/Archivieren/Löschen-Buttons
- [ ] Andere Admins sehen die Instanz in Leseansicht
- [ ] Archivieren: setzt `isActive = false`; archivierte Instanzen können reaktiviert werden
- [ ] Löschen: nur möglich wenn keine Memberships existieren — sonst Fehlermeldung
- [ ] Start- und Enddatum-Änderung: sofort wirksam, ändert Ranglisten-Berechnung in Echtzeit

### Technische Hinweise
- Server Actions: `createOlympiad`, `updateOlympiad`, `archiveOlympiad`, `deleteOlympiad`
- `src/features/olympiad/actions/olympiadActions.ts`
- Query: `getOlympiads()` — alle Instanzen mit Mitgliederzahl (Admin only)
- Hook: `useOlympiads()`
- Autorisierungsprüfung in jeder Action: `if (instance.createdById !== currentUserId) throw new Error('Unauthorized')`

---

## Story O-004 — Admin: User per E-Mail-Adresse einer Instanz zuweisen

**Als** Admin  
**möchte ich** User manuell per E-Mail-Adresse einer Instanz zuordnen oder entfernen,  
**damit** ich die Teilnehmerliste ohne Einladungslink pflegen kann.

### Akzeptanzkriterien
- [ ] Instanz-Detailseite zeigt Tab "Teilnehmer" mit aktueller Mitgliederliste
- [ ] Eingabefeld: E-Mail-Adresse eingeben → Suche → User-Vorschau → "Hinzufügen"-Button
- [ ] Fehler wenn E-Mail nicht bekannt: "Kein User mit dieser E-Mail gefunden"
- [ ] Wenn User bereits in anderer Instanz: Warndialog "Dieser User ist aktuell in '{andereInstanz}'. Verschieben?" → Bestätigung → altes Membership gelöscht, neues angelegt
- [ ] Teilnehmer-Zeile hat "Entfernen"-Button → Membership wird gelöscht, User landet auf `/pending-assignment` beim nächsten Laden
- [ ] Admins können ebenfalls als Teilnehmer hinzugefügt werden

### Technische Hinweise
- Server Actions: `assignUserToOlympiad(email, instanceId)`, `removeUserFromOlympiad(userId, instanceId)`
- `assignUserToOlympiad` macht `upsert` auf `InstanceMembership` mit `where: { userId }`
- Query: `getUsersWithMembershipStatus(instanceId)` — alle User + `isMember: boolean`
- Autorisierung: nur Ersteller-Admin der Instanz

---

## Story O-005 — Rangliste: Instanz-Filter + Zeitfenster-Berechnung

**Als** User  
**möchte ich** in der Rangliste nur die anderen Teilnehmer meiner Instanz sehen, mit Profit aus dem Instanz-Zeitraum,  
**damit** der Wettbewerb fair und zeitlich begrenzt ist.

### Akzeptanzkriterien
- [ ] `getLeaderboard()` ermittelt die Instanz des aufrufenden Users via `membership.instanceId`
- [ ] Nur User derselben Instanz erscheinen in der Rangliste
- [ ] Profit wird **nur aus Verkäufen im Zeitfenster** (`startsAt` ≤ `soldAt` ≤ `endsAt`) berechnet
- [ ] Kosten werden **nur aus Käufen im Zeitfenster** (`startsAt` ≤ `purchasedAt` ≤ `endsAt`) berücksichtigt
- [ ] Header der Rangliste zeigt: "Rangliste · {name} · {startDatum} – {endDatum}"
- [ ] Rank-Change-Berechnung (`lastSundayMidnightUTC`) gilt nur innerhalb desselben Zeitfensters
- [ ] User ohne Membership (nur Admins): bisheriges Verhalten — alle User, kein Zeitfenster (oder Admin-Dropdown aus O-006)

### Technische Hinweise
- `getLeaderboard` in `src/features/admin/services/getLeaderboard.ts`:
  1. `membership` des Callers laden → `instance.startsAt`, `instance.endsAt`, `instance.name`
  2. `sales` filtern: `soldAt >= startsAt && soldAt <= endsAt`
  3. `items` (für Kosten) filtern: `purchasedAt >= startsAt && purchasedAt <= endsAt`
  4. Return-Typ erweitern um `instanceName: string | null`
- `useLeaderboard` gibt `instanceName` weiter, `LeaderboardPage` zeigt es im Header

---

## Story O-006 — Admin: Instanz-Dropdown in der Rangliste

**Als** Admin  
**möchte ich** in der Rangliste zwischen Instanzen wechseln können,  
**damit** ich alle laufenden Wettbewerbe im Blick habe.

### Akzeptanzkriterien
- [ ] Admins sehen oberhalb der Rangliste ein Dropdown mit allen aktiven Instanzen
- [ ] Standard: die Instanz, der der Admin selbst angehört (falls keine → erste aktive Instanz)
- [ ] Dropdown-Auswahl steuert `instanceId`-Query-Param in der URL
- [ ] `getLeaderboard` akzeptiert optionalen `instanceId`-Override-Parameter (nur für Admins auswertbar)
- [ ] Non-Admins sehen kein Dropdown

### Technische Hinweise
- URL: `/dashboard/leaderboard?instanceId=xxx`
- `useLeaderboard` bekommt optionalen `instanceId`-Parameter
- `getOlympiads()` wird im Leaderboard-Hook für das Dropdown geladen (nur wenn Admin)

---

## Story O-007 — Einladungslink: Generieren und Beitreten

**Als** Admin  
**möchte ich** einen Einladungslink für meine Instanz generieren,  
**damit** User sich selbst zuordnen können ohne dass ich jeden manuell einlade.

### Akzeptanzkriterien

**Admin-Seite (Generieren):**
- [ ] Instanz-Detailseite hat Bereich "Einladungslink" mit "Link generieren"-Button
- [ ] Klick erzeugt einen `inviteToken` (UUID) in der DB und zeigt die fertige URL an
- [ ] "Kopieren"-Button kopiert den Link in die Zwischenablage
- [ ] "Neu generieren"-Button invalidiert den alten Token und erstellt einen neuen (mit Bestätigungsdialog: "Alter Link wird ungültig!")
- [ ] "Deaktivieren"-Button setzt `inviteToken = null`
- [ ] Nur Ersteller-Admin kann Link generieren/deaktivieren

**Join-Flow (User-Seite):**
- [ ] Route `/join/[token]` ist öffentlich zugänglich (kein Auth-Guard)
- [ ] Token gültig + User eingeloggt → Membership wird angelegt → Redirect zu `/dashboard`
- [ ] Token gültig + User nicht eingeloggt → Token in Cookie speichern (`pending_invite_token`) → Redirect zu `/sign-in` → nach Login automatisch Membership anlegen → Cookie löschen → Redirect zu `/dashboard`
- [ ] Token ungültig (nicht gefunden oder `inviteToken = null`) → Fehlermeldung: "Dieser Einladungslink ist nicht mehr gültig. Bitte wende dich an den Organisator."
- [ ] Wenn User bereits in einer anderen Instanz ist: Info-Meldung "Du bist bereits Teilnehmer in '{andereInstanz}'. Bitte wende dich an den Admin um zu wechseln." (kein automatischer Wechsel per Link — zu riskant)

### Technische Hinweise
- Server Action: `generateInviteToken(instanceId)` → `crypto.randomUUID()`
- Server Action: `joinViaToken(token)` → prüft Token, legt Membership an
- Route: `src/app/join/[token]/page.tsx` (außerhalb des Dashboard-Layouts)
- Cookie: `pending_invite_token` (HttpOnly, SameSite=Lax, kein Ablaufdatum)
- `syncUser` prüft nach erfolgreichem Login: Cookie vorhanden? → `joinViaToken` aufrufen → Cookie löschen

---

## Alle Entscheidungen

| # | Entscheidung |
|---|---|
| 1 | **Profit-Baseline**: Historische Daten bleiben erhalten. Rangliste wertet nur `soldAt`/`purchasedAt` innerhalb `startsAt`–`endsAt` aus. Kein separates Baseline-Feld. |
| 2 | **Admin als Teilnehmer**: Admins können optional einer Instanz beitreten. Ohne Membership werden sie nicht geblockt. |
| 3 | **Ownership**: Nur der Ersteller-Admin darf Instanz bearbeiten, archivieren, löschen. Andere Admins: Leseansicht. |
| 4 | **Einladung**: Einladungslink (`/join/[token]`) + manuelle Zuweisung per E-Mail. Link-Wechsel überschreibt nicht automatisch bestehende Memberships. |
| 5 | **Zeitfenster**: `startsAt` und `endsAt` sind Pflichtfelder, jederzeit vom Ersteller-Admin anpassbar. Änderung wirkt sofort auf Ranglisten-Berechnung. |
