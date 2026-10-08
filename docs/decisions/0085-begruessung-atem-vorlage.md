# 0085 · Drei Tickets — Begrüßung, Atem, Vorlage

**Stand:** angenommen · 2026-08-16 · aus drei Tickets
**Ändert:** ADR 0051 (dreizehn Schritte) · ADR 0083 (Tempo und Deckung des
Atems) · ADR 0016 (was in der Kopiervorlage steht)

## 1 · Die Heimspur wird kurz und allgemein

**Befund:** «Das Tutorial in der Übersicht ist zu lang. Wir lassen die
einzelnen Übungen raus und halten es allgemein, maximal sieben Erklärungen —
dafür sind die speziellen Tutorials in den Übungen da. Die Begrüßung am Anfang
fehlt.»

Dreizehn Schritte, acht davon je eine Übungskachel — das war die Heimspur, als
es noch keine Übungsspuren gab (ADR 0079 hat sie nachgeliefert). Seitdem sagte
sie dasselbe zweimal, nur ungenauer.

**Entscheidung:** Sieben Schritte, keiner davon auf einer Kachel:

| | Ziel | Was es sagt |
| --- | --- | --- |
| 1 | `#homeEmpf` | was gerade dran ist |
| 2 | `#homeAlleKnopf` | die Ordnung Zeichen · Wörter · Sätze **ist** der Weg |
| 3 | `.kopf-rail` | was «gemeistert» kostet |
| 4 | `#filterKnopf` | der Trichter, in jeder Übung derselbe |
| 5 | `#menuKnopf` | was hinter den drei Strichen liegt |
| 6 | `#meldeKnopf` | wie man etwas meldet |
| 7 | `#tutRund` | wie man hierher zurückkommt |

**Die Begrüßung steht in der Frage davor** (`TUT_FRAGE.home`), nicht als
achter Schritt: Dort gibt es kein Ziel, und eine Vorstellung leuchtet nichts
an. Sie stellt die Chili vor — im Ton des Nutzers, trocken.

*Nebenbefund, nicht behoben:* `TUT_FRAGE` steht im Code, während die Schritte
in `data/tutorial.json` liegen. Beides ist Inhalt; die Frage gehört auf Dauer
in dieselbe Datei.

## 2 · Ein Scheinwerfer braucht eine Bühne

**Befund:** «In der letzten Seite wird gesagt, dass der ?-Knopf oben angezeigt
wird. Dieser wird aber nicht hervorgehoben.»

Richtig, und zwangsläufig: `#tutRund` erscheint erst, wenn `tutorialFertig`
gesetzt ist — und das wird es **nach** dem letzten Schritt. Der Schritt kündigte
also etwas an, das es in diesem Augenblick nicht gab. Der Scheinwerfer fand ein
Rechteck der Breite null.

**Entscheidung:** Solange dieser Schritt steht, ist der Knopf da. Dieselbe
Ausnahme, mit der im Tutorial auch alle Kacheln stehen (ADR 0051): *Was der
Scheinwerfer zeigen soll, muß sichtbar sein — die Bedingungen des Alltags
gelten im Tutorial nicht.*

Dazu gehört, daß `tutZeichnen()` den Kopf **vor** dem Messen neu zeichnet. Wer
erst mißt und dann zeichnet, mißt die Vergangenheit.

## 3 · Der Atem, schneller und heller

**Befund:** «Das Aufleuchten darf 30 % schneller und 20 % heller sein.»

3,9 s statt 5,6 s; die Deckung von `.12` auf `.144` und von `.35` auf `.42`.
Beides auf Ansage — hier gibt es nichts zu entscheiden außer der Frage, ob es
noch dezent bleibt, und das tut es.

## 4 · Was niemand liest, gehört nicht in die Vorlage

**Befund:** «Ich würde gerne unnötige Ticket-Infos aus der Kopiervorlage
entfernen. Wir können den Geräteteil löschen. Das Erstelldatum ist glaube ich
auch irrelevant.»

Stimmt für beide: Das Gerät ist seit jeher dasselbe, und wann eine Meldung
getippt wurde, hat noch nie eine Entscheidung geändert.

**Entscheidung:** Beide verlassen die Vorlage — und mit dem Erstelldatum auch
das Änderungsdatum. Eine Zeile «Geändert» ohne «Erstellt» wäre ein Datum ohne
Bezug.

**In der App bleiben beide stehen.** Sie ordnen die Liste und erkennen
Doppelte. Und **`ticketsLesen()` versteht sie weiterhin**: Ältere kopierte
Texte tragen sie noch, und wer eine alte Kopie einspielt, soll nichts
verlieren. *Ein Leser darf mehr verstehen, als der Schreiber schreibt — das
Gegenteil wäre ein Bruch.*

Die Doppelerkennung war darauf schon vorbereitet: Ohne Datum entscheidet der
Titel allein.

## Folgen

- `tutorial` A1/A1b (sieben Schritte, keine Kachelziele), O1–O4 (der letzte
  Schritt und seine Bühne), B9 mißt die Dauer jetzt als Bereich statt als Zahl.
- `tickets` D4/D4a/D5/D5c, F27/F27b, Y6b (eine alte Vorlage wird weiter
  verstanden).
- `rubriken` Z12 prüfte den Aufklapp-Mechanismus an einem Schritt, den es nicht
  mehr gibt. Sie setzt sich ihr Ziel jetzt **selbst**: *Eine Prüfung, die auf
  einen zufällig passenden Inhalt angewiesen ist, wird still, sobald der Inhalt
  sich ändert.*
