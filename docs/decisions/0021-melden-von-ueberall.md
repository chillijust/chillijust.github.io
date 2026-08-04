# 0021 · Melden von überall, aus einem Blatt heraus

**Status:** angenommen · 2026-08-03

## Kontext

Ein Ticket zu schreiben hieß bisher: Menü öffnen, «Tickets» wählen, «Fehler melden»
tippen, Formular ausfüllen. Vier Schritte, und nach dem ersten sieht man nicht mehr, was
einem eigentlich aufgefallen war — die Ticket-Ansicht ersetzt den Bildschirm, über den man
sich gerade wundert.

Aus demselben Grund war der Ansichtsbezug unzuverlässig: Er kam aus `letzterTab`, also aus
der Ansicht *vor* dem Menü, und ließ sich nicht korrigieren.

Dazu ein Fehler aus dem Gerätetest: Beim Neuladen sprang die Chili sichtbar von der
Kopfzeile auf ihren Platz in der Empfehlung.

## Entscheidung

1. **Ein schwebender Knopf unten rechts**, über jeder Ansicht.
2. Dahinter ein **Blatt von unten**, das nur den unteren Teil einnimmt — die Ansicht
   darunter bleibt sichtbar.
3. **Ein Haken für den Ansichtsbezug**, vorbelegt mit der Ansicht darunter, abwählbar.
4. **Das Blatt lässt sich schieben und federt zurück**; es schließt dabei nie.
5. Das Formular in der Ticket-Ansicht **entfällt** — sie zeigt nur noch Liste und
   Kopierknöpfe.
6. Beim Start wird **erst gezeichnet, dann die Chili platziert**.

## Begründung

**Der Weg zum Ticket muss kürzer sein als der Ärger.** Was vier Schritte kostet, schreibt
man nicht auf — man merkt es sich vor und vergisst es. Ein Knopf, der immer da ist, senkt
die Schwelle auf einen Tipp.

**Das Blatt lässt die Ansicht stehen.** Genau deshalb ist es ein Blatt und keine Seite:
Man kann beim Schreiben noch einmal hinsehen. Der Fußabstand des Körpers wurde dafür auf
96 px erhöht, damit der Knopf nie über einer Knopfzeile schwebt.

**Der Bezug gehört an die Stelle, an der man ihn kennt.** Vorbelegt mit der Ansicht
darunter, weil das in neun von zehn Fällen stimmt; abwählbar, weil der zehnte Fall ein
allgemeiner Wunsch ist. Ohne Haken bleibt das Feld leer statt «Übersicht» zu behaupten.

**Das Ziehen ist Haptik, keine Geste.** Ein Blatt, das dem Finger folgt, fühlt sich an wie
ein Gegenstand; eines, das starr klebt, wie ein Dialog. Es schließt aber ausdrücklich
nicht dabei — ein halb geschriebenes Ticket durch eine unbedachte Bewegung zu verlieren
wäre der schlechtere Tausch. Die Dämpfung (`|d|^0,72`) macht weite Wege zäh, sodass man
den Widerstand spürt, statt das Blatt quer über den Schirm zu ziehen.

**Ein Formular statt zweier.** Das alte in der Ticket-Ansicht hätte dieselbe Logik
doppelt gepflegt — und wäre der schlechtere Ort geblieben.

## Folgen

- `tkForm` und die Chips «Fehler melden»/«Wunsch melden» in der Ticket-Ansicht entfallen.
- `ticketAnlegen(art, titel, text, reiter)` nimmt `null` als Bezug entgegen; `reiter`
  bleibt dann leer, und `ticketAbschnitt()` lässt die Zeile weg.
- Der Knopf ist auch in der Ticket-Ansicht selbst erreichbar; der Bezug ist dort die
  Ansicht davor.
- `touch-action: none` auf dem Blatt, damit das Ziehen nicht mit dem Scrollen kollidiert.
- Auf Eingabefeldern und Knöpfen greift das Ziehen nicht — sonst käme man nicht ins
  Textfeld.
