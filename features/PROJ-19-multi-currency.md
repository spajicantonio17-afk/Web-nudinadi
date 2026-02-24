# PROJ-19: Multi-Currency Support

## Status: 🔵 Planned

## Beschreibung
Doppelte Preisanzeige in EUR (Kroatien) und KM/BAM (Bosnien & Herzegowina) mit automatischer Kursumrechnung. Verkäufer wählt Primärwährung, Käufer sieht beide.

## Abhängigkeiten
- Benötigt: PROJ-3 (Product Listing) - Preis-Eingabe mit Währung
- Benötigt: PROJ-4 (Home Feed) - Doppel-Preis auf Karten
- Benötigt: PROJ-5 (Product Detail) - Doppel-Preis in Detail

## User Stories
- Als Verkäufer in Kroatien möchte ich Preise in EUR angeben
- Als Verkäufer in BiH möchte ich Preise in KM (BAM) angeben
- Als Käufer möchte ich beide Preise sehen (EUR + KM)
- Als Käufer möchte ich meine bevorzugte Währung als Primärwährung einstellen
- Als User möchte ich den aktuellen Wechselkurs sehen

## Acceptance Criteria
- [ ] Preis-Anzeige auf Produktkarten: "150 EUR · 293 KM"
- [ ] Verkäufer wählt Währung beim Erstellen (EUR oder KM)
- [ ] Sekundärpreis wird automatisch berechnet
- [ ] Wechselkurs: EUR ↔ KM (BAM) mit täglicher Aktualisierung
- [ ] Fixer Kurs: 1 EUR ≈ 1,95583 KM (offiziell fest)
- [ ] User kann bevorzugte Währung in Settings wählen
- [ ] Preisfilter funktioniert in beiden Währungen
- [ ] "Besplatno" (Gratis) bei Preis = 0
- [ ] "Po dogovoru" (Auf Verhandlung) als Preis-Option

## Edge Cases
- Was passiert wenn BAM-Kurs sich ändert? → BAM ist fest an EUR gebunden (1,95583), kein Problem
- Was passiert bei "Po dogovoru"? → Kein Preis anzeigen, nur Label
- Was passiert bei sehr hohen Preisen? → Formatierung: "15.000 EUR" (mit Punkt als Tausender-Trennzeichen)

## Technische Anforderungen
- Wechselkurs: Fest (1 EUR = 1,95583 KM) – da BAM fest an EUR gekoppelt
- Speicherung: Preis immer in EUR, KM wird berechnet
- Formatierung: Lokale Zahlenformate (1.234,56 für HR/BiH)
- Supabase: `price_eur` Spalte, `currency_primary` (EUR/KM)
