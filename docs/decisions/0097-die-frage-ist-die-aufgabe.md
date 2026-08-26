# 0097 · Die Frage ist die Aufgabe, kein Fußnötchen

**Stand:** angenommen · 2026-08-23 · aus einem Ticket

## Ausgangslage

**Wunsch:** «Bei Aufgaben wie „…woran erkennt man, welches gemeint ist?" ist
der Text schwer lesbar. Können wir ihn etwas größer und erkenntlicher
machen?»

`orthoEntdeckenHtml()` und `gramEntdeckenHtml()` — die «Entdecken»-Karte, mit
der eine neue Schreibregel oder ein neuer Grammatikbaustein beginnt — setzten
ihre Frage in `<p class="hint">`. Diese Klasse ist überall sonst in der App
für Randnotizen gedacht: 13px, `--dim`, gedacht, um zurückzutreten. Hier trug
sie aber die eigentliche Aufgabe — den Satz, den man lesen und beantworten
muss, bevor die Deutungen darunter überhaupt Sinn ergeben.

## Entscheidung

Eine eigene Klasse, `.entdecken-frage` (16px, normale Schriftfarbe, Zeilenhöhe
1,45), für genau diese eine Rolle. `.fact-text` kam nicht in Frage: Sie setzt
`text-align: left`, während die «Entdecken»-Karte insgesamt zentriert bleibt
(`.card { text-align: center }`) — eine linksbündige Frage über zentrierten
Paaren und Antwortknöpfen hätte nur eine Unstimmigkeit gegen eine andere
getauscht.

## Begründung

`.hint` bleibt an jeder anderen Stelle richtig — die Begründung nach der
Auflösung, «Zum Entfernen ein gelegtes Wort antippen», der Merksatz zur Regel:
alles Text, den man überfliegen darf. Eine Frage, die man erst beantworten
muss, ist keine Randnotiz, gleich in welcher Übung sie steht.

## Folgen

- `schreibung` C1b und `grammatik` D2b: Die Frage trägt `.entdecken-frage`,
  nicht `.hint`, und ihr Text stimmt mit `r.frage`/`b.frage` überein.
- Betrifft nur die «Entdecken»-Karte in «Schreibung» und «Grammatik» — die
  Nachschrift-Begründung und die übrigen `.hint`-Stellen sind unverändert.
