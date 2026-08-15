# 0069 · Der Rückweg für Tickets, und der Bezug wird eine Wahl

**Stand:** angenommen · 2026-08-15 · aus vier Tickets (drei davon hier)
**Ergänzt:** ADR 0016 (Tickets verlassen das Gerät als Text), ADR 0061/0063 (die
Statuslampe)

## 1 · Tickets lassen sich einlesen

**Wunsch:** Ein Eingabefeld, in das kopierte Tickets eingefügt und ausgelesen werden.

Seit ADR 0016 verlassen Tickets das Gerät als Text zum Kopieren — und zwar nur in diese
Richtung. Wer sie auf ein zweites Gerät bringen oder eine Kopie zurückholen wollte, tippte
sie ab.

**Entscheidung:** `ticketsLesen(text)` liest **genau die Form**, die `ticketsAlsText()`
schreibt — kein allgemeiner Markdown-Leser, sondern der Gegenpart zu einer bekannten Form.
Erkannt werden die Überschrift (`## 3 · Fehler: …`), die Angaben darunter (`- Ort:`,
`- App-Stand:`, `- Erstellt:`, `- Geändert:`) und der Fuß, dessen Stand und Gerät für alle
gelten, die keinen eigenen tragen.

**Was nicht passt, wird übersprungen, nicht geraten.** Ein halb verstandenes Ticket wäre
schlimmer als keines: Es sähe aus wie ein echtes und wäre falsch. Findet der Leser gar
nichts, sagt die Oberfläche das und ändert nichts.

**Was schon da ist, bleibt.** `ticketsUebernehmen()` erkennt Bekanntes an Titel und
Erstellzeit (auf die Minute genau) — derselbe Text zweimal eingefügt verdoppelt die Liste
nicht. Das ist wichtiger, als es klingt: Der wahrscheinlichste zweite Griff ist der, bei
dem man nicht mehr weiß, ob der erste geklappt hat.

Das Feld sitzt unter der Liste, zugeklappt hinter einer Zeile — dieselbe Gestalt wie
«Alle Übungen» auf der Übersicht. Es steht **auch im Leerzustand** da: Genau dort, auf
einem frischen Gerät, braucht man es.

## 2 · Der Statustext verschwindet halb so schnell

`NETZ_FRIST` von 4200 auf 8400 ms, und das Einklappen selbst von einer halben auf eine
ganze Sekunde. «Halb so schnell verschwinden» meint beides — später anfangen und
gemächlicher zugehen.

## 3 · Der Bezug ist eine Wahl, kein Haken

**Wunsch:** Statt des Hakens «Betrifft Übersicht» eine Auswahl, um auch andere Seiten zu
kennzeichnen; vorgewählt die aktuelle.

Der Haken konnte nur bestätigen oder verneinen, was die App ohnehin schon wusste: die
Seite, über der man stand. Wer erst beim Schreiben merkt, dass es eigentlich um eine
andere ging, musste dorthin zurückgehen und von vorn anfangen.

**Entscheidung:** Eine Reihe aus Chips — «Keine» und alle vierzehn Seiten, in der
Reihenfolge der App. Vorgewählt ist beim frischen Entwurf die Seite, über der das Blatt
steht; ein angefangenes Ticket behält seine Wahl.

### Kein Klappmenü — und wie der Prüfstand das durchsetzt

Der erste Anlauf war ein `<select>`. Das war falsch, und zwar nachweislich: Die Suite
`filter` liest den Quelltext und verlangt **null** davon. Auf iOS ist ein Klappmenü ein
Rädchen, das die halbe Seite verdeckt; die App zeigt Auswahlen sonst überall offen.

Die Regel ist so streng, dass die Prüfung auch im **Kommentar** anspringt — der musste
umformuliert werden. Das ist keine Übertreibung: Ein Wort im Quelltext ist ein Wort im
Quelltext, und eine Prüfung, die zwischen Absicht und Erwähnung unterscheiden wollte,
prüfte bald gar nichts mehr. Bei der Gelegenheit ist die tote CSS-Regel für `select`
entfallen.

**Ein Nebenfund, der teurer war als das Ticket:** Die Suite brach mit `process.exit(1)`
ab. CLAUDE.md warnt davor seit ADR 0059 — ein Ausstieg beim Bauen beendet den **Läufer**,
nicht die Suite. Der Lauf endete kommentarlos nach «fertig», ohne Ausgabe und ohne Grund;
die übrigen 25 Suiten liefen gar nicht mehr. Jetzt wirft sie. Der Fehler lag seit jeher
dort und wurde erst sichtbar, als die Prüfung zum ersten Mal ansprang.

## Folgen

- Neu: `ticketsLesen()`, `datumLesen()`, `ticketsUebernehmen()`, `tkImportHtml()`,
  `tkImportOffen`, `tkImportMeldung`, `meldeSeiten()`, `meldeBezugHtml()`,
  `meldeBezugText()`, `meldeBezugWahl`.
- Fort: `meldeBezugAn`, `meldeBezugName`, die CSS-Regel `select`.
- `tkImportOffen` und `tkImportMeldung` sind Ansichtszustand und gehören nach ADR 0017 in
  `ansichtenZuruecksetzen()`.
- Neu: Abschnitt Y in `tickets` (16 Prüfungen), F3b–F3d und F9b ebendort.
