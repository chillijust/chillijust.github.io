# 0053 · Das Wort steht im Satz

**Stand:** angenommen · 2026-08-13 · Etappe 2 der Umstellung

## Ausgangslage

Der Didaktikplan nennt die Lückenaufgabe im Beispielsatz den **Standardfall** und isolierte
Vokabeln „nur als Notlösung". Chillingo machte es genau umgekehrt: «книга — was heißt
das?», und der Satz kam erst viel später in einer anderen Übung.

Das kostet doppelt. Man lernt die Grundform und trifft im Satz auf eine Beugung, die man
nie geübt hat — die Endung wird zur Überraschung statt zur Regel. Und man lernt das Wort
ohne seinen Zweck: `книга` allein ist eine Vokabel, `Я читаю книгу` ist Sprache.

## Entscheidung

**Eine vierte Aufgabenform in «Lernsets» und «Freestyle»: die Kontext-Lücke.**

Der Satz steht da, das Wort fehlt, vier Formen stehen zur Wahl:

> Я читаю ——.
> *Ich lese ein Buch.*
> книги · книге · книга · **книгу**

**Die Ablenker sind andere Formen desselben Wortes**, gerechnet von `grammForm()` — der
Maschine, die «Grammatik» ohnehin antreibt. Das ist der eigentliche Gewinn: Wer zwischen
книга, книгу und книге wählt, lernt die Endung, nicht die Vokabel.

Sie greift **ab `SATZ_STUFE`** und nur, wo es einen **freigeschalteten** Satz gibt —
und dann in der Hälfte der Fälle, damit die Kachelaufgabe nicht verschwindet.

## Begründung

**Der Satz muss lesbar sein.** Ein Satz voller unbekannter Wörter erklärt nichts, er
verwirrt. `lueckeStellen()` nimmt darum nur Sätze, die `satzFrei()` sind — alle ihre
Wörter sitzen bereits. Das ist dieselbe Schwelle, an der «Übersetzen» sie freischaltet.

**Die deutsche Fassung steht mit da.** Ohne sie wäre die Lücke ein Ratespiel über die
Bedeutung statt eine Frage nach der Form.

**Der Hörknopf schweigt, solange die Lücke offen ist.** Er läse den Satz samt fehlendem
Wort vor — also die Antwort. Nach der Auflösung steht er wieder da, dann mit dem ganzen
Satz in beiden Sprachen. Das ist die bestehende Regel «Was die Antwort wäre, schweigt bis
zur Auflösung», nur an einer neuen Stelle.

**Nach der Auflösung steht der ganze Satz.** Das ist der Zweck der Übung: das Wort an
seinem Platz zu sehen, nicht die Endung allein.

**Die Form kommt aus dem Satz, nicht aus einer Rechnung.** 42 der 55 Sätze tragen bereits
`formen`-Angaben (Oberfläche → Lemma + Fall); wo keine steht, kommt das Wort in der
Grundform vor. Beides zählt, und beides wird gegen den Satztext geprüft — eine Form, die
im Satz gar nicht steht, ergäbe eine Lücke ohne Lösung.

**Nur ganze Wörter.** `он` steckt in `она`; eine Teilzeichenkette darf nie eine Lücke
auslösen.

**Unter zwei Ablenkern gibt es keine Lücke.** Pronomen und Adverbien haben keine anderen
Formen — zwischen «он» und «он» gäbe es nichts zu wählen. Der Bauer gibt dann die
gewohnte Aufgabe zurück.

## Folgen

- Neuer Modus `luecke` in `buildQuestion()`, neben `mc-de`, `mc-ru` und `tiles`.
- Gewertet wird wie überall: `updateBox()`, derselbe Leitner-Stand, dieselbe
  Meisterprüfung. Aufdecken stuft zurück wie sonst auch.
- **Im Lesemodus nicht.** Dort geht es um Buchstaben, nicht um Formen (ADR 0035).
- Neue Suite `luecke`: Stellen, Ablenker, Schwellen, Darstellung, Wertung, und dass der
  Hörknopf schweigt.
- **Zwei ältere Suiten mussten die vierte Form lernen.** `meister` und `hoeren` gingen von
  drei Aufgabenformen aus und wurden dadurch **flatterhaft** — mal grün, mal rot, je
  nachdem, was die Auslosung ergab. `meister` beantwortet jetzt jede Form richtig,
  `hoeren` siebt die Lücke aus, weil ihr Gegenstand gerade der Hörknopf auf der Frageseite
  ist, den die Lücke bewusst nicht hat.
- **Ein Nebenbefund über den Prüfstand selbst:** Steht der ganze Wortschatz auf demselben
  Stand, zieht `waehleWort()` die frühen Wörter aus dem Lehrplan — und das sind Pronomen
  ohne Beugung. Eine Suite, die so aufgebaut ist und auf eine Lücke wartet, wartet ewig.
  Die Suite macht darum **genau ein Wort fällig** (`nurDieses()`).
