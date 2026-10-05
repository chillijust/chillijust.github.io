# 0006 · Termine im Einzelnen

*2026-10-05 · Bauabschnitt 4 · Version 0.4.0T*

## Ausgangslage

Das Pflichtenheft verlangt Termine, einmalig und wiederkehrend (täglich, wöchentlich,
monatlich), mit Alarm-Vorlauf, «Termine heute» auf dem Dashboard, einen Punkt im
Monatskalender und eine Tagesansicht beim Antippen eines Tages. Offen war, welche Felder
ein Termin trägt, wie eine Reihe geändert wird und was die Tagesansicht ist — seit 0.2.0T2
öffnet ein angetippter Tag ja schon eine Liste unter dem Kalender (ADR 0003, 0005).

## Entscheidung

**Die Tagesansicht ist die Liste unter dem Kalender** (Wahl des Nutzers). Sie zeigt oben
die Termine des Tages, darunter wie bisher die Gewohnheiten und zuletzt den Knopf
«Termin an diesem Tag». Eine eigene Ansicht «Tag» gibt es nicht. Wer keine Gewohnheit hat,
liest in der Liste auch nichts über Gewohnheiten.

**Ein Termin trägt** Titel, Tag, ganztägig oder Beginn mit optionalem Ende, Wiederholung
mit optionalem Reihenende, Erinnerung, Ort und Notiz (`terminLesen`). Das Ende liegt nach
dem Beginn, am selben Tag; ein Termin über Mitternacht ist nicht vorgesehen.

**Wiederholung** wie im iPhone-Kalender, damit der Export in Abschnitt 5 dasselbe meint:
täglich; wöchentlich am Wochentag des ersten Termins; monatlich an dessen Tageszahl — ein
Monat ohne diesen Tag (31., 30., 29.) **fällt aus**, er rückt nicht auf den letzten. So
liest es auch eine `RRULE:FREQ=MONTHLY`. Das Formular sagt es ab dem 29.

**Eine Reihe wird nur als Ganzes** bearbeitet oder gelöscht (Wahl des Nutzers). Einzelne
Vorkommen abzusagen gibt es nicht. Löschen will zwei Tipps; bei einer Reihe fragt der
erste «Ganze Reihe löschen?».

**Erinnerung** als Minuten vor dem Beginn (`vorlauf`), aus festen Listen:

| Art | Werte |
| --- | --- |
| mit Uhrzeit | keine · zur Zeit · 5 · 15 · 30 Min. · 1 · 2 Std. · 1 Tag vorher |
| ganztägig | keine · am Tag um 9 · 1 Tag · 2 Tage · 1 Woche vorher um 9 |

Ganztags zählt der Vorlauf vor Mitternacht: «am Tag um 9» ist −540, «1 Tag vorher um 9»
ist 900 — so gehen die Werte unverändert als `TRIGGER` in den Export. Ein neuer Termin
beginnt zur nächsten vollen Stunde und erinnert 15 Minuten vorher; wechselt er auf
ganztägig, wechselt die Erinnerung auf «am Tag um 9».

**Dashboard:** «Termine heute» direkt unter der Karte mit Chili und Kalender, ganztägige
zuerst, dann nach Uhrzeit. Eine Zeile zeigt links die Zeit mit blauem Strich, rechts Titel
und Ort oder Reihe; Antippen öffnet den Termin. Ein Termin allein reicht für das
Dashboard — die Begrüßung bleibt nur, solange es gar nichts gibt.

**Kalender:** ein blauer Punkt je Tag mit Terminen, vorn vor den Punkten der Gewohnheiten
— einer, nicht einer je Termin; die Ansage nennt die Zahl. Nach dem Speichern springt der
Kalender auf den Tag des Termins und schlägt ihn auf (`kalZeige`), die Meldung nennt ihn.

## Begründung

Die Liste unter dem Kalender ist am Gerät abgenommen und kostet keinen Ansichtswechsel;
eine zweite Tagesansicht hätte dasselbe noch einmal gezeigt. Wiederholung und Vorlauf
folgen dem, was eine `.ics` ausdrücken kann — sonst zeigte der Kalender des iPhones nach
dem Export etwas anderes als Chillinal. Ein Punkt je Termin hätte bei einem täglichen
Termin jeden Tag um einen Punkt verlängert, ohne mehr zu sagen als «hier ist etwas».

## Folgen

- `state.termine` ist neu, Vorgabe `[]`. Das Schema bleibt 1: Ein alter Stand liest sich
  unverändert.
- Abschnitt 5 schreibt aus diesen Feldern `VEVENT`, `RRULE` (mit `UNTIL` aus dem
  Reihenende) und `VALARM`; ohne Ende gilt dort eine Stunde.
- Vergangene Termine bleiben stehen, bis man sie löscht.
- Suite `termine` sichert Lesen, Wiederholung, Dashboard, Kalender und Formular.
