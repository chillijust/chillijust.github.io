// Der Schriftzug «Lodern»: «Chilli» vorn, die Überschrift führt nach Hause,
// die Flammen steigen auf und lodern weiter (ADR 0010).
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

// ── B · Der Schriftzug «Lodern» ─────────────────────────────
render();
var svg = q('#kopf svg.wm');
pruefe('B1 der Kopf zeichnet den Schriftzug, «Journal» kursiv unter der Linie, sonst nichts daneben', !!svg &&
  q('#kopf .wm-journal').textContent === 'Journal' && getComputedStyle(q('#kopf .wm-journal')).fontStyle === 'italic' &&
  q('#kopf .wm-linie').getBoundingClientRect().right < q('#kopf .wm-journal').getBoundingClientRect().left &&
  q('#markeKnopf').textContent === 'Journal' && q('#markeKnopf').getAttribute('aria-label') === 'Chilli Journal');
pruefe('B2 die Auswahl ist fort', !q('#schriftzugWahl') && !q('[data-marke]') && typeof MARKEN === 'undefined');
pruefe('B3 die Flammen sind Chili, Stiele gibt es keine', alle('#kopf .wm-glut').length === 4 && !q('.wm-stiel'));
var k = q('#kopf').getBoundingClientRect(), t = q('#markeKnopf').getBoundingClientRect(), sch = q('#themaKnopf').getBoundingClientRect();
pruefe('B4 der Schriftzug paßt in den Kopf neben den Schalter', t.right <= sch.left + 1 && k.right <= window.innerWidth,
  t.right + ' / ' + sch.left);
pruefe('B5 breit gezogen: breiter als hoch, mindestens 100 Pixel', svg.getBoundingClientRect().width >= 100 &&
  svg.getBoundingClientRect().width > svg.getBoundingClientRect().height);

// ── C · Bewegung ────────────────────────────────────────────
pruefe('C1 neu gezeichnet läuft der Kopf nicht von selbst wieder ab', !q('#kopf svg.wm-los'));
var lod = alle('#kopf .wm-lodern');
pruefe('C2 die Flammen lodern weiter, auch ohne Ablauf — beide, nicht im Gleichtakt', lod.length === 2 &&
  lod.every(function (g) { return getComputedStyle(g).animationName === 'wmLodern' &&
    getComputedStyle(g).animationIterationCount === 'infinite'; }) &&
  getComputedStyle(lod[0]).animationDelay !== getComputedStyle(lod[1]).animationDelay);
markeAbspielen(q('#kopf svg.wm'));
pruefe('C3 beim Ablauf steigen sie von unten auf, nach der Schrift',
  alle('#kopf .wm-aufflammen').every(function (g) { var c = getComputedStyle(g);
    return c.animationName === 'wmAufflammen' && parseFloat(c.animationDelay) >= 1; }) &&
  /translateY\(5px\)/.test(Array.prototype.map.call(document.styleSheets[0].cssRules,
    function (r) { return r.name === 'wmAufflammen' ? r.cssText : ''; }).join('')));
pruefe('C4 «Journal» kommt nach dem Strich', parseFloat(getComputedStyle(q('#kopf .wm-journal')).animationDelay) >
  parseFloat(getComputedStyle(q('#kopf .wm-linie')).animationDelay));

// ── D · Speicher ────────────────────────────────────────────
localStorage.setItem(SPEICHER, JSON.stringify({ schriftzug: 'glut' }));
pruefe('D1 ein alter gewählter Entwurf wird überlesen', !('schriftzug' in laden()) && !('schriftzug' in grundStand()));
`);
