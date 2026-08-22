---
paths:
  - "index.html"
---

# Lernlogik · Chillingo

Gilt für `index.html`. Begründungen in den genannten ADRs unter `docs/decisions/`.

## Strenge und Bewertung

- **Drei Strengen, drei Schalter** (ADR 0056). **Die Nachschrift** (`reko`,
  `rekoVerlangen/Html/Fertig/Binden`, geteilt von sechs Übungen) hält nach einem
  Schreibfehler den «Weiter»-Knopf zu, **bewertet aber nichts** — sonst tippte man sich
  aus dem Fehler heraus. Nur bei Kyrillisch, Sätze nur auf ausdrückliche Ansage — aber
  **getippt oder gelegt** (ADR 0070): Die Grenze verläuft zwischen *Herstellen* und
  *Wählen*. Wer ein Wort falsch legt, weiß seine Schreibweise so wenig wie der, der es
  falsch tippt; wer unter fertigen Wörtern wählt, behauptet keine. Seit ADR 0088 gilt sie
  auch in «Lernsets» — die Frage lautet nie «welcher Modus», sondern **«wurde eine
  Schreibweise behauptet»** (ADR 0090).
- Kyrillisch **gelegt** wird nur in «Lernsets» und im Power-Training — die Kacheln in
  «Buchstaben» tragen die Umschrift, die in «Übersetzen» ganze Wörter eines Satzes.
- **Beim Satz gilt eine andere Frage** (ADR 0073): nicht «wurde eine Schreibweise
  behauptet», sondern **«hat der Nutzer es verlangt»**. «Auch Sätze» wirkt darum auf
  **allen fünf Stufen**, gelegt wie getippt — aber nur auf der russischen Seite. Wer hier
  prüft, prüft **die ganze Leiter**: Form und Richtung steigen mit der Satzstufe, und eine
  Prüfung an einer Stelle war drei Stufen lang grün, während die Einstellung schwieg.
- **`reko = null` steht in `aufgabeBeginnt()`**, nicht nur in `rekoVerlangen()`:
  «Aufdecken» führt an jeder Prüfung vorbei, und die Nachschrift der vorigen Aufgabe stünde
  sonst über der nächsten.
- **Ein Tagesmaß gibt es nicht** (ADR 0091) — eine Zahl, die den Übungswillen bremst, war
  eine Meinung über den Nutzer.
- **Das Fehlerprofil** (`state.verwechselt`) liefert höchstens **zwei** der drei Ablenker;
  drei wären eine Wiedervorlage. Es gehört zum Gerät und steht **nicht** im Sicherungscode.
- **Gewertet wird nur, was der Nutzer behauptet hat** (ADR 0033). Die Wortauswertung in
  «Übersetzen» greift nur beim Schreiben ins Russische; Kacheln, die deutsche Seite und
  «Aufdecken» bleiben draußen. Wer aufgibt, hat nichts falsch geschrieben.

## Meistern, Deckel, Tippfolge

- **Der letzte Schritt gehört der Tastatur** (ADR 0086/0088). `updateBox(id, correct,
  getippt)` deckelt bei `BOX_MAX - 1`, bis ein Wort **`TIPP_FOLGE`-mal hintereinander**
  richtig geschrieben wurde (`state.tippFolge`, Momentaufnahme wie `wortFehler`, **nicht**
  im Sicherungscode); ein Fehler setzt die Folge auf null.
- **Gemeistert wird ausschließlich in «Lernsets»** (ADR 0092). Ab `tippAb()` gibt
  `buildQuestion()` `mode: 'tippen'` zurück — dieselbe Gestalt wie in «Tippen», Feld und
  eingebaute Tastatur inbegriffen —, und **nur `uebPruefen()` reicht das dritte Argument
  wahrheitsgemäß durch**. «Tippen» ist eine freiwillige Zugabe und ruft `updateBox(…,
  false)`. Wer das dritte Argument fest verdrahtet, hebelt den Mechanismus aus — genau das
  tat «Lernsets» drei Fassungen lang, und **eine Prüfung, die `updateBox()` selbst aufruft,
  merkt davon nichts** (`lernweg` K5/K6 gehen darum den Weg über die Übungen).
