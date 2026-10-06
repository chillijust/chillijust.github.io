// Kein Heranzoomen beim Tippen (ADR 0028). iOS zoomt an jedes Eingabefeld
// heran, dessen Schrift kleiner als 16 px ist — und zoomt danach nicht von
// selbst zurück. Geprüft wird jedes Feld jeder Ansicht, dazu die Felder, die
// erst auf einen Tipp erscheinen (Sicherungscode, Ticketausgabe, Ticketblatt).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('zoom', html, String.raw`
frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'g', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-09-01', erledigt: [] })];
var klein = [], gesehen = 0;
function felder(wo) {
  alle('input, textarea, select').forEach(function (f) {
    if (f.type === 'hidden' || f.type === 'checkbox' || f.type === 'radio' || f.type === 'file') return;
    gesehen++;
    var g = parseFloat(getComputedStyle(f).fontSize);
    if (g < 16) klein.push(wo + ' #' + (f.id || f.className) + ' ' + g + 'px');
  });
}
Object.keys(ANSICHTEN).forEach(function (n) {
  try { zeige(n, n === 'bearbeiten' ? 'g' : undefined); felder(n); } catch (e) { /* manche brauchen Daten */ }
});
// Was erst auf einen Tipp erscheint: der Code zum Einlesen und zum Kopieren.
var probe = document.createElement('div');
probe.innerHTML = '<textarea class="eingabe code"></textarea><textarea class="eingabe"></textarea>' +
  '<input class="eingabe" type="text"><select class="eingabe"></select>';
q('#app').appendChild(probe);
felder('Probe');
probe.remove();
zeige('home');
ticketBlattOeffnen(null);
felder('Ticketblatt');
ticketEntwurf = null;
ticketBlattSchliessen();
pruefe('Z1 es gibt Felder zu prüfen', gesehen > 10, gesehen);
pruefe('Z2 kein Eingabefeld hat Schrift unter 16 px — sonst zoomt iOS heran', klein.length === 0, klein.join(' · '));
pruefe('Z3 der Viewport erlaubt Zoomen weiterhin (Barrierefreiheit)',
  !/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(q('meta[name="viewport"]').getAttribute('content')),
  q('meta[name="viewport"]').getAttribute('content'));
frisch();
speichern();
`);
