# 0035 · Buchstaben tragen Wörter

**Stand:** angenommen · 2026-08-08

## Ausgangslage

«Buchstaben» ist freiwillig und getrennt (ADR 0023): eigener Lernstand, zählt nicht in
Serie und Fortschritt. Das war richtig — es sollte nichts blockieren. Es hatte aber eine
Folge, die niemand wollte: Die Übung führte nirgendwohin. Wer das Alphabet meisterte,
bekam eine Zahl («33 gemeistert») und sonst nichts. Der Wortschatz nebenan wusste nicht,
dass da jemand lesen gelernt hatte.

Umgekehrt war «Freestyle» blind für das Alphabet: Es legte einem Wörter hin, deren
Zeichen man noch nie gesehen hatte, und nannte das Vokabeltraining.

## Entscheidung

**Ein Wort, dessen Buchstaben alle gemeistert sind, ist lesbar.** Daraus folgt beides:

- In «Buchstaben» steht am Fuß ein **Wink** mit der Zahl der lesbaren Wörter und einem
  Knopf, der direkt in den Modus führt — ab drei Wörtern.
- In «Freestyle» steht über dem Thema ein **Schalter**, der den Vorrat auf genau diese
  Wörter einschränkt.

Maßstab ist **gemeistert** (`BOX_MAX`), nicht «sitzt» (`SATZ_STUFE`). Zwei richtige
Antworten sind keine Lesefähigkeit.

Der Schalter steht **in der Ansicht, nicht in der Auswahl**. Er ist ein Angebot, das
sich gerade erst geöffnet hat; wer es suchen muss, findet es nicht.

**Die Strafe kommt aus ADR 0033, aber milder.** Wer im Lesemodus ein Wort legt und einen
Buchstaben gar nicht unterbringt, kennt ihn nicht: Nach vier Malen fällt er eine Stufe
und steht wieder in «Buchstaben».

## Begründung

Zur Strafe war die Frage offen, ob sie hier überhaupt einen Gegenstand hat. Sie hat
einen — nur einen anderen als in «Übersetzen». Dort geht es um die **Schreibung eines
Wortes**, hier um **einzelne Zeichen**. Ein falsch gelegtes Wort sagt nichts über die
Vokabel und alles über den Buchstaben, der fehlte. Darum fällt der Buchstabe, nicht das
Wort.

Drei Einschränkungen halten sie fair:

- **Nur beim Legen.** Eine Auswahlfrage sagt über Schreibung nichts.
- **Nur was fehlt, nicht was falsch steht.** Wer alle Buchstaben beisammen hat und bloß
  die Reihenfolge verdreht, kennt sie ja.
- **Vier statt drei Versuche.** Wer mit dem Alphabet anfängt, ist Anfänger.

Die Kacheln rücken im Lesemodus eine Stufe vor, weil das Zusammensetzen die Übung ist,
die nach Buchstaben fragt. Auf Stufe 0 bleibt es bei der Auswahl — ein nie gesehenes
Wort zu legen wäre Raten, nicht Lesen.

## Folgen

- Ein gefallener Buchstabe nimmt Wörter aus dem Lesemodus mit. Das ist der Sinn, nicht
  ein Nebeneffekt — aber es heißt, dass der Vorrat mitten in einer Sitzung wegschmelzen
  kann. Der Leerzustand braucht darum **zwei Ausgänge**: «Alle Wörter» und «Zu
  ‹Buchstaben›». Ein Modus ohne Ausgang wäre eine Falle.
- `state.leseFehler` gehört in `defaultState()` und in die Migration von `mergeState()`;
  `uebLesen` in `ansichtenZuruecksetzen()` (ADR 0017). Der Zähler bleibt aus dem
  Sicherungscode — eine Momentaufnahme, kein Lernstand (wie `wortFehler`, ADR 0033).
- «Buchstaben» bleibt freiwillig. Der Lesemodus schaltet nichts frei und sperrt nichts;
  er zeigt nur, was ohnehin schon geht.
