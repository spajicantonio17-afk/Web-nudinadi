# PROJ-12: AI Text Cleanup & Description Generation

## Status: 🔵 Planned

## Beschreibung
AI generiert und optimiert Inserat-Beschreibungen. Kann aus Stichpunkten eine professionelle Beschreibung erstellen, Grammatik korrigieren und den Text ansprechender machen.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing Creation) - Integration beim Erstellen/Bearbeiten

## User Stories
- Als Verkäufer möchte ich aus Stichpunkten eine vollständige Beschreibung generieren lassen
- Als Verkäufer möchte ich meine bestehende Beschreibung verbessern lassen (Grammatik, Stil)
- Als Verkäufer möchte ich eine kurze, ansprechende Beschreibung für schnelle Inserate
- Als Verkäufer möchte ich die AI-Beschreibung vor Veröffentlichung bearbeiten können

## Acceptance Criteria
- [ ] "AI Opis" Button im Beschreibungsfeld
- [ ] AI generiert Beschreibung aus: Titel + Kategorie + Stichpunkte
- [ ] Beschreibungsstil: Kurz, modern, standardmäßig auf Bosnisch (Englisch wenn User EN eingestellt hat)
- [ ] Max 150 Zeichen für Kurzbeschreibung
- [ ] Grammatik- und Rechtschreibkorrektur
- [ ] Vorschau der AI-Beschreibung vor Übernahme
- [ ] "Prihvati" (Annehmen) und "Ponovno generiraj" (Nochmal) Buttons
- [ ] User kann AI-Text nach Übernahme frei bearbeiten
- [ ] Ton: Selbstbewusst, minimalistisch, ansprechend

## Edge Cases
- Was passiert bei sehr wenig Input (nur Titel)? → Generische aber hilfreiche Beschreibung
- Was passiert bei unangemessenem Input? → AI verweigert, Fehlermeldung
- Was passiert bei langem Text (>1000 Zeichen Input)? → Zusammenfassung erstellen
- Gemini API Fehler? → "AI nije dostupan, napiši opis ručno"

## Technische Anforderungen
- AI Provider: Google Gemini
- API Route: /api/ai/generate-description
- Input: { title, category, rawInput, mode: "generate" | "improve", locale: "bs" | "en" }
- Output: { description, shortDescription }
- Response Time: < 2 Sekunden
- Sprache: Standard Bosnisch, Englisch wenn User EN eingestellt hat
