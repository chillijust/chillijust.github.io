# 0091 · Der Lernweg wird schlanker

**Stand:** in Arbeit · 2026-08-21 · aus einem Vorhaben des Nutzers
**Ändert:** ADR 0056 (das Tagesmaß)

Ein Umbau in Etappen, jede für sich abgenommen. Dieser Eintrag wächst mit;
was hier steht, ist entschieden und ausgeliefert.

## 1 · Das Tagesmaß kommt raus (2.8.0)

**Ausgangslage:** Die Einstellung «Neue Wörter am Tag» (Vorgabe 8, Bereich
0–30) war die einzige Bremse für neues Material. Sie griff an genau einer
Stelle — `uebVorrat()` schnitt den Vorrat von `waehleWort()` auf das zurecht,
womit schon einmal gearbeitet worden war.

**Entscheidung:** Weg. Einstellung, Zähler, `state.neuHeute`, `heuteNr()`,
`neuGezaehlt()`, `tagesmassVoll()`, `uebVorrat()`, der Leerzustand «Das
Tagesmaß ist erreicht» samt seinen beiden Ausgängen und der Kachelzustand
`{ text: 'Tagesmaß erreicht', leer: true }`.

### Begründung

**Eine Zahl, die den Übungswillen bremst, ist eine Meinung über den Nutzer.**
Der Gedanke dahinter war richtig — vierzig neue Wörter an einem Abend kommen
drei Wochen später alle am selben Tag zurück. Nur ist das eine Vorhersage über
jemanden, der gerade Lust hat, und die App weiß es nicht besser als er.

Sie stand außerdem quer zu ADR 0048 («Üben können hängt nie an einem Datum»).
Dort wurde entschieden, daß ein Kalendertag kein Grund ist, eine Übung
zuzuhalten — das Tagesmaß tat genau das, nur an einer anderen Stelle. Zwei
Regeln, die sich widersprechen, sind eine zu viel.

**Der Ersatz ist keiner, und das ist Absicht.** Erwogen war, die Bremse an die
tatsächliche Last zu hängen («Neues erst, wenn nichts Fälliges mehr wartet» —
die Standardempfehlung der Wiederholungsliteratur). Auf Ansage des Nutzers:
nichts bremst. Wer sich übernimmt, merkt es am nächsten Tag selbst; das ist
eine ehrlichere Rückmeldung als ein Riegel, der vorher zuschnappt.

### Was die Prüfung festhält

Die Suite `strenge` prüfte das Maß in zwölf Schritten. An ihre Stelle treten
fünf, und sie prüfen nicht das Fehlen einer Einstellung — das wäre eine Aussage
über den Quelltext —, sondern **daß der Vorrat ungeschnitten bleibt**:

- Vierzig neue Wörter an einem Tag sind erlaubt (`E2`).
- Und danach liefert `waehleWort()` **weiter Neues** (`E3`). Das ist der Kern:
  Mit Tagesmaß kam hier ausschließlich Bekanntes. Die Prüfung ist
  deterministisch — frisch Gelerntes ist einen Tag lang nicht fällig, also
  zieht die Auswahl ohne Losentscheid aus dem Unbekannten.
- Die Kachel meldet kein Maß mehr (`E4`), und die Übung gibt weiter eine
  Aufgabe her (`E5`).
- `A6` hält fest, daß ein **gespeichertes** Tagesmaß aus einem alten Stand
  wegfällt, statt still weiterzuwirken: `mergeState()` übernimmt nur Schlüssel,
  die es in der Vorgabe noch gibt.

`G1` fragt nicht mehr, wie viele Zähler auf dem Lernweg stehen, sondern **ob
einer davon das Tagesmaß trägt** — eine Prüfung, die aufzählt, mißt über jeden
neuen Zähler hinweg (die Lehre aus ADR 0086).

### Folgen

- `neuHeute` fiel aus der Aufzählung «gehört zum Gerät, nicht in den
  Sicherungscode». Es stand dort nie drin; die Prüfung `H2` entfällt mit ihm.
- Der Prüfstand sank von 2451 auf 2440 Prüfungen. Die Differenz ist gerechnet
  und geht auf: sieben aus `E`, drei aus `G`, eine aus `H`. **Die Zahl im Titel
  ist ein Messwert** — sinkt sie ohne Rechnung, ist eine Prüfung verschwunden.
