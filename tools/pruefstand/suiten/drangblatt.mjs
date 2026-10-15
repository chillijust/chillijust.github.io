// Drang als Blatt aus Glas wie der Timer (ADR 0059): keine eigene Ansicht
// mehr. Es tropft aus dem Drang-Knopf, fließt dorthin zurück, ist der oberste
// Dialog, läßt die Randgesten schweigen und paßt quer ins Bild wie der Timer (Suite querformat).
// Geschlossen zeichnet die Welle nicht weiter — weder beim Drang noch beim Timer.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

function rumpf() {
  return String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function imBild(el) { var r = el.getBoundingClientRect(); return r.top >= -0.5 && r.bottom <= innerHeight + 0.5 && r.left >= -0.5 && r.right <= innerWidth + 0.5; }
function huelle() { var h = alle('body > .tropfen-huelle'); return h[h.length - 1] || null; }
var bis = function () { return HINWEIS_DAUER + 3 * TROPFEN_DAUER + 400; };
frisch();
state.abgewoehnen = [lasterLesen({ id: 'z', name: 'Zucker', start: zeitJetzt() - 864e5, rueckfaelle: [], draenge: [] })];
state.gewohnheiten = [gewohnheitLesen({ id: 'g', name: 'Lesen', rhythmus: { art: 'taeglich' },
  angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [], timer: { minuten: 10, stumm: true } })];
zeige('home');
var knopf = q('[data-drang="z"]'), gezeichnet = 0, renderEcht = render;
render = function () { gezeichnet++; return renderEcht.apply(this, arguments); };
knopf.click();
render = renderEcht;
` + String.raw`
var h = huelle();
pruefe('D1 der Start zeichnet nicht das ganze Dashboard; die Kachel läuft', gezeichnet === 0 &&
  knopf.closest('.ab-kachel').classList.contains('welle') && /Welle 10:00/.test(knopf.textContent), knopf.textContent);
pruefe('D2 das Blatt tropft milchig aus dem Drang-Knopf, Glas erst am Ziel', !!h && h.classList.contains('milchig') &&
  q('#drangKarte').classList.contains('glas-wartet'));
return warten(0).then(function () {
  // Den obersten Dialog bestimmt ein MutationObserver — einen Takt später.
  pruefe('D3 es ist der oberste Dialog: alles andere ruht', obersterDialog() === q('#drangBlatt') && q('#app').inert &&
    !q('#drangBlatt').inert && blattOffen());
  return warten(bis());
}).then(function () {
  pruefe('D4 am Ziel hat das Blatt sein Glas und den Fokus', !q('#drangKarte').classList.contains('glas-wartet') &&
    q('#drangBlatt').contains(document.activeElement));
  pruefe('D5 im Ring Flüssigkeit und Chili, wie beim Timer', !!q('#drangKarte .timer-bild .fl-welle') &&
    !!q('#drangKarte .timer-bild #chiliFigur') && alle('#chiliFigur').length === 1);
  q('#drangBlatt').click();
  var h2 = huelle();
  pruefe('D6 danebentippen: es fließt in den Drang-Knopf zurück, milchig', !drangOffen() && !!h2 && h2.classList.contains('milchig') &&
    !!state.welle);
  return warten(bis());
}).then(function () {
  pruefe('D7 zu ist alles abgeräumt: Blatt fort, Welle fort, Chili im Tagesring, nichts ruht mehr', q('#drangBlatt').hidden &&
    !q('#drangKarte .fl-welle') && !!q('#app .tagesring #chiliFigur') && alle('#chiliFigur').length === 1 && !q('#app').inert &&
    !q('body > .tropfen-huelle'));
  welleAbbrechen();
  render();
  // Beim Timer ebenso: geschlossen zeichnet seine Welle nicht weiter.
  timerStarten('g');
  return warten(bis());
}).then(function () {
  pruefe('D8 im offenen Timer läuft die Welle', !!q('#timerKarte .fl-welle'));
  timerSchliessen();
  return warten(bis());
}).then(function () {
  pruefe('D9 der geschlossene Timer zeichnet sie nicht weiter', q('#timerBlatt').hidden && !q('#timerKarte .fl-welle') && !!state.timer);
  state.timer = null;
  render();
});
`;
}

suite('drangblatt', html, rumpf());
