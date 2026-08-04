# 0023 · Buchstaben als freiwillige Übung

**Status:** angenommen · 2026-08-03 · Etappe 3 von drei — damit ist der Plan abgearbeitet

## Kontext

Der Lehrplan setzt voraus, dass man Kyrillisch lesen kann. Wer das nicht kann, steht in
«Lernsets» vor einem Wort wie **что** und rät. Umgekehrt wäre es falsch, das Alphabet zur
Pflicht zu machen: Wer es beherrscht, würde durch 33 Kacheln geschickt, bevor er ein Wort
lernen darf.

Sechs Buchstaben sind dabei tückischer als die übrigen 27, weil sie wie lateinische
aussehen und anders klingen: **В**=w, **Н**=n, **Р**=r, **С**=s, **У**=u, **Х**=ch.

## Entscheidung

1. **Fünfte Übung «Buchstaben»**, ausdrücklich **freiwillig**: blockiert nichts, schaltet
   nichts frei, zählt weder in die Serie noch in «beantwortet».
2. **Eigener Lernstand** (`state.abcBox`, `state.abcSeen`) mit derselben Leiter und
   denselben Fristen wie Wörter und Sätze.
3. **Zwei Teile:** eine Tafel zum Nachschlagen und ein Quiz in beide Richtungen.
4. **Die sechs falschen Freunde** stehen als `ABC_TUECKISCH` im Skript, sind in der Tafel
   hervorgehoben und treten im Quiz bevorzugt gegeneinander an.
5. `data/buchstaben.json` mit `[Groß, Klein, Laut, Merkhilfe]`, geprüft von
   `tools/build.mjs`.
6. Der Sicherungscode nimmt sie als **achtes Feld** mit; ältere Codes bleiben lesbar.

## Begründung

**Freiwillig muss man auch merken.** Es genügt nicht, die Übung nicht zu erzwingen — sie
darf auch keine Nebenwirkungen haben. Zählte sie in die Serie, wäre sie der billigste Weg
zu einer langen Reihe; zählte sie in «beantwortet», verfälschte sie die Bilanz. Deshalb
der eigene Topf und die Auslassung in allen Kacheln. Sichtbar wird sie nur als eine Zeile
im Lernweg — dort, wo sie hingehört.

**Die Merkhilfe gehört zur Antwort, nicht in ein Handbuch.** Nach jeder Frage erscheint
sie unter der Auflösung. «Sieht aus wie eine 3» merkt man sich in dem Moment, in dem man
З falsch geraten hat — nicht beim Vorablesen.

**Ablenker aus derselben Falle.** Wird nach С gefragt und die Auswahl lautet *s, m, l, o*,
lernt man nichts: Man erkennt die richtige Antwort daran, dass sie plausibel klingt. Steht
dagegen *s, w, n, r* zur Wahl, muss man den Buchstaben wirklich kennen. Die falschen
Freunde treten darum gegeneinander an.

**Die Liste der Tücken steht im Code, nicht in den Daten.** Dass В wie ein B aussieht, ist
eine Eigenschaft des lateinischen Alphabets — für einen griechischen oder arabischen Leser
wäre die Liste eine andere. In `/data` gehört, was über das Russische stimmt.

**Alphabet und Tastatur müssen dieselben Zeichen führen.** Der Build prüft das jetzt in
beide Richtungen. Ohne die Prüfung könnte man in «Tippen» ein Zeichen eingeben, das die
Buchstabenübung nicht kennt — oder umgekehrt.

## Folgen

- Der Sicherungscode hat acht Felder statt sieben. `decodeBackup()` liest die Prüfsumme
  darum aus dem **letzten** Feld, nicht aus dem siebten, und behandelt das achte als
  optional. Codes im alten Format laden weiterhin, nur eben ohne Buchstabenstand.
- `abcAnsicht`, `abcRichtung`, `abcOffen` und die Frage gehören nach der Regel aus
  ADR 0017 in `ansichtenZuruecksetzen()`.
- Home hat fünf Kacheln; Testreihen, die vier erwarteten, wurden nachgezogen.
- Die Vierfachwahl der Buchstaben steht in zwei Spalten: Laute wie «w» füllen keine ganze
  Zeile, und ein Raster hält die Trefferflächen trotzdem groß.
