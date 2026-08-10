# 0049 · Die Chili sagt etwas dazu

**Stand:** angenommen · 2026-08-10

## Ausgangslage

Zwei Meldungen, die zusammengehören.

**Der Fakt hatte zwei Gestalten.** In «Lernsets» bekam er einen eigenen Auftritt:
Sprechblase, Chili darunter, ein Stern zum Merken, «Weiter üben». In «Tippen»,
«Übersetzen» und «Power-Training» stand derselbe Fakt als schmaler **Streifen** unter der
Auflösung. Die Begründung dafür war einmal richtig — «ein eigener Bildschirm wäre dort im
Weg, man ist mitten in einer Aufgabe» —, aber sie stimmte nicht mehr: Der Fakt kommt beim
*Weitergehen*, nicht in der Auflösung, und dort ist niemand mitten in etwas.

**Die Sprüche standen verstreut.** Wer sich in «Übersetzen» um einen Buchstaben
verschrieb, las «Ein einziger Buchstabe. Aber wer schreibt, der bleibt.» — in einem
Kasten, der eigentlich vor dem Rückfall warnen soll. Anderswo sagte die App nach einer
Antwort gar nichts.

## Entscheidung

**Ein Fakt, ein Auftritt.** `faktKarteHtml()` und `faktKarteBinden()` stehen einmal im
Code; alle vier Übungen zeigen dieselbe Karte. Den Streifen gibt es nicht mehr.

**Die frei gewordene Zeile trägt einen Kommentar** — nach *jeder* Auflösung, in fünf
Übungen. «Buchstaben» bleibt draußen: Es zählt nicht in `state.answered`, ist freiwillig
und soll kurz bleiben.

**Die Sätze stehen in `data/kommentare.json`**, in zehn Töpfen:

| Topf | wann |
| --- | --- |
| `richtig` · `trocken` | richtig — freundlich beziehungsweise trocken |
| `serie` | ab fünf richtigen in Folge |
| `jo` · `weich` · `lang` | ё, Weichzeichen, langes Wort — **nur beim Schreiben** |
| `eins` | genau ein Zeichen daneben |
| `knapp` | zwei bis drei Zeichen |
| `daneben` | mehr |
| `auf` | aufgedeckt |

**Das Mischungsverhältnis ist eine Eigenschaft der Inhalte, keine Zahl im Code.** Etwa
jeder dritte Treffer wird trocken; wer mehr Trockenes will, schreibt mehr Trockenes.

**Der Patzer-Kasten behält nur, was Folgen ankündigt.** Wie knapp es war, sagt jetzt die
Kommentarzeile darüber; ohne eine Warnung erscheint der Kasten gar nicht mehr.

**Eine Einstellung schaltet die Kommentare ab** (`kommentare`, Vorgabe an), unter
«Darstellung und Ton». Sie bekommt eine feste Stelle im Sicherungscode.

## Begründung

**Zwei Gestalten für dieselbe Sache sind eine zu viel.** Der Streifen war nicht falsch,
aber er erklärte sich nur aus seiner Entstehung. Wer die App zum ersten Mal sieht, liest
zwei verschiedene Dinge, wo eines gemeint ist.

**Ein fester Satz darf keine Zahl behaupten, die er nicht kennt.** «Zwei Zeichen zu viel
Selbstvertrauen» unter einer Prüfzeile, die «1 Zeichen steht falsch» sagt, ist ein
Widerspruch — und Widersprüche kosten Vertrauen, das ein Scherz nicht zurückholt. Darum
hat der eine Buchstabe seinen **eigenen Topf**, und Sätze mit Zahl führen einen
Platzhalter (`{n}`, `{f}`, `{s}`), den der Build gegen eine Liste prüft.

**Eine Besonderheit sticht, aber nicht jedes Mal.** Würde jedes ё denselben Satz
auslösen, wäre nach dem dritten Wort klar, was kommt. Der Wurf entscheidet mit; dieselbe
Überlegung wie beim ausgelosten Ton des Jubels
([ADR 0044](0044-knopf-in-der-kachel-und-das-jubelfenster.md)).

**Gelegt ist nicht geschrieben** ([ADR 0033](0033-wer-schreibt-der-bleibt.md)). «Sogar das
ё» ist ein Lob für die *Schreibweise*. Wer eine Kachel gelegt hat, hat darüber nichts
behauptet — die drei Detail-Töpfe greifen nur bei getippten Aufgaben.

**Der Kommentar trägt kein Kästchen.** Er ist ein Nebensatz, keine Meldung: Was gerahmt
ist, verlangt Aufmerksamkeit, und die gehört der Auflösung darüber.

## Folgen

- **Der Build prüft die Töpfe.** Jeder braucht eine Mindestzahl an Sätzen, kein Text darf
  zweimal vorkommen, und ein unbekannter Platzhalter lässt den Build scheitern — er
  bliebe sonst im Satz stehen und läse sich wie ein Fehler, weil er einer wäre.
- **Kein Satz wiederholt sich sofort.** `kommentarZuletzt` merkt sich die letzten sechs.
  Die Liste ist eine Momentaufnahme und steht nicht im Lernstand.
- `faktKarte` und `kommentar` sind Ansichtszustand und gehören in
  `ansichtenZuruecksetzen()` ([ADR 0017](0017-sicherungscode-format-2.md)).
- Wer eine sechste Übung mit Auflösung baut, ruft `kommentarSetzen()` und stellt
  `kommentarHtml()` unter die Auflösung. Wer eine Übung ohne `state.answered` baut, lässt
  den Fakt weg — sonst käme er nie oder ständig.
- **Die Töpfe sind Inhalt, kein Code.** Neue Sätze gehören nach `data/kommentare.json`,
  danach `node tools/build.mjs`.
