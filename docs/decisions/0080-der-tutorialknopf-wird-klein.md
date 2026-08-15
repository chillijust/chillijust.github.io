# 0080 · Der Tutorial-Knopf wird klein und rund

**Stand:** angenommen · 2026-08-15 · aus einem Ticket
**Ändert:** ADR 0079 (der Weg zurück lag im Trichter) · ADR 0051 (der Platz des
Knopfes)

## 1 · Die Übersicht fragte bei jedem Betreten

**Befund:** «Jedes Mal, wenn ich zur Übersicht komme, wird die Tutorial-Meldung
gemacht.»

Mein Fehler aus ADR 0079, und ein sauberer:

```js
function tutUebungAnbieten(id) {
  if (tutOffen || !TUTORIALS[id]) return;
  if (state.tutUebung[id]) return;
  …
}
```

`TUTORIALS.home` **gibt es** — es ist die Heimspur. Sie führt aber ihre eigenen
zwei Merker (`tutorialGesehen`/`tutorialFertig`, ADR 0051) und steht **nicht** in
`state.tutUebung`. Also war die zweite Zeile für `home` nie wahr, und die Frage
kam bei jedem `setTab('home')` wieder.

**Entscheidung:** `if (id === 'home') return;`. Die Heimspur wird nicht
angeboten, sie hat ihr eigenes Angebot im Inhalt.

**Was daran lehrreich ist:** Eine Bedingung, die einen Zustand abfragt, den es
für den geprüften Fall gar nicht gibt, ist keine Bedingung. Sie sieht nur wie
eine aus.

## 2 · Klein und rund, wie die anderen

**Befund:** «Der Tutorial-Knopf (Übersicht) sieht immer noch gleich aus — es soll
ein kleinerer Knopf werden, wie der Info-Knopf. Der Tutorial-Knopf in den
Übungen fehlt.»

Der Weg zur Spur lag seit ADR 0079 als Zeile im **Trichter**. Das war
naheliegend gedacht, aber falsch: Man sieht ihn nicht, und der Nutzer suchte
einen Knopf.

**Entscheidung:** `#tutRund` — ein `.rundbtn` im Kopf mit einem Fragezeichen,
gebaut wie `#wissenKnopf` (Kreis mit Zeichen darin), damit er neben ihm nicht
wie ein Fremdkörper steht und trotzdem klar unterscheidbar ist. Er erscheint
überall dort, wo es eine Spur gibt, und startet die Spur **der Ansicht, in der
er steht**.

Die Zeile im Trichter fällt weg. **Eine Sache, ein Ort.**

## 3 · Auf der Übersicht zwei Gestalten

Auf ausdrückliche Ansage:

| Zustand | Übersicht |
| --- | --- |
| noch nie ganz durchlaufen | das goldene Angebot im Inhalt, wie bisher |
| einmal durchlaufen | das Fragezeichen im Kopf, sonst nichts |

**Nie beides.** Zwei Knöpfe für dieselbe Sache wären einer zu viel, und der
Scheinwerfer von Schritt 13 leuchtete den falschen an.

Damit fällt der ruhige Riegel am Seitenende weg — für etwas, das man selten
braucht, war er immer noch zu viel Platz. Der letzte Tutorial-Schritt sagt
jetzt, wohin der Knopf verschwindet, statt «ab jetzt ganz unten» zu behaupten.

## Folgen

- `renderTutRund()` gehört zu `renderKopf()`, neben `renderTafelKnopf()` und
  `renderWissen()` — dieselbe Bauform, dieselbe Stelle.
- **`renderHome()` zeichnet den Riegel nicht mehr immer**, also darf sein Binder
  ihn nicht mehr voraussetzen. Die Suiten haben das sofort gemeldet
  (`addEventListener of null`) — ein Element, das bedingt gezeichnet wird,
  braucht einen bedingten Zuhörer.
- Suiten: `tutorial` B (die zwei Gestalten, in Übungen mit und ohne Spur) und L
  (der Weg über den Kopf statt den Trichter), `maskottchen` R3/R3c (beide Wege
  holen die Figur), `filter` G1b (die Hilfezeile ist wieder weg).
