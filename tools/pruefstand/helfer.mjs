// Gemeinsame Wege und Werkzeuge des Prüfstands.
//
// Keine Suite kennt einen absoluten Pfad. Der Prüfstand lag lange in einem
// Wegwerf-Verzeichnis und war mit dessen Container jedes Mal verloren; seitdem
// leitet sich jeder Weg aus dem Ort dieser Datei ab. Damit läuft er überall —
// auf einem Rechner, in einer Cloud-Sitzung, auf einem CI-Läufer.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

export const HIER = dirname(fileURLToPath(import.meta.url));
export const WURZEL = join(HIER, '..', '..');
export const APP = join(WURZEL, 'index.html');
// Hierhin schreiben die Suiten ihre Testseiten. Der Ordner ist wegwerfbar und
// steht in .gitignore.
export const BAU = join(HIER, 'bau');
mkdirSync(BAU, { recursive: true });

// Den Browser suchen statt ihn zu verdrahten. Playwright legt seine Browser
// unter PLAYWRIGHT_BROWSERS_PATH ab (so ist es in der Arbeitsumgebung), ein
// CI-Läufer bringt meist ein eigenes Chrome im Pfad mit.
export function chromiumFinden() {
  const kandidaten = [];
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (pw && existsSync(pw)) {
    // Das vollständige Chromium zuerst — die Kopfloshülle kann weniger.
    const ordner = readdirSync(pw).sort();
    ordner.filter((d) => d.startsWith('chromium-')).forEach((d) => {
      kandidaten.push(join(pw, d, 'chrome-linux', 'chrome'));
    });
    ordner.filter((d) => d.startsWith('chromium')).forEach((d) => {
      kandidaten.push(join(pw, d, 'chrome-linux', 'chrome'));
      kandidaten.push(join(pw, d, 'chrome-linux', 'headless_shell'));
    });
  }
  for (const pfad of kandidaten) if (existsSync(pfad)) return pfad;

  for (const name of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    try {
      const gefunden = execFileSync('which', [name], { encoding: 'utf8' }).trim();
      if (gefunden && existsSync(gefunden)) return gefunden;
    } catch (e) { /* nicht da, weiter */ }
  }
  return null;
}

// Eine Testseite ist die ausgelieferte App mit einem angehängten Skript. Es
// läuft nach einer kurzen Frist, damit der Startlauf der App durch ist, und
// schreibt sein Ergebnis in den Seitentitel — den liest der Läufer aus.
export function testseite(html, test) {
  const skript = '\n<script>\n' +
    'window.addEventListener("error", function (e) { document.title = "SEITENFEHLER: " + e.message; });\n' +
    'setTimeout(function () {' + test + '}, 150);\n' +
    '</scr' + 'ipt>\n';
  return html.replace('</body>', skript + '</body>');
}
