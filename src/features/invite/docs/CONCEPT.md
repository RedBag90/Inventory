# Invite System — Code-basierter Beitrittsflow v1.0

## Überblick

Admin definiert einen auto-generierten Beitrittscode für jede Olympiade und wählt,
ob Anfragen automatisch oder manuell freigegeben werden.
User ohne Olympiade sehen ein Modal → geben den Code ein → werden direkt aufgenommen
oder stellen eine Anfrage, die der Admin akzeptieren/ablehnen kann.

---

## Flow

```
Admin aktiviert Beitrittscode in OlympiadDetail (auto-generiert, kopierbar)
       ↓
User loggt ein ohne Olympiade → Modal auf /pending-assignment
       ↓
User gibt Code ein
       ↓
Auto-Accept AN?  →  Ja → direkte Aufnahme → Dashboard
                →  Nein → JoinRequest PENDING → "Warte auf Freigabe"
       ↓ (wenn manuell)
Admin bekommt Badge im UI + E-Mail (via Supabase SMTP) → akzeptiert / lehnt ab
       ↓
Akzeptiert: User wird Mitglied beim nächsten Login
Abgelehnt:  User kann neuen Code eingeben (REJECTED blockiert nicht)
```

---

## Entscheidungen

| Punkt | Entscheidung |
|---|---|
| Code-Format | Auto-generiert (z.B. `X7K2-M9QP`), Kopier-Button, neu generierbar |
| Mehrere Anfragen gleichzeitig | Erlaubt — User kann bei mehreren Olympiaden anfragen |
| Nach Ablehnung erneut anfragen | Ja — REJECTED blockiert nicht |
| Admin-Benachrichtigung | In-App Badge + E-Mail via Supabase SMTP |
| MASTER_ADMIN sieht | Anfragen aller Olympiaden |
| E-Mail-Provider | Supabase SMTP |

---

## Koexistenz mit bestehendem URL-Invite-System

Das bestehende `/join/[token]` URL-System bleibt parallel bestehen:
- **URL-Links**: sofortige Aufnahme, kein Approval-Flow
- **Code-System**: mit optionalem Approval-Flow
- Beide Systeme sind pro Instanz unabhängig voneinander konfigurierbar
