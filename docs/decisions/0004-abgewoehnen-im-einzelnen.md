# 0004 · Abgewöhnen: frei seit, Rekord, Stärke, Rückfall und die Welle im Einzelnen

*2026-10-05 · Bauabschnitt 3 · Version 0.3.0T*

## Ausgangslage

Das Pflichtenheft legt fest: Startzeitpunkt, Rückfälle mit Zeit und optionaler Notiz, der
Rekord bleibt nach einem Rückfall stehen, Stärke = Anteil freier Tage der letzten 66; auf
dem Dashboard «frei seit» live, Knöpfe *Drang* und *Rückfall*, Rekord darunter; der Drang
ist eine 10-Minuten-Welle mit «Gewonnen» oder «Nachgegeben» am Ende. Offen blieb, wie man
etwas zum Abgewöhnen anlegt, ab wann «frei seit» zählt, wie ein Rückfall bestätigt wird,
was mit der Welle geschieht, wenn man die App verläßt — und wie die Rechnung im Einzelnen
aussieht. Die vier Fragen zur Bedienung hat der Nutzer vorab entschieden.

## Entscheidung

**Anlegen und Speicher**

- **Umschalter im Formular «Neue Gewohnheit»**: Angewöhnen | Abgewöhnen. Das Menü bleibt
  wie im Pflichtenheft. Beim Abgewöhnen tritt «Frei seit» (Tag und Uhrzeit) an die Stelle
  des Rhythmus.
- **«Frei seit» ist wählbar, auch rückwirkend**, minutengenau. Unberührt gilt «jetzt» auf
  die Sekunde (bzw. beim Bearbeiten der gespeicherte Zeitpunkt). Nie in der Zukunft, nie
  nach dem ersten Rückfall.
- Gespeichert in `state.abgewoehnen`: `start`, `rueckfaelle: [{ zeit, notiz }]`,
  `draenge` (Zeitpunkte gewonnener Dränge), `archiviert`. Zeiten in Millisekunden. Die
  laufende Welle steht als `state.welle = { id, start }`. Alte Stände laden unverändert —
  die neuen Felder kommen aus `grundStand()`, die erste Ziffer der Version bleibt.

**Rechnung** (`lasterAuswerten(a, nun)`, nichts davon gespeichert)

- **frei seit** = Dauer seit dem letzten Rückfall, sonst seit dem Start.
- **Rekord** = die längste freie Strecke, **die laufende eingeschlossen**. Ein Rückfall
  beendet die laufende Strecke; was sie erreicht hat, bleibt als Rekord stehen.
- **Stärke** = freie Tage der letzten 66, heute eingeschlossen, geteilt durch 66. Tage vor
  dem Start und Tage mit Rückfall zählen nicht frei. So wächst sie wie bei den
  Gewohnheiten von null und ist nach 66 freien Tagen voll. **Heute zählt frei, solange kein
  Rückfall kam** — anders als beim Angewöhnen, wo heute erst mit dem Haken zählt: Hier ist
  der Tag geschafft, bis das Gegenteil eintritt.
- Was nach «jetzt» liegt, zählt nicht — die Uhr des Geräts kann springen.

**Rückfall**

- Der Knopf öffnet eine **eigene Ansicht** (statt eines Blatts): ein Satz («Dein Rekord von
  … bleibt stehen — ab jetzt zählt es neu»), eine freiwillige Notiz, «Rückfall eintragen»
  und «Abbrechen». Eine Ansicht statt eines Blatts, weil ein festes Blatt mit Textfeld auf
  iOS von der Tastatur aus dem Bild geschoben wird.
- Die Zeit ist **jetzt**. Einen vergessenen Rückfall mit früherer Zeit nachzutragen gibt es
  vorerst nicht.
- Ein versehentlicher Eintrag geht in der Detailansicht mit zwei Tipps wieder weg.

**Die Welle**

- «Drang» startet sie und öffnet die Ansicht: großer Ring, der in zehn Minuten leerläuft,
  die Chili darin, die Restzeit, ein Satz zum Aussitzen.
- **«Nachgegeben» geht jederzeit** und führt zur Rückfall-Ansicht («Zurück zur Welle»
  läßt sie weiterlaufen). **«Gewonnen» erst, wenn die zehn Minuten herum sind**; die Chili
  flammt dann auf dem Dashboard, und der Drang zählt auf der Kachel.
- Die Welle steht im Zustand: Sie **läuft weiter, wenn man die App verläßt oder schließt**,
  und wartet danach auf das Urteil. Es gibt **eine Welle zur Zeit**; jeder Drang-Knopf
  führt zu ihr, solange sie läuft. Archivieren beendet sie.

**Dashboard und Detail**

- Der Abschnitt «Abgewöhnen» steht unter den Gewohnheiten (auch unter «Heute nicht dran»),
  über dem Kalender. Das Willkommen erscheint nur, wenn es weder Gewohnheiten noch etwas
  zum Abgewöhnen gibt.
- Die Kachel: Stärke-Ring, Name, «frei seit» live, darunter Stärke, Rekord («Noch kein
  Rückfall» bzw. «Rekord läuft») und gewonnene Dränge, darunter die Knöpfe. **Antippen
  oder lange drücken öffnet sie** — es gibt nichts abzuhaken.
- Die Detailansicht «Abgewöhnen» ist vorläufig: Stand, Name, «Frei seit», die Rückfälle,
  Archivieren. Die Heatmap kommt mit Abschnitt 6.
- **Tagesring und Kalender zählen nur Gewohnheiten.** Ob Rückfälle im Kalender erscheinen,
  entscheidet Abschnitt 6.
- Was live läuft, schreibt `takt()` jede Sekunde an Ort und Stelle; neu gezeichnet wird nur,
  wenn die Welle durch ist.

## Begründung

Der Umschalter hält das Menü, wie es beschlossen ist, und führt beide Richtungen durch
dasselbe Formular. Ein wählbarer Start nimmt ernst, daß viele erst anlegen, wenn sie schon
ein paar Tage durchgehalten haben. Die Bestätigung vor dem Rückfall schützt vor einem
Fehltipp, der den Zähler auf null setzt — der teuerste Fehler, den diese Kachel machen kann.
Die Welle im Zustand übersteht, was am iPhone ständig passiert: App weg, App wieder da.
«Nachgegeben» jederzeit, weil niemand zehn Minuten lang lügen soll, um es sagen zu dürfen.

## Folgen

- Regeln in `.claude/rules/logik.md` und `.claude/rules/oberflaeche.md`, Prüfungen in der
  Suite `abgewoehnen`.
- Abschnitt 6 baut die Detailansicht aus (Heatmap) und entscheidet über Rückfälle im
  Kalender; Abschnitt 7 nimmt `abgewoehnen` und `welle` in den Sicherungscode auf.
