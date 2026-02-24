# PROJ-21: Onboarding Flow

## Status: 🔵 Planned

## Beschreibung
Willkommens-Screens für neue User. 3-Slide Carousel mit App-Einführung, Theme-Auswahl und Registrierung/Login.

## Abhängigkeiten
- Benötigt: PROJ-1 (User Authentication) - Login/Register auf letztem Screen
- Benötigt: PROJ-9 (Settings) - Theme-Auswahl

## User Stories
- Als neuer User möchte ich beim ersten Start eine kurze Einführung in die App sehen
- Als neuer User möchte ich sofort mein bevorzugtes Theme wählen (Dark/Light)
- Als neuer User möchte ich mich direkt registrieren oder einloggen
- Als wiederkehrender User möchte ich den Onboarding-Flow nicht nochmal sehen

## Onboarding Screens (aus Design)
1. **Slide 1 - Willkommen**: "Dobrodošli na NudiNađi!" – Kurze Beschreibung der App
2. **Slide 2 - Theme**: "Odaberi izgled" – Dark/Light Mode Auswahl mit Vorschau
3. **Slide 3 - Auth**: Email-Registrierung oder Login

## Acceptance Criteria
- [ ] 3-Slide Carousel mit Swipe-Navigation und Dot-Indicators
- [ ] Slide 1: App-Logo, Willkommenstext, "Nastavi" (Weiter) Button
- [ ] Slide 2: Dark/Light/System Mode Auswahl mit Live-Vorschau
- [ ] Slide 3: Email + Passwort Login/Register Formular
- [ ] "Preskoči" (Überspringen) Link auf jedem Screen
- [ ] Onboarding nur beim allerersten Besuch (localStorage Flag)
- [ ] Nach erfolgreichem Login/Register → Redirect zu /home
- [ ] Animation: Smooth Slide-Transition zwischen Screens
- [ ] Responsive: Mobile-optimiert, Desktop-freundlich

## Edge Cases
- Was passiert bei Browser-Cache gelöscht? → Onboarding nochmal zeigen
- Was passiert bei direktem Aufruf von /home ohne Onboarding? → Wenn nicht eingeloggt → Onboarding
- Was passiert bei "Preskoči"? → Direkt zu Login/Register (Slide 3)

## Technische Anforderungen
- Route: / (Root)
- State: localStorage "onboarding_completed" Flag
- Theme: next-themes Integration
- Animation: CSS Transitions oder Framer Motion
- Responsive: Mobile-first Design
