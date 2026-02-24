# PROJ-4: Product Browse & Home Feed

## Status: 🔵 Planned

## Beschreibung
Startseite mit Produktgrid, Kategorie-Navigation und Suchleiste. Zeigt aktive Inserate als responsive Grid-Ansicht mit Filtern.

## Abhängigkeiten
- Benötigt: PROJ-6 (Category System) - Kategorie-Filterung
- Optional: PROJ-1 (User Authentication) - für personalisierte Inhalte
- Optional: PROJ-8 (Favorites) - Herz-Icon auf Karten
- Optional: PROJ-10 (AI Smart Search) - AI-Suche Toggle

## User Stories
- Als User möchte ich auf der Startseite aktuelle Inserate in einem Grid sehen
- Als User möchte ich nach Inseraten suchen über eine Suchleiste
- Als User möchte ich Inserate nach Kategorien filtern
- Als User möchte ich Inserate nach Preis, Standort und Zustand filtern
- Als User möchte ich unendlich scrollen um mehr Inserate zu laden
- Als User möchte ich ein Inserat antippen um zur Detailansicht zu gelangen
- Als User möchte ich die Suche auch ohne Login nutzen können

## Acceptance Criteria
- [ ] Startseite zeigt Produktgrid: Responsive (2 Spalten mobil → 7 Desktop)
- [ ] Jede Produktkarte zeigt: Bild, Titel, Preis (EUR + KM), Standort, Zeit
- [ ] Suchleiste oben zentriert mit Placeholder "Traži..."
- [ ] Kategorie-Buttons unter Suchleiste (6 primäre Kategorien)
- [ ] "Više kategorija" Button für alle 26+ Kategorien
- [ ] "Sve kategorije" Button um Filter zurückzusetzen
- [ ] Infinite Scroll: Nächste 20 Inserate laden beim Scrollen
- [ ] Skeleton-Loading während Inserate laden
- [ ] Klick auf Produktkarte → Navigation zu /product/:id
- [ ] Pull-to-Refresh auf Mobilgeräten
- [ ] Leere Suche zeigt: "Nema rezultata za [suchbegriff]"
- [ ] Sortierung: Neueste zuerst (Standard), Preis aufsteigend/absteigend
- [ ] Inserate zeigen Zustand-Badge (Novo/Kao novo/Korišteno)

## Edge Cases
- Was passiert bei 0 Inseraten? → Empty-State "Trenutno nema oglasa"
- Was passiert bei langsamer Verbindung? → Skeleton Loader, Bilder lazy-laden
- Was passiert bei Suche mit Sonderzeichen? → Input sanitizen
- Was passiert bei sehr langem Titel? → Truncate mit "..." nach 2 Zeilen
- Was passiert bei fehlendem Bild? → Placeholder-Bild anzeigen

## Technische Anforderungen
- Pagination: Cursor-basiert, 20 Items pro Seite
- Bilder: Lazy Loading mit Blur-Placeholder
- Response Time: < 500ms für initiale Ladung
- SEO: Server-Side Rendering für Startseite
- Cache: 60 Sekunden für Produktliste
