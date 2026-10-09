# 0014 · Der Hinweis ist aus Glas

*2026-10-05 · Ansicht von 0.5.0T12 · Version 0.5.0T13, klar 0.5.0T14 · ergänzt 0012, 0013*

## Ausgangslage

Der Hinweis «Datei geladen» hatte die Farbe des Grundes. Dunkel hob er sich nur durch
einen Schatten ab, der auf Schwarz kaum zu sehen ist; der Schleier dahinter (18 % Schwarz)
verschwand ganz. Der Hinweis las sich wie Text, der lose auf der Seite liegt. Auf den
Vorschlag, ihm dunkel die Kachelfarbe zu geben, kam der Wunsch: «sowas wie Liquid Glass».

## Entscheidung

- **Die Karte ist aus Glas**, hell wie dunkel (Klasse `.glas`): eine halbdurchsichtige
  Tönung `--glas`, dahinter der Grund verschwommen und satter
  (`backdrop-filter: blur(3px) saturate(190%)`, mit `-webkit-`), gefaßt von einer
  feinen Kante `--glas-kante` und einem Lichtsaum oben `--glas-licht`, darunter ein weicher
  Schatten. Der Schleier ist `--glas-schleier` — dunkel dichter (38 %) als hell (10 %).
- Die vier Farben sind Tokens und stehen in allen drei Paletten-Blöcken.
- **Auch der Tropfen ist Glas**: `tropfenAuf`/`tropfenZu` nehmen `glas` im `opt`; dann
  trägt die Hülle das Glas, und der Geist darin wird klar (`.im-tropfen`) — sonst läge
  Glas auf Glas, und die Karte spränge beim Ankommen von matt auf durchscheinend.
- Die Ansichten tropfen weiter ohne Glas.
- **Klar, nicht milchig** (0.5.0T14): Die erste Fassung (Tönung 68/64 %, Unschärfe 30 px)
  sah am Gerät aus wie eine matte Karte — Schrift dahinter verschwand ganz. Jetzt 42/40 %
  und 3 px: Was dahinter steht, bleibt als Schrift erkennbar, die eigene bleibt lesbar.
- **Der Schleier blendet als `::before`, nie das Blatt.** Ein Vorfahr mit Deckkraft unter 1
  ist die Grenze des Glases: Die Karte sah dann nur den Schleier hinter sich, nicht die
  Seite.

## Begründung

Glas hebt die Karte in beiden Darstellungen ab, ohne eine neue Fläche einzuführen, und
paßt zur Gestalt von iOS 26. Eine eigene Farbe nur für dunkel hätte das Problem gelöst,
aber hell und dunkel auseinanderlaufen lassen.

## Folgen

- Wie stark iOS die Unschärfe zeichnet, zeigt nur das Gerät; der kopflose Browser
  rendert `backdrop-filter` nur grob.
- Wer weitere Glas-Teile baut, nimmt `.glas` und die Tokens, nicht eigene Werte.
- Suiten: `exportwege` (H2a, H4a, H4b, H8d), `bewegung` D7a (Ansichten ohne Glas).
