# 0096 · Grammatik führt eine eigene Schwelle

**Stand:** angenommen · 2026-08-23 · aus einem Ticket

## Ausgangslage

**Wunsch:** «Die Grammatik-Übung gefällt mir. Leider gibt es wenig Aufgaben in
einer Lektion, sodass das Wissen nicht gefestigt wird. Können wir mehr Aufgaben
pro Grammatikblock einfügen?»

Jeder Baustein hat längst einen großen Wortpool (`beispiele`, 15–35 Einträge) —
an Inhalt fehlte es nicht. Der Mechanismus war das Problem: `gramWaehlen()`
bearbeitet immer den ersten noch nicht gemeisterten Baustein, und ein Baustein
galt mit `BOX_MAX` (4) — derselben Schwelle wie ein Vokabelwort — schon nach
vier richtigen Antworten als gemeistert. Dann zog die Übung zum nächsten
Baustein weiter. Effektiv gab es damit pro Regel nur eine Handvoll Aufgaben,
bevor sie aus der Übung verschwand.

## Entscheidung

Eine eigene Konstante `GRAMM_BOX_MAX = 8` — doppelt so viele richtige
Anwendungen wie ein Wort, bevor ein Baustein sitzt. `gramGemeistert()` und
`gramUpdate()` rechnen gegen sie, nicht gegen `BOX_MAX`. `meisterPruefen()`
bekommt dafür ein optionales siebtes Argument (die Schwelle, Vorgabe
`BOX_MAX`) statt eine zweite Funktion zu werden — die vier anderen Aufrufer
(Wort, Satz, Buchstabe) bleiben unverändert.

Betroffen sind nur Stellen, die die Schwelle selbst kennen müssen: die
Punktereihe der Übungskarte (jetzt neun statt fünf Punkte), der Leer-Zustand
«Alle Regeln sitzen», und der Jubel-Auslöser für die letzte gemeisterte Regel.
Die Fortschrittsflamme (`ppHtml()`) bleibt unberührt — sie deckelt ohnehin bei
`BOX_MAX` und zeigt zwischen Stufe 4 und 8 weiter volle Flamme, keine sechste
Stufe. Die Sicherung kodiert eine Box-Stufe als einzelne Base-36-Ziffer
(`Math.min(9, box)`); `GRAMM_BOX_MAX = 8` bleibt darunter, ein älterer wie ein
neuerer Lesecode versteht den Wert unverändert.

## Begründung

*Wer eine Sache erst zurücklegt und dann vier Tage später einmal wieder
antippt, hat nicht gefestigt — er hat sich erinnert, dass es sie gibt.* Eine
höhere Schwelle verlangt echte Wiederholung, ohne den Wortschatz-Mechanismus
für alle anderen Übungen mit anzuheben — die Vokabel-, Buchstaben- und
Schreibungs-Schwelle bleibt bei `BOX_MAX`, wo sie schon vorher richtig war.

Verworfen: `BOX_MAX` selbst anheben (hätte Vokabeln, Tippen und Schreibung
ungefragt mit betroffen) und eine zweite Aufgabenform je Baustein entwerfen
(Aufwand für 13 Bausteine einzeln, ohne dass der eigentliche Befund — zu
wenig Wiederholung — behoben wäre).

## Folgen

- Suite `grammatik`, Abschnitt R: `GRAMM_BOX_MAX > BOX_MAX`, ein Baustein
  sitzt bei `BOX_MAX` noch nicht, `gramUpdate()` deckelt korrekt bei
  `GRAMM_BOX_MAX`, die Punktereihe zeigt `GRAMM_BOX_MAX + 1` Punkte.
- Sechs Suiten, die einen Baustein testweise als «schon gemeistert» markierten,
  rechnen jetzt gegen `GRAMM_BOX_MAX`: `regeln`, `jubel`, `wiederholung`,
  `fertig`, `lehrplan`, `power`. `flammen` bleibt unverändert — sie braucht nur
  Zwischenstufen, keine gemeisterten.
