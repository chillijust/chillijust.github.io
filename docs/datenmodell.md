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

- **Die Reihenfolge in dieser Datei ist der Lehrplan.** Sie bestimmt, in welcher Folge
  die Lernsets entstehen und in welcher Reihenfolge Freestyle die Themen anbietet. Wer
  Wörter einfügt oder umsortiert, verschiebt damit den Lernweg — Ergänzungen deshalb ans
  Ende des passenden Themas, nicht mittendrin.
- Der Themenname ist nur noch Überschrift. Die Vokabel-Kennung ist das russische Wort
  selbst, ein Umbenennen des Themas kostet also keinen Lernstand mehr.
- Transliteration in deutscher Lesart, wie man es aussprechen würde: `spassiba`, nicht
  `spasibo`. Keine wissenschaftliche Umschrift, keine diakritischen Zeichen.
- Mehrere deutsche Bedeutungen mit Schrägstrich trennen: `nichts / macht nichts`.
- Betonungszeichen nur, wo sie den Sinn tragen (`за́мок` gegen `замо́к`), als
  kombinierender Akut U+0301 hinter dem Vokal. Der Build schreibt ihn als `́`, damit
  er im Quelltext sichtbar bleibt.

### `data/saetze.json`

Geordnete Liste von Sätzen. Jeder nennt seine **Voraussetzungen**: die Grundformen aus
`vokabeln.json`, die sitzen müssen, bevor der Satz in „Übersetzen" auftaucht.

```json
{
  "ru": "Я читаю книгу.",
  "de": "Ich lese ein Buch.",
  "stufe": 1,
  "benoetigt": ["я", "читать", "книга"]
}
```

- `benoetigt` enthält **Grundformen**, nicht die Formen im Satz: «книгу» steht als
  «книга», «читаю» als «читать». Nur so lässt sich prüfen, ob das Wort gelernt wurde —
  Russisch beugt zu stark für einen Zeichenkettenvergleich.
- Jede Voraussetzung muss in `vokabeln.json` stehen; `build.mjs` bricht sonst ab. Wer
  einen Satz mit neuem Wort schreibt, muss das Wort also zuerst in den Lehrplan
  aufnehmen — genau das erzwingt den Aufbau.
- **Alle inhaltstragenden Wörter gehören in `benoetigt`.** Wird eines vergessen, taucht
  der Satz zu früh auf; das fällt beim Üben auf, nicht beim Bauen.
- `stufe` ist die grammatische Schwierigkeit, nicht der Zeitpunkt: 1 = Aussagesatz in der
  Gegenwart, 2 = Fälle, Zeitangaben, Fragen, 3 = Nebensatz, Vergangenheit, Zukunft.
  *Wann* ein Satz erscheint, ergibt sich allein aus `benoetigt`.
- Die Reihenfolge sortiert `build.mjs` nach Stufe und Reifegrad (Position des zuletzt
  gelehrten Wortes) — ein Satz steht also dort, wo er erreichbar wird.
- Der Satzbau zerlegt am Leerzeichen; Satzzeichen bleiben am Wort. Sätze deshalb kurz
  halten.

### `data/fakten.json`

Liste von Sätzen, die nach einer richtigen Antwort eingeblendet werden und sich in der
Faktensammlung wiederfinden. Aktuell 101 Stück.

- Ein Fakt ist ein abgeschlossener Satz, höchstens zwei Zeilen — er wird auch in der
  Liste vollständig angezeigt.
- Deutsche Anführung „…" für deutsche Wörter, «…» für russische. Der Build prüft nichts
  davon; die Gleichförmigkeit hält die Sammlung lesbar.
- Themen, die sich bewährt haben: deutsche Lehnwörter im Russischen, falsche Freunde,
  Schrift- und Aussprachefallen, Grammatik in einem Satz, Wortgeschichte und Alltag.
- **Nur schreiben, was stimmt.** Etymologien sind ein Minenfeld; im Zweifel weglassen
  oder vorsichtig formulieren.
- Die App merkt sich Fakten über einen Hash ihres Textes. Wird ein Fakt umformuliert,
  gilt er als neu — Zähler und Favorit des alten fallen beim nächsten Laden weg.

### `data/tastatur.json`

Drei Reihen der kyrillischen Bildschirmtastatur, je ein Zeichen pro Eintrag, in
ЙЦУКЕН-Anordnung. Änderungen hier verändern das Layout unmittelbar — die Reihenlängen
sollten nicht stark auseinanderlaufen, sonst bricht das Raster auf schmalen Geräten.

## Was der Build prüft

| Prüfung | Wirkung |
| --- | --- |
| Vokabel-Tupel mit drei Feldern | Abbruch |
| leere Felder, führende/folgende Leerzeichen | Abbruch |
| erstes Feld enthält Kyrillisch | Abbruch |
| Vokabel-Dublette über **alle** Themen | Abbruch |
| Satz ohne `benoetigt` | Abbruch |
| `benoetigt` nennt ein Wort, das nicht im Lehrplan steht | Abbruch |
| doppelte Voraussetzung, doppelter Satz | Abbruch |
| Satzstufen lückenlos ab 1 | Abbruch |
| doppelte oder nicht-kyrillische Taste | Abbruch |
| doppelter Fakt | Abbruch |

Die Dublettenprüfung greift themenübergreifend: ein Wort gehört an genau eine Stelle.
Passt es in zwei Themen, ist das ein Hinweis darauf, dass die Themen zu fein geschnitten
sind.

## Grundsätze des Lehrplans

1. **Funktionswörter zuerst.** Ohne я, ты, в, на, не, и, что ist kein Satz lesbar; sie
   stehen deshalb ganz vorn, noch vor den Sachgruppen.
2. **Konkretes vor Abstraktem, Häufiges vor Seltenem.** Alltagsdinge (книга, город,
   кошка) stehen früh, Fachliches spät.
3. **Wörter folgen den Sätzen.** Braucht ein einfacher Satz ein Wort, gehört das Wort
   nach vorn — nicht der Satz nach hinten. Deshalb steht «Erste Dinge» weit vor den
   Themen, aus denen die Wörter ursprünglich kamen.
4. **Kein Satz vor seinen Wörtern.** Der Aufbau ist keine Empfehlung, sondern eine
   Sperre: `benoetigt` entscheidet, ob ein Satz erscheint.
5. **Ein neues Wort kostet einen Platz im Lehrplan.** Ergänzungen ans Ende des passenden
   Themas. Ein Wort, das kein Satz braucht, taucht in keinem Lernset auf — es lebt dann
   in Freestyle.

## Lernstand im Browser

Der Fortschritt liegt unter `localStorage['russisch_trainer_v1']` und ist an das
russische Wort gebunden (`state.boxes`, dazu `state.lastSeen` für die Wiedervorlage).
Neue Wörter starten in Stufe 0 („neu"), ohne den bestehenden Stand zu berühren.
Entfernte Wörter hinterlassen verwaiste Einträge — die Bilanz zählt nur Wörter, die es
noch gibt, also ist das unschädlich.

Ein Wort umzubenennen ist dagegen ein Neuanfang für dieses Wort: Die alte Kennung
verwaist, die neue startet bei Stufe 0. Tippfehlerkorrekturen also bewusst vornehmen.
