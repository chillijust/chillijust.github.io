# 0021 · Das Ticketblatt steht unten, mit «Alle Tickets»

*2026-10-06 · Abnahme von 0.8.0T · Version 0.8.0T2, frei mit 0.8.0 · ändert 0020*

## Ausgangslage

Drei Befunde am Gerät zum Ticketblatt:

- Es stand oben am Bildschirm; der Tropfen lief vom Knopf unten rechts quer hinauf. Gewünscht:
  Das Blatt tropft unten vom Bildschirm auf.
- Aus dem Blatt führte kein Weg zur Liste aller Tickets — nur über das Menü.
- «Wo» und «Was» standen nebeneinander; gewünscht untereinander.

## Entscheidung

- **Das Blatt steht unten** (`align-items: flex-end`), über dem Home-Indikator, und quillt
  aus dem Knopf unten rechts dorthin. Die Tastatur legt iOS über Fixiertes, statt den Rahmen
  zu verkleinern; `ticketTastatur()` liest aus `visualViewport`, wie viel verdeckt ist, und
  hebt das Blatt um so viel (`--tastatur`). Ist es höher als der Rest, rollt es in sich.
- **«Alle Tickets»** steht im Kopf des Blatts, rechts neben dem Titel. Es klappt zu wie
  Danebentippen — ein Entwurf bleibt liegen, der Punkt am Knopf zeigt ihn — und öffnet die
  Liste; steht man schon dort, klappt es nur zu.
- **«Wo» und «Was» untereinander**, jede Auswahl in voller Breite.

## Begründung

Oben stand das Blatt, weil die Tastatur unten nichts verdeckt. Unten steht es dort, wo der
Daumen und der Knopf sind; der Abstand zur Tastatur ist mit `visualViewport` zu haben. Der
Weg zur Liste gehört dorthin, wo man an Tickets denkt.

## Folgen

- Ob das Blatt mit eingeblendeter Tastatur richtig hochrückt, zeigt nur das Gerät — der
  kopflose Browser kennt keine Tastatur; die Suite stellt `visualViewport` nach.
- Suite: `tickets` U1–U8.
