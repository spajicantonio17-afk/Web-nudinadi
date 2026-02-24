# PROJ-8: Favorites System

## Status: 🔵 Planned

## Beschreibung
Inserate als Favoriten speichern/entfernen. Herz-Icon auf Produktkarten und in der Detailansicht. Gespeicherte Inserate im Profil abrufbar.

## Abhängigkeiten
- Benötigt: PROJ-1 (User Authentication) - nur eingeloggte User
- Benötigt: PROJ-2 (User Profile) - "Spremljeno" Tab
- Benötigt: PROJ-4 (Home Feed) - Herz-Icon auf Karten
- Benötigt: PROJ-5 (Product Detail) - Favoriten-Button

## User Stories
- Als Käufer möchte ich ein Inserat als Favorit markieren durch Klick auf das Herz-Icon
- Als Käufer möchte ich einen Favoriten wieder entfernen
- Als Käufer möchte ich alle meine gespeicherten Inserate im Profil sehen
- Als Käufer möchte ich sofort sehen ob ein Inserat bereits favorisiert ist (rotes Herz)

## Acceptance Criteria
- [ ] Herz-Icon auf jeder Produktkarte im Grid
- [ ] Herz-Icon in der Produkt-Detailansicht
- [ ] Klick auf Herz togglet Favorit (leer ↔ rot gefüllt)
- [ ] Favoriten-Toggle ohne Seitenreload (optimistisches UI)
- [ ] Gespeicherte Inserate im Profil Tab "Spremljeno"
- [ ] Entfernte Inserate verschwinden sofort aus "Spremljeno"
- [ ] Nicht-eingeloggte User → Login-Hinweis bei Herz-Klick
- [ ] Favoriten-Counter im Profil aktualisiert sich sofort

## Edge Cases
- Was passiert wenn favorisiertes Inserat gelöscht wird? → Aus Favoriten entfernen mit Hinweis
- Was passiert bei Netzwerkfehler beim Favorisieren? → Optimistisch anzeigen, bei Fehler zurücksetzen
- Was passiert bei Doppelklick auf Herz? → Debounce, kein doppelter Toggle

## Technische Anforderungen
- Tabelle: `favorites` (user_id, listing_id, created_at)
- RLS: User kann nur eigene Favoriten lesen/schreiben
- Optimistisches UI: Sofortige visuelle Änderung, Sync im Hintergrund
- Kein Pagination nötig (max ~100 Favoriten realistisch)
