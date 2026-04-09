# Implementation Stories: Tutorial-Modul

## Übersicht

Das Tutorial-Modul besteht aus einem persistierten Fortschrittsstatus pro Nutzer, einem globalen Kontext-Provider und mehreren Overlay-Komponenten, die auf den bestehenden Seiten eingeblendet werden.

---

## Story T-001 — Tutorial-Status in der Datenbank

**Als** Entwickler  
**möchte ich** den Tutorial-Fortschritt eines Nutzers dauerhaft speichern,  
**damit** das Tutorial nach dem Abschluss nicht mehr erscheint und bei erneutem Login nicht neu startet.

### Akzeptanzkriterien
- [ ] Das `User`-Prisma-Model bekommt ein neues Feld: `tutorialCompletedAt DateTime?`
- [ ] Eine neue Server Action `completeTutorial()` setzt `tutorialCompletedAt = now()` für den eingeloggten User
- [ ] Eine neue Server Action `resetTutorial()` setzt das Feld zurück auf `null`
- [ ] `useCurrentDbUser` gibt `tutorialCompletedAt` zurück (ggf. Select erweitern)

### Technische Hinweise
- Prisma-Migration: `npx prisma migrate dev --name add_tutorial_completed`
- Actions in `src/features/tutorial/actions/tutorialActions.ts`

---

## Story T-002 — Tutorial-Kontext & State-Management

**Als** Entwickler  
**möchte ich** einen globalen React-Kontext für den Tutorial-Zustand,  
**damit** alle Seiten (Inventar, Berichte, Rangliste) den aktuellen Tutorial-Schritt lesen und steuern können.

### Akzeptanzkriterien
- [ ] `TutorialContext` stellt bereit: `{ step: TutorialStep | null, next(), skip(), restart() }`
- [ ] `TutorialStep` ist ein Union-Type: `'welcome' | 'inventory-add' | 'inventory-sell' | 'reporting' | 'leaderboard' | 'done'`
- [ ] `TutorialProvider` initialisiert den Step auf `'welcome'` wenn `tutorialCompletedAt === null`, sonst `null`
- [ ] `next()` geht zum nächsten Step **und** leitet per `router.push()` zur zugehörigen Route weiter; beim letzten Step wird `completeTutorial()` aufgerufen
- [ ] `skip()` ruft `completeTutorial()` auf und setzt Step auf `null`
- [ ] `restart()` ruft `resetTutorial()` auf, setzt Step auf `'welcome'` und navigiert zu `/dashboard/inventory`

### Step → Route Mapping
| Step | Route |
|---|---|
| `welcome` | (aktuell, kein Redirect) |
| `inventory-add` | `/dashboard/inventory` |
| `inventory-sell` | `/dashboard/inventory` |
| `reporting` | `/dashboard/reporting` |
| `leaderboard` | `/dashboard/leaderboard` |
| `done` | `/dashboard/inventory` |

### Technische Hinweise
- `src/features/tutorial/context/TutorialContext.tsx`
- Provider wird in `src/app/dashboard/layout.tsx` eingebunden (unterhalb von `useCurrentDbUser`)

---

## Story T-003 — Welcome-Overlay (Schritt 1)

**Als** neuer Nutzer  
**möchte ich** beim ersten Öffnen der App begrüßt werden und eine kurze Einführung erhalten,  
**damit** ich verstehe, was die App kann, bevor ich loslege.

### Akzeptanzkriterien
- [ ] Overlay erscheint als zentriertes Modal über der gesamten Seite (nicht seitenspezifisch)
- [ ] Inhalt: App-Name, 2–3 Sätze Zweck, Auflistung der 3 Kernbereiche (mit Icons)
- [ ] CTA: **"Los geht's"** (→ next()) und **"Tutorial überspringen"** (→ skip())
- [ ] Overlay ist nicht durch Klick auf den Hintergrund schließbar (zwingt zur expliziten Entscheidung)
- [ ] Responsive: funktioniert auf Screens ab 375px Breite

