# PROJ-18: AI Trust Level & XP System

## Status: 🔵 Planned

## Beschreibung
Vertrauens- und Reputationssystem basierend auf Verkäufer-Aktivität, Bewertungen und Zuverlässigkeit. Höheres Level = mehr Vertrauen, verifizierter Badge und Premium-Features.

## Abhängigkeiten
- Benötigt: PROJ-1 (User Authentication) - User-Account
- Benötigt: PROJ-2 (User Profile) - XP-Anzeige im Profil
- Benötigt: PROJ-3 (Product Listing) - XP durch Inserate
- Benötigt: PROJ-7 (Messaging) - XP durch Antwortzeit

## User Stories
- Als Verkäufer möchte ich durch gute Verkäufe und schnelle Antworten XP sammeln
- Als Verkäufer möchte ich meinen Trust-Level und Fortschritt sehen
- Als Verkäufer möchte ich mit höherem Level einen Vertrauens-Badge erhalten
- Als Käufer möchte ich den Trust-Level eines Verkäufers sehen um Vertrauen einzuschätzen
- Als User möchte ich verstehen wie ich mein Level erhöhen kann

## Trust Levels
1. **Level 1 - Novi** (0-99 XP): Neuer User, Standard-Features
2. **Level 2 - Aktivan** (100-499 XP): Aktiver User, grüner Badge
3. **Level 3 - Pouzdan** (500-1499 XP): Zuverlässig, blauer Badge
4. **Level 4 - Zvijezda** (1500-4999 XP): Star-Verkäufer, goldener Badge
5. **Level 5 - Legenda** (5000+ XP): Legende, Premium-Badge, Top-Platzierung

## XP-Quellen
- Inserat erstellt: +10 XP
- Inserat verkauft (als "verkauft" markiert): +50 XP
- Positive Bewertung erhalten: +25 XP
- Schnelle Antwort (<1h): +5 XP
- 30 Tage ohne Meldung: +20 XP (monatlich)
- Profil vollständig ausgefüllt: +30 XP (einmalig)
- Verifizierte Email: +20 XP (einmalig)

## XP-Abzüge
- Inserat gemeldet und bestätigt: -50 XP
- Spam-Warnung: -25 XP
- Account-Sperre (temporär): -100 XP

## Acceptance Criteria
- [ ] XP-Fortschrittsbalken im User-Profil
- [ ] Trust-Level Badge neben Username (überall wo User angezeigt wird)
- [ ] Level-Up Benachrichtigung ("Čestitamo! Dosegnuo si Level 3!")
- [ ] XP-History: User kann sehen woher XP kommt
- [ ] Trust-Level auf Produktkarten und in der Detailansicht sichtbar
- [ ] Badge-Farben: Grau (L1), Grün (L2), Blau (L3), Gold (L4), Lila (L5)
- [ ] "Kako povećati level?" Info-Seite mit XP-Quellen
- [ ] AI berechnet Trust-Score aus mehreren Faktoren (nicht nur XP-Summe)

## Edge Cases
- Was passiert bei XP-Manipulation (Fake-Verkäufe)? → AI Anomalie-Erkennung
- Was passiert bei langem Inaktivität? → XP bleibt, kein Verfall
- Was passiert bei Account-Sperre? → XP eingefroren, Level nicht sichtbar
- Negativer XP-Stand möglich? → Minimum 0 XP

## Technische Anforderungen
- Tabellen: `user_xp` (user_id, xp_total, level), `xp_transactions` (user_id, amount, reason, created_at)
- AI: Gemini für Anomalie-Erkennung (optional)
- Berechnung: Server-seitig bei Trigger-Events
- Cache: Trust-Level 1h cachen (ändert sich selten)
- Badge-Assets: SVG Icons pro Level
