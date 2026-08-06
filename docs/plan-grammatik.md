# Plan: Grammatik — verstehen statt auswendig lernen

**Stand:** 2026-08-04 · **Probelauf gebaut und ausgeliefert** (ADR 0030).
Was danach kommt, steht unter «Etappen nach dem Probelauf».

---

## Das Problem, in einer Zahl

In den 55 Sätzen stehen **89 Wortformen, die nicht im Wortschatz vorkommen.** Sie lernen
«книга» und lesen «книгу». Sie lernen «работать» und lesen «работает». Die App zeigt eine
Form und sagt nie, woher sie kommt — genau dort entsteht das Auswendiglernen.

| Art der fremden Form | Anzahl |
| --- | --- |
| Verben im Präsens (`читаю`, `работает`, `пишет` …) | 30 |
| Präpositiv, Genitiv, Plural, Vergangenheit, Adjektive | 52 |
| Akkusativ von Nomen (`книгу`, `газету`, `кашу` …) | 7 |

Diese Verteilung bestimmt die Reihenfolge der Bausteine — nicht die Systematik eines
Lehrbuchs.

## Vereinbart

| Frage | Entscheidung |
| --- | --- |
| Was heißt «warum so geschrieben» | **Beides** — Endungen zuerst, Schrift gegen Aussprache später |
| Stellung im Lernweg | **Eigene Übung, freiwillig** — wie «Buchstaben» |
| Lernart | **Erst entdecken, dann Regel** |
| Erster Wurf | **Probelauf** mit einem Bogen, danach neu entscheiden |
| Zuschnitt des Probelaufs | **Geschlecht + Akkusativ** |
| Worterklärung im Satz | **gehört dazu**, schon im Probelauf |
| Abfrage | **gestaffelt** — Endung wählen, ab Stufe 2 selbst tippen |
| Name | **Grammatik** |

---

## Die Machart

### Der Leitgedanke

Eine Vokabel ist ein **Fakt** — man merkt sie sich. Eine Regel ist eine **Funktion** — man
wendet sie an. Daraus folgt alles Weitere:

> **Die Karteikarte ist die Regel, nicht das Wort.**

Der Leitner-Stand gehört zur Regel. Gemeistert ist sie, wenn sie viermal auf
**verschiedene** Wörter richtig angewandt wurde. Wer dieselbe Form viermal wiedererkennt,
hat auswendig gelernt; wer die Regel auf ein Wort anwendet, das er in dieser Form noch nie
gesehen hat, hat sie verstanden. Nur das Zweite zählt hier.

### 1 · Eine Formenmaschine, die der Build prüft

Im Skript rechnet `grammForm(wort, rolle)` aus Grundform und Rolle die Form:
«книга» + Akkusativ → «книгу». Regeln plus eine kurze Ausnahmeliste.

**Das Entscheidende ist die Prüfung.** `tools/build.mjs` lässt die Maschine jede in den
Sätzen annotierte Form nachbauen. Weicht auch nur eine ab, bricht der Build ab. Damit ist
die Grammatik nicht behauptet, sondern nachgewiesen — dieselbe Strenge, mit der der Build
heute schon Dubletten, Kennungen und den Abgleich Alphabet ↔ Tastatur erzwingt.

Nebenwirkung: Neue Aufgaben kosten nichts. Die Maschine erzeugt sie aus jedem Wort des
Lehrplans.

### 2 · Die Erklärung dort, wo die Frage entsteht

In «Übersetzen» wird jedes Wort des vorgelegten Satzes antippbar. Drei Fälle:

| angetippt | Antwort |
| --- | --- |
| eine Grundform (`дом`) | die Vokabelkarte: Bedeutung, Umschrift, Hörknopf |
| eine erklärte Form (`книгу`) | `книгу ← книга · weiblich · Akkusativ (wen? was?) · **-а** wird zu **-у**` |
| eine noch nicht erklärte Form (`работает`) | «Diese Form erklärt der Baustein *Verben im Präsens* — noch nicht dran.» |

