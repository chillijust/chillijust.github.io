#!/usr/bin/env node
// Vor-Push-Prüfung für index.html.
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

const fehler = [];
const hinweise = [];

// 1 · DOCTYPE in der ersten Zeile
if (!/^<!DOCTYPE html>\r?\n/i.test(html)) {
  fehler.push('index.html beginnt nicht mit <!DOCTYPE html> — Safari rendert sonst im Quirks-Mode.');
}

// 2 · kein YAML-Front-Matter (sonst behandelt Jekyll die Datei als Template)
if (/^---\r?\n/.test(html)) fehler.push('index.html beginnt mit YAML-Front-Matter.');

// 3 · .nojekyll vorhanden
if (!existsSync(join(ROOT, '.nojekyll'))) {
  fehler.push('.nojekyll fehlt — GitHub Pages würde die Dateien wieder durch Jekyll schicken.');
}

// 4 · keine externen Ressourcen
const extern = [...html.matchAll(/\b(?:src|href)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi)].map((m) => m[1]);
if (extern.length) fehler.push('Externe Ressourcen verlinkt: ' + extern.join(', '));
const fetches = [...html.matchAll(/\b(?:fetch|XMLHttpRequest|importScripts|EventSource|WebSocket)\s*\(/g)];
if (fetches.length) hinweise.push('Netzwerkaufrufe im Quelltext gefunden (' + fetches.length + ') — die App soll offline laufen.');

// 4b · genau eine erlaubte Fremdadresse: das Ticket-Ziel auf GitHub. Sie wird
// nicht geladen, sondern nur verlinkt — angetippt öffnet sie ein Formular.
const ERLAUBT = ['https://github.com/'];
const adressen = [...new Set([...html.matchAll(/https?:\/\/[^\s'"<>)]+/g)].map((m) => m[0]))];
const fremd = adressen.filter((a) => !ERLAUBT.some((e) => a.startsWith(e)));
if (fremd.length) {
  fehler.push('Unerwartete Fremdadressen im Quelltext: ' + fremd.join(', ') +
    ' — erlaubt ist nur ' + ERLAUBT.join(', ') + ' als antippbarer Verweis.');
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
  for (const pflicht of ["default-src 'none'", 'img-src data:']) {
    if (!csp[1].includes(pflicht)) fehler.push('Content-Security-Policy ohne «' + pflicht + '».');
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

// 9 · Datenblock und /data synchron
const marker = html.includes('/* == DATEN:START') && html.includes('/* == DATEN:ENDE == */');
if (!marker) fehler.push('Datenmarker in index.html fehlen — tools/build.mjs kann nicht greifen.');

console.log('index.html · ' + html.split('\n').length + ' Zeilen · ' + (html.length / 1024).toFixed(0) + ' KB');
hinweise.forEach((h) => console.log('Hinweis: ' + h));

if (fehler.length) {
  console.error('\nPrüfung fehlgeschlagen:\n' + fehler.map((f) => '  · ' + f).join('\n'));
  process.exit(1);
}
console.log('Prüfung bestanden.');
