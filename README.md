# Chillinal

Chilli + Journal: eine Web-App zum An- und Abgewöhnen von Gewohnheiten, mit Terminen.
Gebaut aus reinem HTML, CSS und Vanilla-JavaScript. Kein Framework, kein Build-Schritt im
Auslieferungspfad, keine externen Ressourcen, kein Konto, kein Server.

**Ausgeliefert werden zwei Dateien:** `index.html` — dort steht alles, von der Oberfläche
bis zur eingebetteten Schrift — und `sw.js`, ein Service Worker, der die App beiseitelegt,
damit sie offline startet.

**Live:** https://chillijust.github.io/

## Was sie kann — und was noch kommt

Gebaut wurde in acht Abschnitten nach dem Pflichtenheft
[`docs/chillinal-plan.md`](docs/chillinal-plan.md); alle acht sind fertig. Die App kann:
Gewohnheiten abhaken mit einem Tipp, eine **Stärke** statt eines zerbrechlichen
Serienzählers, «nie zweimal auslassen», Abgewöhnen mit «frei seit» und einer
10-Minuten-Welle gegen den Drang, Termine mit Monatskalender, Erinnerungen über einen
Kalender-Export, Heatmap, Journal, Sicherung, Timer und Zähler.

Alle Daten liegen ausschließlich im `localStorage` des Geräts.

## Auf dem iPhone installieren

1. https://chillijust.github.io/ in Safari öffnen
2. Teilen-Menü → **Zum Home-Bildschirm**

Wer schon Chillingo als Verknüpfung hatte, bekommt Chillinal über dessen Hinweis «Jetzt
laden». Name und Symbol der Verknüpfung ändern sich erst, wenn sie neu angelegt wird.

## Entwickeln

```sh
node tools/build.mjs              # Schriften, Chili, Symbol einbetten; Version stempeln
node tools/pruefen.mjs            # DOCTYPE, Fremdadressen, CSP, Syntax
node tools/pruefstand/lauf.mjs    # Prüfstand am echten DOM
```

Mehr in [`CLAUDE.md`](CLAUDE.md), [`docs/architektur.md`](docs/architektur.md) und
[`docs/deploy.md`](docs/deploy.md).

## An ChatGPT und andere Agenten

Willkommen. Bevor du etwas änderst, lies [`AGENTS.md`](AGENTS.md). Kurz: Du arbeitest auf
einem Branch `chatgpt/<thema>` und öffnest einen Pull Request gegen `main`. **Push nie auf
`main`**, denn dort geht alles sofort live. Claude prüft deinen PR und übernimmt ihn.

## Vorgänger

Chillingo, die App zum Russischlernen, ruht auf dem Branch
`backup/chillingo-2.11.2T-2026-10-04`.

## Lizenzen

Lora und Poppins stehen unter der SIL Open Font License 1.1 (`tools/schriften/`).
