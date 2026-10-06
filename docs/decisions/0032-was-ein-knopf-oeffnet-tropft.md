# 0032 · Was ein Knopf öffnet, tropft aus ihm; Glas im Tropfen ist deutlich

*2026-10-06 · Ticket «Hinzufügen tropfen» · Version 0.11.0T · ergänzt 0007, 0013, 0014, 0026*

## Ausgangslage

Das Wahlfenster von «Hinzufügen» tropfte schon aus dem Knopf (ADR 0025) — am Gerät sah es
trotzdem aus, als verschwände es einfach nach unten. Der Hinweis tropft mit 166 ms
(`HINWEIS_DAUER`, ADR 0013); auf so kurzem Weg war die Hülle aus Glas, zu 42 % getönt
und kaum gefaßt, vor dem Kalender nicht als Tropfen zu erkennen.

Dazu der Wunsch: Was ein Knopf öffnet, soll **immer** aus ihm tropfen. Gewählt wurden
Formularteile, die Woche der Heatmap, «Alle Tickets» und «Bearbeiten» im Export.

## Entscheidung

- **Das Tempo bleibt** (Wunsch am Gerät). Statt dessen ist **Glas im Tropfen dicht und
  gefaßt**: `.tropfen-huelle.glas` nimmt `--glas-tropfen` (86 % hell, 90 % dunkel), einen
  Rand `--glas-rand` und einen tieferen Schatten. Am Ziel blendet die Hülle zur Tönung der
  Karte über (`glasFarben`) — kein Sprung, wenn die Karte übernimmt.
- **Formularteile** tropfen aus dem Knopf, der sie öffnet, und schließend in ihn zurück:
  `teilZeigen(el, an, quelle)`. Der Platz zieht sich im selben Takt auf und zu wie der
  Tropfen (`TROPFEN_DAUER`); die Hülle trägt den Grund ihrer Umgebung (`grundUnter`),
  damit sie ohne Kante ankommt. Betroffen: Richtung, Rhythmus, Erinnerung, ganztags,
  Wiederholung.
- **Heatmap:** Ein Tipp ins Raster läßt die Tage der Woche aus dem getroffenen Punkt
  tropfen (`hmWocheWaehlen(w, aus)`); Blättern mit den Pfeilen tropft nicht.
- **Alle Tickets:** Jede Zeile beginnt als Perle unter dem Knopf, rollt an ihren Platz und
  wird dort breit — nacheinander wie bisher (ADR 0026). Die Perle beginnt nie über dem
  Rand dessen, was rollt (ADR 0031).

## Begründung

Ein langsamerer Hinweis war nicht gewollt; sichtbar wird ein kurzer Tropfen nur über
Kontrast. Ein Formularteil, das nur aufwächst, sagt nicht, woher es kommt — der Tropfen
aus dem Knopf schon, und es ist dieselbe Mechanik wie überall (ADR 0013: keine zweite).

## Folgen

- Suite `tropfen` (G, F, H, T).
- `tropfenAuf`/`tropfenZu` kennen `opt.grund`; `huellenBild` nimmt eine Farbe.
