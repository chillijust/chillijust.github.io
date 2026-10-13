# Arbeitsanweisung

## Umgang mit mir

Antworte auf Deutsch, sprich mich mit „Sir" an, Sie-Form. Direkt und knapp, proaktiv
Vorschläge machen. Vor Force-Push, Löschen von Dateien und History-Rewrite meine
ausdrückliche Zustimmung einholen. Bei Zielkonflikten zwischen meinen Vorgaben: sag es
mir, statt still eine Seite zu wählen.

**Eine Sitzung trägt einen Vorgang.** Jeder Aufruf schickt die ganze Sitzung noch einmal
mit; ein abgeschlossener Vorgang im Kontext kostet weiter und trägt nichts bei. Ist ein
Ticketblock oder Abschnitt ausgeliefert und der Lauf grün, sage ich **«Sir, hier wäre ein
guter Schnitt»**. Ob `/clear` kommt, entscheiden Sie.

**Die Übergabe kommt immer kopierfertig** als Codeblock, genau fünf Zeilen, **nur die
Lage** — was das Projekt ist, steht hier und lädt ohnehin:

```
Chillinal, Branch main. Stand <sha>, Version <VERSION>.
Zuletzt: <was gerade fertig wurde, ein Satz>
Offen: <was als Nächstes ansteht — oder «nichts»>
Achtung: <nur was diese Lage betrifft — sonst Zeile weglassen>
Lies CLAUDE.md.
```

## Projekt

**Chillinal**, sichtbar **«Chilli Journal»** — Web-App zum An- und Abgewöhnen von
Gewohnheiten, mit Terminen, offline, Daten nur auf dem Gerät. Gehostet über GitHub Pages
unter https://chillijust.github.io/. **Einziges Zielgerät:** iPhone 15 Pro Max, iOS 26,
Safari als Home-Bildschirm-App im Vollbild, hoch und quer (ADR 0056).

- **Das Pflichtenheft ist `docs/chillinal-plan.md`.** Was dort steht, ist entschieden. Wer
  abweicht, sagt es und hält es in einem ADR fest.
- Start ist das **Dashboard**; alles Weitere öffnet der runde **Menüknopf**. Keine
  Reiterleiste als Navigation — nur die Einstellungen haben Reiter (ADR 0053). Maskottchen ist die Chili.
- Im Menü steht jeder Eintrag des Pflichtenhefts; Ungebautes trägt «bald». **Wer etwas
  baut, gibt dem Eintrag sein `ziel`** (Suite `menue`).
- Vorgänger **Chillingo** ruht auf `backup/chillingo-2.11.2T-2026-10-04` (ADR 0001); sein
  `localStorage` bleibt auf dem Gerät unberührt.

| Bauabschnitt | Stand |
| --- | --- |
| 1 · Umbau, Gerüst, Kopf, Farben, Schriften, Symbol, `sw.js` | fertig (0.1.0) |
| 2 · Gewohnheiten, Stärke, nie zweimal, Kalender, Nachtragen | fertig (0.2.0) |
| 3 · Abgewöhnen, 10-Minuten-Welle | fertig (0.4.0) |
| 4 · Termine, Tagesansicht, Tropfen | fertig (0.4.0) |
| 5 · Kalender-Export (`.ics`), Erinnerung, Name «Chilli Journal» | fertig (0.5.0) |
| 6 · Rückblick: Heatmap, Journal | fertig (0.7.1) |
| 7 · Sicherung, Einstellungen, Tickets | fertig (0.8.0) |
| 8 · Feinschliff, Nachbesserungen am Gerät, Timer und Zähler, Termine abhaken | fertig (0.13.1) |
| 9 · Flüssig wie iOS 26 je Stelle, Chilli als Standard (ADR 0053–0055) | im Bau (0.17.0T26) |

## Wo was steht

Diese Datei trägt nur, was **immer** gilt. Regeln nach Thema laden automatisch, sobald
eine passende Datei gelesen oder geändert wird:

