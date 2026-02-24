# PROJ-9: Settings & Preferences

## Status: 🔵 Planned

## Beschreibung
Einstellungs-Menü mit Account-Verwaltung, Sicherheit, Benachrichtigungen, Erscheinungsbild (Dark/Light Mode), Sprache und App-Personalisierung.

## Abhängigkeiten
- Benötigt: PROJ-1 (User Authentication) - Account-Einstellungen

## User Stories
- Als User möchte ich zwischen Dark und Light Mode wechseln
- Als User möchte ich die App-Sprache in den Einstellungen auf Englisch umstellen können (Standard: Bosnisch)
- Als User möchte ich meine Benachrichtigungen ein/ausschalten
- Als User möchte ich mein Passwort ändern
- Als User möchte ich sehen welche Geräte eingeloggt sind
- Als User möchte ich meinen Account löschen können

## Acceptance Criteria
- [ ] Menü-Seite mit Sektionen: Account, Sicherheit, Benachrichtigungen, Erscheinungsbild, Sprache
- [ ] Dark/Light/System Mode Toggle (next-themes)
- [ ] Standardsprache: Bosanski (für alle neuen User)
- [ ] Sprachwahl in Einstellungen: Bosanski (Standard), English (optional)
- [ ] Benachrichtigungs-Toggles: Nachrichten, Preisänderungen, Neue Inserate
- [ ] Passwort ändern: Aktuelles + Neues Passwort
- [ ] Aktive Sessions/Geräte anzeigen mit Logout-Option
- [ ] Account löschen mit Bestätigungsdialog und Passwort-Eingabe
- [ ] Sicherheits-Info Modal (Anti-Scam Hinweise)
- [ ] Alle Änderungen sofort gespeichert (kein Save-Button nötig)

## Edge Cases
- Was passiert bei Passwort-Änderung mit falschem altem Passwort? → Fehlermeldung
- Was passiert bei Account-Löschung mit aktiven Inseraten? → Warnung "Svi tvoji oglasi će biti obrisani"
- Was passiert bei Theme-Wechsel? → Sofortige Animation, kein Flicker

## Technische Anforderungen
- Theme: next-themes mit System-Detection
- Sprache: i18n Setup (Bosnisch als Standard + Englisch optional)
- i18n Library: next-intl oder next-i18next
- Default Locale: bs (Bosnisch)
- Locale-Dateien: /messages/bs.json (Standard), /messages/en.json (optional)
- Settings Storage: Supabase `user_settings` Tabelle
- Session-Management: Supabase Auth Sessions
- Account-Löschung: Soft-Delete (30 Tage Wiederherstellung)
