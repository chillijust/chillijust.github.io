# 0054 · Die Betonung ist eine Zahl

**Stand:** angenommen · 2026-08-13 · Etappe 3 der Umstellung

## Ausgangslage

Der Didaktikplan nennt es „nicht verhandelbar": Ohne Betonungszeichen lässt sich ein
russisches Wort weder aussprechen noch nach Regel schreiben. Der betonte Vokal klingt
voll, alle unbetonten fallen zusammen — `молоко` spricht sich «malakó», nicht «molokó».

Chillingo hatte **kein einziges Betonungszeichen**. Die deutsche Lautschrift je Wort
(`молоко → malako`) liefert die Reduktion zwar mit, sagt aber nicht, welche Silbe trägt —
und ohne diese Auskunft ist die Prüfwort-Methode (Etappe 4) gar nicht baubar.

## Entscheidung

**Die Betonung steht als Zahl in einer eigenen Datei**, `data/betonung.json`:

```json
"молоко": 3,        // der dritte Vokal
"добрый день": [1, 3]
```

Angezeigt wird sie über `ruAnzeige()`, gerechnet von `betontesWort()` — das Zeichen
U+0301 wandert hinter den gezählten Vokal. Eine Einstellung mit drei Stellungen steuert,
wann: **Beim Lernen** (Vorgabe, bis das Wort fast sitzt) · **Immer** · **Nie**.

301 der 395 Wörter tragen eine Angabe. Die übrigen brauchen keine: 85 sind einsilbig,
9 enthalten ё — dort ist die Betonung eindeutig.

## Begründung

**Eine Zahl, nicht die betonte Schreibweise.** Das ist die tragende Entscheidung, und
sie hat einen einzigen Grund: **Die Kennung im Lernstand *ist* das russische Wort.** Ein
zweites Mal hingeschriebenes Wort kann einen Tippfehler tragen, und ein Tippfehler an
dieser Stelle löscht einen Lernstand — lautlos, und erst Wochen später sichtbar. Eine Zahl
kann nur zu groß sein, und genau das prüft der Build.

Nebenbei ist es kleiner: 301 Zahlen statt 301 doppelter Wörter.

**Eine eigene Datei, nicht ein fünftes Feld.** `vokabeln.json` bleibt damit vollständig
unberührt — kein Feld verschiebt sich, keine Kennung ändert sich, kein bestehender
Lernstand ist in Gefahr. Und die Betonungen lassen sich am Stück lesen und prüfen.

**Gezeigt, nie verglichen.** `normalize()` wirft U+0301 weg, bevor irgendetwas geprüft
wird. Wer das Zeichen tippt, hat dieselbe Antwort gegeben wie wer es lässt. Ebenso
schweigt es in der Sprachausgabe: `hoerknopf()` und `hoerzeile()` streichen es, damit
keine Stimme raten muss, was das soll.

**«Beim Lernen» ist die Vorgabe, nicht «immer».** In gedruckten Büchern steht kein
Betonungszeichen. Wer ein Wort kann, soll es so lesen, wie es ihm draußen begegnet — die
Hilfe fällt darum ab Stufe 3 weg. Das ist genau der Punkt, an dem der Plan sie ausblenden
will.

**Was fehlt, fällt auf.** Der Build zählt Wörter ohne Angabe und nennt sie beim Bauen.
Fehlen ist zulässig — das Wort erscheint dann ohne Zeichen —, aber es soll niemandem
entgehen.

## Folgen

- Neue Datei `data/betonung.json`, neuer Block `BETONUNG` in der ausgelieferten Datei
  (rund 6 KB).
- Neue Einstellung `betonung` (`lernen` · `immer` · `nie`) auf dem Reiter «Lernweg».
  Sie steht **nicht** im Sicherungscode — dessen Schalterreihe führt nur Ja/Nein-Werte.
- Gezeigt wird sie in «Lernsets», «Freestyle» (Frage und Auswahl), in den Lösungszeilen
  von «Tippen» und «Power-Training». **Sätze tragen noch keine** — ihre Wörter stehen in
  gebeugten Formen, die die Wortliste nicht kennt. Das kommt mit Etappe 6, wenn die Sätze
  ohnehin wachsen.
- Neue Suite `betonung`. Sie prüft unter anderem, dass **im Wortschatz selbst kein
  einziges Zeichen steht** — schon in der Datei, vor dem Browser.
- Die Suite `marken` musste lernen, dass Anzeige und Vergleich zweierlei sind: Sie suchte
  die Lösung als Zeichenkette im Text und fand sie nicht mehr.
- **Die Darstellung des Zeichens hängt an der Schrift.** Georgia setzt es sauber über den
  Vokal; wo Georgia fehlt — etwa im kopflosen Prüfbrowser —, rückt es daneben. Die
  Bildschirmfotos aus dem Prüfstand taugen dafür nicht; das gehört am Gerät angesehen.
