# PROJ-17: AI Moderation

## Status: 🔵 Planned

## Beschreibung
AI überwacht Inserate und Nachrichten auf Spam, Scam, Betrug, verbotene Inhalte und unangemessene Sprache. Automatische Markierung und Blockierung verdächtiger Aktivitäten.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing Creation) - Inserat-Prüfung
- Benötigt: PROJ-7 (Messaging System) - Nachrichten-Prüfung
- Optional: PROJ-18 (Trust Level) - Vertrauenswürdige User weniger streng prüfen

## User Stories
- Als Plattform-Betreiber möchte ich dass Inserate automatisch auf verbotene Inhalte geprüft werden
- Als Plattform-Betreiber möchte ich Scam-Versuche automatisch erkennen (z.B. "Überweise zuerst")
- Als Käufer möchte ich verdächtige Inserate melden können
- Als User möchte ich vor Phishing-Links in Nachrichten gewarnt werden
- Als User möchte ich keine beleidigenden Nachrichten erhalten

## Acceptance Criteria
- [ ] Automatische Prüfung jedes neuen Inserats vor Veröffentlichung
- [ ] Prüfung auf: Verbotene Produkte, Betrug, unangemessene Bilder, Spam
- [ ] Verdächtige Inserate: Automatisch in "Review Queue" für manuelle Prüfung
- [ ] Klar verbotene Inhalte: Automatisch blockiert mit Benachrichtigung an User
- [ ] Nachrichten-Scan: Warnung bei Phishing-Links, Scam-Muster
- [ ] "Prijavi oglas" (Melden) Button auf jedem Inserat
- [ ] Meldungs-Kategorien: Betrug, Falsche Infos, Verbotener Inhalt, Spam
- [ ] Anti-Scam Muster erkennen: "Überweise zuerst", externe Links, zu gute Angebote
- [ ] Wiederholungstäter: Account-Warnung, bei 3x → Sperre

## Edge Cases
- Was passiert bei False Positive? → User kann Einspruch erheben
- Was passiert bei Massenspam (Bot-Angriff)? → Rate Limiting + Auto-Block
- Was passiert bei grenzwertigen Inhalten? → Review Queue, menschliche Entscheidung
- Was passiert bei Beleidigung in Nachrichten? → Nachricht ausblenden, Warnung an Sender

## Technische Anforderungen
- AI Provider: Google Gemini für Content-Analyse
- API Route: /api/ai/moderate
- Prüfung: Asynchron nach Erstellung (non-blocking)
- Checks: Text-Analyse, Bild-Analyse (Gemini Vision), Link-Check
- Verbotene Kategorien: Waffen, Drogen, gestohlene Ware, Fälschungen
- Logging: Alle Moderations-Entscheidungen dokumentiert
- Admin Panel: Review Queue für markierte Inserate
