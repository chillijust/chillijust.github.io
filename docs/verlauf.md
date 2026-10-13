# Verlauf von Bauabschnitt 9

Was in `CLAUDE.md` unter «Offen» mitlief, bis es zu lang wurde: welche Fassung was brachte,
mit den Messwerten vom Gerät. Nachschlagen bei Bedarf; neu hinzu kommt, was ausgeliefert
ist. Die Begründungen stehen in den ADRs, das Verhalten in den Suiten.

- Flüssig (ADR 0054): Chilli ist Standard, iOS je Stelle mit Speichern; Timer wie Drang; auf iOS fließt jedes Teil selbst, ohne Chilli darunter; der Reiter sagt je Stelle, wie man testet; Kontrast in Dunkel (ADR 0055); Rückwege von Menü und Ansichten, Knauf beim echten Tipp (0.17.0T7); Auftropfen und Zeilen fließen, Wisch zurück von gerollter Seite (0.17.0T8); Kalenderring, Abhaken, Wahlschalter ohne Warten, Ticketblatt mit Glas erst am Ziel, Auftropfen als Kette (0.17.0T9). Abnahme am Gerät steht aus.
- Analyse von James (Nachrichten 01–03, 09–10 auf `chatgpt/kommunikation`). A2/A3 ausgeliefert in 0.13.2T
  (ADR 0049). N1–N8 aus 09 bestätigt, der Nutzer will alles, Block für Block: N1, N6 in 0.17.0T10, N3 in
  0.17.0T11, N4+N8 in 0.17.0T12, N5 in 0.17.0T13, N7 in 0.17.0T14 (ADR 0056), N2 in 0.17.0T15
  (ADR 0057). Abnahme am Gerät steht aus.
- James 12–14 (Gestaltung, Leistung, Rückwege): Plan in sieben Blöcken in Nachricht 15 auf
  `chatgpt/kommunikation`, dort auch die Entscheidungen des Nutzers. Block 1 (N9 und dasselbe
  Muster bei Sicherung und Export) in 0.17.0T16. Block 2: Prüfstand in 430 × 932 (ADR 0058).
  Block 3: «Ruckler messen» im Reiter Flüssig in 0.17.0T17 — der Nutzer nimmt damit den Vorher-Wert am
  iPhone. Block 4 (P1) in 0.17.0T18: Ticketblatt und Timer fließen schlicht, Glas am Ziel; Abnahme mit
  «Ruckler messen», 4 × auf und zu (vorher iOS 45/97, Chilli 18/18; nachher iOS 16/16). Auf Wunsch des
  Nutzers vor Block 5: Timer, dann Drang als Glasblatt wie der Timer. Welle als ein SVG ohne Filter in
  0.17.0T19 (vorher Timer iOS 44/51, Chilli 39/44; Drang iOS 50/131, Chilli 44/115; nachher Timer offen 6/13,
  4 × auf und zu iOS 27/33, Chilli 22/27, längster stets ~107 ms). Messwerte kopierbar (0.17.0T20), mit Spur je
  Ruckler (0.17.0T21). Befund der Spur: Der ~110-ms-Hänger kommt vom Rückwisch aus den Einstellungen
  («kein Skript» nach Ansicht/Tropfen zu), nicht vom Timer; Gegenprobe bestätigt (Chilli 39 ms, iOS 132 ms).
  Timer-Start frischt nur die Kachel auf statt render() (0.17.0T22; Timer 4 × auf und zu 16/16). Ansichten
  fließen auf iOS ohne Lichtkante (0.17.0T23, am Gerät «viel geschmeidiger»). Drang als Blatt aus Glas wie
  der Timer (0.17.0T24, ADR 0059) — Abnahme am Gerät steht aus. Später: Jedes Auflegen des Fingers kostet
  ein Bild (30–39 ms, kein Skript), vermutlich die Druckrückmeldung. Drangblatt am Gerät: auf und zu je ein
  Bild, längster 53 ms; das Ende nach zehn Minuten ist noch ungetestet. Block 5 (P2) in 0.17.0T25:
  `auswerten` merkt sich je Gewohnheit, ein Haken rechnet einmal statt 122-mal (40 Gewohnheiten, drei
  Jahre). Auftropfen beim Start auf iOS: kurzer Hals aus einer Perle, ohne Lichtkante, alle Teile in
  einem Bild (0.17.0T26) — Abnahme am Gerät steht aus. Als Nächstes Block 6. Für Block 7 dazu: «10 von 12» bricht im Tagesring um —
  Varianten als Bildvergleich (Zahl kleiner, Umschalter in die Kalenderzeile, so lassen).

## Abgenommen

- 0.17.0T26 · Auftropfen beim Start auf iOS (kurzer Hals aus einer Perle, ohne Lichtkante,
  alle Teile in einem Bild) — am Gerät abgenommen am 2026-10-13.
