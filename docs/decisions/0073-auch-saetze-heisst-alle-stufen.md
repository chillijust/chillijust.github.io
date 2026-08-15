# 0073 · «Auch Sätze» heißt alle Stufen, nicht zwei

**Stand:** angenommen · 2026-08-15 · aus einem Ticket (Etappe 3 von 15)
**Ergänzt:** ADR 0056 (drei Strengen) · ADR 0070 (gelegt ist auch geschrieben)

## Ausgangslage

> «Die Bestrafung greift bei Sätzen irgendwie nicht. Bei Übersetzen hatte ich
> einen Fehler und konnte einfach auf Weiter drücken. Unter Einstellungen ·
> Antworten · nach einem Schreibfehler habe ich *auch Sätze* aktiv.»

## Was die Reproduktion ergab

Vor jeder Änderung wurde die ganze Leiter durchgespielt — fünf Satzstufen, mit
«immer» eingestellt, jede absichtlich falsch beantwortet:

| Stufe | Form | Richtung | Nachschrift |
| --- | --- | --- | --- |
| 0 | Kacheln | → Deutsch | nein |
| 1 | Kacheln | → **Russisch** | **nein** |
| 2 | getippt | → Deutsch | nein |
| 3 | getippt | → Russisch | ja |
| 4 | getippt | → Russisch | ja |

Die Einstellung wirkte in **zwei von fünf** Stufen. Der Befund war also nicht
«greift nicht», sondern «greift in der Stufe nicht, in der er gerade war» — und
weil die Form mit der Satzstufe steigt (ADR 0029), trifft das jeden Satz auf
seinem Weg nach oben mindestens zweimal.

Die Ursache stand offen im Code:

```js
rekoVerlangen(trTask.satz.ru,
  trTask.art === 'tippen' && !!trTask.loesungRu && !trRevealed, ok, true);
```

## Entscheidung

`trTask.art === 'tippen'` fällt weg. Auf der russischen Seite verlangt «immer»
die Nachschrift, **gelegt wie getippt**. Die deutsche Seite bleibt draußen.

## Begründung — und warum sie eine andere ist als in ADR 0070

ADR 0070 hat dieselbe Grenze schon einmal verschoben, aber mit einer anderen
Frage im Rücken: *Behauptet diese Antwort eine Schreibweise?* Wer ein Wort aus
Buchstabenkacheln zusammensetzt, tut das; wer unter fertigen Wörtern wählt,
nicht. Nach dieser Regel müssten die Wortkacheln in «Übersetzen» **draußen**
bleiben — dort werden ganze Wörter gelegt, keine Buchstaben.

Für den Satz gilt sie aber nicht, denn die Nachschrift meint dort etwas
anderes. Sie ist keine Prüfung der Schreibweise, sondern **die Bitte, die der
Nutzer selbst gestellt hat**: «auch Sätze» ist eine ausdrückliche Ansage, und
sie lautet — jeden Satz, den ich falsch hatte, schreibe ich einmal hin. Wie die
falsche Antwort zustande kam, ist für diesen Wunsch belanglos.

Das ist auch der Grund, warum es die Einstellung überhaupt gibt: ADR 0056 nennt
sechs Wörter auf einer Bildschirmtastatur ausdrücklich «keine Übung mehr,
sondern eine Strafe» und hält Sätze deshalb aus der Vorgabe heraus. Wer sie
trotzdem einschaltet, weiß, was er verlangt.

**Zwei Regeln, zwei Fragen:**

| | Frage | Grenze |
| --- | --- | --- |
| Wort (ADR 0070) | Behauptet die Antwort eine Schreibweise? | Herstellen ja, Wählen nein |
| Satz (ADR 0073) | Hat der Nutzer es verlangt? | «immer» ja, sonst nein |

## Was bewusst nicht gemacht wurde

**Die deutsche Seite bleibt frei** (Stufe 0 und 2). Die Regel «nur bei
Kyrillisch» steht seit ADR 0056 und hat einen Grund: Einen deutschen Satz
abzuschreiben lehrt kein Russisch, es kostet nur Zeit. Auf Nachfrage bestätigt.
Der Nutzer wird in diesen beiden Stufen also weiterhin mit «Weiter»
durchkommen — das ist eine Entscheidung, keine Lücke, und die Prüfungen
`D6.0` und `D6.2` halten sie ausdrücklich fest.

**Der Info-Knopf entfällt.** Das Ticket wünschte oben rechts in der Nachschrift
einen Knopf, der ein Blatt mit der Erklärung öffnet. Auf Nachfrage
zurückgezogen.

## Folgen

- Die Suite `strenge` prüft in `D5`/`D6` **die ganze Leiter** statt einer
  Stelle darauf, und `D7` stellt sicher, dass die Leiter beide Formen und beide
  Richtungen wirklich enthält — sonst wären die Prüfungen darüber grün, ohne
  etwas gesehen zu haben.
- **Eine Prüfung an einer Stelle einer Leiter prüft die Leiter nicht.** Die
  bestehenden `D1`/`D2` fassten genau einen Fall an (getippt, nach RU) und
  waren die ganze Zeit grün, während drei von fünf Stufen schwiegen.
