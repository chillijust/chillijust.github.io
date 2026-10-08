# 0045 · Gruppen auf Home, Reiter in den Einstellungen, Fakten überall

**Stand:** angenommen · 2026-08-09

## Entscheidung

**Home ordnet die Übungen in drei Gruppen** statt sieben gleichrangiger Kacheln:
**Wörter** (Lernsets, Freestyle, Tippen) · **Sätze** (Übersetzen) · **Freiwillig**
(Buchstaben, Grammatik, Power-Training). Die Reihenfolge ist der Lernweg. Eine ungerade
letzte Kachel nimmt beide Spalten — die Lücke war das «Wilde» am alten Feld.

**Die Einstellungen bekommen vier Reiter** — Lernweg, Abgabe, Eingabe, Darstellung — statt
vier Überschriften untereinander. Die Leiste **klebt oben**; man soll jederzeit sehen, wo
man ist. Gewischt wird waagerecht im Blatt; der Randwisch für «zurück» behält Vorrang, er
beginnt am linken Rand, dieser hier nicht (ab 28 px).

**Sprachfakten gibt es in jeder zählenden Übung**, nicht nur in den Lernsets. Dort haben
sie einen eigenen Schritt, weil die Runde kurz ist und der Fakt die Pause *ist*; in
«Tippen», «Übersetzen» und im Power-Training stehen sie als **Streifen unter der
Auflösung**. «Buchstaben» und «Grammatik» bleiben draußen: Sie zählen nicht in
`state.answered`, und ein Fakt zwischen zwei Regeln wäre ein zweiter Gedanke zu viel.

**Redewendungen kommen zu den Fakten** — 25 neue, die meisten mit ihrer wörtlichen
Übersetzung, weil genau die im Deutschen kippt: «Nudeln auf die Ohren hängen», «wenn der
Krebs auf dem Berg pfeift», «nicht im eigenen Teller».

## Begründung

**Sieben Kacheln in einer Reihe sehen aus wie eine Schublade.** Mit Überschriften sieht
man, wozu jede gehört — und die Zahl erschreckt nicht mehr, weil man drei Dinge liest
statt sieben.

**Ein Reiter, der wegscrollt, beantwortet die Frage nicht, für die er da ist.** Darum
`position: sticky` und, unterwegs, unter dem klebenden Kopf.

**Der Mat wird benannt, nicht zitiert.** Ein Fakt erklärt, was die russische Schimpfsprache
ist und warum ihre Wendungen wörtlich übersetzt selten Sinn ergeben. Die Wendungen selbst
stehen nicht da — das ist eine Entscheidung über den Ton der App, keine über die Sprache;
wer sie drin haben will, sagt es.

## Folgen

- `UEBUNG_GRUPPEN` führt die Einteilung, `UEBUNGEN` weiterhin die Kacheln selbst. Eine
  neue Übung braucht beide Einträge, sonst steht sie nirgends.
- `einstReiter` ist Ansichtszustand und gehört damit in `ansichtenZuruecksetzen()` — wie
  `faktStreifen`.
- Was nur auf einem Reiter steht, ist beim Binden **nicht immer da**: Der Tonknopf wird
  darum geprüft, bevor ein Zuhörer daran hängt.
- Prüfungen, die eine Einstellung anfassen, müssen ihren Reiter wählen.
- Der Knopf in der Kachel verschwindet, solange Menü oder Auswahl offen sind: Er liegt
  über deren Blättern (z-index 40 gegen 30) und stach hindurch.
