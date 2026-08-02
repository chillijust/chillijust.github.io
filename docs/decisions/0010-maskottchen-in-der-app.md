# 0010 · Das Maskottchen tritt in der App auf

**Status:** angenommen · 2026-08-02

## Kontext

Die Chili war bis hierher nur App-Symbol: sichtbar auf dem Home-Bildschirm, unsichtbar in
der App. Gleichzeitig hat die App drei Stellen, an denen sie nichts zu bieten hat außer
einer Absage — die Leerzustände in „Tippen", „Übersetzen" und der Faktensammlung — und
eine Stelle, an der etwas zu feiern wäre, aber nichts passierte: das geschaffte Lernset.

## Entscheidung

1. **Ein Bild, vier Auftritte.** Die Chili ist aus dem Icon freigestellt und liegt als
   verstecktes `<img id="chiliQuelle">` im Body; `maskottchen(klasse)` reicht ihre Quelle
   weiter. Die 20 KB liegen damit genau einmal in der Datei, gleich wie oft sie auftritt.
   Freigestellt wird mit `tools/freistellen.py`: Hintergrund vom Rand her fluten — aber
   nur über Pixel, die wirklich türkis sind —, dann die größte zusammenhängende Fläche
   behalten. Reines Wachsen über Farbabstände lief über die weichen Wangen-Ovale in die
   Figur hinein und ließ nur die Sprechblase übrig.
2. **Faktenkarte:** Die Chili steht unter einer Sprechblase, aus der sie den Fakt sagt.
   Der Zipfel ist ein gedrehtes Quadrat mit zwei Rahmenkanten und zeigt auf ihren Kopf.
3. **Leerzustände:** die Chili über der Überschrift. Eine Sperre bleibt eine Sperre, wirkt
   aber freundlicher, wenn jemand sie überbringt.
4. **Jubelkarte:** Macht eine Antwort das laufende Lernset voll, erscheint beim nächsten
   «Weiter» eine Karte mit der Chili, der Zahl der freigeschalteten Sätze, zwei Beispielen
   daraus und dem Knopf „Zu «Übersetzen»". Das ist der Moment, auf den der ganze
   Lernweg zuläuft — vorher fiel er unter den Tisch.

## Begründung

Ein Maskottchen, das überall steht, wird zur Tapete. Diese vier Stellen haben gemeinsam,
dass gerade nichts zu tun ist: Der Fakt ist eine Pause, der Leerzustand eine Wartezeit,
der Jubel ein Abschluss. Genau dort trägt eine Figur, ohne im Weg zu stehen.

Die Jubelkarte wartet bewusst auf das nächste «Weiter», statt sofort zu erscheinen. Sonst
verdeckte sie die Auflösung der letzten Frage — der Nutzer sähe nie, ob die letzte Antwort
richtig war.

## Folgen

- Das Bild darf nur an einer Stelle in der Datei stehen. Wer eine zweite Größe braucht,
  skaliert im Browser (CSS), nicht durch ein zweites Einbetten.
  `tools/…`-Prüfung dafür gibt es nicht; der Test im Scratchpad zählt die Vorkommen.
- Wird das Symbol getauscht, wechselt automatisch auch die Figur in der App.
- Nebenbefund beim Testen: Einbuchstabige Wörter («я», «в», «у») landeten im
  Kachel-Modus, wo es nichts zusammenzusetzen gibt. Kacheln gibt es jetzt erst ab drei
  Buchstaben.
