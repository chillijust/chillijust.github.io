# 0083 · Der Scheinwerfer atmet, statt zu blitzen

**Stand:** angenommen · 2026-08-16 · aus einem Ticket
**Löst ab:** ADR 0081 §2 (das Aufleuchten alle vier Sekunden)
**Ergänzt:** ADR 0067 (das Loch liegt auf dem Ziel)

## Ausgangslage

**Befund:** «Blitzen war zu viel des Guten, der ganze Bildschirm blitzt
teilweise auf. Die Kachel soll langsam etwas aufleuchten — wie ein ruhiges
Atmen. Nur die Kachel, nicht über den Rand hinaus.»

Zwei Fehler in einer Zeile, und der zweite erklärt den ersten:

```css
0%, 12%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, .82); }
4%            { box-shadow: 0 0 0 3px var(--akzent), 0 0 0 9999px …; }
```

1. **Der Ring stand außerhalb.** Ein `box-shadow` mit positiver Streuung wächst
   nach außen — genau der leuchtende Rahmen, den ADR 0067 abgeschafft hatte,
   nur in Bewegung.
2. **Die Verdunklung lag in derselben Eigenschaft.** `box-shadow` ist eine
   **Liste**, und eine Liste mit zwei Einträgen läßt sich nicht gegen eine mit
   einem interpolieren. Der Browser schaltet dann hart um — und in dem
   Augenblick, in dem er umschaltet, ist der große Schatten nicht da. Der
   ganze Bildschirm blitzte auf. Genau so wurde es gemeldet.

Der Hinweis aus 0081 («der große Schatten muss in jedem Bild mitgeschrieben
werden») war richtig und trotzdem nicht genug: Mitgeschrieben war er, aber
zwischen zwei Bildern unterschiedlicher Länge hilft das nicht.

## Entscheidung

**Der Schein liegt innerhalb des Lochs und atmet.**

```css
#tutLoch::after {
  content: ''; position: absolute; inset: 0;
  border-radius: inherit; background: var(--tut-atem);
  opacity: 0; animation: tutAtem 5.6s ease-in-out infinite;
}
@keyframes tutAtem { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
```

Drei Eigenschaften, die zusammen die Zusage einlösen:

- **Ein eigenes Kind.** Eine Deckung auf dem Loch selbst nähme den Schatten
  mit — dasselbe Blitzen, nur mit anderer Ursache. Der `box-shadow` des Lochs
  wird jetzt **gar nicht mehr angefaßt**; er steht.
- **Der Radius wird geerbt.** Das Loch mißt ihn am Ziel (ADR 0067), das Kind
  übernimmt ihn. Was leuchtet, endet an der Kante der Kachel und nicht einen
  Pixel weiter.
- **5,6 Sekunden mit `ease-in-out`**, ein durchgehendes Ein und Aus ohne Halt.
  Ein Atemzug, kein Blinken.

**Die Deckung steht zweimal**, wie die Flächen selbst: `rgba(255,255,255,.12)`
auf dem fast schwarzen Grund, `.35` in den hellen Schemata. Auf einer Kachel
mit 89 % Helligkeit wäre ein Zehntel Weiß nichts; mehr als ein Drittel nähme
der Schrift den Kontrast, denn der Schein liegt **über** ihr.

Bei `prefers-reduced-motion` steht der Schein still bei `.6`, statt zu fehlen.
Ein stehender **Rand** bleibt verboten (ADR 0067) — dies ist eine Fläche
innerhalb des Ziels, und die zieht den Blick nicht von ihm ab, sie ist er.

## Die Regel dahinter

**Wer zwei Aussagen in eine Eigenschaft schreibt, animiert beide.** `box-shadow`
trug die Verdunklung *und* die Hervorhebung; die eine ließ sich nicht bewegen,
ohne die andere zu gefährden. Was verschieden lange lebt, gehört in
verschiedene Eigenschaften — oder in verschiedene Knoten.

## Nebenbei: das T darf zählen

Die Korrektur mußte an ein Gerät, auf dem «2.5.0T» schon lag. Der Cache des
Workers heißt nach der Version — eine zweite Ansichtsfassung unter demselben
Namen wäre nie angekommen. Statt die angesagte Release-Nummer zu verschieben,
zählt das T jetzt: **`2.5.0T2`**. Bei der Abnahme fällt es samt Ziffer weg, und
übrig bleibt die Zahl, die angesagt war. Geprüft wird das Format in
`build.mjs`, `pruefen.mjs` und der Suite `tickets`.

## Folgen

- `tutorial` B9 fragt jetzt das Kind (`::after`), B9b hält fest, daß am Loch
  selbst **nichts** animiert wird, B9c daß dessen `box-shadow` genau **einen**
  Eintrag trägt — zwei wären die Falle von oben wieder aufgestellt.
- Z2b prüft, daß der Schein den gemessenen Radius erbt und die Fläche des
  Lochs nicht überschreitet.
