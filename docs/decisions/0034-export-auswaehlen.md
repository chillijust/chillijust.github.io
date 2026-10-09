# 0034 · Im Export wählen, was hinausgeht

*2026-10-06 · Ticket «Export Auswählen» · Version 0.11.0T · ergänzt 0011, 0032*

## Ausgangslage

Hinaus ging alles Neue, immer; Exportiertes ließ sich unter «Bearbeiten» noch einmal
dazuholen (ADR 0011). Wer einen Termin oder eine Gewohnheit nicht im Kalender haben
wollte, konnte das nicht sagen. «Bearbeiten» gab es erst, wenn schon etwas exportiert war.

## Entscheidung

- **«Bearbeiten» gibt es immer**, sobald es etwas zu exportieren gibt. Darin trägt **jeder
  Eintrag ein Häkchen** — auch Neues — und **jeder Abschnitt** (Termine, Gewohnheiten)
  einen **Schalter «alle»**.
- **Neues abwählen wird gemerkt** (`state.exportOhne`, `'t:id'`/`'g:id'` → `true`): Es
  bleibt draußen, über Neuladen und Export hinweg, bis man es wieder wählt. Außerhalb von
  «Bearbeiten» ist es abgedunkelt und trägt «neu, bleibt draußen»; die Leiste zählt es.
- **Dagewesenes dazuholen bleibt, wie es war** (`exportWahl`, bis zum Export).
- **«alle»** ist an, solange etwas aus dem Abschnitt mitgeht. Aus: alles heraus. An:
  alles Neue mit — gibt es nichts Neues, alles noch einmal.
- **Häkchen und Schalter tropfen als Perlen aus «Bearbeiten»** (`perlenAus`) und mit
  «Fertig» als Geister zurück hinein (`perlenZu`) — Ticket «Hinzufügen tropfen», ADR 0032.

## Begründung

Ein Schalter je Abschnitt ohne Häkchen reicht nicht, wenn ein einzelner Termin privat
bleiben soll; Häkchen ohne Schalter machen das Abwählen ganzer Abschnitte mühsam.
Gemerkt wird nur die Abwahl von Neuem — sie ist eine Absicht. Das Dazuholen von
Dagewesenem ist ein einmaliger Auftrag und vergeht mit dem Export, wie bisher.

## Folgen

- Suite `exportwahl` (A, K, E, S, T); `exportmarken` A2 und `exportwege` A7 auf «Bearbeiten
  immer» umgestellt.
- `stand()` behält eine Abwahl nur für Einträge, die es gibt.
