# 0055 · Die Lücke ist ein Paar

**Stand:** angenommen · 2026-08-14 · Etappe 4 der Umstellung

## Ausgangslage

Russisch schreibt nach dem Wortstamm, nicht nach dem Klang. `молоко` spricht sich
«malakó» und steht doch mit zwei о da; `город` klingt auf «-t» und endet auf д. Wer nach
Gehör schreibt, schreibt falsch — und merkt es nie, weil er es richtig *hört*.

Chillingo prüfte das Schreiben bisher nur über «Tippen» und «Übersetzen»: Dort ruft man
ein gelerntes Wort ab. Die Entscheidung «о oder а?» kam darin vor, war aber nie die Frage
— sie ging im ganzen Wort unter, und die Rückmeldung sagte nur «falsch». Der Didaktikplan
nennt dafür zwei Dinge: die **Orthographie-Falle** (E3) und die **Prüfwort-Methode** —
`во́ды → вода́`, die Technik, mit der russische Grundschulen es lehren, und die einzige,
die auf unbekannte Wörter skaliert.

## Entscheidung

**Eine eigene Übung «Schreibung»** in der Gruppe «Wörter», nach demselben Muster wie
«Grammatik»: Die Karteikarte ist die **Regel**, nicht das Wort. Acht Regeln, je ein
Leitner-Stand in `state.orthoBox`/`orthoSeen`, entdecken → Regelkarte → anwenden.

**Und die tragende Entscheidung: Eine Aufgabe ist ein Paar, keine Stelle.**

```json
{ "ist": "молоко", "klingt": "малоко", "pruef": "мо́лочный", "de": "Milch" }
```

Die Lücke steht nirgends als Zahl. `orthoStelle()` rechnet sie aus: gemeinsamer Anfang,
gemeinsames Ende, dazwischen die eine Stelle — `м` + [`о`|`а`] + `локо`.

## Begründung

**Warum kein Index.** Die erste Fassung von `data/ortho.json` nannte die Lücke als
Zeichenposition. Ein Prüfskript fand darin **vierzehn falsche Zahlen** — «akanje молоко
Stelle 1 ist м, erwartet о». Das ist die eigentliche Lehre: Eine falsche Zahl sieht aus
wie eine richtige. Niemand liest `"luecke": 1` und weiß, ob das stimmt; man müsste jedes
Wort einzeln nachzählen. Ein Paar dagegen ist selbsterklärend, und die Maschine kann es
nachrechnen — Build und Suite prüfen für jede der 46 Aufgaben, dass sich `ist` und
`klingt` aus `vor + Stelle + nach` wieder zusammensetzen.

Nebenbei löst das Paar die zweite Hälfte des Problems mit: Eine leere Stelle ist ein
gültiger Fall. `врач` gegen `врачь` ist «ь oder nichts», `солнце` gegen `сонце` ist
«л oder nichts». Ein Index hätte dafür ein zweites Feld gebraucht.

**Warum eine eigene Übung und nicht ein Modus in «Tippen».** Sie prüft eine andere
Fähigkeit: Enkodieren statt Abruf. Und sie hat einen eigenen Lernstand je Regel — eine
Regel gilt als gemeistert, wenn sie viermal auf verschiedene Wörter gewirkt hat, nicht
wenn ein Wort viermal richtig war.

**Warum sie mitzählt.** «Buchstaben» und «Grammatik» bleiben aus Serie und `answered`
heraus, weil sie freiwillig sind — sie stehen auf Home unter «Freiwillig». Die Schreibung
steht unter «Wörter». Eine Übung, die dort steht und trotzdem die Serie unberührt lässt,
widerspräche sich. Also zählt sie mit, und alle fünf Antworten kommt auch hier ein Fakt.