Der dritte Fall ist kein Mangel, sondern die ehrlichste Antwort, die die App geben kann —
und er zeigt zugleich, was als Nächstes lohnt.

### 3 · Die Übung «Grammatik»

Sechste Kachel auf Home, **freiwillig** wie «Buchstaben»: blockiert nichts, schaltet
nichts frei, zählt weder in die Serie noch in «beantwortet», eigener Lernstand.

Ein Baustein läuft in drei Schritten:

**a · Entdecken.** Vier bekannte Wörter stehen nebeneinander, vorher und nachher:

```
книга  →  книгу        газета →  газету
каша   →  кашу         музыка →  музыку
```

Darunter die Frage «Was passiert?» und drei Antworten zur Wahl. Nur eine trifft das
Muster. Wer richtig wählt, hat die Regel selbst gefunden — erst **danach** erscheint sie
als Karte. Freie Texteingabe wäre hier nicht bewertbar; die Wahl aus drei Deutungen ist
die bewertbare Form desselben Gedankens.

**b · Die Regelkarte.** Ein Satz, eine Tabelle, ein Merksatz. Kurz genug, um sie zu
behalten, und jederzeit über einen «Warum?»-Knopf wieder erreichbar.

**c · Anwenden, gestaffelt** — dieselbe Steigerung wie überall:

| Stufe | Aufgabe |
| --- | --- |
| 0–1 | Die Endung aus vier wählen: `улиц__` → а · у · ы · е |
| ab 2 | Die ganze Form selbst tippen, kyrillische Tastatur einblendbar |
| 4 (Auffrischung) | ebenfalls tippen |

Das Wort kommt aus **Ihrem begonnenen Wortschatz**, die verlangte Form haben Sie noch nie
gesehen. Bekanntes Wort, unbekannte Form: Genau daran zeigt sich, ob die Regel sitzt.

---

## Der Probelauf: Geschlecht + Akkusativ

Ein zusammenhängender Bogen, kein Themenpaar: *Das Geschlecht steckt in der Endung — und
weil es das tut, kann man vorhersagen, wie sich das Wort verändert.*

**Baustein 1 · Geschlecht.** Die Endung der Grundform verrät es: `-а/-я` weiblich,
`-о/-е` sächlich, Konsonant männlich. `-ь` ist der Sonderfall, den man lernen muss.

Der Wortschatz gibt das her, ohne dass etwas erfunden werden müsste:

| | Anzahl |
| --- | --- |
| Nomen im Lehrplan (grob) | ~253 |
| Geschlecht **aus der Endung ableitbar** | 219 (87 m · 85 w · 47 s) |
| auf `-ь`, Geschlecht **nicht** ableitbar | 19 (`дочь`, `день`, `дверь`, `ночь` …) |
| Ausnahmen trotz `-а/-я` männlich | 3 (`папа`, `дедушка`, `дядя`) |

Also **rund 22 Wörter brauchen eine Angabe**, alle übrigen folgen der Regel. Das ist der
ganze Datenaufwand für diesen Baustein — und die 19 Wörter auf `-ь` sind kein Makel der
Umsetzung, sondern genau das, was ein Lernender auch im Lehrbuch auswendig lernen muss.

**Baustein 2 · Akkusativ.** «Wen? Was?» — das Ziel der Handlung.

| Geschlecht | Grundform | Akkusativ | Beispiel |
| --- | --- | --- | --- |
| weiblich `-а` | книга | книг**у** | Я читаю книг**у** |
| weiblich `-я` | деревня | деревн**ю** | |
| sächlich | письмо | письмо (unverändert) | Она пишет письмо |
| männlich, Sache | дом | дом (unverändert) | |
| männlich, Lebewesen | брат | брат(**а**) | Я вижу брат**а** |

