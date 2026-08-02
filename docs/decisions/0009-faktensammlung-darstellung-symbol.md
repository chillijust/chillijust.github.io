# 0009 · Faktensammlung, Darstellungswahl und App-Symbol

**Status:** angenommen · 2026-08-02

## Kontext

Drei Wünsche aus der Nutzung, dazu ein Fehler:

- Die Sprachfakten kamen gut an, waren aber flüchtig: 24 Stück, nach der Anzeige weg,
  keine Möglichkeit, einen noch einmal zu lesen.
- Die Darstellung folgte allein dem System. Wer das iPhone hell stellt, bekam die App
  hell — ohne Wahl.
- Über „Zum Home-Bildschirm" legte Safari mangels Symbol ein Bildschirmfoto der Seite ab.
- Die klebende Reiterleiste ließ oberhalb einen durchsichtigen Streifen, durch den der
  Inhalt sichtbar scrollte.

## Entscheidung

1. **101 Fakten statt 24** — deutsche Lehnwörter, falsche Freunde, Schrift- und
   Aussprachefallen, Grammatik in einem Satz, Alltag und Wortgeschichte.
2. **Die Fakten werden gesammelt.** `state.fakten` hält je Fakt, wie oft er gezeigt wurde
   und ob er Favorit ist. Eine eigene Ansicht listet sie, gefiltert nach Gesehenem,
   Favoriten oder allen. Die Auswahl beim Üben bevorzugt Ungesehenes, dann das am
   seltensten Gezeigte — vorher lief ein starrer Index im Kreis.
   Gemerkt wird über einen **Hash des Textes**, nicht über den Text selbst: Der
   Sicherungscode bliebe sonst um Kilobytes länger.
3. **Darstellung als Einstellung** (`system`, `dunkel`, `hell`) über `data-theme` am
   `<html>`-Element. Die Medienabfrage greift nur noch, solange nichts gewählt ist.
4. **App-Symbol als PNG-Daten-URI** im `<link rel="apple-touch-icon">`: das Maskottchen
   (Chili mit «Я»-Sprechblase, `docs/IMG_2942.png`), auf 180 px verkleinert — die
   Verkleinerung läuft in reinem Python über zlib, ohne Bildbibliothek. Dazu
   `apple-mobile-web-app-title`, damit unter dem Symbol „Chillingo" steht und nicht der
   volle Seitentitel. Kosten: rund 30 KB in `index.html`.
5. **Die klebende Leiste bekommt einen eigenen Rahmen** (`#navbar`). Der Rahmen trägt
   Hintergrund und Abstand zur Notch, die Leiste darin darf scrollen.

## Begründung

Zum Fehler: Der Hintergrund lag vorher auf `#tabs` selbst, zusammen mit `overflow-x:
auto`. Ein Scrollbereich beschneidet, was über seinen Rand hinausragt — die Abdeckung
oberhalb der Leiste wurde also weggeschnitten. Das ließ sich nur durch Trennung von
Rahmen und Scrollbereich lösen.

Zum Symbol: Ob iOS Daten-URIs für `apple-touch-icon` in jeder Version annimmt, ist nicht
verlässlich dokumentiert. Die Alternative — eine `icon.png` neben `index.html` — bricht
die Ein-Datei-Vorgabe aus ADR 0001 für etwas, das nur beim Ablegen auf dem
Home-Bildschirm gebraucht wird. Deshalb zuerst der Weg, der die Vorgabe hält; zeigt das
iPhone weiterhin ein Bildschirmfoto, ist die separate Datei der nächste Schritt — dann
bewusst und mit Notiz in ADR 0001.

## Folgen

- `state.fakten` wächst auf einen Eintrag je gesehenem Fakt (Kennung plus zwei Zahlen)
  und geht in den Sicherungscode ein.
- **Wird ein Fakt umformuliert, ändert sich sein Hash** — Zähler und Favorit des alten
  fallen beim nächsten Laden weg. Für Tippfehlerkorrekturen ein akzeptabler Preis.
- Die Ansichten ohne Reiter sind jetzt zwei (Einstellungen, Sprachfakten). Beide kehren
  über `letzterTab` zurück; `setTab()` merkt sich den Rückweg für beide.
- Die helle Palette steht doppelt im Stylesheet (Medienabfrage und `data-theme`). Wer
  Farben ändert, muss beide Stellen anfassen — die Alternative wären Variablen auf
  Variablen, was den Quelltext schwerer lesbar macht als die Wiederholung.
