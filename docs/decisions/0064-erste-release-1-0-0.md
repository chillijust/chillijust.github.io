# 0064 · Die erste Release heißt 1.0.0 — einmalige Ausnahme vom Versionsschema

*2026-10-20 · Abnahme von 0.19.0T durch den Nutzer · Version 1.0.0 · Sicherung davor:
`backup/chillinal-0.19.0T-2026-10-20`*

## Ausgangslage

Alle Abschnitte des Pflichtenhefts sind gebaut, dazu 9–11; im Menü trägt kein Eintrag mehr
«bald». Der Nutzer hat 0.19.0T abgenommen und will die erste Release. Nach dem Schema in
`.claude/rules/auslieferung.md` hieße eine neue erste Ziffer aber «gespeicherte Daten
werden anders gelesen» — das trifft nicht zu.

## Entscheidung

- **Die erste Release ist 1.0.0.** Inhaltlich ist sie 0.19.0T; nur die Version wechselt.
- **Das ist die einzige Ausnahme.** Ab 1.0.0 gilt das Schema wieder unverändert: erste
  Ziffer neues Lesen der Daten, zweite etwas Neues, dritte alles Übrige, `T` für «noch
  nicht abgenommen».
- Schlüssel und Schema bleiben `chillinal_v1`; ein Stand und ein Sicherungscode aus 0.x
  lesen sich unverändert.

## Begründung

Eine Release, die 0.19.0 heißt, klingt nach Baustelle; eine eigene Ziffer für den Tag, an
dem die App fertig ist, ist üblich und kostet nichts. Weil die Ausnahme hier steht, liest
niemand aus der 1 später einen Schemawechsel heraus.

## Folgen

- Der Cache heißt `chillinal-1.0.0`; das iPhone holt die Fassung über «Jetzt laden».
- Weiter geht es mit ADR 0063 (aufräumen, dann aufteilen), beginnend bei 1.0.1T.
