# 0044 · Der Knopf zieht in die Kachel, der Jubel wird ein Fenster

**Stand:** angenommen · 2026-08-09

## Entscheidung

**«Wissen» sitzt in der Kachel, oben rechts** — nicht mehr im Kopf. Er sieht aus wie die
anderen runden Knöpfe, sein Blatt klappt wie deren Blätter auf, und die Chili springt
hinein. Knopf und Blatt stehen weiterhin **genau einmal** im Dokument (`#wissenHuelle`)
und werden umgehängt, nicht neu gebaut.

**Der Ort im Lernweg steht über der Kachel**, größer als die Etiketten darin: Stufe,
Thema, Regel, Buchstabe. In der Kachel bleibt eine dreigeteilte Zeile — links der Stand
oder die Richtung, mittig die Spielart («selbst schreiben», «legen», «wählen»), rechts
Platz für den Knopf.

**Der Jubel ist ein Fenster** (`#jubelBlatt`), kein eigener Bildschirm mehr. Er kommt bei
fünf seltenen Anlässen: Lernset gemeistert, Thema gemeistert, Alphabet komplett, alle
Regeln, Power-Topf leer. **Der Ton wird ausgelost** — trocken, überdreht oder dazwischen.

## Begründung

**Warum umhängen und nicht neu bauen.** Ein zweiter Knopf im Kachel-HTML hätte zwei
Zustände, zwei Zuhörer und zwei Chili-Stationen. Umhängen ist dieselbe Lösung wie beim
Maskottchen: ein Element, viele Plätze.

**Warum die Reihenfolge zählt.** `renderKopf()` läuft **vor** dem Zeichnen der Ansicht.
Sucht man den Platzhalter dort, findet man den der *alten* Kachel — und `main.innerHTML`
wirft die Hülle gleich darauf mit weg, Knopf, Blatt und Zuhörer inbegriffen. Darum:
`wissenHeimschicken()` vor dem Zeichnen, `wissenUmhaengen()` danach. Genau dieser Fehler
trat beim ersten Versuch auf, in vier Testsuiten gleichzeitig.

**Warum der Ton wechselt.** Dreimal dasselbe «Glückwunsch!» ist nach dem zweiten Set kein
Glückwunsch mehr, sondern eine Quittung.

**Warum nur fünf Anlässe.** Ein einzelnes gemeistertes Wort bekommt weiter nur eine Zeile
unter der Auflösung. Was oft passiert, darf nicht jedes Mal weggetippt werden müssen —
sonst wird aus der Belohnung eine Hürde. Das Fenster ist für das Seltene reserviert.

**Ausgelöst wird nur am Übergang**, wie bei `meisterPruefen()`: vorher darunter, jetzt
darüber. Kein Merkposten im Lernstand, und eine wiederhergestellte Sicherung feiert nicht
alles auf einmal nach.

## Folgen

- `.card` ist jetzt `position: relative` — sie ist der Anker für den Knopf und sein Blatt.
- Die Kachel mit Knopf trägt `mit-knopf`; die Meta-Zeile hält rechts 44 px frei.
- Der Jubelknopf ist der **einzige** Weg aus dem Fenster: kein Ziehen, kein Danebentippen.
  Bei einem seltenen, großen Augenblick ist ein Versehen teurer als ein Tipp.
- Prüfungen, die an `uebPhase === 'setfertig'` hingen, fragen jetzt `jubelOffen`.
