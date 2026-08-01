# Russisch · Тренажёр

Eine Web-App zum Russischlernen — Kyrillisch lesen, schreiben und übersetzen.
Gebaut als **eine einzige, offline lauffähige HTML-Datei** aus reinem HTML, CSS und
Vanilla-JavaScript. Kein Framework, kein Build-Schritt, keine externen Ressourcen.

**Live:** https://chillijust.github.io/

## Rubriken

| Rubrik | Inhalt |
| --- | --- |
| **Üben** | Multiple Choice, Buchstaben-Kacheln und Sprachfakten zu Lehnwörtern, falschen Freunden und Schriftfallen |
| **Übersetzen** | Sätze aus Wort-Kacheln zusammensetzen, in beide Richtungen (RU→DE und DE→RU) |
| **Tippen** | Eingabequiz mit eingebauter kyrillischer Bildschirmtastatur |
| **Bilanz** | Leitner-Statistik, Serie und Sicherungscode zum Übertragen des Lernstands |

Der Lernstand liegt ausschließlich im `localStorage` des Geräts — es gibt kein Konto,
keinen Server und keine Datenübertragung. Der Sicherungscode in der Bilanz ist der einzige
Weg, den Stand auf ein anderes Gerät zu bringen.

## Auf dem iPhone installieren

1. https://chillijust.github.io/ in Safari öffnen
2. Teilen-Menü → **Zum Home-Bildschirm**
3. Die App startet danach im Vollbild, ohne Safari-Leisten, und funktioniert offline

## Lokal entwickeln

```sh
python3 -m http.server 8000      # im Repository-Root
open http://localhost:8000
```

Die Datei lässt sich auch direkt per Doppelklick öffnen; über `file://` verhält sich Safari
allerdings bei `localStorage` und Sprachausgabe anders als über HTTP. Für ernsthafte Tests
daher den lokalen Server verwenden.

## Aufbau des Repositories

```
index.html                die App — genau diese Datei wird ausgeliefert
.nojekyll                 schaltet die Jekyll-Verarbeitung von GitHub Pages ab
data/                     Lerninhalte als eigenständige Quelldateien (JSON)
tools/                    lokale Hilfsskripte, nie Teil der Auslieferung
docs/                     Architektur, Datenmodell, Entscheidungen (ADRs)
CLAUDE.md                 Arbeitsanweisung für die Entwicklung mit Claude Code
```

Die Lerninhalte werden in `data/` gepflegt und von `tools/build.mjs` in `index.html`
eingebettet. Die ausgelieferte Datei bleibt dadurch vollständig und eigenständig — der Build
ist ein reines Autorenwerkzeug und läuft nur lokal. Details in
[`docs/datenmodell.md`](docs/datenmodell.md).

## Deployment

GitHub Pages liefert den Inhalt des Branches `main` direkt aus. Ein Push genügt; der neue
Stand ist nach ein paar Minuten sichtbar. `.nojekyll` sorgt dafür, dass die Dateien
unverändert ausgeliefert und nicht durch Jekyll gerendert werden — die Datei darf niemals
gelöscht werden. Siehe [`docs/deploy.md`](docs/deploy.md).
