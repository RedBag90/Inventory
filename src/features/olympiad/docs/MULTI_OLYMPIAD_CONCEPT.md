# Multi-Olympiad Mitgliedschaft — Konzept v1.0

**Datum:** 2026-04-11  
**Status:** Konzept / Offene Fragen  

---

## Problem

Aktuell ist die Mitgliedschaft eines Users auf genau eine Olympiade beschränkt.  
Wird ein User einer neuen Olympiade hinzugefügt (durch Admin-Zuweisung, Einladungslink oder Beitrittscode), wird seine bestehende Mitgliedschaft **überschrieben** — er verlässt automatisch die vorherige Olympiade.

Das ist ein Designfehler: Das DB-Schema (`InstanceMembership`) erlaubt bereits mehrere Mitgliedschaften pro User (`@@unique([userId, instanceId])`), aber der Anwendungscode erzwingt trotzdem nur eine.

---

## Ziel

Ein User-Account soll gleichzeitig in **mehreren Olympiaden** Mitglied sein können:

- Derselbe Account ist in mehreren Olympiaden hinterlegt.
- Jede Olympiade wertet die Aktivitäten des Users im jeweiligen Zeitfenster aus.
- Der User kann zwischen seinen Olympiaden wechseln.
- Admins können User zu ihrer Olympiade hinzufügen, ohne bestehende Mitgliedschaften zu entfernen.

---

## Aktueller Stand (Ist-Analyse)

### Was bereits stimmt
- **Schema**: `InstanceMembership` hat `@@unique([userId, instanceId])` — viele-zu-viele ist auf DB-Ebene bereits korrekt modelliert.
- **Items**: Items gehören dem User, nicht der Olympiade. Die Rangliste filtert Items bereits nach dem Zeitfenster der Olympiade (`startsAt`/`endsAt`). Das funktioniert auch für mehrere Olympiaden ohne Schemaänderung.

### Was defekt ist
| Ort | Problem |
|---|---|
| `olympiadActions.ts` → `assignUserToOlympiad` | `findFirst({ where: { userId } })` + `update instanceId` — **verschiebt** statt hinzuzufügen |
| `olympiadActions.ts` → `submitJoinRequest` | Gleicher Fehler: überschreibt bestehende Mitgliedschaft bei Auto-Accept |
| `AdminRepository.ts` → `resolveJoinRequest` | Gleicher Fehler: überschreibt bei manueller Freigabe |
| `olympiadRepository.ts` → `getCurrentUserInstanceId()` | Gibt nur `memberships[0]` zurück — ignoriert alle weiteren Mitgliedschaften |
| `getLeaderboard.ts` | Nutzt `caller.memberships[0].instance` als Default — zeigt immer nur die erste Olympiade |
| `LeaderboardPage.tsx` | Kein Olympiade-Switcher für normale User — nur MASTER_ADMIN kann wechseln |

---

## Lösungsansatz

### Datenmodell (keine Schemaänderung nötig)

Das Schema bleibt unverändert. Lediglich der Anwendungscode muss korrigiert werden:  
- Beim Hinzufügen: `create`-only (niemals `update` mit neuer `instanceId`)  
- Duplikate: `upsert` mit `@@unique([userId, instanceId])` als where-Bedingung

### Aktive Olympiade / Kontext-Selektor

Da ein User jetzt in mehreren Olympiaden sein kann, braucht die UI einen Mechanismus, um festzustellen, **welche Olympiade gerade angezeigt wird**.

**Empfohlener Ansatz: Client-seitiger Selektor (kein DB-Feld nötig)**

- Ein `useActiveOlympiad()` Hook speichert die gewählte `instanceId` im `localStorage` (fällt auf die erste Mitgliedschaft zurück).
- Der Leaderboard und andere kontextsensitive Seiten lesen diesen Wert.
- Ein Dropdown/Switcher in der Sidebar oder im Header erlaubt das Wechseln.

**Warum nicht in der DB speichern?**  
Ein `activeInstanceId`-Feld im User-Modell würde eine Migration erfordern und muss synchron gehalten werden. `localStorage` ist ausreichend und vermeidet Server-Roundtrips.

---

## Offene Fragen

### F-1: Item-Zuordnung — Datum oder explizite Olympiade?

**Entschieden ✅**: Datumsfenster-Logik bleibt. Items gehören zur globalen Historie des Users. Jede Olympiade wertet unabhängig aus: „Welche Items dieses Users fallen in meinen Zeitraum?" Bei überlappenden Olympiaden zählt dasselbe Item in beiden Ranglisten — das ist gewollt. Kein Schema-Change nötig, Phase 3 entfällt.

---

### F-2: Olympiade-Kontext im Inventar

**Aktuell:** Das Inventar zeigt alle Items des Users, unabhängig von der aktiven Olympiade.

**Fragen:**
- Soll das Inventar gefiltert werden nach der aktiven Olympiade (nur Items im Zeitfenster)?
- Oder bleibt das Inventar immer global (alle Items aller Zeiträume)?

> **Empfehlung**: Inventar global lassen. Rangliste und Berichte zeigen das olympiadespezifische Bild. Das ist einfacher und weniger verwirrend.

---

### F-3: Mitgliedschaft verlassen

**Fragen:**
- Kann ein User selbst eine Olympiade verlassen (z. B. "Austritt")?
- Oder nur ein Admin kann einen User entfernen?

> **Empfehlung**: Nur Admins entfernen User. Ein versehentlicher Selbstaustritt ist schwer rückgängig zu machen.

---

