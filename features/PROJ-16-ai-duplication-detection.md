# PROJ-16: AI Duplication Detection

## Status: 🔵 Planned

## Beschreibung
AI erkennt doppelte oder sehr ähnliche Inserate beim Erstellen. Verhindert Spam und informiert den Verkäufer wenn ein ähnliches Inserat bereits existiert.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing Creation) - Prüfung beim Erstellen
- Benötigt: PROJ-4 (Home Feed) - Bestehende Inserate vergleichen

## User Stories
- Als Verkäufer möchte ich gewarnt werden wenn ich ein Duplikat erstelle
- Als Verkäufer möchte ich sehen welches bestehende Inserat ähnlich ist
- Als Plattform-Betreiber möchte ich Spam durch doppelte Inserate verhindern
- Als Käufer möchte ich keine doppelten Inserate in den Suchergebnissen sehen

## Acceptance Criteria
- [ ] Beim Erstellen: AI prüft auf ähnliche bestehende Inserate
- [ ] Prüfung basiert auf: Titel, Beschreibung, Bilder, Kategorie, Preis
- [ ] Warnung: "Sličan oglas već postoji" mit Link zum bestehenden Inserat
- [ ] User kann trotzdem fortfahren ("Objavi svejedno")
- [ ] Exakte Duplikate (gleicher Titel + gleiche Bilder) werden blockiert
- [ ] Ähnliche (aber nicht identische) Inserate zeigen nur Warnung
- [ ] Duplikat-Check auch für Bilder (Bild-Ähnlichkeit)
- [ ] Admin-Dashboard: Markierte Duplikate überprüfen

## Edge Cases
- Was passiert bei leicht geändertem Titel? → Fuzzy-Matching, trotzdem erkennen
- Was passiert bei gleichem Produkt aber anderem Preis? → Warnung, kein Block
- Was passiert bei gleichem Bild aber anderem Inserat? → Warnung "Slika korištena u drugom oglasu"
- Was passiert bei Aktualisierung eigener Inserate? → Kein Duplikat-Check gegen eigene Inserate

## Technische Anforderungen
- AI Provider: Google Gemini für Text-Ähnlichkeit
- Bild-Vergleich: Perceptual Hashing (pHash) oder Gemini Vision
- API Route: /api/ai/check-duplicate
- Input: { title, description, images[], category, price }
- Output: { isDuplicate, similarListings[], confidence }
- Prüfung: Vor Veröffentlichung (nicht bei Draft-Speichern)
- Schwellwert: > 85% Ähnlichkeit → Warnung, > 95% → Block
