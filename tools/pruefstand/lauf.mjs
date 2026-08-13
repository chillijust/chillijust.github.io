// Der Läufer.
//
//   node tools/pruefstand/lauf.mjs              alle Suiten
//   node tools/pruefstand/lauf.mjs jubel flammen  nur diese
//   node tools/pruefstand/lauf.mjs -q           nur die Zusammenfassung und was rot ist
//
// Jede Suite ist ein Skript, das eine Testseite nach `bau/t-<name>.html`
// schreibt. Der Läufer fährt sie kopflos an und liest den Seitentitel: «ALLE n
// TESTS BESTANDEN» oder etwas anderes.
//
// Der Rückgabewert sagt genau eines: Ist etwas rot? Er hängt nicht daran, ob
// zufällig ein Filter etwas gefunden hat — das war einmal die Ursache dafür,
// dass ein vollständig grüner Lauf als «fehlgeschlagen» dastand.

import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { HIER, BAU, chromiumFinden } from './helfer.mjs';

const SUITEN_ORDNER = join(HIER, 'suiten');

const argumente = process.argv.slice(2);
const leise = argumente.includes('-q');
const gewaehlt = argumente.filter((a) => a !== '-q');

// Alle Suiten, oder die genannten. Eine neue Datei in `suiten/` wird von selbst
// mitgenommen — eine Liste, die man pflegen muss, wird irgendwann vergessen.
const alle = readdirSync(SUITEN_ORDNER)
  .filter((d) => d.endsWith('.mjs'))
  .map((d) => d.slice(0, -4))
  .sort();
const suiten = gewaehlt.length ? gewaehlt : alle;

const chrome = chromiumFinden();
if (!chrome) {
  console.error('Kein Chromium gefunden. Erwartet unter PLAYWRIGHT_BROWSERS_PATH ' +
    'oder als chromium/google-chrome im Pfad.');
  process.exit(2);
}

let gruen = 0;
let rot = 0;
let pruefungen = 0;
const kaputt = [];

for (const name of suiten) {
  const quelle = join(SUITEN_ORDNER, name + '.mjs');
  if (!existsSync(quelle)) {
    console.log(`=== ${name} === KEINE SUITE (suiten/${name}.mjs fehlt)`);
    rot++; kaputt.push(name);
    continue;
  }

  // Die Seite frisch bauen. Bricht das schon ab, ist die Suite selbst kaputt —
  // ein Fehler wie jeder andere, der nicht stillschweigend durchgehen darf.
  const seite = join(BAU, 't-' + name + '.html');
  if (existsSync(seite)) rmSync(seite);
  // Beim Bauen erzählen manche Suiten, was sie gefunden haben. Das gehört nicht
  // in eine Zusammenfassung, wohl aber in eine Fehlersuche — also auffangen und
  // nur zeigen, wenn etwas schiefgeht.
  const gesagt = [];
  const echt = console.log;
  console.log = (...t) => gesagt.push(t.join(' '));
  try {
    await import(pathToFileURL(quelle).href + '?frisch=' + Date.now());
  } catch (e) {
    console.log = echt;
    console.log(`=== ${name} === SUITE BRICHT AB`);
    gesagt.forEach((z) => console.log('    ' + z));
    console.log('    ' + String(e.message).split('\n')[0]);
    rot++; kaputt.push(name);
    continue;
  }
  console.log = echt;
  if (!existsSync(seite)) {
    console.log(`=== ${name} === SCHREIBT KEINE SEITE (erwartet bau/t-${name}.html)`);
    rot++; kaputt.push(name);
    continue;
  }

  let dom = '';
  try {
    // **Im Format des Zielgeräts**, nicht in dem, was der kopflose Browser von
    // sich aus nimmt. Alles, was Lagen misst — der Scheinwerfer des Tutorials,
    // die Flammenreihe, die Trefferflächen —, prüfte sonst einen Bildschirm,
    // den niemand hat, und wäre auf dem echten Gerät trotzdem falsch.
    dom = execFileSync(chrome, ['--headless', '--disable-gpu', '--no-sandbox',
      '--window-size=430,932', '--virtual-time-budget=10000',
      '--dump-dom', pathToFileURL(seite).href],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    dom = e.stdout || '';
  }
  const titel = (dom.match(/<title>([^<]*)<\/title>/) || [])[1] || '';

  if (titel.startsWith('ALLE')) {
    gruen++;
    pruefungen += parseInt(titel.replace(/\D/g, ''), 10) || 0;
    if (!leise) console.log(`=== ${name} === ${titel}`);
  } else {
    rot++; kaputt.push(name);
    console.log(`=== ${name} === ${titel || 'KEIN ERGEBNIS'}`);
    // Das Protokoll steht als Text in einem <pre>, eine Prüfung je Zeile. Also
    // an Zeilenumbrüchen **und** an spitzen Klammern trennen — sonst klebt die
    // erste Prüfung am Tag davor und keine Zeile fängt mit «FAIL» an.
    dom.split(/[<\n]/).filter((z) => /^(FAIL|AUSNAHME)/.test(z))
      .slice(0, 10).forEach((z) => console.log('    ' + z.trim()));
    gesagt.forEach((z) => console.log('    · ' + z));
  }
}

console.log(`--- ${gruen} grün (${pruefungen} Prüfungen) · ${rot} rot` +
  (kaputt.length ? ' · ' + kaputt.join(' ') : ''));
process.exit(rot === 0 ? 0 : 1);
