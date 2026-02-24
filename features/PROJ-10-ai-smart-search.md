# PROJ-10: AI Smart Search

## Status: 🔵 Planned

## Beschreibung
AI-gestützte Suche die Synonyme, Tippfehler, Slang und natürliche Sprache versteht. Toggle zwischen normaler Suche und AI-Suche in der Suchleiste.

## Abhängigkeiten
- Benötigt: PROJ-4 (Home Feed) - Suchleiste Integration
- Benötigt: PROJ-6 (Category System) - Kategorie-Filterung der Ergebnisse

## User Stories
- Als User möchte ich in natürlicher Sprache suchen ("jeftini mobiteli u Zagrebu")
- Als User möchte ich trotz Tippfehler relevante Ergebnisse bekommen ("samzung" → Samsung)
- Als User möchte ich mit Synonymen suchen ("auto" findet auch "vozilo", "automobil")
- Als User möchte ich lokalen Slang verwenden können ("komad" für Handy)
- Als User möchte ich AI-Suche ein/ausschalten können (AI Toggle Button)
- Als User möchte ich sehen warum ein Ergebnis angezeigt wird (AI Relevanz-Hinweis)

## Acceptance Criteria
- [ ] AI Toggle Button neben der Suchleiste (an/aus)
- [ ] Normale Suche: Einfacher Text-Match (LIKE/Full-Text-Search)
- [ ] AI Suche: Gemini API versteht Intent und findet relevante Inserate
- [ ] Tippfehler-Korrektur: "Hinweis: Meintest du 'Samsung'?"
- [ ] Synonym-Erkennung: "auto" findet Inserate mit "vozilo", "automobil"
- [ ] Natürliche Sprache: "nešto za djecu do 50 EUR" → Kategorie Djeca, max 50 EUR
- [ ] Suchergebnisse zeigen Relevanz-Score (optional)
- [ ] Suchvorschläge beim Tippen (Auto-Complete, letzte 5 Suchen)
- [ ] Suche funktioniert auch ohne AI (Fallback auf Standard-Suche)
- [ ] AI Suche Response Time: < 2 Sekunden
- [ ] Such-History: Letzte 10 Suchen gespeichert (lokal)

## Edge Cases
- Was passiert bei Gemini API Timeout? → Fallback auf Standard-Suche
- Was passiert bei leerer Suche? → Trending/Beliebte Inserate anzeigen
- Was passiert bei Suche in anderer Sprache (Englisch)? → AI versteht und übersetzt
- Was passiert bei unangemessenen Suchbegriffen? → AI filtert, keine Ergebnisse
- Was passiert bei sehr langer Suchanfrage? → Max 200 Zeichen

## Technische Anforderungen
- AI Provider: Google Gemini (gemini-2.0-flash)
- API Route: /api/ai/search
- Fallback: Supabase Full-Text-Search
- Rate Limiting: 30 AI-Suchen pro Minute pro User
- Cache: Gleiche Suchen 5 Minuten cachen
- Such-History: localStorage (keine DB nötig)