Die letzte Zeile ist ein Zug, den Deutsch nicht kennt. Sie wird ein **eigener Baustein**
und bleibt aus dem Probelauf heraus — bis dahin fragt die Übung nie nach einem männlichen
Lebewesen im Akkusativ (siehe «Geklärt am 2026-08-04»).

### Was der Probelauf kann — und was nicht

**Kann:** Die Übung hat sofort reichlich Stoff — 219 Wörter fürs Geschlecht, 85 weibliche
Nomen für den Akkusativ. Die Regeln decken den größten Teil des Wortschatzes ab.

**Kann nicht:** Im Satz leuchten zunächst nur **7 Wörter** auf (`книгу`, `газету`, `кашу`,
`музыку`, `гостиницу`, `деревню`, `Россию`). Die Masse der fremden Formen sind Verben und
Präpositiv — die kommen erst mit den nächsten Bausteinen.

Das ist kein Fehler des Zuschnitts, sondern die ehrliche Lage: Der Probelauf zeigt die
**Machart** vollständig, den **Nutzen im Satz** erst in Ansätzen. Genau darum ist es ein
Probelauf.

---

## Was sich an den Daten ändert

**`data/vokabeln.json`** — ein **optionales viertes Feld** je Eintrag, nur wo die Regel
nicht trägt:

```json
["дом",   "Haus",   "dom"]          ← unverändert, Regel genügt
["дочь",  "Tochter", "dotsch", "w"] ← Geschlecht angegeben
["папа",  "Papa",   "papa",   "m"]  ← Ausnahme zur Endungsregel
["сегодня", "heute", "sewodnja", "-"] ← keine Formenlehre, Adverb
```

Rund 40 der 380 Einträge bekommen das Feld; 340 bleiben unangetastet. Der Sicherungscode
ist davon unberührt — er führt Wörter über den Hash des russischen Wortes.

**`data/grammatik.json`** (neu) — die Bausteine: Titel, Frage zum Entdecken samt
Antwortmöglichkeiten, Regeltext, Merksatz, Beispiele als Verweise auf Wörter des
Lehrplans. Inhalte gehören nach `/data`, nicht ins Skript — die bestehende Regel gilt
auch hier.

**`data/saetze.json`** — ein optionales `formen`-Feld je Satz, das gebeugte Wörter auf
Grundform und Rolle zurückführt:

```json
{ "ru": "Я читаю книгу.", "formen": { "книгу": ["книга", "akk"] } }
```

Im Probelauf sind das 7 Einträge. Mit jedem Baustein kommen welche dazu — und der Build
erzwingt, dass die Maschine jede davon exakt nachbaut.

## Was `tools/build.mjs` zusätzlich prüft

1. **Jede annotierte Form wird von der Maschine erzeugt** — sonst Abbruch.
2. Jede Grundform einer Annotation steht im Wortschatz.
3. Jedes Nomen hat ein Geschlecht: abgeleitet oder angegeben, nie offen.
4. **Keine überflüssige Angabe** — wo die Regel schon das Richtige liefert, darf kein
   viertes Feld stehen. Das hält die Ausnahmeliste ehrlich klein und verhindert, dass sie
   still zur zweiten Datenquelle wird.
5. Jeder Baustein in `grammatik.json` hat genug Beispiele aus dem Lehrplan.

---

## Etappen nach dem Probelauf

Die Reihenfolge folgt dem Ertrag in Ihren Sätzen, nicht der Lehrbuchsystematik:

