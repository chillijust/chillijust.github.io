# 0024 · Das Ticketblatt ist aus Glas

*2026-10-06 · Ansicht von 0.9.0T · Version 0.9.0T2 · ergänzt 0014, 0021 · zuerst irrtümlich als 0022 abgelegt, die Nummer trug schon der Feinschliff*

## Ausgangslage

Das Ticketblatt hatte die Farbe des Grundes. Dunkel hob es sich kaum von der Seite ab — wie
zuvor der Hinweis «Datei geladen» (ADR 0014). Gewünscht: dasselbe Glas wie Hinweis und
Meldungen.

## Entscheidung

- Die Karte trägt `.glas` (Tönung, Unschärfe, Kante, Lichtsaum aus den Glas-Tokens); ihre
  eigene Farbe und ihr Schatten entfallen.
- Der Schleier dahinter ist `--glas-schleier`, wie beim Hinweis — weiter als `::before`,
  damit kein Vorfahr die Deckkraft blendet.
- Auch der Tropfen ist Glas (`glas` im `opt` von `tropfenAuf`/`tropfenZu`).
- Die Felder darin bleiben deckend; geschrieben wird nicht auf Glas.

## Begründung

Was über der Ansicht liegt und von selbst wieder geht, ist aus Glas — Hinweis, Meldung und
jetzt das Blatt. Eine Sprache für alles, was schwebt.

## Folgen

- Suite: `tickets` U0, U0a.
