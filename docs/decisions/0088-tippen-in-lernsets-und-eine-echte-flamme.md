# 0088 · Tippen in «Lernsets», ein Knopf statt einer Frage, eine echte Flamme

**Stand:** angenommen · 2026-08-16 · aus vier Tickets
**Ändert:** ADR 0086 (der letzte Schritt, die wiederkehrende Frage) ·
ADR 0053 (wo die Kontext-Lücke lebt) · ADR 0046 (die Gestalt der Flamme)

## 1 · Der Sprung in die falsche Übung

**Befund:** «Nachdem die Meldung in Tippen zum neuen Set abgebrochen wird,
wechselt die Übung zu Lernsets, in der Kopfzeile steht weiterhin Tippen.»

Ein Fehler aus 0086, und ein eindeutiger: Die Wege des Fensters riefen
`renderUeben()`. Das Fenster geht aber in **beiden** Übungen auf — in «Tippen»
schrieb es damit die Lernsets-Aufgabe in eine Kopfzeile, die «Tippen» sagte.

**Entscheidung:** `render()` statt `renderUeben()`. Es fragt `currentTab` und
zeichnet den Kopf gleich mit. *Wer eine Ansicht zeichnet, ohne zu fragen, welche
gerade gilt, zeichnet die falsche.*

## 2 · Einmal fragen, danach ein Knopf

**Befund:** «Es soll nur einmal die Meldung geben, dass ein neues Set verfügbar
ist. Danach per Button-Option.»

0086 ließ die Frage nach jedem weiteren gemeisterten Wort zurückkommen, wenn
man «bleiben» gewählt hatte — damals ausdrücklich so gewünscht, in der Hand
lästig. Beides stimmt: Ohne Wiederkehr säße man fest, **wenn es keinen anderen
Weg gibt**. Also gibt es jetzt einen.

**Entscheidung:** Das Fenster kommt genau einmal je Set. Der Weg nach vorn steht
danach als Pfeil **neben der Flammenreihe**, sobald das nächste Set offen ist.
*Ein Knopf fragt nicht, er wartet.*

Er steht nur beim laufenden Set — in «Alles Freigeschaltete» oder in einem alten
Set gibt es kein «nächstes». Sichtbar 30 px, antippbar 44; die Fläche greift
über die letzte Flamme, und die ist `aria-hidden` und nichts zum Antippen.

Damit fällt die zweite Fenstergestalt (`setWahl`) weg — sie hatte nur einen
Grund, und den gibt es nicht mehr.

## 3 · Geschrieben wird in «Lernsets»

**Befund:** «Die Wörter sollen auch in Lernsets gemeistert werden können — also
Option Tippen einfügen. Regel: Wort dreimal hintereinander richtig tippen zum
Meistern.»

0086 verlangte einen getippten Schritt, und den gab es nur in der Übung
«Tippen» — ein Umweg für etwas, das zum Lernweg gehört.

**Entscheidung** (auf Nachfrage: *drei getippte in Folge sind die ganze Regel*):

- **Ab der Tippstufe wird geschrieben, nicht mehr gewählt.** Kachel- und
  Wahlaufgaben enden dort; die Tippaufgabe hat dieselbe Gestalt wie in
  «Tippen» — Feld, Prüfzeile, eingebaute Tastatur. *Zwei Fassungen derselben
  Aufgabe wären zwei Wahrheiten darüber, was «schreiben» heißt.*
- **Dreimal hintereinander richtig.** Einmal war zu wenig: Ein Treffer kann ein
  Zufall sein. Ein Fehler dazwischen setzt den Zähler auf null; die
  Leitner-Stufe fällt davon unabhängig, wie eh und je.
- Die Zeile unter der Auflösung nennt jetzt die **Zahl**, nicht mehr den Ort:
  «noch 2× richtig schreiben».

`state.tippFolge` ist eine Momentaufnahme wie `wortFehler` — ein Fehler setzt
sie auf null, und im Sicherungscode steht sie darum nicht.

### Was dabei fast verlorengegangen wäre

Die **Kontext-Lücke** (ADR 0053) beginnt auf `SATZ_STUFE`. Hätte die
Tippaufgabe von dort an alles übernommen, wäre die Lücke praktisch
verschwunden — der Prüfstand hat es sofort gemeldet.

Sie lebt jetzt **unterhalb** der Tippstufe, also auf Stufe 2. Darüber wird
geschrieben; eine Lücke, die nicht meistern kann, hielte das Wort dort nur auf.

## 4 · Eine echte Flamme

**Befund:** «Ich möchte, dass die großen Flammen etwas größer werden mit roten
Akzenten — wie eine richtige Flamme.»

Die bisherige war durchgehend golden: als Zeichen brauchbar, als Flamme eine
Behauptung. **Außen Glut, innen ein heller Kern** — das ist, was eine Flamme
ausmacht. Die innere Zunge trägt darum eine eigene Farbe statt einer Deckung
auf der äußeren.

Die Endstufe wächst von 11 × 15 auf 14 × 19 px; der Kasten der Reihe wächst
mit, sonst schnitte er ihr die Spitze ab. Die kleineren Stufen bleiben, wo sie
waren — die Reihe richtet sich unten aus.

**Der Schalter** (auf Nachfrage): Die neue Flamme gehört zu «Dark» und steht
dort immer; in den vier hellen Schemata schaltet man sie dazu. Er **zeigt, worüber
er entscheidet** — zwei Reihen aus je fünf Zeichen, auf dem Grund, den man
gerade sieht. *Eine Vorschau in einer anderen Farbe wäre keine.* In «Dark» ist
er wirkungslos und sagt das, statt still nichts zu tun.

Geführt über `data-flamme="neu"` am Wurzelelement — dieselbe Sprache, in der
schon das Schema steht.

## Was der Prüfstand gefunden hat

- **Der Tutorial-Hof lag über der Messung.** Die Testseite lädt mit leerem
  Speicher, und dann fragt die App von selbst — beim Betreten einer Übung
  zusätzlich die Übungsspur. `elementFromPoint` traf den Hof statt den Knopf.
  Die Regel dazu steht seit ADR 0079 in `CLAUDE.md`; sie gilt auch für Suiten,
  die *nur* messen und nichts anklicken.
- **`tutEnde()` springt zurück**, wohin man vor dem Tutorial gehörte. Nach einem
  `setTab()` gerufen, macht es die Ansicht wieder zunichte.
- **Eine Suite maß im Tutorial-Zustand**, ohne es zu wissen: `lernweg` A1
  erwartet alle acht Kacheln auf Home — die stehen dort nur, solange das
  Tutorial offen ist (ADR 0051). Nicht geändert, aber vermerkt.

## Folgen

- `lernweg` K2–K2f (drei in Folge), M1–M4 (der Pfeil), N1–N3 (einmal fragen);
  `meister` D/E auf die Tippaufgabe; `luecke` auf die Satzstufe; `flammen`
  E4–E4e (Glut, Kern, Größe, Schalter); `jubel`, `maskottchen`, `rubriken`
  auf den Weg über drei getippte Treffer.
