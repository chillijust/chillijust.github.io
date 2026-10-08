# 0047 · Der Jubel gehört dem ersten Mal

**Stand:** angenommen · 2026-08-09

## Ausgangslage

Gemeldet wurde: «Die Sets werden gemeistert, wenn ein Wort gemeistert wurde.» Am Gerät
ging das Jubelfenster «Set 1 gemeistert» auf, nachdem eine einzige Antwort richtig war.

Die Bedingung selbst war nie falsch. `setGeschafft(nr)` verlangt, dass **alle** Wörter
eines Sets `SATZ_STUFE` erreicht haben, und die Sets fassen neun bis zwölf Wörter. Falsch
war, wie oft die Bedingung greifen kann:

```js
if (aktuellesSet() !== setVorher && setGeschafft(setVorher)) uebGeschafftesSet = setVorher;
```

Ein Wort, das dreimal hintereinander falsch geschrieben wurde, fällt auf `SATZ_STUFE - 1`
([ADR 0033](0033-wer-schreibt-der-bleibt.md)). Damit ist sein Set wieder offen —
und wer es zurückholt, macht es ein zweites Mal voll. Aus Sicht des Nutzers: ein Wort
richtig, und das ganze Set feiert. Dasselbe galt für **Thema**, **Alphabet** und
**Grammatik**: Alle drei prüfen den Übergang eines einzelnen Stücks auf `BOX_MAX` und
zusätzlich, ob die Sammlung damit vollständig ist. Beides ist beliebig oft wiederholbar.

## Entscheidung

**Jede Auszeichnung wird genau einmal gefeiert.** `state.gefeiert` führt eine Merkliste
über Marken:

| Marke | Anlass |
| --- | --- |
| `set:3` | Lernset 4 vollständig auf `SATZ_STUFE` |
| `thema:Essen` | alle Wörter des Themas auf `BOX_MAX` |
| `abc` | alle 33 Buchstaben gemeistert |
| `regel` | alle Grammatikbausteine gemeistert |

`jubelEinmal(marke, anlass, werte, wege)` prüft, hakt ab und zeigt. `jubelSchon(marke)`
fragt nur — das Lernset braucht das, weil es sein fertiges Set in `uebPruefen()` merkt und
erst in `uebNext()` feiert.

**Was schon geschafft ist, gilt als gefeiert.** `jubelNachtragen()` läuft nach `load()`
und nach dem Einspielen einer Sicherung und setzt die Marken für alles, was der geladene
Stand bereits erreicht hat.

**Der leere Topf im Power-Training bleibt wiederholbar.** Er bekommt keine Marke.

## Begründung

Ein Jubel ist ein Fenster für das Seltene ([ADR 0044](0044-knopf-in-der-kachel-und-das-jubelfenster.md)).
Wer ein zurückgefallenes Wort wieder hochholt, hat sein Set nicht noch einmal geschafft —
er hat es **repariert**. Dafür gibt es die goldene Zeile, die schon da ist. Ein Fenster,
das sich für eine Reparatur öffnet, macht aus der Auszeichnung eine Quittung; genau die
Überlegung, mit der [ADR 0026](0026-gemeistert-tippen-klang.md) schon die
Meisterzeile auf den Übergang beschränkt hat. Der Übergang allein reicht hier nur nicht:
Er ist bei einer *Sammlung* wiederholbar, bei einem einzelnen Wort nicht.

**Das Power-Training ist keine Auszeichnung, sondern eine Aufgabe.** «Topf leer» heißt:
aufgeräumt. Der Topf füllt sich wieder, und dann ist das Aufräumen eine neue Leistung —
eine Marke würde die zweite Runde stillschweigend entwerten. Doppelt auslösen kann der
Anlass ohnehin nicht: Dazwischen müsste ein Wort gefallen sein, und dafür braucht es drei
Fehler.

**Das Nachtragen ist kein Beiwerk.** Ohne `jubelNachtragen()` bekäme jeder bestehende
Stand sein Fenster ein zweites Mal — sobald das erste gemeisterte Wort aufgefrischt wird.
Der Fehler wäre also genau bei denen aufgetreten, die am weitesten sind.

## Folgen

- `state.gefeiert` steht in `defaultState()`; «Fortschritt zurücksetzen» leert es mit,
  weil danach nichts mehr geschafft ist.
- **Der Sicherungscode führt die Marken nicht mit.** Er soll schlank bleiben, und sie
  lassen sich aus dem Lernstand herleiten — `jubelNachtragen()` tut das nach jedem
  Einspielen.
- `nurJubelmarken()` wirft Marken auf Sets und Themen weg, die es nicht mehr gibt. Die
  Set-Nummern hängen am Lehrplan: Kommen Vokabeln dazu, werden die Sets neu geschnitten,
  und eine Marke auf ein verschwundenes Set hielte einen Jubel zurück, der jemandem
  zusteht.
- Wer eine sechste Auszeichnung einführt, ruft `jubelEinmal()` statt `jubelZeigen()` und
  trägt sie in `jubelNachtragen()` **und** `nurJubelmarken()` nach. `jubelZeigen()` bleibt
  für das, was sich wiederholen darf.
