# 0015 · Die Heatmap: sechs Monate, Tageszustand, nur ansehen

*2026-10-06 · Bauabschnitt 6, erster Teil · Version 0.6.0T*

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
- **Antippen nennt den Tag**, ändert nichts: «Mo, 12. Okt. · verpasst» in der Zeile unter
  der Legende. Ohne Wahl steht dort die Summe («12 von 15 fälligen Tagen erledigt.»,
  «43 Tage frei, 1 mit Rückfall.»). Nachgetragen wird weiter im Kalender des Dashboards.
- **Das ganze Raster ist ein Ziel**, kein Feld einzeln: Ein Tag ist rund 11 px breit, weit
  unter 44 px. Der Finger darf waagerecht darüberstreichen (`touch-action: pan-y`,
  `elementFromPoint`), senkrecht blättert die Seite.

## Begründung

Der Zustand ist ehrlicher als eine Stärke-Intensität und auf einen Blick lesbar; die
Stärke steht ohnehin als Zahl darunter. Sechs Monate reichen, um die 66 Gelegenheiten bis
zur Automatik zu sehen, und kommen ohne waagerechtes Wischen aus. Ein Tipp, der nur
anzeigt, macht das Durchsehen gefahrlos — eine versehentliche Änderung in einem Raster
aus 11-px-Feldern wäre kaum zu bemerken.

## Folgen

- Die Spaltenzahl steht zweimal: `HM_WOCHEN` im Skript, `repeat(26, …)` im Stylesheet.
- Archivierte Gewohnheiten lassen sich nicht öffnen, haben also auch keinen Rückblick.
- Offen in Abschnitt 6: Journal mit Wochenreflexion.
- Suite: `rueckblick`.
