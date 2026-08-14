# Chillingo

Eine Web-App zum Russischlernen — Kyrillisch lesen, schreiben und übersetzen.
Gebaut aus reinem HTML, CSS und Vanilla-JavaScript. Kein Framework, kein Build-Schritt im
Auslieferungspfad, keine externen Ressourcen.

**Ausgeliefert werden zwei Dateien:** `index.html` — dort steht alles Inhaltliche, von der
Oberfläche bis zum letzten Vokabel — und `sw.js`, ein Service Worker, der die App beiseite
legt, damit sie offline startet ([ADR 0059](docs/decisions/0059-der-service-worker.md)).
Der Worker kennt kein Wort Russisch.

**Live:** https://chillijust.github.io/

## Übungen

Einstieg ist **Home**: eine Empfehlung, was als Nächstes dran ist, und eine Kachel je
Übung.

| Übung | Inhalt |
| --- | --- |
| **Lernsets** | Zwölf Wörter je Set — genau die, die die nächsten Sätze brauchen. Wer ein Set schafft, schaltet diese Sätze in «Übersetzen» frei |
| **Freestyle** | Freies Vokabeltraining nach Thema, ohne Sperren und ohne Reihenfolge |
| **Tippen** | Eingabequiz mit eingebauter kyrillischer Tastatur — für Wörter, die schon halbwegs sitzen |
| **Übersetzen** | Nur Sätze, deren Wörter sitzen. Form und Richtung steigern sich mit der Stufe: erst Kacheln, dann Schreiben; erst RU→DE, dann DE→RU |
| **Buchstaben** | Das kyrillische Alphabet. Freiwillig, mit eigenem Lernstand; dazu drei schärfende Formen — Minimalpaar, Silbenleiter, Betonung |
| **Schreibung** | Warum man nicht schreibt, was man hört — acht Regeln, eine je Karteikarte |
| **Grammatik** | Warum ein Wort so dasteht. Die Karteikarte ist die **Regel**, nicht das Wort; gefragt wird ein bekanntes Wort in einer nie gesehenen Form |
| **Power-Training** | Zurückgefallene Wörter zurückholen, drei auf einmal |

Keine Übungen, sondern **im Menü**: Bilanz, Sicherung, Einstellungen, Tickets. Dazu die
Sprachfakten.

Der Lernstand liegt ausschließlich im `localStorage` des Geräts — es gibt kein Konto,
keinen Server und keine Datenübertragung. Der Sicherungscode in der Bilanz ist der einzige
Weg, den Stand auf ein anderes Gerät zu bringen.

## Auf dem iPhone installieren

1. https://chillijust.github.io/ in Safari öffnen
2. Teilen-Menü → **Zum Home-Bildschirm**
3. Die App startet danach im Vollbild, ohne Safari-Leisten, und funktioniert offline

Liegt eine neue Fassung bereit, meldet sich unter dem Kopf eine Zeile «Jetzt laden» — kein
Blatt, kein Zwang. Klemmt etwas, steht unter **Einstellungen → App** der Notausgang
«Speicher der App leeren»; er lässt den Lernstand unberührt.

## Lokal entwickeln

```sh
python3 -m http.server 8000      # im Repository-Root
open http://localhost:8000
```

Die Datei lässt sich auch direkt per Doppelklick öffnen; über `file://` verhält sich Safari
allerdings bei `localStorage` und Sprachausgabe anders als über HTTP — und **der Service
Worker läuft dort gar nicht**. Für ernsthafte Tests daher den lokalen Server verwenden.

## Aufbau des Repositories

```
index.html                die App — hier steht alles Inhaltliche
sw.js                     Service Worker: legt die App beiseite, mehr nicht
.nojekyll                 schaltet die Jekyll-Verarbeitung von GitHub Pages ab
data/                     Lerninhalte als eigenständige Quelldateien (JSON)
tools/                    lokale Hilfsskripte, nie Teil der Auslieferung
tools/pruefstand/         die Testsuiten, geprüft am echten DOM
docs/                     Architektur, Datenmodell, Deploy, Entscheidungen (ADRs)
docs/archiv/              abgearbeitete Pläne — nichts davon ist offen
CLAUDE.md                 Arbeitsanweisung für die Entwicklung mit Claude Code
```

Die Lerninhalte werden in `data/` gepflegt und von `tools/build.mjs` in `index.html`
eingebettet. Die ausgelieferte Datei bleibt dadurch vollständig und eigenständig — der Build
ist ein reines Autorenwerkzeug und läuft nur lokal. Details in
[`docs/datenmodell.md`](docs/datenmodell.md).

## Prüfstand

Die App wird am echten DOM geprüft: Die ausgelieferte Datei bekommt ein Skript angehängt,
ein kopfloser Browser lädt sie, das Skript prüft und schreibt sein Urteil in den
Seitentitel.

```sh
node tools/pruefstand/lauf.mjs          # alle Suiten
node tools/pruefstand/lauf.mjs -q jubel # einzelne
```

Vor jedem Push laufen `build.mjs --check`, `pruefen.mjs` und der Prüfstand; ist etwas rot,
kommt der Push nicht durch. Ein GitHub-Lauf prüft dasselbe noch einmal unabhängig.
Siehe [`tools/pruefstand/README.md`](tools/pruefstand/README.md).

## Deployment

GitHub Pages liefert den Inhalt des Branches `main` direkt aus. Ein Push genügt; der neue
Stand ist nach ein paar Minuten sichtbar. `.nojekyll` sorgt dafür, dass die Dateien
unverändert ausgeliefert und nicht durch Jekyll gerendert werden — die Datei darf niemals
gelöscht werden. Siehe [`docs/deploy.md`](docs/deploy.md).

## Entscheidungen

Warum etwas so ist, wie es ist, steht in den ADRs unter
[`docs/decisions/`](docs/decisions/README.md) — sechzig kurze Einträge mit einem Index
vorneweg.
