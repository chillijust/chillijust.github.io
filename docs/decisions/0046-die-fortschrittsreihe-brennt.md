# 0046 · Die Fortschrittsreihe brennt

**Stand:** angenommen · 2026-08-09

## Ausgangslage

Über der Aufgabe steht in vier Übungen eine Reihe aus Strichen — ein Strich je Wort,
Buchstabe, Regel oder Runde, gefärbt nach der Leitner-Stufe: grau, blau, blasser blau,
gold. Die Reihe sagt korrekt, wie weit man ist, aber sie sagt es leise. Gold und Blau
unterscheiden sich in der Farbe, nicht in der Gestalt; wer schnell hinsieht, zählt
nichts.

Seit [ADR 0044](0044-knopf-in-der-kachel-und-das-jubelfenster.md) hat die App außerdem
schon eine Flamme: Sie steht im Menüknopf, wo die Chili gerade woanders gebraucht wird.
Ein zweites Bild für dieselbe Sache — «hier ist etwas erreicht» — wäre eine Sprache zu
viel.

## Entscheidung

**Ab der ersten Stufe brennt eine Flamme, und sie wächst mit der Stufe.**

| Stufe | Zeichen | Farbe |
| --- | --- | --- |
| 0 — nicht angefangen | Strich | `--line` |
| 1 | Flamme, 8 px | `--dim` |
| 2 | Flamme, 10 px | `--ice`, blass |
| 3 | Flamme, 12 px | `--ice` |
| 4 — gemeistert | Flamme, 15 px, **flackernd** | `--gold` |

**Die Farben bleiben, wie sie waren.** Geändert hat sich die Gestalt, nicht die
Zuordnung — ein Stand, der gestern blau war, ist heute blau. Wer die Reihe kennt, muss
nichts neu lernen.

**Nur Gold bewegt sich.** Flackerten alle vier Stufen, zappelte eine ganze Reihe, und
das Erreichte fiele nicht mehr auf: Die Bewegung ist die Auszeichnung, nicht die
Grundform. Dieselbe Überlegung wie beim Jubel in ADR 0044 — was oft passiert, darf nicht
lauter sein als das Seltene.

**Was nicht angefangen ist, bleibt ein Strich.** Eine Flamme der Stufe null wäre ein
Widerspruch; ein Strich ist ein Docht, der noch nicht brennt.

**Die Reihe richtet sich unten aus.** Eine Flamme wächst nach oben — der Boden ist die
gemeinsame Kante, sonst hinge der Strich der ungeübten Wörter in der Luft. Aus demselben
Grund liegt der Drehpunkt des Flackerns bei `50% 88%` und nicht in der Mitte.

**Die Reihe ist ein Raster.** Als umbrechende Flexbox verteilte die letzte Zeile den
ganzen Restplatz unter ihre wenigen Zeichen — bei 33 gemeisterten Buchstaben standen die
zehn Flammen der zweiten Zeile sichtbar weiter auseinander als die 23 darüber. Mit
Strichen fiel das nie auf: Ein Strich füllte sein Fach aus, eine mittig stehende Flamme
lässt die Lücke sehen. `repeat(auto-fill, minmax(15px, 1fr))` legt die Spalten einmal für
alle Zeilen fest. `auto-fit` wäre falsch — es lässt leere Spalten zusammenfallen, und
eine kurze Reihe (zehn Regeln) zöge sich über die volle Breite auseinander.

## Begründung

Die Größe trägt die Aussage, die Farbe bestätigt sie. Eine Reihe, in der die Zeichen
messbar wachsen, liest sich in einem Blick als Fortschritt; eine Reihe gleich hoher
Striche muss man entziffern. Das ist kein Schmuck, sondern die zweite Codierung neben
der Farbe — dieselbe Regel wie bei der Prüfzeile ([ADR 0037](0037-buchstaben-zeigen-und-tastatur-waehlen.md)):
Farbe trägt nie allein.

Die Flamme ist außerdem schon eingeführt. Sie steht im Menüknopf für dasselbe — Wärme,
Serie, etwas, das man am Brennen hält. Sie ein zweites Mal zu verwenden kostet nichts
und macht die Bildsprache enger.

## Folgen

- **Das Zeichen steht genau einmal im Code**: `ppHtml(stufe)`. Die vier Aufrufstellen
  (`setKopfHtml()`, `abcKopfHtml()`, `gramKopfHtml()`, `ptKopfHtml()`) reihen es nur
  noch auf. Eine neue Übung mit Fortschrittsreihe ruft dieselbe Funktion.
- **Die Pfade stehen einmal in `FLAMME_PFADE`.** `ICON.flamme` und `ICON.flammeEng`
  unterscheiden sich allein im `viewBox`: weit für den Knopf, wo die Flamme neben Zahnrad
  und Pfeil gleich groß wirken soll, eng für die Reihe, wo sie ihren Platz füllt.
- **Die Animation hängt an zwei Selektoren** (`.punkt`, `.pp.s4`) statt an der Klasse
  `.flamme-aussen` allein. Wer eine dritte Stelle mit Flamme baut und Bewegung will,
  nennt sie dort — stillstehen ist ab hier die Vorgabe.
- Vier Takte über `nth-child` verteilen das Flackern, damit eine volle Reihe lebt statt
  im Gleichschritt zu pulsen. Die Verzögerung ist negativ: Die Flammen brennen von
  Anfang an, nur versetzt.
- `prefers-reduced-motion` schaltet weiterhin alles Flackern ab. Die Reihe bleibt dann
  vollständig lesbar — Größe und Farbe genügen.
- Die Reihe ist höher als vorher (15 px statt 4 px je Zeile). Das kostet auf den langen
  Reihen — Alphabet, volles Lernset — spürbaren Platz über der Aufgabe; die Aufgabe
  selbst sitzt weiterhin auf zwei Dritteln der Höhe und bleibt in Daumenreichweite.
