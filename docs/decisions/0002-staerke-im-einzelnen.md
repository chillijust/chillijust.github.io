# 0002 · Gewohnheiten: Stärke, Serie und «nie zweimal» im Einzelnen

*2026-10-05 · Bauabschnitt 2 · Version 0.2.0T · Pfeil und «kein Nachtragen» abgelöst durch 0003*

## Ausgangslage

Das Pflichtenheft legt die Rechnung fest (gleitender Mittelwert über die fälligen
Gelegenheiten, α für 90 % nach 66, «nie zweimal», x-mal pro Woche anteilig am Wochenende),
läßt aber offen, was mit dem laufenden Tag, der laufenden und der ersten Woche, mit
Erledigungen an nicht fälligen Tagen und mit dem Gewicht einer Woche geschieht. Außerdem
gehört die Detailansicht erst zu Abschnitt 6 — der Pfeil auf der Kachel muß aber schon
jetzt irgendwohin führen.

## Entscheidung

**Rechnung**

- α = 1 − 0,1^(1/66). Alles wird aus `erledigt` und dem Rhythmus abgeleitet und nie
  gespeichert; ein geänderter Rhythmus rechnet die ganze Geschichte neu.
- **Heute zählt erst, wenn es erledigt ist.** Ein offener Tag ist kein Aussetzer — sonst
  fiele die Stärke jeden Morgen und stiege beim Abhaken wieder.
- **Wochentage:** Gelegenheit ist nur ein gewählter Tag. Eine Erledigung an einem anderen
  Tag wird angezeigt, zählt aber nicht.
- **x-mal pro Woche:** Die Woche läuft Montag bis Sonntag und wiegt so viel wie ihre x
  Gelegenheiten: s ← s·(1−α)^x + (1−(1−α)^x)·r, r = min(1, Treffer/x). Die **erste,
  angebrochene Woche** verlangt nur min(x, übrige Tage). Die **laufende Woche** zählt erst,
  wenn sie erreicht ist; bis dahin ist die Gewohnheit «dran», danach gedimmt.
- **Serie** zählt erledigte Gelegenheiten (bei x-mal pro Woche: erreichte Wochen). Ein
  einzelner Aussetzer unterbricht sie nicht, der zweite in Folge setzt sie auf 0.
- **Nie zweimal:** Die Kachel warnt, wenn die **letzte fällige Gelegenheit vor heute**
  verpaßt ist und heute noch offen — bei Wochentagen also nicht zwingend «gestern». Bei
  x-mal pro Woche warnt sie die ganze Woche über («Diese Woche nicht wieder»), wenn die
  Vorwoche verfehlt ist, bis heute abgehakt ist.

**Oberfläche**

- Abgehakt wird nur **heute**; Nachtragen gibt es nicht. *(Abgelöst durch 0003: bis 7 Tage zurück im Kalender.)*
- Gedimmte Kacheln («Heute nicht dran») lassen sich trotzdem abhaken.
- Der Pfeil *(abgelöst durch 0003: langer Druck)* führt vorerst zur Ansicht **«Gewohnheit»**: Stand (Stärke, Serie, seit),
  dasselbe Formular wie beim Anlegen, «Archivieren» mit zweitem Tipp. Die Heatmap kommt mit
  Abschnitt 6 hinzu, ebenso das **Zurückholen** archivierter Gewohnheiten — bis dahin
  bleiben sie unsichtbar im Speicher.
- Der **Hinweis ab 3** steht im Formular «Neue Gewohnheit», nicht auf dem Dashboard: Er
  gilt der Entscheidung für eine weitere, nicht dem Tag.
- Beide Ringe (Tag und Stärke) laufen im Akzent; «erledigt» trägt die Scheibe im Ring in
  Grün. Der Jubel der Chili bleibt Abschnitt 8.

## Begründung

Jede Auslegung hält sich an das, was das Pflichtenheft schützen will: Ein Aussetzer kostet
wenig, Wochen viel; niemand wird für einen noch offenen Tag bestraft; eine Woche mit drei
Läufen wiegt wie drei Tage mit je einem. Die vorläufige Ansicht «Gewohnheit» verhindert,
daß ein Tippfehler im Namen bis Abschnitt 6 stehenbleibt.

## Folgen

- Regeln in `.claude/rules/logik.md`, Prüfungen in der Suite `gewohnheiten`.
- Abschnitt 6 baut die Detailansicht auf «Gewohnheit» auf und bringt das Archiv.
