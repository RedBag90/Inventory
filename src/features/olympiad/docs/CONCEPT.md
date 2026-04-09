# Multi-Olympiade — Konzept

## Problem & Motivation

Die App unterstützt aktuell genau eine implizite "Olympiade": alle aktiven User messen sich gemeinsam in einer einzigen Rangliste. Das skaliert nicht, wenn:

- mehrere unabhängige Gruppen (z.B. verschiedene Freundeskreise, Jahrgänge, Standorte) gleichzeitig ihre eigene Olympiade austragen wollen
- eine Gruppe eine neue Saison starten will, ohne die alte zu löschen
- der Admin verschiedene Teilnehmerfelder mit unterschiedlichen Regeln verwalten möchte

**Ziel:** Der Admin kann beliebig viele Olympiade-Instanzen anlegen. Jede Instanz hat ihre eigene Teilnehmerliste, ein definiertes Zeitfenster und eine eigene Rangliste. User sehen und messen sich nur innerhalb ihrer Instanz.

---

## Kernkonzepte

### Olympiade-Instanz
Eine benannte, vom Admin verwaltete Wettbewerbseinheit mit festem Zeitraum. Beispiel: "Sommer 2026", "Team Berlin", "Saison 2".

- Hat einen **Namen**, optional eine **Beschreibung**
- Hat ein **Startdatum** (`startsAt`) und ein **Enddatum** (`endsAt`) — beide Pflichtfelder, beide nachträglich änderbar
- Kann aktiv, beendet oder archiviert sein
- Gehört zu genau einem Admin (**Ersteller**) — nur dieser darf sie bearbeiten, schließen, archivieren oder löschen

### Zeitfenster & Profit-Berechnung
Die Rangliste einer Instanz wertet **ausschließlich Käufe und Verkäufe innerhalb des Instanz-Zeitfensters** (`startsAt` bis `endsAt`) aus. Die historischen Daten eines Users bleiben erhalten — sie fließen nur nicht in die Instanz-Rangliste ein.

> **Beispiel:** User A hat vor Instanzstart 500 € Profit gemacht. In der Rangliste von "Sommer 2026" (Start: 01.06.2026) zählen nur Verkäufe ab dem 01.06.2026. Seine 500 € historischen Gewinn sind in seinen Berichten sichtbar, aber nicht in der Instanz-Rangliste.

Das bedeutet: kein Datenverlust, aber saubere Wettbewerbsisolation per Zeitraum.

### Mitgliedschaft
Ein User ist einer Instanz **zugeordnet** — maximal einer aktiven Instanz gleichzeitig. Die Zuordnung erfolgt:
- **Manuell** durch den Admin per E-Mail-Adresse
- **Per Einladungslink** — der Admin generiert einen Link; User, die darüber auf die App zugreifen und sich einloggen/registrieren, werden automatisch der Instanz zugeordnet

Admins können ebenfalls als Teilnehmer einer Instanz beitreten und in deren Rangliste erscheinen.

### Login-Gate
Ohne Instanz-Zuordnung kann sich ein User nicht einloggen — er landet auf `/pending-assignment`.
**Ausnahme:** Admins werden nie geblockt, auch ohne Instanz-Zuordnung.

### Isolation
Items, Verkäufe und Berichte bleiben vollständig per User erhalten. Die Instanz bestimmt **welcher Zeitraum** in der Rangliste gewertet wird und **welche User** gegeneinander antreten.

---

## Datenmodell

```
OlympiadInstance
├── id             String   @id
├── name           String
├── description    String?
├── startsAt       DateTime              ← Pflichtfeld, editierbar
├── endsAt         DateTime              ← Pflichtfeld, editierbar
├── isActive       Boolean  @default(true)
├── createdAt      DateTime @default(now())
├── createdById    String               ← nur dieser Admin darf bearbeiten
├── inviteToken    String?  @unique     ← generierter Einladungstoken
└── memberships    InstanceMembership[]

InstanceMembership
├── id             String   @id
├── userId         String   @unique     ← max. eine aktive Instanz pro User (DB-Constraint)
├── instanceId     String
├── joinedAt       DateTime @default(now())
├── user           User
└── instance       OlympiadInstance

User (Erweiterung)
└── membership     InstanceMembership?
```

**Warum `@unique` auf `userId`?** Erzwingt auf DB-Ebene, dass ein User nur einer Instanz gleichzeitig angehören kann. Ein Instanzwechsel ist ein DELETE + INSERT.

**`inviteToken`:** Ein zufälliger, eindeutiger String (z.B. UUID). Der Einladungslink lautet `/join/[token]`. Der Token kann vom Admin neu generiert (= invalidiert alten Link) oder deaktiviert werden.

