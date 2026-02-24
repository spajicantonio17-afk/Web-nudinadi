# PROJ-5: Product Detail View

## Status: 🔵 Planned

## Beschreibung
Detailansicht eines einzelnen Inserats mit allen Informationen, Verkäufer-Info, Bildergalerie und Kontakt-Möglichkeiten.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing) - Inserat-Daten
- Benötigt: PROJ-6 (Category System) - Kategorie-Anzeige
- Optional: PROJ-1 (User Authentication) - für Kontakt/Favoriten
- Optional: PROJ-7 (Messaging) - "Pošalji poruku" Button
- Optional: PROJ-8 (Favorites) - Favoriten-Toggle

## User Stories
- Als Käufer möchte ich alle Details eines Inserats sehen (Beschreibung, Preis, Zustand)
- Als Käufer möchte ich alle Bilder des Inserats in einer Galerie durchblättern
- Als Käufer möchte ich den Verkäufer-Profil sehen (Name, Trust-Level, Bewertungen)
- Als Käufer möchte ich den Verkäufer direkt kontaktieren können
- Als Käufer möchte ich das Inserat als Favorit speichern
- Als Käufer möchte ich den Standort des Artikels sehen
- Als Käufer möchte ich den Preis in EUR und KM sehen
- Als Käufer möchte ich ähnliche Inserate am Ende der Seite sehen

## Acceptance Criteria
- [ ] Bildergalerie: Swipebar, Zoom-fähig, Bild-Counter (1/5)
- [ ] Titel, Preis (EUR + KM), Zustand-Badge
- [ ] Vollständige Beschreibung (expandierbar bei langem Text)
- [ ] Kategorie und Unterkategorie als Breadcrumb
- [ ] Standort mit Stadtname
- [ ] Zeitstempel: "Objavljeno: danas 12:10" oder "prije 3 dana"
- [ ] Verkäufer-Box: Avatar, Name, Trust-Level, "seit [Datum] Mitglied"
- [ ] "Pošalji poruku" Button → öffnet Chat mit Verkäufer
- [ ] "Nazovi" Button (falls Telefonnummer angegeben)
- [ ] Favoriten-Herz-Button (Toggle)
- [ ] "Prijavi oglas" (Inserat melden) Link
- [ ] "Slični oglasi" Sektion mit 4-6 ähnlichen Inseraten
- [ ] Share-Button (Native Web Share API)
- [ ] SEO: Server-Side Rendered mit Open Graph Tags

## Edge Cases
- Was passiert bei gelöschtem Inserat? → "Oglas više nije dostupan" Meldung
- Was passiert bei nur 1 Bild? → Keine Galerie-Navigation, nur Einzelbild
- Was passiert bei keiner Beschreibung? → Sektion ausblenden
- Was passiert wenn Verkäufer gesperrt? → "Korisnik suspendiran" Badge
- Was passiert bei Kontakt ohne Login? → Weiterleitung zu Login

## Technische Anforderungen
- Route: /product/[id] (Dynamic Route)
- SEO: generateMetadata() mit Titel, Beschreibung, Bild
- Open Graph: og:title, og:description, og:image für Social Sharing
- Bilder: Optimized via Next.js Image Component
- Ähnliche Inserate: Gleiche Kategorie, gleicher Standort
