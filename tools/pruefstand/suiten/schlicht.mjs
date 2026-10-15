// Große Blätter fließen schlicht (P1, Nachricht 15): Ticketblatt und Timer
// fließen mit einem Schatten statt zwei und ohne Lichtkante, beide
// milchig, Glas erst am Ziel. Am Gerät verlor das Ticketblatt je Auf und Zu
// rund 24 Bilder, weil Doppelschatten und Lichtkante als Filter über die
// ganze Fläche in jedem Bild neu entstanden. Der kleine Hinweis aus Glas
// behält beides — dort ist die Fläche klein. Eine Ansicht ist das größte
// Blatt: Sie behält ihren einen Schatten und fließt ohne Lichtkante; mit ihr
// stand der Rückwisch am Gerät ein Bild lang 110–130 ms still (0.17.0T23).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('schlicht', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function huelle() { var h = alle('body > .tropfen-huelle'); return h[h.length - 1] || null; }
function schicht(h) { var s = h && h.previousElementSibling; return s && s.classList.contains('fl-schicht') ? s : null; }
function schatten(s) { return (s.style.filter.match(/drop-shadow/g) || []).length; }
function aufbauen() {
  frisch();
  state.gewohnheiten = [gewohnheitLesen({ id: 'a', name: 'Lesen', rhythmus: { art: 'taeglich' },
    angelegt: tagPlus(heuteSchluessel(), -5), erledigt: [], timer: { minuten: 20, stumm: true } })];
  flDauernSetzen();
  zeige('home');
}
var bis = function () { return HINWEIS_DAUER + 3 * TROPFEN_DAUER + 400; };

// ── Ticketblatt ───────────────────────────────────────────────
aufbauen();
q('#ticketKnopf').click();
var h = huelle(), s = schicht(h);
pruefe('S1 das Ticketblatt fließt milchig, die Karte wartet ohne Glas', !!h && h.classList.contains('milchig') &&
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
  ausbewegt();
  state.timer = null;

  // ── Eine Ansicht fließt ohne Lichtkante ──────────────────────
  aufbauen();
  zeige('einstellungen');
  ausbewegt();
  var vorher = alle('body > .tropfen-huelle');
  zurueckGehen();
  var h7 = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0], s7 = schicht(h7);
  pruefe('S13 zurück fließt die Ansicht mit einem Schatten und ohne Lichtkante', !!h7 && !!h7._fluss && !!s7 &&
    schatten(s7) === 1 && !s7.querySelector('.fp-licht') && !s7.querySelector('.fp-oben'), s7 && s7.innerHTML.slice(0, 120));
  ausbewegt();
  // Auf: aus der getippten Stelle quillt sie ebenso schlicht.
  vorher = alle('body > .tropfen-huelle');
  letzterTipp = { el: q('#menuKnopf'), zeit: Date.now() };
  zeige('einstellungen');
  var h8 = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0], s8 = schicht(h8);
  pruefe('S14 auf fließt sie ebenso schlicht, wenn sie aus dem Getippten quillt', ansicht === 'einstellungen' && !!h8 && !!s8 &&
    schatten(s8) === 1 && !s8.querySelector('.fp-licht'), ansicht + ' / ' + (s8 && s8.innerHTML.slice(0, 120)));
  ausbewegt();
  // Der kleine Hinweis aus Glas behält seine Lichtkante (S7); der Wochenstreifen
  // der Heatmap ist klein und behält sie auch.
  var w = document.createElement('div');
  w.style.cssText = 'position: fixed; left: 40px; top: 300px; width: 200px; height: 80px;';
  document.body.appendChild(w);
  vorher = alle('body > .tropfen-huelle');
  tropfenAuf(w, punktFlaeche(140, 340), { rund: '14px' });
  var h9 = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0], s9 = schicht(h9);
  pruefe('S15 ein kleines Blatt ohne Glas behält seine Lichtkante', !!s9 && !!s9.querySelector('.fp-licht'));
  ausbewegt();
  w.remove();
  zeige('home');
  ausbewegt();
});
`);
