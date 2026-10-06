# 0017 · Journal: eine Wochenreflexion je Woche, sonntags auf dem Dashboard

*2026-10-06 · Bauabschnitt 6, zweiter Teil · Version 0.7.0T*

## Ausgangslage

Das Pflichtenheft verlangt: «sonntags erscheint auf dem Dashboard eine Kachel
‹Wochenreflexion› — zwei Fragen (Was lief gut? Was hat gestört?). Gespeichert, im Journal
nachlesbar.» Offen waren Speicherform, Ort der Kachel, ob man außerhalb des Sonntags
schreiben kann und wie man eine Reflexion ändert oder entfernt. Der Menüeintrag «Journal»
trug bis hierher «bald».

## Entscheidung

- **Eine Reflexion je Woche**, gespeichert unter ihrem Montag:
  `state.journal = [{ woche, gut, stoerte, zeit }]`, nach Woche sortiert, je Antwort
  höchstens `JOURNAL_MAX` = 1000 Zeichen. Zwei leere Antworten sind keine Reflexion.
- **Die Kachel steht nur sonntags** auf dem Dashboard, unter «Gewohnheiten» (was heute dran
  ist) und über «Heute nicht dran», gebaut wie eine Gewohnheitskachel. Steht die Reflexion
  schon, trägt sie den grünen Haken und öffnet zum Nachlesen. Auf dem leeren Dashboard
  (Willkommen) steht sie nicht.
- **Das Journal** (Menü) zeigt alle Wochen, die neueste oben, mit beiden Antworten im
  Wortlaut. Ein Eintrag öffnet seine Woche zum Ändern; zurück geht es ins Journal
  (`rueckZiel`, wie aus dem Export).
- **Abweichung vom Pflichtenheft:** Fehlt die Reflexion der laufenden Woche, bietet das
  Journal an jedem Tag «Woche reflektieren» an. Die Zukunft nicht; vergangene Wochen ohne
  Reflexion lassen sich nicht nachholen.
- **Die Woche in Zahlen** steht über den Fragen: «Diese Woche bisher: 6 von 8 Haken
  gesetzt.» — gerechnet aus `tagesStand`, heute offen zählt nicht. Nichts davon wird
  gespeichert.
- **Entfernen heißt leeren**: Beide Felder leer gespeichert, verschwindet die Reflexion. Ein
  eigener Löschknopf entfällt.

## Begründung

Der Sonntag als fester Anlass ist der Kern der Idee; die Kachel bleibt darum an ihn
gebunden. Wer ihn verpaßt oder schon am Samstagabend schreiben will, soll aber nicht
eine Woche warten — das Journal ist dafür der ruhige Ort, nicht das Dashboard. Die Zahlen
geben der Frage «Was lief gut?» einen Anhalt, ohne zu urteilen. Unter der Kachel der
fälligen Gewohnheiten steht sie, weil Abhaken die Hauptsache bleibt.

## Folgen

- Neues Feld `journal` mit Vorgabe in `grundStand()` und Prüfung in `stand()`
  (`reflexionLesen`); `JOURNAL_MAX` steht vor `var state = laden();`. Kein Schemawechsel.
- Ansichten `journal` und `reflexion` (nimmt den Montag als `id`; anderes führt nach Hause).
- Der Menüeintrag «Journal» hat sein `ziel`; die Suite `menue` prüft «bald» jetzt an
  «Sicherung».
- Bauabschnitt 6 ist damit vollständig.
- Suite: `journal`.
