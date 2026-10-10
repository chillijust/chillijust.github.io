# 0052 · Der Kalender folgt dem Finger

*2026-10-10 · Wunsch des Nutzers (Ticket aus 0.14.0T), gewählt am Gerät aus der Wischprobe
in 0.15.0T3 · Version 0.15.0T4 · ergänzt 0016, 0025; löst den Seitentropfen der Woche aus 0028
und das Einblenden des Monats ab*

## Ausgangslage

Woche und Monat ließen sich nur über die beiden Pfeile blättern; wer mehrere Wochen weiter
will, zielt jedes Mal auf denselben kleinen Knopf. Ein erster Wisch (0.15.0T, T2) blätterte
erst beim Loslassen — der Nutzer wollte, dass Titel und Tage dem Finger folgen. Drei Arten
standen am Gerät zur Wahl (Karussell, Schieben und Blenden, Tropfen), je 1:1 oder
gebremst. Gewählt: **Tropfen, 1:1**.

## Entscheidung

- **Die Seite folgt dem Finger 1:1**: Titel, Wochentage und Tage gleiten, die Pfeile liegen
  darüber und bleiben stehen. Gezogen wird auf der ganzen Karte unter Ring und Umschalter
  bis an ihren Rand, nicht auf den Pfeilen und nicht über der Tagesliste
  (`kalWischFlaeche`, vom Nutzer am Gerät umrissen). Woche und Monat gleich.
- **Tropfen**: Die Seite wird bauchig, zieht sich zur Perle an der Seite, zu der der Finger
  zieht, und tropft ab; die neue quillt aus einer Perle am anderen Rand (Stationen wie in
  0028). Die Höhe gleitet mit — ein Monat hat fünf oder sechs Zeilen.
- **Losgelassen wird nach Weg oder Schwung geblättert**: mehr als 0,3 der Breite
  (`KAL_WEG`) oder schneller als 0,45 px/ms (`KAL_SCHWUNG`); sonst federt die Seite zurück.
  Eher senkrecht gezogen rollt die Seite (`touch-action: pan-y`), der Kalender bleibt.
- **Pfeile und «zurück zu heute» spielen dieselbe Bewegung.** Die Tagesliste geht beim
  Blättern, wie bisher.
- **Gezeichnet wird sofort** (0007): Der neue Stand steht, sobald geblättert ist, und die
  Bewegung legt sich darüber. Sie ist dafür symmetrisch gebaut (`kalGehen`): Eine Seite, die
  zum Anteil t nach links geht, sieht aus wie eine, die zum Anteil 1 − t von links kommt.
- Der Rand des Bildschirms bleibt dem Randwisch (`WISCH_RAND`); ein Tipp gleich nach dem
  Ziehen zählt nicht (`KAL_WISCH_STILL`).

## Begründung

Am Gerät wählt man Bewegung besser als nach Beschreibung. Der Tropfen ist die Mechanik der
App (0013) und war schon die Bewegung der Pfeile — jetzt nur am Finger. Die Symmetrie erlaubt,
den Stand beim Loslassen sofort zu setzen und die Bewegung nahtlos fortzuführen, statt auf
ihr Ende zu warten. Das Fenster schneidet am Rand der Karte ab; nichts ragt über den
Bildschirm (0029).

## Folgen

- Suite `kalender` (Abschnitt S), `nachschliff` (Abschnitt S).
- Drei Seiten liegen übereinander (`kal-seite`, davor und danach nur zum Ansehen, ohne
  `data-kaltag`); `kalSeitlich`, der Geist der Woche und das Einblenden des Monats entfallen.
