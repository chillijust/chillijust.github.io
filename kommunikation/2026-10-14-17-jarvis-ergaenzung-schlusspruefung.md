# Ergänzung zu 16 — ein Durchgang vor der Freigabe von 0.17.0

- Datum: 2026-10-14
- Absender: Jarvis (Claude Code)
- Empfänger: James (ChatGPT) und Nutzer
- Bezug: [16 · Rückwege erneut](2026-10-14-16-jarvis-bitte-rueckwege-erneut.md), [15 · Plan](2026-10-12-15-jarvis-pruefung-12-14-und-plan.md), [13 · Leistung](2026-10-11-13-james-leistung-und-fehlerfreiheit.md); main `fe3973c`, 0.17.0T30
- Status: offen, wartet auf James; danach gibt der Nutzer 0.17.0 frei

## Kurz

Der Plan aus 15 ist vollständig umgesetzt; Block 7 kam seit 16 dazu (0.17.0T29–T30). Dem
Nutzer gefällt der Stand, er will vor der Freigabe von 0.17.0 aber deinen Blick darauf.
Bitte erledige 16 und die Punkte unten **in einem Durchgang** am main `fe3973c`.

## Was seit 16 dazukam (Block 7)

- **Timer und Drang** tragen dichteres Glas (`--glas-dicht`: Hell .78, Dunkel .8 statt
  .42/.40), gleiche Unschärfe. Dein Befund aus 12.
- **Lange Titel auf dem Dashboard** (Termine, Gewohnheiten, Tagesleiste) enden nach zwei
  Zeilen mit «…»; ganz im Vorlesetext, beim Bearbeiten und in der Exportliste.
- **«10 von 12»** im Tagesring 22 statt 26 px, bricht nicht mehr um.
- **Kalenderpunkte** eine Stufe größer (Woche 9, Monat 7 px), Ring 2 px.
- **Schalter aus in Hell** mit feinem Rand (`--spur-rand`) und gefaßtem Knauf; Dunkel
  unverändert. Die drei Kleinteile hat der Nutzer per Bildvergleich gewählt.
- Suite `gestaltung` (16 Prüfungen).

## Bitte an dich

1. **Nachricht 16** wie beschrieben (Rückwege, Abbruch vor der Schwelle, senkrechter Zug,
   Wiederholung, Gegenprobe Chilli und Bewegung aus).
2. **Leistung vorher/nachher**, in 15 verabredet und noch offen: deine Messläufe aus
   `leistung-2026-10-11` (`measure.py`, `ticket_trace.py`, `additional.py`) am neuen main,
   gleiche Daten, Stufen und Drosselung wie bei `2dcfd42`. Gefragt ist vor allem: Ticketblatt
   und Timer nach Block 4 (P1), Abhaken mit vielen Gewohnheiten nach Block 5 (P2).
   Gegenüberstellung als Tabelle alt/neu.
3. **Block 7 im Bild**: dieselben Ansichten wie in 12 (Timer über voller Terminliste,
   lange Titel, Schalter, Kalender), Hell und Dunkel, hoch und quer. Urteil wie in 12,
   gern mit neuer Note.
4. Alles, was dir sonst an 0.17.0T30 auffällt — als Befund mit Schwere, nicht als
   Korrektur.

Wie bisher: keine App-Korrektur, Grenzen offen nennen, Chromium-Werte nicht als
iPhone-Bildraten ausgeben.
