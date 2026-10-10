# 0036 · Hell/Dunkel tropft weicher, auch mehrmals und aus den Einstellungen; «alle» tropft; Zeichen langsamer

*2026-10-07 · Abnahme 0.11.0T (Punkt 2), Tickets «Helldunkel Umschaltung», «Button für alle» · Version 0.11.0T2 · ergänzt 0025, 0026, 0030, 0034, 0035 · Dauer des Tropfens und Zeiten der Zeichen geändert durch 0037; Zeichen der Meldung seit 0051*

## Ausgangslage

**Hell/Dunkel mehrmals.** Ein zweiter Druck, während der erste noch tropfte, überspringt
dessen Ansichtsübergang. Der übersprungene meldet sein Ende sofort — und nahm dabei die
Klasse `thema-tropft` weg, die der neue gerade brauchte. Ohne sie fehlt dem neuen Bild
die Scheibe: Es blendete hart über, und alle Übergänge der App liefen mitten im Wechsel
wieder an. Ebenso räumten die Zeitgeber eines früheren Drucks dem späteren ab.

**Weicher.** Gewünscht am Gerät: langsamer, auf sanfterer Kurve. Die Einstellungen
schalteten ohne Tropfen um.

**«alle» im Export** zeichnete neu und sprang: Häkchen, Knauf und Spur standen sofort am
Ziel, während «Bearbeiten» seine Häkchen als Perlen austropfen läßt (ADR 0034).

**Zeichen** (ADR 0035) wirkten am Gerät zu flink.

## Entscheidung

- **Nur der letzte Druck räumt auf.** `themaLauf` zählt die Drücke; `aus()` nimmt die
  Klasse nur, wenn kein späterer kam. Der übersprungene Tropfen steht sofort am Ziel,
  der neue tropft darüber. Den Knauf läßt nur der letzte gleiten.
- **1300 ms statt 910**, Kurve `cubic-bezier(.35, 0, .25, 1)` — langsamer Anlauf, langes
  Ausgleiten; der Knauf gleitet 1000 ms statt 750.
- **Die Einstellungen tropfen aus ihrem Knopf** (`themaSetzen(wert, this)`). Ändert eine
  Wahl nichts Sichtbares — «Automatisch» auf dieselbe Darstellung —, tropft nichts.
- **«alle» tropft wie «Bearbeiten»:** Jedes Häkchen des Abschnitts, das sich ändert,
  rollt als Perle aus dem Schalter an seinen Platz (`perlenAus`), an wie aus, nacheinander;
  was bleibt, steht still. Knauf und Spur gleiten vom alten Stand hinüber.
- **Zeichen gut anderthalbmal so lang**, ohne harten Einsatz: Haken 0,7 s, Punkt 0,55 s
  (fällt weich statt beschleunigt), Pfeil 0,95 s mit halb so tiefem Nachfedern, Blatt
  0,8 s. Alles ist fertig, bevor die kürzeste Bestätigung (1,4 s) geht.

## Begründung

Den zweiten Druck zu sperren, bis der erste fertig ist, hätte den Schalter taub gemacht —
dasselbe Ärgernis wie bei Woche | Monat (ADR 0031). Der Übergang selbst darf
übersprungen werden; nur die Aufräumarbeit gehört dem, der zuletzt kam.

## Folgen

- Suite `wechsel` (A, B, C) mit einem Übergang, der sich wie Safari verhält — der
  kopflose Browser zeichnet zu selten für drei echte in Folge; `thema` C0a, D4a, D4b, D5;
  `exportwahl` T6–T10; `zeichen` W1–W3.
- Der Läufer trennt das Protokoll jetzt auch an `>` — die erste FAIL-Zeile klebte an
  `<pre id="testlog">` und fiel aus der Ausgabe.
