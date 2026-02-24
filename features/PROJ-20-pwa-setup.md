# PROJ-20: PWA Setup

## Status: 🔵 Planned

## Beschreibung
NudiNađi als Progressive Web App (PWA) konfigurieren. Installierbar auf Handy und Desktop, Offline-Support für Grundfunktionen, Push Notifications.

## Abhängigkeiten
- Keine (Infrastructure-Feature)

## User Stories
- Als Mobile-User möchte ich NudiNađi auf meinem Homescreen installieren
- Als User möchte ich die App auch bei schlechter Verbindung grundlegend nutzen können
- Als User möchte ich Push-Benachrichtigungen für neue Nachrichten erhalten
- Als User möchte ich die App starten ohne den Browser zu öffnen

## Acceptance Criteria
- [ ] Web App Manifest (manifest.json) konfiguriert
- [ ] App-Name: "NudiNađi"
- [ ] App-Icons in allen benötigten Größen (192x192, 512x512)
- [ ] Splash Screen konfiguriert
- [ ] "Dodaj na početni ekran" (Add to Homescreen) Prompt
- [ ] Service Worker für Offline-Cache
- [ ] Offline: Startseite und zuletzt geladene Inserate verfügbar
- [ ] Online-Status Indikator bei Offline
- [ ] Push Notifications Setup (Web Push API)
- [ ] App startet im Standalone-Modus (ohne Browser-UI)
- [ ] Theme-Color passend zum Dark/Light Mode

## Edge Cases
- Was passiert bei erstmaligem Besuch ohne Internet? → Basis-Offline-Seite "Nema internetske veze"
- Was passiert bei veralteten Offline-Daten? → "Podaci su možda zastarjeli" Hinweis
- Was passiert wenn User Push-Benachrichtigungen ablehnt? → Kein erneutes Fragen, in Settings aktivierbar

## Technische Anforderungen
- Next.js PWA: next-pwa oder @serwist/next
- Service Worker: Workbox für Cache-Strategien
- Cache: App-Shell (HTML/CSS/JS) + letzte 50 Inserate
- Push: Web Push API mit Supabase Edge Functions
- Icons: PNG + SVG, angepasst an NudiNađi Branding
- Lighthouse: PWA Score > 90
