---
paths:
  - "index.html"
---

# Rechnung · Chillinal

Gilt für die Gewohnheiten in `index.html`. Begründungen in ADR 0002 und im Pflichtenheft.

- **Nichts Abgeleitetes wird gespeichert.** Stärke, Serie, Warnung, Punkte entstehen in
  `auswerten(g, heute)` aus `erledigt` und `rhythmus` — gespeichert sind nur die Tage.
- **Ein Tag ist ein Schlüssel `JJJJ-MM-TT` in lokaler Zeit.** Gerechnet wird mit `tagPlus`
  (über `setDate`), nie mit Millisekunden; verglichen als Text.
- **Die Uhr ist `jetzt()`**, sonst nirgends `new Date()` für «heute» — der Prüfstand stellt sie.
- **Heute zählt erst, wenn es erledigt ist.** Ein offener Tag ist kein Aussetzer.
- **x-mal pro Woche wird je Woche (Mo–So) gewertet** und wiegt x Gelegenheiten; die erste
  Woche verlangt nur, was an Tagen übrig war; die laufende zählt erst, wenn erreicht.
- **Grenzen, die `stand()` braucht, stehen vor `var state = laden();`** — sonst sind sie beim
  Start undefined und Gültiges fällt still aus dem Speicher. Die Suite `gewohnheiten` prüft es.
- **Geändert wird ein Tag nur über `umschalten(id, tag)`** — es prüft mit `aenderbarAm`: nicht
  in der Zukunft, nicht vor dem Anlegen, höchstens `NACHTRAG_TAGE` zurück (ADR 0003).
- **Abgewöhnen rechnet Dauern in Millisekunden über `zeitJetzt()`**, Tage weiter über
  Schlüssel. Gespeichert sind nur Start, Rückfälle und gewonnene Dränge; «frei seit», Rekord
  und Stärke entstehen in `lasterAuswerten(a, nun)` (ADR 0004).
- **Der Rekord schließt die laufende Strecke ein; die Stärke zählt heute frei, solange kein
  Rückfall kam.** Ein Rückfall geht nur über `rueckfallEintragen`, ein gewonnener Drang nur
  über `welleGewonnen` — es prüft, daß die zehn Minuten herum sind.
- **Termine liegen über `terminAm(t, k)`**, nie über eigene Datumsrechnung: monatlich
  fällt aus, wo der Monat den Tag nicht hat — wie in einer `RRULE`. Eine Reihe ändert sich
  nur als Ganzes; `vorlauf` sind Minuten vor dem Beginn, ganztags vor Mitternacht (ADR 0006).
- **Die `.ics` entsteht nur in `kalenderDatei`**, aus `terminEreignis` und `gewohnheitEreignis`:
  Zeiten schwebend (ohne Zeitzone), Zeilen mit CRLF und über `icsFalten`, Text über `icsText`,
  UID = `id@chillinal`. Vergangenes und Gewohnheiten ohne `erinnerung` bleiben draußen (ADR 0009).
- **Das Formular zeichnet sich beim Wählen nicht neu** — es ändert `entwurf` und die Knöpfe
  an Ort und Stelle, sonst ginge die Tastatur zu.
