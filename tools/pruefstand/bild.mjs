// Die Augenprüfung: Bildschirmfotos in Handybreite.
//
//   node tools/pruefstand/bild.mjs                  Home und eine Übung
//   node tools/pruefstand/bild.mjs szenen.mjs       eigene Szenen
//
// Eine Szene ist ein Name und ein Stück Skript, das nach dem Laden läuft:
//
//   export default {
//     'lernsets': 'uebAuswahl = 0; setTab("lernsets"); uebNext(true);',
//     'hell':     'state.settings.schema = "classic"; updateDarstellung(); render();'
//   };
//
// **Hier wird nichts eingespritzt.** Die Seite rendert so, wie sie ausgeliefert
// wird. Der Vorgänger setzte eine dunkle Palette von Hand nach — aus der Zeit,
// als «Dark» noch an `prefers-color-scheme` hing. Seit ADR 0039 ist «Dark» die
// Vorgabe im `:root`, und die eingespritzten Werte waren still veraltet: Die
// Bilder zeigten monatelang die Palette von vor ADR 0041.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { APP, BAU, chromiumFinden } from './helfer.mjs';

// iPhone 15 Pro Max — das Zielgerät.
export const GERAET = { width: 430, height: 932 };

// Eine Szene als Seite ablegen. Das Skript läuft nach einer kurzen Frist,
// damit der Startlauf der App durch ist.
export function baue(name, code) {
  const html = readFileSync(APP, 'utf8');
  const skript = code
    ? '\n<script>setTimeout(function () { try {' + code +
      '} catch (e) { document.title = "FEHLER: " + e.message; } }, 150);</scr' + 'ipt>\n'
    : '';
  const ziel = join(BAU, 'b-' + name + '.html');
  writeFileSync(ziel, html.replace('</body>', skript + '</body>'));
  return ziel;
}

async function playwright() {
  for (const wo of ['playwright', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    try { return await import(wo); } catch (e) { /* weiter */ }
  }
  throw new Error('Playwright nicht gefunden — Bildschirmfotos brauchen es, der Prüfstand nicht.');
}

// Von jeder gebauten Szene ein Bild. `ausschnitt` schneidet auf ein Element zu
// (etwa '.paket'), sonst kommt die ganze Seite.
export async function schuss(namen, opt = {}) {
  const { chromium } = await playwright();
  const browser = await chromium.launch({
    executablePath: chromiumFinden() || undefined,
    args: ['--no-sandbox']
  });
  const ctx = await browser.newContext({
    viewport: GERAET, deviceScaleFactor: opt.schaerfe || 2, isMobile: true, hasTouch: true
  });
  const bilder = [];
  for (const name of namen) {
    const seite = await ctx.newPage();
    await seite.goto(pathToFileURL(join(BAU, 'b-' + name + '.html')).href);
    await seite.waitForTimeout(opt.warten || 600);
    // Waagerecht darf nichts überstehen — das ist auf einem Handy ein Fehler.
    const ueber = await seite.evaluate(() =>
      document.documentElement.scrollWidth - window.innerWidth);
    const titel = await seite.title();
    const ziel = join(BAU, 'b-' + name + '.png');
    if (opt.ausschnitt) {
      const el = await seite.$(opt.ausschnitt);
      if (!el) throw new Error('Ausschnitt «' + opt.ausschnitt + '» nicht gefunden in ' + name);
      await el.screenshot({ path: ziel });
    } else {
      await seite.screenshot({ path: ziel });
    }
    console.log(name + ': Überbreite ' + ueber + (titel.startsWith('FEHLER') ? ' · ' + titel : ''));
    bilder.push(ziel);
    await seite.close();
  }
  await browser.close();
  return bilder;
}

// Bauen und schießen in einem.
export async function zeigen(szenen, opt) {
  const namen = Object.keys(szenen);
  namen.forEach((n) => baue(n, szenen[n]));
  return schuss(namen, opt);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const datei = process.argv[2];
  const szenen = datei
    ? (await import(pathToFileURL(resolve(datei)).href)).default
    : {
      'home': '',
      'lernsets': 'ALL_VOCAB.slice(0, 40).forEach(function (v) { state.boxes[v.id] = 2; }); ' +
        'uebAuswahl = 0; setTab("lernsets"); uebNext(true);'
    };
  const bilder = await zeigen(szenen);
  bilder.forEach((b) => console.log(b));
}
