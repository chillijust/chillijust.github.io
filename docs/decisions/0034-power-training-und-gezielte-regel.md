# 0034 · Power-Training, und die Regel gezielt wählen

**Stand:** angenommen · 2026-08-08

## Ausgangslage

Mit ADR 0033 fallen Wörter zurück, die dreimal hintereinander falsch geschrieben wurden.
Das ist die richtige Strafe — aber es gab keinen Weg zurück außer dem langen: Das Wort
liegt fortan zwischen zwanzig anderen im Lernset und kommt über Wochen verteilt wieder.
Wer ein bestimmtes Wort loswerden will, kann es nicht.

Dasselbe in der Grammatik: `gramAktuell()` schiebt immer die dringendste Regel vor. Eine
gemeisterte Regel kommt erst wieder, wenn ihre Frist um ist — sie noch einmal anzusehen,
weil man unsicher ist, ging nicht.

Dazu zwei kleinere Beobachtungen aus der Benutzung: Der Knopf «Warum?» holt in Wahrheit
die ganze Regelkarte zurück, verspricht aber nur eine Begründung. Und die Angabe, was
verlangt ist («он/она»), lief als Fließtext unter der Aufgabe mit und wurde übersehen.

## Entscheidung

**Ein eigenes Power-Training, keine Sonderbehandlung in den Lernsets.** Die gefallenen
Wörter stehen in `state.patzer`; die Übung nimmt drei davon und fragt jedes fünfmal, in
den gewohnten Stufen (Kacheln → Tippen mit Umschrift → Tippen blank). Sie ist ab drei
gefallenen Wörtern offen, hat eine eigene Kachel auf Home und einen Einstieg dort, wo der
Ärger entsteht: in der Patzer-Meldung und unter «Übersetzen».

**Was dort gelernt wird, zählt draußen.** `ptPruefen()` ruft `updateBox()` und
`meisterPruefen()` regulär auf. Ein zweiter, abgekoppelter Lernstand wäre eine Lüge über
den eigenen Fortschritt.

**Der Topf steht nicht im Sicherungscode.** Wie `wortFehler` ist er eine Momentaufnahme,
kein Lernstand — und der Code soll schlank bleiben (ADR 0017).

**Die Regel wird über die vorhandene Auswahl gewählt**, nicht über einen neuen Knopf. Die
Gruppe «Baustein» führt jede Regel mit ihrem Stand, «Der Reihe nach» bleibt die Vorgabe.

Dazu: **«Warum?» heißt jetzt «Mehr …»**, und die Vorgabe steht in eigener Zeile —
Bedeutung links, das Verlangte rechts in Gold.

## Begründung

Drei Wörter, weil mehr wieder eine Liste wäre und keine Übung. Fünf Runden, weil vier
Treffer die Meisterschwelle sind und der fünfte zeigt, dass es kein Zufall war. Die
Reihenfolge nimmt immer das Wort mit den wenigsten Treffern und nie zweimal dasselbe
hintereinander — sonst tippt man es ab, statt es zu wissen.

Die Schwelle von drei Wörtern ist keine Willkür: Für zwei lohnt keine eigene Übung, und
eine Kachel, die nach einem einzigen Fehler aufleuchtet, macht aus einem Vertipper ein
Ereignis.

Der Abschluss zeigt je Wort seinen neuen Stand und «wieder frei» in Grün. Das ist der
Sinn der Übung: ein sichtbar geräumter Rückstand, kein Punktestand.

## Folgen

- Home trägt sieben Kacheln statt sechs. Vier Testsuiten prüften die Zahl und wurden
  nachgeführt.
- `state.patzer` gehört in `defaultState()` und in die Migration von `mergeState()`; die
  `pt*`-Modulvariablen in `ansichtenZuruecksetzen()` (ADR 0017).
- `ptPool()` räumt beim Nachsehen auf: Wer wieder auf `SATZ_STUFE` steht, fällt aus dem
  Topf. Ein Wort kann die Übung also auch verlassen, ohne dort geübt worden zu sein — das
  ist beabsichtigt.
- Die Auswahl kennt jetzt in «Grammatik» einen Zustand; `gramWahl` fällt still auf `null`
  zurück, wenn die gewählte Regel verschwindet.
