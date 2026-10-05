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
- **Die Abgewöhnen-Kachel** hat nichts abzuhaken: Antippen oder lange drücken öffnet sie;
  *Drang* und *Rückfall* sind eigene Knöpfe darunter (ADR 0004).
- **Ein Termin ist eine Zeile mit blauem Strich** (`zeichneTerminZeile`), auf dem
  Dashboard wie in der Tagesliste; im Kalender trägt sein Tag **einen** blauen Punkt, vorn
  (ADR 0006). Die Tagesansicht ist die Liste unter dem Kalender, keine eigene Ansicht.
- **Was live läuft, schreibt `takt()` an Ort und Stelle** (`[data-frei]`,
  `[data-wellerest]`, der Ring der Welle) — kein `render()` im Sekundentakt.
- **Eine neue Ansicht** ist ein Eintrag in `ANSICHTEN` (`titel`, `zeichnen`), ihre Ereignisse
  hängen in `bindeAnsicht()` — nie als Attribut.

## Chili

- `#chiliFigur` steht **genau einmal** im Dokument. Das Bild ist `CHILI_BILD`, eingebettet
  von `build.mjs` — nie eine zweite Kopie als Daten-URI von Hand.
- **Ein gesetzter Haken läßt sie einmal aufflammen** (`chiliFlammt`, Klasse `flammt`) —
  auf der Kachel wie beim Nachtragen; Zurücknehmen ist kein Jubel. Macht der Haken den Tag
  voll, **lodert** sie statt dessen (`lodert`). Danach wippt sie weiter.

## Bewegung

- **Nichts ploppt** (ADR 0007). Was aufgeht, wächst aus dem Getippten, was geht, fließt
  zurück — gezeichnet wird trotzdem sofort, die Bewegung legt sich darüber. Was
  verschwindet, zeigt `geist(el)`; nie den Zustand verzögern, um zu animieren.
- **Formularteile über `teilZeigen(el, an)`**, nie `el.hidden = …`; eine neue `.wahl`
  bekommt ihre Marke von `wahlenSetzen()`, nach Änderung an Ort und Stelle aufrufen.
- **Bewegt wird über `bewegt()` mit der `FEDER`**; CSS nimmt `var(--feder, ease)`. Ausnahme: Tropfen
  schwingen nicht über (ADR 0008).
- **Was aus einem runden Knopf kommt oder in ihn geht, ist ein Tropfen** (`tropfenAuf`,
  `tropfenZu`, `tropfenQuelle`) — Bauch voran, Spitze hinten. Kacheln und Zeilen zoomen.
- **Das Menü klappt unter seinem Knopf auf** (`menueOeffnen`, `blattLegen`), nie als Blatt
  von unten.
- Animation nur, wo sie Rückmeldung gibt (Abhaken, Ring, Schalter, Blatt). Unter
  `prefers-reduced-motion: reduce` steht alles still; Abläufe, die auf das Ende einer
  Animation warten, fragen `bewegungAus()`.

## Speicher

- Alles im Zustand `state`, gespeichert über `speichern()` unter `chillinal_v1`. Neue
  Felder: Vorgabe in `grundStand()`, Prüfung in `stand()`.
