# Tutorial-Konzept: Flohmarkt-Olympiade Onboarding

## Kontext & Ziel

Wenn ein neuer Nutzer zum ersten Mal die App öffnet, sieht er eine leere Inventarliste und keinerlei Erklärung, wie das System funktioniert. Die App hat drei Kernbereiche — Inventar, Berichte und Rangliste — und einen klar definierten Workflow: **kaufen → verwalten → verkaufen → auswerten**. Dieses Tutorial begleitet den Nutzer durch genau diesen Ablauf, ohne ihn zu überfordern.

Das Ziel ist nicht ein generisches "Feature-Rundgang"-Overlay, sondern ein kontextsensitives, schrittweises Onboarding, das dem Nutzer den **ersten echten Mehrwert** der App so schnell wie möglich erlebbar macht.

---

## Die Geschichte: Lisa's erster Flohmarkt

*Lisa hört von der Flohmarkt-Olympiade und meldet sich an. Sie möchte verstehen, wie sie ihre Flohmarkt-Käufe und Verkäufe am besten tracken kann, damit sie am Ende des Tages weiß, ob sie Gewinn gemacht hat — und wie sie im Vergleich zu den anderen Teilnehmern dasteht.*

---

### Schritt 1 – Willkommen & Orientierung

Lisa öffnet die App zum ersten Mal nach der Registrierung. Statt einer leeren Seite sieht sie ein freundliches Overlay, das in 2–3 Sätzen erklärt, worum es geht:

> **Willkommen bei der Flohmarkt-Olympiade!**
> Hier trackst du deine Einkäufe, Verkäufe und deinen Gewinn — und misst dich mit allen anderen Teilnehmern.
> Lass uns kurz durch die 3 Kernfunktionen gehen. Es dauert weniger als 2 Minuten.

Ein einzelner CTA: **"Los geht's"** — oder ein kleines **"Überspringen"** für Nutzer, die das nicht wollen.

---

### Schritt 2 – Artikel kaufen (Inventar)

Lisa landet auf der Inventar-Seite. Ein Highlight-Overlay zeigt auf den schwarzen **"Jetzt kaufen und später verkaufen"**-Button und erklärt:

> **Artikel kaufen**
> Du hast etwas auf dem Flohmarkt gefunden, das du weiterverkaufen willst? Trag es hier ein — Name, Kaufpreis, Plattform (eBay, Kleinanzeigen, ...) und ggf. Versandkosten.

Optional: Ein Demo-Artikel ("Vintage Kamera, 15 €") ist bereits eingetragen oder wird als Ghost-Vorschau angezeigt, damit Lisa sofort sieht, wie ein Eintrag aussieht.

---

### Schritt 3 – Verkaufen

Lisa sieht nun einen Artikel in der Liste. Das Overlay zeigt auf den **"Verkaufen"**-Button (erscheint beim Hover) oder auf **"Schnell verkaufen"** und erklärt:

> **Verkauf eintragen**
> Sobald du etwas verkauft hast, trägst du Verkaufspreis, Plattform und ggf. Versandkosten ein. Die App berechnet deinen Gewinn automatisch.

Zwei Wege werden erklärt:
- **Schnell verkaufen** — wenn du weißt, was du verkauft hast, aber es noch nicht im Inventar ist
- **Verkaufen** auf einem Artikel — wenn das Item bereits eingetragen ist

---

### Schritt 4 – Berichte verstehen

Lisa bekommt einen kurzen Einblick in die Berichte-Seite. Das Overlay zeigt auf die Tab-Leiste (Täglich / Monatlich / Quartalsweise / Kumulativ) und die KPI-Karten:

> **Deine Zahlen im Überblick**
> Hier siehst du, wie viel Umsatz und Gewinn du gemacht hast — nach Tag, Monat, Quartal oder kumuliert. Die Karten oben zeigen dir auf einen Blick: Einnahmen, Kosten, Profit.

---

### Schritt 5 – Rangliste & Motivation

Das letzte Tutorial-Overlay ist auf der Rangliste:

> **Die Olympiade beginnt!**
> Hier siehst du, wie du im Vergleich zu allen anderen Teilnehmern abschneidest — sortiert nach Gesamtgewinn. Die Pfeile zeigen dir, ob du seit letztem Sonntag auf- oder abgestiegen bist.

Abschließend: **"Alles klar — ich lege los!"** → schließt das Tutorial und landet den Nutzer auf dem Inventar.

---

## Designprinzipien

| Prinzip | Beschreibung |
|---|---|
| **Nicht-intrusiv** | Kein Blocken der UI. Nutzer können jederzeit überspringen oder das Tutorial neu starten. |
| **Kontextsensitiv** | Schritte erscheinen dort, wo die Funktion wirklich zu finden ist. |
| **Kein Demo-Datenmüll** | Es werden keine Demo-Datenbankeinträge angelegt, die der Nutzer später löschen muss. |
| **Einmalig** | Nach Abschluss wird das Tutorial nicht mehr gezeigt (gespeicherter Status im User-Profil). |
| **Wiederholbar** | In den Einstellungen (oder per Link) kann das Tutorial neu gestartet werden. |
| **Mobil-kompatibel** | Overlays funktionieren auch auf kleinen Screens (Flohmarkt = oft mobil). |

---

## Was das Tutorial NICHT tut

- Es erklärt keine Admin-Funktionen (nur für ADMIN-User relevant)
- Es zeigt keine Beispieldaten in der DB an
- Es erklärt keine erweiterten Reporting-Charts im Detail
- Es führt den Nutzer nicht durch ein vollständiges Formular (nur Hinzeigen, nicht Ausfüllen)
