# 0056 · Drei Strengen — und drei Schalter dafür

**Stand:** angenommen · 2026-08-14 · Etappe 5 der Umstellung

## Ausgangslage

Der Didaktikplan nennt drei Dinge, die eine Übung von einem Kartenstapel
unterscheiden, und Chillingo hatte keines davon:

1. **„Nur Ansehen genügt nicht."** Wer sich verschrieb, sah die Lösung und ging weiter.
   Gelesen ist aber nicht geschrieben — die Hand lernt beim Schreiben.
2. **Kein Tagesmaß.** Wer an einem guten Abend vierzig neue Wörter anfing, bekam sie drei
   Wochen später alle am selben Tag zurück. Die Lawine steht dann nicht im Kalender, sie
   steht im Lernstand, und sie kommt bestimmt.
3. **Ablenker aus dem Zufall.** `wortFehler` und `leseFehler` merkten sich, *dass* etwas
   falsch war. **Womit** verwechselt wurde, ging verloren — und genau das ist die
   Auskunft, aus der eine Übung besser wird.

## Entscheidung

Alle drei kommen — und **alle drei sind Einstellungen.** Eine Strenge ohne Ausschalter
wäre eine Zumutung; das gilt besonders für die erste, die sich unmittelbar wie Gängelung
anfühlen kann.

### a) Die Rekonstruktion

Nach einem **Schreibfehler** steht unter der Auflösung die richtige Schreibweise und ein
leeres Feld. Erst wenn das Wort einmal richtig nachgeschrieben ist, öffnet der
«Weiter»-Knopf. Ein Zustand (`reko`), ein Baustein (`rekoHtml()`), ein Binder
(`rekoBinden()`) — geteilt von allen fünf Schreibaufgaben.

Einstellung `rekonstruktion`: **`woerter`** (Vorgabe) · `immer` · `nie`.

### b) Das Tagesmaß

Einstellung `tagesmass`, Vorgabe **8**, Bereich 0–30, wobei **0 «ohne Grenze» heißt**.
Gezählt wird in `state.neuHeute = { tag, n }`, hochgezählt in `updateBox()` genau dann,
wenn ein Wort noch keinen Zeitstempel hatte. Gebremst wird an **einer** Stelle:
`waehleWort()` bekommt seinen Vorrat durch `uebVorrat()`.

### c) Das Fehlerprofil

`state.verwechselt = { wortId: { andereId: wie oft } }`, notiert in `uebPruefen()` bei
Wortkacheln. In `buildQuestion()` kommen daraus **höchstens zwei** der drei Ablenker.
Einstellung `fehlerprofil`, Vorgabe an.

## Begründung

**Die Nachschrift bewertet nichts.** Das ist die tragende Regel dabei. Die Antwort ist
längst gezählt, die Stufe längst gefallen, die Serie längst gerissen — die Nachschrift
hält nur den Knopf zu. Wäre sie eine zweite Bewertung, könnte man sich aus einem Fehler
heraustippen, und der Leitner-Stand wäre eine Höflichkeitsfloskel.

**Warum Sätze in der Vorgabe draußen bleiben.** Ein sechswortiger russischer Satz auf
einer Bildschirmtastatur nachzuschreiben ist keine Übung mehr, sondern eine Strafe — und
Strafen bringen niemanden zum Weiterlernen. Wer sie will, stellt «Auch Sätze» ein. Der
Plan hatte für den Fall, dass die Strenge nervt, einen Rückzug auf „nur bei Wörtern, die
schon zurückgefallen sind" vorgesehen; die Dreistellung nimmt diese Runde vorweg und legt
den Regler gleich in die Hand des Nutzers.

**Nur Kyrillisch.** Einen deutschen Satz nachzuschreiben lehrt kein Russisch. Und nur wer
etwas geschrieben hat — wer «Aufdecken» drückt, hat nichts behauptet und schreibt darum
auch nichts nach (dieselbe Linie wie ADR 0033).