| Datei | lädt bei | Inhalt |
| --- | --- | --- |
| `.claude/rules/oberflaeche.md` | `index.html` | Farben, Schrift, Aufbau, Bewegung, Chili |
| `.claude/rules/logik.md` | `index.html` | Stärke, Serie, Tage, Uhr, Termine, Export, Sicherung |
| `.claude/rules/auslieferung.md` | `sw.js`, `VERSION`, `tools/build.mjs` | Service Worker, Version, Eingebettetes |
| `.claude/rules/pruefstand.md` | `tools/pruefstand/**` | Fallen beim Schreiben einer Suite |
| `.claude/rules/docs.md` | `docs/**` | wann ein ADR, wie |

Nachschlagen **nur bei Bedarf**, nicht vorab:

- `docs/architektur.md` — Zustand (`state`), Render-Zyklus, Wegweiser zu den Funktionen
- `docs/deploy.md` — Pages, Cache, Versionswechsel
- `docs/decisions/README.md` — Index der ADRs; die Begründung jeder Regel steht im ADR
- `tools/pruefstand/README.md` — Aufbau des Prüfstands, Vorlage für eine Suite
- `docs/stil-vorlage.md` — der Stil zum Übertragen auf andere Apps
- Nachrichten zwischen Nutzer, Jarvis und James: Ordner `kommunikation/` **nur auf Branch
  `chatgpt/kommunikation`**, nie auf `main`, nie mit `main` zusammenführen; den App-Teil
  dort hält James aktuell (ADR 0050);
  lesen mit `git show origin/chatgpt/kommunikation:kommunikation/README.md`, wenn der
  Nutzer darauf verweist oder eine Nachricht beantwortet wird

Wer eine Regel ändert, ändert sie dort, wo sie steht — nicht zusätzlich hier.

## Harte Rahmenbedingungen — nicht verhandelbar

`pruefen.mjs` (vor jedem Push) erzwingt, was mit (P) markiert ist.

- **Zwei Dateien werden ausgeliefert, nicht mehr:** `index.html` (alles Inhaltliche) und
  `sw.js`. Kein React, kein Build-Schritt beim Ausliefern, kein npm, kein `manifest.json`.
- **Nichts von außen** (P): keine CDNs, Fonts, Bilder, API-Aufrufe, keine Fremdadresse.
  Schriften und Bilder als Daten-URI. Die CSP im `<head>` bleibt; einzige Ausnahme
  `worker-src 'self'`, **`connect-src` bleibt weg**.
- **Keine Emoji** (P) — iOS malt sie bunt. Symbole als Inline-SVG über `ICON`.
- **Nie ein Token, Passwort oder Schlüssel** in eine Datei (P) — sie sind öffentlich.
- **Speicher nur `localStorage`, Schlüssel `chillinal_v1`**, jeder Zugriff in `try/catch`.
  Chillingos Schlüssel kommt im Quelltext nicht vor, `localStorage.clear()` gibt es nicht (P).
- **Erinnerungen nur über den Kalender-Export** (`.ics`) — kein Server, kein Push.
- **Mobile-first**: Touch-Ziele ≥ 44 × 44 px, nichts hängt an Hover,
  `-webkit-tap-highlight-color: transparent`, `env(safe-area-inset-*)`,
  **Eingabefelder mit Schrift ≥ 16 px** (sonst zoomt iOS; Suite `zoom`).
- **Die App duzt** (Suite `geruest`). **Kein Name und kein Logo von Anthropic.**
- Die App funktioniert offline, nachdem sie einmal geladen wurde.
- `index.html` über 600 KB meldet der Push, über 800 KB hält er an (P, ADR 0046) — dann
  den Nutzer fragen, die Schwelle nie still anheben.

## Konventionen

- **Code-Stil in `index.html`** (ADR 0045): Was Safari auf iOS 26 kann, ist erlaubt
  (`let`/`const`, Pfeilfunktionen, Template-Strings, `?.`, `??`). Ein klassisches
  `<script>`, `'use strict'`, keine Module. **Auf oberster Ebene nur `var` und
  `function`** — der Prüfstand ersetzt dort Funktionen wie `jetzt`; ein `const` bräche
  ihn. Bestand nicht umschreiben; was man anfaßt, als ganze Funktion. Zwei Leerzeichen,
  einfache Anführungszeichen, Gliederung über Kommentarbalken.
