# 0086 · Gemeistert wird getippt, und der Lernbedarf wird gezählt

**Stand:** angenommen · 2026-08-16 · aus zwei Tickets
**Ändert:** ADR 0006 (wann ein Set geschafft ist) · ADR 0075 (die Defizite in
der Bilanz) · ADR 0047 (was ein Fenster feiert)

## 1 · Der letzte Schritt gehört der Tastatur

**Befund:** «Ich möchte, daß Wörter selber per Tastatur getippt werden müssen,
bevor sie gemeistert werden.»

Wer ein Wort unter vier fertigen Kacheln wiedererkennt, hat es wiedererkannt —
mehr nicht. Bis 2.5.0 reichte das bis auf die Endstufe, und «gemeistert» hieß
damit weniger, als es behauptete.

**Entscheidung** (auf Nachfrage: *nur der letzte Schritt*): `updateBox()` nimmt
ein drittes Argument. Gelegt und gewählt bringen bis **vor** die Endstufe;
darüber kommt nur, wer geschrieben hat. Von den vier Aufrufern tippt genau
einer — «Tippen».

Zwei Grenzen, beide nötig und beide durch die Prüfung erzwungen:

- **Wer oben steht, bleibt oben.** Ohne diese Grenze stufte jede richtige
  Kachelantwort ein fertiges Wort wieder herunter.
- **Der Deckel wirkt nur nach oben.** Falsch bleibt falsch.

**Ein Wort, das stehenbleibt, sagt warum.** An der Stelle, an der sonst
«gemeistert» steht, steht jetzt die andere Hälfte der Auskunft: *Fast — der
letzte Schritt fehlt.* Ohne diese Zeile klebte ein Wort auf der vorletzten
Stufe, und die Punktreihe zeigte nur, daß nichts weitergeht.

### Was daran hing, ohne daß es jemand sagte

Der Set-Jubel und der Themen-Jubel hingen beide in `uebPruefen()` — also in
«Lernsets», wo seit dem Deckel **kein Wort mehr die Endstufe erreicht**. Wer
nur den einen umgezogen hätte, hätte den anderen still verloren. Beide stehen
jetzt in `meisterFolgen()`, und beide Übungen rufen sie.

*Wenn eine Bedingung ihren Ort wechselt, wechseln alle Folgen mit — auch die,
an die man beim Umbau nicht denkt.*

## 2 · Vier von fünf öffnen das nächste Set

**Befund:** «Das nächste Set wird erst bei 80 % gemeistert freigeschaltet — der
Nutzer soll eine Meldung bekommen, die er abbrechen kann.»

Zwei Änderungen in einem Satz: **gemeistert** statt «sitzt» (strenger), und
**80 %** statt aller (milder). Auf hundert Prozent zu warten hieße, wegen
zweier zäher Wörter den Lehrplan anzuhalten; die bleiben ohnehin im Stapel.

**Die Schwelle öffnet, sie schiebt nicht.** Das Fenster fragt:

| Weg | Wirkung |
| --- | --- |
| Bei Set N bleiben | `state.setBleib = N`; hier wird weiter gelernt |
| Weiter mit Set N+1 | der Merker fällt, es geht der Reihe nach |

Wer bleibt, wird beim nächsten gemeisterten Wort **noch einmal** gefragt — sonst
säße er in einem Set fest, das er längst hinter sich hat. Beim ersten Mal trägt
der Jubel die beiden Wege; danach kommt dieselbe Frage ohne Feier. **Die
Auszeichnung gehört dem ersten Mal (ADR 0047), die Entscheidung nicht.**

Der frühere Weg «Zu Übersetzen» ist damit aus dem Fenster verschwunden — drei
Knöpfe wären einer zu viel. Die freigeschalteten Sätze nennt der Text
weiterhin, und dorthin führt die Empfehlung auf Home.

**Was die Prüfung fand:** `setFrei()` hing an `aktuellesSet()`. Beides war
dasselbe, solange man immer im ersten ungeschafften Set stand — seit «bleiben»
nicht mehr: Wer blieb, sperrte sich damit das offene nächste Set wieder zu.
Frei ist ein Set jetzt, **wenn das davor geschafft ist**.

`setBleib` fährt im Sicherungscode mit (zwölftes Feld). Es ist keine
Momentaufnahme wie `patzer`, sondern eine Entscheidung über den Lernweg.

## 3 · Aus «Defizite» wird «Lernbedarf»

**Befund:** «Dem Nutzer sollen die Übungskategorien angezeigt werden, bei denen
noch Lernbedarf besteht — mit der Fehlerquote als kleinem Kreisdiagramm.»

