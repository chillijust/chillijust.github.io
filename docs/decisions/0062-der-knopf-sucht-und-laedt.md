# 0062 · Der Knopf sucht und lädt — er meldet nicht nur

**Stand:** angenommen · 2026-08-14 · aus einem Ticket
**Ergänzt:** ADR 0059 («Der Service Worker — die zweite Datei»)

## Ausgangslage

Seit 2.4.0 gibt es zwei Wege zu einer neuen Fassung: die Zeile unter dem Kopf («Jetzt
laden») und den Knopf in den Einstellungen unter «App». Der zweite war eine Sackgasse.

Er hieß «Nachsehen». Wer ihn drückte, bekam danach eine von vier Beschriftungen —
«Aktuell», «Kein Netz», «Nicht möglich» oder **«Neue Fassung bereit»**. Die letzte sah aus
wie ein Angebot. Sie war keins: Der Zuhörer am Knopf rief immer `swNachsehen()`, nie
`swUebernehmen()`. Wer darauf tippte, suchte bloß noch einmal.

Zusammen mit ADR 0059 ergab das eine Falle. Der Hinweis oben erscheint **einmal je
Sitzung** (`swStand.gemeldet`) — wer ihn wegtippt, hat entschieden. Danach war der Knopf
in den Einstellungen der einzige verbliebene Weg, und der führte nirgendwohin. Die neue
Fassung lag da und war unerreichbar bis zum nächsten Start.

Ein zweiter, leiserer Fehler steckte daneben: `reg.update()` meldet das Ende der
**Anfrage**, nicht das der Einrichtung. Der neue Worker steckt danach oft noch in
`installing`. Wer sofort urteilt, sagt «Aktuell» — und sieht die neue Fassung eine Sekunde
später von selbst als Hinweiszeile auftauchen.

## Entscheidung

**Der Knopf ist beides: Nachsehen und Übernehmen.** Drei Lagen, die er durchläuft, und
eine Tatsache, die er nur abbildet:

| | zeigt | ein Tipp bewirkt |
| --- | --- | --- |
| `ruhe` | «Suchen» (oder kurz das Ergebnis) | nachsehen |
| `sucht` | einen drehenden Ring | nichts |
| — | «Update», golden | übernehmen |
| `laedt` | einen wandernden Balken | nichts |

**Ob «Update» darauf steht, ist keine Lage**, sondern hängt an `swStand.wartet`. So heißt
der Knopf auch dann so, wenn man die Einstellungen frisch öffnet und längst eine Fassung
wartet — genau der Fall, der vorher ins Leere lief.

Ein Ergebnis ist **keine Beschriftung**: «Aktuell», «Kein Netz» und «Nicht möglich» stehen
gut zwei Sekunden da und treten wieder ab. Sonst stünde auf dem Knopf für immer etwas,
das man nicht drücken kann.

`swNachsehen()` wartet nach `update()` auf den `statechange` des installierenden Workers,
höchstens acht Sekunden.

## Begründung

### Warum zwei verschiedene Anzeigen

Suchen und Laden sind zwei Vorgänge mit verschiedenem Ausgang: Das eine kann ergebnislos
enden, das andere endet mit einem Neustart der App. Dieselbe Anzeige für beides hieße,
dass man am Bildschirm nicht sieht, worauf man gerade wartet. Der Ring dreht sich, der
Balken wandert — und der Balken sitzt auf dem goldenen Grund, den der Knopf beim Tippen
schon hatte. Es ist derselbe Vorgang, nicht ein neuer.

### Warum die Größe festgeschrieben ist

Der Knopf trägt fünf verschiedene Inhalte, «Nicht möglich» ist mehr als doppelt so breit
wie ein Ring. Ein Knopf, der unter dem Daumen die Breite wechselt, verschiebt alles
daneben — und der zweite Tipp geht daneben. `min-width` ist die Breite der längsten
Beschriftung; die Suite misst alle Lagen und verlangt **eine** Größe.

### Was sich nicht ändert

**Geladen wird nie von selbst.** Der Worker ruft weiterhin kein `skipWaiting()` beim
Einrichten; `swUebernehmen()` wird an genau zwei Stellen aufgerufen, und beide sind ein
Tipp des Nutzers. Die Suite zählt das nach.

**Ohne Netz kommt kein Urteil** (ADR 0052). «Kein Netz» bleibt eine eigene Antwort, nicht
ein stilles «Aktuell».

### Der Text daneben

Die Erklärung unter «Nach Aktualisierung suchen» endete mit «erscheint oben die Zeile zum
Laden — von selbst passiert nichts». Der erste Halbsatz stimmt weiter, führt aber vom
Knopf weg, der jetzt die Arbeit tut. Er ist ersetzt durch «heißt der Knopf «Update» —
geladen wird sie erst, wenn du ihn drückst»: gleiche Länge, gleiche Aussage über das
Nicht-von-selbst, richtiger Weg. Der Text bleibt über alle Lagen des Knopfes hinweg
unverändert; die Suite prüft auch das.

## Folgen

- Neu: `swKnopfLage`, `swKnopfMeldung`, `swKnopfUhr`, `swKnopfZeichnen()`,
  `swKnopfMelden()`, `swKnopfTippen()`. Der Zuhörer in `renderEinstellungen()` ist auf
  drei Zeilen geschrumpft und zeichnet beim Binden einmal.
- `swKnopfLage` und `swKnopfMeldung` sind Ansichtszustand und gehören nach ADR 0017 in
  `ansichtenZuruecksetzen()` — ein Ring, der nach dem Einspielen einer Sicherung
  weiterdrehte, wartete auf einen Rückruf, den es nicht mehr gibt.
- `swNachsehen()` ruft seinen Rückruf jetzt garantiert **genau einmal** (`raus`) — mit
  drei möglichen Auslösern (Zustandswechsel, Frist, Fehler) wäre alles andere ein Fehler,
  der sich als doppelte Meldung zeigte.
- Abschnitt E in der Suite `offline`, 18 Prüfungen, plus S17–S19 auf Dateiebene. Die
  DOM-Prüfungen stellen `swNachsehen`, `swVersionHolen` und `swUebernehmen` — über
  `file://` gibt es keinen Worker, und der Knopf soll trotzdem am echten DOM geprüft
  werden.
