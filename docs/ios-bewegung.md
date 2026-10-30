# Bewegung wie iOS 26 · zum Übertragen

Wie Chillinal («Chilli Journal») sich bewegt, herausgelöst, damit ChilliWeb es **von Anfang
an** so baut — ohne die elf Fassungen, die wir dafür gebraucht haben. Stand 1.0.1T
(2026-10-30). Ergänzt `docs/stil-vorlage.md`; deren §6 (Stand 0.13.0) ist für die Bewegung
überholt, Farben, Formen und Bedienung dort gelten weiter.

**Kernaussage:** Es gibt **eine** Feder und **eine** Mechanik. Ein Teil, das aufgeht, löst
sich als runder Tropfen aus dem, was man getippt hat, hängt über einen Hals an ihm, bis der
reißt, wächst an seinen Platz und federt leicht nach; zu fließt es denselben Weg zurück und
der Knopf schluckt es mit einem Nicken. Gerechnet wird je Bild in JavaScript auf einer
echten Feder, gezeichnet als **Pfad** (`clip-path: path()`), nie als Filter. Der Zustand
gilt sofort; die Bewegung legt sich nur darüber.

Die Funktionsnamen in Klammern stehen so in `index.html`; die Begründungen in den ADRs
0053, 0054, 0059, 0060, 0062.

---

## 1 · Was wir falsch gemacht haben — gleich richtig machen

Jede Zeile hat am Gerät Bilder gekostet oder sah falsch aus. Gemessen mit «Ruckler
messen» (liegt auf `backup/chillinal-0.18.0T-2026-10-15`, Reiter «Flüssig»).

| Nicht so | Sondern so | Warum |
| --- | --- | --- |
| Metaball als SVG-Filter (weich zeichnen, hart schneiden) | Umriß als **Pfad**: Formen + Hals in einem `clip-path: path()` | Safari rechnet den Filter teils ohne Grafikchip, Bild für Bild — das Menü hakte |
| Flüssiges als zweites Bild **unter** einer CSS-Animation | Das Teil **selbst** fließt; die Schicht darunter malt nur Hals und Schatten | Sonst zwei Teile übereinander, doppelter Schatten |
| `backdrop-filter` im fließenden Tropfen eines großen Blatts | **milchig** fließen (dichte Tönung, keine Unschärfe), Glas erst am Ziel | Ticketblatt: 45/97 Ruckler → 16/16 (4 × auf und zu) |
| Doppelschatten und Lichtkante auf großen Flächen unterwegs | Ein Schatten, keine Lichtkante (`schlicht`); am Ziel alles | Wird sonst je Bild über die ganze Fläche neu gerechnet; Ansicht: 110–130 ms Standbild nach dem Rückwisch |
| Welle in drei Schichten mit Filter und `clip-path`, jedes Bild | **ein** SVG ohne Filter, alle 50 ms gezeichnet | Drang 50 Ruckler in 10 s; danach Timer offen 6/13 |
| Jedes fließende Teil mißt und schreibt in seinem eigenen Bild | **Alle** messen, **dann** schreiben alle, im selben Bild (`teilBild`) | Sechs Karten zwangen den Browser viermal je Bild zum Neurechnen |
| Jeder Geist liest das Stylesheet neu (~180 KB) | Einmal lesen, als `adoptedStyleSheets` teilen (`geistStilGeben`) | 28–35 ms Skript im Bild, in dem er entsteht |
| Tropfen aus der ganzen Kachel / einem kartenbreiten Knopf | Aus einem **Kreis von Knopfgröße** (≤ 44 px) in der Quelle | Aus 400 px wird kein Tropfen, sondern ein Sprung |
| Hals an der ganzen vorigen Karte (Auftropfen) | Hals an einer **Perle** unten an der vorigen Karte, zäher (0,15) | Sonst eine Brücke zwischen zwei Karten, bis die Feder ruht — «zäh» |
| Fläche dehnen | Nur die **Perle** dehnt sich, solange sie klein ist | Eine gedehnte Fläche sieht schief aus |
| Hals zwischen zwei Ringen (Tagesmarkierung) | Ring gleitet ohne Hals, gedehnt über Breite/Höhe, nicht `scale` | Sieht aus wie ein Versehen; `scale` macht den Strich dick und dünn |
| Lichtkante rundum, hart weg | Nur **oben**, blendet ein und aus | Links sah sie wie Schatten aus, ihr Schnitt wie ein Rest |
| Beim Zurück den Inhalt gleich ausblenden | Der Tropfen nimmt den Inhalt **verkleinert mit**, blendet spät aus | Sonst ist die Ansicht fort, bevor der Tropfen den Knopf erreicht |
| Warten, bis die Feder ruht, bevor es weitergeht | «Angekommen» bei 97 %; was am Ziel aufgeht, nimmt die Kurve **bis zum Ziel** (`taktBisZiel`) | Sonst steht es da, bis die Zeit um ist — beim Abhaken die halbe |
| Erstes Bild im nächsten `requestAnimationFrame` | Erstes Bild **sofort** im Aufruf schreiben | Sonst verschwindet das Teil einen Augenblick |
| Ansicht beim Rückwisch nur zur Seite schieben | Sie wird beim Ziehen schon zum Tropfen, bleibt ganz im Bild | Bis an den Rand gezogen fiel der Tropfen außerhalb des Bilds |
| Dashboard unter dem Rückwisch erst beim Ziehen bauen | Als stilles Abbild schon beim **Auflegen** am Rand (72 ms), dann nur verschieben | Der Zug beginnt dann in 0,1 ms |
| Timer-Start zeichnet alles neu (`render()`) | Nur die betroffene Kachel neu | Sichtbarer Hänger beim Start |
| Etwas ragt während der Bewegung über den Rand | Alles bleibt im Bild, auch unterwegs | iOS macht die Seite breiter und verkleinert die ganze Ansicht |

