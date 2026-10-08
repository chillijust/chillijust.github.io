# 0070 · Gelegt ist auch geschrieben — für die Nachschrift

**Stand:** angenommen · 2026-08-15 · aus einem Ticket
**Ändert:** ADR 0056 (drei Strengen, drei Schalter) an genau einer Stelle

## Ausgangslage

> «Wenn der Nutzer Übungen falsch geschrieben hat, muss er sie erst richtig
> schreiben, bevor er weiter kann. So ein System haben wir schon irgendwo,
> dieses möchte ich auf die anderen Übungen übertragen.»

Das «irgendwo» ist die **Nachschrift** aus ADR 0056 (`reko`). Sie steht nicht an
einer Stelle, sondern an fünf — Übersetzen, Grammatik, Schreibung,
Power-Training und Tippen teilen sich `rekoVerlangen`, `rekoHtml`, `rekoFertig`
und `rekoBinden`. Der Bauplan war also längst überall. Die **Bedingung** war es
nicht:

```js
if (wahl === 'nie' || !getippt || richtig || !loesung) return;
```

`getippt` war die Frage, und sie hieß in jeder der fünf Übungen dasselbe: *Kam
die Antwort aus einem Textfeld?* Kam sie aus Kacheln, verlangte die App nichts.
Der Grundsatz dahinter — **gelegt ist nicht geschrieben** — steht in der
Arbeitsanweisung an drei Stellen und ist an zweien richtig.

## Was die Durchsicht ergeben hat

Der Auftrag lautete «auf die anderen Übungen übertragen». Was das an Stellen
heißt, war vorher nicht klar; die Durchsicht aller acht Übungen macht das Ziel
deutlich kleiner, als es klingt:

| Übung | Antwortformen ohne Textfeld | Nachschrift? |
| --- | --- | --- |
| Lernsets · Freestyle | Auswahl RU→DE, Auswahl DE→RU, **Kacheln**, Kontext-Lücke | **neu** |
| Power-Training | **Kacheln** (Stufe 1 jeder Runde) | **neu** |
| Grammatik | Auswahl unter Formen | nein |
| Schreibung | Auswahl unter zwei Schreibweisen | nein |
| Buchstaben | Auswahl, Kacheln für den **Laut** | nein |
| Übersetzen | Kacheln für **Wörter** eines Satzes | nein |

Nur zwei Übungen lassen ein **kyrillisches Wort legen**. In «Buchstaben» wird
zwar auch gelegt, aber die Kacheln tragen die deutsche Umschrift — «sch»
nachzuschreiben lehrt kein Russisch, und die Regel «nur bei Kyrillisch» hält sie
draußen. In «Übersetzen» werden ganze Wörter zu einem **Satz** gelegt; dort
greift die zweite bestehende Regel, dass ein Satz nur auf ausdrückliche Ansage
(«immer») nachgeschrieben wird — sechs Wörter auf einer Bildschirmtastatur sind
keine Übung mehr, sondern eine Strafe.

## Entscheidung

Die Bedingung fragt nicht mehr, ob **getippt** wurde, sondern ob eine
**Schreibweise behauptet** wurde. Getippt oder gelegt — beides ist eine
Behauptung. Die **Wahl unter fertigen Wörtern** ist keine.

Betroffen sind damit genau zwei Aufrufe:

| Stelle | vorher | jetzt |
| --- | --- | --- |
| `uebPruefen` (Lernsets · Freestyle) | *gab es nicht* | `q.mode === 'tiles'` |
| `ptPruefen` (Power-Training) | `q.stufe !== 'kacheln'` | `true` |

Alles Übrige bleibt: «nie» schaltet weiterhin ab, «immer» nimmt weiterhin die
Sätze dazu, die Nachschrift **bewertet weiterhin nichts** (sonst tippte man sich
aus dem Fehler heraus), und wer **aufdeckt**, schreibt nichts nach — er hat
nichts falsch geschrieben (ADR 0033).

## Begründung

Der alte Satz war eine Antwort auf eine andere Frage. «Gelegt ist nicht
geschrieben» entstand beim **Lob** und bei der **Prüfzeile**: Wer aus zwölf
vorgelegten Kacheln die richtigen sieben findet, hat nicht buchstabiert — ihn
für das ё zu loben oder ihm eine zeichenweise Fehlerspur zu zeigen, wäre
Schmeichelei beziehungsweise Pedanterie. Dort gilt der Satz unverändert.

Die Nachschrift fragt etwas anderes. Sie fragt nicht, *wie* die Antwort zustande
kam, sondern ob die Schreibweise sitzt — und **wer ein Wort falsch legt, weiß
sie so wenig wie der, der es falsch tippt**. Im Power-Training ist das sogar der
Kern: Die Übung holt zurückgefallene Wörter zurück, und ein Wort, das man eben
noch falsch buchstabiert hat, ist nicht zurückgeholt.

Die Grenze verläuft damit nicht mehr zwischen Tastatur und Kachel, sondern
zwischen **Herstellen** und **Wählen**. Das ist die Grenze, die die Nachschrift
immer schon gemeint hat.

## Ein Fehler, der dabei sichtbar wurde

Bis 2.4.11 räumte jede Prüfung ihre Nachschrift selbst weg — `rekoVerlangen`
setzt `reko = null`, bevor es entscheidet. Das trägt nur, solange **jeder** Weg
in die Auflösung über eine Prüfung führt. In «Lernsets» führt er das nicht:
«Aufdecken» springt unmittelbar in die Auflösung. Erst mit der Nachschrift in
dieser Übung wäre daraus ein sichtbarer Fehler geworden — die Nachschrift der
**vorigen** Aufgabe hätte über der neuen gestanden, genau wie der Kommentar der
Chili es bis 2.4.3 tat.

`reko = null` gehört darum dorthin, wo `kommentar = ''` schon steht: in
`aufgabeBeginnt()`. Es ist derselbe Augenblick und derselbe Gedanke — **was zur
vorigen Aufgabe gehörte, gehört nicht zur nächsten**.

## Folgen

- Zwei Aufrufe geändert, einer neu; `renderUeben` zeichnet `rekoHtml()` und
  hängt den «Weiter»-Knopf an `rekoFertig()`, wie die fünf anderen Ansichten es
  längst tun.
- `aufgabeBeginnt()` räumt jetzt drei Dinge statt zwei.
- Die Suite `strenge` bekommt einen Abschnitt **J** (18 Prüfungen): dass die
  Nachschrift nach falsch gelegten Kacheln in beiden Übungen kommt, dass sie
  nach einer **Wahl** nicht kommt, dass sie nichts bewertet, dass «Aufdecken»
  sie nicht auslöst und die vorige nicht stehen lässt, und dass «nie» auch das
  Gelegte abschaltet. Die alte Prüfung `D3` hieß «gelegt ist nicht geschrieben»
  und heißt jetzt «eine Wahl verlangt keine Nachschrift» — geprüft wurde schon
  vorher die Bedingung, nicht der Satz darüber.
- Der Schalter bleibt einer. Eine eigene Stufe für Gelegtes wäre ein vierter
  Wert in einer Reihe, die heute drei hat, und eine weitere Erklärzeile in den
  Einstellungen — für einen Unterschied, den niemand getrennt einstellen will.
