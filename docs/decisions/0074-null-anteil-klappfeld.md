# 0074 · Die Null, der Anteil und das Klappfeld

**Stand:** angenommen · 2026-08-15 · aus drei Tickets (Etappe 4 von 15)
**Ergänzt:** ADR 0015 (eine Frist ist ein Zähler) · ADR 0069 (der Bezug ist eine
Wahl)

## 1 · Null heißt «gar nicht», nicht «sofort»

**Befund:** «*Auffrischen nach* soll die Option mit 0 bekommen. 0 bedeutet keine
Auffrischung.»

Die Untergrenze stand auf 1. Sie auf 0 zu senken ist eine Zeile — und wäre
falsch gewesen, denn **in JavaScript ist die Null falsch**, und der Wert wurde
an vier Stellen mit `|| 21` gelesen:

```js
(state.settings.auffrischen || 21) * TAG
```

Eine eingestellte Null hätte sich still in einundzwanzig Tage verwandelt: der
Schalter da, die Anzeige richtig, die Wirkung nicht. Dieselbe Falle im
Sicherungscode (`parseInt(e[2], 10) || 21`) — eine gesicherte Null wäre beim
Einspielen verschwunden.

**Entscheidung:** Die Frist wird an **einer** Stelle gelesen,
`intervallFuer()`, und dort heißt Null **`Infinity`**. Das ist die genaue
Übersetzung des Gemeinten: `jetzt - seit >= Infinity` ist nie wahr, also wird
nichts je wieder fällig. Wörter, Sätze, Buchstaben, Grammatik- und
Schreibregeln fragen alle dort nach und sind damit ohne eigenes Zutun mit
erledigt.

**Eine abgeschaltete Frist ist unendlich, nicht null.** Wer sie als 0 rechnet,
bekommt das Gegenteil: alles sofort fällig.

### Was daran teurer war als die Zeile

**Vier Leerzustände versprechen ein Wiedersehen** — zwei in «Tippen», zwei in
«Übersetzen»: «Die nächste Auffrischung kommt *in 12 Tagen*.» Ohne Frist gibt
es kein nächstes Mal. Die erste Fassung dieser Reparatur fasste zwei davon an;
die dritte hinterließ «Die nächste Auffrischung kommt .», und **die Prüfung fand
sie**, nicht das Auge. Beide Sätze stehen jetzt in je einer Funktion
(`auffrischKommt()`, `ruhtWeiter()`), und die Suite geht alle vier Zustände
durch.

Ebenso `naechsteAuffrischung()`: Ohne Guard hätte dort «in Infinity Tagen»
gestanden — die Art von Satz, die man einmal auf dem Gerät sieht und nie
vergisst.

Und im Zählerfeld steht «— gar nicht» statt «0 Tage», wie beim Tagesmaß «ohne
Grenze» statt «0 neu/Tag» (ADR 0015). **Eine Null bedeutet in jedem Zähler
etwas anderes; die Zahl allein sagt es nicht.**

## 2 · Der Anteil, und was die Serie zählt

**Befund:** «Der Text soll nicht *80 von 395 gemeistert* anzeigen, sondern den
Fortschritt in %. Was *Serie 3* bedeutet, ist unklar, sollen wir das
weglassen?»

**Entscheidung Prozent:** ja — aber gerundet wird vorsichtig. Bei 395 Wörtern
ist eines 0,25 %; «0 % gemeistert» wäre für den, der gerade sein erstes Wort
geschafft hat, falsch **und** entmutigend. Unter einem Prozent steht darum
«unter 1 %», und **100 % gehört dem, der wirklich alle hat** — bei 394 von 395
steht 99 %. Eine Rundung, die eine Zahl in eine Behauptung verwandelt, ist
keine Rundung mehr.

**Entscheidung Serie: nicht weglassen, sondern benennen.** «Serie 3» nennt eine
Zahl ohne Gegenstand — das ist der Grund für die Unklarheit, nicht die Serie
selbst. Jetzt steht dort «3 richtig in Folge». Weggelassen wäre sie das Einzige
aus dieser Zeile, das sich von Antwort zu Antwort bewegt; der Anteil daneben
rührt sich an guten Tagen um einen Punkt.

## 3 · Ein Klappfeld ist kein Rädchen

**Befund:** «Die auszuwählenden Seiten sollen per Dropdown und als Liste
auswählbar sein.»

Hier stand ein Zielkonflikt mit einer Regel, die der Nutzer selbst gesetzt hat:
*Die App führt keine Klappmenüs.* Die Suite `filter` liest den Quelltext danach
ab und bricht bei einem nativen Auswahlfeld ab — genau das ist in der Etappe
zuvor passiert.

**Entscheidung:** Die Regel meint das **native** Auswahlfeld, nicht das
Aufklappen. Auf iOS ist ein `<select>` ein Rad über der halben Seite, das nichts
vom Blatt darunter übrig lässt; darum bleibt es verboten. Das Klappfeld ist aus
Knöpfen gebaut, wie alles hier — und hat **dieselbe Gestalt wie «Alle Übungen»
auf der Übersicht**: Die App hat für das Aufklappen genau eine Form.

Zugeklappt trägt der Knopf die Wahl (sonst müsste man aufklappen, um zu sehen,
was man meldet), aufgeklappt steht die Liste darunter, und **eine Wahl schließt
sie wieder** — ein Klappfeld, das offen bleibt, hat nichts beantwortet.

Die vierzehn Seiten als offene Chip-Reihe füllten das halbe Blatt; das war der
sichtbare Grund für das Ticket.

## Folgen

- `wiederholung` bekommt den Abschnitt **J** (12 Prüfungen), darunter eine über
  **alle vier** Leerzustände statt eines; `funktionstest` **K1–K2c** und `K4`;
  `tickets` **F3b–F3g**.
- **Eine Prüfung, die auf «0 = Unsinn» bestand**, musste umgeschrieben werden
  (`I7b`). Sie hielt eine Grenze fest, die eine Entscheidung war — richtig, dass
  sie ansprang.

## Regel

**Was ein Nullwert bedeutet, weiß nur der Zähler, dem er gehört.** Ein
`|| vorgabe` liest ihn als «nicht gesetzt» und ist deshalb überall dort falsch,
wo Null etwas heißt.
