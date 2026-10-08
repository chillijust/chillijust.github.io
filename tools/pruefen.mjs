#!/usr/bin/env node
// Vor-Push-Prüfung für index.html **und sw.js** — Chillinal.
//
//   node tools/pruefen.mjs
//
// Prüft die Punkte, an denen dieses Projekt in der Vergangenheit gescheitert ist:
// fehlendes DOCTYPE (Quirks-Mode in Safari), Jekyll-Front-Matter, externe
// Ressourcen, kaputte JavaScript-Syntax und ein fehlendes .nojekyll.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
// Die zweite Datei im Auslieferungspfad (ADR 0001). Sie bekommt dieselben
// Regeln — nur die eine, die für sie sinnlos wäre, nicht: `fetch` ist im
// Service Worker der Zweck, nicht der Verstoß.
const SW_PFAD = join(ROOT, 'sw.js');
const sw = existsSync(SW_PFAD) ? readFileSync(SW_PFAD, 'utf8') : null;

const fehler = [];
const hinweise = [];

// 1 · DOCTYPE in der ersten Zeile
if (!/^<!DOCTYPE html>\r?\n/i.test(html)) {
  fehler.push('index.html beginnt nicht mit <!DOCTYPE html> — Safari rendert sonst im Quirks-Mode.');
}

// 2 · kein YAML-Front-Matter (sonst behandelt Jekyll die Datei als Template)
if (/^---\r?\n/.test(html)) fehler.push('index.html beginnt mit YAML-Front-Matter.');

// 2b · Größe (ADR 0046). Die Datei wächst um etwa 25 KB je Fassung. Ab GROESSE_HINWEIS
// sagt es der Push, ab GROESSE_HALT hält er an — dann ist zu entscheiden: aufräumen,
// auf Quelldateien umstellen, die build.mjs zusammensetzt, oder die Schwelle bewußt
// anheben. Anheben ist eine Entscheidung des Nutzers, keine Reparatur.
const GROESSE_HINWEIS = 600 * 1024;
const GROESSE_HALT = 800 * 1024;
const groesse = Buffer.byteLength(html, 'utf8');
const kb = (n) => Math.round(n / 1024) + ' KB';
if (groesse > GROESSE_HALT) {
  fehler.push('index.html hat ' + kb(groesse) + ', die Grenze ist ' + kb(GROESSE_HALT) +
    ' (ADR 0046). Nicht still anheben — den Nutzer fragen.');
} else if (groesse > GROESSE_HINWEIS) {
  hinweise.push('index.html hat ' + kb(groesse) + ' — über ' + kb(GROESSE_HINWEIS) +
    ', Halt bei ' + kb(GROESSE_HALT) + ' (ADR 0046). Dem Nutzer sagen.');
}

// 3 · .nojekyll vorhanden
if (!existsSync(join(ROOT, '.nojekyll'))) {
  fehler.push('.nojekyll fehlt — GitHub Pages würde die Dateien wieder durch Jekyll schicken.');
}

