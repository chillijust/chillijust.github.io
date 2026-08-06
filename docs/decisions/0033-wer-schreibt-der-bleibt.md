# 0033 · «Falsch» ist eine dürftige Auskunft

**Status:** angenommen · 2026-08-06 · vier Tickets vom Gerät

## Kontext

Bis hierher kannte «Übersetzen» genau zwei Antworten: richtig oder falsch. Wer einen
Buchstaben vertippt hat, bekam dieselbe Auskunft wie jemand, der das Wort nicht kennt.
Der Leitner-Stand des Satzes fiel um eine Stufe, die Wörter blieben unberührt — auch
wenn dasselbe Wort zum fünften Mal falsch geschrieben wurde.

Dazu drei kleinere Wünsche: die Empfehlung auf Home führte immer in die Lernsets, im
Vollbild fehlt die Zurück-Geste, und die Ticket-Kopie trug ein paar schiefe Etiketten.

## Entscheidung

1. **Die Prüfung wertet Wort für Wort aus**, mit Buchstabenabstand.
2. **Dreimal hintereinander dasselbe Wort verschrieben** stuft es unter die Satzschwelle
   zurück — der Satz ist damit wieder zu.
3. **Aufgeben straft nicht.** «Aufdecken» löst keine Wertung aus.
4. **Nur die russische Seite, nur Geschriebenes** wird gewertet.
5. **Die Empfehlung führt dorthin zurück, wo zuletzt geantwortet wurde** — zwei Stunden lang.
6. **Vom linken Rand wischen heißt zurück.**
7. **Die Ticket-Kopie sagt «Ort» statt «Übung»**, nennt Ortszeit und trägt den App-Stand
   in der Fußzeile, solange er für alle gleich ist.

## Begründung

**Ein Buchstabe ist etwas anderes als ein unbekanntes Wort.** Beides «falsch» zu nennen
ist zwar nicht gelogen, aber es verschenkt die einzige Auskunft, die weiterhilft. Ein
Levenshtein-Abstand je Wort kostet zwanzig Zeilen und beantwortet zwei Fragen auf einmal:
*welches* Wort saß nicht, und *wie knapp* war es. Aus dem Ersten wird die Strafe, aus dem
Zweiten der Ton der Meldung.

**Die Zuordnung muss gierig sein, nicht stellungstreu.** Wer zwei Wörter vertauscht, hat
sie nicht falsch geschrieben — eine Prüfung Position für Position hielte beide für
unbekannt und stufte beide zurück. Darum sucht jedes Wort der Lösung sein nächstliegendes
freies Gegenstück, bei gleichem Abstand das mit der ähnlichsten Position. Bei Sätzen
dieser Länge ist das exakt genug und in einem Satz erklärt.

**Drei, nicht zwei.** Der Wunsch nannte «2 oder 3». Zwei wäre streng: Ein Vertipper am
Handy passiert, und zweimal derselbe Vertipper passiert auch. Beim dritten Mal ist es
keiner mehr. Dazu warnt die App beim zweiten Mal ausdrücklich vor — eine Strafe, die man
kommen sieht, ist keine Strafe, sondern eine Ansage.

**Zurück auf Stufe 1, nicht auf null.** «Zurücksetzen» hieße wörtlich: alles verloren.
Das wäre unverhältnismäßig — das Wort war ja einmal gelernt. `SATZ_STUFE - 1` ist das
Mindeste, das den beschriebenen Effekt hat: Das Wort kommt in «Lernsets» zurück, und der
Satz schließt sich, weil ihm eine Voraussetzung fehlt. Wer schon darunter steht, fällt
nicht weiter — für dieselbe Lücke zweimal zu strafen wäre nur Buchhaltung.

**Aufgeben ist kein Verschreiben.** «Aufdecken» ruft dieselbe Auswertung auf wie eine
Abgabe, mit leerem Feld. Ohne Ausnahme hätte dreimal Aufdecken den halben Satz zerlegt.
Wer zugibt, es nicht zu wissen, hat nichts falsch behauptet.

**Nur Russisch, nur Geschriebenes.** Aus Kacheln kann man sich nicht verschreiben — dort
prüft die Aufgabe die Wortstellung, nicht die Rechtschreibung. Und die deutsche Seite ist
hier nicht der Lehrstoff: Ein Tippfehler in «Buch» darf «книга» nicht zurückstufen.

**Der Ton macht die Sache erträglich.** «Uff» statt «Fehler», «wer schreibt, der bleibt»
statt einer Fehlerzahl. Die Meldung soll die Nachricht überbringen, ohne dass man sich
für sie schämt — dieselbe Haltung wie bei der Jubelkarte, nur in die andere Richtung.

**Zwei Stunden für das Fortsetzen.** Lang genug, dass ein Telefonat die Sitzung nicht
beendet; kurz genug, dass die Empfehlung am nächsten Morgen wieder aus dem Lernstand
kommt statt aus dem Gedächtnis. Sie stützt sich auf **abgegebene Antworten**, nicht auf
besuchte Ansichten — Herumblättern ist keine Arbeit.

**Die Wischgeste beginnt am äußersten Rand und wirkt erst am Ende.** Ein Tippen bewegt
nichts und löst darum nichts aus; senkrechte Wege gelten als Scrollen. Ist ein Blatt
offen, schweigt sie — Menü, Auswahl und Meldeblatt haben ihre eigene Art, sich zu
schließen, und zwei Bedeutungen für dieselbe Geste wären eine zu viel.

**«Übung: Übersicht» war schlicht falsch.** Die Übersicht ist keine Übung, und
Menüansichten sind es auch nicht. «Ort» stimmt für alle drei. Die Zeit stand in UTC,
obwohl sie von jemandem gelesen wird, der zu dieser Stunde vor dem Gerät saß. Und vier
Tickets mit demselben App-Stand nennen ihn viermal — einmal in der Fußzeile genügt,
solange er sich nicht ändert. Ändert er sich, gehört er an jedes Ticket zurück: Dann
sagt er, gegen welche Fassung sich die Meldung richtet.

## Folgen

- `state.wortFehler` zählt die Serie je Wort, `state.zuletzt` merkt die letzte Übung.
  Beide stehen **nicht** im Sicherungscode: Der soll schlank bleiben, und beides ist
  binnen einer Sitzung wieder aufgebaut.
- `editAbstand()`, `trWortDiff()`, `trVokabelZu()`, `patzerPruefen()`, `patzerSpruch()`,
  `patzerHtml()`; `patzerMeldung` ist Ansichtszustand nach ADR 0017.
- `zurueckGehen()` ist jetzt eine Funktion — Pfeil und Wischgeste teilen sie sich.
- Neue Testreihe `patzer.mjs` (54 Prüfungen); zusammen 860.
- Offen: Die Auswertung könnte im Feedback auch zeigen, *welche* Buchstaben daneben
  lagen. Erst einmal genügt die Zahl — eine bunte Zeichenmarkierung wäre schnell mehr
  Lärm als Hilfe.
