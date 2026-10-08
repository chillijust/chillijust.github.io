# 0039 · Ein Farbschema statt zweier Achsen

**Stand:** angenommen · 2026-08-08 · **ersetzt** [ADR 0038](0038-farbton-als-zweite-achse.md)

## Ausgangslage

ADR 0038 hatte den Farbton als zweite, unabhängige Achse neben hell und dunkel eingeführt:
vier Töne mal drei Darstellungen. Am Gerät zeigte sich dreierlei:

- **Die Töne waren zu blass.** Aus der Sorge, die Palette zu verbiegen, trugen die Flächen
  nur einen Hauch Farbe. Der Wunsch lautete ausdrücklich: „dürfen ruhig etwas mehr Farbe
  bekommen."
- **Die Kachel stand nicht vom Grund ab.** Gemessen 1,09 : 1 — sichtbar nur, wenn man
  weiß, dass da eine Kante ist.
- **Acht Paletten sind zu viele für eine Wahl.** Wer Grün wählt, will nicht zugleich
  entscheiden, ob es Tag oder Nacht ist — genau *deshalb* stand die zweite Achse da. In
  der Hand kehrt sich das Argument um: Es sind zwei Fragen, wo der Nutzer eine Erscheinung
  wählen will.

## Entscheidung

**Eine Liste, fünf Einträge:** Dark (Vorgabe), Classic, Grün, Blau, Rosa. Ein Attribut
`data-schema` am `<html>`-Element; „Dark" trägt keines, seine Palette steht im `:root`.

**Die drei Farben gibt es nur hell.** Sie sind Creme- und Pastelltöne — das war der Wunsch
und ist ihr Wesen. Eine dunkle Fassung von Rosa wäre etwas anderes, nicht dasselbe in
dunkel.

**`prefers-color-scheme` wird nicht mehr ausgewertet.** Es gibt kein „System" mehr.

**Die Kachel steht deutlich, aber weich vom Grund ab:** Grund L 91, Kachel L 98,6 —
gemessen mindestens 1,15 : 1 statt 1,09.

**Getönt werden weiterhin nur die Flächen** (`--bg`, `--card`, `--card-2`, `--line`,
`--glow`); Schrift, Gold und die Signalfarben stehen einmal für alle hellen Schemata.

## Begründung

Eine Liste ist ehrlicher als das, was hier zu wählen war. Die zweite Achse hätte sich
gelohnt, wenn es jeden Ton wirklich in zwei Fassungen gäbe. Da die Farben Cremetöne sind,
gab es sie nur hell — die dunklen Varianten waren vier fast gleiche Grautöne mit einem
Anflug von Farbe, die niemand auseinanderhielt.

**Auf `prefers-color-scheme` zu verzichten, ist der Preis.** Er ist bewusst gezahlt: Ein
Schema ist eine Wahl, keine Umgebungsbedingung. Wer Rosa gewählt hat, will es auch
abends — eine App, die dann von selbst nach Dark springt, hätte die Wahl nicht ernst
genommen. Wer der Systemvorgabe folgen will, wählt Dark oder Classic von Hand.

**Die gemeinsame Staffelung der Helligkeit** (Grund 91, Kachel 98,6, Kachel-2 86, Linie
78) hält den Kontrast vergleichbar: gegenüber „classic" liegt der größte anteilige Verlust
unter 7 %, die Lesetexte bei mindestens 11,7 : 1. `tools/palette.py` rechnet die Werte
aus; von Hand gewählte Töne wären nicht nachprüfbar.

## Folgen

- Die Einstellungen `darstellung` und `farbe` verschwinden zugunsten von `schema`. Ein
  neuer Schlüssel — so erreicht die Umstellung auch bestehende Geräte.
- `schemaAusAchsen()` übersetzt die zwei alten Achsen: Ein gewählter Farbton wiegt
  schwerer als hell/dunkel, sonst entscheidet `hell` → `classic` gegen alles übrige →
  `dark`. Aufgerufen in `mergeState()` (gespeicherter Stand) und `decodeBackup()`
  (älterer Sicherungscode).
- Im Sicherungscode bleiben die beiden alten Stellen als `-` stehen; das Schema steht
  dahinter. Ein Feld, das es nicht mehr gibt, hinterlässt einen Platzhalter — dieselbe
  Regel wie bei `BK_SETTINGS`. Der Code trägt damit erstmals einen Bindestrich.
- `FARBTOENE` fällt weg, `SCHEMATA` führt je Schema nur noch **einen** Grundwert.
- Ab vier Knöpfen rückt eine Einstellungszeile die Wahl unter den Text
  (`.setting.breit`) — fünf Knöpfe daneben ließen dem Hinweis eine Schlucht von wenigen
  Wörtern Breite.
- **Was gemessen wird, bleibt messbar:** Die Testsuite prüft den Kontrast gegen „classic",
  nicht gegen einen Wunschwert. Gold auf Weiß liegt dort seit jeher bei 3,8 : 1 — unter AA
  für kleine Schrift. Das ist eine bestehende Entscheidung und war nicht Gegenstand dieses
  Tickets; die Schemata dürfen sie nur nicht verschlechtern.
