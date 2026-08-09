// Vor jedem Push: bauen prüfen, Datei prüfen, Prüfstand fahren.
//
// Als Hook und nicht als Zeile in CLAUDE.md, weil eine Anweisung im Text darauf
// angewiesen ist, dass jemand daran denkt. Ein Hook läuft, ob gedacht wird oder
// nicht — und bricht ab, wenn etwas rot ist. Das ist der einzige Mechanismus,
// der auch dann greift, wenn die Aufmerksamkeit woanders liegt.
//
// Notausgang: Steht «PRUEFSTAND=aus» im Befehl, geht der Push ohne Prüfung
// durch. Ein Tor, das sich nie öffnen lässt, wird irgendwann eingetreten.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let eingabe = '';
try {
  eingabe = readFileSync(0, 'utf8');
} catch (e) { /* nichts angekommen — dann gibt es nichts zu prüfen */ }

let befehl = '';
try {
  befehl = (JSON.parse(eingabe).tool_input || {}).command || '';
} catch (e) {
  process.exit(0);   // Unverständliche Eingabe hält niemanden auf.
}

// Nur echte Pushes. «git push --dry-run» und «git push --help» sind keine.
if (!/\bgit\s+push\b/.test(befehl) || /--dry-run|--help/.test(befehl)) process.exit(0);
if (/PRUEFSTAND=aus/.test(befehl)) {
  console.error('Prüfstand übersprungen (PRUEFSTAND=aus).');
  process.exit(0);
}

const schritte = [
  ['Daten und index.html synchron', ['tools/build.mjs', '--check']],
  ['DOCTYPE, Fremdadressen, Syntax', ['tools/pruefen.mjs']],
  ['Prüfstand', ['tools/pruefstand/lauf.mjs', '-q']]
];

for (const [was, argumente] of schritte) {
  try {
    execFileSync('node', argumente, { cwd: WURZEL, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const ausgabe = ((e.stdout || '') + (e.stderr || '')).trim();
    console.error('Push angehalten — ' + was + ' ist rot.\n');
    console.error(ausgabe.split('\n').slice(-20).join('\n'));
    console.error('\nErst reparieren, dann erneut pushen. Muss es wirklich raus: ' +
      'PRUEFSTAND=aus vor den Befehl setzen.');
    process.exit(2);
  }
}
process.exit(0);
