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
// Seit 0.8.0 ist alles gebaut; ein Probe-Eintrag hält den Weg für «bald» geprüft.
pruefe('C0 seit Abschnitt 7 ist nichts mehr «bald»', MENUE.every(function (m) { return !!m.ziel; }));
menueSchliessen(true);
MENUE.push({ id: 'probe', name: 'Probe', icon: 'plus' });
menueOeffnen();
q('[data-menue="probe"]').click();
MENUE.pop();
pruefe('C1 das Menü geht zu', !huelle.classList.contains('offen'));
pruefe('C2 die Meldung sagt im Glas, dass es kommt', /nächsten Fassung/.test(q('#hinweisTitel').textContent) &&
  !q('#hinweisBlatt').hidden && q('#hinweisKarte').classList.contains('glas') &&
  q('#hinweisHaken').classList.contains('neutral') && getComputedStyle(q('#meldung')).display === 'none');
pruefe('C2a sie quillt aus dem getippten Eintrag (ADR 0041)', !!q('body > .tropfen-huelle.glas'));
hinweisSchliessen();
pruefe('C3 die Ansicht bleibt', ansicht === 'home');
// Das Glas fließt zurück in den Eintrag; verborgen ist es erst danach — die
// Suite läuft ohne Pause weiter.
ausbewegt();
q('#hinweisBlatt').hidden = true;

// ── D · Einstellungen und zurück ────────────────────────────
menueOeffnen();
q('[data-menue="einstellungen"]').click();
pruefe('D1 die Einstellungen öffnen', ansicht === 'einstellungen' && !!q('#swKnopf'));
pruefe('D2 der Kopf trägt den Rückweg', !!q('#zurueckKnopf'));
pruefe('D3 und den Titel', q('#kopf h1').textContent === 'Einstellungen');
pruefe('D4 unterwegs kein Schalter und kein Menü', !q('#themaKnopf') && !q('#menuKnopf'));
ausbewegt();
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
pruefe('F2 «Erste Gewohnheit anlegen» öffnet das Formular', ansicht === 'neu' && !!q('#gwName'));

// ── G · «Neue Gewohnheit» im Menü ───────────────────────────
frisch();
menueOeffnen();
q('[data-menue="gewohnheit"]').click();
pruefe('G1 öffnet das Formular', ansicht === 'neu' && !!q('#gwName'));
pruefe('G2 mit Titel im Kopf', q('#kopf h1').textContent === 'Neue Gewohnheit');
frisch();

// ── W · Vom Rand wischen (ADR 0016) ─────────────────────────
function wisch(x0, y0, x1, y1) {
  var ziel = q('#ansicht');
  function punkt(x, y) { return new Touch({ identifier: 7, target: ziel, clientX: x, clientY: y }); }
  ziel.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [punkt(x0, y0)], changedTouches: [punkt(x0, y0)] }));
  ziel.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [punkt(x1, y1)] }));
}
zeige('einstellungen');
wisch(10, 400, 200, 420);
pruefe('W1 vom linken Rand zur Mitte heißt zurück', ansicht === 'home', ansicht);
zeige('einstellungen');
wisch(60, 400, 300, 400);
pruefe('W2 nicht vom Rand: nichts', ansicht === 'einstellungen');
wisch(10, 400, 50, 400);
pruefe('W3 zu kurz: nichts', ansicht === 'einstellungen');
wisch(10, 300, 110, 500);
pruefe('W4 schräg ist Blättern: nichts', ansicht === 'einstellungen');
hinweisZeigen('Probe');
wisch(10, 400, 200, 400);
pruefe('W5 bei offenem Hinweis schweigt die Geste', ansicht === 'einstellungen');
hinweisSchliessen();
frisch();
wisch(10, 300, 110, 500);
pruefe('W6b schräg auf dem Dashboard: kein Menü', q('#menue').hidden);
wisch(10, 400, 200, 400);
pruefe('W6 auf dem Dashboard öffnet der Wisch das Menü (ADR 0023)', ansicht === 'home' && !q('#menue').hidden &&
  q('#menue').classList.contains('offen'));
wisch(10, 400, 200, 400);
pruefe('W6a bei offenem Menü schweigt er', ansicht === 'home' && q('#menue').classList.contains('offen'));
// Vom rechten Rand nach links, zum Menüknopf hin (ADR 0025). Das Menü blendet
// nach dem Schließen noch aus — erst danach ist es zu.
function ganzZu() { frisch(); menueSchliessen(true); ausbewegt(); q('#menue').hidden = true; }
ganzZu();
var B = innerWidth;
wisch(B - 10, 400, B - 200, 400);
pruefe('W7 vom rechten Rand nach links öffnet das Menü', ansicht === 'home' && !q('#menue').hidden &&
  q('#menue').classList.contains('offen'));