- **Wer oben steht, bleibt oben** (eine Kachelwiederholung ist kein Rückschritt), und der
  Deckel wirkt **nur nach oben**.
- Was ein gemeistertes Wort nach sich zieht, steht in `meisterFolgen()` und wird von beiden
  Übungen gerufen — Set- und Themenjubel hingen vorher in «Lernsets», wo seither nichts
  mehr die Endstufe erreicht.
- **Der Deckel rechnet, ohne es zu sagen** (ADR 0090): `tippDeckel` und `tippRest` bleiben,
  die Hinweiszeile ist weg — sie schob die Kachel so weit nach unten, daß die Übung
  scrollte, und **eine Übung, die scrollt, verliert ihre Knöpfe aus dem Daumenbereich**.
- **Eine Einstellung darf vorziehen, nicht aufschieben** (ADR 0093). `tippAb()` deckelt
  `settings.tippenStufe` bei `BOX_MAX - 1`; die rohe Einstellung wird nirgends mehr gelesen.
  Stand sie darüber — «4» war wählbar —, bekam man auf der vorletzten Stufe ewig Kacheln
  und **kein Wort erreichte je die Endstufe** (gemessen: 0 von 12 gegen 10 von 12). Die
  Wahl bietet nur noch 2 und 3. **Wer eine Grenze einführt, prüft jede Einstellung, die
  daran vorbeizielt** — `lernweg` K7 lernt ein Set bei *jeder* wählbaren Stufe fertig.
- **Gemeistert meldet nur der Übergang** auf `BOX_MAX` (ADR 0026). Wer `meisterPruefen()`
  auch beim Auffrischen auslöst, macht aus der Meldung Rauschen.

## Lernsets und Schwelle

- **Die Schwelle öffnet, sie schiebt nicht** (ADR 0086). `setGeschafft()` heißt «vier von
  fünf Wörtern auf `BOX_MAX`» (`setSchwelle()`), und das Fenster fragt: bleiben oder weiter.
  `state.setBleib` hält das Set fest, bis es `setKomplett()` ist. **`setFrei(nr)` fragt das
  Set davor**, nicht `aktuellesSet()`: Sonst sperrt sich, wer bleibt, das offene nächste Set
  zu. `setBleib` steht als **zwölftes Feld** im Sicherungscode.
- **Gefragt wird genau einmal je Set** (ADR 0088) — danach steht der Weg als Pfeil
  `#setWeiter` neben der Flammenreihe, sobald das nächste Set offen ist. Die Wege des
  Fensters rufen `render()`, nicht `renderUeben()`: Es geht in **beiden** Übungen auf.
- **Das Wort steht im Satz** (ADR 0053). «Lernsets» hat eine vierte Aufgabenform: die
  **Kontext-Lücke**. Ab `SATZ_STUFE` und nur in einem **freigeschalteten** Satz. Die
  Ablenker sind andere **Formen desselben Wortes** aus `grammForm()`; unter zwei davon gibt
  es keine Lücke (Pronomen haben keine). **Der Hörknopf schweigt, solange die Lücke offen
  ist** — er läse die Antwort vor. Sie lebt **unterhalb** der Tippstufe (ändert ADR 0053);
  ohne diese Grenze verschwände sie ganz. Wer eine Aufgabenform hinzufügt, prüft `meister`
  und `hoeren` mit.

## Auswahl, Fälligkeit, Stapel

- **Üben können hängt nie an einem Datum** (ADR 0048). «Tippen» und «Buchstaben» haben den
  Stapel **«Alle»** — alles Begonnene beziehungsweise alle 33 Zeichen, ohne Rücksicht auf
  Stufe und Frist; die Leerzustände tragen ihn als Knopf mit. «Tippen» hat dazu einen
  **Vorrat** (`tippenSet`): ganzer Wortschatz oder ein einzelnes Lernset, und **ein
  gewähltes Set sticht die Stufenschwelle**. Beide Achsen liefert `tippenWoerter(setNr,
  modus)` — dieselbe Funktion rechnet die Zahlen in der Auswahl. «Übersetzen» bleibt bei
  drei Achsen. Seit ADR 0091 ist «Alle» **der einzige** Weg zu Gemeistertem.
