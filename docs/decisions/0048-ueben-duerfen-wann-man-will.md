# 0048 · Üben dürfen, wann man will

**Stand:** angenommen · 2026-08-09

## Ausgangslage

Gewünscht wurde, die Wörter eines frisch gelernten Lernsets in «Tippen» nachzuschreiben —
«damit sie besser sitzen». Zwei Sperren standen dem im Weg, beide unbeabsichtigt.

**Die Stufenschwelle.** Ein Lernset gilt als geschafft, wenn alle seine Wörter
`SATZ_STUFE` (2) erreicht haben — das ist die Schwelle, ab der seine Sätze aufgehen.
«Tippen» beginnt aber erst bei `settings.tippenStufe` (3). Genau die Wörter, die man
gerade gelernt hat, fallen also durch das Raster: Wer sein Set nachschreiben will, findet
nichts vor.

**Die Auffrischfrist.** Was `BOX_MAX` erreicht hat, verlässt den Stapel und kommt erst
nach 21 Tagen zurück. In «Buchstaben» führte das in eine verschlossene Tür: Wer das
Alphabet gemeistert hatte, sah einen Leerzustand und hatte **keinen** Weg zurück ins Üben
— nur den zur Tafel. Die Übung war fertig, und fertig hieß: vorbei.

## Entscheidung

**«Tippen» bekommt eine zweite Achse.** Neben dem Stapel steht der **Vorrat**:

| Achse | Werte |
| --- | --- |
| Stapel (`tippenModus`) | Lernen · Wiederholung · **Alle** |
| Vorrat (`tippenSet`) | der ganze Wortschatz · **ein einzelnes Lernset** |

**Ein gewähltes Set sticht die Stufenschwelle** und beginnt bei Stufe 1. Die Vorgabe
«Der Reihe nach» bleibt bei `settings.tippenStufe` — die Einstellung behält ihren Sinn.

**«Alle» nimmt alles Begonnene**, ohne Rücksicht auf Stufe und Frist. Nie Gesehenes
bleibt draußen: «Tippen» ist eine Behauptung, keine erste Begegnung.

**«Buchstaben» bekommt denselben Ausweg** — den Stapel «Alle» mit allen 33 Zeichen.
Keine Set-Wahl: Buchstaben kennen keine Sets, und nach zwei Sets kämen ohnehin fast alle
33 vor.

**Die Leerzustände tragen den Ausweg mit.** «Alles getippt» und «Das Alphabet sitzt»
bekommen einen Knopf — «Trotzdem festigen» beziehungsweise «Trotzdem üben». Eine
Auswahl, die man erst finden muss, hilft dort nicht, wo man steht.

**«Übersetzen» bleibt unberührt.** Ausdrücklich so entschieden: Es hat mit Stufe,
Richtung und Stapel bereits drei Achsen, und eine vierte machte aus der Auswahl ein
Formular.

## Begründung

**Üben können darf nie an einem Datum hängen.** Die Leitner-Leiter ist ein Vorschlag,
wann etwas *nötig* ist — kein Verbot, es früher zu tun. Wer mehr üben will, als das
System für nötig hält, tut genau das Richtige; ihn davon abzuhalten, ist ein Fehler, kein
Feature. Dasselbe gilt für die Schwelle: Sie schützt davor, ein Wort zu tippen, das man
noch nie gesehen hat — nicht davor, ein gelerntes Set zu festigen.

**Die Zahl am Chip muss halten, was sie verspricht.** `tippenWoerter(setNr, modus)` ist
eine Funktion von *beiden* Achsen, und die Auswahl rechnet damit dieselbe Zahl, die das
Antippen liefert. Ein Chip «Set 3 · 12», hinter dem vier Wörter warten, wäre schlimmer
als gar keine Zahl.

**Ein gesperrtes Set bekommt keine Zahl.** «Set 7 · 0» behauptete, dort sei nichts —
dabei ist dort nur noch nichts *erlaubt*. Der graue Chip ohne Zahl sagt das Richtige und
zeigt zugleich, wohin der Weg führt.

## Folgen

- `tippenSet` und `abcStapel` sind Ansichtszustand und gehören in
  `ansichtenZuruecksetzen()` ([ADR 0017](0017-sicherungscode-format-2.md)).
- **Der Leerzustand eines gewählten Sets ist ein eigener.** «Noch kein Wort
  freigeschaltet» wäre dort gelogen: Freigeschaltet ist das Set, angefangen ist es nur
  nicht. Er heißt «Set N ist noch unberührt» und führt zurück zu «Lernsets» oder zum
  ganzen Wortschatz.
- **«Alle» wird nicht automatisch verlassen.** Läuft ein Stapel leer, schaltet «Tippen»
  zwischen Lernen und Wiederholung um — «Alle» bleibt stehen. Wer festigen will, hat das
  ausdrücklich gewählt und soll nicht stillschweigend woandershin geschoben werden.
- **Gewertet wird wie sonst auch.** «Alle» ist ein anderer Vorrat, kein anderer
  Lernstand: Eine richtige Antwort zählt, ein Fehler kostet. Ein zweiter, abgekoppelter
  Fortschritt wäre eine Lüge über den eigenen Stand — dieselbe Überlegung wie beim
  Power-Training ([ADR 0034](0034-power-training-und-gezielte-regel.md)).
- Wer eine dritte Achse erwägt, prüfe zuerst «Übersetzen»: Drei Gruppen im Filterblatt
  sind die Grenze, ab der man liest statt wählt.
