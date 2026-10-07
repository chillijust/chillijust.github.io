# 0029 · Der Auftritt beim Kaltstart; die Woche rückt nicht über den Rand

*2026-10-06 · zwei Tickets vom Gerät (App-Stand 0.9.0 und 0.9.1T) · Version 0.10.0T, abgenommen mit 0.10.0T2 ·
ergänzt 0010 (Schriftzug); ändert 0028 (Seitentropfen der Woche)*

## Ausgangslage

- Gewünscht: Beim Öffnen steht mittig nur «Chilli Journal», der Schriftzug schreibt sich,
  wandert nach oben links, dann tropft das Dashboard auf.
- Fehler: Beim Blättern in der Woche verkleinerte sich kurz die ganze Übersicht.
  Ursache: Die neue Woche rückte aus 48 px Entfernung von rechts herein und ragte dabei
  über den Bildschirmrand. Die Seite wurde für diesen Moment breiter (503 statt 500 px im
  Prüfstand), und iOS verkleinerte die ganze Ansicht, damit sie hineinpaßt.

## Entscheidung

- **Auftritt bei jedem Kaltstart** (`auftritt`, `auftrittEnde`, `dashboardAuftropfen`):
  Alles außer dem Schriftzug ist unsichtbar und nimmt keinen Tipp an. Der Schriftzug steht
  doppelt so groß in der Mitte und schreibt sich (2,3 s). Dann wandert er in 0,7 s und
  kleiner werdend an seinen Platz oben links. Danach blenden Datum, Schalter und Knöpfe
  auf, und die Karten tropfen von oben nach unten einzeln auf: je als Perle, die sich zur
  Karte streckt, 110 ms nacheinander. Was unter dem Bildrand liegt, ist einfach da.
- **Ein Tipp irgendwohin überspringt ihn.** Kommt die App nur aus dem Hintergrund zurück,
  gibt es keinen Auftritt; ebenso nicht bei abgeschalteter Bewegung.
- **Die neue Woche quillt nur aus der Perle am Rand**, ohne seitliche Verschiebung. Der
  Geist der alten Woche darf weiter wandern: Er steht fest (`position: fixed`) und zählt
  nicht zur Breite der Seite.
- **Prüfstand und Bildbau beenden den Auftritt still**, bevor sie messen oder
  fotografieren. Der Läufer zeichnet keine Bilder, der Auftritt käme dort nie an.

## Begründung

Ein Auftritt, den man nicht überspringen kann, wird beim zehnten Öffnen lästig. Eine
Bewegung, die über den Rand ragt, ist auf dem Handy kein Schönheitsfehler: Die Seite
wird breiter, und iOS verkleinert sie.

## Folgen

- Suiten: `auftritt` (neu) A0–A13; `nachschliff` S9 (nie breiter als der Bildschirm).
- Version 0.10.0T: Es kommt etwas dazu, gespeicherte Daten bleiben, wie sie sind.
- Wie der Auftritt am Gerät wirkt, zeigt nur das Gerät — auch, ob 2,3 s Schreiben zu lang
  sind.
