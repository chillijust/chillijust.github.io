# 0091 · Der Lernweg wird schlanker

**Stand:** in Arbeit · 2026-08-21 · aus einem Vorhaben des Nutzers
**Ändert:** ADR 0056 (das Tagesmaß) · ADR 0015 (fertig heißt raus) ·
ADR 0074 (die Null im Zähler) · ADR 0090 (Fertigwerden vor Auffrischen)

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

## 2 · Das Auffrischen kommt raus (2.8.0)

**Ausgangslage:** Die Einstellung «Auffrischen nach» (0–365 Tage, Vorgabe 21)
entschied allein, wann ein gemeistertes Wort noch einmal drankam. Sie trug
einen ganzen Apparat: die Stapel «Wiederholung» in «Tippen» und «Übersetzen»,
vier Leerzustände mit Terminversprechen, einen Selbstwechsel zwischen den
Stapeln, eine Empfehlungsstufe «Erst auffrischen» und die Zählermechanik.

**Entscheidung:** Weg — und zwar der Apparat, nicht nur der Schalter.
`intervallFuer(BOX_MAX)` ist jetzt fest `Infinity`.

### Begründung

**Gemeistert soll etwas heißen.** Fünf Kontakte, davon drei getippte in Folge
(ADR 0086/0088), sind eine ernsthafte Hürde. Was sie nimmt, ist fertig; es dann
alle drei Wochen wieder vorzulegen behandelt den Nutzer wie jemanden, der seinem
eigenen Können nicht trauen darf.

**Der Weg zurück bleibt offen.** «Alle» steht in beiden Übungen und liefert den
ganzen freigeschalteten Bestand. Wiederholen ist jederzeit möglich — es wird nur
nicht mehr **verlangt**. Das ist genau die Linie von ADR 0048: Üben können hängt
nie an einem Datum.

**Die Leiter darunter bleibt unangetastet.** `INTERVALL` trägt weiter 0 · 1 · 3 ·
7 Tage. Sie zur Diskussion zu stellen hieße, das Leitner-System selbst zu
verstellen — das war schon 2026-08-02 die Begründung (ADR 0015), und sie gilt.

### Was daran hing, ohne daß es jemand sagte

**Der Selbstwechsel zwischen den Stapeln.** Er hatte genau einen Grund: einen
leeren Lernstapel neben einem vollen Wiederholungsstapel. Ohne den zweiten ist
er sinnlos — und er verschluckte die Meldung «Alles getippt», die eine echte
Auskunft ist. Fünf Prüfsuiten stützten sich unbemerkt darauf: Sie setzten alle
Wörter auf `BOX_MAX` und bekamen ihre Aufgabe über den Wechsel. Jetzt steht dort
der Leerzustand — richtig so, und der Knopf «Trotzdem festigen» ist der Ausgang.

**Die Zählermechanik.** `ZAEHLER`, `zaehlerSchritt()`, `zaehlerAnzeige()`,
`zaehlerFrischen()`, `zaehlerHalten()`, `zaehlerLoslassen()`, die
Dokument-Zuhörer, der Baustein in `renderEinstellungen()`, das CSS und die
Symbole `ICON.minus`/`ICON.plus` — alles existierte nur für diese beiden
Einstellungen. Mit ihnen ist es weg. *Wer wieder einen Zähler braucht, baut ihn
neu; toter Code, den man wiederbelebt, ist keine Ersparnis.*

**Die Hälfte von ADR 0090.** «Fertigwerden geht vor Auffrischen» sortierte
innerhalb des Fälligen die unfertigen Wörter nach vorn. Seit die Endstufe nie
mehr fällig wird, **ist alles Fällige unfertig** — die Sortierung war toter Code
geworden.

Aber die Sorge dahinter blieb, nur an anderer Stelle. Die Messung zeigte es:

```
zehn gemeisterte Wörter, zwei unfertige, nichts fällig
von 100 Ziehungen trafen 27 ein fehlendes Wort
```

Vor Etappe 2 waren es 62. **Eine Reparatur, die eine Regression einführt, ist
keine.** Der Grund: Ohne Fälliges und ohne Neues fiel die Auswahl auf den
gesamten Vorrat zurück, und die zwei fehlenden Wörter gingen unter zehn
gemeisterten unter.

Also ein neuer Zweig, **Unfertiges vor Fertigem**:

```
von 100 Ziehungen trafen 50 ein fehlendes Wort
```

Die 50 sind **strukturell, nicht zufällig**: Das Muster lautet A · B · Pause ·
Pause, weil die Dreiersperre aus ADR 0090 nach zwei Treffern beide aussperrt.
Zufällig wären es 17. Beides zusammen ist genau richtig — die fehlenden Wörter
kommen dran, aber nicht als Dauerschleife.

### Der Sicherungscode

Die Frist stand als drittes Feld im Einstellungsblock. **Die Stelle bleibt als
Platzhalter `-` stehen**, wie schon Darstellung und Farbton seit ADR 0039 — sonst
rutschte das Schema dahinter, und ein älterer Code färbte die App um. Ein Code
von damals trägt dort eine Zahl; sie wird **überlesen, nicht geraten**.
Geprüft wird das mit einem echten alten Code, dessen Prüfsumme neu gerechnet
wird — nicht mit einem, der am Prüfsummenschutz scheitert und dann den
Fehlerpfad statt den Fall prüfte.

### Folgen

- `wiederholung` A–J vollständig neu; W1–W3 auf die neue Lage umgeschrieben,
  W4–W7 (die Tippfolge) unberührt. `filter` F1/F1b/F2/F3, `lernweg` D3/D4/D4b,
  `sicherung` B6/B6b, `strenge` G8, `grinden` B3/D1/D5, `fertig` A0/A5/A6/C2,
  dazu `enter`, `marken`, `tastatur`, `zeichen` auf den Weg über «Alle».
- Eine neue Prüfung liest **alle fünf** Übungen mit Leerzustand daraufhin ab, ob
  irgendwo noch ein Wiedersehen versprochen wird (`wiederholung` I1). Die vier
  Stellen aus ADR 0074 waren es nicht mehr allein — «Buchstaben», «Grammatik»
  und «Schreibung» sagten «ruhen bis zur nächsten Auffrischung».
- Der Prüfstand steht bei 2420 Prüfungen (von 2440). Die Differenz ist
  gerechnet: −23 aus der neu geschriebenen Suite, +3 neue anderswo.
