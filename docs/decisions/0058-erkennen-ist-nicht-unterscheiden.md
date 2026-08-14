# 0058 · Erkennen ist nicht unterscheiden

**Stand:** angenommen · 2026-08-14 · Etappe 7 der Umstellung

## Ausgangslage

«Buchstaben» konnte zwei Dinge: ein Zeichen erkennen (Ш → «sch») und einen Laut zuordnen
(«sch» → Ш). Beides ist **Erkennen**. Was fehlte, war das **Unterscheiden** — und daran
scheitert das Lesen:

- Wer `ш` kennt, kennt darum noch nicht den Unterschied zu `щ`.
- Der Unterschied **hart / weich** ist im Russischen bedeutungstragend, und die App
  erwähnte ihn nirgends. `мать` und `мат` sind zwei Wörter.
- Die Lautschrift behauptete die Vokalreduktion (`молоко → malako`), ließ aber nie üben,
  **welcher** Vokal voll klingt.

Der Didaktikplan nennt dafür drei Dekodier-Generatoren, die ohne Ton auskommen: D3
Minimalpaar, D4 Silbenleiter, D6 Betonung setzen.

## Entscheidung

**Drei Aufgabenformen innerhalb von «Buchstaben», keine neue Kachel.** Alle drei bewerten
den Buchstaben, an dem sie hängen — sonst gehörten sie nicht dorthin.

| Form | Frage | Was gewählt wird |
|---|---|---|
| **Minimalpaar** | die Merkhilfe des Buchstabens | einer von **zwei** Buchstaben |
| **Silbenleiter** | «Welche Silbe ist weich?» / «… hart?» | eine von vier Silben |
| **Betonung** | «Welcher Vokal trägt die Betonung?» | eine von n **Lesarten des Wortes** |

## Begründung

**Sie schärfen, sie führen nicht ein.** Erst ab Stufe 1 — wer einen Buchstaben noch nie
richtig hatte, braucht ihn ganz, nicht in Abgrenzung. Und sie bleiben die Minderheit: Die
gewohnten Formen prüfen den Buchstaben selbst, und darum geht es hier immer noch.

**Nur bei «gemischt».** Das ist die Entscheidung, die beim Bauen aufgefallen ist. Die drei
Formen sind weder «Zeichen → Laut» noch die Gegenrichtung. Wer im Filter eine Richtung
festlegt, hat damit etwas verlangt — ihm stattdessen eine Silbenleiter hinzustellen wäre
ein gebrochenes Versprechen, dieselbe Sorte Fehler wie ein Chip, dessen Zahl nicht hält,
was sein Antippen liefert. Die Suite prüft beide Seiten: bei fester Richtung **keine**
schärfende Form, bei «gemischt» **alle drei**.

**Das Minimalpaar hat zwei Möglichkeiten, weil ein Paar zwei Seiten hat.** Dieselbe
Überlegung wie in «Schreibung» (ADR 0055): Wer den Unterschied kennt, trifft immer; wer
rät, fällt eine Stufe. Eine dritte Möglichkeit wäre erfunden.

Gefragt wird mit der **Merkhilfe**, nicht mit dem Laut — und nur mit ihrem **ersten
Satz**. Der Rest nennt oft den Nachbarn beim Namen («nicht mit В verwechseln»), und in
einer Frage nach genau diesem Nachbarn wäre das die halbe Antwort. Der Build prüft, dass
die beiden ersten Sätze eines Paares sich unterscheiden — und hat beim ersten Lauf sofort
zugeschlagen: `ь` und `ъ` begannen beide mit «Spricht man nicht.» Beide Merkhilfen sind
jetzt umgeschrieben.

**Die Silbenleiter fragt nach der Seite, auf der der geübte Vokal steht.** Ist er weich
(я ё ю и е), lautet die Frage «Welche Silbe ist weich?», und die richtige Silbe trägt ihn;
ist er hart (а о у ы э), dreht sich die Frage um. So bewertet die Aufgabe genau den
Buchstaben, um den es geht. Die Konsonanten kommen aus `SILBEN_KONS` — ж ш ц sind immer
hart, ч щ й immer weich, an ihnen zeigt sich nichts.

**Bei der Betonung wird nicht der Vokal gewählt, sondern das ganze Wort in einer Lesart.**
Bei `молоко` stünden sonst drei gleiche Knöpfe nebeneinander. So steht dort
`мо́локо · моло́ко · молоко́`, und die Wahl ist eine Aussage. Das Wort selbst steht
**ohne** Zeichen da — mit Zeichen wäre die Frage beantwortet.

Und die Aufgabe erscheint nur bei Wörtern, deren **betonter Vokal genau dieser Buchstabe
ist**. Nur dann gehört die Antwort zu diesem Buchstaben, und nur dann darf sie ihn
bewerten. Das ist die Bedingung, die D6 überhaupt in «Buchstaben» gehören lässt.

**`ж` / `ш` fehlt als Paar**, obwohl es das klassischste ist: In `buchstaben.json` tragen
beide denselben Laut «sch». Das ist sachlich ungenau (ж ist stimmhaft), aber `laut` ist
zugleich die Vorlage der Kachelaufgabe — ihn zu ändern hieße, dort etwas anderes zu
verlangen. Die beiden **Merkhilfen** unterscheiden sich sehr wohl, und darum funktioniert
das Paar trotzdem: Es steht in `paare.json` an zweiter Stelle.

## Folgen

- Neue Datei `data/paare.json` (12 Paare mit Hinweis), neuer Block `PAARE`.
- `data/buchstaben.json`: die Merkhilfen von `ь` und `ъ` umgeschrieben, damit ihre ersten
  Sätze unterscheidbar sind. Der Laut bleibt unberührt — er ist die Kennung im Lernstand
  nicht, aber die Vorlage der Kachelaufgabe.
- Neue Fragen tragen ihre Lösung selbst (`abcQ.loesung`); `abcPruefen()` unterscheidet
  danach. Die gewohnten Formen bleiben, wie sie waren.
- Die Suite `buchstaben` wächst um 23 Prüfungen (Abschnitt P) und musste an einer Stelle
  lernen, dass die Kachelaufgabe nicht mehr sicher kommt: щ steht in zwei Minimalpaaren.