- **Fertig heißt fertig** (ADR 0015, geändert durch ADR 0091). «Tippen» und «Übersetzen»
  haben **zwei** Stapel: **Lernen** und **Alle**. Was die Endstufe erreicht, verläßt den
  Lernstapel — und kommt **nicht** wieder: `intervallFuer(BOX_MAX)` ist `Infinity`, ein
  Stapel «Wiederholung» existiert nicht mehr. Wer dort etwas ändert, denkt die Leerzustände
  mit — «noch nichts freigeschaltet», «alles getippt», «Set N ist noch unberührt» sagen
  Verschiedenes. **Keiner von ihnen verspricht ein Wiedersehen** (Suite `wiederholung`).
- **Unfertiges vor Fertigem** (ADR 0090/0091). Fällig sein kann nur, was unfertig ist — die
  Endstufe wird nie wieder fällig. Ist nichts fällig und nichts neu, geht **Unfertiges vor**
  dem Rest: Ohne diesen Zweig blieben die zwei fehlenden Wörter eines alten Sets unter zehn
  gemeisterten liegen (gemessen 27 von 100, mit ihm 50 — zufällig wären es 17).
- **Eine angefangene Tippfolge macht fällig** (`faellig()` fragt `tippFolge`) — jeder
  Treffer erneuert `lastSeen`, und ohne diese Ausnahme schob der erste das Wort um eine
  Woche weg. Die erfüllte Folge wird abgeräumt, sonst gilt das Wort für immer als fällig.
- **Was gerade dran war, kommt nicht sofort wieder**: Die letzten `MERK_LETZTE` Ziehungen
  sind gesperrt, aber nur, soweit der Vorrat es hergibt. Die Sperre steht **ganz vorn auf
  dem Vorrat** — weiter unten ist die Quelle längst auf das eine fällige Wort eingeengt, und
  was allein dasteht, läßt sich nicht ausschließen. «Drei Treffer in Folge» heißt nicht
  «drei aufeinanderfolgende Aufgaben».
- **Wörter, die dreimal hintereinander falsch geschrieben werden**, fallen auf
  `SATZ_STUFE - 1` zurück und schließen damit ihren Satz (ADR 0033). Zähler in
  `state.wortFehler`, Gefallene in `state.patzer`; richtig geschrieben löscht beides. Beides
  steht bewußt **nicht** im Sicherungscode — Momentaufnahmen, kein Lernstand.
- **Das Power-Training zählt regulär mit** (ADR 0034). `ptPruefen()` ruft `updateBox()` und
  `meisterPruefen()` wie jede andere Übung. `ptPool()` räumt beim Nachsehen auf — wer wieder
  auf `SATZ_STUFE` steht, verläßt den Topf.

## Buchstaben und Übersetzen

- **Buchstaben kennen zwei Schwellen** wie Wörter (ADR 0024): «sitzt» ab `SATZ_STUFE`,
  «gemeistert» ab `BOX_MAX`. `abcPool()` fragt nach **gemeistert** — wer das auf «sitzt»
  umstellt, wirft die Buchstaben schon auf Stufe 2 aus der Übung und überspringt genau den
  Kachelmodus, der das Können prüft.
- **Erkennen ist nicht unterscheiden** (ADR 0058). «Buchstaben» hat drei schärfende Formen:
  **Minimalpaar** (aus `data/paare.json`, zwei Möglichkeiten, gefragt mit dem **ersten Satz**
  der Merkhilfe), **Silbenleiter** (hart/weich, die richtige Silbe trägt den geübten Vokal)
  und **Betonung** (gewählt wird die Lesart des Wortes, nicht der Vokal). Alle drei
  **schärfen, sie führen nicht ein** — erst ab Stufe 1 — und sie kommen **nur bei
  «gemischt»**. Ihre Lösung steht in `abcQ.loesung`.
- **Kein Laut steht zweimal unter den Antworten** (ADR 0066). Vier Buchstaben teilen sich
  zwei Laute — ж/ш «sch», з/с «s». Die Ablenker werden gegen die richtige Antwort **und
  untereinander** abgeglichen.
