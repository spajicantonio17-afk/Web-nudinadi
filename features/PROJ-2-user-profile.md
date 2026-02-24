# PROJ-2: User Profile

## Status: 🔵 Planned

## Beschreibung
User-Profil anzeigen und bearbeiten. Zeigt aktive Inserate, Drafts, gespeicherte Artikel und Trust-Level/XP Fortschritt.

## Abhängigkeiten
- Benötigt: PROJ-1 (User Authentication) - für eingeloggte User-Checks

## User Stories
- Als User möchte ich mein Profil mit Username, Name, Bio und Avatar sehen
- Als User möchte ich meine Profil-Daten bearbeiten können
- Als User möchte ich meine aktiven Inserate im Profil sehen
- Als User möchte ich meine Drafts (Entwürfe) sehen und weiterbearbeiten können
- Als User möchte ich meinen Trust-Level und XP-Fortschritt sehen
- Als User möchte ich die Anzahl meiner Follower und Following sehen
- Als User möchte ich das Profil anderer Verkäufer ansehen können

## Acceptance Criteria
- [ ] Profil-Seite zeigt: Avatar, Username, Vollname, Bio
- [ ] Profil-Seite zeigt: Follower-Anzahl, Following-Anzahl
- [ ] Profil-Seite zeigt: Trust-Level Badge und XP-Fortschrittsbalken
- [ ] Tab-Navigation: "Aktivni" (aktive Inserate), "Drafts", "Spremljeno" (gespeichert)
- [ ] "Aktivni" Tab zeigt alle aktiven Inserate des Users als Grid
- [ ] "Drafts" Tab zeigt unvollständige Inserate
- [ ] "Spremljeno" Tab zeigt gespeicherte/gemerkteInserate
- [ ] Profil bearbeiten: Name, Bio, Avatar ändern
- [ ] Avatar-Upload mit Bildvorschau
- [ ] Fremde Profile zeigen: Inserate, Bewertungen, Trust-Level (kein Edit)
- [ ] Leere Tabs zeigen Empty-State mit passender Nachricht

## Edge Cases
- Was passiert bei sehr langer Bio? → Max 250 Zeichen mit Counter
- Was passiert bei Avatar-Upload über 5MB? → Fehlermeldung "Slika je prevelika"
- Was passiert wenn User keine Inserate hat? → Empty-State "Nemaš još oglasa"
- Was passiert bei Profilansicht eines gelöschten Users? → "Korisnik nije pronađen"
- Was passiert bei ungültigem Bildformat? → Nur JPG, PNG, WebP erlaubt

## Technische Anforderungen
- Avatar Storage: Supabase Storage (max 5MB, JPG/PNG/WebP)
- Profil-Daten: Supabase `profiles` Tabelle
- Response Time: < 300ms für Profil-Laden
- Bildkomprimierung: Client-seitig vor Upload
