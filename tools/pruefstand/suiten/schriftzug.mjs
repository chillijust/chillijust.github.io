// Der Schriftzug: «Chilli» vorn, die Überschrift führt nach Hause, und die
// Entwürfe stehen unten auf dem Dashboard zur Wahl (ADR 0010).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('schriftzug', html, String.raw`
frisch();

// ── A · Überschrift führt zur Übersicht ─────────────────────
zeige('einstellungen');
pruefe('A1 unterwegs ist die Überschrift ein Knopf', q('#titelHeim') && q('#titelHeim').tagName === 'BUTTON' &&
  q('#titelHeim').textContent === 'Einstellungen' && q('#titelHeim').getBoundingClientRect().height >= 44);
q('#titelHeim').click();
pruefe('A2 ein Tipp darauf führt zum Dashboard', ansicht === 'home' && !!q('#markeKnopf'));
// Wie aus dem Export geöffnet: Der Rückweg führt dorthin zurück (ADR 0009).
zeige('einstellungen');
rueckZiel = 'export';
q('#zurueckKnopf').click();
pruefe('A3 aus dem Export geöffnet: der Rückweg geht zum Export …', ansicht === 'export');
zeige('einstellungen');
rueckZiel = 'export';
q('#titelHeim').click();
pruefe('A4 … die Überschrift geht trotzdem zur Übersicht', ansicht === 'home' && rueckZiel === null);
pruefe('A5 auf dem Dashboard ist der Schriftzug selbst ein Knopf, mindestens 44 hoch',
  q('#markeKnopf').tagName === 'BUTTON' && q('#markeKnopf').getBoundingClientRect().height >= 44);
window.scrollTo(0, 400);
q('#markeKnopf').click();
pruefe('A6 ein Tipp darauf bleibt auf der Übersicht', ansicht === 'home');

// ── B · Die Auswahl ─────────────────────────────────────────
var karten = alle('#schriftzugWahl [data-marke]');
pruefe('B1 unten stehen «Schlicht» und alle Entwürfe zur Wahl, der jüngste ganz oben', karten.length === MARKEN.length + 1 &&
  karten[0].getAttribute('data-marke') === 'lodern' && karten[1].getAttribute('data-marke') === '' &&
  q('#ansicht').lastElementChild === q('#schriftzugWahl'), karten.length);
pruefe('B2 ohne Wahl ist «Schlicht» gewählt und der Kopf gesetzt, nicht gezeichnet',
  karten[1].getAttribute('aria-pressed') === 'true' && !q('#kopf svg.wm') && q('#kopf .marke').textContent === 'Chilli');
pruefe('B3 jeder Entwurf hat eine Breite, einen Satz und zeichnet etwas', MARKEN.every(function (m) {
  return m.breite > 60 && m.breite <= 140 && m.satz.length > 20 && /<(path|text|circle)/.test(m.svg('x'));
}));
var ids = {};
alle('#schriftzugWahl [id]').forEach(function (e) { ids[e.id] = (ids[e.id] || 0) + 1; });
pruefe('B4 keine ID doppelt in der Auswahl', Object.keys(ids).every(function (k) { return ids[k] === 1 && !q('#kopf #' + k); }));
pruefe('B5 die Stiele sind nicht grün — Grün heißt erledigt', alle('.wm-stiel').every(function (e) {
  return getComputedStyle(e).stroke !== getComputedStyle(document.documentElement).getPropertyValue('--erledigt');
}) && !/--erledigt/.test(MARKEN.map(function (m) { return m.svg('x'); }).join('')));

// ── C · Wählen ──────────────────────────────────────────────
var oben = window.scrollY;
q('[data-marke="hallo"]').click();
pruefe('C1 gewählt: der Kopf zeichnet den Entwurf, «Journal» daneben', !!q('#kopf svg.wm') &&
  q('#kopf .marke-zusatz').textContent === 'Journal' && q('#markeKnopf').getAttribute('aria-label') === 'Chilli Journal');
pruefe('C2 die Karte ist markiert, die anderen nicht', q('[data-marke="hallo"]').getAttribute('aria-pressed') === 'true' &&
  alle('[data-marke][aria-pressed="true"]').length === 1);
pruefe('C3 nichts springt: die Seite bleibt, wo sie war', Math.abs(window.scrollY - oben) < 2);
pruefe('C4 gespeichert', state.schriftzug === 'hallo' && JSON.parse(localStorage.getItem(SPEICHER)).schriftzug === 'hallo');
pruefe('C5 nach dem Laden noch da', laden().schriftzug === 'hallo');
render();
pruefe('C6 neu gezeichnet läuft der Kopf nicht von selbst wieder ab', !q('#kopf svg.wm-los'));
q('[data-marke="etikett"]').click();
pruefe('C7 «Etikett» trägt JOURNAL selbst, ohne zweites «Journal»', !q('#kopf .marke-zusatz') &&
  /JOURNAL/.test(q('#kopf svg.wm').textContent));
q('[data-marke="lodern"]').click();
pruefe('C7a «Lodern» trägt Journal kursiv unter der Linie, ohne zweites «Journal»', !q('#kopf .marke-zusatz') &&
  getComputedStyle(q('#kopf .wm-kursiv')).fontStyle === 'italic' && q('#kopf .wm-kursiv').textContent === 'Journal' &&
  q('#kopf .wm-linie').getBoundingClientRect().right < q('#kopf .wm-kursiv').getBoundingClientRect().left);
render();
var lod = alle('#kopf .wm-lodern');
pruefe('C7b die Flammen lodern weiter, auch ohne Ablauf — beide, nicht im Gleichtakt', lod.length === 2 && !q('#kopf svg.wm-los') &&
  lod.every(function (g) { return getComputedStyle(g).animationName === 'wmLodern' &&
    getComputedStyle(g).animationIterationCount === 'infinite'; }) &&
  getComputedStyle(lod[0]).animationDelay !== getComputedStyle(lod[1]).animationDelay);
markeAbspielen(q('#kopf svg.wm'));
pruefe('C7c beim Ablauf steigen sie von unten auf, nach der Schrift',
  alle('#kopf .wm-aufflammen').every(function (g) { var c = getComputedStyle(g);
    return c.animationName === 'wmAufflammen' && parseFloat(c.animationDelay) >= 1; }) &&
  /translateY\(5px\)/.test(Array.prototype.map.call(document.styleSheets[0].cssRules,
    function (r) { return r.name === 'wmAufflammen' ? r.cssText : ''; }).join('')));
MARKEN.forEach(function (m) {
  q('[data-marke="' + m.id + '"]').click();
  var k = q('#kopf').getBoundingClientRect(), t = q('#markeKnopf').getBoundingClientRect(), s = q('#themaKnopf').getBoundingClientRect();
  pruefe('C8 «' + m.name + '» paßt in den Kopf neben den Schalter', t.right <= s.left + 1 && k.right <= window.innerWidth,
    t.right + ' / ' + s.left);
});
q('[data-marke=""]').click();
pruefe('C9 zurück zu «Schlicht»', state.schriftzug === '' && !q('#kopf svg.wm'));

// ── D · Speicher ────────────────────────────────────────────
localStorage.setItem(SPEICHER, JSON.stringify({ schriftzug: 'erfunden' }));
pruefe('D1 ein unbekannter Entwurf fällt auf schlicht', laden().schriftzug === '');
localStorage.setItem(SPEICHER, JSON.stringify({ schriftzug: 7 }));
pruefe('D2 auch einer ohne Gestalt', laden().schriftzug === '');
`);
