# 0087 · Unter dem Bildschirm liegt noch Seite

**Stand:** angenommen · 2026-08-16 · aus einem Ticket
**Ergänzt:** ADR 0051 (der Scheinwerfer) · ADR 0044 (das Jubelfenster)

## Ausgangslage

**Befund:** «Im Tutorial bekomme ich unten einen hellen Streifen, sollte nicht
sein.» — mit Bild: alles verdunkelt, und über die volle Breite am unteren Rand
ein leuchtendes Band in der Farbe des Seitengrunds.

Der Hof des Tutorials steht so:

```css
#tutHof { position: fixed; inset: 0; }
```

Das deckt **den Layout-Viewport** — und der ist auf iOS nicht der ganze
sichtbare Bereich. In der Zone des Home-Indicators, und hinter der
einklappbaren Leiste, liegt noch Seite. Dort zeigt Safari den Grund des
Dokuments, und der ist in den hellen Schemata hell.

Solange die ganze Seite hell ist, sieht man davon nichts: Der Streifen hat
dieselbe Farbe wie alles andere. Erst unter einem verdunkelten Overlay wird er
zu einem Band.

**Warum kein Prüfstand-Bild das gefunden hat:** Im kopflosen Browser ist
`env(safe-area-inset-bottom)` null, und es gibt keine einklappbare Leiste. Der
Streifen existiert dort schlicht nicht.

## Entscheidung

Der Grund der Seite verdunkelt sich mit — um **genau dasselbe Maß** wie der Hof,
sonst wäre der Streifen nicht weg, nur dunkler:

```css
body.tut-offen, body.jubel-offen {
  background-color: #000;
  background-color: color-mix(in srgb, #000 82%, var(--bg));
}
```

Sichtbar ist davon **nichts** außer eben dort: Der Hof liegt lückenlos darüber.

Die erste Zeile ist der Rückfall für Browser ohne `color-mix` — schwarz ist
dort nicht exakt, aber unauffällig. Ein heller Streifen ist es nie.

**Das Jubelfenster bekommt dieselbe Regel.** Es ist genauso gebaut, hat
denselben vollflächigen Hof und damit denselben Streifen; daß ihn dort noch
niemand gemeldet hat, heißt nur, daß es seltener aufgeht.

## Was dabei auffiel

Die Suite `extras` lief seit jeher **mit offenem Tutorial** — die Testseite
lädt mit leerem Speicher, und dann fragt die App von selbst (ADR 0051). Weil
die Suite nur über JavaScript zugreift und nie etwas anklickt, hat sie das nie
bemerkt. Erst seit der Grund sich mitverdunkelt, maß sie einen Wert, der nicht
zum Schema paßte.

*Ein Zustand, den eine Prüfung nicht bemerkt, ist trotzdem da.* Sie schließt
das Tutorial jetzt, bevor sie Farben mißt.

## Folgen

- `tutorial` B10–B10d. B10d mißt **im hellen Schema** — dort trat der Befund
  auf, im dunklen fiele er kaum auf.
- Die Gegenprobe (Regel entfernt) macht B10 rot; die Prüfung mißt also wirklich
  etwas.
