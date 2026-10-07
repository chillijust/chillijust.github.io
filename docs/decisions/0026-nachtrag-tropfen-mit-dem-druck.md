# 0026 · Nachtrag: Hell/Dunkel tropft mit dem Druck, Ticketfeld, Kalender

*2026-10-06 · Ticket vom Gerät (App-Stand 0.9.0T4) · Version 0.9.0T5 · ändert 0025
(Hell ↔ Dunkel, Ticketzeilen, Kalenderwochen, Woche ↔ Monat, «Hinzufügen») · `knaufGleiten` abgelöst durch 0037*

## Ausgangslage

Sieben Punkte nach der Ansicht von 0.9.0T4:

- Hell ↔ Dunkel: Der Tropfen kam erst, nachdem der Knauf angekommen war, und wuchs zu schnell.
- Ohne Fließtext war das Ticketfenster sehr dünn.
- «Alle Tickets»: Das Auftropfen der Zeilen war nicht zu sehen.
- Die Kalenderwochen standen bündig über dem Montag.
- Woche ↔ Monat: Die übrigen Wochen tropften nicht sichtbar.
- «Hinzufügen» ließ sich nur über «Abbrechen» schließen.
- Im Monat saß der Rahmen um den angetippten Tag unten zu knapp.

## Entscheidung

- **Der Tropfen entsteht mit dem Druck.** `themaUmschalten` startet den Übergang sofort;
  die neue Darstellung wächst 30 % langsamer als bisher (`THEMA_TROPFEN` 910 ms statt 700).
  Der Knauf gleitet derweil im neuen Bild von der alten Seite hinüber (`knaufGleiten`,
  750 ms).
- **Der Fließtext ist leer so hoch wie das Titelfeld** (`min-height: 50px`, wie `.eingabe`)
  und wächst wie bisher bis drei Zeilen.
- **Die Ticketzeilen tropfen sichtbar nacheinander**: je 110 ms später, 560 ms lang, und
  vor ihrem Einsatz sind sie unsichtbar (`fill: backwards`). Bisher standen sie schon da und
  zuckten nur kurz. Die Zeilen sind einzelne Flächen mit Abstand, damit jede für sich
  ankommt.
- **Die KW steht links außen auf ihrem Strich**: Die Zeile reicht über das Raster hinaus
  bis an den Kartenrand, der Strich wird entsprechend länger.
- **Woche ↔ Monat fließen gleichmäßig**: `KAL_TAKT` 640 ms auf `cubic-bezier(.45, 0, .25, 1)`.
  Die alte Kurve war nach 40 % der Zeit zu 90 % fertig, also war vom Tropfen fast nichts
  zu sehen.
- **Ein Tipp neben das Fenster «Hinzufügen» bricht ab** wie «Abbrechen». Ein Tipp ins
  Fenster selbst schließt es nicht.
- **Ein Monatstag hat unten mehr Luft** (`padding: 5px 0 9px`), der Rahmen um den
  angetippten Tag schließt die Punkte nicht mehr knapp ein.

## Begründung

Was der Finger auslöst, soll im selben Augenblick beginnen; eine Pause zwischen Druck und
Wirkung liest sich als Verzögerung. Ein leeres Feld, das dünner ist als das darüber, sieht
kaputt aus. Eine Bewegung, die im ersten Drittel schon fast fertig ist, nimmt das Auge
nicht als Bewegung wahr.

## Folgen

- Suiten: `thema` C0a, C5b (Knauf gleitet; gemessen wird nach `ausbewegt()`); `tickets`
  U9a, U13; `nachschliff` A5a, A5b, K2a–K2c.
- Ob der Tropfen am Gerät gleichzeitig mit dem Knauf läuft, zeigt nur das Gerät.
