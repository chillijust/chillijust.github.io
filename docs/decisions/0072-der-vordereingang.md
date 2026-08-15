# 0072 · Der Vordereingang beginnt am Anfang

**Stand:** angenommen · 2026-08-15 · aus vier Tickets (Etappe 2 von 15)
**Ergänzt:** ADR 0036 (Zurück heißt: woher man kam) · ADR 0067 (der erste
Reiter) · ADR 0063 (beide Wege warten gleich)

## 1 · Zwei Ansichten, die sich zu viel merkten

**Befunde:** «Wenn ich in Settings gehe, soll die erste Seite immer *App*
sein.» — «Aus der Seite *Wörter* eine andere Seite auswählen, zurück zu Bilanz:
Der Nutzer steckt noch in *Wörter* fest, bis der Zurückpfeil gedrückt wird.»

Zwei Meldungen, ein Fehler. Zwei Ansichten führen einen **Einstiegszustand**:
die Bilanz ihre Detailseite (`bilanzDetail`), die Einstellungen ihren Reiter
(`einstReiter`). Beide überleben den Ansichtswechsel, und `setTab()` rührt sie
nicht an.

Für den **Rückweg** ist genau das richtig, und ADR 0036 verlangt es: Wer aus
«Wörter» heraus etwas nachschlägt und umkehrt, will nach «Wörter» zurück. Für
den Weg durchs **Menü** ist es falsch — dort fängt man an, nicht weiter.

**Entscheidung:** `ansichtAnfang(name)` setzt den Einstiegszustand einer
Ansicht zurück und hängt am **Menüeintrag**, nicht an `setTab()`.

### Warum nicht in `setTab()`

Weil ein **gezielter Sprung kein Anfang ist, sondern ein Ziel**. Der
Leerzustand des Tagesmaßes bietet «Maß ändern» an und führt auf den Reiter
«Lernweg»:

```js
einstReiter = 'lernweg';
setTab('einstellungen');
```

Läge das Zurücksetzen in `setTab()`, ginge dieser Knopf ins Leere — er landete
auf «App», und der Nutzer dürfte die Einstellung suchen, die er gerade
angeboten bekam. Das Menü ist der Vordereingang; ein Knopf, der auf eine
bestimmte Stelle zeigt, ist eine Seitentür.

Aus demselben Grund bleibt der Rückweg unberührt: Er ruft `setTab(…, true)`.

## 2 · Die Reihenfolge im Menü

**Befund:** «Einstellung · Bilanz · Sicherung · Tickets.»

Vier Einträge umsortiert. Der Grund ist einer der Häufigkeit — die
Einstellungen werden am öftesten gebraucht, die Tickets am seltensten.

**Nebenbefund:** Die Suite `sicherung` prüfte die Reihenfolge **wörtlich** und
fiel darüber, obwohl sie mit der Sicherung nichts zu tun hat. Zwei Suiten, die
dieselbe Entscheidung festhalten, heißt: Wer sie ändert, repariert zweimal.
`sicherung` prüft jetzt nur noch, was sie angeht — dass die Sicherung hinter der
Bilanz und vor den Tickets steht —, und die Reihenfolge als Ganzes steht an
einer Stelle (`reiter`, K1).

## 3 · Der Ring, der ein Bogen war

**Befund:** «Wenn das Update über die Infoanzeige geladen wird, sieht das
Ladesymbol sehr komisch aus.»

Es sah nicht komisch aus, es war kaputt — und der Grund steht in einer Zeile,
die mit dem Ladering nichts zu tun hatte:

```css
#swNeu span { flex: 1; }
```

Gemeint war der **Meldungstext** («Eine neue Fassung liegt bereit»), der die
Zeile füllen soll. Getroffen war jedes `span` in der Leiste — auch
`<span class="sw-ring">` im Knopf daneben. Aus 17 × 17 Pixeln mit
`border-radius: 50%` wurde eine Ellipse von Knopfbreite: ein riesiger dünner
Bogen quer über den Kopf. Im Bildschirmfoto war er sofort zu sehen; im Code
hätte man ihn ewig gesucht.

**Entscheidung:** Drei Änderungen, jede für sich begründet:

- `#swNeu > span` — der Kindwähler. Die Regel meint ein Kind, also sagt sie es.
- `.sw-ring { flex: none }` — der Ring wird an zwei Stellen in Knöpfe gesetzt.
  **Wo eine Regel Kindern Wachstum gibt, wird aus dem Kreis eine Ellipse**; das
  darf er nicht dem Ort überlassen, an dem er steht.
- `#swNeu .btn { flex: none; min-width: 132px }` — dieselbe Zusage wie beim
  Knopf in den Einstellungen (ADR 0062: die Größe wechselt nie). Die JS-Zeile
  `laden.style.width = laden.offsetWidth + 'px'` hielt die Breite fest, aber
  `flex: 1` machte sie wirkungslos: Der Knopf wuchs weiter mit dem freien Raum.

Dazu, wie gewünscht, dieselbe **Farbe**: Der Knopf wird beim Laden golden mit
hellem Ring, wie der in den Einstellungen. ADR 0063 hatte die beiden bewusst
über die Fläche unterschieden («derselbe Ring, unterschieden allein durch die
Farbe des Knopfs darunter»). Das war eine Feinheit zu viel — beide tun
dasselbe, also sehen sie gleich aus.

## Folgen

- `reiter` bekommt die Abschnitte **J** (6 Prüfungen) und **K** (1), `offline`
  die Prüfungen **B5a–c**.
- **Eine Prüfung, die eine Zahl misst, statt eine Eigenschaft zu lesen**, hätte
  den Bogen gefunden: `B5a` vergleicht Breite und Höhe des Rings. Die
  bestehende Prüfung `S20` zählte `class="sw-ring"` im Quelltext — sie war
  grün, während das Ding quer über den Bildschirm ging.

## Regel

**Der Weg durchs Menü ist der Vordereingang, der Rückpfeil die Rückseite, ein
gezielter Knopf die Seitentür.** Nur der Vordereingang setzt zurück.
