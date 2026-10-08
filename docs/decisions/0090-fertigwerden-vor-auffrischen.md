# 0090 · Fertigwerden geht vor Auffrischen

**Stand:** angenommen · 2026-08-20 · aus einem Befund
**Ändert:** ADR 0015 (die Auswahl zwischen den Stapeln) · ADR 0088 (die
getippte Folge)

## Ausgangslage

**Befund:** «Wenn ich in Lernsets zu einem früheren Set gehe, um es zu
vervollständigen, brauche ich eine Ewigkeit — ich muß nur noch zwei Stück
meistern, und ich habe das Gefühl, die Wörter kommen gar nicht mehr dran. Es
kommen zu viele Wiederholungen dazwischen.»

Das Gefühl war zu freundlich. **Gemessen: null von hundert Ziehungen.**

Die Lage im Prüfstand nachgestellt — zehn gemeisterte Wörter, seit vierzig
Tagen nicht geübt, dazu zwei unfertige, gestern dran:

```
fällig davon: 10
von 100 Ziehungen trafen 0 ein fehlendes Wort
erste zwölf Stufen: 4 4 4 4 4 4 4 4 4 4 4 4
Runden bis das Set komplett ist: 27
```

## Zwei Ursachen, übereinander

**Erstens: eine Bedingung, die den Zufall nie befragt.**

```js
} else if (faellige.length && (!neue.length || Math.random() < 0.65)) quelle = faellige;
```

In einem alten Set gibt es nichts Neues. `!neue.length` ist also wahr, und der
Zufall wird gar nicht erst gewürfelt: Solange **irgend etwas** fällig ist, wird
**immer** daraus gezogen. Unter dem Fälligen standen nur gemeisterte Wörter —
die zwei fehlenden waren gestern dran und damit für eine Woche nicht fällig.

**Zweitens: ein Treffer erneuert den Zeitstempel.** Seit ADR 0088 braucht ein
Wort drei getippte Treffer **in Folge**. Der erste setzte `lastSeen` auf jetzt
— und schob das Wort damit um sieben Tage weg. Die Folge konnte sich gar nicht
füllen.

*Wer eine Regel einführt, die Wiederholung verlangt, muß die Regel prüfen, die
Abstand erzwingt.*

## Entscheidung

**Eine angefangene Folge ist keine Wiedervorlage.** `faellig()` gibt `true`
zurück, solange `tippFolge > 0` steht. Wer ein Wort dreimal hintereinander
schreiben soll, braucht keinen Abstand, sondern das Gegenteil.

Dazu wird die erfüllte Folge **abgeräumt** — sonst gälte das gemeisterte Wort
für immer als fällig.

**Fertigwerden geht vor Auffrischen.** Unter den fälligen Wörtern kommen die
unfertigen zuerst. Ist nichts Unfertiges fällig, bleibt es trotzdem im Rennen
(60 %) — aber nicht allein: *Wiederholen ist der Sinn der Sache, es soll nur
nicht alles besetzen.*

## Danach

```
von 100 Ziehungen trafen 62 ein fehlendes Wort
erste zwölf Stufen: 3* 4 3* 4 3* 4 4 4 4 3* 3* 3*
Runden bis das Set komplett ist: 6
```

Von null auf zweiundsechzig, von siebenundzwanzig Runden auf sechs — und die
Auffrischungen laufen sichtbar weiter mit.

## Nachtrag: Abstand statt Abtippen

Die Reparatur war richtig und trotzdem nicht fertig. **Befund am echten
Lernstand** (der Nutzer legte seine Sicherung ins Repo): «Ich hatte *guten
Morgen* schon 6 von 12 Mal.»

Gemessen mit seinem Stand — elf Wörter im Set, vier davon unfertig, nichts
fällig:

```
erste 14 in Folge: муж · муж · муж · с · с · с · работать · работать · работать · там · там · там
```

**Dreimal dasselbe Wort, unmittelbar hintereinander.** Ein Wort mit
angefangener Tippfolge ist seit oben immer fällig — und stand damit als
einziges in der Quelle. Logisch konsequent, in der Hand furchtbar.

*«Drei Treffer in Folge» heißt nicht «drei aufeinanderfolgende Aufgaben».*
Dreimal dasselbe Wort abzutippen zeigt gar nichts; die Folge soll beweisen,
daß die Schreibweise **bleibt**, und dafür braucht sie Abstand.

**Entscheidung:** Die letzten drei gezogenen Wörter sind gesperrt — aber nur,
solange der Vorrat es hergibt (`min(3, pool.length - 2)`). Bei zwei Wörtern
gibt es keinen Abstand, und eine Sperre, die alles sperrt, wäre keine.

**Die Sperre steht ganz vorn, auf dem Vorrat.** Mein erster Versuch setzte sie
ans Ende, kurz vor die Wahl — dort war sie wirkungslos: Die Quelle ist da
längst auf das eine fällige Wort eingeengt, und was allein dasteht, läßt sich
nicht ausschließen. Die Messung zeigte danach unverändert «жить · жить · жить».

Danach:

```
папа · доброе утро · мой · жить · моя · доброе утро · с · жить · муж · доброе утро · с · жить
```

Drei Treffer für «доброе утро» in zwölf Runden, sauber verteilt — statt sechs
am Stück.

## Was daran lehrreich ist

**Eine Zahl schlägt ein Gefühl, in beide Richtungen.** Meine erste Vermutung
war falsch: In der Lage, die ich zuerst nachstellte (nichts fällig), kamen die
fehlenden Wörter zu 43 % dran. Erst die zweite Nachstellung — die gemeisterten
fällig, die fehlenden frisch — traf den Fall. *Ein Befund ist reproduziert,
wenn die Zahl ihn zeigt, nicht wenn die Erklärung plausibel klingt.*

## Folgen

- `wiederholung` X1–X4 (kein Wort unmittelbar zweimal, auch nicht mit einem
  dazwischen; und ein kleiner Vorrat liefert trotzdem), W1–W7: die Lage, die Trefferquote in beide Richtungen
  (nicht null, aber auch nicht alles), und die Folge als Fälligkeitsgrund.
- Die Messung selbst war die Gegenprobe: 0 vor der Reparatur, 62 danach.