// 4 · keine externen Ressourcen
const extern = [...html.matchAll(/\b(?:src|href)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi)].map((m) => m[1]);
if (extern.length) fehler.push('Externe Ressourcen verlinkt: ' + extern.join(', '));
const fetches = [...html.matchAll(/\b(?:fetch|XMLHttpRequest|importScripts|EventSource|WebSocket)\s*\(/g)];
if (fetches.length) hinweise.push('Netzwerkaufrufe im Quelltext gefunden (' + fetches.length + ') — die App soll offline laufen.');

// 4b · gar keine Fremdadresse. Die App verweist nirgendwohin und lädt nichts;
// Tickets werden kopiert, nicht verschickt, der Kalender-Export ist eine Datei.
const adressen = [...new Set([...html.matchAll(/https?:\/\/[^\s'"<>)]+/g)].map((m) => m[0]))];
if (adressen.length) {
  fehler.push('Fremdadressen im Quelltext: ' + adressen.join(', ') +
    ' — die Datei soll ohne jede Aussenverbindung auskommen.');
}

// 4c · Kein Zugangsschlüssel in der Datei. Sie ist öffentlich lesbar; ein
// Token, ein Passwort oder ein Schlüssel hätte hier nichts verloren.
const geheim = [...html.matchAll(/\b(gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|Authorization\s*:|Bearer\s+[A-Za-z0-9._-]{16,})/g)]
  .map((m) => m[1]);
if (geheim.length) {
  fehler.push('Sieht nach einem Zugangsschlüssel aus: ' + [...new Set(geheim)].join(', ') +
    ' — in einer öffentlich lesbaren Datei darf kein Geheimnis stehen.');
}

// 4d · Die Content-Security-Policy macht die Regel für den Browser erzwingbar.
// Der Inhalt trägt selbst einfache Anführungszeichen ('none'), darum wird bis
// zum schließenden doppelten gelesen.
const csp = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i.exec(html);
if (!csp) {
  fehler.push('Content-Security-Policy fehlt — ohne sie ist «keine externen Ressourcen» nur eine Absprache.');
} else {
  for (const pflicht of ["default-src 'none'", 'img-src data:', 'font-src data:']) {
    if (!csp[1].includes(pflicht)) fehler.push('Content-Security-Policy ohne «' + pflicht + '».');
  }
  // **Die eine benannte Ausnahme.** Ohne sie ließe sich der Service Worker
  // nicht anmelden; mehr als 'self' darf sie nie werden.
  if (/connect-src/.test(csp[1])) {
    fehler.push('Content-Security-Policy mit connect-src — die Seite baut keine Verbindung auf.');
  }
  if (sw && !csp[1].includes("worker-src 'self'")) {
    fehler.push("Content-Security-Policy ohne «worker-src 'self'» — sw.js ließe sich " +
      'nicht anmelden.');
  }
  const offen = csp[1].match(/(?:worker|script|connect|img|style|font|frame)-src[^;]*/g) || [];
  const fremd = offen.filter((teil) => /https?:|\*/.test(teil));
  if (fremd.length) {
    fehler.push('Content-Security-Policy lässt Fremdes zu: ' + fremd.join(' · '));
  }
}

// 4e · sw.js an derselben Leine. Er läuft auf derselben Domain und darf
// genauso wenig nach draußen greifen wie die App selbst.
if (sw) {
  const swAdressen = [...new Set([...sw.matchAll(/https?:\/\/[^\s'"<>)]+/g)].map((m) => m[0]))];
  if (swAdressen.length) {
    fehler.push('Fremdadressen in sw.js: ' + swAdressen.join(', ') +
      ' — auch der Service Worker greift nirgendwohin.');
  }
  if (/\bimportScripts\s*\(/.test(sw)) {
    fehler.push('sw.js lädt mit importScripts nach — der Auslieferungspfad bleibt bei zwei Dateien.');
  }
  const swGeheim = [...sw.matchAll(/\b(gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|Authorization\s*:|Bearer\s+[A-Za-z0-9._-]{16,})/g)];
  if (swGeheim.length) {
    fehler.push('Sieht in sw.js nach einem Zugangsschlüssel aus — auch diese Datei ist öffentlich.');
  }
  if (!/var SW_VERSION = '\d+\.\d+\.\d+(T\d*)?'; \/\* == VERSION == \*\//.test(sw)) {
    fehler.push('sw.js ohne gestempelte SW_VERSION — «node tools/build.mjs» setzt sie.');
  }
  // **Der Cache muss die Version im Namen tragen.** Sonst legt ein neuer Stand
  // keinen neuen Speicher an, und der alte bliebe für immer liegen.
  if (!/CACHE\s*=\s*'[^']*'\s*\+\s*SW_VERSION/.test(sw)) {
    fehler.push('sw.js: der Cache-Name führt die Version nicht mit — ein neuer Stand ' +
      'käme dann nie beim Nutzer an.');
  }
  // Ohne Ausgang wäre ein verschluckter Worker auf dem Telefon nicht zu retten.
  if (!/swAufraeumen/.test(html)) {
    fehler.push('Der Notausgang fehlt: index.html kennt kein swAufraeumen().');
  }
}

// 5 · keine Zeichen aus dem Emoji-Bereich (iOS rendert sie als farbige Grafik)
const emoji = [...html.matchAll(/[☀-➿⬀-⯿️]|[\u{1F000}-\u{1FAFF}]/gu)]
  .map((m) => m[0] + ' (U+' + m[0].codePointAt(0).toString(16).toUpperCase() + ')');
if (emoji.length) {
  fehler.push('Emoji-Zeichen gefunden: ' + [...new Set(emoji)].join(', ') +
    ' — stattdessen Inline-SVG verwenden (siehe ICON in index.html).');
}

// 6 · genau ein <script>-Block, Syntax gültig
const skripte = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if (skripte.length !== 1) {
  fehler.push('Erwartet genau einen <script>-Block, gefunden: ' + skripte.length + '.');
} else {
  try {
    new Function(skripte[0][1]);
  } catch (e) {
    fehler.push('JavaScript-Syntaxfehler: ' + e.message);
  }
  if (!/^\s*'use strict';/m.test(skripte[0][1])) hinweise.push("'use strict' fehlt im Skriptblock.");
}

// 7 · localStorage nur abgesichert
const zugriffe = [...html.matchAll(/localStorage\s*\.\s*\w+/g)].length;
const tryBloecke = [...html.matchAll(/try\s*\{[\s\S]{0,400}?localStorage/g)].length;
if (zugriffe > tryBloecke) {
  hinweise.push('localStorage-Zugriffe (' + zugriffe + ') ohne erkennbares try/catch (' + tryBloecke + ') — im privaten Modus wirft Safari.');
}

// 8 · Stand der Datei vorhanden (geht in jedes Ticket ein)
if (!/var APP_STAND = '\d{4}-\d{2}-\d{2}';/.test(html)) {
  hinweise.push('APP_STAND fehlt oder hat kein Datumsformat — «node tools/build.mjs» setzt ihn.');
}

// 9 · Eingebettetes vorhanden und von build.mjs gesetzt
if (!html.includes('/* == SCHRIFTEN:START') || !html.includes('/* == SCHRIFTEN:ENDE == */')) {
  fehler.push('Schriftmarker in index.html fehlen — tools/build.mjs kann nicht greifen.');
}
if (!/<link rel="apple-touch-icon" href="data:image\/png;base64,/.test(html)) {
  fehler.push('Das App-Symbol fehlt — «node tools/build.mjs» bettet es ein.');
}
if (!/var CHILI_BILD = 'data:image\/png;base64,/.test(html)) {
  fehler.push('Die Chili fehlt — «node tools/build.mjs» bettet sie ein.');
}

// 10 · Chillingos Lernstand bleibt liegen (ADR 0001). Sein Schlüssel kommt im
// Quelltext nicht vor, und geleert wird der Speicher nie im Ganzen.
if (/russisch_trainer_v1/.test(html)) {
  fehler.push('index.html nennt «russisch_trainer_v1» — Chillingos Lernstand wird nicht angefasst.');
}
if (/localStorage\s*\.\s*clear\s*\(/.test(html)) {
  fehler.push('localStorage.clear() gefunden — das löschte auch Chillingos Lernstand.');
}

console.log('index.html · ' + html.split('\n').length + ' Zeilen · ' + kb(groesse));
if (sw) console.log('sw.js · ' + sw.split('\n').length + ' Zeilen · ' + (sw.length / 1024).toFixed(1) + ' KB');
hinweise.forEach((h) => console.log('Hinweis: ' + h));

if (fehler.length) {
  console.error('\nPrüfung fehlgeschlagen:\n' + fehler.map((f) => '  · ' + f).join('\n'));
  process.exit(1);
}
console.log('Prüfung bestanden.');