Noch offen bei uns: Jedes Auflegen des Fingers kostet ein Bild (30–39 ms, kein Skript),
vermutlich die Druckrückmeldung (`:active` → `scale`). Wer es in ChilliWeb löst, sagt es
uns.

## 2 · Die Feder

Eine gedämpfte Feder wie bei SwiftUI, fest eingestellt (`FP_IOS`):

```js
var FP_IOS = { tempo: 0.5, feder: 0.35, hals: 0.35, dehnen: 0.4, kante: 0.6 };
```

| Größe | Bedeutung | Wert |
| --- | --- | --- |
| `tempo` | Antwortzeit in s | 0,5 |
| `feder` | Nachfedern; Dämpfung ζ = 1 − 0,78 · feder | ζ = 0,727 |
| `hals` | Zähigkeit: bis wohin ein Hals hält | Weite = (r₁ + r₂) · (1,15 + 2,4 · hals) ≈ 2 · (r₁ + r₂) |
| `dehnen` | Streckung in Laufrichtung | höchstens 1,24-fach |
| `kante` | Deckkraft der Lichtkante | 0,6 |

Daraus, einmal beim Start gerechnet (`flBahn`, `fluessigTakt`, `flDauernSetzen`):

| Größe | Wert |
| --- | --- |
| Dauer bis auf 1 % am Ziel | **562 ms** (Ansicht, Meldung zu, Knauf, Marke, Zeilen) |
| Überschwingen | 3,4 % |
| Menü (Gast steigt zurück) | 457 ms (0,8125 ×) |
| Hinweis | 225 ms (0,4 ×; Hinweis 60 % schneller als eine Ansicht) |
| Bis zum Ziel (`taktBisZiel`) | 281 ms (Platz eines Formularteils) |
| Rückwisch federt zurück | 450 ms, ohne Überschwingen |

```js
// Die Feder, in Schritten von 4 ms integriert. f = { x, v, ziel, schnell }.
function fpSchwingen(f, dt, w) {
  var antwort = w.tempo * f.schnell, z = 1 - 0.78 * w.feder;
  var k = Math.pow(2 * Math.PI / antwort, 2), c = 4 * Math.PI * z / antwort;
  for (var rest = dt; rest > 1e-6; rest -= 0.004) {
    var h = Math.min(rest, 0.004);
    f.v += (-k * (f.x - f.ziel) - c * f.v) * h;
    f.x += f.v * h;
  }
}
```

