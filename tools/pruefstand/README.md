# Prüfstand

Die App ist eine einzelne HTML-Datei ohne Build und ohne Testwerkzeug. Geprüft wird sie
so, wie ein Gerät sie sieht: Die ausgelieferte Datei bekommt ein Skript angehängt, ein
kopfloser Browser lädt sie, das Skript prüft am **echten DOM** und schreibt sein Urteil in
den Seitentitel.

```sh
node tools/pruefstand/lauf.mjs              # alle Suiten
node tools/pruefstand/lauf.mjs thema menue  # nur diese
node tools/pruefstand/lauf.mjs -v           # auch jede grüne Suite einzeln nennen
```

Rückgabewert 0, wenn alles grün ist, sonst 1. `.claude/hooks/vor-dem-push.mjs` fährt ihn
vor jedem `git push` und hält den Push an, wenn etwas rot ist.

**Die Fallen** — was beim Schreiben einer Suite schon schiefging — stehen gesammelt in
`.claude/rules/pruefstand.md`.

## Aufbau

| | |
| --- | --- |
| `lauf.mjs` | der Läufer |
| `helfer.mjs` | Wege (`WURZEL`, `APP`, `BAU`), Browsersuche, `testseite()`, `suite()` |
| `bild.mjs` | Bildschirmfotos in Handybreite (430 × 932) |
| `suiten/*.mjs` | die Suiten — eine Datei, ein Thema; der Kopfkommentar sagt, was sie prüft |
| `bau/` | erzeugte Testseiten und Bilder, wegwerfbar (in `.gitignore`) |

Welche Suiten es gibt und was sie prüfen: `head -3 tools/pruefstand/suiten/*.mjs`.

Der Läufer liest `suiten/` selbst aus: **Eine neue Datei läuft ab sofort mit.** Sie muss
ihre Seite nach `bau/t-<dateiname>.html` schreiben; tut sie das nicht, meldet der Läufer
das als Fehler.

## Eine Suite schreiben

```js
// Einstellungen: der Knopf steht da und ist groß genug. (Kopfkommentar: was, warum, ADR)
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('meins', html, String.raw`
frisch();
zeige('einstellungen');
pruefe('A1 der Knopf steht da', !!q('#swKnopf'));
pruefe('A2 jeder Knopf ist groß genug', alle('#app button').every(function (b) {
  return b.getBoundingClientRect().height >= 44;
}));
`);
```

`suite()` stellt bereit: `pruefe(name, bedingung, extra)`, `q()`, `alle()`, `frisch()`
(Menü zu, Grundstand, Dashboard), `ausbewegt()` und `blobText()`. Gibt der Rumpf ein
Promise zurück, wird erst geurteilt, wenn es erfüllt ist.

Das Prüfskript läuft **im Gültigkeitsbereich der App**: `state`, `ANSICHTEN`, `zeige()`,
jede Funktion steht bereit, und Funktionen auf oberster Ebene lassen sich ersetzen
(`jetzt = function () { … }` stellt die Uhr).

Eine Prüfung **von außen** — etwa an `sw.js`, das unter `file://` nicht läuft — steht vor
dem `suite()`-Aufruf in Node und wirft bei einem Fehler (siehe `offline.mjs`).

## Bildschirmfotos

```sh
node tools/pruefstand/bild.mjs             # Dashboard, hell und dunkel
node tools/pruefstand/bild.mjs szenen.mjs  # eigene Szenen
```

Eine Szenendatei gibt ein Objekt zurück — Name auf Skript:

```js
export default {
  'menue': 'themaSetzen("hell"); menueOeffnen();',
  'einst-dunkel': 'themaSetzen("dunkel"); zeige("einstellungen");'
};
```

Als Modul erlaubt `schuss(namen, { ausschnitt: '.willkommen' })` einen Ausschnitt. Die
Überbreite wird bei jedem Bild gemeldet; sie muss 0 sein.
