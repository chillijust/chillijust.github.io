// Langer Druck als Tropfen (0.8.0, ADR 0020): Wer eine Gewohnheit, ein
// Abgewöhnen oder einen Termin lange drückt, sieht die Ansicht als Tropfen aus
// der Stelle unter dem Finger quellen; der Rückweg fließt dorthin zurück.
// Kurz antippen bleibt, wie es war.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('langdruck', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function aufbauen() {
  frisch();
  kalTag = null;
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01',
    erledigt: [] })];
  state.abgewoehnen = [lasterLesen({ id: 'L', name: 'Zucker', start: new Date(2026, 9, 1).getTime(), rueckfaelle: [],
    draenge: [] })];
  state.termine = [terminLesen({ id: 'T', titel: 'Zahnarzt', tag: '2026-10-14', von: '09:30' })];
  zeige('home');
  ausbewegt();
}
// Ein Punkt in der Kachel, gut rechts von der Mitte — so liegt er nicht dort,
// wo eine Kachel als Ganzes ihren Mittelpunkt hätte.
function punktIn(sel) {
  var r = q(sel).getBoundingClientRect();
  return { x: Math.round(r.left + r.width * 0.8), y: Math.round(r.top + r.height * 0.5) };
}
function druck(sel, p) {
  q(sel).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: p.x, clientY: p.y,
    pointerType: 'touch' }));
}
function bilder() {
  var h = q('body > .tropfen-huelle');
  return h && h.getAnimations().length ? h.getAnimations()[0].effect.getKeyframes() : [];
}
function mitte(b) { return { x: parseFloat(b.left) + parseFloat(b.width) / 2, y: parseFloat(b.top) + parseFloat(b.height) / 2 }; }
function nah(a, b) { return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2; }

function fall(name, sel, ziel) {
  var p;
  return function () {
    aufbauen();
    p = punktIn(sel);
    druck(sel, p);
    return warten(LANG_MS + 100).then(function () {
      var b = bilder(), erst = b[0] || {};
      pruefe(name + '1 lange drücken öffnet', ansicht === ziel, ansicht);
      pruefe(name + '2 als Tropfen aus der Stelle unter dem Finger', !!b.length && nah(mitte(erst), p) &&
        parseFloat(erst.width) === 44 && erst.borderRadius === TROPFEN, JSON.stringify(erst) + ' ' + JSON.stringify(p));
      return durch();
    }).then(function () {
      zurueckGehen();
      var b = bilder(), an = b[b.length - 2] || {};
      pruefe(name + '3 zurück fließt sie dorthin', ansicht === 'home' && !!b.length && nah(mitte(an), p),
        JSON.stringify(an) + ' ' + JSON.stringify(p));
      return durch();
    }).then(function () {
      pruefe(name + '4 danach ist aufgeräumt', !q('body > .tropfen-huelle') && !alle('body > .geist').length);
    });
  };
}

return Promise.resolve()
  .then(fall('G', '[data-haken="A"]', 'bearbeiten'))
  .then(fall('L', '[data-ab="L"]', 'abgewoehnen'))
  .then(fall('T', '#ansicht > .abschnitt [data-termin="T"]', 'termin'))
  .then(function () {
    // Kurz antippen: Gewohnheit wie Termin von heute haken ab (ADR 0042).
    aufbauen();
    langGedrueckt = 0;
    q('[data-termin="T"]').click();
    pruefe('K1 ein kurzer Tipp auf den Termin hakt ihn ab, wie die Kachel', ansicht === 'home' &&
      terminNach('T').erledigt.join() === '2026-10-14');
    pruefe('K2 und öffnet nichts', !q('body > .tropfen-huelle'));
    return durch();
  }).then(function () {
    zeige('home');
    ausbewegt();
    var p = punktIn('[data-termin="T"]');
    druck('[data-termin="T"]', p);
    return warten(LANG_MS + 100);
  }).then(function () {
    var vorher = ansicht;
    zeige('home');
    ausbewegt();
    q('[data-termin="T"]').click();
    pruefe('K3 der Klick gleich nach dem langen Druck tut nichts', vorher === 'termin' && ansicht === 'home' &&
      terminNach('T').erledigt.join() === '2026-10-14');
    langGedrueckt = 0;
    return durch();
  }).then(function () {
    frisch();
    speichern();
  });
`);
