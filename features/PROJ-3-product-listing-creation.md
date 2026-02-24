# PROJ-3: Product Listing Creation

## Status: 🔵 Planned

## Beschreibung
Inserat erstellen (Upload). Multi-Step-Formular für das Erstellen neuer Inserate mit Bildern, Beschreibung, Preis und Kategorie. AI-Features (Text Cleanup, Auto-Categorize) werden separat in PROJ-11/PROJ-12 spezifiziert.

## Abhängigkeiten
- Benötigt: PROJ-1 (User Authentication) - nur eingeloggte User
- Benötigt: PROJ-6 (Category System) - Kategorie-Auswahl
- Optional: PROJ-11 (AI Auto-Categorization) - Kategorie-Vorschlag
- Optional: PROJ-12 (AI Text Cleanup) - Beschreibungs-Optimierung

## User Stories
- Als Verkäufer möchte ich ein neues Inserat mit Titel, Beschreibung und Preis erstellen
- Als Verkäufer möchte ich Fotos zu meinem Inserat hochladen (max 10 Bilder)
- Als Verkäufer möchte ich eine Kategorie und Unterkategorie wählen
- Als Verkäufer möchte ich den Zustand angeben (Novo/Kao novo/Korišteno)
- Als Verkäufer möchte ich meinen Standort angeben
- Als Verkäufer möchte ich ein Inserat als Draft speichern und später fertigstellen
- Als Verkäufer möchte ich die Währung wählen (EUR oder KM)
- Als Verkäufer möchte ich ein bestehendes Inserat bearbeiten
- Als Verkäufer möchte ich ein Inserat löschen oder deaktivieren

## Acceptance Criteria
- [ ] Formular-Felder: Titel (Pflicht), Beschreibung, Preis (Pflicht), Währung
- [ ] Bildupload: Min 1, Max 10 Bilder, Drag & Drop + File Picker
- [ ] Bildvorschau mit Lösch-Option und Reihenfolge ändern
- [ ] Kategorie-Auswahl: Hauptkategorie → Unterkategorie (2-stufig)
- [ ] Zustand-Auswahl: Novo / Kao novo / Korišteno
- [ ] Standort-Eingabe mit Dropdown (Städte in HR + BiH)
- [ ] Preis-Eingabe mit Währungsumschalter (EUR ↔ KM)
- [ ] "Spremi kao draft" Button speichert unvollständiges Inserat
- [ ] "Objavi oglas" Button publiziert das Inserat
- [ ] Pflichtfelder-Validierung vor Veröffentlichung
- [ ] Erfolgsmeldung nach Veröffentlichung mit Link zum Inserat
- [ ] Inserat bearbeiten: alle Felder nachträglich änderbar
- [ ] Inserat löschen mit Bestätigungsdialog
- [ ] Bilder werden komprimiert vor Upload (max 2MB/Bild)

## Edge Cases
- Was passiert bei Upload-Abbruch? → Draft automatisch gespeichert
- Was passiert bei Netzwerkfehler während Bild-Upload? → Retry pro Bild
- Was passiert bei zu großen Bildern? → Auto-Komprimierung, Fehler ab >10MB
- Was passiert bei Sonderzeichen im Titel? → Sanitization, max 100 Zeichen
- Was passiert bei Preis = 0? → "Besplatno" (Gratis) Label anzeigen
- Was passiert bei fehlender Kategorie? → Pflichtfeld-Hinweis

## Technische Anforderungen
- Bilder: Supabase Storage, max 10 Bilder á 2MB (komprimiert)
- Bildformate: JPG, PNG, WebP, HEIF
- Draft-Speicherung: Supabase `listings` Tabelle mit status "draft"
- Formular: React Hook Form + Zod Validierung
- Standort-Daten: Vordefinierte Liste HR + BiH Städte