### Technische Hinweise
- Komponente: `src/features/tutorial/components/WelcomeOverlay.tsx`
- Rendern in `TutorialProvider` oder im Dashboard-Layout basierend auf `step === 'welcome'`

---

## Story T-004 — Spotlight-Overlay: Artikel kaufen (Schritt 2)

**Als** neuer Nutzer  
**möchte ich** einen Hinweis sehen, der mir zeigt, wie ich einen neuen Artikel eintrage,  
**damit** ich den "Jetzt kaufen"-Button finde und verstehe, was er bewirkt.

### Akzeptanzkriterien
- [ ] Overlay erscheint nur auf `/dashboard/inventory`; Tutorial-Step wechselt automatisch dorthin (Redirect oder Warten bis Route aktiv)
- [ ] Ein Tooltip/Callout-Pfeil zeigt auf den **"Jetzt kaufen und später verkaufen"**-Button
- [ ] Text erklärt: Artikelname, Kaufpreis, Plattform, optionale Kosten
- [ ] CTA: **"Verstanden"** (→ next()) und kleines **"Überspringen"** (→ skip())
- [ ] Der Hintergrund ist leicht abgedunkelt, der Button und die Erklärung sind hell hervorgehoben (Spotlight-Effekt)

### Technische Hinweise
- Komponente: `src/features/tutorial/components/SpotlightOverlay.tsx` (wiederverwendbar für T-005, T-006, T-007)
- Props: `{ targetSelector: string, title: string, description: string, onNext, onSkip }`
- Spotlight per `box-shadow: 0 0 0 9999px rgba(0,0,0,0.5)` auf das Zielelement
- Tooltip erscheint ober- oder unterhalb je nach verfügbarem Platz (kein Abschneiden auf kleinen Screens)
- `InventoryPage.tsx` bekommt ein `data-tutorial="buy-button"` Attribut am Button

---

## Story T-005 — Spotlight-Overlay: Verkauf eintragen (Schritt 3)

**Als** neuer Nutzer  
**möchte ich** verstehen, wie ich einen Verkauf eintrage (sowohl "Schnell verkaufen" als auch via Artikel),  
**damit** ich nach meinem ersten echten Verkauf sofort weiß, was zu tun ist.

### Akzeptanzkriterien
- [ ] Overlay erscheint auf `/dashboard/inventory` (direkt nach Schritt 2)
- [ ] Zwei Bereiche werden erklärt: "Schnell verkaufen"-Button und der Hover-Verkaufen-Button auf einem Artikel
- [ ] Wenn keine echten Artikel vorhanden sind, rendert `ItemTable` einen nicht-interaktiven **Ghost-Artikel** ("Vintage Kamera · 15 €") als ersten Eintrag (leicht transparent, `pointer-events-none`, nicht in DB)
- [ ] Der Ghost-Artikel verschwindet, sobald der Tutorial-Step weitergeht oder echte Items existieren
- [ ] CTA: **"Verstanden"** (→ next()) und **"Überspringen"** (→ skip())

### Technische Hinweise
- Wiederverwendung von `SpotlightOverlay` aus T-004
- `data-tutorial="quick-sell-button"` am "Schnell verkaufen"-Button
- Ghost-Artikel: `ItemTable` prüft `step === 'inventory-sell' && items.length === 0` und rendert eine statische `GhostItemCard`-Komponente

---

## Story T-006 — Seiten-Highlight: Berichte (Schritt 4)

**Als** neuer Nutzer  
**möchte ich** eine kurze Erklärung der Berichte-Seite,  
**damit** ich weiß, wo ich meinen Gewinn und meine Umsätze nachschauen kann.

