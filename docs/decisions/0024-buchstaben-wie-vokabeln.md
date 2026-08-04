# 0024 · Buchstaben werden abgefragt wie Vokabeln

**Status:** angenommen · 2026-08-04 · ergänzt ADR 0023

## Kontext

Die Buchstabenübung aus ADR 0023 war eine reine Vierfachwahl: Frage, vier Antworten,
weiter. Daneben steht «Lernsets» mit Fortschrittspunkten, «Aufdecken» und einem
Kachelmodus, in dem man das Wort selbst zusammensetzt. Zwei Übungen, zwei Grammatiken der
Bedienung — und die schwächere gehörte ausgerechnet zu dem Stoff, der ganz am Anfang
steht.

Dazu kam eine Unstimmigkeit im Lernstand: Ein Buchstabe war entweder gemeistert oder
nichts. Wörter kennen dagegen zwei Schwellen — «sitzt» ab Stufe 2, «gemeistert» ab
Stufe 4 —, und der ganze Lehrplan hängt an der ersten.

## Entscheidung

1. **Zwei Schwellen auch für Buchstaben:** `abcSitzt()` ab `SATZ_STUFE` (2),
   `abcGemeistert()` ab `BOX_MAX` (4). Gezählt wird beides getrennt.
2. **`abcPool()` fragt nach «gemeistert»**, nicht nach «sitzt» — was erst erkannt wird,
   bleibt im Stapel.
3. **Derselbe Kopf wie in «Lernsets»** (`abcKopfHtml()`): ein Fortschrittspunkt je
   Buchstabe, darunter sitzen / gemeistert / fällig. Auf der Karte die Leiter des
   gefragten Buchstabens.
4. **Kachelmodus ab Stufe 2:** Das Zeichen steht da, der **Laut** wird aus lateinischen
   Kacheln zusammengesetzt, mit zwei bis drei überzähligen.
5. **«Aufdecken»** wie in den anderen Übungen: zeigt die Auflösung, zählt als Fehler.

## Begründung

**Eine App, eine Bedienung.** Wer in «Lernsets» gelernt hat, dass die Punkte oben den
Stand zeigen, dass «Aufdecken» ehrlich, aber teuer ist und dass Kacheln kommen, sobald
etwas sitzt, soll das in «Buchstaben» nicht neu lernen. Die Übung hatte keinen Grund,
anders zu sein — sie war nur früher fertig.

**Erkennen ist nicht Können.** Vier Antworten zu unterscheiden ist etwas anderes, als
`щ` aus dem Nichts als «schtsch» hinzuschreiben. Genau diese Lücke schließt der
Kachelmodus, und genau an dieser Stelle sitzt der Fehler: Wer «sch», «schtsch» und
«tsch» nur wiedererkennt, verwechselt sie beim Lesen weiter.

**Der Laut ist das Einzige, was sich zusammensetzen lässt.** Ein Buchstabe ist ein
Zeichen — daran ist nichts zu legen. Seine Transkription dagegen hat bei neun Buchstaben
zwei bis sieben Zeichen, und das sind dieselben neun, die man falsch schreibt. Bei
einstelligen Lauten wäre eine Kachelaufgabe eine Farce; dort bleibt es bei der Wahl —
dieselbe Regel wie `canTile` beim Wortschatz, der kurze Wörter auch nicht legen lässt.

**Ъ und Ь fallen heraus**, weil ihr «Laut» ein deutsches Wort ist («Härtezeichen»). Man
setzt keine Vokabel aus Kacheln zusammen, die gar keine Lautschrift ist. `abcKachelbar()`
prüft darum auf zwei bis acht Kleinbuchstaben und schließt sie damit sauber aus, ohne
eine Liste pflegen zu müssen.

**Die feste Richtung bleibt fest.** Wer «Laut → Zeichen» einstellt, bekommt keine
Kacheln: Diese Richtung ist bereits die produktive, und ein Modus, der die Einstellung
überstimmt, wäre ein Fehler und kein Fortschritt.

## Folgen

- Die Home-Kachel sagt jetzt «alles gemeistert» statt «alles erkannt» und nennt fällige
  Auffrischungen; die Bilanz führt unter dem Balken beide Zahlen.
- `abcBuilt` und `abcRevealed` sind neuer Ansichtszustand und gehören nach der Regel aus
  ADR 0017 in `ansichtenZuruecksetzen()`.
- Der Stapel bleibt derselbe: `abcPool()` fragte vorher nach `>= BOX_MAX` und tut es
  weiter, nur unter dem passenderen Namen. Was sich ändert, ist die **Anzeige** —
  Buchstaben auf Stufe 2 oder 3 zählen jetzt als «sitzend» statt als gar nichts. Es geht
  kein Stand verloren, und der Sicherungscode bleibt unverändert.
- Die Testreihe zu den Buchstaben wächst von 51 auf 81 Prüfungen.
