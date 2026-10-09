# 0033 · Der Beginn einer Gewohnheit läßt sich zurückstellen

*2026-10-06 · Ticket «Gewohnheit schon früher angefangen» · Version 0.11.0T · ergänzt 0002, 0003*

## Ausgangslage

Eine Gewohnheit begann immer an dem Tag, an dem sie angelegt wurde. Wer sie erst eine
Weile ausprobiert und dann einträgt, fing bei null an — und nachtragen ließ sich höchstens
sieben Tage zurück (`NACHTRAG_TAGE`), nie vor dem Anlegen.

## Entscheidung

- Im Formular steht unter dem Rhythmus **«Begonnen am»** (Datum, höchstens heute). Aus
  dem Kalender von einem vergangenen Tag aus ist dieser Tag vorgewählt.
- Beim Speichern rückt `beginnVorziehen(g, beginn)` `angelegt` auf den Beginn und trägt
  **jeden fälligen Tag** zwischen neuem und altem Beginn als erledigt ein, höchstens bis
  gestern — heute zählt erst, wenn es erledigt ist. Bei *x-mal pro Woche* sind es je Woche
  `min(x, verfügbare Tage)`, mittig verteilt (bei 3 aus 7: Di, Do, Sa).
- **Der Beginn rückt nie vor**: Beim Bearbeiten ist der bisherige Beginn die Obergrenze,
  sonst fiele Gespeichertes aus der Rechnung.
- Kein neues Feld: `angelegt` *ist* der Beginn. Das Schema bleibt.

## Begründung

Gewünscht war «alle als erledigt»: Wer zurückstellt, sagt, daß er es getan hat. Leere Tage
seit dem Beginn hätten die Stärke gedrückt statt gehoben. Einzelne Tage lassen sich wie
bisher im Kalender abwählen — innerhalb der Nachtrage-Frist von sieben Tagen; ältere
bleiben, wie sie eingetragen wurden.

## Folgen

- Suite `beginn` (B, T, W, P, K, E).
- Die `.ics` einer Gewohnheit beginnt am Beginn (`DTSTART` aus `angelegt`); eine schon
  exportierte gilt danach als geändert.