**Das Tagesmaß bremst nur Neues.** Wiederholungen, die «Alle»-Stapel und alles, womit
schon einmal gearbeitet wurde, bleiben unbegrenzt. Eine Grenze darauf wäre eine Grenze
aufs Üben und widerspräche ADR 0048 («Üben können hängt nie an einem Datum»). Der Zähler
begrenzt, was **anfängt**, nicht, was man tut.

**Der Tag kommt aus dem Kalender des Geräts**, nicht aus einer Millisekundenrechnung: Wer
um 23:50 anfängt, hat um 00:10 einen neuen Tag, und das ist richtig so. `heuteNr()` liefert
`JJJJMMTT` als Zahl.

**Null heißt «ohne Grenze», und der Zähler sagt das auch.** «0 neu/Tag» hieße wörtlich
gelesen «gar nichts Neues» — das Gegenteil des Gemeinten. Darum tauschen bei Null beide
Hälften des Zählers ihren Text: ein Gedankenstrich, darunter «ohne Grenze».

**Der Leerzustand braucht einen Ausgang.** Bremst das Maß einen ganzen Vorrat aus, steht
das da — mit zwei Knöpfen: «Wiederholen» (das bleibt immer erlaubt) und «Maß ändern». Und
`uebungsStand('lernsets')` meldet dann `leer`, damit die Empfehlung nicht dorthin schickt
(ADR: «Eine Übung ohne Arbeit wird nie empfohlen»).

**Höchstens zwei Ablenker aus dem Profil.** Drei bekannte machten aus der Frage eine
Wiedervorlage — man erkennt die Runde wieder, statt das Wort zu prüfen. Zwei sind der
Punkt, an dem die eigene Verwechslung wehtut und die Frage trotzdem eine Frage bleibt.

**Nichts davon steht im Sicherungscode.** `verwechselt` und `neuHeute` sind Beobachtungen
über dieses Gerät, kein Lernstand — dieselbe Linie wie `tempo` und `gesichertAm`
(ADR 0052) und wie `wortFehler`/`patzer` (ADR 0033). Der Code soll schlank bleiben, und
ein Tageszähler, der aus einer drei Wochen alten Sicherung zurückkommt, wäre schlicht
falsch.

## Folgen

- Drei neue Einstellungen: `tagesmass` und `fehlerprofil` auf **Lernweg**,
  `rekonstruktion` auf **Abgabe**.
- **Der Zähler ist nicht mehr auf eine Frist verdrahtet.** Grenzen und Vorgabe stehen je
  Schlüssel in `ZAEHLER`, `zaehlerGrenzen(key, wert)` rechnet sie an; `auffrischGrenzen()`
  ist nur noch der Name für den einen Fall. `zaehlerAnzeige()` entscheidet, was dasteht,
  und `zaehlerFrischen()` schreibt jetzt auch die Einheit nach — sonst bliebe beim
  Zählen über Null hinweg der alte Text stehen.
- Neuer Zustand `state.verwechselt` und `state.neuHeute`, gefiltert über
  `nurVerwechslungen()`; `reko` gehört als Ansichtszustand in `ansichtenZuruecksetzen()`
  (ADR 0017).
- **«Tippen» und «Übersetzen» blenden ihre Tastatur in der Auflösung aus.** Beide zeigten
  sie dort schon vorher ohne Feld — eine Attrappe. Seit die Nachschrift eine eigene
  mitbringt, stünden zwei übereinander.
- Neue Suite `strenge` (60 Prüfungen). Sie prüft von jeder Strenge **beides**: dass sie
  wirkt und dass der Schalter sie abstellt.
- Die Suite `marken` stellt die Nachschrift für ihren Abschnitt ab — sie prüft die
  Prüfzeile, nicht das Tor, und das Tor hat jetzt seine eigene Stelle.
