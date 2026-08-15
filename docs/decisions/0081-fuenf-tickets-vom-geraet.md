# 0081 · Fünf Tickets — Auskunft, Puls, Liste, Gestalt, Leiste

**Stand:** angenommen · 2026-08-15
**Ergänzt:** ADR 0052 (was die App über sich weiß) · ADR 0067 (das Loch liegt auf
dem Ziel) · ADR 0078 (Ort und Art) · ADR 0080 (der Tutorial-Knopf)

## 1 · «Offline bereit» zeichnete sich nicht nach

**Befund:** «Nachdem ein Update über Settings gemacht wurde, aktualisiert der
*Offline bereit*-Bereich nicht. Erst wenn man wieder auf *Suchen* tippt.»

Der Worker wird nach seiner gespeicherten Fassung **gefragt** — über einen
`MessageChannel`, und die Antwort kommt asynchron. Beim Start lief die Frage
**ohne Rückruf**:

```js
swVersionHolen();   // die Antwort kam an und blieb liegen
```

Die Ansicht war längst gezeichnet. Nur der Weg über «Suchen» reichte einen
Rückruf mit, der das Feld neu beschriftete — deshalb half genau dieser Knopf.

**Entscheidung:** Die Auskunft steht in `swBereitZeichnen()` und wird von beiden
Wegen gerufen: beim Start **mit** Rückruf, und zusätzlich bei
`controllerchange`. Ein anderer Worker heißt eine andere gespeicherte Fassung.

**Die Regel dahinter:** Wer etwas asynchron erfragt und den Rückruf wegläßt,
hat nicht gefragt — er hat nur gesendet.

## 2 · Der Scheinwerfer leuchtet auf

**Befund:** «Die hervorgehobenen Bereiche sollen kurz aufleuchten (alle 4 s), um
sie erkenntlicher zu machen — dezent, schlicht.»

Das steht in einer gewissen Spannung zu ADR 0067, wo jeder stehende Streifen
unverdunkelten Grundes um das Loch entfernt wurde: Er zog den Blick stärker an
als das Angeleuchtete. Ein Ring, der **zweimal kurz auftaucht und wieder
verschwindet**, tut das nicht — er sagt «hier», solange man hinsieht, und ist
danach wieder fort. Die Regel aus 0067 gilt für **stehende** Ränder weiter.

Der große Schatten muss in jedem Schlüsselbild mitgeschrieben werden:
`box-shadow` ist eine Eigenschaft, nicht zwei. Wer nur den Ring animiert,
löscht die Verdunklung.

Bei `prefers-reduced-motion` steht der Ring **still da**, statt zu fehlen — ganz
wegzulassen nähme ihm die Auskunft, die er trägt.

## 3 · Eine Ticketzeile, zwei Orte

**Befund:** «Im Reiter *Bearbeiten* sollen bereits kopierte Tickets angezeigt
werden wie im Ticketsystem im Menü — gleiches System, nur ohne Kopieren.»

Die Liste im Blatt war eine eigene, knappere Gestalt. `tkZeileHtml()` steht
jetzt einmal und wird von beiden Orten benutzt: Art, Titel, Datum, Ort und ob
schon übergeben. **Zwei Fassungen wären zwei Wahrheiten über denselben
Bestand.** Ohne Kopierknöpfe — das Bündeln gehört in die Ticketansicht.

## 4 · Der Wunsch sieht aus wie der Fehler

**Befund:** «Die Wunsch-Erstellung soll gleich gestaltet sein wie die
Fehler-Erstellung.»

ADR 0078 hatte das Feld «Art» beim Wunsch weggelassen — «ein Wunsch hat keinen
Grund, er hat einen Zweck». Richtig gedacht, in der Oberfläche trotzdem ein
Bruch: Zwei Formulare für dieselbe Handlung, und der Unterschied erklärt sich
nicht von selbst.

`MELDE_GRUENDE` ist jetzt **zwei Listen**. Das Feld steht bei beiden, mit
passenden Einträgen: «Stürzt ab oder hängt» wäre bei einem Wunsch Unsinn,
«Neue Funktion» beim Fehler.

Beim Umschalten fällt eine Wahl weg, **die es in der neuen Liste nicht gibt** —
sie stünde sonst als «Keine Angabe» da und wanderte trotzdem ins Ticket. Was in
beiden steht (`anzeige`), überlebt: Die Absicht bleibt dieselbe.

## 5 · Die Leiste über dem Inhalt

**Befund:** «Der Tutorial-Knopf soll bei Übungen rechts über dem Fenster stehen
— halb so groß, das Zeichen darin gleich groß. Den Info-Knopf links daneben,
gleiche Größe.»

**Entscheidung:** `#uebLeiste`, ein rechtsbündiger Streifen zwischen Kopf und
`#main`. Er steht **außerhalb** von `#main` — ein Renderlauf ersetzt dessen
Inhalt, und die Hülle des Wissensknopfes mit ihrem Blatt und ihren Zuhörern wäre
jedes Mal fort.

**Zur Größe gab es einen Zielkonflikt**, und er ist entschieden worden: «Halb so
groß» heißt 22 px und unterschreitet die harte Regel «Touch-Ziele ≥ 44 × 44 px».
Auf Nachfrage: sichtbarer Kreis **36 px**, Zeichen weiter 20 px, antippbare
Fläche über ein `::after` weiterhin **44 px**.

**Was die Prüfung dabei fand:** Das `::after` wurde von `.rundbtn`s
`overflow: hidden` abgeschnitten — die Fläche war eine Behauptung, der Knopf
genau so klein wie sein Aussehen. `.klein` trägt darum `overflow: visible`, was
die Chili ohnehin verlangt (sie landet in diesen Knöpfen).

Nebenwirkung, bewusst: Der Knopf steht damit **auch auf der Übersicht** in der
Leiste statt im Kopf. Eine Sache, ein Ort.

## Folgen

- `offline` A9–A9e, `tutorial` B9/B9b und M1–M4, `tickets` F3l–F3l4 und Z2b–Z2d.
- **Eine Prüfung, die eine Trefferfläche misst, statt eine Zahl im Stil zu
  lesen**, hat den abgeschnittenen Rand gefunden: `elementFromPoint` an vier
  Punkten knapp innerhalb der 44er-Fläche.
