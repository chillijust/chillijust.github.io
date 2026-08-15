# 0065 · Ein Weg statt einer Wand — und ein Strich, der nicht mitgeschrieben wird

**Stand:** angenommen · 2026-08-15 · aus zwei Tickets
**Ergänzt:** ADR 0045 (Gruppen auf Home), ADR 0051 (das Tutorial ist ein Scheinwerfer),
ADR 0054 (die Betonung ist eine Zahl)

## 1 · Der Strich steht über dem Wort, nicht darin

**Befund:** Das Betonungszeichen könne dazu führen, dass der Nutzer denkt, die Wörter
würden so geschrieben.

**Ursache:** Die App hängte U+0301 hinter den betonten Vokal — die Schreibweise der
Wörterbücher. Sie hat zwei Haken. Je nach Schrift setzt der Browser das kombinierende
Zeichen **rechts neben** den Buchstaben statt darüber; dann liest es sich wie ein
Apostroph, also wie ein Teil des Wortes. Und es **steht im Text**: Wer die Zeile kopiert
oder vorlesen lässt, bekommt eine Schreibweise, die es nicht gibt.

**Entscheidung:** Der Strich wird **gezeichnet, nicht geschrieben**. `betontesWortHtml()`
umschließt den betonten Vokal mit `<span class="bet">`; ein Pseudoelement legt einen
kurzen, leicht geneigten Balken mittig darüber. Alle Maße in `em` — dieselbe Regel trägt
die Frage in 32 px und die Antwortkachel in 16 px.

Im Text steht danach genau das Wort. `betontesWort()` mit U+0301 bleibt als **Textfassung**
bestehen: Der Prüfstand misst daran, welcher Vokal die Betonung trägt.

**Was das nebenbei löst:** `hoerknopf()` musste das Zeichen bisher aus dem Vorlesetext
schneiden. Das darf jetzt bleiben, ist aber kein Zaun mehr, sondern ein Gürtel.

## 2 · Die Übersicht zeigt einen Weg

**Befund:** Zu viele Kacheln auf einmal; man weiß nicht, wo anfangen oder weitermachen.

Acht gleichrangige Kacheln in drei Gruppen (ADR 0045) waren besser als sieben in einer
Reihe, aber sie beantworteten die falsche Frage. Sie zeigten **das Angebot**. Gefragt war
**der nächste Schritt**.

**Entscheidung:** Drei Zonen.

1. **Die Empfehlung** — unverändert, aber jetzt allein an der Spitze.
2. **«Außerdem fällig»** — höchstens **drei** Kacheln, und nur, wo wirklich Arbeit
   wartet: `gesperrt` («geht noch nicht») und `leer` («gerade nichts») fallen weg,
   dieselbe Frage wie bei der Empfehlung. Was empfohlen ist, steht schon oben und wird
   nicht wiederholt. Sortiert: was drängt (`warm`) zuerst.
3. **«Alle Übungen»** — ein Knopf, dahinter die drei Gruppen wie bisher.

**Die Kacheln bleiben Kacheln.** Der naheliegende Weg wäre gewesen, sie zu schmalen
Zeilen zu machen; das war ausdrücklich nicht gewollt, und es hätte auch nur die Höhe
gespart, nicht die Frage beantwortet.

`kachelHtml()` steht **einmal** im Code und wird von beiden Listen benutzt: Eine Übung,
die oben anders aussähe als unten, wäre zwei Übungen.

### Warum das Angebot zugeklappt und nicht weggelassen wird

Acht der dreizehn Tutorial-Schritte zeigen auf je eine Kachel (`[data-uebung="…"]`). Ein
Wähler, der ins Leere zeigt, ist ein stiller Fehler (ADR 0051). Alle acht stehen darum
weiterhin im Baum — nur `hidden`.

**Und der Scheinwerfer klappt selbst auf:** Findet ein Schritt sein Ziel nicht *sichtbar*,
öffnet er den Bereich und zeichnet neu. Gefragt wird `getClientRects().length`, nicht ob
das Element existiert — ein zugeklapptes `[hidden]` findet `querySelector` sehr wohl, und
der Scheinwerfer leuchtete dann auf ein Rechteck der Breite null. Nebenbei sieht der
Nutzer dabei, dass es dort etwas aufzuklappen gibt.

Die zwölf Texte in `data/tutorial.json` bleiben unverändert.

### Folgen für den Prüfstand

Dieselbe Übung kann jetzt **zweimal** im Baum stehen — oben als fällige Kachel, unten im
vollen Angebot. Sechs Suiten lasen Kacheln **nach Platz** (`alle('.kachel-stand')[5]`).
Das war schon vorher eine Zeitbombe: Die fünfte Kachel ist eine Position, keine Aussage.
Sie fragen jetzt **nach Namen** und im vollen Angebot:
`q('#homeAlle [data-uebung="buchstaben"] .kachel-stand')`.

Neu: Abschnitt Z in `rubriken` (14 Prüfungen) und F in `betonung` (10).

## Folgen

- Neu: `homeFaellig()`, `kachelHtml()`, `HOME_FAELLIG_MAX`, `homeOffen`,
  `betontesWortHtml()`, `ruAnzeigeHtml()`, `.bet`, `.alle-knopf`, `ICON.winkelRunter`.
- `homeOffen` ist Ansichtszustand und gehört nach ADR 0017 in
  `ansichtenZuruecksetzen()` — nach dem Einspielen einer Sicherung steht dort ein anderer
  Lernstand.
- Wer eine Ausgabe eines russischen Wortes hinzufügt, nimmt `ruAnzeigeHtml()` oder
  `betontesWortHtml()` — **ohne** `esc()` darum, das steckt schon drin.