- **In «Übersetzen» hängt die Richtung an der Stufe** (ADR 0029), nicht am Zufall. Die
  Richtung steht in `trTask.dir`, nie beim Zeichnen aus `trDir` gelesen.
- **Home zählt über alle Satzstufen, «Übersetzen» zeigt eine.** Wer seine Stufe fertig hat,
  muß von dort zur nächsten finden (`trStufeMitArbeit()`). Angeboten, nicht genommen.

## Empfehlung, Lernbedarf, Bilanz

- **Eine Übung ohne Arbeit wird nie empfohlen.** `uebungsStand()` gibt `gesperrt` und `leer`
  zurück; `empfehlung()` überspringt beide. **Die Empfehlung ist eine Leiter** (ADR 0066,
  `empfLeiter()`): Die ersten beiden Sprossen sind **Defizite** (Zurückgefallenes, dann die
  Zeichen) und tragen `dringend` — sie stechen die Fortsetzung. Darunter gewinnt «Weiter mit
  …», wenn man vor weniger als `FORTSETZEN_FRIST` dort war; gefragt wird **die Übung**, nicht
  die Leiter. **Jede Sprosse nennt ihren Grund** — sonst ist es eine Ansage, kein Vorschlag.
- **Der Lernbedarf wird gezählt, nicht abgeleitet** (ADR 0086). `quoteZaehlen(übung, richtig,
  thema)` steht an allen **sieben** Prüfstellen; Aufgedecktes zählt nicht mit. `state.quote`
  und `state.quoteThema` stehen als **dreizehntes Feld** im Sicherungscode. Übungen tragen
  ihre ID im Klartext, Themen ihre Kennung, **eine Liste ohne zweiten Abschnitt**; daß keine
  Themenkennung wie eine Übung heißt, hält die Suite `sicherung` fest. Angezeigt wird nur,
  was über `QUOTE_MIN` Antworten und `QUOTE_SCHWELLE` liegt — «0 %» wäre eine Behauptung über
  etwas, das nie stattfand.
- **Lernbedarf und Defizite sind ein Abschnitt** (ADR 0094, ändert ADR 0075/0086):
  **«Woran es hakt»** trägt oben den Gesamtring (`gesamtQuote()`, `.donut.klein` — 178 px
  schoben die Befunde aus dem Bild), darunter die auffälligen Übungen mit ihrem Ring,
  darunter die einzelnen Befunde, am Fuß den einen Weg in «Alle Kategorien». Zwei
  Überschriften über einer Frage behaupten, es seien zwei. Die Befunde sind Zurückgefallenes,
  Verwechslungen (erst ab dem **zweiten** Mal), Zeichen unter der Schwelle, Überfälliges.
  **Jede Zeile nennt einen Grund und einen Weg dorthin**; wo die Übung gesperrt ist, entfällt
  der Knopf.
- Drei Zonen: der Abschnitt **«Woran es hakt»**, «Alle Kategorien» (`bilanzDetail =
  'lernbedarf'`) und die einzelne Kategorie (`kat:<übung>`) mit Themen, Wörtern hinter einem
  Klappfeld und dem Weg in die Übung. **Zurück aus einer Kategorie führt in die Aufstellung**,
  nicht ganz hinaus. Jede Detailansicht endet über `bilanzDetailFertig()`.

## Sicherungscode

- **Die Schalter im Sicherungscode stehen an festen Stellen** (`BK_SETTINGS`). Eine
  Einstellung, die es nicht mehr gibt, hinterläßt ein `null` als Platzhalter; was ein Code
  nicht führt, behält seine Vorgabe.
- **Der Sicherungscode führt Inhalte über eine Kennung** (Hash des Textes, sechs Zeichen).
  `tools/build.mjs` bricht ab, wenn zwei Vokabeln, Sätze oder Fakten dieselbe tragen.
- **Wort umbenennen setzt dessen Leitner-Stand zurück** — die Kennung ist das russische Wort.
  Themen umzubenennen ist folgenlos. **Einen Satz umzuformulieren** setzt genauso seinen Stand
  in `satzBox`/`satzSeen` zurück.