**Zwei Wege, dieselbe Feder:**

- **Was fließt** (Tropfen mit Hals: Ansicht, Menü, Hinweis, Blätter, Auftropfen) läuft je
  Bild auf `fpSchwingen`. Kehrt es mitten im Weg um, nimmt es die Geschwindigkeit mit —
  nur so fühlt sich ein Abbrechen wie iOS an.
- **Was nur gleitet** (Knauf, Wahl-Marke, Tagesring, Abhaken-Perle, Höhen) läuft als Web
  Animation auf derselben Bahn als `linear()`, 41 Stützpunkte:

```
mit Überschwingen (hinaus):
linear(0, 0.018, 0.06, 0.111, 0.183, 0.261, 0.343, 0.414, 0.494, 0.57, 0.641, 0.697,
  0.756, 0.809, 0.854, 0.888, 0.922, 0.95, 0.973, 0.989, 1.004, 1.015, 1.023, 1.028,
  1.032, 1.033, 1.034, 1.033, 1.032, 1.03, 1.027, 1.025, 1.022, 1.019, 1.017, 1.014,
  1.012, 1.01, 1.008, 1.006, 1)

ohne Überschwingen (in einen Knopf hinein, Zeilen, Höhen): dieselbe, bei 1 gekappt.
Ersatz ohne linear(): cubic-bezier(.45, 0, .2, 1)
```

**In einen Knopf hinein schwingt nichts über** — der Tropfen käme sonst als Geist wieder
heraus. Dort federt statt dessen der Knopf: `scale(1 → 1.14 → 1)`, 320 ms `ease-out`
(`knopfNickt`).

## 3 · Formen und Hals

Alles, was fließt, ist ein gerundetes Rechteck `{ x, y, w, h, r }`, wahlweise mit Maßstab
`s` um die Mitte und Dehnung `deh = { a: Richtung, e: Faktor }`.

- **Umriß** (`fpPunkte`): je Ecke 9 Punkte auf dem Viertelkreis, **alle im Uhrzeigersinn**
  — läuft einer andersherum, stanzt die Überlappung ein Loch. Gedehnt wird um die Mitte
  entlang `a` mit `e`, quer dazu mit `1/e` (Fläche bleibt).
- **Dehnung** (`fpDehnung`): `e = 1 + dehnen · 0,6 · min(1, |v| / 900) · gewicht` —
  je schneller, desto länger; `gewicht` nimmt sie weg, sobald die Perle wächst.
- **Kern** (`fpKern`): Der größte Kreis in der Form, so nah wie möglich an der Gegenseite.
  Daran hängt der Hals.
- **Hals** (`fpHalsPfad`): Metaball nach Hiroyuki Sato — zwei kubische Kurven zwischen den
  Kernkreisen, die sich zur Mitte einschnüren. Leer, wenn die Mitten weiter als die Weite
  auseinander sind, ein Kreis im anderen liegt, oder **die Mitte dünner als 0,22 · r** wird:
  Kurz vor dem Reißen ist der Hals sonst ein Haar, am Gerät ein Strich.
- **Riß**: Ein Hals, der eben noch stand, ist gerissen — dann zuckt, woran er hing.
- **Saum**: Der Pfad wird zweimal gemalt, außen in `--fl-rand`, innen um 1,5 px eingerückt
  in der Farbe des Teils (Dunkel 9 % zum Weißen gehoben, `--fl-hebung`). In Ruhe ist beides
  wieder das Teil — am Ende springt nichts.
- **Lichtkante**: `inset 0 1.6px 0 rgba(255,255,255,.42)`, nur oben, solange es fließt,
  Stärke `kante · min(1, 3 · |ziel − x|)`; blendet in 180 ms ein, 300 ms aus.

Den Hals-Pfad zum Abschreiben: `fpHalsPfad` in `index.html` (rund 35 Zeilen, keine
Abhängigkeiten) — er ist der schwierigste Teil; nicht neu erfinden.

## 4 · Der Tropfen

Von Quelle `q` zum Ziel `z`, bei Federstand `p` (`fpTropfen`):

