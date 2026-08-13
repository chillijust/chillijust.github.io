# 0015 · Fertig heißt raus — Wiederholung als eigener Stapel

**Status:** angenommen · 2026-08-02

## Kontext

«Tippen» zeigte jedes Wort ab `tippenStufe`, «Übersetzen» jeden freigeschalteten Satz
der Reihe nach. Beides ohne Ende: Was man beherrschte, kam genauso oft wie das, was man
gerade lernte. Der Bestand wuchs mit dem Fortschritt, statt zu schmelzen — und damit
verlor die Rubrik ihren Sinn als Werkzeug.

Sätze konnten das ohnehin nicht besser: Ihr einziger Stand war `readSeen[ru] = true`,
«wurde gezeigt». Ohne Stufe und ohne Zeitstempel lässt sich weder «sitzt» noch «wieder
fällig» ausdrücken.

## Entscheidung

1. **Zwei Stapel je Rubrik**, sichtbar als Kacheln mit ihren Beständen:
   **Lernen** (noch nicht auf der Endstufe) und **Wiederholung** (auf der Endstufe und
   die Frist ist um). Was fertig ist und ruht, erscheint in keinem von beiden.
2. **Richtig beantwortet heißt wieder raus**, falsch heißt eine Stufe zurück — womit es
   von selbst im Lernstapel steht. Beides fällt ohne Sonderfall aus der bestehenden
   Leitner-Rechnung.
3. **Beim Lernen wird nicht nach Fälligkeit gefiltert.** Nur die Endstufe wartet.
4. **Sätze bekommen dieselbe Leiter wie Wörter**: `state.satzBox` und `state.satzSeen`,
   Skala 0…`BOX_MAX`, dieselben Intervalle, Kennung ist der russische Satz.
5. **Neue Einstellung `auffrischen`** (7/14/21/30 Tage, Vorgabe 21) steuert allein die
   Endstufe; die unteren Stufen behalten ihre feste Leiter.
6. **`trIdx` entfällt.** Die Satzwahl läuft über `waehleSatz()` — niedrigste Stufe
   zuerst, dann das Älteste, ausgelost aus den vordersten vieren.

## Begründung

**Der Bestand muss schrumpfen können.** Ein Übungsstapel, der nur wächst, sagt einem nie,
dass man fertig ist. Erst wenn Gelerntes verschwindet, wird die Zahl auf der Kachel zu
einer Aussage: *so viel liegt noch vor mir.*

**Zwei Stapel statt einer Mischung**, weil sich die beiden Tätigkeiten verschieden
anfühlen. Lernen ist Arbeit an Unbekanntem, Wiederholen ist eine Prüfung auf Bestand.
Sie in einen Topf zu werfen verwischt beides — und man weiß nie, ob ein Fehler schlimm
ist oder normal.

**Keine Fälligkeit beim Lernen.** Die Leitner-Intervalle sind für den Langzeitbehalt
gedacht, nicht dafür, einen Übungswillen auszubremsen. Wer abends weiterüben will, soll
nicht vor einem leeren Stapel stehen, nur weil er heute schon einmal geübt hat. Auf der
Endstufe ist das Warten dagegen der ganze Zweck.

**Dieselbe Skala für Sätze**, obwohl viermal richtig für einen Satz nach viel klingt. Ein
eigener Maßstab hätte eine zweite Zahlenwelt eingeführt, die man beim Lesen des Codes
ständig auseinanderhalten muss. Die Fälligkeit sorgt ohnehin dafür, dass die vier Male
nicht am selben Abend anfallen.

**`auffrischen` wirkt nur auf die Endstufe.** Die unteren Intervalle (1, 3, 7 Tage)
tragen den Lernprozess; sie zur Diskussion zu stellen hieße, das Leitner-System selbst
verstellbar zu machen. Die Auffrischfrist dagegen ist Geschmackssache.

## Folgen

- Wer alles gelernt hat, findet «Tippen» und «Übersetzen» leer vor — mit dem Hinweis,
  wann das Nächste fällig wird. Das ist der gewollte Zustand, kein Fehler.
- Ist ein Stapel leer und der andere nicht, wird von selbst umgeschaltet.
- Die Bilanz zählt statt «Sätze übersetzt» nun **«Sätze sitzen»** — geübt zu haben ist
  keine Aussage mehr, seit es Stufen gibt.
- Alte Stände mit `readSeen` werden übernommen: gesehener Satz → Stufe 1, sofort fällig.
- Eine feste Satzreihenfolge gibt es nicht mehr; Testreihen, die `trIdx` setzten,
  übergeben den gewünschten Satz jetzt an `buildTransTask(satz)`.
- Aufdecken zählt in «Übersetzen» als falsch und senkt die Stufe — das war vorher
  folgenlos.

## Nachtrag · Die Frist ist frei (2026-08-13)

Aus den vier Stufen 7/14/21/30 ist ein Zähler mit − und + geworden: 1 bis 365 Tage, in
Schritten von einem. Vier Chips waren vier Meinungen darüber, welche Zahl sinnvoll ist —
wer 18 Tage will, sollte nicht zwischen 14 und 21 wählen müssen.

- Grenzen und Kappung stehen in `auffrischGrenzen()`, benutzt in `mergeState()` **und**
  beim Zählen. Ein alter Stand mit 7, 14, 21 oder 30 überlebt unverändert.
- **Gedrückt halten zählt weiter** (420 ms Anlauf, dann alle 90 ms). Ohne das wäre der
  Weg von 21 auf 60 vierzig Tipper, und der Zähler wäre schlechter als das, was er
  ablöst.
- Der Zähler zeichnet **an Ort und Stelle** nach, nicht über `renderEinstellungen()`:
  Wer die Taste hält, hielte sonst einen Knopf, den der Renderlauf gerade weggeworfen
  hat.
- Der Sicherungscode führte die Frist schon immer als blanke Zahl; er brauchte keine
  Änderung.

