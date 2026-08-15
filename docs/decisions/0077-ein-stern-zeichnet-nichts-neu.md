# 0077 · Ein Stern zeichnet nichts neu

**Stand:** angenommen · 2026-08-15 · aus einem Ticket
**Ergänzt:** ADR 0071 (eine Bewegung ist eine Aussage) · ADR 0067 (der Merkstern)

## Ausgangslage

> «Wenn ich Fakten als Favoriten speichere, verschwindet die Sprechblase kurz.»

## Ursache

```css
.sprechblase { animation: blaseAuf .6s .26s both cubic-bezier(…); }
```

Der Füllmodus `both` heißt: Vor dem Start hält das Element den **Anfangszustand**
des Ablaufs. Der Anfangszustand ist `opacity: 0`. Eine frisch gezeichnete
Sprechblase ist also eine Viertelsekunde lang unsichtbar und blendet dann ein —
richtig so, wenn sie neu erscheint.

Der Stern auf der Faktkarte rief `neu()`, und das zeichnete die **ganze Karte**
neu. Die Blase war damit ein neuer Knoten, ihre Animation begann von vorn, und
sichtbar war: Sie verschwindet kurz.

## Dieselbe Ursache wie in ADR 0071

Dort sprang die Chili bei jedem Renderlauf, weil der Hüpfer am Zeichnen hing
statt am Ereignis. Hier blinzelt die Blase bei jedem Renderlauf, aus demselben
Grund. Der gemeinsame Satz:

> **Ein Renderlauf ist kein Ereignis.** Wer für eine Änderung an einem einzelnen
> Zeichen die ganze Ansicht neu baut, setzt alles zurück, was darunter einen
> Zustand über die Zeit trägt — Animationen, Schreibmarken, Scrollstellen.

## Entscheidung

`sternSetzen(el, an)` schaltet den Stern **an Ort und Stelle** um: Klasse,
`aria-pressed`, Symbol. Kein Neuzeichnen.

Betroffen sind drei Stellen:

| Stern | vorher | jetzt |
| --- | --- | --- |
| Faktkarte (`#factFav`) | zeichnete die Karte neu | an Ort und Stelle |
| Regelkarte in «Grammatik» / «Schreibung» | zeichnete die Übung neu | an Ort und Stelle |
| Merkzettel | zeichnete die Liste neu | **weiterhin neu** |

Der Merkzettel bleibt beim Neuzeichnen, und das ist kein Versehen: Dort
verschwindet mit dem Stern die **ganze Zeile**. `merkBinden(neuZeichnen)`
entscheidet danach — wo sich mehr ändert als der Stern, wird gezeichnet.

## Was dabei auffiel

Das Aufblitzen aus ADR 0071 (`.blinkt`) wurde bisher vom Renderlauf mit
weggeräumt: Der neue Knoten trug die Klasse einfach nicht mehr. Ohne
Renderlauf bleibt sie stehen — der Knopf hätte beim nächsten Blick noch das
letzte Mal gefeiert. `sternSetzen()` räumt sie darum selbst weg.

**Eine Reparatur, die einen Renderlauf entfernt, erbt alles, was der Renderlauf
nebenbei aufgeräumt hat.** Die Prüfung `R2d` hat das sofort gemeldet.

## Folgen

- `maskottchen` bekommt `R2e`–`R2j`. Die tragende Prüfung ist `R2h`: Sie hält
  die laufende Einblendung als Objekt fest und verlangt, dass es **dasselbe**
  ist. Ein Vergleich der Deckkraft wäre untauglich gewesen — synchron gemessen
  steht sie während der Verzögerung ohnehin auf null, und die Prüfung wäre aus
  dem falschen Grund rot geworden.
- `faktKarteBinden()` verliert seinen zweiten Parameter; fünf Aufrufe mit.
