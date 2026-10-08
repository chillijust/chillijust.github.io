# 0043 · Langer Druck markiert nichts, der Gast tropft aus der Ecke

*2026-10-08 · zwei Tickets vom Gerät (App-Stand 0.13.0T2) · Version 0.13.0T3 · ändert 0042*

## Ausgangslage

- Wer einen Termin lange drückte, um ihn zu bearbeiten, sah in der geöffneten Ansicht gleich einen
  Text markiert. Zwei Ursachen: Die Termin-Zeile ließ — anders als die Kachel — Text markieren; und
  nach 500 ms steht die neue Ansicht schon unter dem Finger, der noch aufliegt, und iOS markiert
  dort das Wort unter ihm.
- Rollte die Seite bei offenem Menü, stand der Gast des Menüknopfs schon oben, solange der Knopf
  selbst noch zu sehen war — zwei Menüknöpfe übereinander (0042).

## Entscheidung

- **Die Termin-Zeile ist auch hierin eine Kachel**: kein Markieren, kein Menü von iOS, und wer hält,
  sieht sie einsinken (`.tm-zeile.halten`).
- **Nach einem langen Druck ist nichts markierbar, bis der Finger sich hebt** (`langHalten`, Klasse
  `lang-haelt` an der Wurzel); was schon markiert war, geht. Ein Zeitgeber räumt nach acht Sekunden
  auf, falls das Heben nie ankommt. Gilt für jeden langen Druck — Gewohnheit, Abgewöhnen, Termin.
- **Der Gast tropft erst, wenn der Knopf ganz hinaus ist**: Bis dahin folgt das Blatt dem Knopf.
  Ist er aus dem Bild, fällt sein Gast aus der Ecke oben rechts herab, das Blatt im selben Takt mit
  ihm; erreicht der Knopf beim Zurückrollen seinen Platz, ist der Gast wieder er.
- **Solange der Gast da ist, ist der Knopf unsichtbar** (`menue-gast-da`, `menueGastWeg`) — auch,
  wenn das Menü hinuntergerollt geöffnet wird und der Gast vom Knopf herabtropft. Zwei Menüknöpfe
  gibt es nie.

## Begründung

Ein langer Druck ist eine Geste, kein Markieren; was danach erscheint, gehört dem Finger noch nicht.
Und ein Gast ist der Knopf unterwegs — sind beide zu sehen, ist es keiner von beiden.

## Folgen

- Suiten: `langdruck` M1–M3; `menue` M1–M3c (ersetzen M1–M3 aus 0042), R3a, R5.
- Version 0.13.0T3: gelesen wird alles wie bisher.
