// Große Blätter fließen schlicht (P1, Nachricht 15): Ticketblatt und Timer
// fließen auf iOS mit einem Schatten statt zwei und ohne Lichtkante, beide
// milchig, Glas erst am Ziel. Am Gerät verlor das Ticketblatt je Auf und Zu
// rund 24 Bilder, weil Doppelschatten und Lichtkante als Filter über die
// ganze Fläche in jedem Bild neu entstanden. Der kleine Hinweis aus Glas
// behält beides — dort ist die Fläche klein.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('schlicht', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function huelle() { var h = alle('body > .tropfen-huelle'); return h[h.length - 1] || null; }
function schicht(h) { var s = h && h.previousElementSibling; return s && s.classList.contains('fl-schicht') ? s : null; }
function schatten(s) { return (s.style.filter.match(/drop-shadow/g) || []).length; }
function aufbauen(ios) {
  frisch();
  state.fluessig = ios ? { ios: { hinweis: true } } : null;
  state.gewohnheiten = [gewohnheitLesen({ id: 'a', name: 'Lesen', rhythmus: { art: 'taeglich' },
    angelegt: tagPlus(heuteSchluessel(), -5), erledigt: [], timer: { minuten: 20, stumm: true } })];
  flDauernSetzen();
  zeige('home');
}
var bis = function () { return HINWEIS_DAUER + 3 * TROPFEN_DAUER + 400; };

// ── Ticketblatt auf iOS ───────────────────────────────────────
aufbauen(true);
q('#ticketKnopf').click();
var h = huelle(), s = schicht(h);
pruefe('S1 das Ticketblatt fließt auf iOS milchig, die Karte wartet ohne Glas', !!h && h.classList.contains('milchig') &&
  q('#ticketKarte').classList.contains('glas-wartet'));
pruefe('S2 unterwegs ein Schatten statt zwei', !!s && schatten(s) === 1, s && s.style.filter);
pruefe('S3 unterwegs keine Lichtkante', !!s && !s.querySelector('.fp-licht') && !s.querySelector('.fp-oben'));
return warten(bis()).then(function () {
  pruefe('S4 am Ziel hat die Karte ihr Glas, nichts fließt mehr', !q('#ticketKarte').classList.contains('glas-wartet') &&
    !q('body > .fl-schicht') && !q('body > .tropfen-huelle'));
  ticketBlattSchliessen();
  var h2 = huelle(), s2 = schicht(h2);
  pruefe('S5 zu fließt es ebenso schlicht', !!h2 && h2.classList.contains('milchig') && !!s2 && schatten(s2) === 1 &&
    !s2.querySelector('.fp-licht'));
  return warten(bis());
}).then(function () {
  pruefe('S6 zugeflossen ist alles abgeräumt', q('#ticketBlatt').hidden && !q('body > .fl-schicht') && !q('body > .tropfen-huelle'));

  // ── Der Hinweis aus Glas bleibt, wie er war ──────────────────
  var k = q('#ticketKnopf');
  hinweisZeigen('Probe', 'Klein', k.getBoundingClientRect(), k, { zeichen: 'hinweis' });
  var h3 = huelle(), s3 = schicht(h3);
  pruefe('S7 der kleine Hinweis behält Doppelschatten und Lichtkante', !!h3 && !h3.classList.contains('milchig') && !!s3 &&
    schatten(s3) === 2 && !!s3.querySelector('.fp-licht'));
  return warten(bis());
}).then(function () {
  q('#hinweisOk').click();
  return warten(bis());
}).then(function () {
  // ── Der Timer, ein großes Blatt aus Glas ──────────────────────
  timerStarten('a');
  var h4 = huelle(), s4 = schicht(h4);
  pruefe('S8 der Timer fließt milchig und schlicht, die Karte wartet ohne Glas', !!h4 && h4.classList.contains('milchig') &&
    q('#timerKarte').classList.contains('glas-wartet') && !!s4 && schatten(s4) === 1 && !s4.querySelector('.fp-licht'));
  return warten(bis());
}).then(function () {
  pruefe('S9 am Ziel hat der Timer sein Glas', !q('#timerKarte').classList.contains('glas-wartet') && !q('body > .tropfen-huelle'));
  timerSchliessen();
  var h5 = huelle(), s5 = schicht(h5);
  pruefe('S10 der Timer fließt ebenso schlicht zurück', !!h5 && h5.classList.contains('milchig') && !!s5 && schatten(s5) === 1);
  return warten(bis());
}).then(function () {
  // ── Chilli: milchig wie das Ticketblatt, ohne Flüssiges ──────
  aufbauen(false);
  timerStarten('a');
  var h6 = huelle();
  pruefe('S11 auf Chilli tropft der Timer milchig, ohne Schicht des Flüssigen', !!h6 && h6.classList.contains('milchig') &&
    !schicht(h6) && q('#timerKarte').classList.contains('glas-wartet'));
  return warten(bis());
}).then(function () {
  ausbewegt();
  return warten(HINWEIS_DAUER + 200);
}).then(function () {
  ausbewegt();
  return warten(100);
}).then(function () {
  pruefe('S12 auch auf Chilli hat der Timer am Ziel sein Glas', !q('#timerKarte').classList.contains('glas-wartet') &&
    !q('body > .tropfen-huelle'));
  timerSchliessen();
  ausbewegt();
  state.timer = null;
});
`);
