# PROJ-13: AI Link Import

## Status: 🔵 Planned

## Beschreibung
User fügt eine URL von einem Webshop oder einer anderen Plattform ein, und AI erstellt automatisch ein Inserat mit Titel, Beschreibung, Preis und Bildern.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing Creation) - Formular befüllen
- Benötigt: PROJ-6 (Category System) - Auto-Kategorie
- Optional: PROJ-11 (AI Auto-Categorization) - Kategorie aus importierten Daten

## User Stories
- Als Verkäufer möchte ich eine Produkt-URL einfügen und automatisch ein Inserat erstellen lassen
- Als Verkäufer möchte ich die importierten Daten vor Veröffentlichung prüfen und anpassen
- Als Verkäufer möchte ich Bilder von der Quell-URL importieren können
- Als Verkäufer möchte ich den importierten Preis in EUR/KM sehen

## Acceptance Criteria
- [ ] "Uvezi s linka" (Von Link importieren) Button auf Upload-Seite
- [ ] URL-Eingabefeld mit Validierung
- [ ] AI scraped die URL und extrahiert: Titel, Beschreibung, Preis, Bilder
- [ ] Unterstützte Quellen: Allgemeine Webshops, Amazon, eBay, Njuškalo, OLX
- [ ] Importierte Daten befüllen das Inserat-Formular automatisch
- [ ] User kann alle importierten Felder bearbeiten
- [ ] Preis wird in EUR konvertiert (falls andere Währung)
- [ ] Bilder werden heruntergeladen und auf NudiNađi Storage gespeichert
- [ ] Loading-Animation während Import ("Uvozimo podatke...")
- [ ] Erfolgsmeldung mit Zusammenfassung der importierten Daten

## Edge Cases
- Was passiert bei ungültiger URL? → "Neispravan link" Fehlermeldung
- Was passiert bei blockierter Website (Anti-Scraping)? → "Ne možemo uvesti s ove stranice"
- Was passiert bei URL ohne Produktdaten? → "Nismo pronašli podatke o proizvodu"
- Was passiert bei Bildern die nicht geladen werden können? → Ohne Bilder importieren, Hinweis
- Was passiert bei Preis in unbekannter Währung? → Manuell eingeben lassen
- Was passiert bei Copyright-geschützten Bildern? → Hinweis dass eigene Fotos besser sind

## Technische Anforderungen
- API Route: /api/ai/import-link
- Scraping: Server-seitig (Next.js API Route)
- AI Provider: Gemini für Datenextraktion aus HTML
- Bild-Download: Server-seitig, max 10 Bilder, je max 2MB
- Timeout: 15 Sekunden pro URL
- Unterstützte Metadaten: OpenGraph, JSON-LD, Meta-Tags
