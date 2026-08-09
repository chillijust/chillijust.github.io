# 0043 · Vier neue Regeln, und was sie über die Bauform verraten

**Stand:** angenommen · 2026-08-09 · baut auf [ADR 0030](0030-grammatik-ist-eine-funktion.md)

## Ausgangslage

Der Grammatikteil trug sechs Bausteine: Geschlecht, Akkusativ, Präsens in zwei Reihen, die
Ich-Form, der Präpositiv. Gewünscht war Ausbau — «der Grammatikteil funktioniert ganz gut,
können wir ihn erweitern?» — und mehr Übungen im alten wie im neuen Teil.

## Entscheidung

Vier Bausteine kommen dazu: **Mehrzahl**, **Genitiv**, **Übereinstimmung** (Adjektiv nach
Nomen) und **Vergangenheit**. Zehn statt sechs Regeln, und der Aufbau von ADR 0030 bleibt
unangetastet: Die Karteikarte ist die Regel, die Aufgabe verlangt eine nie gesehene Form,
die Formenmaschine steht doppelt und wird an den vermerkten Formen der Sätze gemessen.

Drei davon zeigen etwas, das die sechs alten nicht konnten:

**Die Vergangenheit fragt nach dem Geschlecht, nicht nach der Person.** Sie ist damit der
Gegensatz zum Präsens, und die Übung stellt genau ihn: Ausgelost wird nicht die Person,
sondern wer gehandelt hat. Sie greift auch bei Verben mit eigenem **Präsens**stamm —
`писать → пиш-`, aber `писал` folgt der Regel. Darum ist `praet` ein eigenes Feld in
`verben.json` und nicht Teil der Formenliste, und ein Eintrag, der **nur** `praet` trägt,
entkommt der Präsensprobe.

**Die Übereinstimmung ist die erste Regel, in der ein Wort über ein anderes entscheidet.**
Bisher entschied jedes Wort für sich. Darum braucht dieser Baustein als einziger ein
zweites Feld — `partner`, die Nomen, nach denen sich das Adjektiv richten darf.

**Mehrzahl und Genitiv nennen ihre Wörter selbst**, wie der Präpositiv seit ADR 0030:
«zwei Wasser» ist keine Mehrzahl, sondern eine Sonderbedeutung, «нет музыки» sagt niemand,
und «тёмный папа» ist tadellos gebeugt und trotzdem Unsinn. Was einmal die Ausnahme war,
ist damit die häufigere Bauform — vier von zehn Bausteinen nennen ihre Wörter.

## Begründung

**Warum diese vier.** Die Vergangenheit ist die einfachste Regel der Sprache und die mit
dem größten Gewinn; die Mehrzahl folgt derselben Endungslogik wie das Geschlecht, das
schon dasteht; der Genitiv ist der Arbeitsfall («нет», «у», Mengen); die Übereinstimmung
bringt ein Prinzip, das in keinem der sechs vorkam. Alle vier kommen ohne neue
Satzstrukturen aus.

**Warum `nomen.json` jetzt drei Felder trägt.** Flüchtige Vokale und eigene Stämme wirken
in mehreren Fällen, aber nicht in allen: `рынок` braucht `praep` und `gen`, seine Mehrzahl
`рынки` fällt von allein heraus. Jede Angabe wird darum **für sich** gegen die blanke
Regel geprüft, nicht der Eintrag als Ganzes. Sonst hätte ein nötiges Feld ein
überflüssiges gedeckt.

**Mehr Übungen hieß auch: mehr Wörter.** Die Beispielvorräte der alten Bausteine ließen
sich verdoppeln bis verdreifachen — bei den Verben war der Lehrplan aber leer, es gab
schlicht keine weiteren, an denen sich die Regel zeigen ließ. Darum kamen fünfzehn Verben
dazu (`отвечать`, `спрашивать`, `звонить`, `ходить`, `просить`, `сидеть` …), ans Ende
ihrer Themen wie vorgesehen. Vier davon wandeln ihren Stamm in der Ich-Form; dieser
Baustein wächst damit von sechs auf zehn Wörter — vorher hätte er sich nach sechs Aufgaben
wiederholt.

## Folgen

- Neue Rollen in `grammForm()`: `gen`, `plural`, `praet{m,w,s,p}`, `adj{m,w,s,p}`. Sätze
  können ihre Formen ab jetzt auch darüber belegen.
- `AUFGABEN` im Build kennt vier weitere Werte. Wer eine fünfte Art hinzufügt, muss sie
  dort, in `gramWortPool()`, `gramFrageBauen()`, `gramPaare()` und `gramWarumHtml()`
  eintragen — vier Stellen, alle in derselben Reihenfolge wie die bestehenden.
- Die Testsuite `regeln` prüft die Formen gegen von Hand gerechnete Tabellen und lässt
  jeden Baustein 40 Aufgaben bauen: Jede muss eine Lösung haben, jede Möglichkeit eine
  echte Form sein, keine doppelt.
- **Prüfungen dürfen nicht über die Position gehen.** Ein Test hing an `GRAMMATIK[1]` und
  fiel um, als die Reihenfolge sich änderte. Bausteine werden über ihre Kennung gesucht.