| # | Baustein | erklärt … | Formen in den Sätzen |
| --- | --- | --- | --- |
| **P** | **Geschlecht + Akkusativ** | `книгу`, `газету` | 7 |
| **2** | **Verben im Präsens, beide Reihen + Ich-Form** | `читаю`, `работает`, `пьёт` | 36 |
| 3 | Präpositiv nach в/на | `в городе`, `на столе` | ~11 |
| 4 | Vergangenheit, nach Geschlecht | `он читал`, `она читала` | ~11 |
| 5 | Genitiv | `фруктов`, `друзей`, `часов` | ~6 |
| 6 | Rechtschreibregeln | `книги` statt `книгы` | quer durch |
| 7 | **Schrift gegen Aussprache** | `молоко` klingt „malako", `его` klingt „jewo" | Teil zwei Ihrer Frage |

Nach Baustein 2 wären bereits 37 der 89 fremden Formen im Satz antippbar und erklärt, nach
Baustein 4 rund 59.

---

## Geklärt am 2026-08-04

### Belebtheit: Klammern ja — aber nur zum Zeigen, nicht zum Werten

Vorgeschlagen war, die Belebtheit flexibel zu halten: «брат(а)» schreiben und bei der
Eingabe **beide** Formen gelten lassen.

**Die Klammer als Schreibweise ist gut** — sie zeigt in der Regelkarte auf einen Blick,
was hinzukommt: `брат(а)`, `сестр(у)`. Genau so steht es künftig in den Tabellen.

**Beide Formen gelten zu lassen wäre dagegen eine Unwahrheit.** «Я вижу брат» ist kein
zweiter Weg, sondern falsch. Der Vergleich mit den deutschen Artikeln trägt hier nicht:
Dort war Nachsicht richtig, **weil das Russische die Information gar nicht hergibt** — man
kann sie nicht herleiten, nur raten. Die Belebtheit dagegen **kann** man herleiten: Ein
Bruder ist ein Lebewesen, also `-а`. Eine App, die beides durchgehen lässt, bringt einem
bei, dass es egal ist — und das ist der eine Fehler, den ein Grammatikteil nicht machen
darf.

**Der Ausweg ist besser als die Nachsicht:** Die Belebtheit wird ein **eigener Baustein
mit eigener Karteikarte**. Solange er nicht dran war, fragt die Übung **nie** nach einem
männlichen Lebewesen im Akkusativ — die Frage kommt schlicht nicht vor. Nichts muss
großzügig durchgehen, weil nichts Ungelerntes verlangt wird.

Im Satz erklärt sich `брата` trotzdem sofort, nur mit Vermerk:
«männlich + Lebewesen → `-а`. Das erklärt der Baustein *Belebtheit* — noch nicht dran.»

Für den Probelauf heißt das: Akkusativ **ohne** belebte männliche Nomen. Das hält ihn
klein und lässt die Regel trotzdem vollständig stimmen.

### Die Worterklärung heißt «Wissen»

Nicht «Tipp» — der Begriff ist in dieser App bereits besetzt und zwar gegenteilig: Der
Knopf **«Hinweis»** in «Tippen» zeigt die Umschrift, ist also eine Lösungshilfe. Ein
«Tipp» wäre etwas, das man sich besser versagt; **Wissen soll man sich holen**. Genau
dieser Unterschied ist der Sinn des Grammatikteils.

**Das Fenster kommt wie das Menü** (`.menupanel`, Raster `0fr → 1fr`), zwei Wege hinein:

1. **Ein Wort im Satz antippen** — der kürzeste Weg, und die Frage stellt sich ja an einem
   bestimmten Wort. Der Satz steht in «Übersetzen» als schlichter Text (`.sentence`),
   die Wortkacheln sind davon getrennt; ein Konflikt entsteht also nicht.
2. **Ein Knopf «Wissen»** im Kopf — er öffnet dasselbe Fenster mit **allen** erklärbaren
   Wörtern des Satzes untereinander. Für den Überblick, und weil ein Knopf auffindbar ist,
   während «Wörter sind antippbar» erst entdeckt werden muss.

### Der Sicherungscode bekommt ein neuntes Feld

