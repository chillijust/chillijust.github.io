# 0042 · Aufklappende Blätter tragen den Grund, die helle Leiter steht tiefer

**Stand:** angenommen · 2026-08-09 · ergänzt [ADR 0039](0039-ein-farbschema-statt-zweier-achsen.md) und [ADR 0041](0041-die-dunkle-palette-neu.md)

## Ausgangslage

Zwei Beobachtungen vom Gerät, beide über Flächen:

1. **Menü und Auswahl hoben sich nicht ab.** Beide Blätter trugen `--card` — in «Dark»
   seit ADR 0041 derselbe Ton wie die Kacheln darunter. Ein Blatt, das über der Seite
   liegt, sah aus wie eine weitere Kachel und trennte sich nur durch seinen Schatten.
2. **Die hellen Schemata waren grell.** Nicht nur die Farbe: Auch das Weiß der Kachel
   zieht die Gesamthelligkeit mit hoch.

## Entscheidung

**Ein Blatt trägt `--blatt`** — in «Dark» der Grund (`var(--bg)`), in den hellen Schemata
die Kachel (`var(--card)`). Es liegt damit immer auf der *anderen* der beiden großen
Flächen als der Inhalt darunter.

**Die gemeinsame Helligkeitsleiter der hellen Schemata sinkt um dreieinhalb Punkte:**

| | vorher | jetzt |
| --- | --- | --- |
| Grund | L 91,0 | L 87,5 |
| Kachel | L 98,6 | L 95,2 |
| Bedienfläche | L 86,0 | L 82,5 |
| Linie | L 78,0 | L 74,5 |

Alle vier hellen Schemata gehen mit, «Classic» eingeschlossen — die gemeinsame Leiter ist
die Regel aus ADR 0039 und der Grund, warum die Schemata vergleichbar bleiben.

**Schrift und Signalfarben der hellen Schemata rücken mit nach unten:**
`--dim` `#6E7683` → `#4C525C`, `--gold` `#A87B2A` → `#87621D`, `--good` `#2E7D5B` →
`#2B7654`.

## Begründung

**Warum eine Variable und nicht einfach `--bg`:** In den hellen Schemata wäre ein Blatt
in Grundfarbe ein grauer Kasten über weißen Kacheln — dort ist die Kachel das Papier. Das
ist kein Sonderfall im Stylesheet, sondern eine Angabe mit eigener Bedeutung: die Fläche
eines Blattes. (Anders als das kurzlebige `--kopf` aus ADR 0040, das überall dasselbe
meinte.)

**Warum die Schrift mitmusste.** Ein dunklerer Grund heißt weniger Kontrast für alles, was
darauf steht. Mit den alten Werten wäre `--dim` auf einem rosa Chip bei 2,8 : 1 gelandet —
unter jeder Grenze, auch unter der für große Schrift. Gemessen an allen vier Paletten
steht jetzt **jede** Farbe besser da als vor dem Abdunkeln:

| | vorher (schlechteste) | jetzt |
| --- | --- | --- |
| `--dim` | 3,11 | **4,78** |
| `--gold` | 2,58 | **3,36** |
| `--good` | 4,81 | 4,88 |
| `--bad` | 5,27 | 4,87 |
| Lesetext | 11,72 | 10,60 |

Damit fällt nebenbei ein Altbestand: Gold auf der Kachel lag seit jeher bei 3,8 : 1 und
steht nun bei 4,9 — über AA. Es war zweimal gemeldet und zweimal als «nicht Gegenstand
dieses Tickets» beiseitegelegt; hier musste es ohnehin angefasst werden.

## Folgen

- `tools/palette.py` führt die neue Leiter. Wer sie erneut verschiebt, prüft die
  Signalfarben mit — sie hängen daran.
- Die Kontrastprüfung misst nicht mehr **gegen «classic»**, sondern gegen feste Grenzen:
  Der Maßstab ist selbst mitgewandert. Zwei Prüfungen kamen dazu — Kleines auf der
  Bedienfläche bleibt über 3, und `--dim` hält auf jeder Fläche AA.
- Die dunkle Palette bleibt unverändert; dort war nichts grell.
