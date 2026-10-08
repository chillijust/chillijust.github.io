# 0018 · Home als Einstieg, Menü statt Reiterleiste

**Status:** angenommen · 2026-08-02 · Etappe 1 von drei (Bilanz-Details, Buchstaben folgen)

## Kontext

Die App öffnete direkt in «Lernsets» und navigierte über eine waagerechte Reiterleiste
mit fünf Einträgen. Drei Dinge störten daran:

- **Kein Überblick.** Man landete mitten in einer Übung, ohne zu sehen, was sonst
  ansteht oder was fällig ist.
- **Ungleiche Dinge nebeneinander.** «Bilanz» stand als fünfter Reiter neben vier
  Übungen, obwohl sie keine ist. «Einstellungen» hing daneben an einem eigenen Knopf,
  «Tickets» versteckt in den Einstellungen.
- **Der Begriff «Rubrik»** beschrieb weder das eine noch das andere.

## Entscheidung

1. **Home ist der Einstieg** und die einzige Navigation. Eine Kachel je Übung, darüber
   eine Empfehlung.
2. **Die Reiterleiste entfällt.** Unterwegs trägt der Kopf einen Zurück-Pfeil und den
   Namen der Ansicht und klebt oben; auf Home trägt er Titel und Fortschritt und scrollt
   mit.
3. **Ein Menü** hinter einem runden Knopf mit drei Strichen führt zu **Bilanz,
   Einstellungen, Tickets**.
4. **Der Begriff ist «Übung»**, nicht «Rubrik» — im Nutzertext wie im Code.
5. **Die Kacheln zeigen den Zustand**, nicht nur den Namen.

## Begründung

**Ein Startbildschirm rechtfertigt sich nur, wenn er etwas sagt.** Ein reines Verzeichnis
wäre ein Umweg — jeder Wechsel kostete dann einen Tipp mehr als vorher. Erst wenn jede
Kachel «11 offen», «21 fällig» oder «noch gesperrt» meldet, ist der Umweg ein Gewinn: man
sieht die Lage, bevor man sich entscheidet. Die Empfehlungszeile geht einen Schritt
weiter und entscheidet auf Wunsch selbst.

**Die Reihenfolge der Empfehlung ist eine Meinung**: erst auffrischen, wenn genug
aufgelaufen ist (fünf Dinge), dann das laufende Lernset, dann offene Sätze, dann Tippen,
sonst Freestyle. Sie folgt dem Lernweg, mit einer Ausnahme — Fälliges hat Vorrang vor
Neuem, weil Vergessenes teurer ist als Ungelerntes.

**Die Leiste zu streichen kostet Bequemlichkeit und bringt Ruhe.** Ein Wechsel geht jetzt
über Home statt direkt. Dafür ist der Kopf einzeilig statt dreizeilig, es gibt keinen
Streifen mehr zwischen Kopf und Inhalt, und die kompakte Zone aus ADR 0013 entfällt
ersatzlos — sie existierte nur, weil die klebende Leiste einen Platz freihalten musste.

**Der Menüknopf animiert nach unten**, nicht ins Kreuz. Ein Burger, der sich zum X
faltet, sagt «schließen»; hier bedeutet der Knopf aber weiterhin «Menü», und das Panel
schließt sich auch anders. Die Striche fahren darum aus dem Kreis heraus und wieder
hinein — `overflow: hidden` sorgt dafür, dass nichts überragt.

**`grid-template-rows: 0fr → 1fr`** für das Aufklappen, weil es echt von oben nach unten
wächst, ohne geratene Höhe und ohne den Inhalt zu verzerren (was `scaleY` täte). Die
Ränder der Karte gehören dabei in einen Zwischenbehälter — auf der Rasterzeile selbst
zählten sie zur Höhe, und zugeklappt bliebe ein sichtbarer Streifen stehen.

## Folgen

- `#navbar`, `#tabs`, `#kompakt`, `kompaktPruefen()` und `--kompakt-hoehe` entfallen.
- Der Einstieg zu den Tickets in den Einstellungen entfällt — das Menü ersetzt ihn.
- `letzterTab` hält jetzt nur noch Home und Übungen; damit ist der Rückweg aus einer
  Menüansicht immer die Übung, aus der man kam. `tkHerkunft` wird dadurch überflüssig.
- Der Grundplatz der Chili ist auf Home die Empfehlung, sonst der Kopf.
- Testreihen, die `#tabs` oder `#gear` ansprachen, prüfen jetzt Kacheln und Menü.
- Offen für Etappe 2 und 3: antippbare Bilanz-Kacheln mit Kreisdiagrammen, und die
  fünfte Kachel «Buchstaben».
