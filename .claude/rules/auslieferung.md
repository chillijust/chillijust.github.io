---
paths:
  - "sw.js"
  - "VERSION"
  - "tools/build.mjs"
  - "tools/appsymbol.mjs"
  - "docs/deploy.md"
---

# Auslieferung · Chillinal

Gilt für Service Worker, Version und Eingebettetes. Ausführlich in `docs/deploy.md`.

## Service Worker (`sw.js`)

- **Er liefert, was er gespeichert hat** — aus dem Speicher sofort, im Hintergrund
  nachsehen. Er tut nichts anderes, als die App beiseitezulegen.
- **Der Cache heißt nach der Version** (`chillinal-<Version>`). Wer den Namen von der
  Version entkoppelt, liefert für immer den alten Stand aus. `build.mjs` stempelt
  `SW_VERSION`; `pruefen.mjs` und die Suite `offline` brechen bei Abweichung ab.
- **Kein `skipWaiting` beim Einrichten.** Der neue Worker wartet auf «Jetzt laden» oder den
  Knopf in den Einstellungen.
- **Die Nachrichten `version` und `uebernehmen` bleiben, wie sie sind** — Chillingos
  Wortschatz; nur über ihn kam Chillinal aufs Gerät.
- **Ohne Netz kommt kein Urteil**: «Nach Aktualisierung suchen» meldet dann «Kein Netz»,
  nie «Aktuell». **`update()` ist fertig, bevor die neue Fassung wartet.**
- Notausgang «App neu einrichten» (Einstellungen): meldet den Worker ab, leert dessen
  Speicher, lädt neu — die Daten in `localStorage` bleiben.
- `sw.js` lädt nichts nach (`importScripts` verboten) und kennt keine Fremdadresse —
  `pruefen.mjs` prüft es.

## Version

- **Nur in `VERSION` von Hand.** `node tools/build.mjs` stempelt `APP_VERSION`,
  `SW_VERSION` und `APP_STAND`; `--check` vergleicht nur.
- Erste Ziffer: gespeicherte Daten werden anders gelesen. Zweite: etwas kommt dazu.
  Dritte: alles Übrige.
- **Ein angehängtes `T` heißt «noch nicht abgenommen»** (`0.14.0T`) und gehört in die Zahl,
  weil der Cache nach ihr heißt. Zweite Nachbesserung an derselben angesagten Fassung:
  `0.14.0T2`. Fällt das T weg, ist die Fassung freigegeben.

## Eingebettetes und Symbol

- Schriftblock (`SCHRIFTEN:START` … `SCHRIFTEN:ENDE`), `CHILI_BILD` und `apple-touch-icon`
  setzt nur `tools/build.mjs`. Wer das Symbol ändert, fährt erst `node tools/appsymbol.mjs`,
  dann `node tools/build.mjs`.
- **iOS liest das App-Symbol nur beim Anlegen der Verknüpfung.** Ein neues Symbol sieht
  man erst, wenn die Verknüpfung neu angelegt wird.
