# 0092 · Gemeistert wird in «Lernsets», und die Abgabe steht unter der Tastatur

**Stand:** angenommen · 2026-08-21 · aus zwei Tickets
**Ändert:** ADR 0086 (wo der letzte Schritt fällt) · ADR 0088 (was «Tippen» leistet)

## 1 · Ein festes «false» hebelte drei Fassungen lang den Lernweg aus

**Befund:** «Wörter können nur durch Tippen gemeistert werden. Wörter sollen
nur durch Lernsets gemeistert werden.»

Der Befund stimmte wörtlich — und war ein **Fehler**, kein Designwunsch.
ADR 0088 hatte ausdrücklich entschieden: *«Geschrieben wird in Lernsets»*, und
`buildQuestion()` liefert dort seither `mode: 'tippen'`. Nur reichte
`uebPruefen()` das nie weiter:

```js
updateBox(q.word.id, uebCorrect, false);   // ← immer false
```

Gemessen vor dem Eingriff, ein Wort auf der vorletzten Stufe:

```
In «Lernsets»:  Stufe bleibt 3 von 4 · tippFolge bleibt 0
In «Tippen»:    Stufe 4 von 4
```

Die Null in `tippFolge` ist der Beweis: Die getippte Antwort lief in den
`!getippt`-Zweig, die Folge wurde nie hochgezählt, der Deckel griff jedes Mal.
**Kein Wort konnte in «Lernsets» je die Endstufe erreichen** — der Weg dorthin
führte zwingend über eine Übung, die als freiwillig gedacht war.

## 2 · «Tippen» meistert gar nicht mehr

**Entscheidung** (auf Nachfrage): Nicht nur die Reparatur, sondern die Umkehr.

| | vorher | jetzt |
| --- | --- | --- |
| «Lernsets», Tippaufgabe | deckelt | **meistert** |
| «Tippen» | meistert | deckelt |

*«Tippen» ist eine freiwillige Zugabe für den, der gerade lieber schreibt.* Der
Lernweg läuft über «Lernsets», und dort kommt ohnehin jedes Wort vorbei.
Unterhalb der Endstufe zählt eine Antwort in «Tippen» ganz normal; nur der
letzte Schritt gehört der Übung, die den Lehrplan trägt.

Der Preis ist benannt: Wer eine halbe Stunde tippt, sieht davon im Fortschritt
nichts mehr. Das war die ausdrückliche Wahl — die klarere Trennung wog schwerer
als die verlorene Abkürzung.

## 3 · Warum der Prüfstand schwieg

`lernweg` K1–K4 prüft den Deckel gründlich — und ruft dafür `updateBox()`
**unmittelbar**, mit dem dritten Argument aus eigener Hand. Ob die Übungen es
richtig setzen, stand nirgends.

*Eine Prüfung, die die Funktion aufruft, prüft nicht den Aufrufer.*

K5 und K6 gehen jetzt den Weg über `uebPruefen()` beziehungsweise den echten
Prüfen-Knopf. Beide wurden gegengeprobt: Mit dem alten `false` fällt K5
(«Stufe 3 nach 5 getippten»), mit einem `true` in «Tippen» fällt K6 («Stufe 4
nach 3 Treffern»).

**K5 stellt die Aufgabe, statt sie zu erwürfeln.** Über `waehleWort()` käme das
Zielwort kaum wieder: Der erste Treffer erneuert seinen Zeitstempel und schiebt
es ans Ende der Reihe. Gegenstand ist, was `uebPruefen()` aus einer Tippaufgabe
macht — nicht, ob die Auswahl gerade dieses Wort zieht.

## 4 · Die Abgabe steht unter der Tastatur

**Befund:** «In Lernsets ist der Prüfen-Knopf unterhalb der Tastatur, bei
Tippen oberhalb. Machen wir es einheitlich — unter die Tastatur.»