### Akzeptanzkriterien
- [ ] Tutorial navigiert (oder wartet bis Nutzer navigiert) zu `/dashboard/reporting`
- [ ] Overlay hebt die Tab-Leiste (Täglich/Monatlich/...) und die KPI-Karten hervor
- [ ] Text: kurze Erklärung der Ansichten und KPI-Bedeutung (Einnahmen, Kosten, Profit)
- [ ] CTA: **"Weiter"** (→ next()) und **"Überspringen"** (→ skip())

### Technische Hinweise
- Highlight kann als Banner-Callout oben auf der Seite erscheinen (statt Spotlight), da mehrere Elemente erklärt werden
- `data-tutorial="reporting-tabs"` auf dem Tab-Container

---

## Story T-007 — Seiten-Highlight: Rangliste (Schritt 5)

**Als** neuer Nutzer  
**möchte ich** verstehen, was die Rangliste zeigt und wie ich mich mit anderen messe,  
**damit** ich die Motivation hinter dem "Olympiade"-Konzept verstehe.

### Akzeptanzkriterien
- [ ] Tutorial navigiert zu `/dashboard/leaderboard`
- [ ] Overlay erklärt: Sortierung nach Gewinn, Rang-Änderungspfeile, wöchentlicher Reset
- [ ] Abschluss-CTA: **"Alles klar — ich lege los!"** (→ skip/done, leitet zu `/dashboard/inventory`)
- [ ] Nach Abschluss wird `tutorialCompletedAt` gesetzt

### Technische Hinweise
- Letzte Aktion in `next()` bei Step `'leaderboard'` ruft `completeTutorial()` auf
- Redirect nach Abschluss: `router.push('/dashboard/inventory')`

---

## Story T-008 — Tutorial neu starten

**Als** Nutzer  
**möchte ich** das Tutorial jederzeit neu starten können,  
**damit** ich Funktionen erneut erklärt bekommen kann.

### Akzeptanzkriterien
- [ ] In einem zugänglichen Bereich (z.B. User-Menü oder Sidebar-Footer) gibt es einen Link **"Tutorial neu starten"**
- [ ] Klick ruft `restart()` aus dem TutorialContext auf
- [ ] Tutorial startet bei Schritt 1 (Welcome-Overlay) neu

### Technische Hinweise
- Einstiegspunkt: `src/features/auth/components/UserMenu.tsx` (Link am Ende des Menüs)

---

## Abhängigkeiten & Reihenfolge

```
T-001 (DB)
  └─ T-002 (Kontext)
       ├─ T-003 (Welcome)
       ├─ T-004 (Spotlight-Komponente + Inventory-Add)
       │    └─ T-005 (Inventory-Sell)
       │         └─ T-006 (Reporting)
       │               └─ T-007 (Leaderboard + Abschluss)
       └─ T-008 (Neustart, parallel möglich nach T-002)
```

---

## Entscheidungen (ehemals offene Fragen)

1. **Routing-Strategie**: ✅ **Auto-Redirect.** Das Tutorial leitet den Nutzer automatisch zur nächsten Seite weiter. `next()` im TutorialContext ruft `router.push(nextRoute)` auf, bevor der Step gesetzt wird.

2. **Mobil**: ✅ **Spotlight mit `box-shadow`-Cutout auf allen Screens.** Kein Bottom-Sheet-Fallback. Die Spotlight-Komponente muss auf kleinen Screens sicherstellen, dass der Tooltip ober- oder unterhalb des Zielelements erscheint (kein Abschneiden).

3. **Leere Inventarliste**: ✅ **Ja — Ghost-Artikel rendern.** `ItemTable` rendert bei aktivem Tutorial-Step `'inventory-sell'` einen nicht-interaktiven Ghost-Artikel ("Vintage Kamera · 15 €") als ersten Listeneintrag. Dieser ist optisch als Platzhalter erkennbar (leicht transparent, kein Klick möglich) und existiert nicht in der DB. Er verschwindet, sobald das Tutorial-Step weitergeht oder echte Items vorhanden sind.

4. **i18n**: ✅ **Kein Handlungsbedarf.** App bleibt einsprachig Deutsch.
