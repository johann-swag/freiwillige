# Freiwillig — Einrichtung & Onboarding

Willkommen! Diese Anleitung zeigt dir, wie du deine Freiwillig-Installation
einrichtest und anpasst — ohne technische Vorkenntnisse.

---

## Schritt 1 — Organisation konfigurieren

Öffne die Datei `config/tenant.env` in einem Texteditor und fülle sie aus:

```env
ORG_NAME="Name deiner Organisation"
ORG_SLUG="dein-org-slug"          # nur Kleinbuchstaben und Bindestriche
DOMAIN="freiwillig.deine-ngo.de"
ADMIN_EMAIL="koordination@deine-ngo.de"
ADMIN_FIRST_NAME="Maria"
ADMIN_LAST_NAME="Muster"
TIMEZONE="Europe/Berlin"
LANGUAGE="de"
```

---

## Schritt 2 — Programme und Einsatzstellen eintragen

Die Seed-Dateien sind CSV-Dateien, die du in Excel, LibreOffice oder einem
Texteditor bearbeiten kannst.

### `seeds/programs.csv` — Deine Programme

Jede Zeile ist ein Programm (z.B. "Umwelt Mexiko 2026").

| Spalte | Beschreibung | Beispiel |
|---|---|---|
| `slug` | Interner ID — einmal setzen, nicht mehr ändern | `umwelt-mx-2026` |
| `name` | Anzeigename | `Umwelt & Naturschutz Mexiko 2026` |
| `service_type` | Art des Dienstes | `weltwaerts`, `fsj`, `foj`, `bfd` |
| `focus_areas` | Schwerpunkte (Komma-getrennt) | `ecology,agriculture` |
| `country` | Zielland (2 Buchstaben) | `MX`, `GH`, `DE`, `PE` |
| `start_date` | Beginn (YYYY-MM-DD) | `2026-09-01` |
| `end_date` | Ende (YYYY-MM-DD) | `2027-08-31` |
| `status` | Status | `planned`, `active` |
| `coordinator_email` | E-Mail des Koordinators | `koordination@ngo.de` |

### `seeds/sites.csv` — Deine Einsatzstellen

Jede Zeile ist eine Einsatzstelle.

| Spalte | Beschreibung | Beispiel |
|---|---|---|
| `slug` | Interner ID | `naturschutz-oaxaca` |
| `name` | Name der Stelle | `Naturschutzstation Oaxaca` |
| `program_slug` | Welches Programm? (aus programs.csv) | `umwelt-mx-2026` |
| `country` | Land | `MX` |
| `city` | Stadt | `Oaxaca` |
| `contact_name` | Ansprechperson vor Ort | `Carlos Ruiz` |
| `contact_email` | E-Mail vor Ort | `carlos@station.mx` |
| `focus_areas` | Schwerpunkte | `ecology,agriculture` |
| `required_languages` | Sprachvoraussetzungen | `es-B2,en-B1` |
| `capacity` | Max. gleichzeitige Freiwillige | `4` |
| `duration_months` | Einsatzdauer in Monaten | `6`, `12` |

**Sprachcodes:** `de-native`, `en-B2`, `es-C1`, `fr-A2` usw.

### `seeds/document_types.csv` — Erforderliche Dokumente

Definiert, welche Dokumente Freiwillige hochladen müssen.

### `seeds/users.csv` — Koordinatoren und Einsatzstellen-Kontakte

Accounts die beim Start angelegt werden.

---

## Schritt 3 — Installation starten

```bash
./install.sh
```

Das war's. Der Installer:
1. Prüft deine Konfiguration auf Fehler
2. Generiert sichere Passwörter automatisch
3. Startet alle Dienste
4. Richtet Datenbank und Authentifizierung ein
5. Importiert deine Programme, Einsatzstellen und Nutzer
6. Zeigt dir die URLs und Admin-Zugangsdaten

---

## Nachträgliche Änderungen

### Neue Einsatzstelle hinzufügen

1. Zeile in `seeds/sites.csv` hinzufügen
2. Ausführen: `./install.sh --seed-only`

### Konfiguration ändern (Domain, E-Mail, etc.)

1. `config/tenant.env` bearbeiten
2. Ausführen: `./install.sh --reconfigure`

### Bestehende Daten prüfen ohne Änderung

```bash
python3 scripts/validate_seeds.py seeds/
```

---

## Häufige Fehler

**"slug is not URL-safe"**
→ Slugs dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.
→ Richtig: `umwelt-mx-2026` — Falsch: `Umwelt MX 2026`

**"program_slug not found in programs.csv"**
→ Der `program_slug` in sites.csv muss exakt einem `slug` in programs.csv entsprechen.

**"invalid language code"**
→ Format: `de-B2`, `en-C1`, `de-native` — nicht `Deutsch B2` oder `German`

**"Docker daemon not running"**
→ `sudo systemctl start docker`

---

## Support

Bei Fragen wende dich an deinen Ansprechpartner bei Freiwillig.

📧 support@freiwillig.app
📞 Nach Vereinbarung
