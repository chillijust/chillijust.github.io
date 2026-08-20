# 0090 · Nur ein Blatt, keine Zeile, und die Nachschrift gilt auch getippt

**Stand:** angenommen · 2026-08-16 · aus drei Tickets
**Ergänzt:** ADR 0070 (wann die Nachschrift kommt) · ADR 0082 (die Leiste zog um)
**Ändert:** ADR 0086 (die Zeile unter der Auflösung)

## 1 · Die Nachschrift fehlte beim Tippen in «Lernsets»

**Befund:** «Die Bestrafung bei Tippen von Wörtern im Lernset fehlt. In den
Settings habe ich *auch Sätze* aktiv.»

ADR 0070 sagt: Die Nachschrift kommt, wo der Nutzer eine **Schreibweise
behauptet** hat — gelegt wie geschrieben. Die Zeile las:

```js
rekoVerlangen(q.word.ru, q.mode === 'tiles', uebCorrect, false);
```

Für gelegte Kacheln richtig, und seit ADR 0088 unvollständig: Die Tippaufgabe
in «Lernsets» ist der Ort, an dem am meisten geschrieben wird — und genau dort
verlangte niemand etwas nach.

*Wer eine Bedingung auf Aufgabenformen aufzählt, muss sie erweitern, sobald
eine dazukommt. Die Frage lautet nicht «welcher Modus», sondern «wurde eine
Schreibweise behauptet».*

## 2 · Nur ein Blatt liegt offen

**Befund:** «Wenn erst der i-Button und dann die Filterleiste geöffnet wird, ist
im i-Button die Flamme — wenn das Menü wieder geschlossen wird, springt die
Chili zum i zurück. Verlässt die Chili den Button, wird er geschlossen; nur der
Button, in dem die Chili ist, ist aktiv.»

Vier runde Knöpfe tragen je ein Blatt, und **jeder führte seine eigene Liste
der anderen**:

| Knopf | schloss |
| --- | --- |
| Menü | Filter |
| Filter | Menü — **nicht das Wissen** |
| Wissen | Menü, Filter |
| Tafel | Menü, Filter |

Eine Lücke in vier Listen. Danach standen zwei Blätter offen, und beim
Schließen des einen sprang die Figur in den Knopf des anderen zurück — der
Zustand war ja nie beendet worden.

**Entscheidung:** `blaetterZu(ausser)`. Wer eine Liste führt, vergisst einen
Eintrag; wer fragt, nicht. Dieselbe Lehre wie bei der Tastatur einen Tag zuvor
(ADR 0089), an einer anderen Stelle.

## 3 · Das offene Blatt liegt oben

**Befund:** «Geöffnete Menüleisten sollten in oberster Ebene sein.»

Die Regel dafür **gab es schon**:

```css
body.menu-offen .kachel-knopf,
body.filter-offen .kachel-knopf { opacity: 0; pointer-events: none; }
```

Nur traf sie nichts mehr. Seit ADR 0082 sitzt der Wissensknopf in `#uebLeiste`
und nicht mehr in `.kachel-knopf` — die Regel zeigte ins Leere, und der Knopf
stach mit `z-index: 40` durch das Blatt.

***Wer einen Knoten umhängt, erbt die Regeln nicht mit.*** Sie zeigen weiter auf
den alten Platz, und niemand meldet das: Es ist kein Fehler, nur eine Regel
ohne Gegenstand.

## 4 · Was im Hintergrund läuft, braucht keine Zeile

**Befund:** «Diese Info soll nicht angezeigt werden, das läuft im Hintergrund.
Weil es das Übungsfenster scrollbar macht, das sollte so gut es geht vermieden
werden.»

Die Zeile «Fast — noch 2× richtig schreiben» (ADR 0086) war richtig und
trotzdem falsch am Platz: Sie schob die Kachel so weit nach unten, dass die
Übung scrollen musste — und **eine Übung, die scrollt, verliert ihre Knöpfe aus
dem Daumenbereich**. Die Aufgabe sitzt nicht ohne Grund auf zwei Dritteln der
Höhe.

`tippDeckel` und `tippRest` bleiben als Rechnung stehen; nur zeigt sie niemand
mehr an. Die Fortschrittsreihe sagt ohnehin, dass nichts weitergeht.

## Was der Prüfstand dabei lehrte

- **Ohne Zeit keine Überblendung.** Das Zurücktreten der Leiste läuft über eine
  Transition; im kopflosen Browser vergeht keine Zeit, und `getComputedStyle`
  liefert noch den alten Wert. Die Prüfung schaltet sie für die Messung ab —
  geprüft ist das Ziel, nicht der Weg dorthin. Dieselbe Falle, die in der
  Tutorial-Suite seit jeher vermerkt ist.
- **Die Gegenprobe zeigte den gemeldeten Befund wörtlich:** Mit der alten
  Fassung meldet W3 `chiliWissen` — die Figur springt zurück.
- Ein Backtick in einem Kommentar hat die Suite `maskottchen` beim Bauen
  zerlegt; sie benutzt ein gewöhnliches Template-Literal, kein `String.raw`.

## Folgen

- `strenge` K1–K4 (die Nachschrift beim Tippen in «Lernsets», mit und ohne
  Schalter) und L1/L2 (der Deckel rechnet, ohne es zu sagen).
- `maskottchen` W0–W6 (nur ein Blatt offen, die Figur springt nicht zurück, die
  Leiste tritt zurück).
- `meister` D3b/D4 messen jetzt die **Rechnung** statt der Anzeige.
