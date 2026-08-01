# Datenmodell und Inhaltspflege

Lerninhalte werden **ausschließlich in `/data`** gepflegt und von `tools/build.mjs` in
`index.html` eingebettet. Der Datenblock in `index.html` ist generiert — Änderungen
daran gehen beim nächsten Build verloren.

## Ablauf

```sh
$EDITOR data/vokabeln.json     # Inhalt ergänzen
node tools/build.mjs           # prüfen, normieren, in index.html einbetten
node tools/pruefen.mjs         # index.html gegenprüfen
git add data index.html && git commit
```

`node tools/build.mjs --check` schreibt nichts und liefert Exit-Code 1, sobald
`index.html` und `/data` auseinanderlaufen. Das ist die Prüfung vor jedem Push.

## Dateien

### `data/vokabeln.json`

Thema → Liste von Tripeln `[russisch, deutsch, transliteration]`.

```json
{
  "Grundlagen": [
    ["привет", "hallo", "priwjet"]
  ]
}
```

- Das Thema ist zugleich die Überschrift im Filter und Teil der Vokabel-ID
  (`Thema::русское слово`). **Ein Thema umzubenennen setzt den Leitner-Stand aller
  enthaltenen Wörter zurück** — nur mit Bedacht und mit Hinweis im Commit.
- Transliteration in deutscher Lesart, wie man es aussprechen würde: `spassiba`, nicht
  `spasibo`. Keine wissenschaftliche Umschrift, keine diakritischen Zeichen.
- Mehrere deutsche Bedeutungen mit Schrägstrich trennen: `nichts / macht nichts`.
- Betonungszeichen nur, wo sie den Sinn tragen (`за́мок` gegen `замо́к`), als
  kombinierender Akut U+0301 hinter dem Vokal. Der Build schreibt ihn als `́`, damit
  er im Quelltext sichtbar bleibt.

### `data/saetze.json`

Schwierigkeitsstufe → Liste von Paaren `[russisch, deutsch]`.

```json
{
  "1": [["Это дом.", "Das ist ein Haus."]]
}
```

- Stufen sind Ganzzahlen ab 1 und lückenlos.
- Der Satzbau zerlegt am Leerzeichen. Sätze deshalb kurz halten und keine Wortgruppen
  verwenden, die nur zusammen Sinn ergeben — jedes Wort wird eine eigene Kachel.
- Satzzeichen bleiben am Wort hängen und sind Teil der Kachel.
- Stufe 1: drei bis vier Wörter, Gegenwart. Stufe 2: fünf bis sechs Wörter, einfache
  Fälle. Stufe 3: Nebensatz oder Vergangenheit.

### `data/fakten.json`

Liste von Sätzen, die nach einer richtigen Antwort eingeblendet werden. Ein Fakt ist ein
in sich abgeschlossener Satz, höchstens zwei Zeilen. Deutsche Anführung „…" für deutsche
Wörter, «…» für russische.

### `data/tastatur.json`

Drei Reihen der kyrillischen Bildschirmtastatur, je ein Zeichen pro Eintrag, in
ЙЦУКЕН-Anordnung. Änderungen hier verändern das Layout unmittelbar — die Reihenlängen
sollten nicht stark auseinanderlaufen, sonst bricht das Raster auf schmalen Geräten.

## Was der Build prüft

| Prüfung | Wirkung |
| --- | --- |
| Tupel-Länge (3 bzw. 2) | Abbruch |
| leere Felder, führende/folgende Leerzeichen | Abbruch |
| erstes Feld enthält Kyrillisch | Abbruch |
| Vokabel-Dublette über **alle** Themen | Abbruch |
| Satzstufen lückenlos ab 1 | Abbruch |
| doppelte oder nicht-kyrillische Taste | Abbruch |
| doppelter Fakt | Abbruch |

Die Dublettenprüfung greift themenübergreifend: ein Wort gehört an genau eine Stelle.
Passt es in zwei Themen, ist das ein Hinweis darauf, dass die Themen zu fein geschnitten
sind.

## Lernstand im Browser

Der Fortschritt liegt unter `localStorage['russisch_trainer_v1']` und ist an die
Vokabel-ID gebunden. Neue Wörter starten in Stufe 0 („neu"), ohne den bestehenden Stand
zu berühren. Entfernte Wörter hinterlassen verwaiste Einträge — die Bilanz zählt nur
Wörter, die es noch gibt, also ist das unschädlich.
