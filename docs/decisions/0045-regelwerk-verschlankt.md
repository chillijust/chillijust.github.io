# 0045 · Das Regelwerk wird schlanker: ADRs nur für Entscheidungen, modernes JavaScript erlaubt

*2026-10-08 · nach 0.13.1 · ohne neue Fassung*

## Ausgangslage

Die Regeln entstanden im Chat und wuchsen mit jeder Nachbesserung. Bis 0.13.1 kamen in
vier Tagen 44 ADRs zusammen, viele davon für eine einzelne Bewegung oder einen Knopf
(«Hinzufügen» ohne «Abbrechen», 0044). Jeder zog einen Satz in `.claude/rules/oberflaeche.md`
nach sich; die Datei hatte 201 Zeilen und lädt bei **jeder** Änderung an `index.html` mit.
Die Tabelle der Bauabschnitte in `CLAUDE.md` war zum Änderungsprotokoll geworden. Beides
kostet in jeder Sitzung Kontext, ohne beim Ändern zu helfen.

Der Code-Stil war «ES5-nah» — `var`, klassische Funktionen, kein `let`/`const`, keine
Pfeilfunktionen, keine Template-Strings. Er kam unbegründet von Chillingo herüber. Gebraucht
wird die App aber nur an einem Ort: Safari auf iOS 26, als Home-Bildschirm-App, offline.
Dort läuft modernes JavaScript seit Jahren; `var` in Schleifen und Rückrufen ist eine
bekannte Fehlerquelle.

## Entscheidung

**1 · Ein ADR nur für eine Entscheidung**, die man später nachschlagen muß: Datenmodell und
Speicher, Rechnung, eine neue Grundmechanik, eine Abweichung vom Pflichtenheft, eine
Änderung am Regelwerk. Feinschliff — Dauer, Kurve, Abstand, Wortlaut, ein Knopf mehr oder
weniger, die Nachbesserung einer angesagten Fassung — bekommt keinen: Das *Warum* steht im
Commit-Rumpf, das Verhalten hält die Suite fest. Die Regel steht in `.claude/rules/docs.md`.

**2 · `oberflaeche.md` trägt nur, was beim Ändern gilt**: Tokens, Mechaniken und die
Funktion, über die etwas geht («über `teilZeigen`, nie `el.hidden`»), dazu die Fallen, die
schon einmal zugeschnappt sind. Wie eine Ansicht im Einzelnen aussieht, steht im ADR und
in der Suite, nicht mehr dort.

**3 · Die Tabelle der Bauabschnitte** in `CLAUDE.md` trägt je Abschnitt eine Zeile Stand.
Was je Fassung dazukam, steht in `git log` und im ADR-Index.

**4 · Modernes JavaScript ist erlaubt**, soweit Safari auf iOS 26 es kann: `let`/`const`,
Pfeilfunktionen, Template-Strings, `?.`, `??`, Spread. Es bleibt bei **einem** klassischen
`<script>` mit `'use strict'` — keine Module, kein Build. **Auf oberster Ebene bleibt es
bei `var` und `function`**: Der Prüfstand ersetzt dort Funktionen (`jetzt` in 22 Suiten,
`kopieren`, `bewegungAus`, `gong`, `swNeustart`); ein `const` ließe ihn mit TypeError
abbrechen. Bestehender Code wird nicht umgeschrieben — modernisiert wird, was man ohnehin
anfaßt, eine Funktion dann ganz. Ausgaben gehen weiter durch `esc()`, auch im
Template-String.

## Begründung

Ein ADR, den niemand nachschlägt, kostet zweimal: beim Schreiben und als Satz in einer
Regeldatei, die jede Sitzung lädt. Die Suiten (1 251 Prüfungen) sind das Gedächtnis für
Verhalten; dafür braucht es keinen zweiten Text.

Den Stil auf das Zielgerät zu beziehen statt auf eine Gewohnheit, macht neuen Code kürzer
und schließt eine Fehlerklasse (`var` im Rückruf) aus. Ein Umschreiben des Bestands brächte
nichts als Risiko.

## Folgen

- Die ADRs 0001–0044 bleiben, wie sie sind; was aus `oberflaeche.md` herausfiel, steht dort.
- Das Pflichtenheft sagt weiter «ES5-nah» — es bleibt, wie es beschlossen wurde; diese
  Abweichung steht hier.
- `pruefen.mjs` prüft die Syntax mit `new Function` und kennt modernes JavaScript; geändert
  werden muß nichts.
- Der Skill `ticket` schreibt einen ADR nur noch, wenn Punkt 1 es verlangt.
