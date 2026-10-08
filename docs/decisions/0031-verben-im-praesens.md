# 0031 · Verben im Präsens — und was der Beweis ans Licht brachte

**Status:** angenommen · 2026-08-06 · baut auf ADR 0030

## Kontext

Der Probelauf (Geschlecht, Akkusativ) zeigte die Machart, aber nur neun von 110 fremden
Formen in den Sätzen leuchteten auf. Der Betreiber: «Der Probelauf gefällt mir, das geht
in die richtige Richtung denke ich. Können wir ihn ausbauen?»

Der größte Brocken sind die Verben: 36 Formen, ein Drittel des Ganzen.

## Entscheidung

1. **Drei Bausteine statt einem**: e-Reihe, i-Reihe, Ich-Form.
2. **Die Ich-Form gibt die ты-Form vor**, nicht den Infinitiv.
3. **`быть` bekommt kein Präsens** — auch nicht als Notlösung.
4. **Verben mit eigenem Stamm werden erklärt, aber nicht abgefragt.**
5. **Der Build weist einen überflüssigen `verben.json`-Eintrag zurück.**

## Begründung

**Drei Bausteine, weil es drei Regeln sind.** Die Reihe am Infinitiv ablesen, die
Personenendung anhängen, den Stammauslaut in der Ich-Form kippen lassen — das sind drei
Einsichten, und jede will einzeln entdeckt werden. In einen Baustein gepackt, käme der
Stammwandel in etwa jeder zwölften Aufgabe vor: zu selten, um daraus etwas zu lernen, zu
oft, um ihn zu ignorieren.

**Die ты-Form statt des Infinitivs.** Fragte die Ich-Form nach «любить → ?», müsste man
zweierlei können: den Stamm finden *und* wissen, was mit ihm geschieht. Steht «любишь»
da, liegt der Stamm offen; gefragt ist nur noch das Kippen. Das ist die schärfere Frage —
und sie lässt Verben mit eigenem Stamm zu, denn der wird ja mitgeliefert («спишь → сплю»).

**Ein erfundenes Wort unter den Ablenkern.** ADR 0030 hielt für den Akkusativ fest, die
Ablenker seien echte Formen, nur nicht hier. Bei der Ich-Form steht bewusst «платю» neben
«плачу». Das ist kein Rückfall, sondern derselbe Gedanke: Der Ablenker muss der Fehler
sein, den man tatsächlich macht. Beim Akkusativ ist das eine andere echte Endung, bei der
Ich-Form die ausgebliebene Wandlung.

**`быть` hat im Präsens keine Form.** «буду», «будет» sind Zukunft. Sie als Präsens zu
vermerken, hätte 55 Sätze um zwei erklärte Formen reicher gemacht und der App eine
Unwahrheit eingeschrieben. Die Maschine liefert `null`, «будет» bleibt vorerst
unerklärt — und sagt das auch. Dieselbe Entscheidung wie bei den belebten Nomen: lieber
schweigen als danebenliegen.

**Was man nicht herleiten kann, wird nicht abgefragt.** «писать → пиш-» ist zu wissen,
nicht zu errechnen. Eine Aufgabe darüber prüfte Gedächtnis und nennte es Regelverständnis.
Im Satz erklärt «Wissen» die Form trotzdem — erklären und abfragen sind zwei verschiedene
Dinge, und diese Trennung trägt inzwischen die halbe Grammatik.

**Der Beweis hat sich bezahlt gemacht.** Die Maschine an den 36 Formen zu messen, deckte
zwei Fehler auf, die sonst niemandem aufgefallen wären:

- `жить` und `пить` enden auf `-ить` und landeten damit in der i-Reihe — die Maschine
  baute «живлю» und «пьишь». Sie gehören zur e-Reihe; das steht jetzt in `verben.json`.
- Die Endung der Ich-Form richtete sich nach dem *ursprünglichen* Stamm statt nach dem
  gewandelten: «вижю» statt «вижу», «плачю» statt «плачу», «встречю» statt «встречу».

Beides waren stille Fehler in einer Maschine, die niemand mit der Hand nachrechnet. Genau
dafür steht der Prüfschritt da.

**Der überflüssige Eintrag ist ein Fehler.** Der Kommentar in `build.mjs` behauptete das
schon, geprüft wurde es nicht — und prompt standen vier tote Einträge darin (`смотреть`,
`видеть`, `встретить`, `нравиться`), von denen zwei nur deshalb nötig aussahen, weil die
Maschine falsch rechnete. Die Probe ist einfach: Was liefert die blanke Regel ohne diesen
Eintrag? Dasselbe? Dann weg damit.

## Folgen

- `verben.json` schrumpfte von 20 auf 15 Einträge und ist dabei richtiger geworden.
- 45 der 110 fremden Formen sind erklärt (41 %, vorher 8 %).
- Fünf Bausteine; der Fortschrittspunkt im Kopf zeigt jetzt fünf statt zwei.
- Neue Felder in `grammatik.json`: `klasse` (`e`/`i`) und `person`. Der Build prüft beide
  und misst die Beispiele daran — ein Verb der falschen Reihe bricht ab.
- `gramPaare()` löst `gramEntdeckenWoerter()` als Quelle der Gegenüberstellung ab; die
  alte Funktion wählt weiterhin die Wörter, aber was links und rechts steht, entscheidet
  jetzt die Aufgabe.
- Testreihe `grammatik.mjs` von 65 auf 108 Prüfungen; zusammen 771.
- Offen bleiben: Vergangenheit (11 Formen), Präpositiv (11), Mehrzahl (`дети`),
  Adjektivangleichung (`новую`, `холодной`) und die Zeitangaben im Instrumental
  (`утром`, `зимой`).