---

## User-Flows

### Admin: Instanz anlegen
1. Admin öffnet `/dashboard/admin` → Tab "Olympiaden"
2. Klick auf "Neue Olympiade" → Formular: Name, Beschreibung, Startdatum (Pflicht), Enddatum (Pflicht)
3. Instanz wird angelegt
4. Nur der Ersteller-Admin kann: Name/Daten bearbeiten, archivieren, löschen

### Admin: Zeitfenster anpassen
1. Ersteller-Admin öffnet Instanz-Detailseite
2. Start- oder Enddatum inline bearbeiten → sofort gespeichert
3. Änderung wirkt sich sofort auf die Ranglisten-Berechnung aus

### Admin: User manuell zuweisen
1. Admin öffnet Instanz-Detailseite → Bereich "Teilnehmer"
2. E-Mail-Adresse eingeben → User wird gesucht und der Instanz zugeordnet
3. Falls User bereits in anderer Instanz: Warnung + Bestätigung erforderlich
4. User kann sich nach Zuweisung sofort einloggen

### Admin: Einladungslink
1. Ersteller-Admin klickt "Einladungslink generieren"
2. Ein `inviteToken` wird in der DB gespeichert
3. Admin kopiert Link `/join/[token]` und teilt ihn mit Teilnehmern
4. Admin kann Link jederzeit neu generieren (invalidiert alten) oder deaktivieren

### User: Einladungslink nutzen
1. User öffnet `/join/[token]`
2. Ist eingeloggt → wird direkt der Instanz zugeordnet und zu `/dashboard` weitergeleitet
3. Ist nicht eingeloggt → wird zu `/sign-in` weitergeleitet, nach Login automatisch zugeordnet
4. Token ungültig/abgelaufen → Fehlermeldung

### User: Login ohne Instanz
1. User loggt sich ein → `syncUser` prüft Instanz-Zuordnung
2. Keine Zuordnung → Redirect zu `/pending-assignment`
3. Seite zeigt: "Du wurdest noch keiner Olympiade zugewiesen. Warte auf eine Einladung vom Admin oder nutze einen Einladungslink."

### User: Rangliste
- Rangliste zeigt nur User der eigenen Instanz, Profit-Berechnung auf Instanz-Zeitfenster begrenzt
- Header: "Rangliste · {instanceName} · {startDatum} – {endDatum}"
- Admin sieht Dropdown zum Wechseln zwischen Instanzen

---

## Auswirkungen auf bestehende Features

| Feature | Änderung |
|---|---|
| **Rangliste** | `getLeaderboard()` filtert nach Instanz-Mitgliedern und Instanz-Zeitfenster |
| **Auth / syncUser** | Prüft Instanz-Zuordnung; Admins sind ausgenommen |
| **Admin-Seite** | Neuer Tab "Olympiaden" mit Instanz-Liste, Detail-View und User-Zuweisung |
| **Berichte** | Unverändert — zeigen immer den vollständigen historischen Verlauf des Users |
| **Tutorial** | Unverändert — läuft per User, unabhängig von Instanz |

---

## Entscheidungen (ehemals offene Fragen)

1. **Profit-Baseline** ✅ Historische Daten bleiben vollständig erhalten. Ranglisten werten nur Aktivitäten innerhalb des Instanz-Zeitfensters (`startsAt`–`endsAt`) aus. Kein separates Baseline-Feld nötig — das Zeitfenster übernimmt diese Rolle.

2. **Admin als Teilnehmer** ✅ Admins können einer Instanz als Teilnehmer beitreten und erscheinen dann in der Rangliste dieser Instanz. Das ist optional — ein Admin ohne Membership wird nicht geblockt.

3. **Instanz-Ownership** ✅ Nur der erstellende Admin (`createdById`) darf die Instanz bearbeiten, schließen, archivieren und löschen. Andere Admins haben nur Lesezugriff auf alle Instanzen.

4. **Einladungslink** ✅ Ja — der Ersteller-Admin kann einen Link (`/join/[token]`) generieren. Zusätzlich bleibt die manuelle Zuweisung per E-Mail-Adresse erhalten.

---

## Nicht im Scope (Phase 1)

- Instanz-spezifische Regeln (z.B. max. Einkaufspreis, Plattform-Einschränkungen)
- Automatischer Instanzabschluss per Enddatum (bleibt manuell)
- E-Mail-Benachrichtigung bei Zuweisung oder Instanzstart
- Instanz-übergreifende Auswertungen / Vergleiche
- Token-Ablaufdatum (Einladungslink ist bis zur manuellen Deaktivierung gültig)
