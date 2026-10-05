# 0007 · Tropfen statt Aufploppen

*2026-10-05 · Ansicht von 0.4.0T · Version 0.4.0T2*

## Ausgangslage

Beim Tippen ploppte vieles: Die Liste unter einem Tag war schlagartig da und weg, eine
Ansicht ersetzte die andere hart, die Markierung der Umschalter sprang, Formularteile
(Uhrzeit, Reihenende, Wochentage) tauchten ohne Übergang auf und ab, und die Karte oben
sprang beim Wechsel Woche | Monat auf ihre neue Höhe. Gewünscht: gleitende Übergänge
«wie Tropfen bei Apple» — auf Nachfrage die Bewegung von Liquid Glass aus iOS 26: Was
aufgeht, quillt aus dem Getippten heraus und fließt beim Schließen dorthin zurück. Nur die
Bewegung, nicht die gläserne Optik.

## Entscheidung

- **Der Zustand stimmt sofort, das Bild folgt.** `render()` zeichnet wie bisher ohne
  Verzug; die Bewegung legt sich nur darüber. Was verschwindet, steht kurz als **Geist**
  da (`geist(el)`): eine Kopie hinter einer Schattenwurzel mit dem Stylesheet der Seite,
  `aria-hidden`, ohne Zeiger — Skripte, Prüfungen und Vorleser finden sie nicht, Ids
  kollidieren nicht. Sie räumt sich am Ende selbst ab.
- **Eine Feder** (`FEDER`): eine gedämpfte Schwingung, als CSS-`linear()` mit 33
  Stützpunkten, etwa 4 % über das Ziel. Ohne `linear()` eine Ersatzkurve. Auch CSS nutzt
  sie über `--feder`.
- **Tagesliste:** Ein Tropfen löst sich vom getippten Tag, fällt, wird breit und ist die
  Liste, ihr Inhalt blendet nach (`tropfenFallen`). Zu fließt die Liste als Geist in ihren
  Tag zurück (`leisteZurueck`). Die Karte zieht ihre Höhe nach (`heldNachziehen`), alles
  darunter rückt mit — auch bei Woche | Monat und beim Blättern.
- **Ansichten wachsen aus dem Getippten** (`uebergangVorbereiten`,
  `uebergangAusfuehren`): Wer eine Kachel, eine Terminzeile oder einen Knopf tippt, sieht
  die neue Ansicht daraus herauswachsen — verschoben, gleichmäßig skaliert und auf das
  Seitenverhältnis der Kachel beschnitten, wie die Zoom-Übergänge des iPhones. Zurück
  schrumpft die Ansicht in ihre Kachel hinein (`herkunft`); aus dem Menü Geöffnetes
  schrumpft in den Menüknopf. Ohne Tipp blendet die Ansicht sanft ein. Das Dashboard
  kommt dorthin zurück, wo man es verlassen hat (`homeScroll`).
- **Umschalter:** Jede `.wahl` trägt eine Marke (`wahlenSetzen`), die sich beim Wechsel
  wie ein Tropfen bis zum neuen Knopf streckt und dann nachzieht. Schalter strecken ihren
  Knauf beim Drücken, Wochentage geben unter dem Finger nach.
- **Formularteile** gehen über `teilZeigen(el, an)` statt `el.hidden`: auf wächst das Teil
  in seine Höhe, zu zieht sich sein Geist zusammen. `hidden` gilt dabei sofort.
- **Das Menü** bleibt das Blatt von unten; es war nicht gemeint.
- **`prefers-reduced-motion`**: nichts davon — kein Geist, kein Tropfen, die Marke springt.

## Begründung

Erst zeichnen, dann bewegen hält alles Bisherige gültig: Prüfungen, Ereignisse und der
Zustand kennen keine Zwischenzeit. Ein Geist im Schatten-DOM ist das Einzige, was zugleich
gleich aussieht und für Skripte nicht da ist. Die Feder statt fester Kurven ist, was Apples
Bewegungen «flüssig» wirken läßt: schnell los, kurz darüber, ruhig ans Ziel.

## Folgen

- Messungen im Prüfstand fragen das Ziel: `ausbewegt()` in `helfer.mjs` bringt laufende
  Animationen ans Ende, bevor Lage oder Größe gemessen wird. Der Läufer rechnet in
  virtueller Zeit und zeichnet keine Bilder — Animationen kommen dort nie von selbst an.
- Aufgeräumt wird über das Versprechen `finished`, nicht über das Ereignis — es löst auch,
  wenn die Animation von außen beendet wird.
- Suite `bewegung` sichert Tropfen, Geister, Zoom, Marke, Formularteile und den Verzicht
  ohne Bewegung.