- **Alle Ausgaben durch `esc()`**, auch im Template-String. Ereignisse nach dem Setzen von
  `innerHTML` anhängen, nie als `onclick`-Attribut.
- **Eingebettetes (Schriften, Chili, Symbol) und die Version setzt `tools/build.mjs`**, nie
  die Hand. Die Version steht nur in `VERSION`; `T` am Ende heißt «noch nicht abgenommen»
  (Einzelheiten: `.claude/rules/auslieferung.md`, Skill `ticket`).
- **Commits:** einer je logischer Änderung, Deutsch, Betreff im Imperativ, im Rumpf das
  *Warum*.
- **Branches:** Gearbeitet und gepusht wird **immer auf `main`**. Schreibt eine Umgebung
  einen anderen Arbeits-Branch vor: dort committen, per Fast-Forward auf `main` bringen,
  `main` pushen. Was auf einem anderen Branch landet, wird nach `main` nachgeholt. Neue
  Branches nur auf meine Ansage. **`backup/*` wird nie verändert.**
- **Namen:** Claude heißt hier **Jarvis**, ChatGPT heißt **James**.
- **Fremde Agenten** (James u. a., ADR 0047) arbeiten auf `chatgpt/*` und öffnen einen
  PR; ihre Anleitung ist `AGENTS.md`. Jarvis prüft den PR (Diff gegen das Regelwerk,
  `pruefen.mjs`, Prüfstand), stempelt die Version und bringt ihn erst dann nach `main`.
  Auf `chatgpt/kommunikation` committet auch Jarvis direkt, nur im Ordner `kommunikation/`.

## Prüfstand und Push

Die App wird am **echten DOM** geprüft: Ein kopfloser Browser lädt `index.html` mit
angehängtem Prüfskript.

```sh
node tools/pruefstand/lauf.mjs              # alle Suiten — grün schweigt, rot redet
node tools/pruefstand/lauf.mjs thema menue  # nur diese
node tools/pruefstand/bild.mjs              # Bildschirmfotos, hell und dunkel
node tools/pruefen.mjs                      # Vor-Push-Prüfung allein
```

- **Der Push ist abgesichert:** `.claude/hooks/vor-dem-push.mjs` fährt vor jedem `git push`
  `build.mjs --check`, `pruefen.mjs` und den Prüfstand und hält an, wenn etwas rot ist.
  Notausgang: `PRUEFSTAND=aus` vor den Befehl. GitHub prüft dasselbe noch einmal.
- **Wer `index.html` ändert, sichert es mit einer Prüfung ab** (Skill `pruefstand`).
- **Ein ganzer Vorgang** vom Befund bis zum Push: Skill `ticket`.
- **`index.html` nie in großen Blöcken lesen** (fast 500 KB): mit `grep -n` und engem
  Kontext suchen. Daten-URIs sind je eine sehr lange Zeile — `cut -c1-200` hält sie fern.

## Fallstricke

- **`.nojekyll` nie löschen**, kein YAML-Front-Matter in `index.html` — sonst schickt Pages
  alles durch Jekyll (P).
- **`<!DOCTYPE html>` in Zeile 1** — sonst rendert Safari im Quirks-Mode (P).
- **iOS-Quick-Look** zeigt HTML anders und speichert nichts. Getestet wird in Safari oder
  in der Home-Bildschirm-App.
- **`localStorage` wirft** im privaten Modus und bei vollem Kontingent; scheitert das
  Schreiben, sagt die App es, und ein Haken springt zurück. Ein unlesbarer Stand sperrt
  das Schreiben, bis der Nutzer neu anfängt (ADR 0049). Neue Felder: Vorgabe in `grundStand()`. Schemawechsel nur mit
  neuem Schlüssel und Migration.
- **Die Tagesgrenze ist lokale Mitternacht.** Eine offene App merkt den Wechsel erst beim
  Zeichnen — `visibilitychange` zeichnet neu.
- **Der Service Worker liefert aus dem Speicher**; der Cache heißt nach der Version.
  Bevor `sw.js` geändert wird: `.claude/rules/auslieferung.md`.

## Offen