1. Eine **Perle** vom Durchmesser `d0` (Ansicht und Menü 36 px, Karte 30 px) löst sich aus
   dem Kern der Quelle und **wandert** zur Mitte des Ziels.
2. Ab `p = 0,3` **wächst** sie zur Fläche (`g = (p − 0,3) / 0,7`), die Ecken gehen von
   rund zu `z.r`.
3. Über 1 hinaus (Überschwingen) wird sie etwas größer, dann federt sie zurück.
4. Gedehnt wird nur die Perle: Gewicht `(1 − 1,6 g)²`.

Die Quelle ist **nie größer als ein Knopf**: Ist sie eine Kachel, quillt der Tropfen aus
einem 44-px-Kreis in ihrer Mitte (`huelleFliesst`) oder, nach langem Druck, aus dem Punkt
unter dem Finger (`punktFlaeche`). Ist sie fort (ein Eintrag im geschlossenen Menü), quillt
er aus einer Perle an ihrer Stelle, die dabei leerläuft (`rest`).

## 5 · Die Mechanik: ein Teil fließt selbst

`teilFliesst(el, o)` — die eine Funktion für alles, was als Tropfen auf- und zugeht.

**Aufbau, je Bild:**

```
 Schicht (.fl-schicht, position: fixed, direkt VOR el im DOM, gleiche z-index)
   ├─ Schatten  (SVG-Pfad, drop-shadow als CSS-filter auf der Schicht)
   ├─ Fluß      (div, clip-path: path(Umriß von Quelle + Tropfen + Hals), Saumfarbe)
   ├─ Kern      (div, clip-path: derselbe Umriß um 1,5 px eingerückt, Teilfarbe)
   └─ Licht     (SVG-Pfad, Lichtkante; fehlt bei großen Blättern)
   Die Schicht selbst spart per clip-path evenodd die Quelle aus — die steht schon da.
 el (das echte Teil)
   background: transparent, box-shadow: none,
   clip-path: path(nur der Tropfen, in el-Koordinaten)
   → am Ziel sind Teil und Tropfen deckungsgleich, der Wechsel geht ohne Kante.
```

**Regeln:**

- **Das Teil steht sofort an seinem Platz** und ist auf den Tropfen beschnitten — es wird
  nie verschoben oder skaliert. Bei Glas ist der Tropfen das Teil; die Schicht malt dann
  nur Hals und Schatten und spart den Tropfen um den Saum eingerückt aus.
- **Inhalt** blendet erst ein, wenn die Fläche fast steht: Deckkraft `(p − 0,72) / 0,25`.
  **Zurück** wird er mit dem Tropfen verkleinert und verschoben, Deckkraft
  `(p − 0,15) / 0,35` (`fpInhalt`).
- **Angekommen** bei `p ≥ 0,97`: Schatten und Ring des Teils kommen wieder, Folgeschritte
  dürfen beginnen (`angekommen`). Fertig bei Ruhe (|x − ziel| < 0,0015, |v| < 0,02) oder zu
  bei `p < 0,02`.
- **Umkehr**: Wer `teilFliesst` auf ein fließendes Teil ruft, setzt nur `ziel` neu — die
  Feder schwingt weiter, wie sie gerade ist.
- **Ein Bild für alle**: Jeder Schritt reiht sich in `teilReihe`; im nächsten Bild messen
  erst alle (`getBoundingClientRect`), dann schreiben alle.
- **Kasten**: Die Schicht deckt nur das Rechteck um Quelle, Tropfen und Ziel, +60 px
  (unten +80 für den Schatten) — der Pfad kostet je Bildpunkt.
- **Abräumen** (`teilFliesstEnde`): alle Inline-Stile zurück, Schicht weg. Genau ein
  `fertig`, auch wenn mittendrin die Bewegung abgeschaltet wird.
- **Neue Geschwindigkeit** über `schnell` (Faktor auf die Antwortzeit), nicht über eine
  eigene Feder.

