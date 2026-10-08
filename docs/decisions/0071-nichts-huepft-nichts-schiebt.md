# 0071 · Nichts hüpft, nichts schiebt

**Stand:** angenommen · 2026-08-15 · aus fünf Tickets (Etappe 1 von 15)
**Löst ab:** ADR 0064 §1 (der Schatten der Figur) · **ändert:** ADR 0063 (die
Frist des Netzworts)

## Ausgangslage

Fünf Meldungen aus einem Stapel, alle im Kopfbereich oder an der Figur, und drei
davon mit derselben Wurzel: **Eine Bewegung meldet etwas — also darf sie nicht
laufen, wenn es nichts zu melden gibt.**

## 1 · Der Hüpfer ohne Weg

**Befund:** «Wenn auf das Dropdown *Alle Übungen* geklickt wird, springt die
Chili auf der Stelle.» Und, aus einem zweiten Ticket: «Wenn eine Erklärung oder
ein Fakt als Favorit gespeichert wird, springt die Chili.»

Beides ist ein Fehler, nicht zwei. `chiliAktualisieren()` schloss mit

```js
chiliFlug(vorher, jetzt);
chiliHuepfen();
```

Der Flug prüft die Strecke und gibt bei weniger als acht Pixeln auf — der
Hüpfer prüfte nichts. Und weil jeder Renderlauf den Platzhalter als **neuen
Knoten** liefert, ist `platz !== chiliStation` auch dann wahr, wenn die Figur
exakt stehen bleibt. Aufklappen, Stern, Chip: kein Flug, aber ein Hüpfer.

**Entscheidung:** `chiliFlug()` gibt zurück, ob es einen Weg gab; der Hüpfer
hängt daran. **Er ist die Landung, nicht die Begrüßung.**

Dabei wandert die Abfrage auf `prefers-reduced-motion` **hinter** die Messung.
Stünde sie davor, hieße «keine Animation» zugleich «nicht bewegt» — und der
Hüpfer käme ausgerechnet dort, wo alles still sein soll.

An die Stelle des Sprungs tritt beim Stern eine Rückmeldung dort, wo getippt
wurde: `sternBlinken()` lässt ihn einmal aufblitzen. **Nur beim Setzen** — etwas
wegzunehmen braucht keine Feier. Gesucht wird der Stern *nach* dem Neuzeichnen:
Die Kennung überlebt den Renderlauf, das Element nicht.

## 2 · Der Knopf, der sein eigenes Ereignis verschluckte

**Befund:** «Wenn der Tutorial-Knopf gedrückt wird, soll die Chili an die Stelle
springen (aktuell ploppt sie dort einfach auf).»

```js
document.getElementById('tutKnopf').addEventListener('click', tutStarten);
```

`tutStarten(ruhig)` bekommt so das **MouseEvent** als erstes Argument. Ein
Objekt ist wahr, also war jeder Klick ein «ohne Sprung» — die Ausnahme, die für
den automatischen Start beim allerersten Öffnen gedacht war, galt für alle.

**Entscheidung:** Ein Zuhörer, dessen Funktion Argumente hat, wird eingepackt.
Der bewusste Fall steht ausgeschrieben (`tutStarten(true)`).

## 3 · Der Kasten um die Figur, zum dritten Mal

**Befund:** «Der viereckige Rand ist schon besser geworden, aber immer noch
etwas sichtbar. Wir können die Schattierungen weglassen.»

ADR 0064 hatte den Schatten je Schema gestaffelt und dabei offen eingeräumt, die
Safari-Erklärung sei plausibel, aber unbewiesen. Sie war richtig, die Reparatur
zu zaghaft: Ein Weichzeichner, den Safari in eine eigene Ebene rastert und am
Elementkasten beschneidet, hinterlässt eine gerade Kante — **kürzer heißt
schwächer, nicht weg.**

**Entscheidung:** `--figur-schatten` gibt es nicht mehr, `.chili` und
`#chiliFigur` tragen keinen Filter. **Kein Filter, keine Kante.** Das Bild selbst
war nie das Problem; es ist sauber freigestellt, und das ist in ADR 0064
nachgemessen.

