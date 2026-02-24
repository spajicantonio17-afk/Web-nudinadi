# PROJ-7: Messaging System

## Status: 🔵 Planned

## Beschreibung
Echtzeit-Direktnachrichten zwischen Käufern und Verkäufern. Kontaktliste mit Online-Status, Chat-Ansicht mit Text- und Bild-Nachrichten.

## Abhängigkeiten
- Benötigt: PROJ-1 (User Authentication) - nur eingeloggte User
- Benötigt: PROJ-2 (User Profile) - Profilbild, Name in Chat
- Optional: PROJ-5 (Product Detail) - "Pošalji poruku" Button

## User Stories
- Als Käufer möchte ich einem Verkäufer eine Nachricht schreiben
- Als User möchte ich alle meine Chats in einer Kontaktliste sehen
- Als User möchte ich den Online-Status anderer User sehen
- Als User möchte ich Bilder in Chats senden können
- Als User möchte ich ein Preisangebot im Chat senden können
- Als User möchte ich Chats als gespeichert/gepinnt markieren können
- Als User möchte ich Benachrichtigungen für neue Nachrichten erhalten
- Als User möchte ich sehen, auf welches Inserat sich der Chat bezieht

## Acceptance Criteria
- [ ] Kontaktliste: Avatar, Name, letzte Nachricht, Zeitstempel
- [ ] Online-Status Indikator (grüner Punkt) in Kontaktliste
- [ ] Ungelesene Nachrichten: Badge-Counter auf Messages-Icon
- [ ] Chat-Ansicht: Nachrichten-Bubbles (eigene rechts, fremde links)
- [ ] Textnachrichten senden und empfangen
- [ ] Bild-Nachrichten senden (Kamera + Galerie)
- [ ] Preisangebot-Nachrichtentyp ("Ponuda: 150 EUR")
- [ ] Chat zeigt Bezug zum Inserat (Produktname + Thumbnail oben)
- [ ] Chat pinnen/speichern für wichtige Gespräche
- [ ] Echtzeit-Zustellung (Supabase Realtime)
- [ ] Benachrichtigungs-Badge im Header und Bottom-Nav
- [ ] Leere Kontaktliste: "Nemaš još poruka"

## Edge Cases
- Was passiert wenn Gesprächspartner Account löscht? → "Korisnik obrisan" in Chat
- Was passiert bei Bild über 5MB? → Komprimierung oder Fehlermeldung
- Was passiert bei Offline-Nachricht? → Nachricht in Queue, senden bei Reconnect
- Was passiert bei Spam? → Melde-Funktion "Prijavi korisnika"
- Was passiert bei blockiertem User? → Nachrichten nicht mehr möglich
- Max Nachrichten-Länge? → 2000 Zeichen

## Technische Anforderungen
- Realtime: Supabase Realtime Subscriptions
- Tabellen: `conversations`, `messages`
- Bilder: Supabase Storage, max 5MB komprimiert
- Nachrichtentypen: text, image, offer
- Online-Status: Supabase Presence
- Push: Web Push Notifications (PWA)
