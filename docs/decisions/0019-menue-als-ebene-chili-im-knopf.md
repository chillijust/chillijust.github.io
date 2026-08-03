# 0019 · Menü als Ebene darüber, Chili im Knopf

**Status:** angenommen · 2026-08-02 · ergänzt ADR 0018

## Kontext

Der erste Gerätetest von Home und Menü brachte vier Befunde:

1. **Das Panel schob den Inhalt nach unten.** Es lag im Fluss des Kopfes; beim Aufklappen
   rutschten Fortschrittsleiste, Empfehlung und Kacheln mit.
2. **Es nahm die volle Breite ein**, obwohl drei kurze Einträge darin stehen.
3. **Nach der Auswahl kamen die drei Striche zurück.** Der Knopf sah aus wie vorher,
   obwohl man sich jetzt *im* Menübereich befand.
4. **Über «Chillingo.» stand eine Kante**: der Kopf deckte mit `--bg` den radialen Schein
   des Hintergrunds ab, der im Bereich der Statusleiste weiterlief.

Dazu ein fünfter, im Bild sichtbarer: die Chili hing mittig im Kopf und lag damit **über
dem Wort «Einstellungen»**.

## Entscheidung

1. **Das Panel liegt über der Seite** (`position: absolute` unter dem Knopf), rechtsbündig
   und 232 px breit.
2. **Im Menübereich bleiben die Striche unten.** Die Klasse `im-menu` am `<body>` gilt für
   Bilanz, Einstellungen, Tickets und Sprachfakten.
3. **Die Chili springt in den Knopf** und schrumpft dabei auf dessen Größe — der
   vorhandene Flug erledigt beides. Wird sie in der Ansicht gebraucht, tritt an ihre
   Stelle ein ruhender goldener Punkt.
4. **Der Kopf ist auf Home durchsichtig**, unterwegs deckend.
5. **Der Kopfplatz der Chili steht im Fluss**, zwischen Titel und Menüknopf, 34 px.

## Begründung

**Ein Menü, das den Inhalt verschiebt, ist keine Ebene, sondern ein Absatz.** Der Fluss
war die bequemere Umsetzung — das Aufklapp-Raster funktioniert dort ohne
Positionsangaben —, aber er widerspricht dem, was ein Menü sein soll: etwas, das sich
über die Seite legt und wieder verschwindet, ohne sie anzufassen.

**Die Breite folgt dem Inhalt.** Drei Wörter brauchen keine volle Zeile; ein schmales
Panel unter dem Knopf zeigt außerdem, wo es herkommt.

**Der Knopf soll sagen, wo man ist.** Kommen die Striche nach der Auswahl zurück, sieht
er aus wie im Ruhezustand, obwohl man sich im Menübereich befindet. Die Chili darin ist
mehr als ein Zustandssignal — sie ist dieselbe Figur, die sonst im Kopf steht, und ihr
Sprung dorthin macht den Wechsel sichtbar, statt ihn zu behaupten.

**Der ruhende Punkt** ist der Ausweg für den Fall, dass die Ansicht die Figur selbst
braucht (Leerzustände in Tickets und Sprachfakten). Ein leerer Kreis wäre die Alternative
gewesen; ein Punkt kostet vier Zeilen und sagt dasselbe wie die Chili, nur leiser.

**Der durchsichtige Kopf auf Home** ist die einfachere Hälfte einer alten Entscheidung:
Der Schein hinter dem Kopf (ADR 0005) sollte die Fläche beleben — ihn dann mit einem
deckenden Kopf zu überlagern, hob genau das wieder auf.

**Ein Platz statt zweier.** Der Kopfplatz war mittig positioniert, damit er auf Home
schön sitzt. Nur: Auf Home hat die Empfehlung immer Vorrang, der Kopfplatz kommt dort
also nie zum Zug. Eine Sonderregel für einen Fall, den es nicht gibt, ist eine Sonderregel
zu viel.

## Folgen

- `.menupanel` braucht `pointer-events: none` im geschlossenen Zustand — es liegt jetzt
  über dem Inhalt und würde sonst Tipps abfangen.
- Der Kopf trägt `position: relative`, damit das Panel sich an ihm ausrichten kann.
- Der Kopfplatz ist von 52 px auf 34 px geschrumpft; in Übungen ist die Chili damit
  kleiner als vorher.
- In Tickets und Sprachfakten mit Leerzustand zeigt der Menüknopf den Punkt statt der
  Figur — dort steht sie groß in der Ansicht.
