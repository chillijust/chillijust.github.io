# 0029 · Die Übersetzungsrichtung wechselt mit der Stufe

**Status:** angenommen · 2026-08-04

## Kontext

In «Übersetzen» stand die Richtung fest: entweder RU → DE oder DE → RU, für alle Sätze
gleich, umgestellt im Auswahlpanel. Wer sie nie umstellte, trainierte eine Seite und die
andere nie — und die Stufenleiter behauptete trotzdem, der Satz «sitze».

Dazu ein Fehler: Das Eingabefeld beim Schreiben war mittig gesetzt. Ein Satz wächst beim
Tippen; zentriert rutscht er dabei unter dem Finger hin und her.

## Entscheidung

1. **«Gemischt» ist der Regelfall.** Die Richtung wechselt mit der Stufe des Satzes:

   | Stufe | Richtung | Form |
   | --- | --- | --- |
   | 0 | RU → DE | Kacheln |
   | 1 | DE → RU | Kacheln |
   | 2 | RU → DE | getippt |
   | 3 | DE → RU | getippt |
   | 4 (Auffrischung) | DE → RU | getippt |

2. **Die Richtung gehört zur Aufgabe** (`trTask.dir`), nicht zur Einstellung.
3. **Deutsche Artikel zählen beim Schreiben nicht mit** — im Kachelmodus schon.
4. **Das Eingabefeld ist linksbündig.**

## Begründung

**Gemischt heißt nicht gewürfelt.** Der naheliegende Weg wäre, je Aufgabe zu losen. Das
wäre falsch: Die Stufe eines Satzes ist eine Behauptung darüber, wie gut man ihn kann.
Würfelte die Richtung, käme ein Satz über vier glückliche RU→DE-Runden auf die Endstufe,
ohne je auf Russisch geschrieben worden zu sein — die Leiter maße dann das Losglück mit.
Fest an die Stufe gebunden, steigt die Schwierigkeit in beiden Achsen zugleich: die Form
von der Vorlage zur freien Eingabe, die Richtung vom Verstehen zum Produzieren.

**Vier Stufen, vier verschiedene Aufgaben.** Das ist der eigentliche Gewinn: Vorher gab
es zwei Formen und eine Richtung, also zwei Aufgabentypen für vier Runden — zwei Runden
waren Wiederholung derselben Sache. Jetzt ist jede Runde eine andere Frage an denselben
Satz.

**Die Auffrischung fällt aus der Reihe** — nach dem Muster wäre Stufe 4 wieder RU → DE.
Sie bleibt bei DE → RU getippt, weil eine Sicherheitsrunde die *stärkste* Behauptung
prüfen soll, nicht die bequemste. Wer nach 21 Tagen den Satz noch auf Russisch
hinschreibt, kann ihn.

**Die Richtung gehört zur Aufgabe.** Läse das Zeichnen die Einstellung, verschöbe sich
mitten in einer laufenden Aufgabe alles, sobald der Filter wechselt: Frage und Lösung
tauschten die Seiten, die gelegten Kacheln wären plötzlich falschsprachig. `trTask.dir`
wird einmal beim Bauen festgelegt und danach nur gelesen.

**Artikel sind kein Übersetzungsfehler.** Die deutschen Sätze tragen Artikel («ein Buch»,
«die Zeitung»), das Russische kennt keine. Wer «Я читаю книгу» mit «Ich lese das Buch»
übersetzt, hat richtig übersetzt und den Artikel geraten — ihn dafür eine Stufe zu kosten,
träfe das Falsche. Im **Kachelmodus** gilt die Nachsicht ausdrücklich nicht: Dort liegt
der richtige Artikel als Kachel vor einem, man muss ihn nicht erfinden, sondern nur
erkennen. Das ist genau der Unterschied, den die Leiter abbilden soll.

**Linksbündig, weil der Text wächst.** Zentrierte Ausrichtung ist für eine Zeile hübsch
und für einen wachsenden Satz eine Zumutung: Jedes Zeichen verschiebt alles Bisherige.
Das Meldeblatt macht es seit jeher richtig.

## Folgen

- `trDir` kennt jetzt drei Werte; `'gemischt'` ist die Vorgabe und gehört so in
  `ansichtenZuruecksetzen()`. Eine fest eingestellte Richtung schlägt die Staffelung.
- Der Kopf der Aufgabe nennt die Richtung («Stufe 1 · RU → DE · selbst schreiben») — bei
  wechselnder Richtung muss man sie ablesen können, ohne zu raten.
- Beim Schreiben ins Deutsche steht ein Hinweis unter dem Feld, dass Artikel nicht zählen.
  Eine stille Nachsicht wäre schlechter als keine: Man traute der Bewertung nicht.
- `trArt()` bleibt unverändert — die Formleiter war schon richtig, nur die Richtung fehlte.
- Testreihen, die `trDir = 'ru-de'` als Regelfall annahmen, wurden nachgezogen.
