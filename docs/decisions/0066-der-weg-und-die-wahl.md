# 0066 · Die Reihenfolge ist der Weg, die Empfehlung eine Leiter

**Stand:** angenommen · 2026-08-15 · aus zwei Meldungen
**Ergänzt:** ADR 0045 (Gruppen auf Home), ADR 0051 (das Tutorial), ADR 0065 (ein Weg
statt einer Wand)

## 1 · Die Gruppen waren nach Pflicht sortiert, nicht nach Weg

**Befund:** «Sollte man nicht mit Buchstaben anfangen — dann Wörter, danach Grammatik und
Sätze?»

**Ja. Und die App sagte es selbst schon.** Der neunte Tutorial-Schritt lautet seit jeher:
«Kurz gesagt: Buchstaben, dann Lernsets, dann Tippen und Übersetzen.» Die Übersicht
widersprach ihm: Dort standen «Buchstaben» und «Grammatik» ganz unten unter
**«Freiwillig»**.

Der Fehler war die Sortierachse. Die Gruppen ordneten nach *Pflicht* — zählt es in Serie
und Fortschritt? —, nicht nach *Weg*. Für die Buchhaltung ist das richtig; für jemanden,
der die App aufschlägt, ist es die falsche Frage.

**Entscheidung:** Drei Gruppen, und ihre Reihenfolge **ist** der Lernweg:

| | |
| --- | --- |
| **Zeichen** | Buchstaben |
| **Wörter** | Lernsets · Freestyle · Tippen · Schreibung · Power-Training |
| **Sätze** | Grammatik · Übersetzen |

«Freiwillig» als Gruppe entfällt. Dass etwas freiwillig ist, sagt jetzt die Kachel selbst
— «Buchstaben» tat es ohnehin schon, «Grammatik» sagt es seit dieser Fassung mit. Eine
eigene Schublade dafür kostete den Lernweg.

## 2 · Die Empfehlung fragte nach der Vergangenheit

**Befund:** «Die Kachel mit ‹Weiter mit› achtet nur darauf, welche Übung zuletzt aktiv
war und weniger darauf, was als Nächstes zu tun ist.»

**Ursache:** Die erste Zeile von `empfehlung()` war die Fortsetzung. Solange in der
zuletzt benutzten Übung *irgendetwas* zu tun war, blieb die Karte dort — zwei Stunden
lang. Wer eine Runde Freestyle gespielt hatte, bekam Freestyle, auch wenn zwölf Wörter
zurückgefallen waren und keiner der 33 Buchstaben saß.

**Entscheidung:** Eine **Leiter** (`empfLeiter()`), von oben nach unten:

| | Sprosse | Grund |
| --- | --- | --- |
| 1 | **Power-Training** | ab `PT_MINDEST` zurückgefallenen Wörtern — sie blockieren ihre Sätze |
| 2 | **Buchstaben** | solange keiner sitzt und weniger als `ABC_ZUERST_BIS` Wörter gemeistert sind |
| 3 | Tippen / Übersetzen | ab `AUFFRISCHEN_AB` überfälligen Dingen |
| 4 | **Lernsets** | offene Wörter im laufenden Set — der Hauptweg |
| 5 | Grammatik | Sätze offen, aber noch keine Regel entdeckt |
| 6 | Übersetzen | freigeschaltete Sätze |
| 7 | Tippen | Wörter, die fast sitzen |
| 8 | Freestyle | die Kür, wenn alles erledigt ist |

**Die ersten beiden Sprossen sind Defizite** — etwas ist kaputtgegangen oder fehlt an der
Wurzel. Sie tragen `dringend: true` und **stechen die Fortsetzung**. Alles darunter sind
Angebote; dort gewinnt weiterhin «Weiter mit …», wenn man vor weniger als zwei Stunden
dort war. Eine Sitzung mittendrin abzubrechen hilft niemandem.

### Drei Zahlen, und warum sie nicht in den Einstellungen stehen

`ABC_ZUERST_BIS` (40 gemeisterte Wörter), `AUFFRISCHEN_AB` (5 überfällige Dinge),
`GRAMMATIK_AB_SET` (ab dem zweiten Set). Das ist Didaktik, keine Vorliebe — ein Schalter
dafür wäre die Frage «wie soll ich lernen?» an den, der es gerade lernt.

