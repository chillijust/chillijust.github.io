# 0076 · Das Menü ist so breit wie sein längster Eintrag

**Stand:** angenommen · 2026-08-15 · aus einem Ticket
**Ergänzt:** ADR 0019 (Menü als Ebene darüber) · ADR 0072 (die Reihenfolge im Menü)

## Ausgangslage

> «Menüleiste ist breiter geworden. Mir gefiel die alte Breite mehr.»

## Was die Messung ergab

**Sie ist nicht breiter geworden.** Beide Fassungen — die vor dem Ticket und
die, über die es geschrieben wurde — nebeneinander im selben Browser, bei
derselben Gerätebreite gemessen:

| | Karte | Panel | linke Kante |
| --- | --- | --- | --- |
| 2.4.12T | 232,0 × 212,0 | 232 px | 182,0 |
| 2.4.16T | 232,0 × 212,0 | 232 px | 182,0 |

Auf den Zehntelpixel gleich. `.menupanel { width: 232px }` steht seit ADR 0019
unverändert in der Datei; ein Blick in die Fassungen 2.4.3 bis 2.4.17 zeigt
denselben Wert in jeder einzelnen.

**Geändert hat sich die Reihenfolge** (ADR 0072): «Einstellungen» — der längste
der vier Einträge — steht seither in der **ersten** Zeile. Das Auge nimmt die
oberste Zeile als Maß der Karte. Vorher stand dort «Bilanz» und ließ viel Luft;
seither läuft die erste Zeile fast bis an den Rand, und die Karte *liest* sich
breiter, obwohl kein Pixel anders liegt.

## Der Befund war trotzdem berechtigt

Die zweite Messung sagt, warum: Der breiteste Eintrag endet **143 px** vom
linken Kartenrand. Die Karte ist 232 px breit. Es standen also **89 Pixel
leer** — mehr als ein Drittel.

Die feste Zahl stammt aus einer Zeit mit anderen Wörtern und ist seither nie
nachgerechnet worden. Sie war die ganze Zeit zu breit; aufgefallen ist es erst,
als die Umsortierung den Blick darauf lenkte.

## Entscheidung

```css
#menuPanel { width: max-content; min-width: 176px; }
```

Die Karte misst ihren Inhalt. Ergebnis auf dem Zielgerät: **176 px** statt 232 —
gut 30 Pixel Luft hinter dem längsten Wort, und die Seite darunter bleibt zu
zwei Dritteln sichtbar.

**`max-content` statt einer neuen festen Zahl.** Eine feste Zahl wäre genau der
Fehler noch einmal: Sie stimmt heute und ist in einem Jahr wieder falsch. Ein
Eintrag, der später dazukommt, dehnt die Karte jetzt, statt abgeschnitten zu
werden. Die Untergrenze verhindert nur, dass eine Karte aus lauter kurzen
Wörtern zum Streifen zusammenfällt.

**Nur `#menuPanel`.** Die Auswahl- und Wissensblätter teilen sich die Klasse,
tragen aber Chip-Reihen — die sollen umbrechen, nicht die Karte dehnen. Sie
behalten ihre 232 px.

## Folgen

- `maskottchen` bekommt `K9c` (die Luft hinter dem längsten Eintrag liegt
  zwischen 12 und 48 px — sie darf weder davonlaufen noch verschwinden) und
  `K9d` (ein längerer Eintrag dehnt die Karte, statt zu klemmen).
- **Eine Prüfung auf «schmaler als 80 % des Kopfes» war die ganze Zeit grün.**
  Sie hätte auch bei 300 px gehalten. Eine Grenze, die alles durchlässt, ist
  keine — gemessen gehört das Verhältnis von Inhalt zu Kasten, nicht das von
  Kasten zu Bildschirm.

## Regel

**Eine feste Breite ist eine Behauptung über Inhalt, der sich ändert.** Wo der
Inhalt sie bestimmen kann, soll er es.
