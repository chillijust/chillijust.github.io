# 0022 · Feinschliff: Leerzustände, Jubel über den Haken hinaus, Zeilen gehen als Geist

*2026-10-06 · Bauabschnitt 8 · Version 0.9.0T*

## Ausgangslage

Das Pflichtenheft nennt für Abschnitt 8 nur «Animationen, Chili-Jubel, Leerzustände». Vieles
stand schon: Die Chili flammt beim Haken und lodert, wenn der Tag voll ist; das leere
Dashboard begrüßt. Eine Durchsicht fand, was fehlte:

- **Leer:** Wer nur Abgewöhnen oder Termine hat, sah keinen Weg zur ersten Gewohnheit außer
  über das Menü. Wer alles archiviert hatte, wurde begrüßt wie beim ersten Start («Hallo, ich
  bin die Chili»). Eine frische Gewohnheit nannte unter der Heatmap «0 von 0 fälligen Tagen
  erledigt.». Der leere Export sagte, was fehlt, führte aber nicht hin.
- **Jubel:** Nur der Haken selbst wurde gefeiert. Die eigentlichen Wegmarken — eine
  Gewohnheit wird halb und ganz gefestigt, ein Aussetzer bleibt einer, beim Abgewöhnen fällt
  der alte Rekord — gingen still vorbei. Das Ende der Welle zeichnete nur neu.
- **Bewegung:** Ein gelöschter Rückfall und ein gelöschtes Ticket verschwanden aus ihrer
  Liste, ohne zu gehen; «Gewonnen» stand am Ende der Welle plötzlich da.

## Entscheidung

- **Leer:** Fehlen Gewohnheiten neben Abgewöhnen oder Terminen, steht an ihrer Stelle eine
  leise Kachel mit einem Satz und «Gewohnheit anlegen» (`#gwAnlegen`). Ist alles archiviert,
  sagt die Chili «Alles ruht gerade» und bietet «Neue Gewohnheit anlegen». Ohne fälligen Tag
  sagt die Heatmap-Zeile «Noch kein fälliger Tag vorbei.» (pro Woche: «Noch nichts
  erledigt.»). Der leere Export bekommt «Neuer Termin» und, ohne Gewohnheit, «Neue
  Gewohnheit»; wer dort anlegt, kommt über `rueckZiel` in den Export zurück.
- **Jubel beim Haken** (`hakenJubel`): Erreicht die Stärke 50 % oder 90 % — gezählt, wie
  die Kachel rundet —, lodert die Chili und das Glas sagt es («Halb gefestigt»,
  «Gefestigt»). Wird eine warnende Kachel heute abgehakt, flammt sie, und das Glas sagt
  «Nicht zweimal». Jeder Anlaß einmal je Sitzung, «nie zweimal» je Tag; gespeichert wird
  dafür nichts.
- **Neuer Rekord** (`rekordFaellig`, `rekordFeiern`): Überholt die laufende Strecke den
  alten Rekord (mindestens eine Stunde, `REKORD_AB`), lodert die Chili auf dem Dashboard und
  das Glas sagt «Neuer Rekord». Der Takt merkt es live; war die App zu, feiert das nächste
  Zeichnen des Dashboards. Damit es einmal je Strecke bleibt, merkt sich der Zustand in
  `gefeiert` je Laster den Rückfall, nach dem die gefeierte Strecke begann.
- **Welle:** Ist sie durch, flammt die Chili im Ring, und «Gewonnen» tropft herein
  (`#welleUrteil`, `teilTropfen`). Eine Wochenreflexion, die aufs Dashboard zurückführt,
  läßt die Chili flammen.
- **Zeilen gehen als Geist** (`zeileGeht(el, liste, ersatz)`): Vor dem Neuzeichnen wird
  der Geist genommen, danach steht er an der alten Stelle und zieht sich zusammen. Beim
  Ticket wartet er, bis das Blatt in seine Zeile geflossen ist.

## Begründung

Ein Leerzustand ist ein Wegweiser, kein Loch: Ein Satz sagt, was fehlt, ein Knopf führt hin.
Der Jubel gehört an die Stellen, an denen das Pflichtenheft den Fortschritt mißt — Stärke
und «nie zweimal» —, nicht an jede Zahl; darum zwei Stufen und keine Serien. Die Stufen
folgen der gerundeten Anzeige, weil die Rechnung 90 % erst bei der 66. Gelegenheit um ein
Zehntausendstel überschreitet, die Kachel aber schon bei der 65. «90 %» zeigt.

Der Rekord fällt meist, während die App zu ist; ohne Gedächtnis feierte jedes Öffnen ihn
neu. `gefeiert` ist keine abgeleitete Zahl, sondern ein Merkzettel wie `exportiert` und
`gesichert`: Stärke, Rekord und «frei seit» entstehen weiter nur in `lasterAuswerten`.

## Folgen

- Neues Feld `gefeiert` (Vorgabe `{}`): `stand()` behält nur Zeitpunkte für Laster, die es
  gibt. Der Sicherungscode trägt es mit; fehlt es, wird ein laufender Rekord einmal
  nachgefeiert. Kein neues Schema.
- Das Glas kann nach einem Haken zwei Anlässe zugleich haben (Rekord beim Zeichnen, Stufe
  beim Haken); es zeigt den letzten.
- Wie stark das Lodern neben dem Glas wirkt, zeigt nur das Gerät.
- Suite: `feinschliff` A1–A22 (leer), B1–B13 (Haken), C1–C13 (Rekord), D1–D7 (Welle,
  Reflexion), E1–E7 (Geist).