ganzZu();
wisch(B - 10, 300, B - 110, 500);
pruefe('W8 schräg vom rechten Rand: nichts', q('#menue').hidden);
wisch(B - 10, 400, B + 0, 400);
wisch(B - 60, 400, B - 260, 400);
pruefe('W9 zu kurz oder nicht vom Rand: nichts', q('#menue').hidden && ansicht === 'home');
zeige('einstellungen');
wisch(B - 10, 400, B - 200, 400);
pruefe('W10 unterwegs führt er nach Hause — dort ist der Menüknopf', ansicht === 'home');
frisch();

// ── B · Eine Bestätigung ist so breit wie ihr Text (ADR 0025) ─
bestaetigen('Gelöscht', '', null);
var kurz = q('#hinweisKarte').getBoundingClientRect().width;
hinweisSchliessen();
bestaetigen('Angelegt', 'Antippen heißt erledigt, lange drücken öffnet sie.', null);
var lang = q('#hinweisKarte').getBoundingClientRect().width;
hinweisSchliessen();
hinweisZeigen('Datei geladen', 'Öffne sie.', null, null);
var mitOk = q('#hinweisKarte').getBoundingClientRect().width;
hinweisSchliessen();
pruefe('B1 kurz ist schmal, lang breiter, höchstens wie ein Hinweis mit «OK»', kurz >= 180 && kurz < 260 && lang > kurz &&
  lang <= mitOk + 0.5 && mitOk >= 300, [kurz, lang, mitOk].join());
frisch();

// ── S · Die Einträge tropfen nacheinander auf (ADR 0041) ─────
menueSchliessen(true);
ausbewegt();
menueOeffnen();
var zuege = alle('#menueListe .menue-eintrag').map(function (z) {
  var a = z.getAnimations()[0];
  return a ? { warten: a.effect.getTiming().delay, clip: a.effect.getKeyframes()[0].clipPath || '' } : null;
});
pruefe('S1 jeder Eintrag beginnt als Perle', zuege.every(function (z) { return z && /round/.test(z.clip); }));
pruefe('S2 einer nach dem anderen', zuege.every(function (z, i) { return !i || z.warten > zuege[i - 1].warten; }) &&
  zuege[zuege.length - 1].warten - zuege[0].warten < 700, zuege.map(function (z) { return z && z.warten; }).join());
ausbewegt();
menueSchliessen(true);
ausbewegt();

// ── R · Hinausgerollt tropft der Menüknopf herab (ADR 0041) ──
pruefe('R0 oben steht kein Gast', (menueOeffnen(), !q('#menueGast')));
menueSchliessen(true);
ausbewegt();
// Die Schließbilder der Abschnitte davor räumt sonst erst ihr Versprechen ab —
// die Suite läuft aber ohne Pause durch.
q('#menue .blatt').getAnimations().forEach(function (a) { a.cancel(); });
q('#app').style.minHeight = '4000px';
window.scrollTo(0, 1500);
var B2 = innerWidth;
wisch(B2 - 10, 400, B2 - 200, 400);
var gast = q('#menueGast'), kn = q('#menuKnopf').getBoundingClientRect();
var fall = gast && gast.getAnimations()[0], f0 = fall ? fall.effect.getKeyframes()[0].transform : '';
pruefe('R1 der Knopf ist fort, ein Gast tropft von seiner Stelle herab', kn.bottom < 0 && !!gast &&
  /translateY\(-/.test(f0), f0);
ausbewegt();
var gr = q('#menueGast').getBoundingClientRect(), br = q('#menue .blatt').getBoundingClientRect();
pruefe('R2 er steht oben im Bild, rechts wie sein Knopf, 44 groß', gr.top >= 0 && gr.top < 60 &&
  Math.abs(gr.right - kn.right) < 1 && gr.width >= 44 && gr.height >= 44, [gr.top, gr.right, kn.right].join());
pruefe('R3 das Menü hängt unter ihm, im Bild', br.top >= gr.bottom && br.top < 120 && br.bottom <= innerHeight,
  [br.top, gr.bottom].join());
q('#menueGast').click();
pruefe('R4 ein Tipp auf den Gast schließt', !q('#menue').classList.contains('offen'));
return new Promise(function (fertig) {
  ausbewegt();
  setTimeout(function () {
    ausbewegt();
    setTimeout(function () {
      pruefe('R5 danach ist er fort, das Menü zu', !q('#menueGast') && q('#menue').hidden);
      menueOeffnen();
      menueSchliessen(true);
      pruefe('R6 eine Wahl im Menü nimmt ihn sofort mit', !q('#menueGast') && q('#menue').hidden);
      window.scrollTo(0, 0);
      q('#app').style.minHeight = '';
      frisch();
      fertig();
    }, 50);
  }, 50);
});
`);
