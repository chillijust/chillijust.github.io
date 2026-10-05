---
paths:
  - "index.html"
---

# Oberfläche · Chillinal

Gilt für `index.html`. Begründungen in ADR 0001 und im Pflichtenheft `docs/chillinal-plan.md`.

## Farben und Darstellung

- **Farben nur über Tokens** (`--grund`, `--text`, `--text-2`, `--flaeche`, `--flaeche-2`,
  `--linie`, `--akzent`, `--erledigt`, `--termin`, `--knopf`, `--knopf-text`). Keine Hexzahl
  außerhalb der drei Paletten-Blöcke und `GRUND` im Skript.
- **Die dunkle Palette steht zweimal gleich**: unter `prefers-color-scheme: dark` für
  `:root:not([data-thema="hell"])` und unter `:root[data-thema="dunkel"]`. Wer einen Wert
  ändert, ändert beide — die Suite `thema` vergleicht sie. Den Grund zusätzlich in `GRUND`
  (für `theme-color`).
- **Ohne Wahl entscheidet das Stylesheet**, nicht das Skript — `themaAnwenden()` setzt nur
  das Attribut und `theme-color`. Der Sonne/Mond-Schalter legt fest; zurück zu
  «Automatisch» nur über die Einstellungen.
- **Akzent (Chili, `#D97757`) ist kein Schriftgrund** — weiße Schrift darauf hat 3,1 : 1.
  Hauptknöpfe nehmen `--knopf`. Der Akzent gehört Symbolen, Fokus, Ring und Jubel.
- **Grün heißt erledigt, Blau heißt Termin** — die beiden Signalfarben tragen keine
  andere Bedeutung.

## Schrift

- **Lora** für Fließtext (400, 400 kursiv, 600), **Poppins** für Überschriften, Knöpfe und
  Etiketten (500, 600). Andere Schnitte gibt es nicht; wer einen braucht, nimmt ihn in
  `SCHRIFTEN` in `tools/build.mjs` auf und legt die woff2 nach `tools/schriften/`.
- Ziffern, die sich live ändern (Uhr, «frei seit»), bekommen `font-variant-numeric:
  tabular-nums`, damit nichts springt.

## Kopf, Menü, Ansichten

- **Der Kopf hat zwei Gestalten**: Dashboard (Titel, Datum, Sonne/Mond, Menüknopf) und
  unterwegs (Rückweg, Titel). Keine Reiterleiste.
- **Runde Knöpfe** (`.rund`) sind 44 × 44 und tragen ein Symbol aus `ICON` mit `aria-label`.
- **Der Sonne/Mond-Schalter ist ein Schieber** (`.thema-schalter`, `role="switch"`,
  `aria-checked` = dunkel): Sonne links, Mond rechts, beide immer sichtbar, der Knauf liegt
  unter dem, was gilt. Er fährt erst hinüber, dann zeichnet der Kopf neu.
- **Das Menü** folgt dem Pflichtenheft in Reihenfolge und Wortlaut. Ein Eintrag ohne `ziel`
  trägt «bald»; wer ihn baut, setzt `ziel` und trägt die Ansicht in `ANSICHTEN` ein.
- **Die Kachel kennt zwei Gesten**: kurz tippen hakt ab, lange drücken (`langDruecken`)
  öffnet die Gewohnheit. Ein zweites Ziel auf der Kachel gibt es nicht (ADR 0003).
- **Eine neue Ansicht** ist ein Eintrag in `ANSICHTEN` (`titel`, `zeichnen`), ihre Ereignisse
  hängen in `bindeAnsicht()` — nie als Attribut.

## Chili

- `#chiliFigur` steht **genau einmal** im Dokument. Das Bild ist `CHILI_BILD`, eingebettet
  von `build.mjs` — nie eine zweite Kopie als Daten-URI von Hand.
- **Ein gesetzter Haken läßt sie einmal aufflammen** (`chiliFlammt`, Klasse `flammt`) —
  auf der Kachel wie beim Nachtragen; Zurücknehmen ist kein Jubel. Danach wippt sie weiter.

## Bewegung

- Animation nur, wo sie Rückmeldung gibt (Abhaken, Ring, Schalter, Blatt). Unter
  `prefers-reduced-motion: reduce` steht alles still; Abläufe, die auf das Ende einer
  Animation warten, fragen `bewegungAus()`.

## Speicher

- Alles im Zustand `state`, gespeichert über `speichern()` unter `chillinal_v1`. Neue
  Felder: Vorgabe in `grundStand()`, Prüfung in `stand()`.