**Warum ab der Satzstufe geschrieben wird.** Zwei Möglichkeiten sind eine Münze. Auf der
unteren Hälfte der Leiter ist das richtig — die Frage soll die Entscheidung isolieren, und
mehr als zwei Möglichkeiten gibt es sachlich nicht. Ab `SATZ_STUFE` wird das ganze Wort
getippt; damit ist eine gemeisterte Regel nie erraten. Dieselbe Schwelle wie in
«Grammatik».

**Warum das Prüfwort in den Daten der Regel steht und nicht an der Vokabel.** Von den 46
Aufgabenwörtern stehen nur vierzehn im Wortschatz. `лестница`, `конечно`, `второй` sind
Beispiele für eine Regel, keine Lernwörter. Ein Feld an der Vokabel hätte für die übrigen
zweiunddreißig keinen Platz — und für die vierzehn hätte es `vokabeln.json` angefasst,
die Datei, deren Kennungen der Lernstand trägt. Sie bleibt unberührt.

**Warum acht Regeln und nicht neun.** Иканье ist weggefallen. Unbetontes е klingt wie и,
aber wo das eine Schreibentscheidung ist, überschneidet es sich fast völlig mit Аканье —
und wo nicht, gibt es kein Prüfwort. Eine Regel ohne Probe wäre Auswendiglernen, also
genau das, was die Übung ersetzen soll.

**`hoerbar: false` ist kein Schalter, sondern eine Aussage.** Bei `-тся/-ться` und beim
Weichzeichen klingen **beide** Schreibweisen gleich; `klingt` ist dort die andere
Schreibweise, nicht die Lautung. Die Gegenüberstellung zeigt dann links die Bedeutung
(«lernen · was tun?» → `учиться`) statt einer Lautung, die es nicht gibt, und die Aufgabe
behauptet keine. Der Build lässt das Feld nur mit dem Wert `false` zu — ein `true` wäre
Rauschen.

## Folgen

- Neue Datei `data/ortho.json` (8 Regeln, 46 Aufgaben), neuer Block `ORTHO`.
  Er steht **zuletzt** im Datenblock: Die Prüfwörter tragen Betonungszeichen, und die
  Suite `betonung` prüft, dass in den *Wortlisten* keines steht. Sie liest jetzt bis zum
  ersten der beiden Blöcke — welcher zuerst kommt, ist damit egal.
- Neue Übung `schreibung` in `UEBUNGEN` und in `UEBUNG_GRUPPEN` (Gruppe «Wörter», hinter
  «Tippen»), neuer Tutorial-Schritt, Filter mit einer Zeile je Regel.
- Neuer Lernstand `state.orthoBox`/`orthoSeen`, gefiltert über `nurSchreibregeln()`.
- **Der Sicherungscode bekommt ein zehntes Feld.** Ältere, neunfeldrige Codes bleiben
  lesbar und tragen dann eben keine Schreibregeln.
- **Ein sechster Jubel-Anlass** — ADR 0044 nannte fünf. Er ist so selten wie der für die
  Grammatik (alle acht Regeln gemeistert) und damit im Sinne der Regel, nicht dagegen;
  die Marke steht in `state.gefeiert.schreibung` und wird von `jubelNachtragen()`
  nachgetragen.
- **Kein Kyrillisch in `name` und `kurz`.** Beide stehen in Versalien-Etiketten: «ь nach
  Zischlaut» wurde dort zu «Ь NACH ZISCHLAUT», «жи · ши» zu «ЖИ · ШИ». Die Regeln heißen
  jetzt «Akanje», «Zischlaut-Regeln», «Verben auf -tsja», «Weichzeichen am Ende»,
  «Endung -ogo und -ego»; der Build bricht ab, wenn Kyrillisch in eines der beiden Felder
  gerät. Im Regeltext bleibt es — dort trägt es die Klasse `cyr`.
- Neue Suite `schreibung` (62 Prüfungen). Sechs bestehende Suiten mussten lernen, dass es
  eine achte Kachel, einen dreizehnten Tutorial-Schritt und ein zehntes Codefeld gibt.