Gemessen: **fünf von sechs** Übungen hatten ihn oben. «Lernsets» war die
einzige Ausnahme — und die richtige. Betroffen waren «Tippen», «Übersetzen»,
«Grammatik», «Schreibung» und das Power-Training; gemeldet war eine.

Der Grund, den Knopf unten zu wollen, steht seit ADR 0090 in `CLAUDE.md`: *Eine
Übung, die scrollt, verliert ihre Knöpfe aus dem Daumenbereich.* Eine
aufgeklappte Tastatur ist der größte Schub nach unten, den es gibt.

### Was der DOM-Test nicht sah

Mein erster Umbau setzte den Tastaturblock **vor** den Kachelschluß. Die Lage
stimmte danach — der Knopf stand unter der Tastatur, die Prüfung war grün —,
aber die Tastatur steckte **in der Kachel**, wurde dadurch schmaler, und die
oberste Reihe brach um: «ъ» stand allein auf einer Zeile.

Gefunden hat das erst das Bildschirmfoto. Die Suite prüft es seither mit
(`tastatur` D3, über `closest('.card')`), und die Gegenprobe zeigt genau die
Lücke: In der kaputten Fassung meldete D2 brav `tippen:43` — Knopf unter der
Tastatur, alles in Ordnung — während D3 rot wurde.

*Eine Messung beantwortet die Frage, die sie stellt, und keine andere.*

## 5 · Vorbereitung: «Tippen» soll in «Übersetzen» aufgehen

**Wunsch des Nutzers**, ausdrücklich nur als Notiz, ohne Code: «Tippen soll
später wegfallen und Teil von Übersetzen werden.»

Was dafür zu klären ist, in der Reihenfolge, in der es aufeinander aufbaut:

1. **Der Gegenstand ist verschieden.** «Übersetzen» arbeitet mit **Sätzen**
   (`state.satzBox`, Kennung ist der russische Satz), «Tippen» mit **Wörtern**
   (`state.boxes`). Eine Zusammenlegung braucht eine Übung, die beides führt —
   oder die Entscheidung, daß das Wortschreiben dort nur noch *Übung* ist und
   gar nichts mehr zählt. Nach Abschnitt 2 wäre das folgerichtig: «Tippen»
   zählt heute schon nicht mehr zum Meistern.
2. **Zwei Filterachsen treffen auf drei.** «Tippen» hat Stapel und Vorrat
   (`tippenModus`, `tippenSet`), «Übersetzen» Stufe, Richtung und Stapel. Fünf
   Achsen in einem Blatt sind zu viel; eine muß fallen.
3. **Die Leerzustände sind nicht dieselben.** «Noch kein Wort freigeschaltet»,
   «Set N ist noch unberührt» und «Noch kein Satz auf Stufe N» sagen
   Verschiedenes und fühlen sich verschieden an (ADR 0015).
4. **Der Lernbedarf zählt getrennt.** `quoteZaehlen('tippen', …)` und
   `quoteZaehlen('uebersetzen', …)` sind zwei Kategorien in der Bilanz und im
   Sicherungscode. Beim Zusammenlegen fällt eine weg — ein alter Code trägt sie
   weiterhin, und `uebungVon()` muß sie überlesen, nicht raten.
5. **Die Tutorial-Spur `tippen`** in `data/tutorial.json` (5 Schritte) zeigt auf
   Ziele, die es dann nicht mehr gibt. Die Suite `tutorial` findet das.

**Der naheliegende Schnitt:** «Übersetzen» bekommt eine dritte Aufgabenform
neben *legen* und *tippen* — das **einzelne Wort**, gezogen aus den Wörtern der
freigeschalteten Sätze. Damit bliebe der Gegenstand einer (der Satz und seine
Wörter), und die Wortstufen liefen weiter über `state.boxes`, ohne daß eine
zweite Zahlenwelt entsteht.

Nicht entschieden. Wenn es soweit ist, gehört es in einen eigenen ADR.
