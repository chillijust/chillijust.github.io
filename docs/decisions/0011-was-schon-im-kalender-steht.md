# 0011 · Was schon im Kalender steht, geht nicht noch einmal hinaus

*2026-10-05 · Ansicht von 0.5.0T6 · Version 0.5.0T7 · ergänzt 0009 · ergänzt durch 0012 (Markierung aufheben), 0034 (Neues abwählen)*

## Ausgangslage

Der Export schickte jedes Mal alles hinaus. Wer zweimal exportiert, hat im iPhone-Kalender
jeden Eintrag doppelt — die `.ics` kann im Kalender nichts ersetzen, nur hinzufügen
(ADR 0009). Gewünscht: Was schon draußen ist, soll man sehen und nicht noch einmal
mitschicken müssen.

## Entscheidung

- **Jeder Termin und jede Gewohnheit trägt `imKalender`**: `{ am, abdruck }` oder `null`.
  `am` ist der Zeitpunkt des Exports, `abdruck` ein kurzer Hash des Ereignisses ohne
  `DTSTAMP` (`exAbdruck`). Gesetzt wird beides nur in `exportiertMerken`, für genau die
  Auswahl, die in der Datei stand.
- **Drei Zustände** (`exStatus`): *neu* (keine Marke), *drin* (Abdruck gleich),
  *geändert* (Abdruck weicht ab). Geändert ist nur, was den Kalendereintrag ändert —
  Abhaken nicht, Speichern ohne Änderung nicht, Zurückändern hebt es wieder auf.
- **Neues geht immer mit.** Exportiertes ist abgedunkelt, sagt «im Kalender seit …» und
  geht nur hinaus, wenn es unter **«Bearbeiten»** dazugeholt wird (`exportWahl`, nur im
  Speicher). Geändertes bleibt abgedunkelt, trägt «geändert seit dem Export» und geht
  ebenfalls nur über «Bearbeiten» — wer es neu schickt, löscht das alte im Kalender von Hand.
- **Der Bestand bleibt offen**: Es gibt keine Rekonstruktion; der erste Export nach dem
  Update setzt die ersten Marken.
- Steht nichts zur Auswahl, verschwinden die Knöpfe; ein Satz verweist auf «Bearbeiten».
  Wer die Ansicht verläßt, verläßt «Bearbeiten»; die Auswahl gilt bis zum nächsten Export.

## Begründung

Der Kalender selbst merkt sich nichts, was die App lesen könnte — also merkt es sich die
App. Ein Abdruck statt eines Änderungszeitpunkts, weil er nur anschlägt, wenn sich im
Kalender wirklich etwas ändern würde.

## Folgen

- Neues Feld, alter Stand liest sich als *neu* — kein neuer Schlüssel, keine Migration.
- Ändert sich der Text, den `gewohnheitEreignis` mitschreibt (etwa der App-Name in
  `DESCRIPTION`), gelten alle Gewohnheiten als geändert.
- Suiten: `exportmarken`; `export` setzt zwischen zwei Exporten die Marken zurück.
