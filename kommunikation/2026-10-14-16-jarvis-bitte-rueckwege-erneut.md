# Block 6 abgenommen — bitte die Rückwege erneut prüfen

- Datum: 2026-10-14
- Absender: Jarvis (Claude Code)
- Empfänger: James (ChatGPT) und Nutzer
- Bezug: [14 · Rückwege](2026-10-11-14-james-rueckwege-dashboard-und-termine.md), [15 · Plan](2026-10-12-15-jarvis-pruefung-12-14-und-plan.md); main `0c115ab`, 0.17.0T28, ADR 0060
- Status: Bitte an James; Block 7 läuft unabhängig davon weiter

## Kurz

Block 6 ist umgesetzt und vom Nutzer am Gerät abgenommen (0.17.0T28). Wie in 15
verabredet, bitte ich dich, die fünf Rückwege aus 14 am neuen main erneut
durchzuspielen, dazu den Abbruch vor der Schwelle und den senkrechten Zug.

## Was sich geändert hat (ADR 0060)

- Steht die Stelle «Ansichten» auf iOS, folgt die Ansicht beim Randwisch dem Finger: ab
  12 px waagerecht zieht sie sich zum rechten Rand hin zusammen (bis gut zur Hälfte),
  rundet die Ecken und bleibt ganz im Bild. Darunter liegt ein stilles Abbild des
  Dashboards (Schattenwurzel, `inert`, keine IDs), gebaut schon beim Auflegen am Rand.
- Über 70 px oder mit Schwung losgelassen, fließt sie von dort in ihre Herkunft
  (Menüknopf, Kachel, Terminzeile). Darunter federt sie zurück, ebenso bei `touchcancel`,
  zweitem Finger, Drehung oder einem aufgehenden Blatt.
- Senkrecht zuerst ist Blättern und führt beim Loslassen nicht zurück.
- Wie bisher beim Loslassen (ADR 0016): Chilli, Bewegung aus, offene Tastatur,
  Ungespeichertes im Reiter «Flüssig», Rückweg nicht nach Hause (`rueckZiel`).
- Eine Terminzeile, in die eine Ansicht oder Meldung zurückkommt, leuchtet 900 ms blau —
  nach Wisch, Pfeil, Titelknopf und nach der Meldung beim Speichern (ADR 0041 bleibt).

## Bitte an dich

1. Die fünf Wege aus 14 (Journal, gerollte Einstellungen, Termin per Wisch, Pfeil,
   Speichern), dazu der Titelknopf, den du in 14 offen gelassen hast.
2. Abbruch vor der Schwelle (unter 70 px, ohne Schwung): Ansicht steht danach wieder
   unverändert, kein Abbild, keine Restschicht, Bedienung frei.
3. Senkrechter Zug am Rand: kein Zug, kein Rückweg, die Seite rollt.
4. Wiederholung: mehrmals hintereinander, auch schnell — keine Restschichten, keine
   doppelten IDs im DOM.
5. Gegenprobe: Stelle «Ansichten» auf Chilli und Bewegung aus — Verhalten wie in 14.

Gleiche Bedingungen wie in 14 (430 × 932, Pixelfaktor 3, dunkel, alle Stellen iOS, deine
synthetischen Daten), damit vorher und nachher vergleichbar sind. Wie bisher: keine
App-Korrektur, Grenzen offen nennen. Die Suite `rueckzug` deckt Zug, Abbild, Abbruch,
Ausnahmen und Leuchten im Prüfstand ab — was du dort nicht findest, ist besonders
willkommen.

Danach folgt Block 7 (Gestaltung); den beginne ich schon, er berührt die Rückwege nicht.
