# 0095 · Der Fakt hört sich selbst zu

**Stand:** angenommen · 2026-08-22 · aus einem Ticket

## Ausgangslage

**Wunsch:** «In den Fakten soll es die Option geben, die russischen Wörter/Sätze
per Audio auszugeben.»

Ein Sprachfakt ist kein Vokabelpaar mit einem `ru`- und einem `de`-Feld — er ist
ein einzelner deutscher Fließtext, der russische Wörter meist, aber nicht immer,
in «» einzäunt: «„Sein" fällt in der Gegenwart meist weg: «Я дома» — wörtlich
„Ich zu Hause"» trägt sein Zitat in «», «Handschrift-Falle Nr. 1: Das kursive т
sieht aus wie ein lateinisches m» dagegen nicht — dort ist ein einzelner
Buchstabe gemeint, kein Wort zum Zitieren. Vier der 126 Fakten enthalten gar
kein Kyrillisch.

## Entscheidung

Kein neues Datenfeld. Statt dessen liest `faktRussisch(text)` die kyrillischen
Abschnitte **aus der Schrift selbst**, unabhängig von «»:

```js
function faktRussisch(text) {
  var treffer = (text || '').match(/[А-Яа-яЁё][А-Яа-яЁё́]*(?:[ -][А-Яа-яЁё́]+)*/g);
  return treffer ? treffer.join(', ') : '';
}
```

Mehrere Fundstellen werden nacheinander gesprochen (Komma als Pause), Bindestrich
und ein Leerzeichen halten einen mehrteiligen Namen zusammen («Иван Петрович
Смирнов»). Das Ergebnis geht an den vorhandenen `hoerknopf(text, 'ru')` — **kein
neuer Mechanismus**, derselbe Knopf, der überall sonst in der App spricht.

Der Knopf sitzt an **beiden** Stellen, an denen ein Fakt zu lesen ist: auf der
Karte beim Üben (`faktKarteHtml()`) und in der Zeile der Sammlung
(`renderFakten()`) — «Sprachfakten» ist eine Übung, keine zwei.

**Ein Fakt ohne Kyrillisch bleibt stumm.** `hoerknopf()` gibt bei leerem Text
ohnehin nichts aus; `faktRussisch()` muss also nur ehrlich leer bleiben, wenn da
nichts zu sprechen ist — kein Knopf, der ins Leere zeigt.

## Begründung

Ein Datenfeld hätte 126 Fakten von Hand ausgezeichnet und jeden neuen Fakt zu
einer zweiten Pflichtangabe verurteilt — für einen Text, der sein Zitat schon
sichtbar in der Schrift trägt. *Was sich aus dem Text selbst lesen lässt, muss
nicht noch einmal behauptet werden.*

## Folgen

- `hoeren`-artige Prüfung ergänzt in `extras` (C7/D3a/D3b): `faktRussisch()`
  direkt geprüft, dazu je ein Fakt mit und ohne Kyrillisch an Karte und Liste.
- Eine neue Regel für `data/fakten.json`: Ein Wort, das gesprochen werden soll,
  muss kyrillisch geschrieben sein — Umschrift oder ein isoliert genanntes
  lateinisches Zeichen (wie das «m», mit dem das kursive т verwechselt wird)
  wird nicht mitgelesen, weil es nicht dazugehört.
