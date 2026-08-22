# 0094 · Eine Frage, eine Flamme je Schema, ein Balken je Übung

**Stand:** angenommen · 2026-08-22 · aus drei Tickets
**Ändert:** ADR 0086 (Lernbedarf und Defizite als zwei Abschnitte) ·
ADR 0088 (der Flammenschalter gilt nur für die hellen Schemata) ·
ADR 0074 (der Fortschritt im Kopf)

## 1 · Lernbedarf und «wo es hakt» sind eine Frage

**Befund:** «Lernbedarf und *wo es gerade hängt* gehören eigentlich zusammen.
Verbinde sie miteinander; im Überblick soll ein Kreisdiagramm rein.»

Der Nutzer hat recht, und der Fehler ist meiner: ADR 0086 stellte die neuen
Quoten **über** den alten Abschnitt und nannte die Trennung «erst *wo* hakt
es, dann *was* genau». Das klingt nach Ordnung und ist keine — beide
Abschnitte beantworten dieselbe Frage, nur mit verschiedenen Mitteln. Wer
sie untereinander liest, liest zweimal dasselbe Thema unter zwei
Überschriften und muß selbst herausfinden, daß es zusammengehört.

**Entscheidung:** Ein Abschnitt, **«Woran es hakt»**. Oben die auffälligen
Übungen mit ihrem Ring, darunter die einzelnen Befunde (Zurückgefallenes,
Verwechslungen, Zeichen unter der Schwelle, Überfälliges), am Fuß der eine
Weg in «Alle Kategorien». *Zwei Überschriften über einer Frage sind eine
Behauptung, es seien zwei.*

**Das Kreisdiagramm** ist die Gesamtquote (`gesamtQuote()`) — was über alle
Übungen zusammen danebenging. Die Einzelquoten sagen, *wo*; diese sagt, *wie
es insgesamt steht*, und sie ist die Zahl, die man beim Aufschlagen sehen
will.

**Das Bild hat sie kleiner gemacht.** Mit 178 px schob der Ring die Befunde
unter den Bildrand — genau das, was er einordnen soll, war nicht mehr zu
sehen. Er steht jetzt auf 132 px (`.donut.klein`). *Eine Überschrift, die
ihren Inhalt aus dem Bild drückt, ist keine Überschrift.*

## 2 · Die Flamme gehört jedem Schema

**Befund:** «Im Dark-Mode kann ich die Flamme nicht auswählen. Außerdem wird
die große Flamme zweimal angezeigt.»

Zwei Fehler, beide aus ADR 0088.

**Der Schalter war gesperrt** — und zwar **doppelt**: in JavaScript über
`disabled` und im Stil über `:root:not([data-schema])`. Hätte ich nur die
eine Hälfte gelöst, stünde da ein Knopf, der sich drücken läßt und nichts
tut. *Wer eine Regel an zwei Orten schreibt, muß sie an zwei Orten
zurücknehmen.*

Der Grund von damals — «die neue Flamme gehört zu Dark und steht dort
immer» — war eine Meinung über den Geschmack des Nutzers. Er hat sie
widerlegt.

**Entscheidung:** Zwei Schlüssel, `flammeDark` und `flammeHell`, gewählt über
`flammeSchluessel()`. Jedes Schema behält seine eigene Antwort: Wer in Dark
die schlichte Reihe will und in Grün die Glut, bekommt beides. *Eine
Einstellung, die für alle Schemata dasselbe sagt, sagt für die meisten das
Falsche.*

**Die Vorschau zeigte zweimal die Endstufe.** Sie lief über `[1, 2, 3, 4, 4]`
— vier und vier. Gemeint war die Leiter: `[0, 1, 2, 3, 4]`, **jede Stufe
genau einmal**, vom Strich bis zur Glut. Der Schalter zeigt, worüber er
entscheidet; eine Vorschau, die eine Stufe verschluckt und eine andere
verdoppelt, zeigt es nicht.

## 3 · Jede Übung trägt ihren eigenen Fortschritt

**Befund:** «Die Fortschrittsanzeige oben zeigt gerade nur den Fortschritt von
Lernsets. Vorschlag: Jede Übungskachel bekommt ihren eigenen Balken. Die
Übung, die bei der Chili angezeigt wird, soll auch den jeweiligen
Fortschrittsbalken der vorgeschlagenen Übung beinhalten.»

Die Zahl im Kopf war der Wortschatz. Wer «Buchstaben» oder «Grammatik» übte,
sah sie sich nicht bewegen — die Übung war in der einzigen Zahl, die die App
über den Fortschritt nannte, gar nicht enthalten.

**Entscheidung:** `uebungsFortschritt(id)` gibt für jede Übung `{ ist, soll }`
zurück, `fortschrittHtml()` zeichnet daraus einen Balken. Er steht auf jeder
Kachel und **in der Empfehlung neben der Chili** — dort trägt er den ihres
Ziels.

**Gemeistert von allem**, nicht «von dem, was freigeschaltet ist». Eine Zahl,
die schrumpft, sobald ein neues Set aufgeht, wäre keine Fortschrittsanzeige,
sondern eine Auskunft über die Größe des Vorrats. Der Nenner steht fest, der
Zähler wächst — das ist, was ein Balken verspricht.

Wo eine Übung keinen eigenen Bestand hat, steht kein Balken: Ein leerer
Balken ist keine Auskunft, sondern eine Lücke, die nach einem Fehler aussieht.

Der Balken nennt seine Zahl im `aria-label` («11 von 33») — **die Breite
trägt nie allein**, dieselbe Regel wie bei der Farbe.

## Was der Prüfstand gefunden hat

- **Eine stille Abhängigkeit in `rubriken`.** Z5 («alle sieben stehen im
  Baum») verließ sich darauf, daß das Tutorial *noch* offen war — die
  Testseite lädt mit leerem Speicher, und die App fragt beim Start von
  selbst. Der neue Abschnitt W ruft `tutEnde()`, und damit fiel Z5 um.
  Nicht der neue Abschnitt war falsch, sondern die Annahme: Z öffnet das
  Tutorial jetzt selbst. ADR 0088 hatte denselben Fall schon **vermerkt**
  und nicht behoben — beim zweiten Mal ist ein Vermerk zu wenig.
- **`tutStarten()` zeichnet die Ansicht nicht neu.** Es setzt den
  Scheinwerfer. Wer danach messen will, was in der Ansicht steht, ruft
  `setTab()` **danach**, nicht davor.

## Folgen

- `einrichten` D1/D1a (eine Überschrift statt zweier), D1c–D1f (der
  Gesamtring: da, groß genug, klein genug, mit gelesener Zahl);
  `flammen` E4f–E4h (die Wahl in Dark) und H1–H4 (zwei Reihen, jede Stufe
  genau einmal, beide Chips bedienbar, ein Tipp wirkt);
  `rubriken` W1–W6 (der Balken je Kachel, in der Empfehlung, mit seiner Zahl).
