# 0061 · Erinnerungen: offen, bis abgehakt, wie bei iOS

*2026-10-15 · Stand 0.18.0T · Bauabschnitt 10 · erweitert den Umfang des Pflichtenhefts (Umfang,
Menü), ergänzt 0006, 0009, 0011, 0041*

## Ausgangslage

Das Pflichtenheft kennt Angewöhnen, Abgewöhnen und Termine; «Erinnerungen» heißt dort nur der
Weg über den Kalender-Export. Was ohne feste Zeit erledigt werden will (einen Brief einwerfen,
Blumen gießen), paßte in keine Art: Ein Termin liegt an einem Tag und ist am nächsten vorbei,
eine Gewohnheit zählt zur Stärke. Der Nutzer wollte Erinnerungen wie in der App des iPhones,
die auch exportiert werden können.

## Entscheidung

- **Eine eigene Art `state.erinnerungen`** (`erinnerungLesen`): Titel, Tag und Uhrzeit frei,
  Wiederholung wie beim Termin (keine, täglich, wöchentlich, monatlich), Notiz. Ein neues
  Feld mit Vorgabe in `grundStand()` — ein älterer Stand und ein älterer Sicherungscode lesen
  sich unverändert, das Schema bleibt.
- **Offen, bis abgehakt.** Ohne Tag gilt sie für heute. Was an seinem Tag nicht abgehakt
  wurde, **zieht mit auf heute** und sagt, seit wann es fällig ist (Wahl des Nutzers). Im
  Kalender steht Offenes auf heute oder seinem kommenden Tag, Erledigtes an dem Tag, an dem
  es abgehakt wurde.
- **Eine Reihe springt mit dem Haken auf ihre nächste Fälligkeit nach heute** (`naechste`):
  Verpaßtes stapelt sich nicht. Jeder Haken merkt sich, was davor fällig war (`war`); so
  nimmt ein zweiter Tipp den letzten Haken zurück.
- **Auf dem Dashboard eine Liste «Heute»** mit Terminen und Erinnerungen (Wahl des Nutzers):
  Überfälliges oben, dann ohne Uhrzeit, dann nach der Zeit. Antippen hakt ab, lange drücken
  öffnet — wie die Terminzeile (ADR 0041, 0042).
- **Die Farbe ist der Akzent** (Wahl des Nutzers): der Strich der Zeile, der Punkt im
  Kalender, die Glocke, wo keine Uhrzeit steht. Blau bleibt dem Termin.
- **Hinaus in derselben `.ics`** (`erinnerungEreignis`): mit Uhrzeit eine Viertelstunde, der
  Alarm zur Uhrzeit; ohne Uhrzeit ganztags, der Alarm um 9 Uhr; eine Reihe als `RRULE` ab
  ihrem Beginn. Hinaus geht Offenes ab heute und jede Reihe; Marken und Abwahl wie bei
  Termin und Gewohnheit (`'e:id'`, ADR 0011, 0034). Ein Haken an einer Reihe ändert den
  Abdruck nicht.
- Menü: «Neue Erinnerung» nach «Neuer Termin»; «Hinzufügen» im Kalender bietet sie an.

## Begründung

Der Termin trägt schon Wiederholung, Abhaken und Export; die Erinnerung nimmt dieselben Wege
und dieselbe Zeile, damit sie sich gleich bedient. Das Mitziehen ist der Kern dessen, was
eine Erinnerung vom Termin unterscheidet. Eine eigene Art statt eines Schalters im
Terminformular hält beide Formulare kurz.

## Folgen

- **Grenze des iPhones:** Eine `.ics` landet im Kalender, nicht in der App «Erinnerungen» —
  `VTODO` übernimmt iOS beim Import nicht. Die Kopie zieht auch nicht mit: Was verpaßt
  wurde, steht im Kalender des iPhones an seinem Tag.
- Benachrichtigungen ohne Kalender bräuchten Web-Push mit Server; das bleibt
  ausgeschlossen (Rahmenbedingung «kein Server, kein Push»).
- Suite `erinnerungen`; `menue`, `nachschliff` und `termine` kennen den neuen Eintrag und die
  Liste «Heute».
