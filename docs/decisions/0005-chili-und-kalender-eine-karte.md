# 0005 · Chili und Kalender in einer Karte, Punkte statt Tönung

*2026-10-05 · Ansicht von 0.3.0T · Version 0.3.0T2 · löst in 0003 die Lage des Kalenders
und die Tönung nach Anteil ab*

## Ausgangslage

Seit 0.2.0T2 stand der Kalender als eigene Karte ganz unten, unter Gewohnheiten und
Abgewöhnen — mit dem Abgewöhnen in 0.3.0T rutschte er noch weiter weg. Die Tage waren
flächig nach dem Anteil des Erledigten getönt; welche Gewohnheit fehlte, sah man erst nach
dem Antippen. Gewünscht: Chili und Kalender zusammen, oben, und die Gewohnheiten im
Kalender selbst — ähnlich der Kalender-App des iPhones.

## Entscheidung

- **Eine Karte ganz oben** (`zeichneHeld`): oben der Tagesring mit der Chili und daneben
  der Umschalter **Woche | Monat**, darunter Blättern, Raster und — nach Antippen — die
  Tagesliste. Der Kalender trägt keine eigene Überschrift mehr.
- **Ein Punkt je Gewohnheit** unter jeder Tageszahl (`kalPunkte`), in der Reihenfolge der
  Kacheln: gefüllt grün = erledigt, Ring = offen (heute) oder verpaßt, blasser Ring =
  kommt noch. «x-mal pro Woche» erscheint nur als gefüllter Punkt, wenn sie erledigt ist.
- **Die Flächentönung entfällt.** Ein Tag, an dem alles erledigt ist, trägt seine Zahl in
  Grün (`kalStufe` bleibt dafür und für die Ansage).
- **Das Abgewöhnen erscheint im Kalender nicht** — es bleibt in seinen Kacheln.
- **Die Tagesliste** öffnet weiterhin nur nach Antippen; heute steht ohnehin in den Kacheln.
- Die Woche zeigt kein «2/3» mehr — die Punkte sagen es.

## Begründung

Was oben steht, wird gesehen: Der Tag und seine Umgebung gehören zusammen, und die Chili
reagiert ohnehin auf jeden Haken. Punkte sagen, *was* gefehlt hat, nicht nur *wieviel*;
das ist die Lesart, die man vom iPhone-Kalender kennt. Das Abgewöhnen als Band über die
freien Tage wurde erwogen und verworfen — es hätte den Kalender mit einer zweiten
Bedeutung beladen.

## Folgen

- Die Karte ist höher als der alte Tagesring; die Kacheln beginnen weiter unten.
- Bei sehr vielen Gewohnheiten brechen die Punkte in eine zweite Zeile um.
- Termine (Abschnitt 4) bekommen im selben Raster einen blauen Punkt.
- Suite `kalender`: K9–K9d prüfen Punkte und die gemeinsame Karte.
