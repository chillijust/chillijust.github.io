# 0041 · Die dunkle Palette neu: fast schwarzer Grund, deutlich abgesetzte Kachel

**Stand:** angenommen · 2026-08-08 · **ersetzt** [ADR 0040](0040-in-dark-liegt-die-kachel-unter-dem-grund.md)

## Ausgangslage

«Dark» stammte noch aus der ersten Fassung der App: Grund `#101418`, Kachel `#171C23` —
ein Abstand von 1,08 : 1, praktisch unsichtbar, und ein deutlicher Blaustich. Dieselbe
Schwäche, die ADR 0039 für die hellen Schemata behoben hat, stand hier unverändert.

ADR 0040 hatte daraus den Schluss gezogen, die Schichtung umzudrehen: Kachel und Kopfzeile
tiefer als der Grund. Am Gerät gefiel das nicht. Dann lag ein Bild als Vorlage vor: fast
schwarzer Grund, darauf klar abgesetzte, warmgraue Kacheln mit weichen Ecken; die
Kopfzeile in der Farbe des Grundes. Nicht die Richtung war falsch gewesen, sondern der
Abstand — und die Farbtemperatur.

## Entscheidung

| | vorher | jetzt |
| --- | --- | --- |
| Grund `--bg` | `#101418` | `#1A1A18` |
| Kachel `--card` | `#171C23` | `#2A2926` |
| Bedienfläche `--card-2` | `#1D232C` | `#31302C` |
| Linie `--line` | `#262E39` | `#3B3934` |
| Schein `--glow` | `#1C242F` | `#1F1E1B` |
| Sekundärschrift `--dim` | `#8B93A1` | `#939AA7` |

Die Werte in der Spalte «vorher» sind die aus der Zeit vor ADR 0040; dessen umgekehrte
Staffelung stand nur wenige Minuten und wird hier vollständig zurückgenommen.

**Der Ton ist warmneutral statt blau.** Schrift (`#E7E4DD`) und Gold sind warm; ein blauer
Grund arbeitete gegen sie.

**Die Kachel liegt über dem Grund** — wie in den hellen Schemata, nur mit einem deutlichen
Schritt: 1,21 : 1 statt 1,08. Das ist etwas mehr als in den hellen Schemata (1,15–1,23
liegt darüber), weil auf einem beinahe schwarzen Grund derselbe Zahlenwert weniger hergibt.

**Die Kopfzeile nimmt den Grund**, sichtbar dunkel gegen die Kacheln. Sie braucht keine
eigene Farbe.

**`--dim` steigt um eine Stufe.** Die Kachel ist mitgestiegen; das alte `#8B93A1` stünde
auf ihr mit 4,7 : 1 und auf den Chips darüber nur noch mit 4,3 — unter AA für kleine
Schrift. Der neue Wert hält 5,1 auf der Kachel und 4,7 auf `--card-2`.

## Begründung

Die Kachel ist in dieser App das tragende Element — jede Aufgabe, jede Übersicht sitzt auf
einer. Ist sie vom Grund nicht zu unterscheiden, gibt es faktisch keine Kacheln, nur Text
im Raum. Das war der Zustand, und in den hellen Schemata ist er bereits behoben.

**`--card-2` bleibt die Bedienfläche** — Chips, Schalter, Tastenkappen. In «Dark» rückt es
von der Kachel nach oben, in den hellen nach unten; verlangt ist nur, dass es überhaupt
abrückt. Eine für alle Schemata gleiche Richtung gäbe es nur um den Preis, dass es in
einem von beiden mit dem Grund verschmölze.

## Folgen

- Die Prüfung «die Kachel hebt sich vom Grund ab» misst alle fünf Schemata, nicht nur die
  hellen. Zwei weitere halten die Schichtung fest: Kachel über Grund in jedem Schema,
  `--card-2` in jedem Schema von der Kachel unterscheidbar.
- Wer die dunkle Palette ändert, ändert **drei** Stellen: `:root` im Stylesheet, `SCHEMATA`
  im Skript (für die Statusleiste) und das `theme-color`-Meta im `<head>`, das vor dem
  ersten Skriptlauf gilt.
- Die in ADR 0040 eingeführte Variable `--kopf` entfällt wieder: Die Kopfzeile trägt in
  jedem Schema den Grund, und eine Variable, die überall dasselbe bedeutet, ist keine.
- **Was hier zu lernen war:** Dass die Kachel unsichtbar war, hieß nicht, dass die
  Schichtung falsch herum stand. Der naheliegende große Umbau war die falsche Antwort auf
  eine Beobachtung, die einen kleinen verlangte.