**Eine Quote muß gezählt werden, sie läßt sich nicht ableiten.** Aus einer
Leitner-Stufe geht hervor, wie weit ein Wort ist — nicht, wie oft man daneben
lag, um dorthin zu kommen. Auf Nachfrage: **neu mitzählen ab jetzt**, je Übung
und je Thema, an allen sieben Prüfstellen. Aufgedecktes zählt nicht mit: Wer
aufgibt, hat nichts falsch beantwortet (dieselbe Grenze wie ADR 0033).

**Die Quoten stehen im Sicherungscode** (dreizehntes Feld) — auf ausdrückliche
Nachfrage des Nutzers, und zu Recht: Eine Quote, die beim Gerätewechsel bei
null anfängt, wäre keine, und die Bilanz behauptete tagelang, es hake nirgends.
Übungen tragen ihre ID im Klartext, Themen ihre sechsstellige Streuung; **eine
Liste, kein zweiter Abschnitt** — beim Lesen entscheidet, ob die Kennung eine
Übung *ist*. Daß keine Themenkennung auf einen Übungsnamen fällt, hält eine
Prüfung fest.

Drei Zonen, wie im Ticket verlangt:

- **In der Bilanz** die Übungen, an denen es hakt: Ring mit Prozent, Name,
  «11 von 14 daneben». Wer unter acht Antworten oder unter 20 % liegt, steht
  nicht dort — **«0 %» wäre eine Behauptung über etwas, das nie stattfand**,
  und nicht jede Übung, die man angefaßt hat, ist ein Lernbedarf.
- **«Alle Kategorien»** zeigt den ganzen Bestand, auch die ruhigen. Der Weg
  dorthin steht immer da, auch wenn gerade nichts hakt: Wer wissen will, wie er
  dasteht, soll nicht warten müssen, bis etwas schiefgeht.
- **Eine Kategorie** zeigt ihre Quote groß, die Themen darin als Balken, die
  Wörter mit Lernbedarf hinter einem Klappfeld — und den Weg in die Übung, wo
  sie offen ist. **Nichts, was der Nutzer noch nie gesehen hat:** Die Bilanz
  zeigt den Stand, nicht den Lehrplan.

Zurück aus einer Kategorie führt in die Aufstellung, nicht ganz hinaus — sonst
verlöre man bei jedem Blick den Faden.

Der frühere Abschnitt heißt jetzt **«Woran es gerade hakt»** und steht
darunter: erst die Quoten (*wo* hakt es), dann die einzelnen Befunde (*was*
genau).

## Was der Prüfstand und das Bild gefunden haben

- **Vier Suiten führten die Feldzahl des Sicherungscodes** als feste Zahl. Sie
  wurde dreimal zum einzigen Grund für einen roten Lauf. Die Zahl steht jetzt
  an **einer** Stelle; die anderen prüfen, daß *ihr* Anteil mitfährt. *Eine
  Prüfung, die eine Zahl aufzählt, mißt über jede neue Auskunft hinweg.*
- **Ein Namenskonflikt mit einer Suite:** `setVoll()` hieß in `jubel` schon
  etwas anderes. Eine App-Funktion, die eine Suite überdeckt, erzeugt stille
  Fehler — sie heißt jetzt `setKomplett()`.
- **Das Bild fand, was der DOM-Test nicht sah:** Der Ring in der Zeile war so
  groß wie die halbe Seite, weil `.donut.klein` später im Stil steht und bei
  gleicher Spezifität gewinnt. Und die Zahl darin stand auf 0 %, weil
  `prozentText()` nicht rechnet, sondern formuliert — es will den fertigen
  Prozentwert **und** die beiden Zahlen dahinter. Die Prüfung mißt jetzt die
  Größe und liest die Zahl, statt nur zu zählen, ob ein Ring da ist.

## Folgen

- `lernweg` K1–K4 (der Deckel) und L1–L5 (die Schwelle), `einrichten` D2/D3/D4
  (Zählung, Kategorien, Klappfeld), `sicherung` A2/A3b–A3d/A6–A6d (die beiden
  neuen Felder), `jubel` und `maskottchen` auf den Weg über die Tastatur
  umgeschrieben, `meister` D3b–D4c.
- `renderBilanzDetail()` endet über `bilanzDetailFertig()`: Eine Ansicht mit
  mehreren Ausgängen hängt ihre Zuhörer an einer Stelle an — die Lehre aus
  ADR 0084, hier vorbeugend angewandt.
