# 0051 · Die Zeichen der Meldung, neu bewegt, mit Puls; eine Warnung für Fehlschläge

*2026-10-10 · Wunsch des Nutzers, gewählt am Gerät aus 0.13.3T bis 0.13.3T4 · Version 0.14.0T ·
löst die Zeichen der Meldung aus 0035 und ihre Zeiten aus 0036/0037 ab; ergänzt 0049*

## Ausgangslage

Der Nutzer wollte die Zeichen der Meldungen neu bewegt sehen. Eine Kachel auf dem Dashboard
zeigte je Zeichen das heutige und drei Fassungen; aus seiner Wahl entstand eine vierte, in
drei Runden nachgeschärft. Ein Zeichen für Fehlschläge gab es nicht — «Speichern ging
nicht» trug dasselbe «i» wie «Gib ihr noch einen Namen».

## Entscheidung

- **Jedes Zeichen malt seine Scheibe selbst** (`zeichenBild`, `.zm-scheibe`), 44 px, die
  Linien im Maß von `ICON`. Nur so kann es sie füllen und über ihren Rand hinaus pulsen.
- **Jedes endet mit dem Puls** (`.zm-puls`): ein Ring läuft aus der Scheibe und verblasst.
  - **Haken:** Der Kreis schließt sich, die Scheibe füllt sich, der Haken zieht sich.
  - **Hinweis:** Der Kreis um das «i» zeichnet sich, der Punkt fällt als Tropfen hinein
    und plättet sich, der Strich wächst.
  - **Warnung** (neu): Dreieck, «!», Punkt zeichnen sich; dann wackelt es, der Puls läuft
    im Wackeln mit.
  - **Kopiert:** Beide Blätter zeichnen sich übereinander, dann fächern sie auf.
  - **Datei geladen:** Die Schale zeichnet sich, der Pfeil fliegt hinein, die Schale gibt
    nach.
- **Die Warnung trägt jeder Fehlschlag** (`melden(text, 'warnung')`): Speichern ging
  nicht, Kopieren ging nicht, die Datei ließ sich nicht anlegen, kein gültiger
  Sicherungscode, unlesbare Daten (0049). Ein Eingabehinweis behält das «i». Die Scheibe
  steht im Akzent, das Zeichen in `--auf-akzent`.
- Alles ist nach höchstens 1,2 s fertig, bevor die kürzeste Bestätigung (1,4 s) geht.
- Der Haken auf der Kachel bleibt, wie er war (0035).

## Begründung

Am Gerät wählt man Bewegung besser als nach Beschreibung; darum die Kachel zur Wahl, die mit
der Entscheidung wieder ging. Hintereinander hätten die gewählten Schritte bis zu 1,6 s
gedauert — gestrafft und, bei der Warnung, Wackeln und Puls zugleich, statt die
Bestätigung für einzelne Zeichen länger stehen zu lassen. Ein Fehlschlag, der aussieht wie
ein Eingabehinweis, wird überlesen; Grün und Blau sind vergeben, also der Akzent.

## Folgen

- Suite `zeichen` neu (G, W, F, K, L, A, B); `ICON.laden` und `ICON.kopie` entfallen.
- Der Puls füllt nur nach vorn (`forwards`) — mit `both` stünde sein Ring schon vorab am
  Rand.