ADR 0064 §1 ist damit erledigt. §2 (der Akzent gehört zum Schema) bleibt.

## 4 · Die Frist und die Bewegung sind zwei Dinge

**Befund:** «Der Status soll nicht doppelt so lange dastehen (wieder auf 4 s),
sondern die Zeit des Verschwindens soll halb so schnell sein.» Und: «Wenn der
Text angezeigt wird, ploppt er auf; er soll die gleiche Art wie beim
Verschwinden haben, nur umgekehrt.»

2.4.11 hatte auf «halb so schnell verschwinden» **beides** verdoppelt — Frist
*und* Dauer. Getroffen war damit das Falsche: Das Wort stand doppelt so lange
und ging immer noch zügig.

**Entscheidung:** `NETZ_FRIST` zurück auf 4 200 ms, das Zuklappen auf 2 s.

Das Aufploppen hat eine eigene Ursache: Unterwegs lief das Wort über
`.nur-punkt { display: none }`. **`display` lässt sich nicht überblenden** — bei
der Rückkehr auf Home fiel es in einem Bild auf volle Breite. Jetzt wird es
eingeklappt statt ausgeblendet, mit derselben `max-width`-Mechanik wie die
Frist. Auf- und Zuklappen sind derselbe Weg, einmal vorwärts und einmal
rückwärts.

## 5 · «Gespeichert» schiebt die Kopfzeile

**Befund:** «Wenn der Text *gespeichert* erscheint, verschiebt es die Kopfzeile.
Er soll wie der Online-Status auf- und zuklappen, aus dem rechten Bildschirmrand.»

Zwei Ursachen, und die zweite fand erst die Prüfung:

1. `#saveNote` war ein vollwertiges Feld in einer `space-between`-Zeile. Erschien
   es, nahm es Breite, und das Etikett links davon rückte zusammen.
2. **Der Haken kommt aus `ICON` und ist 20 px groß.** In einer Zeile aus
   10-px-Versalien machte er sie von 13 auf 22 Pixel höher. Das war das zweite,
   unbemerkte Schieben — die erste Fassung der Reparatur behob nur das erste,
   und die Prüfung `B14c` fiel darüber.

**Entscheidung:** Dieselbe Mechanik wie beim Netzwort — `max-width` von 0,
`overflow: hidden`, am rechten Rand verankert. Der Inhalt hängt am **linken**
Rand des wachsenden Kastens: Andernfalls käme das Wort von hinten herein und
stünde zwei Sekunden lang als «PEICHERT» da (im Bildschirmfoto gesehen, nicht
gedacht). Das Symbol nimmt die Höhe der Schrift.

Geleert wird erst nach dem Zuklappen, nicht nach 400 ms — sonst risse der Text
mitten in der Bewegung ab.

## Folgen

- **Prüfungen:** `maskottchen` bekommt einen Abschnitt **R** (13 Prüfungen),
  `robust` einen Abschnitt **B14** (5) sowie `B8b` und `B13h`.
- **Zwei Prüfungen mussten umgeschrieben werden**, weil sie die *Umsetzung*
  festhielten statt der Absicht: `B8` verlangte wörtlich `display === 'none'`.
  Eine Prüfung, die eine Eigenschaft nennt statt eines Zustands, verbietet jede
  spätere Reparatur an dieser Stelle.
- **Ein Renderlauf hängt die Figur nicht selbst um** — das tut der
  `MutationObserver` auf `#main`, und der läuft als Mikroaufgabe. Eine synchrone
  Prüfung muss `chiliAktualisieren()` an derselben Stelle nachrufen; sonst sucht
  sie eine Figur, die für einen Augenblick gar nicht im Dokument hängt.

## Regel

**Eine Bewegung ist eine Aussage.** Läuft sie, ohne dass sich etwas geändert
hat, ist sie eine falsche. Wer eine Animation an einen Renderlauf hängt, hängt
sie an das Neuzeichnen — nicht an das Ereignis, das sie meint.
