# 0040 · In «Dark» liegt die Kachel unter dem Grund

**Stand:** **abgelöst** durch [ADR 0041](0041-die-dunkle-palette-neu.md) · 2026-08-08

> Die hier beschriebene Umkehrung stand nur wenige Minuten und gefiel am Gerät nicht.
> Die Kachel liegt wieder über dem Grund; `--kopf` gibt es nicht mehr. Der Eintrag bleibt
> stehen, weil er festhält, was probiert wurde und warum es nicht trug.

## Ausgangslage

«Dark» war seit jeher nach demselben Muster gebaut wie die hellen Schemata: der Grund am
tiefsten (`#101418`), die Kachel darüber (`#171C23`), der Kopf auf dem Grund. Gewünscht
wurde die umgekehrte Staffelung — **der tiefere Ton für Kacheln und Kopfzeile, der hellere
als Hintergrund**.

## Entscheidung

In «Dark» kehrt sich die Reihenfolge um:

| | vorher | jetzt |
| --- | --- | --- |
| Grund `--bg` | `#101418` | `#212429` |
| Kachel `--card` | `#171C23` | `#15171B` |
| Kopf `--kopf` | (= `--bg`) | `#15171B` |
| Schein `--glow` | `#1C242F` | `#15171B` |

Die hellen Schemata bleiben unberührt: Dort liegt die Kachel über dem Grund, und der Kopf
nimmt die Fläche, auf der er steht.

**Der Kopf bekommt eine eigene Variable `--kopf`.** In «Dark» ist sie der Kachelton, in
den hellen Schemata `var(--bg)`. Ohne sie hieße die Regel „`--card`, außer in den hellen
Schemata" — eine Ausnahme im Stylesheet statt einer Angabe.

**Der radiale Schein hinter dem Kopf trägt denselben Ton wie der Kopf.** Auf Home ist die
Kopfzeile bewusst durchsichtig (sonst stünde über «Chillingo.» eine harte Kante); der
Schein färbt den Bereich stattdessen. Dass er in «Dark» nun nach unten statt nach oben
zieht, ist genau die gewünschte Wirkung.

**`meta[name=theme-color]` nennt den Kopfton, nicht den Grund.** Die Statusleiste sitzt
unmittelbar über der Kopfzeile — mit dem Grund stünde in «Dark» ein hellerer Streifen
darüber. `SCHEMATA[].grund` führt darum ab hier den Wert von `--kopf`; in den hellen
Schemata ändert das nichts, weil dort beides dasselbe ist.

## Begründung

Auf einem OLED-Bildschirm ist das die natürliche Richtung. Was nah ist, sinkt in die
Tiefe, statt zu leuchten: Eine Kachel, die dunkler ist als ihr Grund, wirkt eingelassen,
und der Blick bleibt an der Schrift hängen statt an der Fläche. Im Hellen ist es
umgekehrt — dort ist die Kachel das Papier und der Grund der Tisch.

**Die Staffelung bleibt messbar.** Kachel gegen Grund liegt bei 1,15 : 1 — derselbe
Abstand wie in den hellen Schemata (1,15–1,23), nur in die andere Richtung. Der Text steht
mit 12,3 : 1 auf dem Grund und 14,0 : 1 auf der Kachel; `--dim` mit 5,0 beziehungsweise
5,7. Alles über AA.

**`--card-2` bleibt heller als beides** (`#292D33`). Es trägt Bedienelemente — Chips,
Schalter, Tasten —, und die sollen aufliegen, egal ob sie auf einer Kachel oder auf dem
Grund stehen. Die Reihenfolge kehrt sich also nicht durchgehend um; nur die beiden großen
Flächen tauschen die Plätze.

## Folgen

- Die Prüfung «die Kachel hebt sich vom Grund ab» misst ab jetzt alle fünf Schemata, nicht
  nur die hellen — der Betrag zählt, nicht das Vorzeichen.
- Zwei neue Prüfungen halten die Richtung fest: In «Dark» muss die Kachel tiefer liegen
  als der Grund und der Kopf den Kachelton tragen, in den hellen umgekehrt. Ohne sie
  könnte eine spätere Palettenänderung die Absicht stillschweigend zurückdrehen.
- Wer die dunkle Palette ändert, ändert **drei** Stellen: `:root` im Stylesheet,
  `SCHEMATA` im Skript (für die Statusleiste) und das `theme-color`-Meta im `<head>`, das
  vor dem ersten Skriptlauf gilt.
