# PROJ-15: AI Filter Suggestions

## Status: 🔵 Planned

## Beschreibung
AI schlägt intelligente Filter vor basierend auf der aktuellen Suche, dem Browsing-Verhalten und der gewählten Kategorie. Zum Beispiel: "Zeige nur unter 100 EUR" oder "Nur in Zagreb".

## Abhängigkeiten
- Benötigt: PROJ-4 (Home Feed) - Filter-Integration
- Benötigt: PROJ-6 (Category System) - Kategorie-basierte Filter
- Optional: PROJ-10 (AI Smart Search) - Suchkontext nutzen

## User Stories
- Als Käufer möchte ich nach einer Suche passende Filtervorschläge sehen
- Als Käufer möchte ich Filter mit einem Klick anwenden
- Als Käufer möchte ich Preisbereich-Vorschläge basierend auf der Kategorie sehen
- Als Käufer möchte ich Standort-Filter basierend auf meinem Standort vorgeschlagen bekommen

## Acceptance Criteria
- [ ] Filter-Chips unter der Suchleiste nach einer Suche
- [ ] AI-generierte Chips: Preisbereich, Zustand, Standort, Unterkategorie
- [ ] Klick auf Chip wendet Filter an (togglebar)
- [ ] Filter-Vorschläge sind kontextabhängig (z.B. "Vozila" → "Diesel/Benzin/Elektro")
- [ ] Preisbereich-Vorschlag basiert auf durchschnittlichen Preisen der Kategorie
- [ ] Standort-Vorschlag: Nächste Stadt des Users (falls Standort erlaubt)
- [ ] Max 5 Filter-Chips gleichzeitig (nicht überladen)
- [ ] Aktive Filter klar erkennbar (farbliche Hervorhebung)

## Edge Cases
- Was passiert ohne Suchbegriff? → Beliebte Filter der Kategorie anzeigen
- Was passiert bei zu wenig Ergebnissen nach Filterung? → "Proširi pretragu" Vorschlag
- Was passiert ohne Standort-Berechtigung? → Kein Standort-Filter, andere Vorschläge
- Gemini API Fehler? → Standard-Filter (Preis, Zustand) ohne AI

## Technische Anforderungen
- AI Provider: Google Gemini
- API Route: /api/ai/filter-suggestions
- Input: { searchQuery, category, userLocation? }
- Output: { filters: [{ type, label, value }] }
- Response Time: < 1 Sekunde
- Cache: Gleiche Suche+Kategorie 10 Minuten cachen
