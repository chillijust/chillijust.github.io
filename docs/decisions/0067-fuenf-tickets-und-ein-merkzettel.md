# 0067 · Fünf Tickets — und ein Merkzettel für Erklärungen

**Stand:** angenommen · 2026-08-15 · aus fünf Tickets
**Ergänzt:** ADR 0045 (Reiter), ADR 0051 (das Tutorial ist ein Scheinwerfer),
ADR 0052/0062 (die App über sich selbst), ADR 0060 (die Blase), ADR 0066 (der Lernweg)

## 1 · Die Einstellungen öffnen beim ersten Reiter

ADR 0066 stellte «App» an den Anfang der Reiterleiste, ließ aber `einstReiter` auf
`'lernweg'` stehen — mit der Begründung, «App» habe nichts einzustellen. Das waren **zwei
Meinungen über dieselbe Reihenfolge**, und zwei sind eine zu viel: Die Leiste sagte
«hier vorn», der Aufschlag sagte «nein, dort in der Mitte».

`einstReiter` steht jetzt auf `EINST_REITER[0].id`. Wer die Reihenfolge ändert, ändert
den Aufschlag mit — und muss sich nicht daran erinnern, dass es eine zweite Stelle gibt.
Die Suite `reiter` fragt entsprechend nach der **Stelle**, nicht nach dem Namen.

Die eine Ausnahme bleibt: Der Knopf «Maß ändern» im Tagesmaß-Leerzustand springt weiterhin
gezielt auf «Lernweg» — dort steht der Schalter, den er meint.

## 2 · Die Zahl sagt es schon

Unter «Offline bereit» stand «ja · 2.4.6T». Das «ja» war die Antwort auf die Überschrift
daneben — **die Antwort stand zweimal da**.

Jetzt steht dort die abgelegte Fassung allein, und dass sie abgelegt *ist*, sagt ihre
Farbe (`--good`). Wo es keine Zahl gibt, bleibt ein Wort: «noch nicht», «nicht
unterstützt».

**Die Farbe trägt trotzdem nicht allein.** Ein Vorleser sieht kein Grün, also bekommt das
Feld ein `aria-label` mit dem ganzen Satz (`swAuskunftGelesen()`). Dieselbe Regel wie bei
der Statuslampe im Kopf (ADR 0061) — nur dort trägt der Punkt sein Wort daneben, hier
trägt es das Vorlesefeld.

## 3 · Ein Merkzettel für Erklärungen

**Wunsch:** Grammatik-Erklärungen als Favoriten speichern können, wie Fakten.

Ein Sprachfakt ließ sich seit jeher mit einem Stern merken. Eine Grammatik- oder
Schreibregel — die man **viel eher** ein zweites Mal lesen will — nicht.

**Entscheidung:** Derselbe Stern an jeder Regelkarte, oben rechts. Gespeichert wird eine
flache Menge von Kennungen mit Präfix: `g:` für einen Grammatikbaustein, `o:` für eine
Schreibregel. Das Präfix hält die Töpfe auseinander, ohne zwei Felder zu brauchen, und
eine Regel, die es nicht mehr gibt, fällt beim Zeichnen weg — dieselbe Regel wie bei den
Inhalten im Sicherungscode.

Die Sammlung ist eine eigene Ansicht, **«Gemerkt»**, erreichbar aus der Bilanz neben den
Sprachfakten — dort steht dieselbe Frage: Was habe ich mir aufgehoben? Der Abschnitt
steht auch **leer** da; sonst erführe niemand, dass es den Stern überhaupt gibt.

Sie zeigt die Regeln **ganz**, nicht als Anriss: Wer eine Erklärung noch einmal lesen
will, will sie lesen, nicht suchen, wo sie weitergeht. Ein Tipp auf den Stern nimmt sie
wieder heraus, und die Liste steht sofort neu.

### Elftes Feld im Sicherungscode

Der Fakt-Favorit steckt seit jeher im Code — eine gemerkte Regel gehört genauso hinein.
Das Feld wird **angehängt, nicht eingeschoben**: Ein älterer Code hat es nicht, und ein
älterer Leser überliest es. Beides geht nur, solange es hinten steht. Die Kennungen sind
kurze Wörter aus `[a-z0-9_-]`, also reihen sie sich roh mit Punkten aneinander.

Die Suite prüft beide Richtungen: dass Gemerktes eine Runde übersteht, und dass ein Code
**ohne** das Feld nicht daran scheitert.

## 4 · Der Scheinwerfer leuchtet die Kachel an, nicht ihren Hof

Das Loch stand 22 px weiter außen als das Ziel und lief nach innen weich aus. Auf dem
fast schwarzen Grund war das ein Hauch. Auf den satten Farben seit ADR 0063 wurde daraus
ein **heller Rahmen** um die Kachel — und der zog den Blick stärker an als das, was er
zeigen sollte.

Jetzt: 4 px Luft, harte Kante, und der Radius ist der der Kachel (18 px statt 20). Der
weiche Innenrand entfällt ganz — damit erledigt sich auch die Warnung aus ADR 0051, dass
er dieselbe Deckung brauche wie der äußere Schatten. Was es nicht gibt, kann nicht blass
stehenbleiben.

## 5 · Die Blase bekommt einen Rand

Die Sprechblase der Chili trug die Linie des Schemas (`--line`) und stand damit über der
Titelzeile des Kopfes, ohne sich abzuheben. Sie trägt jetzt **zwei Pixel in der
Akzentfarbe** — dieselbe, die seit ADR 0064 zum Schema gehört.

Der Zipfel besteht aus zwei Dreiecken; das untere trägt die Kante. Es ist entsprechend
zwei Pixel schmaler und zwei tiefer gesetzt, damit von ihm genau die Randstärke der Blase
stehenbleibt — sonst hätte der Zipfel keinen Rand oder einen doppelt so dicken.

## Folgen

- Neu: `state.merk`, `merkId()`, `istGemerkt()`, `merkUmschalten()`, `gemerkteRegeln()`,
  `merkSternHtml()`, `merkBinden()`, `renderMerkzettel()`, `swAuskunftGelesen()`,
  Ansicht `merkzettel`.
- Der Sicherungscode hat **elf** Felder statt zehn; sechs Suiten trugen die Zahl.
- `luft` in `tutLochSetzen()` von 22 auf 4; der `inset`-Schatten des Lochs ist fort.
- Neu: Abschnitt M in `grammatik` (13 Prüfungen).
