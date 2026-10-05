# 0009 · Kalender-Export im Einzelnen

*2026-10-05 · Bauabschnitt 5 · Version 0.5.0T*

## Ausgangslage

Das Pflichtenheft verlangt eine `.ics` mit einem `VEVENT` je Termin und je Gewohnheit mit
Erinnerungszeit, Wiederholung als `RRULE`, Alarm als `VALARM` und stabiler `UID`;
Gewohnheiten bekommen dafür eine optionale Erinnerungsuhrzeit. Offen waren die Zeitzone,
was mit «x-mal pro Woche» und mit Vergangenem geschieht, und — ausdrücklich am Gerät zu
klären — ob die Datei per Download oder per Teilen-Blatt zuverlässig im Kalender landet.

## Entscheidung

**Beide Wege, nebeneinander.** Die Ansicht «Kalender-Export» hat «Teilen» (`navigator.share`
mit Datei), wo das Gerät es kann (`kannTeilen()`), und immer «Als Datei laden» (Blob,
`<a download>`). Kann das Gerät nicht teilen, ist Laden der Hauptknopf. Welcher Weg in der
Home-Bildschirm-App trägt, zeigt die Abnahme; der andere kann danach gehen.

**Zeiten schweben.** `DTSTART` und `DTEND` stehen ohne Zeitzone und ohne `Z` — der Kalender
liest sie in der Zeit des Geräts, so wie Chillinal rechnet. Ganztägiges steht als
`VALUE=DATE`, das Ende am Folgetag. `UNTIL` hat dieselbe Art wie der Beginn: ganztags ein
Tag, sonst `T235959` am letzten Tag. `DTSTAMP` steht in UTC.

**Termine** wie in ADR 0006 festgelegt: `FREQ=DAILY | WEEKLY | MONTHLY`, ohne Ende eine
Stunde, `vorlauf` unverändert als `TRIGGER` (15 → `-PT15M`, «am Tag um 9» → `PT9H`).
**Vergangenes bleibt draußen**: ein einmaliger Termin vor heute, eine Reihe, deren Ende vor
heute liegt.

**Gewohnheiten** gehen nur mit Erinnerung hinaus (`erinnerung: 'HH:MM'`, Schalter «Im
Kalender erinnern» im Formular, nur beim Angewöhnen), archivierte nie. Eine Viertelstunde
im Kalender, Alarm zur Zeit (`PT0M`). Täglich → `FREQ=DAILY`, Wochentage →
`FREQ=WEEKLY;BYDAY=…`, beginnend am ersten fälligen Tag ab dem Anlegen. **x-mal pro Woche
erinnert täglich** — welche Tage es werden, entscheidet der Nutzer; das Formular sagt es.

**UID** ist die `id` des Eintrags mit `@chillinal`. **Zuletzt exportiert** steht in
`state.exportiert` und in der Ansicht. Die Ansicht listet Termine und alle laufenden
Gewohnheiten; eine ohne Uhrzeit sagt «bleibt draußen» und öffnet sich mit einem Tipp —
der Rückweg führt danach zurück zum Export (`rueckZiel`).

## Begründung

Ob iOS eine geteilte oder eine geladene `.ics` im Vollbild-Modus in den Kalender holt, ist
von hier aus nicht zu entscheiden; zwei Knöpfe kosten wenig und machen die Abnahme zur
Klärung. Schwebende Zeiten ersparen einen `VTIMEZONE`-Block, den Chillinal ohne
Zeitzonen-Tabelle nicht korrekt schreiben könnte, und meinen dasselbe wie die App. Eine
feste Wahl von Tagen für «x-mal pro Woche» widerspräche dem Rhythmus, der die Tage gerade
offenläßt. Vergangenes hinauszuschicken hieße, es bei jedem neuen Export noch einmal in
den Kalender zu legen.

## Folgen

- `gewohnheit.erinnerung` und `state.exportiert` sind neu, Vorgabe `null`. Das Schema
  bleibt 1.
- **iOS importiert eine Kopie.** Wer nach einer Änderung neu exportiert, löscht die alten
  Einträge im Kalender von Hand — die Ansicht sagt es.
- Suite `export` sichert Rechnung, Formular, Ansicht, Teilen, Laden und den Rückweg.
- Nach der Abnahme: den Weg, der nicht trägt, entfernen und hier vermerken.
