# 0035 · Zeichen bewegen sich, wenn sie erscheinen

*2026-10-06 · Ticket «Mitteilung Animation» · Version 0.11.0T · ergänzt 0018, 0019 · die Zeichen der Meldung abgelöst durch 0051; der Haken der Kachel gilt*

## Ausgangslage

Die Meldungen im Glas trugen ein Zeichen — den grünen Haken oder das neutrale «i» —, das
einfach dastand. Gewünscht: Das Häkchen soll sich beim Speichern «abhaken». Auf Nachfrage
dazu gewählt: das Hinweis-Zeichen, der Haken auf der Kachel, ein Pfeil für «Datei
geladen», zwei Blätter für «Kopiert».

## Entscheidung

- **Haken** (`ICON.haken`, `.z-strich`, `pathLength="1"`): zeichnet sich von links nach
  rechts, im Glas wie auf der Kachel, die eben abgehakt wurde (`.gw-kachel.gerade`).
- **Hinweis** (`.z-punkt`, `.z-strich`): Der Punkt fällt als Tropfen, danach wächst der
  Strich.
- **Datei geladen** (`ICON.laden`, `.z-pfeil`): Der Pfeil fällt in die Schale und federt
  kurz nach. Der Hinweis mit «OK» trägt dieses Zeichen, weil er es nennt (`opt.zeichen`).
- **Kopiert** (`ICON.kopie`, `.z-blatt`): Das zweite Blatt schiebt sich aus dem ersten —
  beim Sicherungscode wie bei den Tickets.
- Kopiert und Geladen sind gelungen und darum grün wie der Haken; neutral bleibt allein
  das «i». Ein Hinweis mit «OK» trägt nur ein Zeichen, wenn er eins nennt.
- Jedes Zeichen bewegt sich **einmal, jedes Mal**, wenn es erscheint (`zeichenZeichnen`
  nimmt die Klasse `zeichnet` und setzt sie neu). Die Bewegung ist reines CSS; unter
  «Bewegung reduzieren» steht sie still.

## Begründung

Eine Bestätigung, die man sieht, während sie entsteht, sagt «das ist eben geschehen» —
das stille Zeichen sagte nur «das ist so». Die Bewegungen sind kurz (unter 0,7 s) und
laufen innerhalb der Bestätigung ab, die ohnehin 1,4 s steht.

## Folgen

- Suite `zeichen` (G, K, L, A, B).
- `melden(text, zeichen)` reicht `'kopie'` durch; `ZEICHEN` nennt, was es gibt.
