# 0020 · Auswahl hinter einem Knopf statt in jeder Übung

**Status:** angenommen · 2026-08-02

## Kontext

Jede Übung trug ihre eigene Auswahlzeile über dem Inhalt:

- **Lernsets** ein `<select>` mit vierzehn Einträgen
- **Freestyle** ein `<select>` mit fünfundzwanzig Themen
- **Tippen** zwei Chips für den Stapel
- **Übersetzen** drei Stufen-Chips, einen Richtungs-Chip und zwei Stapel-Chips — zwei
  volle Zeilen, bevor die eigentliche Aufgabe kam

Das kostete auf jedem Bildschirm Platz, und die Klappmenüs öffnen auf iOS ein
systemeigenes Rad, das mit dem Rest der Oberfläche nichts zu tun hat.

Dazu ein Fehler: `currentTab` stand noch auf `'lernsets'` statt `'home'`, die App startete
also nicht auf dem Startbildschirm.

## Entscheidung

1. **Ein runder Knopf mit Trichter** neben dem Menü, sichtbar nur in den vier Übungen.
2. Dahinter **dasselbe Aufklapp-Panel wie beim Menü**, nur breiter und scrollbar, mit den
   Auswahlmöglichkeiten in benannten Gruppen.
3. **Der Knopf färbt sich golden**, sobald etwas vom Regelfall abweicht — im selben Stil
   wie ein gesetzter Chip.
4. Die Übungen nennen in einem `.task-label` nur noch, **was gerade gilt**.
5. **Keine `<select>` mehr** in der Datei.
6. `currentTab` startet auf `'home'`.

## Begründung

**Auswahl ist selten, Inhalt ist immer.** Die Stufenleiste in «Übersetzen» stand bei
jedem Satz über der Aufgabe, obwohl man sie vielleicht einmal pro Sitzung anfasst. Ein
Knopf kostet 44 × 44 px im Kopf, der ohnehin da ist; die Zeilen darunter waren jedes Mal
neu zu überlesen.

**Ein Muster statt zweier.** Das Menü hat sein Aufklapp-Panel bereits; dieselbe Mechanik
noch einmal zu verwenden kostet nichts und macht die Bedienung vorhersagbar. Beide
Panels schließen einander gegenseitig, damit nie zwei Ebenen übereinanderliegen.

**Die Farbe ersetzt das Lesen.** Wer die Auswahl geändert hat, sieht das am Knopf, ohne
ihn zu öffnen. Das war der eigentliche Zweck der alten Chip-Reihen — nur brauchten die
dafür eine ganze Zeile.

**Klappmenüs passen nicht.** Auf iOS öffnet `<select>` ein systemeigenes Rad in
Systemfarben und Systemschrift. In einer Oberfläche, die sonst durchgehend eigene Chips
verwendet, ist das ein Bruch. Chips im Panel sind außerdem größer als Radzeilen und
zeigen ihren Bestand mit an («Stufe 1 · 20/20»).

## Folgen

- `stufenLeisteHtml()`, `bindeStufenLeiste()`, `trKacheln()`, `tippenKacheln()` und
  `bindeTippenKacheln()` entfallen; ihre Aufgaben übernimmt `filterInhaltHtml()`.
- Die Zähler der Stapel stehen jetzt im Panel statt dauerhaft in der Ansicht; die
  Fußzeile jeder Übung nennt die wichtigste Zahl weiterhin.
- Die Umschaltknöpfe in den Leerzuständen («Wiederholen», «n Wörter offen») bleiben — dort
  ist der Wechsel die naheliegende nächste Handlung.
- `tools/pruefen.mjs` bräuchte keine neue Regel; die Testreihe prüft stattdessen, dass
  kein `<select>` mehr in der Datei steht.
