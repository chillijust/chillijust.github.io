// Gemeinsame Wege und Werkzeuge des Prüfstands.
//
// Keine Suite kennt einen absoluten Pfad. Der Prüfstand lag lange in einem
// Wegwerf-Verzeichnis und war mit dessen Container jedes Mal verloren; seitdem
// leitet sich jeder Weg aus dem Ort dieser Datei ab. Damit läuft er überall —
// auf einem Rechner, in einer Cloud-Sitzung, auf einem CI-Läufer.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
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
//
// **Der Ersatz ist eine Funktion, keine Zeichenkette.** In einem
// Ersatz-*Text* sind `$&`, `` $` ``, `$'` und `$1` Steuerzeichen: `String
// .replace` setzt dort das Gefundene ein. Ein Prüfskript, das irgendwo `$&`
// enthält — etwa in `'\$&'` beim Maskieren eines regulären Ausdrucks —, bekam
// an dieser Stelle stillschweigend `</body>` untergeschoben und war danach
// kein gültiges JavaScript mehr. Eine Funktion kennt diese Zeichen nicht.
export function testseite(html, test) {
  const skript = '\n<script>\n' +
    'window.addEventListener("error", function (e) { document.title = "SEITENFEHLER: " + e.message; });\n' +
    'setTimeout(function () {' + test + '}, 150);\n' +
    '</scr' + 'ipt>\n';
  return html.replace('</body>', function () { return skript + '</body>'; });
}

// **Eine Suite in einem Zug**: Die Prüfhilfen stehen bereit, das Urteil landet
// im Titel, eine Ausnahme wird gemeldet statt verschluckt. Der Rumpf darf ein
// Promise zurückgeben — dann wird erst geurteilt, wenn es erfüllt ist (etwa
// nach document.fonts.ready).
//
// Im Rumpf bereit: pruefe(name, bedingung, extra) · q(selektor) · alle(selektor)
// · frisch() setzt die App auf den Anfang zurück.
// · ausbewegt() bringt laufende Animationen ans Ziel, bevor gemessen wird.
// · blobText(b) liest einen Blob ohne Wartezeit.
export function suite(name, html, rumpf) {
  const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e !== undefined && e !== '' ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
// Laufende Bewegungen ans Ziel bringen — wer Lage und Größe mißt, fragt das
// Ziel, nicht den Weg (ADR 0007). Endlose (die wippende Chili) bleiben.
function ausbewegt() {
  if (!document.getAnimations) return;
  document.getAnimations().forEach(function (a) {
    try { if (a.effect && a.effect.getTiming().iterations !== Infinity) a.finish(); } catch (e) { /* weiter */ }
  });
}
// Jeder Blob merkt sich seinen Text; gelesen wird mit blobText(b), nie mit
// b.text(). Das liest wirklich — und solange der Läufer darauf wartet, läuft
// seine virtuelle Uhr im Sekundentakt der App bis ans Budget, und die Seite geht
// ohne Urteil zurück (etwa jeder fünfzehnte Lauf von export).
var BlobEcht = window.Blob, FileEcht = window.File;
function textAus(teile) {
  return (teile || []).map(function (t) { return typeof t === 'string' ? t : t && t.textGemerkt || ''; }).join('');
}
window.Blob = function (teile, opt) { var b = new BlobEcht(teile, opt); b.textGemerkt = textAus(teile); return b; };
window.Blob.prototype = BlobEcht.prototype;
window.File = function (teile, name, opt) { var f = new FileEcht(teile, name, opt); f.textGemerkt = textAus(teile); return f; };
window.File.prototype = FileEcht.prototype;
function blobText(b) { return Promise.resolve(b.textGemerkt); }
function frisch() {
  menueSchliessen();
  state = grundStand();
  themaAnwenden();
  zeige('home');
}
function abschluss() {
  var pre = document.createElement('pre');
  pre.id = 'testlog';
  pre.textContent = log.join('\n');
  document.body.appendChild(pre);
  var f = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
  document.title = f.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + f.length;
}
function ausnahme(e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + String(e.stack || '').split('\n')[1]);
}
(function () {
  var p;
  try { p = (function () {` + rumpf + String.raw`
  })(); } catch (e) { ausnahme(e); abschluss(); return; }
  if (p && typeof p.then === 'function') p.then(abschluss, function (e) { ausnahme(e); abschluss(); });
  else abschluss();
})();
`;
  writeFileSync(join(BAU, 't-' + name + '.html'), testseite(html, test));
}
