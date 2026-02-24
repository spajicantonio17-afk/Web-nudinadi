# PROJ-11: AI Auto-Categorization

## Status: 🔵 Planned

## Beschreibung
AI erkennt automatisch die passende Kategorie und Unterkategorie aus dem Titel und der Beschreibung eines Inserats. Schlägt dem Verkäufer die Kategorie vor.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing Creation) - Integration beim Erstellen
- Benötigt: PROJ-6 (Category System) - Kategorie-Liste

## User Stories
- Als Verkäufer möchte ich, dass die App automatisch eine Kategorie vorschlägt wenn ich den Titel eingebe
- Als Verkäufer möchte ich den AI-Vorschlag annehmen oder manuell ändern
- Als Verkäufer möchte ich auch eine Unterkategorie vorgeschlagen bekommen

## Acceptance Criteria
- [ ] Nach Titel-Eingabe (3+ Wörter): AI schlägt Kategorie vor
- [ ] Vorschlag erscheint als "Vorgeschlagene Kategorie: [X]" mit Accept/Reject
- [ ] AI schlägt auch Unterkategorie vor
- [ ] Kategorie-Vorschlag aktualisiert sich bei Beschreibungs-Änderung
- [ ] User kann Vorschlag jederzeit manuell überschreiben
- [ ] Vorschlag zeigt Konfidenz ("Sigurno: Mobiteli" vs "Možda: Tehnika")
- [ ] Funktioniert für alle 26+ Kategorien
- [ ] Erkennt Fahrzeuge separat (spezielle Formular-Felder)

## Edge Cases
- Was passiert bei unklarem Titel? → Top 2-3 Vorschläge anzeigen
- Was passiert bei Gemini API Fehler? → Manuelle Auswahl, kein Blocker
- Was passiert bei neuem Produkttyp der in keine Kategorie passt? → "Ostalo" vorschlagen

## Technische Anforderungen
- AI Provider: Google Gemini
- API Route: /api/ai/categorize
- Input: Titel + Beschreibung (optional)
- Output: { category, subCategory, confidence, isVehicle }
- Response Time: < 1.5 Sekunden
- Debounce: 500ms nach letzter Eingabe
