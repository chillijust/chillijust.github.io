# 0084 · Die Leiste gehört zum Rahmen, nicht zum Inhalt

**Stand:** angenommen · 2026-08-16 · aus einem Ticket
**Ergänzt:** ADR 0082 (zwei Plätze für eine Leiste)

## Ausgangslage

**Befund:** «Der ?-Knopf in den Übungen verschiebt sich. Beispiel Tippen: vor
Abgabe der Antwort ist er richtig positioniert. Prüft man die Antwort,
verschiebt er sich in die Kopfzeile. Wenn ein Fakt kommt, verschieben sich ?
und i in die Kopfzeile — die Knöpfe können bei Fakten verschwinden, da brauchen
wir sie nicht.»

ADR 0082 hat die Leiste beweglich gemacht: `leisteHeimschicken()` vor dem
Zeichnen, `leisteUmhaengen()` danach. Das Heimschicken stand in allen drei
Übungen mit Kachel — das Zurückholen **nur in einer**. In «Lernsets» und
«Tippen» geschah es allein durch `render()`.

Und `render()` läuft nur beim Betreten. Eine Übung zeichnet sich danach selbst:
beim Prüfen, beim Weitergehen, beim Umschalten der Tastatur. Jeder dieser Läufe
schickte die Leiste heim und holte sie nie zurück.

Dazu kam ein zweiter Effekt, der es auffällig machte: Die Klasse `bei-kachel`
wurde erst beim Umhängen abgenommen. Die Leiste stand also in der Kopfzeile als
`display: flex` — ein eigener Kasten mit eigenem Abstand, statt durchsichtig zu
sein.

## Entscheidung

**Die Bewegung gehört in eine Hülle, nicht an jeden Ausgang.**

```js
function leisteRahmen(zeichnen) {
  leisteHeimschicken();
  try { zeichnen(); } finally { leisteUmhaengen(); }
}

function renderTippen() { leisteRahmen(tippenInhaltZeichnen); }
```

Die Ausgänge einer Übungsansicht sind viele — Fakt, Leerzustand, Tagesmaß,
gesperrter Stapel, fertige Kachel. An jeden einzeln zu denken war genau die
Disziplin, die schon in 0082 versagt hat, und sie hat ein zweites Mal versagt.
Eine Hülle kann man nicht vergessen: Sie steht in der Zeile, die den Namen
trägt.

**Alle sieben Übungen fahren hindurch**, auch die vier ohne Leiste bei der
Kachel. Eine Regel für alle ist eine, die man sich merken kann; drei Ausnahmen
sind drei Gelegenheiten zum Vergessen. Und es war nötig: «Schreibung» und
«Power-Training» zeigen ebenfalls Faktkarten.

**Zu Hause ist sie durchsichtig, sofort.** `leisteHeimschicken()` nimmt
`bei-kachel` jetzt selbst ab — bleibt der Rückweg doch einmal aus, ist das
Ergebnis wenigstens unsichtbar statt falsch.

## Auf der Faktkarte steht sie gar nicht

Dort gibt es weder eine Aufgabe zu erklären noch ein Wissen dazu. In die
Kopfzeile zu rutschen wäre keine Antwort, sondern das gemeldete Zucken.

**Die Ansicht sagt es selbst:** `faktKarteHtml()` setzt `data-ohne-leiste` an
ihr `<section>`, `leisteZeigen()` fragt danach. Kein Verzeichnis im Code, das
aufzählt, welche Ansichten keine Leiste wollen — solche Listen messen über jede
neue Ansicht hinweg.

Dazu gehört `#uebLeiste[hidden] { display: none; }`: Beide Fassungen der Leiste
setzen ein `display` (`contents` zu Hause, `flex` bei der Kachel), und
**`display` sticht `[hidden]`** — der bekannte Fallstrick, zum dritten Mal.

## Was der Prüfstand dazu sagte

Die Prüfung wurde **vor** der Reparatur geschrieben und war rot: N2 und N3
meldeten `leisteHeim` als Elternteil. Nach der Reparatur die Gegenprobe — die
Fakt-Regel wieder entfernt, und N5 nannte **vier** Übungen statt der einen
gemeldeten: «Schreibung», «Power-Training», «Lernsets», «Übersetzen».

*Der gemeldete Ort ist eine Stichprobe, nicht der Umfang.*

## Folgen

- `tutorial` N1–N5. N5 zählt die Übungen mit Faktkarte auf und nennt beim
  Fehlschlag ihre Namen — eine Zahl allein hätte nicht gesagt, welche.
- Sieben Renderfunktionen heißen innen jetzt `…InhaltZeichnen`; nach außen
  bleibt der Name. Kein Aufrufer ändert sich.
