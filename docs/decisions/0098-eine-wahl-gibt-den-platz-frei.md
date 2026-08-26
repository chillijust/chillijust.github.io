# 0098 · Eine Wahl gibt den Platz frei, sobald sie sitzt

**Stand:** angenommen · 2026-08-23 · aus einem Ticket
**Ergänzt:** ADR 0020 (Auswahl hinter einem Knopf) · ADR 0069 (der Bezug wird
eine Wahl)

## Ausgangslage

**Befund:** «Die Fortschrittsanzeige (die Flammen) zeigt an (mit Strichen), daß
noch 3 Aufgaben/Wörter nicht drangekommen sind — diese kommen auch nie dran.
Anzeigebug oder wirklich nicht abgefragt?»

Weder noch. Das Bildschirmfoto des Nutzers löste den Fall auf, und der Beweis
stand **oben rechts**: Der Trichter trug einen goldenen Ring — der Filter stand
auf «Akanje».

Nachgestellt mit genau diesem Stand (fünf Regeln sitzen, drei auf null):

| | |
| --- | --- |
| **mit** Filter auf Akanje | deckungsgleich mit der Meldung: «5 von 8 sitzen · gerade: Akanje», `г_ра`, «3 offen» |
| **ohne** Filter | die App zeigt sofort «Weichzeichen am Ende · entdecken» — einen der drei Striche |

`orthoAktuell()` fragt zuerst `orthoWahl` und gibt die gewählte Regel zurück,
**bedingungslos**:

```js
if (orthoWahl) {
  var gewaehlt = orthoFinde(orthoWahl);
  if (gewaehlt) { orthoRegel = gewaehlt.id; return gewaehlt; }
}
```

Auch dann, wenn diese Regel längst auf `BOX_MAX` steht. Die Karte zeigte fünf
gefüllte Punkte — fertig — und wurde weiter abgefragt, während drei unberührte
Regeln als Strich danebenstanden.

## Die eigentliche Ursache

*Der Filter sticht die Reihenfolge — und tat das auch dann noch, wenn es nichts
mehr zu stechen gab.* Das ist die Regel aus ADR 0069, nur einen Schritt zu weit
gedacht: Sie ist richtig, solange die gewählte Regel Arbeit hat. Ist die Arbeit
getan, ist die Wahl kein Vorzug mehr, sondern eine Sperre.

Dazu kam, daß der Zustand still ist: Die Kopfzeile sagte «gerade: Akanje» und
die Fußzeile «3 offen» — für den Nutzer ein Widerspruch, denn nirgends stand,
daß er selbst gewählt hatte. (Die Kopfzeile umzubenennen wurde erwogen und
**verworfen**: Der goldene Ring genügt als Anzeige.)

## Entscheidung

**Wer eine Regel wählt, will sie fertig lernen. Ist sie fertig, ist die Wahl
erledigt.** Beim Weitergehen fällt sie:

```js
function wahlErledigt(wahl, finde, gemeistert) {
  if (!wahl) return false;
  var r = finde(wahl);
  return !!r && gemeistert(r);
}
```

**Gefragt wird beim Weitergehen, nie im Renderlauf.** `orthoAktuell()` läuft
auch während der Auflösung — eine Regel, die dort unter der offenen Rückmeldung
wechselt, nimmt sie mit. Der Handgriff steht darum im «Weiter»-Zuhörer, neben
dem `orthoRegel = null`, das dort seit jeher steht.

**Fällt die Wahl, wird `renderFilter()` gerufen** — sonst behält der Trichter
seinen goldenen Ring und behauptet eine Wahl, die es nicht mehr gibt.

## Dieselbe Falle steckte in «Grammatik»

`gramAktuell()` ist bis auf die Namen dieselbe Funktion, und der
«Weiter»-Zuhörer setzte genauso nur `gramBaustein = null`. Repariert wurde
beides mit derselben Hand — `wahlErledigt()` steht einmal im Abschnitt «Auswahl
(Filter)» und wird von beiden gerufen. *Wer nur die gemeldete Stelle repariert,
bekommt die nächste Meldung.*

## Was daran lehrreich ist

**Der gemeldete Befund war keiner.** Gemeldet war ein Anzeigefehler, vermutet
wurde ein Fehler in der Auswahl — die Ursache war eine Einstellung, die der
Nutzer selbst vor Tagen gesetzt und vergessen hatte. Ohne das Bildschirmfoto
wäre der goldene Ring nie aufgefallen.

*Ein Bildschirmfoto trägt Zustand, den keine Beschreibung mitliefert.*

**Und die Flammen zählen etwas anderes, als der Nutzer annahm:** eine Flamme je
**Regel** (acht), nicht je Aufgabe. Die 3–8 Beispielsätze einer Regel werden
zufällig gezogen und **nicht einzeln verfolgt** — anders als die Wörter in
«Lernsets», die jedes ihre eigene Box haben.

## Folgen

- `wahlErledigt()` im Abschnitt «Auswahl (Filter)», gerufen aus den
  «Weiter»-Zuhörern von «Schreibung» und «Grammatik».
- `schreibung` J1–J11: die Lage aus dem Bildschirmfoto, das Fallen der Wahl beim
  Weitergehen, das Stehenbleiben während der Auflösung, die Gegenprobe mit einer
  Regel, die noch nicht sitzt. Ohne die Reparatur meldet J7 «akanje» statt
  «weichzeichen».
- `grammatik` S1–S9: dasselbe für den Baustein. Ohne die Reparatur meldet S6
  «geschlecht».
