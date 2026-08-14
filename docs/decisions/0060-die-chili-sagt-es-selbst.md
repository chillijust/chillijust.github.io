# 0060 · Die Chili sagt es selbst

**Stand:** angenommen · 2026-08-14 · aus einem Ticket
**Ergänzt:** ADR 0049 («Der Fakt hat überall dieselbe Gestalt, der Kommentar auch»)

## Ausgangslage

Seit ADR 0049 steht nach jeder Auflösung ein Kommentar — eine kursive Zeile unter der
Lösung, ohne Kästchen, bewusst als Nebensatz gehalten. Inhaltlich ist er die Stimme der
Chili: Die Sätze in `data/kommentare.json` sind so geschrieben, als spräche sie.

**Nur sah man ihr das nicht an.** Der Text stand als Zeile im Kachelfuß, die Figur saß
oben rechts im Kopf, und zwischen beidem lag kein sichtbarer Zusammenhang. Auf der
Faktkarte spricht sie in einer Sprechblase, im Tutorial ebenfalls — beim Kommentar,
den sie öfter sagt als beides zusammen, nicht.

## Entscheidung

**Der Kommentar wird eine Sprechblase an der Figur im Kopf.** Die Zeile `.kommentar`
entfällt ersatzlos; `kommentarHtml()` gibt es nicht mehr. Der Text steht in
`#chiliBlase`, hängt unter der Chili, und der Zipfel zeigt auf **sie** — dieselbe Regel
wie im Tutorial (ADR 0051).

Sie **endet rechts am Inhaltsrand** und wächst nach links, so weit der Satz sie braucht.
Sie steht, bis «Weiter» gedrückt wird.

## Begründung

### Warum sie nicht in der Bühne steht

Der naheliegende Ort wäre `#chiliBuehne` — dort, wo die Figur selbst steckt. Das wäre
falsch: Die Bühne wird **umgehängt** (ADR 0012). Wer das Menü öffnet, schickt die Figur
in den runden Knopf, und die Blase flöge mit — eine Sprechblase in einem 44-px-Kreis.

Also ein eigenes Stück in der rechten Kopfgruppe, das sich zeigt, **solange die Figur auf
`#chiliPlatz` steht**. Verlässt sie den Kopf — Menü, Filter, Wissensblatt, Jubel,
Tutorial, Faktkarte —, verschwindet die Blase. Ein Zipfel, der auf einen leeren Platz
zeigt, wäre schlimmer als gar keine Blase.

Geführt wird das aus `blaseAktualisieren()`, aufgerufen von `chiliAktualisieren()`. Dort
und nur dort ist bekannt, wo die Figur gerade steht — jede zweite Stelle müsste es
raten.

### Warum der Zipfel gemessen wird

Die Figur ist das erste Stück der rechten Gruppe, aber **nicht immer gleich weit vom
Rand**: In «Buchstaben» steht der Tafelknopf neben ihr, in «Übersetzen» der
Wissensknopf, und beide schieben sie nach links. Ein fester Abstand im Stil hätte in
zwei von acht Übungen danebengezeigt — und zwar unauffällig genug, um lange zu bleiben.

Gemessen wird die Mitte von `#chiliPlatz` gegen die Breite der Gruppe, gesetzt als
`--zipfel`. Dieselbe Zahl trägt die `min-width`: Ohne sie stünde der Zipfel bei einem
kurzen Satz **neben** der Blase statt an ihr.

### Der Einwand, der bestehen bleibt

Der Kommentar erscheint nach dem Antworten. In diesem Augenblick steht der Blick unten —
bei der Auflösung und dem «Weiter»-Knopf. Die Blase steht oben. **Es kann sein, dass sie
seltener gelesen wird als die Zeile.**

Das ist so entschieden worden, nicht übersehen: Die Blase sagt dafür, **wer** spricht,
und das war der Punkt. Zeigt sich am Gerät, dass sie untergeht, ist der Hüpfer der Figur
beim Erscheinen der nächste Schritt — nicht die Rückkehr zur Zeile.

## Folgen

- `.kommentar` und `kommentarHtml()` sind fort. Sechs Aufrufstellen entfallen ersatzlos:
  Lernsets, Freestyle, Tippen, Übersetzen, Schreibung, Grammatik. «Buchstaben» bleibt
  wie bisher draußen.
- `kommentarSetzen()`, die Töpfe und `data/kommentare.json` sind **unberührt**. Was
  gesagt wird, hat sich nicht geändert — nur wer es sichtbar sagt.
- Neuer Abschnitt L in der Suite `kommentare` (11 Prüfungen). Die Suite musste dafür
  lernen, **das Tutorial zu schließen**: Solange der Scheinwerfer läuft, steht die Figur
  in *seiner* Blase, und die Kommentarblase schweigt zu Recht — ohne `tutEnde()` prüfte
  Abschnitt H nur noch, dass zwei Blasen sich nicht ins Gehege kommen.
- Die Blase liegt über der Titelzeile des Kopfes. Bei einem langen Satz verdeckt sie den
  Namen der Übung, solange die Auflösung steht. Das ist gewollt: Der Kopf ist unterwegs
  das ruhigste Stück der Seite, und der Name steht wieder da, sobald es weitergeht.
