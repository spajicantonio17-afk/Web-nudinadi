# PROJ-6: Category System

## Status: 🔵 Planned

## Beschreibung
Hierarchisches Kategorie-System mit 26+ Hauptkategorien und Unterkategorien. Basis für Filterung, Navigation und AI Auto-Categorization.

## Abhängigkeiten
- Keine (Basis-Feature, wird von vielen anderen Features genutzt)

## User Stories
- Als User möchte ich Inserate nach Hauptkategorien filtern
- Als User möchte ich innerhalb einer Kategorie nach Unterkategorien filtern
- Als User möchte ich alle Kategorien auf einen Blick sehen
- Als User möchte ich schnell zu beliebten Kategorien navigieren
- Als Verkäufer möchte ich beim Erstellen eines Inserats die passende Kategorie wählen

## Kategorien (aus Design)
1. Vozila (Fahrzeuge)
2. Nekretnine (Immobilien)
3. Servisi (Dienstleistungen)
4. Poslovi (Jobs)
5. Tehnika (Technik/Elektronik)
6. Dom (Haus & Garten)
7. Mobiteli (Handys)
8. Odjeća (Kleidung)
9. Video igre (Videospiele)
10. Muzika (Musik)
11. Sport
12. Knjige (Bücher)
13. Životinje (Tiere)
14. Djeca (Kinder)
15. Zdravlje (Gesundheit)
16. Ured (Büro)
17. Hrana (Lebensmittel)
18. Nakit (Schmuck)
19. Umjetnost (Kunst)
20. Kolekcionarstvo (Sammeln)
21. Alati (Werkzeug)
22. Poljoprivreda (Landwirtschaft)
23. Građevina (Bauwesen)
24. Usluge (Services)
25. Turizam (Tourismus)
26. Ostalo (Sonstiges)

## Acceptance Criteria
- [ ] 26+ Hauptkategorien mit Icons definiert
- [ ] Jede Hauptkategorie hat 3-10 Unterkategorien
- [ ] 6 primäre Kategorien prominent auf Home-Seite
- [ ] "Više kategorija" zeigt alle Kategorien in Modal/Overlay
- [ ] "Sve kategorije" Button setzt Filter zurück
- [ ] Kategorie-Icons: FontAwesome oder Lucide Icons
- [ ] Kategorie-Filter ist URL-parametrisiert (?category=vozila)
- [ ] Unterkategorie-Filter ebenfalls URL-parametrisiert
- [ ] Kategorien in Kroatisch/Bosnisch beschriftet
- [ ] Breadcrumb-Navigation: Home → Kategorie → Unterkategorie

## Edge Cases
- Was passiert bei leerer Kategorie (0 Inserate)? → Kategorie trotzdem anzeigen, "Nema oglasa u ovoj kategoriji"
- Was passiert bei ungültiger Kategorie in URL? → Redirect zu Startseite
- Neue Kategorien hinzufügen? → Admin-Funktion, Datenbank-basiert

## Technische Anforderungen
- Datenmodell: `categories` Tabelle mit parent_id für Hierarchie
- Seed Data: Alle 26 Kategorien mit Unterkategorien
- Cache: Kategorien 24h cachen (ändern sich selten)
- URL: Query-Parameter für SEO-freundliche Filterung
