# 0022 · Bilanz im Detail, mit Ringen aus Inline-SVG

**Status:** angenommen · 2026-08-03 · Etappe 2 von drei

## Kontext

Die Bilanz zeigte sechs Zahlen in Kacheln — «380 Wörter gesamt», «24 gemeistert»,
«7 Sätze sitzen». Die Zahlen stimmten, aber sie beantworteten die nächste Frage nicht:
*Wie verteilt sich das?* Wo stehen die 356 nicht gemeisterten Wörter — kurz vor der
Endstufe oder unberührt? Sind die offenen Sätze gesperrt oder nur ungeübt?

Verlangt war zugleich: **kein Leak**. Die Bilanz darf den Stand zeigen, nicht den
Lehrplan verraten — eine Liste ungelernter Vokabeln nähme dem Lernen den Sinn.

## Entscheidung

1. **Die Kacheln werden Knöpfe** und führen in vier Detailansichten: Wörter, Sätze,
   Antworten, Serie.
2. **Ringdiagramme aus Inline-SVG**, ohne Bibliothek: `stroke-dasharray` je Segment,
   `stroke-dashoffset` als Versatz.
3. **Die Farben sind die der Fortschrittspunkte** (`.pp.s0…s4`).
4. **Nur Zahlen, Anteile und Themennamen** — nie eine Liste von Wörtern oder Sätzen.
5. Der Kopf trägt im Detail dessen Namen; der Zurück-Pfeil führt erst zur Bilanz.

## Begründung

**Ein Ring beantwortet die Frage, die eine Zahl aufwirft.** «24 von 380» sagt wenig; der
Ring zeigt daneben, dass 96 begonnen und 60 kurz vor der Endstufe sind — oder eben nicht.
Das ist der ganze Zweck einer Bilanz.

**Inline-SVG statt Bibliothek**, weil eine Bibliothek an dieser Datei ohnehin scheitern
würde (ADR 0001). Der Aufwand ist klein: Ein Kreis, dessen Strich nur über einen Teil des
Umfangs läuft, ist ein Segment; mehrere davon mit wachsendem Versatz sind ein Ring. Zwei
Zahlen (`r`, `2πr`) und eine Schleife.

**Dieselben Farben wie die Punkte.** Stufe 3 ist in der Lernset-Zeile hellblau — im Ring
darf sie nicht plötzlich grün sein. Konsistenz kostet hier nichts außer der Disziplin,
eine gemeinsame Tabelle zu benutzen.

**Kein Leak ist eine Anforderung, keine Nebensache.** Deshalb zeigt die Themenliste nur
Themen, in denen schon etwas begonnen wurde, und keine Detailansicht nennt je ein
russisches Wort oder einen Satz. Zwei Prüfungen halten das fest: keine Vokabel aus dem
hinteren Lehrplan und kein Satztext darf im Text der Ansicht auftauchen.

**Die Reihenfolge der Satz-Prüfung ist Konsistenz, nicht Geschmack.** Erst «sitzt», dann
«frei» — sonst zählte ein gelernter Satz, dessen Wörter zwischenzeitlich zurückgefallen
sind, als gesperrt, und das Detail widerspräche der Kachel, die dorthin führt. Eine
Ansicht, die sich selbst widerspricht, ist schlimmer als eine, die weniger zeigt.

## Folgen

- `bilanzDetail` gehört in `ansichtenZuruecksetzen()` — sonst stünde nach dem
  Wiederherstellen einer Sicherung noch das alte Detail offen (die Regel aus ADR 0017).
- Der Zurück-Pfeil im Kopf hat jetzt zwei Stufen: erst Detail schließen, dann nach Home.
- Segmente mit Wert 0 werden weggelassen; die Testreihe prüft darum «ein Segment je
  vorhandener Gruppe», nicht eine feste Zahl.
- Die Übersicht der Bilanz bleibt unverändert — die Details kommen dazu, sie ersetzen
  nichts.