### F-4: Beitrittscode — Mehrfach-Beitritt verhindern

**Aktuell:** `submitJoinRequest` prüft bereits ob der User Mitglied der spezifischen Olympiade ist (`alreadyMember`). Das funktioniert korrekt für Multi-Membership.

**Keine Änderung nötig.**

---

### F-5: Pending-Assignment-Seite

**Aktuell:** Der User wird auf `/pending-assignment` umgeleitet wenn `memberships.length === 0`.  
Mit Multi-Membership bleibt diese Logik korrekt — der User braucht mindestens eine Mitgliedschaft.

**Keine Änderung nötig.**

---

### F-6: Leaderboard-Default bei mehreren Mitgliedschaften

**Entschieden ✅**: Default = die zuletzt beigetretene **aktive** Olympiade (`isActive: true`, sortiert nach `joinedAt desc`). Der User kann über einen Switcher manuell wechseln; die Auswahl wird im `localStorage` gespeichert.

---

## Features & User Stories

### Feature M-001: Additive Mitgliedschaft (Bugfix + Kernänderung)

Beim Hinzufügen eines Users zu einer Olympiade wird die bestehende Mitgliedschaft **nicht** mehr entfernt.

| Story | Beschreibung | Betroffene Dateien |
|---|---|---|
| M-001-1 | `assignUserToOlympiad`: Nur `create` (kein `update` mehr) | `olympiadActions.ts` |
| M-001-2 | `submitJoinRequest` Auto-Accept: Nur `create` | `olympiadActions.ts` |
| M-001-3 | `resolveJoinRequest` Accept: Nur `create` | `AdminRepository.ts` |
| M-001-4 | Duplikat-Fehler abfangen (User ist bereits Mitglied) | alle drei oben |

---

### Feature M-002: Olympiade-Switcher im UI

Der User kann zwischen seinen Olympiaden wechseln.

| Story | Beschreibung | Betroffene Dateien |
|---|---|---|
| M-002-1 | `useActiveOlympiad()` Hook mit `localStorage` + Fallback auf erste aktive Mitgliedschaft | neues `src/features/olympiad/hooks/useActiveOlympiad.ts` |
| M-002-2 | `getMyMemberships()` Server Action: gibt alle Olympiaden des eingeloggten Users zurück | `olympiadActions.ts` |
| M-002-3 | Switcher-Dropdown in Sidebar oder Header (sichtbar wenn User > 1 Mitgliedschaft hat) | `Sidebar.tsx` oder `Header` |
| M-002-4 | Leaderboard-Seite nutzt aktive Olympiade aus Hook statt `memberships[0]` | `getLeaderboard.ts`, `LeaderboardPage.tsx` |
| M-002-5 | Berichte-Seite nutzt aktive Olympiade für Zeitfenster-Filter | `ReportingPage.tsx` |

---

### Feature M-003: Admin-Übersicht anpassen

Admins sehen alle Mitgliedschaften korrekt; Zuweisung ist additiv.

| Story | Beschreibung | Betroffene Dateien |
|---|---|---|
| M-003-1 | `OlympiadDetail` Mitgliederliste: User anzeigen, die in dieser Olympiade sind (bereits korrekt) | — |
| M-003-2 | Beim manuellen Hinzufügen per E-Mail: Fehlermeldung wenn User bereits Mitglied dieser Olympiade | `olympiadActions.ts`, `OlympiadDetail.tsx` |
| M-003-3 | `getAllUsers` in AdminRepository: `itemCount`/`soldCount`/`totalProfit` sind global über alle Olympiaden — bleibt so | — |

---

## Implementation Roadmap

### Phase 1 — Bugfix (Breaking Change beheben) ⚡

**Aufwand: ~1h | Risiko: niedrig**

1. `olympiadActions.ts`: `assignUserToOlympiad` — `findFirst + update` durch `upsert({ where: { userId_instanceId: ... } })` ersetzen
2. `olympiadActions.ts`: `submitJoinRequest` Auto-Accept — gleiche Korrektur
3. `AdminRepository.ts`: `resolveJoinRequest` — gleiche Korrektur
4. `olympiadRepository.ts`: `getCurrentUserInstanceId()` — Rückgabe aller Mitgliedschaften (für spätere Nutzung vorbereiten)

> Kein Schema-Update nötig. Kein Breaking Change für bestehende User-Daten.

---

### Phase 2 — Olympiade-Switcher 🔀

**Aufwand: ~3h | Abhängig von: F-2, F-6 beantwortet**

1. `getMyMemberships()` Server Action hinzufügen
2. `useActiveOlympiad()` Hook mit `localStorage`
3. Switcher-Komponente (Dropdown) in Sidebar, sichtbar wenn ≥ 2 Mitgliedschaften
4. `getLeaderboard` und Berichte an aktive Olympiade binden

---

~~Phase 3 — Item-Zuordnung~~ **entfällt** (F-1 geklärt: Datumsfenster-Logik reicht)

---

## Abhängigkeiten zwischen Phasen

```
Phase 1 (Bugfix) ──▶ Phase 2 (Switcher)
     ↑                      ↑
  sofort               F-2, F-6 ✅ geklärt
  umsetzbar
```

Phase 1 ist unabhängig und kann sofort implementiert werden — sie behebt den bestehenden Datenverlust-Bug.

---

## Nicht im Scope

- Olympiade-übergreifende Rangliste (alle User aller Olympiaden in einer Liste)
- Benutzer können selbst Olympiaden verlassen (→ F-3)
- Benachrichtigung bei Hinzufügen durch Admin
