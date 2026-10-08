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
Safari als Home-Bildschirm-App im Vollbild.

- **Das Pflichtenheft ist `docs/chillinal-plan.md`.** Was dort steht, ist entschieden. Wer
  abweicht, sagt es und hält es in einem ADR fest.
- Start ist das **Dashboard**; alles Weitere öffnet der runde **Menüknopf**. Keine
  Reiterleiste. Maskottchen ist die Chili.
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
- **Fremde Agenten** (ChatGPT u. a., ADR 0047) arbeiten auf `chatgpt/*` und öffnen einen
  PR; ihre Anleitung ist `AGENTS.md`. Claude prüft den PR (Diff gegen das Regelwerk,
  `pruefen.mjs`, Prüfstand), stempelt die Version und bringt ihn erst dann nach `main`.

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
  Schreiben, sagt die App es. Neue Felder: Vorgabe in `grundStand()`. Schemawechsel nur mit
  neuem Schlüssel und Migration.
- **Die Tagesgrenze ist lokale Mitternacht.** Eine offene App merkt den Wechsel erst beim
  Zeichnen — `visibilitychange` zeichnet neu.
- **Der Service Worker liefert aus dem Speicher**; der Cache heißt nach der Version.
  Bevor `sw.js` geändert wird: `.claude/rules/auslieferung.md`.

## Offen

- nichts
