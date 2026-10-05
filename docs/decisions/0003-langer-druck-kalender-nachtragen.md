# 0003 · Langer Druck statt Pfeil, Kalender auf dem Dashboard, Nachtragen

*2026-10-05 · Abnahme von 0.2.0T · Version 0.2.0T2 · löst in 0002 den Pfeil und «Nachtragen
gibt es nicht» ab · Lage und Tönung des Kalenders abgelöst durch 0005*

## Ausgangslage

Bei der Ansicht von 0.2.0T am Gerät zwei Wünsche: Der kleine Pfeil auf jeder Kachel soll
weg, die Gewohnheit öffnet sich statt dessen durch langes Drücken der Kachel. Und das
Dashboard soll einen Kalender tragen, umschaltbar zwischen Woche und Monat — im
Pflichtenheft stand ein Monatskalender erst mit den Terminen in Abschnitt 4.

## Entscheidung

**Langer Druck**

- Kurz tippen hakt ab (wie bisher), **500 ms halten öffnet die Gewohnheit**. Die Kachel
  sinkt beim Halten sichtbar ein, erst nach 150 ms — sonst zuckt sie beim Blättern.
- Bewegt sich der Finger um mehr als 10 px, ist es Blättern: nichts öffnet sich.
- Der Klick, der auf einen langen Druck folgt, hakt nicht ab (Sperre 1 s).
- `contextmenu` (Rechtsklick, Androids langer Druck) öffnet ebenfalls; iOS unterdrückt
  Textauswahl und Callout auf der Kachel.
- Die Meldung nach dem Anlegen sagt es: «Antippen heißt erledigt, lange drücken öffnet sie.»

**Kalender** — vorgezogen aus Abschnitt 4, vorerst nur mit Gewohnheiten

- Unter den Gewohnheiten, Umschalter **Woche | Monat**. Die Wahl liegt in
  `state.kalender` und bleibt; Vorgabe ist die Woche.
- Jeder Tag ist nach dem **Anteil des Erledigten** getönt (`tagesStand`, `kalStufe`):
  frei · null (fällig, nichts erledigt) · wenig (< ½) · viel (≥ ½) · voll. Heute offen
  ist «frei», nicht «null» — wie bei der Stärke. «x-mal pro Woche» zählt an einem Tag nur,
  wenn er erledigt ist. Archivierte Gewohnheiten zählen nicht.
- Die Woche zeigt zusätzlich «erledigt/fällig», der Titel die ISO-Kalenderwoche.
- Pfeile blättern; ist ein anderer Zeitraum zu sehen, führt der Titel zurück zu heute.
- Termine kommen mit Abschnitt 4 als Punkt dazu.

**Tag antippen, nachtragen**

- Ein angetippter Tag zeigt darunter seine Gewohnheiten mit Zustand (erledigt, offen,
  verpaßt, nicht dran; bei «x-mal pro Woche» nur erledigt oder frei).
- **Nachtragen geht bis 7 Tage zurück** (`NACHTRAG_TAGE`), nie in die Zukunft und nie vor
  dem Anlegen (`aenderbarAm`). Ältere Tage zeigen nur an.
- Stärke, Serie und «nie zweimal» rechnen danach von selbst neu — gespeichert sind nur Tage.

## Begründung

Der Pfeil kostete auf jeder Kachel Platz und war ein zweites Ziel neben dem großen; der
lange Druck ist auf dem iPhone die gewohnte Geste für «mehr dazu». Nachtragen in einem
engen Fenster fängt den vergessenen Haken von gestern ab, ohne die Rechnung zur Erzählung
zu machen: Wer eine Woche zurückliegt, hat nicht mehr «vergessen».

## Folgen

- Die Gewohnheit ist ohne Pfeil nur noch über den langen Druck erreichbar. Für
  VoiceOver ist das Doppeltippen-und-Halten.
- Abschnitt 4 baut auf diesem Kalender auf, statt einen eigenen zu zeichnen.
- Suite `kalender` sichert Langdruck, Kalender und Nachtragen; `gewohnheiten` F1 öffnet
  nun direkt.
