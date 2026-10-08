# 0011 · Die Chili wandert statt aufzutauchen

**Status:** angenommen · 2026-08-02

## Kontext

Das Maskottchen erschien bisher an mehreren Stellen als jeweils eigenes Bild: in der
Faktenkarte, in den Leerzuständen, auf der Jubelkarte. Jeder Wechsel war ein hartes
Erscheinen und Verschwinden — und in der Kopfzeile, wo die Figur eigentlich hingehört,
war sie gar nicht.

## Entscheidung

1. **Eine Figur, viele Stationen.** Die Chili liegt als einzelnes `#chiliFigur` auf einer
   festen Bühne über der Seite. Ansichten stellen nur einen Platzhalter
   (`div[data-chili]`) auf; die Figur wandert per `transform` dorthin.
2. **Grundzustand ist die Kopfzeile**, zwischen „Chillingo." und dem Reglerknopf.
3. **Beim Scrollen dockt sie an** — in den Streifen über der Reiterleiste, den das
   `padding-top` der klebenden Leiste dafür freihält. Position und Größe gleiten
   gemeinsam über den noch offenen Weg, die Figur wandert also, statt zu springen.
4. **Zur Faktenkarte springt sie**: halbe Sekunde Übergang plus Keyframes (ducken, Bogen,
   federn). Die Sprechblase wächst erst danach herein — 0,34 s Verzögerung, kein Aufploppen.
5. Ein `MutationObserver` auf `#main` merkt jeden Ansichtswechsel, damit keine
   Renderfunktion daran denken muss.

## Begründung

Eine wandernde Figur erzählt, was starre Kopien nicht können: dass es *dieselbe* Chili
ist, die einen begleitet. Der technische Preis ist gering, weil ohnehin nur ein Bild in
der Datei liegt — Bewegung kostet hier nichts außer ein paar Zeilen Rechnung.

Der Übergang wird beim Scrollen **abgeschaltet**: Ein CSS-Übergang auf `transform` würde
die Figur bei jedem Scrollbild hinterherhinken lassen. Er ist nur für den Stationswechsel
aktiv, danach räumt ein Zeitgeber ihn wieder ab.

Der Landeplatz misst sich an der *angehefteten* Leiste, nicht an ihrer momentanen Lage.
Sonst säße die Figur schon am Seitenanfang im Streifen — genau dieser Fehler trat im
ersten Versuch auf.

## Folgen

- Die Reiterleiste trägt oben 24 px mehr Innenabstand — das ist der Landeplatz. Die
  Kopfzeile gibt ihren unteren Abstand dafür ab, das Bild bleibt also fast gleich.
- Ansichten dürfen die Figur nicht mehr selbst zeichnen; `maskottchen()` liefert
  bewusst kein `<img>` mehr, sondern nur den Platz.
- Unter `prefers-reduced-motion: reduce` entfallen Sprung und Blasen-Einblendung; das
  Mitwandern beim Scrollen bleibt, weil es keine Animation ist, sondern Positionierung.
- Steht die Figur in einer Karte, scrollt sie mit dieser Karte aus dem Bild. Nur der
  Kopfplatz dockt an.
