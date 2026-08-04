# 0025 · Sechs Tickets vom Gerät

**Status:** angenommen · 2026-08-04

## Kontext

Sechs Meldungen aus der App, teils zusammenhängend: Die Buchstabenübung startete auf der
Tafel statt im Üben. Das Meldeblatt ließ sich in alle Richtungen schieben, schloss dabei
nie und warf den Entwurf beim Abbrechen wortlos weg. Vorhandene Tickets ließen sich nicht
ändern. Beim Neuladen blitzte die Chili neben dem Menüknopf auf. Der Sicherungscode
steckte als Anhang unter der Bilanz. Und die Aussprache gab es nur an einer Stelle.

## Entscheidung

1. **Buchstaben starten im Üben.** Die Tafel bekommt einen eigenen runden Knopf links
   neben der Auswahl und verlässt das Auswahlpanel.
2. **Das Meldeblatt zieht nur nach unten** und schließt ab 90 px; ein Tipp daneben
   schließt ebenso. **Zuklappen wirft nichts weg** — der Entwurf bleibt, bis «Abbrechen»
   gedrückt wird. Ein liegen gebliebener Entwurf zeigt sich am schwebenden Knopf.
3. **Tickets sind änderbar.** Ein Tipp auf die Zeile holt das Ticket ins Blatt zurück;
   `ticketAendern()` behält `erstellt`, setzt `geaendert` und macht das Ticket wieder
   offen.
4. **Die Chili wird erst sichtbar, wenn sie steht** (`visibility: hidden` bis
   `body.chili-steht`).
5. **Die Sicherung ist ein eigener Menüpunkt** zwischen Bilanz und Einstellungen, samt
   Zurücksetzen. Die Bilanz behält nur einen Verweis.
6. **Vorlesen überall**: `speak(text, sprache)` kann Deutsch und Russisch, `hoerknopf()`
   erzeugt die Knöpfe, ein einziger Zuhörer auf `#main` bedient sie alle.

## Begründung

**Ein Nachschlagewerk ist kein Filter.** Die Tafel im Auswahlpanel zu führen behauptete,
sie sei eine Einstellung der Übung — dabei ist sie ein zweiter Ort. Als eigener Knopf ist
sie einen Tipp entfernt statt zwei, und der Filter enthält wieder nur, was die Frage
beeinflusst. Der Knopf färbt sich eisblau, nicht golden: Gold heißt in dieser App «etwas
weicht vom Regelfall ab», hier geht es um «hier stehen Sie».

**Nach oben führt kein Weg.** Ein Blatt, das sich in alle Richtungen schieben lässt,
verspricht vier Ausgänge und hat einen. Nur nach unten nachzugeben ist ehrlicher — und
macht das Schließen durch Ziehen erst möglich, ohne dass man raten muss, welche Richtung
zählt.

**Zuklappen und Wegwerfen sind zwei verschiedene Dinge.** Das war der eigentliche Fehler
der alten Fassung: Weil Ziehen nicht schließen durfte, musste jeder Ausgang löschen. Sind
beide getrennt, darf das Blatt großzügig zugehen — der Entwurf hält. Der goldene Punkt am
Knopf ist die Gegenleistung dafür: Was liegen bleibt, muss man sehen, sonst ist es
vergessen statt aufgehoben.

**Ein geändertes Ticket ist wieder offen.** Sonst führte man eine Fassung als übergeben,
die es so nicht mehr gibt. `erstellt` bleibt dagegen stehen: Die Nummerierung im
gebündelten Text folgt der Reihenfolge, in der die Dinge aufgefallen sind — Nachbessern
soll sie nicht durcheinanderbringen.

**Das Aufblitzen war kein Sprung, sondern ein Bild vor dem ersten Renderlauf.** Die
Reihenfolge im Skript war schon richtig (ADR 0021); der Browser zeichnet den Kopf aber,
bevor das Skript am Ende des Body läuft. Dagegen hilft nur, die Figur bis zur ersten
Platzierung unsichtbar zu halten. `visibility` statt `opacity` oder `display`, weil die
Lage messbar bleiben muss — `chiliLage()` braucht ein Rechteck.

**Der Sicherungscode gehört nicht unter die Bilanz.** Die Bilanz beantwortet «wie weit
bin ich», die Sicherung «wie hole ich das hier weg». Das eine ist Lesen, das andere ein
Eingriff. Das Zurücksetzen steht bei der Sicherung, weil es dieselbe Frage von der
anderen Seite ist — und weil der Code danebensteht, der es auffängt.

**Ein Zuhörer statt vieler Knöpfe.** Die alte Lösung verdrahtete `#speakBtn` und
`#trSpeak` nach jedem Renderlauf einzeln. Bei acht Stellen wäre das achtmal dieselbe
Zeile, die man beim nächsten Umbau vergisst. Der Text am Knopf und ein Zuhörer am
gleichbleibenden `#main` machen jede weitere Stelle kostenlos.

**Vor der Abgabe schweigt, was die Antwort wäre.** In «Tippen» ist das russische Wort
erst nach dem Prüfen zu hören, in «Buchstaben» der Laut erst nach der Auflösung. Ein
Hörknopf, der die Lösung vorspricht, ist kein Hilfsmittel, sondern eine Abkürzung.

## Folgen

- `meldeBearbeitet` und `meldeBezugName` sind neuer Zustand und gehören nach ADR 0017 in
  `ansichtenZuruecksetzen()`; ebenso `backupOpen`, `backupMsg`, `confirmReset` und
  `tkAusgabe`, die dort bisher fehlten.
- Das Menü hat vier Einträge statt drei; Testreihen, die drei erwarteten, wurden
  nachgezogen.
- Die Zeile in der Ticketliste ist jetzt ein `<button>` — die Trefferfläche musste auf
  44 px gebracht werden.
- `trTask` führt zusätzlich `de`, damit die Hörzeile beide Sätze kennt.
- Ein Ticket kann `geaendert` tragen; der gebündelte Text nennt es.
- Die Sprachausgabe lässt sich nicht abschalten. Sie kostet nichts, solange niemand
  tippt — anders als der Ton nach jeder Antwort, der eine Einstellung hat.
- Neue Testreihe `hoeren.mjs` (27 Prüfungen); zusammen jetzt 602.
