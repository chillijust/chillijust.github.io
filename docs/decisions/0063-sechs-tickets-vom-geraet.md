# 0063 · Sechs Tickets vom Gerät — Farbe, Ordnung und ein stehengebliebener Satz

**Stand:** angenommen · 2026-08-15 · aus sechs Tickets einer Sitzung
**Ergänzt:** ADR 0039/0042 (Farbschemata), ADR 0045 (Reiter), ADR 0060 (die Blase),
ADR 0061 (die Statuslampe), ADR 0062 (der Update-Knopf)

Sechs Meldungen aus einer Nacht. Fünf davon betreffen die Oberfläche und hätten je einen
Absatz verdient; einer ist ein echter Fehler und steht darum zuerst.

## 1 · Der Kommentar blieb stehen

**Befund:** Nach «Weiter» verschwand die Sprechblase der Chili nicht — erst die nächste
Antwort ersetzte den Satz.

**Ursache:** `kommentar` wurde ausschließlich in `kommentarSetzen()` gesetzt, und das
läuft beim **Antworten**. Niemand löschte ihn beim Bauen der nächsten Aufgabe. Die Blase
zeigte also weiter den Satz zur vorigen — technisch korrekt, inhaltlich falsch: Der
Kommentar gehört zur Auflösung, nicht zur nächsten Frage.

**Entscheidung:** `uhrStellen()` heißt jetzt `aufgabeBeginnt()` und tut beides — die Uhr
stellen und den Kommentar löschen. Beides meint denselben Augenblick, beides stand
ohnehin an denselben acht Stellen. Eine zweite Funktion daneben hätte nur die Frage
aufgeworfen, welche von beiden man ruft.

Die Suite `kommentare` bekommt Abschnitt M: nach «Weiter» ist die Blase still, und die
Aufgabenbauer aller Übungen räumen den Satz weg.

## 2 · Die Statuslampe: Wort und Punkt gehören zusammen

Das Wort stand acht Pixel neben dem Punkt und war grau, während der Punkt grün oder rot
war. Das las sich wie zwei Angaben, von denen eine veraltet ist. Die Farbe steht jetzt
**einmal an der Hülle**, Punkt und Wort erben sie; der Abstand ist auf vier Pixel
zusammengerückt.

**Und das Wort klappt ein.** Es steht 4,2 Sekunden da und zieht sich dann zum Punkt hin
zusammen — der trägt die Auskunft danach allein. Ein Zustand, der sich nicht ändert, muss
nicht dauerhaft behauptet werden; der Punkt ist die Grenze, weil das Wort rechts von ihm
steht und nach rechts abgeschnitten wird (`max-width` von `8em` auf `0`, kein gerechneter
Wert).

**Aufgeklappt wird nur bei etwas Neuem:** bei einem Wechsel des Netzes und bei der
Rückkehr auf Home. Ein Renderlauf allein ist ausdrücklich **kein** Anlass — sonst stünde
das Wort nach jedem Blattwechsel wieder da und die Frist liefe nie ab.

## 3 · Der Tutorial-Knopf sagt, was er ist

Er hieß «Wie funktioniert das hier?», nahm die ganze Zeilenbreite und war grau. Jetzt
heißt er **«Tutorial»**, nimmt zwei Fünftel der Breite und steht rechts — unter dem
Daumen. Golden ist er in beiden Lagen: oben als gefüllte Fläche (das Angebot beim ersten
Start), unten gestrichelt (die Auskunft für den, der die App kennt). Die Unterscheidung
aus ADR 0051 bleibt, sie trägt jetzt nur Farbe statt Grau.

## 4 · Eine Anzeige, nicht zwei

ADR 0062 gab dem Suchen einen drehenden Ring und dem Laden einen wandernden Balken —
zwei Gestalten, damit man sieht, worauf man wartet. **Das war ein Unterschied zu viel.**
Beide Male wartet man auf dieselbe Sache, und der Knopf sagt über seine Farbe schon,
worauf: Ring auf Grau heißt suchen, Ring auf Gold heißt laden. Der Balken ist fort.

Denselben Ring bekommt der Knopf «Jetzt laden» in der Hinweiszeile. Beide Knöpfe rufen
`swUebernehmen()`, also warten sie auch gleich. Seine Breite wird vor dem Tausch
festgehalten — ein Knopf, der beim Tippen schmaler wird, sähe aus wie ein Fehler.

## 5 · Die Einstellungen neu geordnet

Reihenfolge jetzt: **App · Darstellung · Lernweg · Antworten · Tastatur**.

«Abgabe» und «Eingabe» sind fort. Zwei Wörter, die sich reimen, nebeneinander auf einer
Reiterleiste — man musste jedes Mal hineinsehen, um zu wissen, welches welches ist. Jetzt
steht dran, was drin ist: **Antworten** (Bestätigen, vollständige Lösung, Nachschrift) und
**Tastatur** (klappt die kyrillische von selbst auf?). Die Kennungen heißen mit — ein
interner Name, der lügt, ist eine Falle für den Nächsten.

