# 0064 · Der Akzent gehört zum Schema, der Schatten auch

**Stand:** angenommen · 2026-08-15 · aus zwei Tickets
**§1 abgelöst von ADR 0071:** Der Schatten der Figur wurde ganz entfernt —
kürzer hieß schwächer, nicht weg. §2 (der Akzent) gilt unverändert.
**Ergänzt:** ADR 0038/0039 (ein Farbschema statt zweier Achsen), ADR 0063 (die hellen
Schemata werden Farben), ADR 0012 (die Chili steht im Fluss)

## Ausgangslage

ADR 0063 machte aus den vier hellen Paletten Farben: Der Grund sank von 87,5 auf 77
Prozent Helligkeit und wurde satt, die Kachel wurde ein hellerer Ton derselben Farbe.
Zwei Meldungen kamen am Morgen danach, und beide haben dieselbe Ursache:

> **Die Flächen wurden Farben. Die Tinte darauf blieb, was sie war.**

## 1 · Der Kasten um die Chili

**Befund:** «Bei der Chili ist der viereckige Rahmen sichtbar.»

**Was nachweisbar ist:** Die Datei `docs/maskottchen-freigestellt.png` ist sauber
freigestellt — alle vier Ecken und beide waagerechten Ränder tragen Alpha 0, von 65 536
Punkten sind 43 694 vollständig durchsichtig und nur 1 130 teildurchsichtig, und die
liegen auf der Silhouette. Das eingebettete Bild ist Byte für Byte dieselbe Datei
(gleiche Prüfsumme). **Im Bild steckt kein Kasten.**

Es ist der Schatten: `drop-shadow(0 6px 12px rgba(0, 0, 0, .4))`. Pixelweise kartiert
folgt die Abdunklung in Chromium sauber der Silhouette — ein weicher Hof von gut vierzig
Pixeln. Auf einer fast weißen Kachel liest sich das als Schatten. Auf einer **satten
Farbe entsättigt dasselbe Schwarz die Fläche**, und aus dem Schatten wird ein grauer
Fleck. Der Fehler ist mit der Palette entstanden, nicht mit dem Bild.

**Was nicht nachweisbar ist:** Der *viereckige* Rand ließ sich hier nicht nachstellen; in
Chromium ist der Hof rund. Dass Safari ihn als Kasten zeigt, passt zu seinem Umgang mit
Filtern — es rastert sie in eine eigene Ebene, und ein am Elementkasten beschnittener
Weichzeichner ergibt genau eine gerade Kante. Bewiesen ist das nicht.

**Entscheidung:** Der Schatten der Figur ist ein eigener Wert, `--figur-schatten`, und
steht je Schema:

| | Wert |
| --- | --- |
| Dark | `0 6px 12px rgba(0, 0, 0, .4)` — unverändert |
| die vier hellen | `0 3px 5px rgba(35, 39, 46, .18)` |

Kürzer, näher an der Figur, im Ton des Textes statt in reinem Schwarz. **Was nicht weit
streut, kann auch als beschnittener Weichzeichner keine sichtbare Kante hinterlassen** —
die Reparatur wirkt also unabhängig davon, welche der beiden Erklärungen stimmt.

## 2 · Der Akzent passt nicht zur Farbe

**Befund:** «Die goldenen Buttons und Farben passen nicht wirklich zu den farbigen
Hintergründen.»

`--gold` war **ein** Ton (`#765619`) für alle vier hellen Schemata. Auf «classic» ist das
stimmig — es *ist* der Cremeton der App. Auf Mint und Rosa ist es eine Fremdfarbe: braun
auf grün, braun auf pink. Und es hielt dort am wenigsten Kontrast (3,43 auf Rosa gegen
4,36 auf Classic).

**Entscheidung:** Der Akzent ist ein **tiefer Ton derselben Farbe wie der Grund** und
gehört damit zum Schema. `--gold` heißt `--akzent`, `--gold-ink` heißt `--akzent-ink`.

| | Grund | Akzent |
| --- | --- | --- |
| Classic | `#DDCFAC` | `#6E561B` |
| Grün | `#A6E3C6` | `#1B6A45` |
| Blau | `#A7C9E2` | `#1F567D` |
| Rosa | `#E2A7D0` | `#832165` |
| Dark | `#1A1A18` | `#D2A24E` — unverändert |

### Warum die Helligkeit gesucht und nicht gesetzt wird

`tools/palette.py` nimmt den **hellsten** Ton bei fester Sättigung (60), der auf allen
drei Flächen noch 4,5 hält. Ein fester Wert je Schema läge bei jedem Farbton woanders
richtig: Zwei Farben gleicher HSL-Helligkeit haben nicht dieselbe Leuchtdichte, ein Blau
ist dunkler als ein Gelb. Gesucht statt gesetzt heißt: Der Akzent ist in jedem Schema
gleich **stark**, nicht gleich hell.

Nebenbei steigt der Kontrast überall auf mindestens 4,5 — vorher hielt Gold auf Rosa nur
3,43.

### Warum die Umbenennung nötig war

In Dark und Classic *ist* der Ton Gold. In Grün und Rosa nicht. Ein Name, der lügt, ist
eine Falle für den Nächsten — dieselbe Überlegung wie bei «Abgabe» und «Eingabe» in
ADR 0063.

### Was das mit der Regel aus ADR 0038 macht

Die Regel lautete: *«Schrift, Gold und die Signalfarben stehen einmal für alle hellen
Schemata, sonst hieße "richtig" auf Rosa etwas anderes als auf Grün.»* Die Prüfung `D1`
erzwang das.

Der Akzent ist dort **herausgenommen**, und zwar begründet: Die Regel schützt **Aussagen**.
Grün heißt richtig, Rot heißt falsch — wenn das je Schema wanderte, hieße dasselbe Zeichen
zweierlei. Der Akzent sagt nichts; er zeigt nur, wo etwas wichtig ist. Er darf darum zum
Schema gehören, so wie die Flächen dazugehören.

Schrift und **Signal**farben stehen unverändert einmal für alle. An die Stelle der einen
Prüfung treten vier:

- `D1` Schrift und Signalfarben sind in allen hellen Schemata gleich (ohne den Akzent),
- `D1b` der Akzent **muss** wandern — vier Schemata, vier verschiedene Töne,
- `D1c` er hält überall AA (4,5) auf Grund, Kachel und Bedienfläche,
- `D1d` was auf ihm steht (`--akzent-ink`), bleibt lesbar — er ist an einigen Stellen eine
  Fläche, nicht nur eine Schriftfarbe.

## Folgen

- 81 Stellen in `index.html` lesen `var(--akzent)`; `--gold` gibt es nicht mehr. Vier
  Suiten mussten mit.
- `palette.py` rechnet den Akzent mit und gibt ihn im selben Block aus wie die Flächen.
  Wer Farbton oder Sättigung eines Schemas verschiebt, bekommt den passenden Akzent
  geschenkt.
- Der Tutorial-Knopf bleibt eine gefüllte Fläche — mit dem neuen Akzent ist er ein
  dunkelgrüner statt eines braunen Riegels.
- **Neu in der Versionierung:** Eine Fassung, die ausgeliefert wird, damit sie auf dem
  Gerät angesehen werden kann, trägt ein **T** (`2.4.6T`). Fällt das T weg, ist sie
  abgenommen. Es gehört in die Zahl, nicht daneben: Der Cache des Workers heißt nach der
  Version, und «2.4.6T» und «2.4.6» müssen zwei verschiedene Stände sein — sonst käme die
  freigegebene Fassung nie beim Gerät an.
