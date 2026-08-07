# 0034 · Die Auflösung als Blatt

**Status:** angenommen · 2026-08-07 · ändert ADR 0026 in einem Punkt

## Kontext

Bisher wuchs die Auflösung unten an die Aufgabenkarte an: Urteil, Lösung, Hörknöpfe,
Meisterschaft, Patzer. Je nach Bildschirmlage stand sie halb unter der Kante, und die
Hörknöpfe waren dort am wenigsten präsent, wo sie am meisten nützen.

Der Wunsch vom Gerät: «Kann man ein Fenster einfügen, wo das angezeigt wird? Füge dort
auch die Audio ein und sonstiges nützliches.»

## Entscheidung

1. **Ein Blatt von unten** (`#ergebnisBlatt`) trägt die Auflösung — in **allen** Übungen.
2. **Der «Weiter»-Knopf steht im Blatt**, nicht mehr in der Karte.
3. **Der Inhalt scrollt, der Fuß steht fest.**
4. Das Blatt zeigt mehr als vorher: Lösung groß, Umschrift, Leitner-Stand, Thema,
   Hörknöpfe — in «Grammatik» dazu die ganze Regelkarte.

## Begründung

**Der Weiter-Knopf im Blatt ist der ganze Trick.** ADR 0026 hatte einen eigenen Bildschirm
für die Meisterschaft abgelehnt: «Gemeistert wird oft, und jedes Mal wegtippen zu müssen
macht aus der Belohnung eine Hürde.» Das Argument gilt weiter — und trifft dieses Blatt
nicht. Weil der Weg nach vorn **in** ihm liegt, bleibt die Zahl der Tipps gleich: eine
Antwort, ein «Weiter». Ein Blatt, das man erst wegtippen müsste, um dann den Weiter-Knopf
zu suchen, wäre genau die Hürde von damals. Dieses kostet nichts.

Der Knopf steht dabei am unteren Rand — dort, wo der Daumen ohnehin liegt. Er ist damit
sogar leichter zu treffen als vorher mitten auf der Seite.

**Der Fuß muss stehen bleiben.** Der erste Entwurf ließ das ganze Blatt scrollen. In
«Grammatik», wo die Regelkarte mitkommt, lag «Weiter» damit unter der Kante — man musste
erst suchen, was das Blatt gerade vermeiden soll. Jetzt scrollt nur der Inhalt
(`.erg-scroll`), der Fuß (`.erg-fuss`) klebt unten. Damit darf das Blatt beliebig viel
tragen, ohne den Ablauf zu stören.

**Mehr als vorher, nicht nur woanders.** Ein Fenster, das dasselbe zeigt, wäre bloß
Umzug. Es zeigt jetzt die Lösung groß und in Georgia, die Umschrift, den Leitner-Stand als
Punkte und das Thema — und in «Grammatik» die Regelkarte, die genau in dem Augenblick
interessiert, in dem man gerade an ihr gescheitert oder gewachsen ist.

**Die Karte behält die Aufgabe.** Frage, gewählte Antwort und ihre Färbung bleiben oben
stehen. Wer wissen will, was er getippt hat, sieht es weiter — das Blatt deckt nur den
unteren Teil.

**Ein eigener Hörzuhörer.** Bisher hing ein einziger Zuhörer an `#main` und bediente alle
Hörknöpfe (`hoerknopf()`). Das Blatt steht außerhalb von `#main`; es bekommt denselben
Zuhörer, nicht einen zweiten je Knopf. Die Regel bleibt: **nie einen Zuhörer je Knopf.**

**Es schließt sich von selbst.** Beim Wechsel der Ansicht, beim Zurücksetzen und mit dem
nächsten Renderlauf ohne Auflösung. Jede Renderfunktion entscheidet in ihrem
Feedback-Zweig, ob das Blatt auf- oder zugeht — es gibt keinen Zustand, den man vergessen
könnte.

## Folgen

- `ergebnisOffen`, `ergebnisSetzen()`, `ergebnisZeigen(inhalt, weiter)` sowie
  `ergThemaHtml()` und `ergSatzMetaHtml()`.
- `abcAufloesung` und `gramAufloesung`: Beide Übungen bauen ihr HTML als Zeichenkette und
  legen die Auflösung dort ab, weil ihre `…UebenHtml()` nur Text zurückgeben.
- Die Knopfkennungen bleiben (`uebNext`, `tNext`, `trNext`, `abcNext`, `gramNext`) —
  `getElementById` findet sie im Blatt genauso.
- `#meldeKnopf` blendet sich aus, solange das Blatt offen ist; er schwebte sonst darauf.
- Testreihe `patzer.mjs` um 22 Prüfungen erweitert (Abschnitt R: das Blatt in allen fünf
  Übungen); vier ältere Prüfungen suchten die Auflösung in `#main` und wurden nachgezogen.
  Zusammen 882.
- Offen: Ob das Blatt sich auch nach unten wegziehen lassen soll. Vorerst nicht — es
  gehört zum Ablauf, nicht zu den Blättern, die man wegwischt.