Geöffnet wird weiterhin bei **Lernweg**. «App» steht vorn, weil man dort zuerst
nachsieht, wenn etwas mit der App selbst ist — aber einzustellen gibt es dort nichts, und
darauf zu landen wäre eine leere Seite als Empfang.

## 6 · Die hellen Schemata werden Farben

**Ausgangslage:** Die vier hellen Paletten lagen bei 87,5 Prozent Helligkeit — Pastell,
das neben der Kachel (95,2) kaum auffiel. Auf dem Gerät wirkte das ausgewaschen.

**Entscheidung** (nach Vorlagen und ausdrücklicher Wahl): Der Grund sinkt auf **77
Prozent** und wird deutlich satter, die Kachel steigt auf **96,5** und wird fast weiß.
Der Abstand zwischen beiden wächst damit von acht auf über achtzehn Punkte — die Kachel
ist eine eigene Fläche auf einer Farbe, kein heller Hauch auf einem hellen Grund.

| | Grund alt | Grund neu |
| --- | --- | --- |
| Classic | `#E7E2D7` | `#DDCFAC` |
| Grün | `#D5E9DF` | `#A6E3C6` |
| Blau | `#D3E0EB` | `#A7C9E2` |
| Rosa | `#EBD3D9` | `#E2A7D0` |

**Dark bleibt unberührt.** Die gemeinsame Helligkeitsstaffel bleibt: alle vier Schemata
nach derselben Leiter, nur Farbton und Sättigung wandern (`tools/palette.py`). Rosa
wandert dabei von 344° auf 318° — aus dem Altrosa wird das Magenta-Rosa der Vorlage.

### Was die Schrift dazu tun musste

Dieselbe Rechnung wie bei ADR 0042, nur eine Stufe weiter: Sinken die Flächen, muss die
Schrift mit. Gemessen gegen **jede** der vier Paletten, nicht gegen die freundlichste —
Rosa ist in der Leuchtdichte die dunkelste und gibt darum den Ausschlag.

| | alt | neu | schlechtester Kontrast |
| --- | --- | --- | --- |
| `--dim` | `#4C525C` | `#434851` | 4,67 (war 4,00) |
| `--gold` | `#87621D` | `#765619` | 3,43 (war 2,81) |
| `--ice` | `#2F5FA8` | `#2D5AA0` | 3,46 (war 3,21) |
| `--good` | `#2B7654` | `#266749` | 3,42 (war 2,79) |
| `--bad` | `#B4443C` | `#9D3B34` | 3,43 (war 2,78) |

Der Maßstab ist unverändert der der App: «dim» hält überall AA (4,5), die Signalfarben
die Grenze für große Schrift (3,0) mit Luft.

### Zwei Prüfungen mussten nachgeben — und warum das keine Nachlässigkeit ist

**`C3` verlangte einen mittleren Kanalwert über 200** für die hellen Gründe. Das war die
Beschreibung der alten, fast weißen Paletten, nicht ein Maßstab für Lesbarkeit. Die
Grenze steht jetzt bei 150; die Frage, die sie beantwortet, ist der Unterschied zu «dark»
(unter 60).

**`F1` verlangte, dass kein Schema mehr als zehn Prozent Kontrast gegenüber «classic»
verliert** — über alle Paare, auch Schrift auf dem Grund. Das ist auf einer satten Fläche
nicht mehr erfüllbar, und zwar aus einem physikalischen Grund: Zwei Farben gleicher
HSL-Helligkeit haben nicht dieselbe Leuchtdichte, ein Gelb ist heller als ein Blau. Der
Abstand ist die Folge davon, dass es Farben sind.

Die Prüfung ist darum **geteilt**, nicht aufgeweicht: Auf der **Kachel** — die in jedem
Schema fast weiß ist und den Lehrstoff trägt — gilt die zehn-Prozent-Regel unverändert,
und dort gehört sie hin («richtig» darf auf Rosa nicht anders aussehen als auf Grün). Auf
dem **Grund** darf der Abstand bis dreißig Prozent gehen; was dort schützt, sind die
absoluten Grenzen `F1b`, `F1c`, `F2` und `F3`, und die sind unverändert.

Eine dritte Prüfung (`E2` in `extras`) verglich den Grund gegen eine **abgeschriebene
Zahl**. Sie fragt jetzt die Liste `SCHEMATA` — die Paletten werden gerechnet und dürfen
sich ändern; dass die Wahl greift, bleibt die Frage.

## Folgen

- `uhrStellen()` gibt es nicht mehr; acht Aufrufstellen heißen `aufgabeBeginnt()`.
- `EINST_REITER` hat neue Reihenfolge und zwei neue Kennungen (`antworten`, `tastatur`).
  Vier Suiten mussten mit — `reiter` rechnet ihre Sollwerte jetzt aus der **Stelle** in
  der Liste statt aus festen Zahlen, damit die nächste Umsortierung sie nicht wieder
  bricht.
- Neu: `netzAufklappen()`, `NETZ_FRIST`, `netzZuletzt`, `netzWarDaheim`, `netzUhr`.
- `.sw-balken` und `@keyframes swWandert` sind fort.
- Neue Prüfungen: `kommentare` M1–M7, `robust` B13a–B13g, `offline` E6b, S20.
