#!/usr/bin/env node
// Bettet Schriften, Chili und App-Symbol in index.html ein und stempelt die
// Version in index.html und sw.js.
//
//   node tools/build.mjs            schreibt index.html und sw.js
//   node tools/build.mjs --check    prüft nur; Exit-Code 1, wenn eine der beiden
//                                   nicht dem Sollstand entspricht
//
// Reines Autorenwerkzeug — läuft nur lokal, nie im Auslieferungspfad.
// index.html bleibt jederzeit vollständig und eigenständig.
//
// Was eingebettet wird, und woher:
//
//   tools/schriften/*.woff2          @font-face-Block zwischen den SCHRIFTEN-Markern
//   docs/maskottchen-freigestellt.png  CHILI_BILD im Skript
//   docs/appsymbol-180.png           apple-touch-icon im <head> (tools/appsymbol.mjs)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'index.html');
const SW = join(ROOT, 'sw.js');
const START = '/* == SCHRIFTEN:START — generiert aus tools/schriften durch tools/build.mjs, nicht von Hand ändern == */';
const ENDE = '/* == SCHRIFTEN:ENDE == */';

const nurPruefen = process.argv.includes('--check');
const abbruch = (msg) => { console.error(msg); process.exit(1); };
const b64 = (pfad) => readFileSync(join(ROOT, pfad)).toString('base64');

// ── Schriften ──────────────────────────────────────────────────
// Lora für den Text, Poppins für Überschriften und Knöpfe — je die lateinische
// Teilmenge (Umlaute und ß sind darin). Lizenz: SIL OFL, liegt daneben.
// Die Schrift steckt in der Datei; zu laden gibt es nichts.
const SCHRIFTEN = [
  ['Lora', 400, 'normal', 'lora-latin-400-normal.woff2'],
  ['Lora', 400, 'italic', 'lora-latin-400-italic.woff2'],
  ['Lora', 600, 'normal', 'lora-latin-600-normal.woff2'],
  ['Poppins', 500, 'normal', 'poppins-latin-500-normal.woff2'],
  ['Poppins', 600, 'normal', 'poppins-latin-600-normal.woff2']
];
const block = START + '\n' + SCHRIFTEN.map(([familie, gewicht, stil, datei]) =>
  "@font-face { font-family: '" + familie + "'; font-style: " + stil + '; font-weight: ' + gewicht +
  "; font-display: swap; src: url(data:font/woff2;base64," + b64('tools/schriften/' + datei) +
  ") format('woff2'); }").join('\n') + '\n' + ENDE;

// ── Version ────────────────────────────────────────────────────
// Drei Zahlen; ein angehängtes T (auch T2, T3 …) heißt «noch nicht
// abgenommen». Es gehört in die Zahl, nicht daneben: Der Cache des Workers
// heißt nach der Version, und «0.1.0T» und «0.1.0» sollen zwei Stände sein.
const version = readFileSync(join(ROOT, 'VERSION'), 'utf8').trim();
if (!/^\d+\.\d+\.\d+(T\d*)?$/.test(version)) {
  abbruch('VERSION: erwartet drei Zahlen, etwa «1.0.0», dahinter darf ein «T» stehen. ' +
    'Dort steht «' + version + '».');
}
if (/T\d*$/.test(version)) {
  console.log('Hinweis: «' + version + '» ist eine Fassung zur Ansicht — das T fällt bei der Abnahme weg.');
}

const d = new Date();
const heute = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
  String(d.getDate()).padStart(2, '0');

// ── index.html ─────────────────────────────────────────────────
const html = readFileSync(HTML, 'utf8');
const von = html.indexOf(START);
const bis = html.indexOf(ENDE);
if (von === -1 || bis === -1 || bis < von) abbruch('index.html: SCHRIFTEN-Marker fehlen.');

const ersetze = (text, muster, neu, was) => {
  if (!muster.test(text)) abbruch('index.html: ' + was + ' nicht gefunden.');
  return text.replace(muster, () => neu);
};

let neu = html.slice(0, von) + block + html.slice(bis + ENDE.length);
neu = ersetze(neu, /var APP_VERSION = '[^']*';/, "var APP_VERSION = '" + version + "';", 'APP_VERSION');
neu = ersetze(neu, /var APP_STAND = '[^']*';/, "var APP_STAND = '" + heute + "';", 'APP_STAND');
neu = ersetze(neu, /var CHILI_BILD = '[^']*'; \/\* == CHILI == \*\//,
  "var CHILI_BILD = 'data:image/png;base64," + b64('docs/maskottchen-freigestellt.png') + "'; /* == CHILI == */",
  'CHILI_BILD');
neu = ersetze(neu, /<link rel="apple-touch-icon" href="[^"]*">/,
  '<link rel="apple-touch-icon" href="data:image/png;base64,' + b64('docs/appsymbol-180.png') + '">',
  'apple-touch-icon');

// ── sw.js ──────────────────────────────────────────────────────
// **Der Worker trägt dieselbe Version.** Sein Cache heißt danach — stünde dort
// eine alte Zahl, legte ein neuer Stand keinen neuen Speicher an.
const swAlt = readFileSync(SW, 'utf8');
if (!/var SW_VERSION = '[^']*'; \/\* == VERSION == \*\//.test(swAlt)) {
  abbruch('sw.js: SW_VERSION nicht gefunden — die Version kann nicht gestempelt werden.');
}
const swNeu = swAlt.replace(/var SW_VERSION = '[^']*';/, "var SW_VERSION = '" + version + "';");

// Der Stand allein ist kein Grund, «nicht auf Stand» zu melden: Er ändert sich
// jeden Tag von selbst. Verglichen wird darum ohne ihn.
const ohneStand = (t) => t.replace(/var APP_STAND = '[^']*';/, '');
const abweichungen = [];
if (ohneStand(neu) !== ohneStand(html)) abweichungen.push('index.html');
if (swNeu !== swAlt) abweichungen.push('sw.js');

if (nurPruefen) {
  if (abweichungen.length) {
    abbruch('Nicht auf Stand: ' + abweichungen.join(', ') + '\nBitte «node tools/build.mjs» ausführen.');
  }
  console.log('Alles auf Stand.');
} else {
  if (neu !== html) writeFileSync(HTML, neu);
  if (swNeu !== swAlt) writeFileSync(SW, swNeu);
  console.log(abweichungen.length ? 'Aktualisiert: ' + abweichungen.join(', ') : 'Keine Änderung nötig.');
}
console.log('Version ' + version + ' · index.html ' + Math.round(Buffer.byteLength(neu, 'utf8') / 1024) + ' KB');
