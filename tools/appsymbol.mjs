#!/usr/bin/env node
// Baut das App-Symbol: die Chili auf Elfenbein, daneben ein Haken.
//
//   node tools/appsymbol.mjs
//
// Gezeichnet wird als SVG, gerendert im kopflosen Chromium — keine
// Bildbibliothek, kein Python. Heraus kommen zwei Dateien:
//
//   docs/appsymbol-180.png    das ausgelieferte Symbol; tools/build.mjs bettet
//                             es als Daten-URI in den <head> von index.html
//   docs/appsymbol-1024.png   zum Nachsehen in voller Größe
//
// iOS liest `apple-touch-icon` einmal, beim Anlegen der Verknüpfung, und rundet
// die Ecken selbst. Darum hier ein volles Quadrat ohne Rundung und ohne
// Transparenz — ein durchsichtiger Rand würde auf dem Gerät schwarz.
//
// Reines Autorenwerkzeug, braucht Playwright. Der Prüfstand braucht es nicht.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromiumFinden } from './pruefstand/helfer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const chili = readFileSync(join(ROOT, 'docs', 'maskottchen-freigestellt.png')).toString('base64');

// Die Farben aus dem Pflichtenheft: Grund Elfenbein, Haken im Grün für
// «erledigt». Die Chili steht etwas links der Mitte, damit der Haken Platz hat
// und das Ganze trotzdem ruhig wirkt.
const GRUND = '#FAF9F5';
const ERLEDIGT = '#788C5D';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="${GRUND}"/>
  <image href="data:image/png;base64,${chili}" x="150" y="190" width="660" height="660"/>
  <g transform="translate(772 268)">
    <circle r="124" fill="${ERLEDIGT}"/>
    <path d="M-58 4 L-16 46 L62 -40" fill="none" stroke="${GRUND}" stroke-width="34"
      stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

async function playwright() {
  for (const wo of ['playwright', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    try { return await import(wo); } catch (e) { /* weiter */ }
  }
  throw new Error('Playwright nicht gefunden — das Symbol braucht es.');
}

const { chromium } = await playwright();
const browser = await chromium.launch({ executablePath: chromiumFinden() || undefined, args: ['--no-sandbox'] });
for (const groesse of [1024, 180]) {
  const seite = await browser.newPage({ viewport: { width: groesse, height: groesse }, deviceScaleFactor: 1 });
  await seite.setContent('<!DOCTYPE html><html><body style="margin:0">' +
    svg.replace('width="1024" height="1024"', `width="${groesse}" height="${groesse}"`) +
    '</body></html>');
  await seite.waitForTimeout(200);
  const bild = await seite.screenshot({ clip: { x: 0, y: 0, width: groesse, height: groesse } });
  const ziel = join(ROOT, 'docs', 'appsymbol-' + groesse + '.png');
  writeFileSync(ziel, bild);
  console.log(ziel + ' · ' + (bild.length / 1024).toFixed(1) + ' KB');
  await seite.close();
}
await browser.close();