- Flüssig (ADR 0054): Chilli ist Standard, iOS je Stelle mit Speichern; Timer wie Drang; auf iOS fließt jedes Teil selbst, ohne Chilli darunter; der Reiter sagt je Stelle, wie man testet; Kontrast in Dunkel (ADR 0055); Rückwege von Menü und Ansichten, Knauf beim echten Tipp (0.17.0T7); Auftropfen und Zeilen fließen, Wisch zurück von gerollter Seite (0.17.0T8); Kalenderring, Abhaken, Wahlschalter ohne Warten, Ticketblatt mit Glas erst am Ziel, Auftropfen als Kette (0.17.0T9). Abnahme am Gerät steht aus.
- Analyse von James (Nachrichten 01–03, 09–10 auf `chatgpt/kommunikation`). A2/A3 ausgeliefert in 0.13.2T
  (ADR 0049). N1–N8 aus 09 bestätigt, der Nutzer will alles, Block für Block: N1, N6 in 0.17.0T10, N3 in
  0.17.0T11, N4+N8 in 0.17.0T12, N5 in 0.17.0T13, N7 in 0.17.0T14 (ADR 0056), N2 in 0.17.0T15
  (ADR 0057). Abnahme am Gerät steht aus.
- James 12–14 (Gestaltung, Leistung, Rückwege): Plan in sieben Blöcken in Nachricht 15 auf
  `chatgpt/kommunikation`, dort auch die Entscheidungen des Nutzers. Block 1 (N9 und dasselbe
  Muster bei Sicherung und Export) in 0.17.0T16. Block 2: Prüfstand in 430 × 932 (ADR 0058).
  Block 3: «Ruckler messen» im Reiter Flüssig in 0.17.0T17 — der Nutzer nimmt damit den Vorher-Wert am
  iPhone. Block 4 (P1) in 0.17.0T18: Ticketblatt und Timer fließen schlicht, Glas am Ziel; Abnahme mit
  «Ruckler messen», 4 × auf und zu (vorher iOS 45/97, Chilli 18/18; nachher iOS 16/16). Auf Wunsch des
  Nutzers vor Block 5: Timer, dann Drang als Glasblatt wie der Timer. Welle als ein SVG ohne Filter in
  0.17.0T19 (vorher Timer iOS 44/51, Chilli 39/44; Drang iOS 50/131, Chilli 44/115; nachher Timer offen 6/13,
  4 × auf und zu iOS 27/33, Chilli 22/27, längster stets ~107 ms). Messwerte kopierbar (0.17.0T20), mit Spur je
  Ruckler (0.17.0T21). Befund der Spur: Der ~110-ms-Hänger kommt vom Rückwisch aus den Einstellungen
  («kein Skript» nach Ansicht/Tropfen zu), nicht vom Timer; Gegenprobe bestätigt (Chilli 39 ms, iOS 132 ms).
  Timer-Start frischt nur die Kachel auf statt render() (0.17.0T22; Timer 4 × auf und zu 16/16). Ansichten
  fließen auf iOS ohne Lichtkante (0.17.0T23, am Gerät «viel geschmeidiger»). Drang als Blatt aus Glas wie
  der Timer (0.17.0T24, ADR 0059) — Abnahme am Gerät steht aus. Später: Jedes Auflegen des Fingers kostet
  ein Bild (30–39 ms, kein Skript), vermutlich die Druckrückmeldung. Drangblatt am Gerät: auf und zu je ein
  Bild, längster 53 ms; das Ende nach zehn Minuten ist noch ungetestet. Block 5 (P2) in 0.17.0T25:
  `auswerten` merkt sich je Gewohnheit, ein Haken rechnet einmal statt 122-mal (40 Gewohnheiten, drei
  Jahre). Auftropfen beim Start auf iOS: kurzer Hals aus einer Perle, ohne Lichtkante, alle Teile in
  einem Bild (0.17.0T26) — Abnahme am Gerät steht aus. Als Nächstes Block 6. Für Block 7 dazu: «10 von 12» bricht im Tagesring um —
  Varianten als Bildvergleich (Zahl kleiner, Umschalter in die Kalenderzeile, so lassen).
