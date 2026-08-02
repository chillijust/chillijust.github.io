# 0012 · Die Chili steht im Fluss, Antworten bekommen einen Ton

**Status:** angenommen · 2026-08-02 · ersetzt Punkt 1 und 3 von ADR 0011

## Kontext

ADR 0011 legte die Figur auf eine feste Bühne über der Seite und rechnete ihre Position
je Bild neu. Auf dem Gerät zeigten sich drei Schwächen:

1. **Sie hinkt nach.** Safari auf iOS zeichnet den Inhalt beim Scrollen fort, bevor der
   Scroll-Behandler läuft. Steht die Figur in einer Karte, wandert die Karte also schon,
   die Figur eine Bildlänge später — sichtbar als Rutschen.
2. **Der Landeplatz kostete Bauhöhe.** Die Reiterleiste trug 24 px Innenabstand, damit
   die Figur beim Scrollen andocken konnte. Der Abstand zwischen Kopfzeile und Reitern
   fiel dadurch auf.
3. **Der Sprung war zu hastig**, die Blase kam fast gleichzeitig.

Dazu zwei Wünsche: eine hörbare Rückmeldung wie bei Duolingo und eine Gliederung der
Einstellungen, die einer Frage folgt statt einer Reihenfolge.

## Entscheidung

1. **Die Figur wird ein Kind ihres Platzhalters.** `#chiliBuehne` liegt mit
   `position: absolute; inset: 0` in einem `div.chili-platz[data-chili]` und wird beim
   Stationswechsel per `appendChild` umgehängt. Keine Scroll- oder Resize-Behandlung,
   keine Positionsrechnung, kein `positioniereChili()`.
2. **Kein Andocken mehr.** Der Streifen über den Reitern entfällt, die Kopfzeile bekommt
   ihren unteren Abstand zurück. Ist der Kopf weggescrollt, ist die Figur eben nicht zu
   sehen — sie kommt wieder, sobald man hochscrollt oder eine Ansicht sie ruft.
3. **Der Platz im Kopf hängt mittig**, nicht neben dem Reglerknopf: `position: absolute;
   left: 50%; transform: translateX(-50%)` an der Kopfzeile.
4. **Der Sprung dauert 0,78 s**, die Sprechblase startet nach 1 s und wächst über 0,6 s
   herein: Sprung, kurze Pause, dann spricht die Chili.
5. **`ton(richtig)`** spielt nach jeder bewerteten Antwort einen kurzen, im Browser
   erzeugten Klang. Neue Einstellung `ton`, Vorgabe an.
6. **Die Einstellungen sind nach Fragen gegliedert:** Lernweg (*was wann?*), Abgabe
   (*wie gebe ich ab?*), Eingabe (*womit tippe ich?*), Darstellung und Ton (*wie wirkt
   die App?*).
7. **Tippen zählt ab Stufe 3.** Der Schlüssel heißt jetzt `tippenStufe` statt
   `tippenAbStufe` — dadurch fällt der alte, auf 4 gespeicherte Wert weg und alle
   bekommen die neue Vorgabe.

## Begründung

**Im Fluss schlägt Rechnung.** Ein Kind scrollt mit seinem Elternteil — nicht ungefähr,
sondern exakt, weil der Browser beides im selben Bild zeichnet. Jede Nachrechnerei kann
das nur annähern und nie einholen. Der Preis ist das Andocken; das war ohnehin der
Teil, der Bauhöhe kostete und den Abstand zwischen Kopf und Reitern erzwang.

**Töne aus dem Browser statt aus Dateien.** Zwei Klänge als Audio-Dateien wären Base64 in
der ausgelieferten Datei — mehrere Zehn Kilobyte für eine Zehntelsekunde Klang. Die Web
Audio API erzeugt beide aus zwei Oszillatoren und einer Hüllkurve, in rund vierzig
Zeilen. Der Klang ist absichtlich knapp: aufsteigende Terz für richtig, fallender tiefer
Ton für falsch — dieselbe Grammatik, die man von Lern-Apps kennt.

**Stufe 3 statt 4 fürs Tippen.** Bei Schwelle 4 war ein Wort schon gemeistert, bevor man
es je selbst geschrieben hatte — Tippen konnte nichts mehr beitragen. Ab Stufe 3
schließt das Tippen die letzte Lücke: richtig geschrieben macht es Stufe 4 voll.

## Folgen

- `positioniereChili()`, `chiliNachziehen()`, `#chiliWagen`, `CHILI_BASIS`, `CHILI_DOCK`
  und die Scroll-/Resize-Horcher entfallen ersatzlos.
- Steht die Figur in einer Karte, scrollt sie mit der Karte aus dem Bild — wie jeder
  andere Inhalt auch.
- Der Ton bleibt Beiwerk: `tonBereit()` liefert `null`, wenn die Einstellung aus ist,
  kein `AudioContext` existiert oder etwas wirft. Der Stummschalter des iPhones hat
  ohnehin Vorrang.
- Wer `tippenAbStufe` von Hand auf 4 gestellt hatte, findet nach dem Wechsel Stufe 3
  vor; die Einstellung lässt sich in derselben Zeile zurückstellen.
