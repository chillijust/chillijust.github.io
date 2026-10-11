# 0028 · Kein Heranzoomen beim Tippen, die Woche tropft zur Seite, «Alle Tickets» so hoch wie das Ticket

*2026-10-06 · drei Tickets vom Gerät (App-Stand 0.9.0) · Version 0.9.1T, abgenommen mit 0.10.0T2 · ändert 0027
(Höhe der Ticketliste) · der Seitentropfen der Woche ist seit 0052 am Finger und gilt auch im Monat*

## Ausgangslage

- Beim Eingeben des Sicherungscodes zoomte iOS heran. Ursache: Das Code-Feld
  (`textarea.eingabe.code`) hatte 13 px Schrift. iOS zoomt an jedes Eingabefeld unter
  16 px heran und zoomt danach nicht von selbst zurück. Dasselbe Feld nutzt die Ausgabe
  auf der Ticketseite.
- Blättern in der Woche blendete die neue Woche nur kurz ein.
- «Alle Tickets» im Blatt nahm die Höhe seiner Liste an und schrumpfte bei wenigen Tickets.

## Entscheidung

- **Jedes Eingabefeld hat mindestens 16 px Schrift**; das Code-Feld trägt 16 px statt 13.
  Die Suite `zoom` prüft jedes Feld jeder Ansicht, das Ticketblatt und die Felder, die
  erst auf einen Tipp erscheinen.
- **Zoomen bleibt erlaubt.** Der Viewport bekommt kein `maximum-scale=1` und kein
  `user-scalable=no`. Das hätte das Heranzoomen ebenfalls verhindert, nähme aber das
  Vergrößern mit zwei Fingern weg.
- **In der Woche tropft Blättern zur Seite** (`kalBlaettern`, `kalSeitlich`): Vor zieht
  sich die alte Woche zur Perle zusammen und tropft nach links ab, die neue quillt kurz
  danach (30 % des Takts) von rechts als Perle herein und streckt sich zur Zeile. Zurück
  geht es spiegelbildlich, ebenso «Heute» aus einer anderen Woche. Takt ist `KAL_TAKT`.
  Der Monat blendet weiter ein — gewünscht war die Woche.
- **«Alle Tickets» ist genau so hoch wie das Ticket, aus dem es kam** (`ticketHoehe`).
  Reicht das nicht, rollt die Liste darin. Zurück im Ticket hat das Blatt wieder seine
  eigene Höhe. Damit gibt es beim Wechsel keine Höhenbewegung mehr, und die Zeilen
  beginnen gleich; die Staffel aus 0027 bleibt.

## Begründung

Ein Zoom, der von selbst kommt und nicht von selbst geht, ist eine Panne, keine Hilfe.
Ein Blatt, das beim Umschalten springt, lenkt vom Inhalt ab. Blättern hat eine Richtung;
der Tropfen zeigt sie.

## Folgen

- Suiten: `zoom` (neu) Z1–Z3; `nachschliff` S1–S8; `tickets` U9a, U9d–U9f.
- Ob der Zoom am Gerät ausbleibt, zeigt nur das Gerät.