Die zweite Sprosse hat bewusst eine **Obergrenze**: Wer vierzig Wörter gemeistert hat,
hat den Beweis erbracht, dass er liest. Eine Ermahnung wäre dann Bevormundung.

### Was die Karte jetzt sagt

Jede Sprosse nennt ihren **Grund**. Die Karte sagt damit nicht nur wohin, sondern warum —
das ist der ganze Unterschied zwischen einem Vorschlag und einer Ansage. Der Untertitel
trug bei der Fortsetzung bisher «Du warst gerade dort»; das wiederholte nur, was die
Überschrift schon sagte. Jetzt steht dort, **was wartet**.

### Ein Fall, den die Leiter nicht kennt

Die Fortsetzung fragt **die Übung selbst**, nicht die Leiter: Auch was dort nicht vorkommt
— «Buchstaben» für jemanden, der längst Sätze baut — darf man fortsetzen. Nur leer oder
gesperrt darf es nicht sein. Ohne diese Ausnahme wäre jemand, der bewusst Buchstaben übt,
nach jedem «Zurück» woanders gelandet.

## 3 · Die Kacheln sind wählbar

**Wunsch:** Der Nutzer soll entscheiden, welche Kacheln die Übersicht zeigt.

**Entscheidung:** Ein Schalter je Übung unter **Einstellungen → Darstellung**. Es geht
darum, was zu sehen ist — darum dort und nicht bei «Lernweg».

**Gespeichert wird, was weg ist** (`settings.homeAus`), nicht was da ist. Der Unterschied
zählt bei der nächsten Übung, die dazukommt: Sie taucht bei einem bestehenden Gerät von
selbst auf, statt still zu fehlen, weil sie in einer alten Liste nicht vorkam. Die
Vorgabe ist die leere Liste — alles sichtbar.

**Was ausgeräumt ist, wird auch nicht empfohlen.** Jemandem etwas vorzuschlagen, das er
weggeräumt hat, wäre Widerspruch statt Rat.

**Aber nicht vor dem Scheinwerfer:** Solange das Tutorial läuft, stehen alle acht da.
Acht seiner dreizehn Schritte zeigen auf je eine Kachel, und ein Wähler, der ins Leere
zeigt, ist ein stiller Fehler (ADR 0051). `kachelSichtbar()` fragt darum zuerst `tutOffen`.

**Nicht im Sicherungscode.** Was einer auf seinem Gerät sehen will, ist kein Lernstand —
dieselbe Überlegung wie bei `state.tempo` und `state.verwechselt`. Wer eine Sicherung
einspielt, behält seine eigene Auswahl.

## 4 · Ein Fund nebenbei: zwei gleiche Antworten

Beim letzten Lauf vor der Auslieferung wurde `buchstaben` C4 rot — **nicht wegen dieser
Änderung**. Drei Wiederholungen liefen grün; die Prüfung war flatterhaft.

Dahinter steckte ein echter Fehler. Die Ablenker im Buchstabenquiz werden gegen die
**richtige** Antwort abgeglichen (`x[2] === b[2]` fällt weg), aber nicht **untereinander**.
Vier Buchstaben teilen sich zwei Laute — ж und ш beide «sch», з und с beide «s». Trafen
zwei davon zusammen, standen zwei gleich beschriftete Antworten da, und die Frage war
nicht mehr zu beantworten. Bei drei Ablenkern aus 31 Kandidaten passiert das selten genug,
dass es lange durchrutschte.

Die Ablenker werden jetzt einzeln genommen und jeder Laut nur einmal. Und **die Prüfung
fragt hundert Fragen statt einer**: Eine Prüfung, die nur ab und zu anspringt, meldet
nicht einen Fehler, sondern Glück.

## Folgen

- Neu: `empfLeiter()`, `kachelSichtbar()`, `kachelWahl()`, `settings.homeAus`,
  `ABC_ZUERST_BIS`, `AUFFRISCHEN_AB`, `GRAMMATIK_AB_SET`.
- Eine Gruppe, aus der alles ausgeräumt ist, bekommt keine Überschrift über nichts.
- Sechs Suiten trugen die alte Reihenfolge als Zeichenkette. Zwei prüften die alte
  Empfehlung: `patzer` I1 erwartete «Lernsets» für einen frischen Lernstand — jetzt sind
  es die Zeichen, und genau das war der Punkt.
- Neu: Abschnitte Y (7 Prüfungen) und X (12) in `rubriken`.
