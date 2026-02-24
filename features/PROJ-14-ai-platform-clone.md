# PROJ-14: AI Platform Clone

## Status: 🔵 Planned

## Beschreibung
Inserat von einer anderen Plattform (Njuškalo, OLX.ba, Facebook Marketplace) importieren und als neues NudiNađi-Inserat erstellen. Spezialisierte Version von Link Import für bekannte Plattformen.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing Creation) - Formular befüllen
- Benötigt: PROJ-13 (AI Link Import) - Basis-Import-Logik
- Benötigt: PROJ-6 (Category System) - Kategorie-Mapping

## User Stories
- Als Verkäufer möchte ich mein Njuškalo-Inserat auf NudiNađi klonen
- Als Verkäufer möchte ich mein OLX.ba-Inserat auf NudiNađi klonen
- Als Verkäufer möchte ich mehrere Inserate von einer anderen Plattform importieren
- Als Verkäufer möchte ich dass die Kategorien automatisch gemappt werden (Njuškalo-Kat → NudiNađi-Kat)

## Acceptance Criteria
- [ ] "Kloniraj s platforme" Button mit Plattform-Auswahl
- [ ] Unterstützte Plattformen: Njuškalo.hr, OLX.ba, Facebook Marketplace
- [ ] Plattform-spezifisches Icon/Logo für Wiedererkennung
- [ ] Kategorie-Mapping: Njuškalo/OLX Kategorien → NudiNađi Kategorien
- [ ] Alle Felder importiert: Titel, Beschreibung, Preis, Bilder, Zustand, Standort
- [ ] Standort wird zu NudiNađi-Standort gemappt
- [ ] Import-Status anzeigen (Fortschrittsbalken)
- [ ] Nach Import: Formular zur Überprüfung anzeigen
- [ ] Hinweis: "Provjeri podatke prije objave"

## Edge Cases
- Was passiert bei privatem/nicht-öffentlichem Inserat? → "Oglas nije javno dostupan"
- Was passiert bei gelöschtem Inserat? → "Oglas više ne postoji"
- Was passiert wenn Plattform-Layout sich ändert? → Fallback auf generischen AI-Import (PROJ-13)
- Was passiert bei Inserat ohne Bilder? → Import ohne Bilder, Hinweis
- Was passiert bei unterschiedlichen Währungen? → Auto-Konvertierung zu EUR/KM

## Technische Anforderungen
- API Route: /api/ai/clone-platform
- Plattform-Parser: Spezialisierte Scraper pro Plattform
- Kategorie-Mapping: Vordefinierte Mapping-Tabelle
- Fallback: Generischer Import (PROJ-13) wenn Parser fehlschlägt
- Rate Limiting: Max 10 Imports pro Stunde pro User
