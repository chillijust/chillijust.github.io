# Prüfstand

Die App wird nicht gebaut, hat keine Module und kein Testwerkzeug — sie ist eine
einzelne HTML-Datei. Geprüft wird sie darum so, wie ein Gerät sie sieht: Die
ausgelieferte Datei bekommt ein Skript angehängt, ein kopfloser Browser lädt
sie, das Skript prüft am **echten DOM** und schreibt sein Urteil in den
Seitentitel.

```sh
node tools/pruefstand/lauf.mjs              # alle Suiten (~16 s)
node tools/pruefstand/lauf.mjs jubel flammen  # nur diese
node tools/pruefstand/lauf.mjs -v           # auch jede grüne Suite einzeln nennen
```

Der Rückgabewert ist 0, wenn alles grün ist, sonst 1. Ein Hook
(`.claude/hooks/vor-dem-push.mjs`) fährt ihn vor jedem `git push` und hält den
Push an, wenn etwas rot ist.

## Aufbau

| | |
| --- | --- |
| `lauf.mjs` | der Läufer |
| `helfer.mjs` | Wege (`WURZEL`, `APP`, `BAU`), Browsersuche |
| `bild.mjs` | Bildschirmfotos in Handybreite (430 × 932) |
| `suiten/*.mjs` | die Suiten — eine Datei, ein Thema |
| `bau/` | erzeugte Testseiten und Bilder, wegwerfbar (in `.gitignore`) |

Der Läufer liest `suiten/` selbst aus: **Eine neue Datei läuft ab sofort mit.**
Sie muss ihre Seite nach `bau/t-<dateiname>.html` schreiben; tut sie das nicht,
meldet der Läufer das als Fehler statt sie zu übergehen.

## Eine Suite schreiben

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('lernsets');
  pruefe('A1 die Aufgabe steht da', !!q('.card'));
} catch (e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + (e.stack || '').split('\n')[1]);
}

var pre = document.createElement('pre');
pre.id = 'testlog';
pre.textContent = log.join('\n');
document.body.appendChild(pre);
var f = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
document.title = f.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + f.length;
`;

writeFileSync(BAU + '/t-meins.html', testseite(html, test));
```

Das Prüfskript läuft **im Gültigkeitsbereich der App**: `state`, `LERNSETS`,
`setTab()`, jede Funktion steht bereit. `String.raw` verhindert, dass Node die
Fluchtzeichen frisst, bevor der Browser sie sieht.

## Regeln, die aus Schaden entstanden sind

- **Keine Prüfung in einem `if`, dessen Bedingung ausgelost wird.** Die
  Aufgabenform wechselt zufällig; stand eine Prüfung in `if (uebQ.mode !== 'tiles')`,
  lief sie mal und mal nicht — und die Zahl der Prüfungen schwankte still von
  Lauf zu Lauf. Stattdessen weiterblättern, bis die gewünschte Form kommt, und
  das Erreichen selbst prüfen. Zweimal passiert (`funktionstest`, `meister`).
- **Die Zahl im Titel ist ein Messwert.** Sinkt sie ohne Grund, ist eine Prüfung
  verschwunden, nicht bestanden.
- **Ein grüner Lauf muss 0 zurückgeben.** Der Vorgänger hängte den Rückgabewert
  an ein `grep`, das bei vollständigem Erfolg nichts fand — und meldete Erfolg
  als Fehlschlag.
- **Nichts einspritzen, was die App selbst setzt.** Der alte Bildhelfer setzte
  eine dunkle Palette von Hand nach, aus der Zeit vor ADR 0039. Nach ADR 0041
  zeigte er still die alten Farben. `bild.mjs` rendert die Datei, wie sie
  ausgeliefert wird.
- **Kein Backtick im Prüfskript.** Es steckt in einem `String.raw`-Template;
  ein Backtick beendet es mitten im Satz. Auch nicht in Kommentaren — dort
  liest es sich harmlos und bricht trotzdem die Datei.
- **Kein `$&` im Prüfskript** — und kein `` $` ``, `$'` oder `$1`. Die Seite
  entsteht über `String.replace`, und dort sind das Steuerzeichen: Ein
  `'\$&'`, wie man es zum Maskieren eines regulären Ausdrucks schreibt, wurde
  stillschweigend zu `</body>`, und das Skript war danach kein gültiges
  JavaScript mehr. `testseite()` in `helfer.mjs` setzt darum eine Funktion als
  Ersatz ein und ist immun; wer die Seite von Hand zusammenbaut, tritt wieder
  hinein. **Also immer `testseite(html, test)` benutzen.**

## Bildschirmfotos

```sh
node tools/pruefstand/bild.mjs             # Home und ein Lernset
node tools/pruefstand/bild.mjs szenen.mjs  # eigene Szenen
```

Eine Szenendatei gibt ein Objekt zurück — Name auf Skript:

```js
export default {
  'abc-voll': 'ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; }); ' +
    'abcAnsicht = "ueben"; abcQ = null; setTab("buchstaben");',
  'hell': 'state.settings.schema = "classic"; updateDarstellung(); render();'
};
```

Als Modul erlaubt `schuss(namen, { ausschnitt: '.paket' })` einen Ausschnitt —
nützlich, um eine einzelne Reihe groß anzusehen. Die Überbreite wird bei jedem
Bild gemeldet; sie muss 0 sein.
