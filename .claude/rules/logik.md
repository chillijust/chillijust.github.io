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
- **`gefeiert` ist ein Merkzettel, keine Rechnung**: je Laster der Rückfall, nach dem der
  neue Rekord schon gefeiert ist; gesetzt nur in `rekordFeiern` (ADR 0022).
- **Termine liegen über `terminAm(t, k)`**, nie über eigene Datumsrechnung: monatlich
  fällt aus, wo der Monat den Tag nicht hat — wie in einer `RRULE`. Eine Reihe ändert sich
  nur als Ganzes; `vorlauf` sind Minuten vor dem Beginn, ganztags vor Mitternacht (ADR 0006).
- **Die `.ics` entsteht nur in `kalenderDatei`**, aus `terminEreignis` und `gewohnheitEreignis`:
  Zeiten schwebend (ohne Zeitzone), Zeilen mit CRLF und über `icsFalten`, Text über `icsText`,
  UID = `id@chillinal`. Vergangenes und Gewohnheiten ohne `erinnerung` bleiben draußen (ADR 0009).
- **Hinaus geht `exportAuswahl`**: alles ohne `imKalender` und, was `exportWahl` dazuholt.
  `imKalender` setzt nur `exportiertMerken`, mit dem Abdruck aus `exAbdruck`; wer einen
  Eintrag neu baut (`terminSpeichern`), trägt die Marke hinüber (ADR 0011).
- **Eine Reflexion je Woche, unter ihrem Montag**; geändert nur über `reflexionSpeichern`,
  zwei leere Antworten entfernen sie, gelöscht über `reflexionLoeschen` (ADR 0017, 0018).
- **Der Sicherungscode entsteht nur in `sicherungsCode` und wird nur über `codeLesen` gelesen**
  — mit Prüfsumme, ohne Tickets und Welle; was er bringt, geht durch `stand()` wie der
  Speicher. Ersetzt wird nur über `standErsetzen`, das den alten Stand für Rückgängig hält
  und die Tickets des Geräts behält (ADR 0020).
- **Das Formular zeichnet sich beim Wählen nicht neu** — es ändert `entwurf` und die Knöpfe
  an Ort und Stelle, sonst ginge die Tastatur zu.