Wie die Buchstaben das achte (ADR 0023). `decodeBackup()` liest die Prüfsumme ohnehin aus
dem **letzten** Feld — Codes mit sieben oder acht Feldern bleiben lesbar, ihr
Grammatikstand ist dann leer. Getragen wird der Stand je Regel, nicht je Wort; das Feld
bleibt darum winzig.

---

---

## Der Probelauf ist fertig — was daraus wurde

| geplant | gebaut |
| --- | --- |
| Formenmaschine mit Build-Beweis | `grammForm()` in App **und** Build, 9 Formen in den Sätzen vermerkt, jede nachgebaut |
| Wortart und Geschlecht in den Daten | viertes Feld bei **141** von 380 Vokabeln |
| Übung «Grammatik», freiwillig | sechste Kachel, eigener Topf, entdecken → Regel → anwenden |
| Abfrage gestaffelt | bis Stufe 1 wählen, ab Stufe 2 tippen mit kyrillischer Tastatur |
| «Wissen» im Satz | Wörter antippbar plus runder Knopf für den ganzen Satz |
| Neuntes Feld im Sicherungscode | drin, ältere Codes bleiben lesbar |
| Testreihe | `grammatik.mjs`, 65 Prüfungen; zusammen 728 |

**Zwei Korrekturen an diesem Plan**, die beim Bauen nötig wurden:

- **141 statt «~40» Angaben.** Der Plan hatte nur an Nomen gedacht. Die Endungsregel
  greift aber auch bei Adverbien und Partikeln: «хорошо» sähe sächlich aus, «пожалуйста»
  weiblich. Ohne die Markierung `-` hätte die Übung nach dem Geschlecht von «bitte»
  gefragt.
- **Die Entdecken-Beispiele müssen kontrastieren.** Der erste Entwurf zeigte vier
  weibliche Wörter — vier Mal dasselbe zeigt kein Muster. Jetzt steht je eines pro
  Geschlecht da.

---

## Etappe 2 ist fertig — Verben im Präsens

| geplant | gebaut |
| --- | --- |
| ein Baustein «Verben im Präsens» | **drei**: e-Reihe, i-Reihe, Ich-Form — es sind drei Regeln, und jede will einzeln entdeckt werden |
| ~30 Formen erklärt | 36; zusammen mit dem Akkusativ **45 von 110** (41 %, vorher 8 %) |
| Formen in `saetze.json` vermerken | 36 neue Einträge, jede vom Build nachgerechnet |
| eigenwillige Verben in Daten | `verben.json`, 15 Einträge — nur was die Regel nicht trägt |
| Testreihe erweitern | `grammatik.mjs` von 65 auf 108; zusammen 771 |

**Drei Entscheidungen, die beim Bauen fielen** (ausführlich in ADR 0031):

- **Die Ich-Form gibt die ты-Form vor**, nicht den Infinitiv. Sonst müsste man zweierlei
  können: den Stamm finden *und* wissen, was mit ihm geschieht.
- **`быть` bekommt kein Präsens.** «буду» ist Zukunft. Zwei erklärte Formen mehr wären
  eine Unwahrheit gewesen.
- **Verben mit eigenem Stamm werden erklärt, aber nicht abgefragt** — «писать → пиш-» ist
  zu wissen, nicht zu errechnen.

**Der Beweis hat zwei stille Fehler gefangen**, die niemand mit der Hand nachgerechnet
hätte: `жить` und `пить` landeten wegen ihres `-ить` in der falschen Reihe («живлю»,
«пьишь»), und die Ich-Form richtete ihre Endung nach dem ungewandelten Stamm («вижю»
statt «вижу»). Beides ist gerichtet, beides steht jetzt in der Testreihe.

---

## Offen — vor dem Bauen zu klären

- Ob die Übung nach dem Probelauf tatsächlich weitergeht oder der Zuschnitt sich ändert.
- Ob die Worterklärung auch in «Lernsets» und «Tippen» erscheinen soll oder zunächst nur
  in «Übersetzen».
