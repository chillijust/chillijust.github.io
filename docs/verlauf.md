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

Block 6 in 0.17.0T27 (ADR 0060): Auf iOS folgt die Ansicht beim Rückwisch dem Finger, darunter
ein stilles Abbild des Dashboards, gebaut schon beim Auflegen am Rand; über 70 px wird sie, wo
sie steht, zum Tropfen. Terminzeile leuchtet bei der Rückkehr (Wisch, Pfeil, Titelknopf, nach
der Meldung beim Speichern). Geister teilen ein Stylesheet: Rückweg in Chromium, CPU 6-fach
gedrosselt, 119 statt 125 ms, beim ersten Mal 119 statt 159 ms; der Zug selbst beginnt in
0,1 ms; das Abbild (72 ms) entsteht beim Auflegen am Rand, bevor sich etwas bewegt.

0.17.0T28: Am Gerät schob der Rückwisch die Seite nur nach rechts; bis an den Rand gezogen,
fiel der Tropfen außerhalb des Bilds. Jetzt wird die Ansicht beim Ziehen schon zum Tropfen —
kleiner zum rechten Rand hin, runder, ganz im Bild — und fließt von dort in den Knopf (Wahl
des Nutzers).

Block 7, erster Teil, in 0.17.0T29: Timer und Drang tragen dichteres Glas (`--glas-dicht`, Hell
.78, Dunkel .8 statt .42/.40) bei gleicher Unschärfe — über einer vollen Terminliste schien
der Text dahinter deutlich durch (James, 12). Lange Titel auf dem Dashboard brechen nach zwei
Zeilen mit «…» ab; ganz stehen sie beim Bearbeiten, im Vorlesetext und in der Exportliste.
Suite `gestaltung`.

0.17.0T30, Block 7 zu Ende — Kleinteile nach Bildvergleich, Wahl des Nutzers: «10 von 12» mit
22 statt 26 px, bricht neben Woche/Monat nicht mehr um; Kalenderpunkte eine Stufe größer
(Woche 9, Monat 7 px), Ring 2 px; ein Schalter aus ist in Hell gefaßt (Rand `--spur-rand`,
Knauf `--knauf-schatten`), Dunkel bleibt.

0.17.0T31, James' Schlußprüfung (Nachricht 18): N11 — nach langem Druck schickt das Heben einen
echten Klick in die neue Ansicht, in der Terminmaske auf «Monatlich»; jetzt schluckt `langHalten`
genau diesen einen Klick, ein neues Auflegen wirkt sofort. N10 — ein zweiter Finger bricht den
Rückwisch schon bei `touchstart` ab, ohne liegengebliebenes Abbild. N12 — Name im Timer-/Drangblatt
höchstens zwei Zeilen, langes Wort bricht um; der Rand für den Tonknopf galt nie (Spezifität).
QA1 — `ankunft` H3 fragt im selben Augenblick statt 20 ms später. N10/N11 mit echten Touchfolgen
über DevTools nachgestellt und nach dem Fix gegengeprüft; Abnahme am Gerät steht aus.

0.19.0T, ADR 0062 — iOS ist das neue Chilli: Jede Stelle fließt wie in iOS 26, die Chilli-Bilder sind
fort; die Einstellungen haben keinen Reiter mehr, «Ruckler messen» geht mit, `state.fluessig` entfällt.
Das Menü kommt als ein Tropfen, seine Einträge blenden ein, statt einzeln aufzutropfen. `index.html`
678 → 620 KB. Sicherung davor: `backup/chillinal-0.18.0T-2026-10-15`. Abnahme am Gerät steht aus.

## Abgenommen

- **1.0.0 freigegeben** am 2026-10-20 — die erste Release: 0.19.0T abgenommen, Abschnitt 11
  fertig (ADR 0062, 0064).
- **0.18.0 freigegeben** am 2026-10-15: Erinnerungen wie bei iOS, Abschnitt 10 fertig (ADR 0061).
- **0.17.0 freigegeben** am 2026-10-15: Abschnitt 9 fertig, samt T7–T31 und James' N1–N12,
  nach James' Schlußprüfung (Nachrichten 18, 19).
- 0.17.0T28 · Block 6: Rückwisch folgt dem Finger auf iOS und wird dabei zum Tropfen, fließt
  in den Knopf; Terminzeile leuchtet bei der Rückkehr — am Gerät abgenommen am 2026-10-14.
- 0.17.0T26 · Auftropfen beim Start auf iOS (kurzer Hals aus einer Perle, ohne Lichtkante,
  alle Teile in einem Bild) — am Gerät abgenommen am 2026-10-13.
- 0.17.0T24 · Drang als Blatt aus Glas, auch das Ende nach zehn Minuten — abgenommen am
  2026-10-13.
