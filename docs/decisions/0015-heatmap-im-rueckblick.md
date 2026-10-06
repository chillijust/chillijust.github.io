# 0015 · Die Heatmap: sechs Monate, Tageszustand, nur ansehen

*2026-10-06 · Bauabschnitt 6, erster Teil · Version 0.6.0T, Wochenstreifen 0.6.0T2*

## Ausgangslage

Das Pflichtenheft verlangt im Rückblick eine «Kalender-Heatmap je Gewohnheit» und für die
Detailansicht eine «Heatmap der letzten Monate». Offen waren Ort, Form, Tönung und was
ein Tipp darauf tut. Die Detailansicht selbst gibt es schon: Der lange Druck öffnet die
Gewohnheit mit Stand, Rhythmus, Erinnerung und Archivieren (ADR 0003).

## Entscheidung

- **Ort:** ganz oben in der Gewohnheit (`bearbeiten`) und im Abgewöhnen (`abgewoehnen`),
  als Abschnitt «Rückblick» über «Stand». Kein eigener Menüeintrag.
- **Form:** `HM_WOCHEN` = 26 Wochen, Spalten sind Wochen (Mo–So), die laufende steht
  rechts; links Mo, Mi, Fr, So, oben der Monat über der Woche seines Ersten. Paßt ohne
  Blättern in die Handybreite.
- **Tönung nach dem Zustand des Tages**, wie die Tagesliste des Kalenders: erledigt grün,
  verpaßt blasse Chili (wie die Warnung «Heute nicht wieder»), nicht dran Fläche, heute
  offen ein Ring, vor dem Anlegen blaß, Zukunft unsichtbar. «x-mal pro Woche» verpaßt
  keinen Tag. Abgewöhnen: frei grün, Tag mit Rückfall blasse Chili, vor dem Start blaß.
- **Das Raster wählt die Woche, der Streifen den Tag** (0.6.0T2). Ein Tag ist im Raster
  rund 11 px breit, weit unter 44 px. Ein Tipp ins Raster trifft darum die Spalte, deren
  Mitte am nächsten liegt; ein Rahmen fährt um sie. Darunter steht die Woche als Streifen
  mit sieben Tagen (≥ 44 px, Wochentag, Zahl, Farbfeld), ‹ › blättern wochenweise, ein
  gewählter Tag wandert als derselbe Wochentag mit. Geöffnet wird bei der laufenden Woche.
- **Ein Tag nennt sich**, ändert nichts: «Mo, 12. Okt. · verpasst» in der Zeile darunter,
  nochmal getippt steht wieder die Summe («12 von 15 fälligen Tagen erledigt.», «43 Tage
  frei, 1 mit Rückfall.»). Nachgetragen wird weiter im Kalender des Dashboards.
- **Die Woche wechselt an Ort und Stelle** (`hmWocheWaehlen`), ohne `render()` — das
  Formular darunter bleibt, wie es ist.

**Verworfen (0.6.0T):** Felder einzeln antippen und mit dem Finger über das Raster
streichen (`touch-action: pan-y`). Am Gerät traf der Finger das gewünschte Feld nicht, und
Streichen und Blättern kamen sich in die Quere.

## Begründung

Der Zustand ist ehrlicher als eine Stärke-Intensität und auf einen Blick lesbar; die
Stärke steht ohnehin als Zahl darunter. Sechs Monate reichen, um die 66 Gelegenheiten bis
zur Automatik zu sehen, und kommen ohne waagerechtes Wischen aus. Raster und Streifen
halten beides: den Überblick über das Halbjahr und Ziele, die die 44-px-Regel einhalten.
Ein Tipp, der nur anzeigt, macht das Durchsehen gefahrlos.

## Folgen

- Die Spaltenzahl steht zweimal: `HM_WOCHEN` im Skript, `repeat(26, …)` im Stylesheet.
- Archivierte Gewohnheiten lassen sich nicht öffnen, haben also auch keinen Rückblick.
- Das Journal mit Wochenreflexion folgt in ADR 0017.
- Suite: `rueckblick`.