**`fliessen(el, quelle, opt)`** ist die kleine Schwester für Teile mit **eigener**
Bewegung (Wahl-Marke, Knauf, Abhaken-Perle): Sie malt nur den Hals und, mit `rest`, was
am alten Platz zurückbleibt und schwindet (`z = 1 − 1,9 k`) — nie das Teil selbst. Die
Weite wächst bis zur **dreifachen Quellgröße**, sonst hielte der Hals auf langen Wegen
keine 40 ms.

**Geister**: Was verschwindet oder wohin man noch nicht ist, wird als Kopie in einer
Schattenwurzel gezeigt (`geist`) — keine doppelten IDs, kein Vorleser, keine Zeiger. Das
Stylesheet teilen alle (Abschnitt 1).

## 6 · Jede Stelle

| Stelle | Quelle → Ziel | Wie | Werte |
| --- | --- | --- | --- |
| **Ansicht auf** | getippter Knopf / Kachelmitte / Fingerpunkt → ganze Ansicht | Geist der neuen Ansicht in einer Hülle, die Hülle fließt (`tropfenAuf`), echte Ansicht steht unsichtbar bereit | d0 36, Ecken am Ziel 0, ein Schatten, **ohne** Lichtkante |
| **Ansicht zu** | Ansicht → ihre Herkunft (Menüknopf, Kachel, Terminzeile) | Geist fließt zurück (`tropfenZu`), Inhalt verkleinert mit; Knopf nickt, Terminzeile **leuchtet** statt dessen | Ecken 20 px; Leuchten 900 ms in `--termin` |
| **Menü** | Menüknopf → Blatt **unter** dem Knopf | Das Blatt selbst fließt (`blattFliesst`), Einträge blenden ein, wenn es fast steht; zu nickt der Knopf, nur der Schleier blendet | d0 36, Ecken 18, Doppelschatten |
| **Menü bei gerollter Seite** | Gast aus der Ecke oben rechts | Gast fällt, das Blatt im selben Takt darunter; es gibt **nie** zwei Menüknöpfe | Gast steigt zurück in 457 ms |
| **Hinweis, Meldung, Frage** | zuletzt getippter Knopf (≤ 3 s alt, im Bild), sonst Fokus → Glaskarte | Glas bleibt Glas: unterwegs `--glas-tropfen` (dichter, mit Rand), ab p > 0,8 die Tönung der Karte | 225 ms, `schnell` 0,4 |
| **Fenster wird Meldung** | Fenster → Tropfen in seiner Mitte → Meldung | Eine Bewegung, nicht zwei; die Ansicht dahinter blendet nur ein | — |
| **Große Blätter** (Tickets, Timer, Drang) | Knopf der Kachel → Blatt | **milchig**: keine Unschärfe, ein Schatten, keine Lichtkante; angekommen bekommt die Karte ihr Glas, die Hülle blendet aus (`glasAmZiel`) | Ausblenden 225 ms |
| **Formularteil** | Knopf, der es öffnet → Teil | Tropfen wie eine Ansicht; der Platz geht **auf derselben Feder bis zum Ziel** auf | 281 ms; ohne Knopf 540 ms mit `scale(.97)` |
| **Zeile geht** (löschen) | Zeile → runder Knopf oben | Geist zieht sich auf Höhe 0 (die anderen rücken nach), ein zweiter Geist fließt in den Knopf | 427 ms Höhe, 562 ms Tropfen |
| **Wahlleiste** | altes Segment → neues | Marke gleitet, bei 40 % mittig gestreckt `scale(1.12, .928)`; am alten Platz ein Rest mit Hals (`fliessen`) | 562 ms, mit Überschwingen |
| **Schalter** | Knauf links ↔ rechts | Gemessen beim **Auflegen**, bewegt beim Heben; Knauf hebt sich wie eine Linse, bei 45 % `scale(1.299, 1.076)`, Rest mit Hals (`knaufFliesst`) | 562 ms |
| **Tagesmarkierung** | alter Tag → neuer | Ring gleitet **ohne** Hals, bei 45 % über Breite/Höhe gedehnt (1,14 / 0,952) (`tagGleitet`) | 562 ms |
| **Abhaken** | Scheibe der Kachel → Tagesring | grüne Perle 22 px im Bogen (≤ 70 px), unterwegs gedehnt, zum Ziel kleiner (`1 − 0,7 u`), Hals an der Scheibe; Ring nickt `scale(1.096)` | 422 ms bis zum Ziel, Nicken 360 ms; nur wenn beide im Bild |
| **Auftropfen beim Start** | Kopf → 1. Karte → 2. Karte … | **Kette**: jede Karte aus einer Perle unten an der vorigen (`perleQuelle`), sobald die halb gewachsen ist; Überschrift blendet mit ihrer Karte ein | Abstand 126 ms, d0 30, Hals **0,15**, ohne Lichtkante, alle im selben Bild |
| **Welle** (Timer, Drang) | — | Flüssigkeit im Ring, Pegel = Restzeit, wogt, Perlen steigen; ein SVG, Lichtkante als Strich die Oberfläche entlang | alle 50 ms; Blatt zu = Welle weg |
| **Rückwisch** | linker Rand (26 px) | ab 12 px folgt die Ansicht dem Finger und wird zum Tropfen: schrumpft zum rechten Rand bis 0,55, Ecken bis 38 px; darunter das stille Abbild des Dashboards; über 70 px oder > 0,6 px/ms fließt sie, **wie sie steht**, in ihre Herkunft; sonst federt sie zurück | Zurückfedern 450 ms; senkrecht zuerst = Blättern; zweiter Finger, `touchcancel`, Drehung brechen ab |
| **Druck** | — | `:active` → `scale(.92)` rund, `.96` Pille, `.98` Zeile | 150 ms `ease` |
| **Langer Druck** | — | löst nach 500 ms aus; wer hält, sieht das Ziel einsinken (`.95` Scheibe, `.97` Zeile, 350 ms nach 150 ms); danach nichts markieren, den Folgeklick des Hebens schlucken (`langHalten`) | — |
| **Hell ↔ Dunkel** | Schalter | View Transition: die neue Darstellung als Kreis aus dem Knauf, Knauf als eigene Ebene im ersten Drittel | 1560 ms; währenddessen ruhen alle anderen Übergänge |

