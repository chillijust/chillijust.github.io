# 0013 · Nur «Als Datei laden»; der Hinweis tropft wie die Ansichten

*2026-10-05 · Abnahme von 0.5.0T8 · Version 0.5.0T9 · löst in 0009 «beide Wege» ab, ändert in 0012 den Tropfen des Hinweises*

## Ausgangslage

Die Abnahme am Gerät (iPhone, Home-Bildschirm-App) hat ergeben:

- **«Als Datei laden» bringt die Einträge in den Kalender, «Teilen» nicht.** Das
  Teilen-Blatt bietet für eine `.ics` keinen Weg in den Kalender an; ein Kurzbefehl wäre
  nötig, und den soll niemand anlegen müssen.
- **Der Hinweis nach dem Laden tropfte zu schnell.** Er lief zwar so lang wie die
  Ansichten (`TROPFEN_DAUER`), aber mit eigener Mechanik: die Karte nur gestaucht
  (`transform: scale` mit zwei Achsen), ohne Station, in der die Tropfenform steht. Das
  sah gehetzt aus. Maßstab ist der Rücktropfen einer Ansicht, etwa der Einstellungen in
  den Menüknopf.

## Entscheidung

- **«Teilen» geht.** `kannTeilen` und `icsTeilen` sind entfernt; «Als Datei laden» ist der
  einzige Weg und immer der Hauptknopf.
- **Der Hinweis nimmt den Tropfen der Ansichten**: Er quillt über `tropfenAuf` aus dem
  Knopf und fließt über `tropfenZu` in sein Ziel — dieselben fünf Stationen, dieselbe
  Kurve, dieselbe Dauer, die Hülle mit dem Geist der Karte. Beide nehmen dafür die Ecken
  der Fläche mit (`rund`, beim Hinweis 18px), `tropfenZu` zusätzlich `fertig`. Die eigene
  Mechanik (`hinweisBilder`, `tropfenSpitze`) ist entfernt.
- Die Quelle wird gemessen, **bevor** neu gezeichnet wird — nach dem Laden ist der Knopf
  schon zugetropft. Ist das Ziel beim Schließen nicht zu sehen, fließt er in die Quelle
  zurück; dort nickt nichts.

## Begründung

Ein Tropfen ist eine Bewegung, nicht zwei: Wer neben dem Rücktropfen der Ansichten eine
zweite Fassung sieht, sieht den Unterschied, auch wenn die Dauer gleich ist. Ein Weg, der
nicht im Kalender ankommt, ist kein Weg.

## Folgen

- Das Offene aus 0009 ist entschieden; Abschnitt 5 hängt nur noch an der Abnahme von
  0.5.0T9.
- Suiten: `export` ohne Teilen (A10 fragt, daß es keinen Weg dazu mehr gibt);
  `exportwege` H2/H8 fragen die Hülle der Ansichts-Tropfen, H10/H11 den Rückweg in die
  Quelle.
