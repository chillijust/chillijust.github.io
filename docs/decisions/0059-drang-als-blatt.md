# 0059 · Der Drang ist ein Blatt aus Glas wie der Timer

*2026-10-13 · Stand 0.17.0T24 · Wunsch des Nutzers vor Block 5 aus Nachricht 15*

## Ausgangslage

Der Drang («10-Minuten-Welle») war eine eigene Ansicht `welle` mit Kopfzeile, Zurück-Pfeil
und Rückwisch. Der Timer dagegen ist seit ADR 0038 ein Fenster aus Glas über dem Dashboard,
das aus seiner Kachel tropft. Beide zeigen dasselbe (Ring mit Flüssigkeit und Chili, die
Restzeit groß, ADR 0054), bedienten sich aber verschieden. Der Nutzer wünschte den Drang
«auf die gleiche Art wie den Timer: Glas, ohne extra Seite». Das Pflichtenheft verlangt nur
Ring, Satz und am Ende «Gewonnen» oder «Nachgegeben», keine eigene Seite.

## Entscheidung

- **Der Drang ist ein Blatt `#drangBlatt` neben dem Timerblatt**, gebaut wie dieses: Es
  tropft milchig aus dem Drang-Knopf der Kachel und fließt dorthin zurück (Glas erst am Ziel,
  P1), ist der oberste Dialog (James, N5), läßt die Randgesten schweigen (N1) und stellt quer
  Ring und Knöpfe nebeneinander (ADR 0056). Die Ansicht `welle` gibt es nicht mehr.
- **Danebentippen schließt das Blatt; die Welle läuft weiter.** Der Knopf trägt die Restzeit,
  ein Tipp darauf öffnet das Blatt wieder. (Entscheidung des Nutzers.)
- **Ist die Welle eben durch** — in den letzten fünf Sekunden, App zu sehen, Dashboard ohne
  anderes Blatt —, **geht das Blatt von selbst auf** und fragt nach dem Ausgang. Wer die App
  erst später öffnet, findet «Welle vorbei» auf dem Knopf. (Entscheidung des Nutzers.)
- **«Nachgegeben» führt in die Rückfall-Ansicht**, wie bisher: Ein Textfeld in einem festen
  Blatt schöbe auf iOS die Tastatur aus dem Bild. Das Blatt schließt dabei ohne Fließen; der
  Rückweg führt in den Drang-Knopf, «Zurück zur Welle» öffnet das Blatt danach wieder.
  (Entscheidung des Nutzers.)
- «Gewonnen» und «Abbrechen» zeichnen das Dashboard neu, das Blatt fließt in den Knopf, die
  Meldung kommt im Glas; bei «Gewonnen» flammt die Chili im Tagesring.
- Ein zweiter Drang-Knopf meldet nur «Es läuft schon eine Welle.» — zwei Blätter übereinander
  gibt es nicht.

## Begründung

Gleiche Dinge bedienen sich gleich: Wer den Timer kennt, kennt den Drang. Das Blatt läßt das
Dashboard sichtbar, die Kachel zeigt den Lauf weiter. Am Gerät kostete der Rückwisch einer
ganzen Ansicht bis 0.17.0T23 ein Bild von 110–130 ms; ein Blatt schließt ohne Ansichtswechsel.

## Folgen

- Die Chili sitzt in höchstens einem Blatt: `chiliImBlatt` ist `'timer'`, `'drang'` oder
  `false`; `chiliZurueck(von)` holt sie nur aus dem eigenen.
- Ein geschlossenes Blatt — Drang wie Timer — räumt seine Welle ab (`welleWeg`); sie zeichnete
  sonst alle 50 ms weiter, unsichtbar.
- Der Start ändert nur die Kachel (`drangKachelLaeuft`), wie beim Timer (`kachelNeu`).
- Suiten: `drangblatt`, `querformat` (Q2b, Q3b); `abgewoehnen` F, `feinschliff` D,
  `nachschliff` W und `fluessig` W prüfen das Blatt statt der Ansicht.
