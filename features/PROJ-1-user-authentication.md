# PROJ-1: User Authentication

## Status: 🔵 Planned

## Beschreibung
Email/Passwort-basierte Authentifizierung für NudiNađi. Ermöglicht Registrierung, Login und Session-Management via Supabase Auth.

## Abhängigkeiten
- Keine (Basis-Feature)

## User Stories
- Als neuer User möchte ich mich mit Email und Passwort registrieren, um NudiNađi nutzen zu können
- Als registrierter User möchte ich mich einloggen, um auf mein Konto zuzugreifen
- Als eingeloggter User möchte ich eingeloggt bleiben nach Browser-Reload, um nicht ständig neu einloggen zu müssen
- Als User möchte ich mein Passwort zurücksetzen können, falls ich es vergessen habe
- Als User möchte ich mich ausloggen können, um mein Konto auf geteilten Geräten zu schützen

## Acceptance Criteria
- [ ] Registrierung mit Email + Passwort funktioniert
- [ ] Passwort muss mindestens 8 Zeichen haben (Buchstaben + Zahlen)
- [ ] Doppelte Email-Registrierung zeigt Fehlermeldung "Email već korištena"
- [ ] Login mit korrekten Credentials funktioniert und leitet zu /home
- [ ] Login mit falschen Credentials zeigt Fehlermeldung
- [ ] Session bleibt nach Browser-Reload erhalten (Supabase Session)
- [ ] Passwort-Reset per Email funktioniert
- [ ] Logout löscht Session und leitet zu Login-Seite
- [ ] Alle Auth-Formulare haben Lade-Indicator während der Anfrage
- [ ] Nicht-eingeloggte User werden automatisch zu Login weitergeleitet

## Edge Cases
- Was passiert bei doppelter Email? → Fehlermeldung "Email već korištena" anzeigen
- Was passiert bei schwachem Passwort? → Echtzeit-Validierung mit Hinweis
- Was passiert bei Netzwerkfehler während Registrierung? → Retry-Option anzeigen
- Was passiert wenn Passwort-Reset-Link abgelaufen? → Neuen Link anfordern Option
- Rate Limiting: Max 5 Login-Versuche pro Minute, danach 60 Sekunden Sperre

## Technische Anforderungen
- Auth Provider: Supabase Auth
- Session: JWT-basiert, automatische Refresh
- Passwort: Bcrypt-Hash (Supabase Standard)
- Rate Limiting: 5 Versuche/Minute
- Sprache UI: Bosnisch (Standard), Englisch (optional in Settings)
