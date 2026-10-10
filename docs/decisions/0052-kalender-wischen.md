# 0052 · Im Kalender blättert ein Wisch

*2026-10-10 · Wunsch des Nutzers (Ticket aus 0.14.0T) · Version 0.15.0T · ergänzt 0016, 0025, 0028*

## Ausgangslage

Woche und Monat ließen sich nur über die beiden Pfeile im Kopf des Kalenders blättern. Wer
mehrere Wochen weiter will, zielt jedes Mal auf denselben kleinen Knopf. Gewischt wurde
bisher nur vom Rand: links zurück (0016), rechts zum Menü (0025).

## Entscheidung

- **Ein waagerechter Wisch über Raster, Kopf oder Wochentage blättert**: nach links zur
  nächsten Woche oder zum nächsten Monat, nach rechts zurück — genau wie die Pfeile, über
  `kalBlaettern`, mit derselben Bewegung (0028).
- **Er wirkt beim Loslassen**, wie der Randwisch: mindestens 50 px waagerecht
  (`KAL_WISCH_WEG`), und waagerecht muß überwiegen (senkrecht höchstens 0,7-mal so weit),
  sonst rollte die Seite.
- **Der Rand bleibt dem Randwisch** (`WISCH_RAND`); die Tagesliste wischt nicht, dort
  liegen Zeilen unter dem Finger.
- **Ein Tipp gleich nach dem Blättern zählt nicht** (`KAL_WISCH_STILL`, 450 ms): Unter dem
  Finger liegt dann ein anderer Tag, den ein nachgeschickter Klick sonst wählte.
- Das Raster folgt dem Finger nicht. Es blättert, wenn der Wisch vorbei ist.

## Begründung

Eine Geste in derselben Mechanik wie die vorhandene (`wischBeginnen`/`wischEnden`) statt
einer zweiten; dieselbe Bewegung wie die Pfeile, damit Wischen und Tippen nicht zwei
verschiedene Kalender zeigen. Ein mitlaufendes Raster wäre eine neue Mechanik neben dem
Tropfen (0013) und rückte über den Rand (0029).

## Folgen

- Suite `kalender`, Abschnitt S.
