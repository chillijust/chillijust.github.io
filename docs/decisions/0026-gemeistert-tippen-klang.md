# 0026 · Gemeistert melden, Sätze tippen, den Klang reparieren

**Status:** angenommen · 2026-08-04

## Kontext

Drei Meldungen vom Gerät. Erstens: Wer etwas fertig lernt, merkt es nicht — die Endstufe
wird still erreicht, und die einzige Feier gilt einem ganzen Lernset. Zweitens: In
«Übersetzen» bleibt es bei Wortkacheln, auch wenn ein Satz längst sitzt. Drittens ein
Fehler: Der Ton nach richtig und falsch spielte anfangs, irgendwann nicht mehr — dazu der
Wunsch, den Klang für «richtig» glasiger und mehr nach iOS klingen zu lassen.

## Entscheidung

1. **Eine goldene Zeile unter der Auflösung**, wenn ein Wort, ein Satz oder ein Buchstabe
   `BOX_MAX` **erreicht** — mit eigenem Klang (`tonMeister()`).
2. **Sätze werden zweimal getippt**, bevor sie sitzen: ab Stufe `TR_TIPPEN` (2) und in
   der Auffrischung schreibt man den Satz selbst, davor bleibt es bei den Kacheln.
   Kyrillische Lösungen bekommen die eingebaute Tastatur zum Einblenden.
3. **Der Klang wird repariert und ersetzt:** `interrupted` gilt als Schlaf, `resume()`
   wird abgewartet, jede Geste weckt den Kontext. Statt einzelner Sinustöne klingen
   Anschläge aus mehreren Teiltönen, deren hohe schneller ausklingen.

## Begründung

**Nur der Übergang zählt.** `meisterPruefen()` verlangt ausdrücklich `vorher < BOX_MAX`.
Meldete auch das Auffrischen «gemeistert», wäre die Meldung nach einer Woche Rauschen —
und Rauschen liest niemand. Dass sie selten ist, ist ihr ganzer Wert.

**Eine Zeile, kein Zwischenbildschirm.** Gemeistert wird oft. Jedes Mal einen Bildschirm
wegtippen zu müssen macht aus der Belohnung eine Hürde; die Zeile steht da, wo man ohnehin
hinsieht, und der nächste Knopf bleibt an seinem Platz. Für ein ganzes Lernset bleibt die
Jubelkarte — der seltenere, größere Anlass verdient den größeren Auftritt.

**Kacheln prüfen das Falsche.** Die Wörter stehen da; wer sie wiedererkennt und ihre
Reihenfolge kennt, hat den Satz noch nicht. Erst das Schreiben verlangt, ihn zu
produzieren — dieselbe Steigerung wie beim Wortschatz, wo aus der Vierfachwahl der
Kachelmodus wird und daraus «Tippen». Zwei Runden, weil eine ein Zufallstreffer sein kann,
und beide ganz am Ende: Wer einen Satz zum ersten Mal sieht, soll ihn nicht abschreiben
müssen.

**Wortweise verglichen, nicht Zeichen für Zeichen.** `normalize()` räumt Satzzeichen,
Groß- und Kleinschreibung und doppelte Leerzeichen weg. Ein fehlender Punkt ist kein
Übersetzungsfehler, und ihn als solchen zu werten träfe den Fleißigen härter als den
Nachlässigen.

**Die Tastatur nur, wo sie hilft.** Einen deutschen Satz schreibt man mit der
Gerätetastatur; für einen kyrillischen fehlt sie auf vielen Geräten. Sie überall
einzublenden wäre bequem für die Umsetzung und lästig in der Benutzung.

**Der Ton war zweimal falsch programmiert.** Der eine Fehler ist berüchtigt und stand
trotzdem da: Safari kennt neben `suspended` den Zustand `interrupted` — nach Anruf, Siri
oder Sperrbildschirm. Wer nur auf `suspended` prüft, weckt den Kontext nie wieder. Genau
das erklärt «hat es mal abgespielt, irgendwann dann nicht mehr».

Der zweite Fehler ist subtiler: `resume()` ist **asynchron**. Wer sofort danach Noten
plant, plant in eine stehende Zeit; die ganze Hüllkurve liegt in der Vergangenheit, der
Pegel steht am Endwert, und man hört nichts — auch dann nicht, wenn der Kontext eine
Millisekunde später läuft. Darum wird jetzt im Callback gespielt und grundsätzlich mit
20 ms Vorlauf geplant, nie genau auf `currentTime`.

Dazu weckt **jeder Tipp** den Kontext, nicht erst die Antwort. Die Antwort ist der
falsche Zeitpunkt: Sie soll ja schon klingen. Ein Aufwecken, das nichts zu tun hat,
kostet nichts.

**Glasig heißt: die hohen Teiltöne verstummen zuerst.** Ein einzelner Sinus klingt nach
Prüfgerät. Eine Glocke — und die Töne von iOS — bestehen aus mehreren Partialen, deren
obere deutlich schneller ausklingen als der Grundton. Die leichte Verstimmung der
Vielfachen (2,01 statt 2,00) nimmt dem Ganzen das Tote, und ein langer, leiser Ausklang
gibt den Nachhall, ohne dass eine Hallfahne nötig wäre.

## Folgen

- `meisterMeldung` ist Ansichtszustand und wird überall geleert, wo eine neue Frage
  entsteht — plus in `ansichtenZuruecksetzen()` nach der Regel aus ADR 0017.
- `trEingabe` und `trKb` kommen dazu und gehören dorthin ebenfalls.
- Beim Schreiben gibt es die Abgabe **immer**, unabhängig von der Einstellung
  «Bestätigen»: Anders als bei den Kacheln gibt es keinen Augenblick, an dem die Antwort
  erkennbar fertig ist.
- Während des Tippens wird nicht neu gezeichnet — das nähme dem Feld den Fokus; nur der
  Abgabeknopf wird nachgeführt.
- Testreihen, die einen sitzenden Satz über Kacheln lösten, mussten auf das Feld
  umgestellt werden.
- Neue Testreihe `meister.mjs` (42 Prüfungen) mit einem Schein-`AudioContext`, der
  mitschreibt statt zu klingen; zusammen jetzt 645.
- Ob der Klang auf dem Gerät wirklich wieder kommt, lässt sich hier nicht prüfen —
  Headless hat keinen Ton. Geprüft ist, **was** die App plant, nicht wie es klingt.
