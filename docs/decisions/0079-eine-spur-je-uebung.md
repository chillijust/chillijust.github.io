# 0079 · Eine Tutorial-Spur je Übung

**Stand:** angenommen · 2026-08-15 · aus einem Ticket
**Ergänzt:** ADR 0051 (das Tutorial ist ein Scheinwerfer)

## Ausgangslage

> «Jede Übung soll ein Tutorial bekommen, wie in der Übersicht. Es soll wie im
> aktuellen Tutorial eine Meldung kommen — los geht's oder abbrechen. Gleicher
> Stil. Damit es nicht zu viel auf einmal wird, fangen wir mit Lernsets, Tippen
> und Übersetzen an.»

## Entscheidung

`data/tutorial.json` ist keine Liste mehr, sondern eine **Sammlung von Spuren**:

```
home         13 Schritte   der Weg durch die App
lernsets      5            was die Punkte bedeuten, woher die Wörter kommen
tippen        5            warum es keine Auswahl gibt, was die Farben sagen
uebersetzen   5            warum ein Satz spät aufgeht, was mit der Stufe steigt
```

**Ein Mechanismus, nicht vier.** Derselbe Scheinwerfer, dieselbe Frage davor,
dieselbe Fußzeile mit Punktreihe. Neu ist nur `tutSpur` und dass alles, was
vorher `TUTORIAL` las, jetzt `tutSchritte()` fragt.

Die **Frage** vor dem ersten Schritt steht je Spur (`TUT_FRAGE`): «wie diese App
funktioniert» wäre in «Tippen» eine Lüge über den Umfang.

## Zwei Regeln, die den Ausschlag gaben

### Der Scheinwerfer braucht eine Bühne

Angeboten wird die Spur beim **ersten Betreten** der Übung — aber nur, wenn das
Ziel des ersten Schritts wirklich auf dem Schirm steht. Wer «Tippen» öffnet,
bevor ein Wort freigeschaltet ist, sieht einen Leerzustand; ein Scheinwerfer auf
nichts erklärt nichts. Dann wartet das Angebot bis zum nächsten Mal.

Ebenso schweigt es, solange das große Tutorial nicht gelaufen ist: Zwei Angebote
übereinander sind eines zu viel.

### Der Merker fällt beim Fragen, nicht beim Durchlaufen

`state.tutUebung` ist eine flache Menge wie `state.merk`. Sie wird gesetzt,
sobald **gefragt** wurde — wer die Frage wegtippt, hat geantwortet, und sie soll
nicht bei jedem Betreten wiederkommen. Dieselbe Unterscheidung wie bei
`tutorialGesehen`/`tutorialFertig` (ADR 0051).

Zurückholen lässt sich die Spur jederzeit über den **Trichter**: Dort liegt
alles Übungseigene, und «zeig es mir noch einmal» gehört dazu. Auf der Übersicht
steht der Knopf unten auf der Seite; in einer Übung wäre dafür kein Platz, ohne
die Aufgabe zu verdrängen. Die Zeile wird **einmal** angehängt, nicht in acht
Zweigen von `filterInhaltHtml()` eingebaut.

## Was der Build jetzt prüft

- Die vier Spuren müssen da sein, jede mit mindestens drei Schritten.
- Die Ziele sind **je Spur** eindeutig, nicht über alle: Der Trichter kommt in
  jeder Übung vor, und das ist kein Fehler, sondern der Sinn.
- **Eine Übungsspur führt nicht woandershin.** Jeder Schritt einer Spur trägt
  ihren eigenen Ort — wer «Tippen» erklärt bekommt, soll nicht plötzlich in der
  Übersicht stehen.

## Folgen

- `tutorial` bekommt die Abschnitte **J** (jede Spur, jeder Schritt findet sein
  Ziel und wird vom Loch gedeckt), **K** (einmal angeboten, nie im Leerzustand,
  nie vor dem großen Tutorial) und **L** (der Weg über den Trichter). 26 neue
  Prüfungen.
- **Die Suite `maskottchen` musste stillgestellt werden.** Sie betritt Übungen
  und misst danach, wo die Figur steht — seit dem Angebot stand sie in der
  Tutorial-Blase statt in der Ansicht. `spurenStill()` setzt die drei Merker,
  die Heimspur bleibt an (A0b prüft sie ausdrücklich). Ein Angebot, das von
  selbst kommt, ändert die Voraussetzungen jeder Prüfung, die eine Übung
  betritt — das ist beim Bauen leicht zu übersehen und war hier der einzige
  Schaden.
- `filter` prüft die Gruppen jetzt über `.filtergruppe .filter-titel`: Die neue
  Hilfezeile trägt dieselbe Überschriftenklasse, ist aber keine Filtergruppe.
