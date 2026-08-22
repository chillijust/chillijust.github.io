# 0093 · Eine Einstellung darf vorziehen, nicht aufschieben

**Stand:** angenommen · 2026-08-21 · aus einem Befund
**Ändert:** ADR 0086 (der Deckel) · ADR 0088 (ab wann geschrieben wird)

## Ausgangslage

**Befund:** «In den Lernsets kommen nie Aufgaben zum Schreiben wie in Tippen.»

Der Verdacht lag zuerst auf `buildQuestion()` — dort steht die Bedingung, die
über die Aufgabenform entscheidet. Sie war in Ordnung. Die Messung über 200
Runden zeigte:

```
alle Wörter auf Stufe 3   →  tippen: 200 von 200
8 auf Stufe 3, 4 auf 2    →  tippen: 101, mc-ru: 78, tiles: 21
```

Die Aufgabenform kam also sehr wohl. **Das Bildschirmfoto des Nutzers löste den
Widerspruch auf:** Die Punktreihe der Kachel zeigte vier von fünf gefüllt — also
Stufe 3 —, und die Aufgabe hieß trotzdem «Legen». Das geht nur, wenn
`settings.tippenStufe` auf **4** steht.

## Der Deadlock

Bei `tippenStufe = 4` mauert sich der Lernweg selbst zu:

| Schritt | | |
| --- | --- | --- |
| Wort steht auf Stufe 3 | `3 >= 4`? nein | → Kachelaufgabe |
| richtig gelegt | `updateBox(…, getippt = false)` | → neu wäre 4 |
| der Deckel greift (ADR 0086) | letzter Schritt verlangt getippt | → zurück auf 3 |

Und von vorn. Gemessen über 60 Runden mit lauter richtigen Antworten:

```
tippenStufe=2  →  10 von 12 gemeistert  (38 Tippaufgaben)
tippenStufe=3  →  10 von 12 gemeistert  (34 Tippaufgaben)
tippenStufe=4  →   0 von 12 gemeistert  ( 0 Tippaufgaben)
```

**Null.** Wer diese Einstellung wählte, konnte kein einziges Wort mehr fertig
lernen — und sah nie, warum.

## Entscheidung

**Die Einstellung darf vorziehen, nicht aufschieben.** `tippAb()` deckelt sie
bei `BOX_MAX - 1`:

```js
function tippAb() {
  return Math.min(state.settings.tippenStufe, BOX_MAX - 1);
}
```

Der letzte Schritt verlangt eine getippte Antwort — also muß er auch als
Tippaufgabe **angeboten** werden. Das ist keine Sonderregel, sondern dieselbe
Regel von der anderen Seite gelesen.

Gemessen danach, dieselbe Lage:

```
tippenStufe=4  →  10 von 12 gemeistert  (34 Tippaufgaben)
```

**Die Wahl bietet nur noch 2 und 3 an.** Mit `tippAb()` wäre «4» harmlos
geworden — aber wirkungslos, und eine Wahl, die nichts bewirkt, ist eine
Attrappe (dieselbe Haltung wie beim App-Symbol). Ein gespeicherter Stand mit 4
überlebt: `tippAb()` fängt ihn ab, `mergeState()` läßt ihn stehen.

Die Zeile heißt jetzt **«Schreiben ab Stufe»**, nicht «Tippen ab Stufe» — sie
wirkt in «Lernsets» genauso wie in der Übung «Tippen», und seit ADR 0092 ist
«Lernsets» der Ort, an dem es zählt.

## Was daran lehrreich ist

**Der gemeldete Ort war nicht der schuldige.** Gemeldet war «Lernsets», die
Ursache stand in den Einstellungen — zwei Bildschirme weit weg. Die Messung in
`buildQuestion()` sprach die Funktion frei, und ohne das Bildschirmfoto hätte
ich dort weitergesucht.

*Ein Befund nennt, wo es weh tut, nicht wo es herkommt.*

**Und die Prüfung nahm eine Zahl an, statt sie zu variieren.** `lernweg` K1–K6
prüfte den Deckel gründlich — immer bei der Vorgabe 3. Die Einstellung, die
alles aushebelt, kam in keiner Prüfung vor. K7 lernt ein Set jetzt bei **jeder**
wählbaren Stufe fertig; die Gegenprobe (ohne `tippAb()`) meldet «0 von 12
gemeistert · 0 getippte Aufgaben».

## Folgen

- `tippAb()` steht neben `SATZ_STUFE` und wird an drei Stellen gefragt: der
  Kontext-Lücke, der Tippaufgabe und `tippenSchwelle()`. Die rohe Einstellung
  wird nirgends mehr gelesen.
- `lernweg` G1/G1b (zwei Stufen zur Wahl, keine über dem letzten Schritt) und
  K7 (der ganze Weg, dreimal).
