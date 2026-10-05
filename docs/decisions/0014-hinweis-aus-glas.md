# 0014 · Der Hinweis ist aus Glas

*2026-10-05 · Ansicht von 0.5.0T12 · Version 0.5.0T13 · ergänzt 0012, 0013*

## Ausgangslage

Der Hinweis «Datei geladen» hatte die Farbe des Grundes. Dunkel hob er sich nur durch
einen Schatten ab, der auf Schwarz kaum zu sehen ist; der Schleier dahinter (18 % Schwarz)
verschwand ganz. Der Hinweis las sich wie Text, der lose auf der Seite liegt. Auf den
Vorschlag, ihm dunkel die Kachelfarbe zu geben, kam der Wunsch: «sowas wie Liquid Glass».

## Entscheidung

- **Die Karte ist aus Glas**, hell wie dunkel (Klasse `.glas`): eine halbdurchsichtige
  Tönung `--glas`, dahinter der Grund verschwommen und satter
  (`backdrop-filter: blur(30px) saturate(180%)`, mit `-webkit-`), gefaßt von einer
  feinen Kante `--glas-kante` und einem Lichtsaum oben `--glas-licht`, darunter ein weicher
  Schatten. Der Schleier ist `--glas-schleier` — dunkel dichter (38 %) als hell (10 %).
- Die vier Farben sind Tokens und stehen in allen drei Paletten-Blöcken.
- **Auch der Tropfen ist Glas**: `tropfenAuf`/`tropfenZu` nehmen `glas` im `opt`; dann
  trägt die Hülle das Glas, und der Geist darin wird klar (`.im-tropfen`) — sonst läge
  Glas auf Glas, und die Karte spränge beim Ankommen von matt auf durchscheinend.
- Die Ansichten tropfen weiter ohne Glas.
- Die Tönung ist so dicht gewählt (68 % hell, 64 % dunkel), daß ein dunkler Knopf dahinter
  die Schrift nicht stört — am Bildschirmfoto nachgestellt.

## Begründung

Glas hebt die Karte in beiden Darstellungen ab, ohne eine neue Fläche einzuführen, und
paßt zur Gestalt von iOS 26. Eine eigene Farbe nur für dunkel hätte das Problem gelöst,
aber hell und dunkel auseinanderlaufen lassen.

## Folgen

- Wie stark iOS die Unschärfe zeichnet, zeigt nur das Gerät; der kopflose Browser
  rendert `backdrop-filter` nur grob.
- Wer weitere Glas-Teile baut, nimmt `.glas` und die Tokens, nicht eigene Werte.
- Suiten: `exportwege` (H2a, H4a, H8d), `bewegung` D7a (Ansichten ohne Glas).
