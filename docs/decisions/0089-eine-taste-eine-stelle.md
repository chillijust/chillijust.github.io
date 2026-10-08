# 0089 · Eine Taste, eine Stelle

**Stand:** angenommen · 2026-08-16 · aus einem Ticket
**Ergänzt:** ADR 0068 (die Schreibmarke gehört ins Feld) · ADR 0088 (die
Tippaufgabe in «Lernsets»)

## Ausgangslage

**Befund:** «Die eingeblendete Tastatur spinnt. Wenn man Zurück/Entfernen
drückt, wird etwas eingefügt.»

Mein Fehler aus 0088, und ein banaler. `tastaturHtml()` schreibt die Rücktaste
als `data-…key="BS"`. Der neue Binder in «Lernsets» las:

```js
uebEingabe = t === '<' ? uebEingabe.slice(0, -1) : uebEingabe + t;
```

`'<'` gibt es nirgends. Jeder Druck auf die Rücktaste hängte darum die zwei
Buchstaben **BS** an den Text.

## Die eigentliche Ursache

Die falsche Zeile ist nur der Anlaß. Der Grund: **Sieben Ansichten binden
dieselbe Tastatur, und jede schrieb ihre eigene Zeile dafür.** Sechs davon
waren richtig — was nichts beweist, sondern nur bedeutet, daß sechsmal
abgeschrieben wurde und einmal nicht.

*Ein Wert, den sieben Stellen kennen müssen, gehört keiner davon.*

**Entscheidung:**

```js
function kbAnwenden(text, taste) {
  return taste === 'BS' ? String(text).slice(0, -1) : String(text) + taste;
}
```

Alle sieben rufen sie. Was «BS» bedeutet, steht neben der Funktion, die es
schreibt — eine achte Tastatur kann den Fehler nicht wiederholen.

## Was die Prüfung dazu gefunden hat

Die neue Prüfung fragt **den Quelltext**, nicht eine Liste: Zu jedem
`dataset.…key` muß in den nächsten Zeilen `kbAnwenden` stehen. *Eine Prüfung,
die sechs Binder aufzählt, mißt über den siebten hinweg.*

Und genau das tat sie: Sie meldete `dataset.ptkey` — das Power-Training, das
ich beim Umstellen übersehen hatte. Ich kannte sechs Binder; es waren sieben.

Zwei Fallen beim Schreiben dieser Prüfung, beide lehrreich:

- **Sie fand sich selbst.** Ihr eigener Wähler steht als Text im Quelltext der
  Seite, in die sie injiziert wird. Sie sieht jetzt nur den App-Teil.
- **Ein Einschub landete in einer inneren `try/catch`-Funktion** und wurde
  still verschluckt — die Suite blieb grün und hatte 24 statt 33 Prüfungen.
  *Eine Suite, deren Prüfungszahl sich nicht ändert, hat nichts Neues geprüft.*

## Folgen

- `tastatur` AA1–AA9 (die Tastatur in «Lernsets», Verhalten) und AB1/AB2
  (alle Binder gehen durch dieselbe Hand, gemessen am Quelltext).
- Der Abgabeknopf folgt der Eingabe auch über die eingebaute Tastatur — sonst
  bliebe er gesperrt, obwohl etwas dasteht.
