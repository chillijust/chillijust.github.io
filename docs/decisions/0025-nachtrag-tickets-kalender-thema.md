# 0025 · Nachtrag: Wisch von rechts, schmale Bestätigung, Tickets im Blatt, Kalender, Hell/Dunkel als Tropfen

*2026-10-06 · Ticket vom Gerät (App-Stand 0.9.0T3) · Version 0.9.0T4 · ändert 0021 («Alle Tickets»),
0023 («Hinzufügen», Kalenderwochen, Wisch); ergänzt 0018 (Bestätigung), 0019 (Hinweis bietet eine Wahl) · «Hinzufügen» tropft seit 0041 aus dem Plus*

## Ausgangslage

Ein Ticket mit zehn Punkten nach der Abnahme von 0.9.0T3:

- Zum Menü wischen auf der Übersicht ging nicht — gewischt wurde vom **rechten** Rand nach
  links, zum Menüknopf hin; gebaut war nur der linke.
- Das Fenster «Gespeichert» war so breit wie ein Hinweis mit «OK».
- «Alle Tickets» klappte das Blatt zu und öffnete eine eigene Ansicht.
- Der Fließtext im Ticket stand fest auf drei Zeilen.
- Im Monat lief der Strich senkrecht neben einer KW-Spalte.
- Der Wechsel Woche ↔ Monat sah nicht nach Tropfen aus.
- Der Kreis um die Zahl von heute war zu groß.
- «Hinzufügen» klappte drei Knöpfe in die Liste.
- Hell ↔ Dunkel ging zu schnell und blendete nur über.

## Entscheidung

- **Wisch vom rechten Rand nach links öffnet das Menü**, auf der Übersicht wie unterwegs
  (unterwegs führt er nach Hause, dort ist der Menüknopf). Der linke Rand bleibt, wie er war.
- **Eine Bestätigung ist so breit wie ihr Text** (`width: auto`, mindestens 180 px,
  höchstens wie ein Hinweis).
- **«Alle Tickets» bleibt im Blatt**: Kopf mit Zurück, die offenen Tickets, «Kopieren»,
  die abgegebenen gedimmt. Die Zeilen tropfen nacheinander auf (je 70 ms später, als Perle
  links, die sich zur Zeile streckt). Eine Zeile öffnet ihr Ticket im selben Blatt; Zurück
  holt den Entwurf wieder. Das Blatt wächst weich in die neue Höhe (`ticketBlattWechseln`).
- **Der Fließtext wächst mit** (`textWachsen`): eine Zeile zu Beginn, höchstens drei, dann
  rollt er in sich.
- **Monat: über jeder Woche ein Strich quer durch den Kalender**, vorn darauf klein
  «KW 41» (`.kal-kw-zeile`). Die KW-Spalte entfällt in beiden Darstellungen; die Woche nennt
  ihre KW im Titel. Damit bleibt die Woche auch ohne Spalte genau unter ihren Tagen im Monat.
- **Woche ↔ Monat tropft**: Der Monat quillt aus der Zeile der Woche erst als runde Perle
  (seitlich eingerückt, ganz rund), wird bauchig und läuft nach oben und unten aus; zurück
  rückwärts.
- **Der Kreis um heute ist 30 % kleiner** (`::before`, `scale(.7)`); die Zahl bleibt gleich
  groß, nichts in der Zeile springt.
- **«Hinzufügen» öffnet ein Fenster aus Glas**, das aus dem Knopf tropft: Termin,
  Gewohnheit, Abgewöhnen untereinander, darunter «Abbrechen». `hinweisZeigen` kennt dafür
  `opt.wahl`; zurück fließt die geöffnete Ansicht in «Hinzufügen».
- **Hell ↔ Dunkel**: Der Knauf fährt 50 % gemächlicher (750 ms), danach wächst die neue
  Darstellung als runde Scheibe aus dem Schalter über den Bildschirm (`startViewTransition`,
  700 ms). Ohne diese Technik blendet es 50 % langsamer über (450 ms). Kommt der Übergang
  binnen 400 ms nicht in Gang, gilt die Wahl trotzdem — nur ohne Tropfen.

## Begründung

Der Menüknopf sitzt rechts; dorthin wischt der Daumen. Was eine Bestätigung sagt, ist kurz —
eine breite Karte für ein Wort wirkt leer. Eine Liste, die das Blatt verläßt, reißt aus dem
Schreiben heraus. Linien zwischen den Wochen lesen sich wie ein Kalender auf Papier; die KW
auf der Linie spart eine Spalte. Glas mit Lichtsaum am Rand der wachsenden Scheibe ist mit
`clip-path` nicht zu haben — die Scheibe ist rund und weich, mehr nicht.

## Folgen

- Suiten: `menue` W7–W10, B1; `tickets` U6–U12; `nachschliff` H2, A1–A5, K1–K8, R0;
  `termine` K6, K9, K10; `thema` C0 und längere Wartezeiten.
- Ob der Übergang Hell ↔ Dunkel am Gerät als Tropfen läuft, zeigt nur das Gerät: Der
  kopflose Browser zeichnet keine Bilder, dort greift die Absicherung nach 400 ms.
