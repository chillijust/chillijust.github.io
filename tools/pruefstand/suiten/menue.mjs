// Das Menü hinter dem runden Knopf und der Rückweg im Kopf.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('menue', html, String.raw`
frisch();
var huelle = q('#menue');

// ── A · Zu und auf ──────────────────────────────────────────
pruefe('A1 das Menü ist zu', huelle.hidden && getComputedStyle(huelle).display === 'none');
q('#menuKnopf').click();
pruefe('A2 der runde Knopf öffnet es', !huelle.hidden && huelle.classList.contains('offen'));
pruefe('A3 es liegt über der Seite', getComputedStyle(huelle).position === 'fixed');
pruefe('A4 und meldet sich als Dialog', q('#menue [role="dialog"]').getAttribute('aria-modal') === 'true');

// ── B · Die Einträge in der Reihenfolge des Pflichtenhefts ──
var SOLL = ['Neue Gewohnheit', 'Neuer Termin', 'Journal', 'Kalender-Export', 'Einstellungen',
  'Sicherung', 'Tickets'];
var ist = alle('.menue-eintrag .name').map(function (n) { return n.textContent; });
pruefe('B1 sieben Einträge, in dieser Reihenfolge', ist.join(' · ') === SOLL.join(' · '), ist.join(' · '));
pruefe('B2 jeder trägt ein Symbol', alle('.menue-eintrag').every(function (e) { return !!e.querySelector('svg'); }));
// Was noch nicht gebaut ist, sagt das — und nur das.
var gebaut = MENUE.filter(function (m) { return !!m.ziel; }).map(function (m) { return m.id; });
pruefe('B3 nur Gebautes ist ohne «bald»', alle('.menue-eintrag').every(function (e) {
  var fertig = gebaut.indexOf(e.getAttribute('data-menue')) !== -1;
  return fertig === !e.querySelector('.bald') && fertig === !e.hasAttribute('aria-disabled');
}));
pruefe('B4 jedes Ziel ist eine Ansicht', gebaut.every(function (id) {
  return MENUE.filter(function (m) { return m.id === id; })[0].ziel in ANSICHTEN;
}));

// ── C · Ein angekündigter Eintrag sagt es und schließt ──────
q('[data-menue="journal"]').click();
pruefe('C1 das Menü geht zu', !huelle.classList.contains('offen'));
pruefe('C2 die Meldung sagt, dass es kommt', /nächsten Fassung/.test(q('#meldung').textContent) &&
  q('#meldung').classList.contains('zeigt'));
pruefe('C3 die Ansicht bleibt', ansicht === 'home');

// ── D · Einstellungen und zurück ────────────────────────────
menueOeffnen();
q('[data-menue="einstellungen"]').click();
pruefe('D1 die Einstellungen öffnen', ansicht === 'einstellungen' && !!q('#swKnopf'));
pruefe('D2 der Kopf trägt den Rückweg', !!q('#zurueckKnopf'));
pruefe('D3 und den Titel', q('#kopf h1').textContent === 'Einstellungen');
pruefe('D4 unterwegs kein Schalter und kein Menü', !q('#themaKnopf') && !q('#menuKnopf'));
var zk = q('#zurueckKnopf').getBoundingClientRect(), tk = q('#kopf h1').getBoundingClientRect();
pruefe('D5 der Rückweg steht links vom Titel', zk.right <= tk.left + 1);
q('#zurueckKnopf').click();
pruefe('D6 zurück ist das Dashboard', ansicht === 'home' && !!q('#chiliFigur') && !!q('#menuKnopf'));

// ── E · Schließen ohne Wahl ─────────────────────────────────
menueOeffnen();
huelle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
pruefe('E1 ein Tipp neben das Blatt schließt', !huelle.classList.contains('offen'));
menueOeffnen();
q('.blatt').dispatchEvent(new MouseEvent('click', { bubbles: true }));
pruefe('E2 ein Tipp aufs Blatt nicht', huelle.classList.contains('offen'));
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
pruefe('E3 Escape schließt', !huelle.classList.contains('offen'));

// ── F · Ansichten unbekannten Namens landen zu Hause ────────
zeige('gibtsnicht');
pruefe('F1 statt eines leeren Bilds das Dashboard', ansicht === 'home' && !!q('#chiliFigur'));
q('#ersteGewohnheit').click();
pruefe('F2 «Erste Gewohnheit anlegen» antwortet', /nächsten Fassung/.test(q('#meldung').textContent));
`);
