# 0008 · Tropfenform, Menü unter dem Knopf, Woche | Monat hält den Tag

*2026-10-05 · Ansicht von 0.4.0T2 · Version 0.4.0T3 · löst in 0007 «Das Menü bleibt das
Blatt von unten» und das bloße Schrumpfen in den Menüknopf ab · ergänzt durch 0020: ein langer Druck
öffnet auch aus Kacheln und Terminzeilen als Tropfen · Spitze abgelöst durch 0023: der Tropfen ist rund*

## Ausgangslage

Am Gerät gefiel das Zurück aus den Einstellungen in den Menüknopf — es war aber nur ein
Verkleinern, kein Tropfen. Das Menü kam weiter als Blatt von unten, anders als in
Chillingo, wo es unter seinem Knopf aufklappte. Und beim Wechsel Woche → Monat verschwand
der gewählte Tag, der Kalender sprang auf heute und ploppte in den Monat.

## Entscheidung

- **Tropfenform, wo die Quelle rund ist** (`tropfenQuelle`): Menüknopf, Menüeinträge,
  runde und pillenförmige Knöpfe. Kacheln und Terminzeilen behalten den Zoom aus 0007.
- **Zu** (`tropfenZu`): Die Ansicht wird als Geist in eine Hülle gelegt, die Lage, Größe und
  Ecken ändert; der Inhalt skaliert gleichmäßig mit. Vier Stationen: groß und eckig,
  halbwegs rund, ein deutlicher Tropfen kurz vor dem Knopf, Knopfgröße. **Bauch voran,
  Spitze hinten** — die Ecke unten links wird spitz (`TROPFEN_ZU`). Der Knopf nickt, wenn
  er ihn schluckt.
- **Auf** (`tropfenAuf`): umgekehrt; die Spitze hängt oben rechts am Knopf, der Bauch
  quillt voraus (`TROPFEN_AUF`). Die echte Ansicht steht derweil unsichtbar bereit.
- **Das Menü klappt unter dem Knopf auf**, rechtsbündig, so breit wie sein längster
  Eintrag (wie Chillingo), über einem leichten Schleier. Es quillt als Tropfen aus dem
  Knopf und fließt beim Schließen zurück. Ein Eintrag mit Ziel öffnet seine Ansicht als
  Tropfen aus dem Eintrag; das Menü ist im selben Augenblick weg. Zurück geht es in den
  Menüknopf.
- **Woche | Monat** behält den gewählten Tag und seine Liste. Gezeigt wird der Monat bzw.
  die Woche des Tags; ohne gewählten Tag, was gerade zu sehen war (`kalAnker`,
  `versatzFuer`). Der Monat quillt aus der Zeile der Woche, die Woche zieht sich als Geist
  aus dem Monat zusammen (`kalFliessen`). Die Wochentage stehen dafür über dem Raster.
- **Kurve:** Die Tropfen laufen auf einer Kurve ohne Überschwingen statt der `FEDER` —
  eine Hülle, die über den Knopf hinausschießt, sähe aus wie ein Fehler.

## Begründung

Ein Tropfen erzählt, woher etwas kommt und wohin es geht, ohne daß die Form lügt: Ein
runder Knopf kann einen Tropfen fassen, eine rechteckige Kachel nicht. Die Station kurz
vor dem Knopf ist der Unterschied zwischen «schrumpft» und «tropft» — ohne sie ist die
Form zu klein, um gesehen zu werden.

## Folgen

- Ein offenes Menü verdeckt einen Teil der Karte oben; der Schleier sagt, daß ein Tipp
  daneben schließt.
- Suiten: `bewegung` D1–D16 und R6–R8, `kalender` U1–U6.
- Wie der Tropfen auf dem iPhone wirkt (Tempo, Größe der dritten Station), zeigt nur das
  Gerät.

## Nachgestellt · 0.4.0T4

Am Gerät angesehen: Die Tropfen waren zu gemächlich, das Menü schloß weniger flüssig, als
es öffnete, und beim Kalenderwechsel schnappte es.

- **Tropfen 35 % schneller**: Ansichten 416 ms (`TROPFEN_DAUER`), Menü 338 ms
  (`MENUE_DAUER`).
- **Das Menü schließt wie es öffnet**, nur rückwärts: dieselben Bilder, dieselbe Dauer,
  gespiegelte Zeitpunkte. Der Inhalt geht, bevor das Blatt sich staucht, und am Knopf
  blendet der Tropfen aus, statt schlagartig zu verschwinden — beides war der Ruck.
- **Woche | Monat in einem Takt** (`KAL_TAKT`, 520 ms, ohne Überschwingen): Raster bzw.
  Geist, Kartenhöhe (`heldTakt`) und Tagesliste (`leisteGleiten`). Vorher liefen drei
  Bewegungen mit drei Dauern und zwei Kurven, und die Tagesliste sprang sofort an ihren
  neuen Platz — das war das Schnappen. Die Ränder des Rasters wandern linear im Takt, nur
  die Ecken bauchen sich in der Mitte.
