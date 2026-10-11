# 0055 · Kontrast in Dunkel, Saum am Flüssigen

*2026-10-10 · Befund des Nutzers am Gerät (Dunkel) zu 0.17.0T5 · Version 0.17.0T6 ·
ergänzt 0054*

## Ausgangslage

Der Nutzer arbeitet fast nur in Dunkel. Dort fehlte Kontrast: Der Menüknopf war kaum zu
sehen, das Menü stand schwarz auf Schwarz, ein ausgeschalteter Schalter verschwand, und
das Flüssige war unsichtbar — es hat die Farbe seines Teils, und Ansicht wie Menü haben
den Grund der Seite; ein Schatten trägt auf Schwarz nicht. Dazu legte die Lichtkante einen
grauen Schleier über jeden Tropfen («Glas» beim Wechsel Woche/Monat): Ihr Filter stanzte
mit der Deckkraft ihrer Farbe aus, in Dunkel 38 %, und ließ 62 % der Fläche stehen.

## Entscheidung

- **Erhöhtes ist in Dunkel heller als der Grund**, mit einem feinen hellen Rand:
  `--erhoben` (Menü), `--marke` (Marke einer Wahl), `--spur` (Schalter), `--rand-hell`
  (Rand an Menü, Marke, runden Knöpfen). `--flaeche` und `--flaeche-2` steigen leicht.
  In Hell ändert sich nichts — die Tokens haben dort die alten Werte.
- **Das Flüssige trägt im Fließen einen Saum** (`--fl-rand`) und hebt sich in Dunkel um
  `--fl-hebung` Prozent zum Weißen; in Ruhe ist es wieder genau das Teil, so springt am
  Ende nichts (`fpZeichnen`: Fluß und eingerückter Kern). Glas spart den Tropfen um den
  Saum eingerückt aus, so faßt der Saum das Glas.
- **Die Lichtkante stanzt mit voller Deckkraft aus** (`feComponentTransfer` vor dem
  Versatz) — nur ein Saum oben, kein Schleier.
- Nebenbei, am selben Befund: Eine Ansicht aus dem Menü quillt auf iOS aus dem
  Menüknopf (der Eintrag ist fort, wenn sie kommt); auf iOS wechselt die Tagesliste beim
  Wechsel des Tags nur den Inhalt, und der Ring gleitet in gleicher Dicke; ein Zähler
  schickt ebenfalls einen Tropfen in den Tagesring; neu gezeichnet blendet weder ein
  Wahlknopf noch ein Kalendertag seinen alten Grund aus — das sah aus wie eine zweite
  Marke (auch in Chilli).

## Begründung

In Dunkel trägt nur Helligkeit, nicht Schatten. iOS 26 hebt erhöhte Flächen in Dunkel
ebenso an und faßt Flüssiges mit einem Lichtrand.

## Folgen

- Neue Tokens stehen in allen drei Paletten-Blöcken; die dunkle Palette bleibt zweimal
  gleich (Suite `thema`).
- Suite `fluessig`, Abschnitt D, Q, W3, T, Z.