## 7 · Bewegung aus

`prefers-reduced-motion: reduce` **oder** der Schalter «Bewegung aus» stellen alles still
(`bewegungAus()`): Jede Bewegungsfunktion prüft es zuerst und setzt sofort den Endzustand;
wird es mittendrin umgeschaltet, steht das Teil am Ziel und meldet `fertig` genau einmal.
Kein Hals, keine Feder; ohne `linear()` fallen die Kurven auf `cubic-bezier` zurück. CSS
dazu wie in der Stilvorlage §6.

## 8 · Übertragen — in dieser Reihenfolge

1. **Feder** (`fpSchwingen`, `flBahn`) und die daraus gerechnete `linear()`-Kurve, einmal
   beim Start; alle Dauern daraus ableiten, keine festen Millisekunden im Code verstreuen.
2. **Formen, Hals, Tropfen** (`fpPunkte`, `fpKern`, `fpHalsPfad`, `fpTropfen`) — als Pfad.
3. **`teilFliesst`** mit Schicht, Beschnitt, Messen-dann-Schreiben in einem Bild,
   Umkehr, `angekommen`, sauberem Abräumen. **Dann erst** die erste Stelle bauen.
4. **Geist** mit geteiltem Stylesheet; `tropfenAuf` / `tropfenZu` darauf.
5. Ansicht, Menü, Hinweis, Formularteil — alle über dieselben zwei Funktionen.
6. `fliessen` für Marke, Knauf, Abhaken.
7. Rückwisch mit Abbild beim Auflegen.
8. Große Blätter von Anfang an **milchig**, Glas am Ziel.
9. «Bewegung aus» in jeder Funktion zuerst.
10. **Am iPhone abnehmen, nicht im Desktop-Browser**: Chromium zeigt keinen der Ruckler aus
    Abschnitt 1. «Ruckler messen» aus der Sicherung mitnehmen und vor jeder neuen Stelle
    einen Vorher-Wert nehmen.

Wer eine neue Stelle bewegt, nimmt die Feder, `teilFliesst` und `fliessen` — einen zweiten
Weg gibt es nicht.
