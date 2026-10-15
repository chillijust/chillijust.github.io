// Der Rückwisch folgt dem Finger (ADR 0060, Block 6 aus Nachricht 15): Beim
// Wisch vom linken Rand schiebt sich die Ansicht mit, darunter liegt ein
// stilles Abbild des Dashboards. Erst die bestätigte Geste wechselt; kurz,
// senkrecht, abgebrochen oder gedreht federt sie zurück. Bewegung aus, offene Tastatur und ein Rückweg, der nicht nach Hause führt,
// wischen wie bisher beim Loslassen (ADR 0016). Dazu leuchtet eine Terminzeile
// kurz auf, wenn eine Ansicht oder Meldung in sie zurückkommt.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('rueckzug', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
// Bis eine Feder von iOS 26 ruht.
function ruheZeit() { return Math.ceil(1000 * Math.log(1 / 0.0015) / (fpDaempfung(FP_IOS) * 2 * Math.PI / FP_IOS.tempo)) + 250; }
var RUHE = ruheZeit() + 600, leuchtSpur = [];
function finger(typ, x, y) {
  var ziel = q('#ansicht'), t = new Touch({ identifier: 3, target: ziel, clientX: x, clientY: y });
  ziel.dispatchEvent(new TouchEvent(typ, { bubbles: true, touches: typ === 'touchend' || typ === 'touchcancel' ? [] : [t],
    changedTouches: [t] }));
}
// Mehrere Finger: [[x, y], …] liegen auf; der erste ist der vom Rand.
function finger2(typ, punkte) {
  var ziel = q('#ansicht'), ts = punkte.map(function (p, i) {
    return new Touch({ identifier: 3 + i, target: ziel, clientX: p[0], clientY: p[1] });
  });
  ziel.dispatchEvent(new TouchEvent(typ, { bubbles: true, touches: typ === 'touchend' ? [] : ts, changedTouches: ts }));
}
function abbild() { return q('body > .abbild'); }
function skala() {
  var m = /scale\(([-\d.]+)\)/.exec(q('#app').style.transform);
  return m ? parseFloat(m[1]) : 1;
}
function sauber() {
  return !abbild() && !q('#app').classList.contains('zieht') && !q('#app').classList.contains('bereit') &&
    !q('#app').style.transform && !q('#app').style.clipPath && !q('body > .zug-schatten') && !rueckZug;
}
function aufbauen() {
  frisch();
  kalTag = null;
  state.gewohnheiten = ['Lesen', 'Laufen', 'Wasser', 'Dehnen', 'Schreiben', 'Atmen', 'Gehen', 'Ruhe'].map(function (n, i) {
    return gewohnheitLesen({ id: 'g' + i, name: n, rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] });
  });
  state.termine = [terminLesen({ id: 'T', titel: 'Zahnarzt', tag: '2026-10-14', von: '09:30' })];
  zeige('home');
  ausbewegt();
}

// ── Z · Die Ansicht folgt dem Finger ──────────────────────────
aufbauen();
window.scrollTo(0, 200);
var gerollt = window.pageYOffset;
q('#menuKnopf').click();
q('[data-menue="einstellungen"]') ? q('[data-menue="einstellungen"]').click() : zeige('einstellungen');
ausbewegt();
finger('touchstart', 8, 400);
var frueh = abbild();
pruefe('Z0 liegt der Finger am Rand, steht das Abbild schon bereit, verdeckt von der Ansicht', !!frueh &&
  q('#app').classList.contains('bereit') && getComputedStyle(q('#app')).zIndex === '1' &&
  getComputedStyle(frueh).zIndex === '0' && document.elementFromPoint(200, 400).closest('#app') !== null);
finger('touchmove', 14, 401);
pruefe('Z1 unter der Schwelle von ' + ZUG_AB + ' px folgt noch nichts', !rueckZug && !q('#app').classList.contains('zieht'));
finger('touchmove', 108, 404);
return warten(50).then(function () {
  var a = abbild(), w = a && a.shadowRoot;
  pruefe('Z2a es ist dasselbe Abbild', abbild() === frueh &&
    alle('body > .abbild').length === 1);
  var app = q('#app').getBoundingClientRect();
  pruefe('Z2 darüber folgt die Ansicht dem Finger und wird zum Tropfen: kleiner, zum rechten Rand hin, runder',
    !!rueckZug && q('#app').classList.contains('zieht') && Math.abs(skala() - zugSkala(100, 430)) < 0.001 && skala() < 0.95 &&
    Math.abs(app.right - 430) < 0.5 && /round [1-9]/.test(q('#app').style.clipPath), q('#app').style.transform + ' ' + q('#app').style.clipPath);
  var sch = q('body > .zug-schatten');
  pruefe('Z2b ihr Schatten liegt als eigene Fläche darunter, gleich groß', !!sch && sch.style.transform === q('#app').style.transform);
  // Bis an den Rand gezogen bleibt sie ganz im Bild.
  finger('touchmove', 428, 404);
  return warten(50);
}).then(function () {
  var app = q('#app').getBoundingClientRect(), s = skala(), sicht = 932 * s;
  pruefe('Z2c bis an den Rand gezogen bleibt sie ganz im Bild', s < 0.6 && app.right <= 430.5 &&
    430 - 430 * s > 0, s);
  finger('touchmove', 108, 404);
  return warten(50);
}).then(function () {
  var a = abbild(), w = a && a.shadowRoot;
  pruefe('Z3 darunter liegt das Dashboard als stilles Abbild', !!w && !!w.querySelector('#ansicht .held') &&
    !!w.querySelector('#kopf #menuKnopf') && a.inert === true && a.getAttribute('aria-hidden') === 'true' &&
    getComputedStyle(a).pointerEvents === 'none', [!!w, w && !!w.querySelector('#ansicht .held'), w && !!w.querySelector('#kopf #menuKnopf'),
    a && a.inert, a && a.getAttribute('aria-hidden'), a && getComputedStyle(a).pointerEvents].join());
  pruefe('Z4 ohne doppelte Ids in der Seite', document.querySelectorAll('#ansicht').length === 1 &&
    document.querySelectorAll('#kopf').length === 1 && document.querySelectorAll('#menuKnopf').length === 0);
  var innen = w && w.querySelector('#app');
  pruefe('Z5 gerollt, wie das Dashboard beim Weggehen war', gerollt > 0 && !!innen &&
    innen.style.transform === 'translateY(' + px(-gerollt) + ')', (innen && innen.style.transform) + ' / ' + gerollt);
  pruefe('Z6 gewechselt wird erst beim Loslassen', ansicht === 'einstellungen');
  // Zurück unter die Schwelle und los: Sie federt zurück.
  finger('touchmove', 50, 404);
  return warten(200);
}).then(function () {
  finger('touchend', 50, 404);
  pruefe('Z7 unter der Schwelle losgelassen: Sie bleibt und federt zurück', ansicht === 'einstellungen' && !!rueckZug &&
    !!rueckZug.federt);
  ausbewegt();
  return warten(30);
}).then(function () {
  pruefe('Z8 zurückgefedert steht nichts mehr da', sauber() && ansicht === 'einstellungen');

  // Über der Schwelle: Sie fließt von dort, wo sie steht, als Tropfen in ihre Herkunft.
  finger('touchstart', 8, 400);
  finger('touchmove', 40, 401);
  finger('touchmove', 160, 404);
  return warten(200);
}).then(function () {
  finger('touchend', 160, 404);
  var h = alle('body > .tropfen-huelle').filter(function (x) { return x._fluss && x._fluss.p.ziel === 0; }).pop();
  pruefe('Z9 über der Schwelle losgelassen: Das Dashboard steht', ansicht === 'home' && sauber() &&
    !!q('#ansicht .held'), ansicht);
  var sl = zugSkala(152, 430);
  pruefe('Z10 die Ansicht fließt so geschrumpft, wie sie stand, als Tropfen in den Menüknopf', !!h &&
    Math.abs(parseFloat(h.style.left) - 430 * (1 - sl)) < 2 && Math.abs(parseFloat(h.style.width) - 430 * sl) < 2 &&
    Math.abs(parseFloat(h.style.top) - 466 * (1 - sl)) < 2 && h._fluss.p.ziel === 0 &&
    h._fluss.o.quelle().left === q('#menuKnopf').getBoundingClientRect().left, h && h.style.left);
  pruefe('Z11 das Dashboard blendet nicht noch einmal ein', !q('#ansicht').getAnimations().some(function (an) {
    return an.effect.getKeyframes().some(function (k) { return k.opacity !== undefined; });
  }) && !q('#kopf').getAnimations().length);
  pruefe('Z12 und steht so weit gerollt wie das Abbild', window.pageYOffset === gerollt, window.pageYOffset);
  return warten(RUHE);
}).then(function () {
  pruefe('Z13 angekommen bleibt keine Schicht zurück', !q('body > .tropfen-huelle') && !q('.fl-schicht') && sauber());

  // ── A · Abbruch ─────────────────────────────────────────────
  zeige('journal');
  ausbewegt();
  finger('touchstart', 8, 400);
  finger('touchmove', 8, 440);
  finger('touchmove', 130, 450);
  pruefe('A1 erst senkrecht ist Blättern: nichts folgt, das Abbild geht', !rueckZug && !abbild());
  finger('touchend', 130, 450);
  pruefe('A2 und nichts wechselt', ansicht === 'journal');

  finger('touchstart', 8, 400);
  finger('touchmove', 120, 404);
  finger('touchcancel', 120, 404);
  pruefe('A3 touchcancel: Sie federt zurück und bleibt', ansicht === 'journal' && !!rueckZug && !!rueckZug.federt);
  ausbewegt();
  return warten(30);
}).then(function () {
  pruefe('A4 danach ist alles wieder da', sauber());
  finger('touchstart', 8, 400);
  finger('touchmove', 140, 404);
  window.dispatchEvent(new Event('resize'));
  pruefe('A5 gedreht: Sie federt zurück', ansicht === 'journal' && !!rueckZug && !!rueckZug.federt);
  finger('touchend', 140, 404);
  pruefe('A6 und das Loslassen danach wechselt nicht', ansicht === 'journal');
  ausbewegt();
  return warten(30);
}).then(function () {
  pruefe('A7 auch dann bleibt nichts zurück', sauber());
  finger('touchstart', 8, 400);
  finger('touchend', 8, 400);
  pruefe('A7a ein Tipp am Rand läßt kein Abbild zurück', sauber() && ansicht === 'journal');
  // Ein zweiter Finger vor der Schwelle (James N10): Das vorbereitete Abbild
  // geht sofort, auch dreimal hintereinander.
  for (var i = 0; i < 3; i++) {
    finger('touchstart', 6, 600);
    finger2('touchstart', [[6, 600], [240, 610]]);
    finger2('touchend', [[6, 600], [240, 610]]);
  }
  pruefe('M1 ein zweiter Finger vor dem Zug läßt kein Abbild zurück', sauber() && ansicht === 'journal' &&
    !alle('body > .abbild').length && !wischVon, alle('body > .abbild').length);
  // Mitten im Zug, ohne weitere Bewegung: Abbruch, nicht nach Hause.
  finger('touchstart', 6, 600);
  finger('touchmove', 96, 600);
  finger('touchmove', 186, 600);
  finger2('touchstart', [[186, 600], [300, 600]]);
  pruefe('M2 ein zweiter Finger im Zug läßt die Ansicht sofort zurückfedern', !!rueckZug && !!rueckZug.federt);
  finger2('touchend', [[186, 600], [300, 600]]);
  pruefe('M3 und das Heben danach wechselt nicht', ansicht === 'journal', ansicht);
  ausbewegt();
  return warten(30);
}).then(function () {
  pruefe('M4 danach bleibt nichts zurück', sauber() && !alle('body > .abbild').length);
  // Ein kurzer, schneller Zug zählt wie ein weiter.
  finger('touchstart', 8, 400);
  finger('touchmove', 30, 400);
  return warten(12);
}).then(function () {
  finger('touchmove', 60, 401);
  finger('touchend', 60, 401);
  pruefe('A8 ein schneller kurzer Zug führt nach Hause', ansicht === 'home' && sauber(), ansicht);
  return warten(RUHE);
}).then(function () {
  // ── B · Wo es beim Wisch beim Loslassen bleibt ──────────────
  zeige('neu');
  ausbewegt();
  q('#gwName').focus();
  finger('touchstart', 8, 400);
  finger('touchmove', 140, 404);
  pruefe('B1 bei offener Tastatur folgt nichts', !rueckZug && !abbild());
  finger('touchend', 140, 404);
  pruefe('B2 der Wisch wirkt wie der Pfeil', ansicht === 'home');
  ausbewegt();
  zeige('export');
  zeige('termin', 'T');
  ausbewegt();
  finger('touchstart', 8, 400);
  finger('touchmove', 140, 404);
  pruefe('B3 führt der Rückweg nicht nach Hause (aus dem Export), folgt nichts', rueckZiel === 'export' && !rueckZug);
  finger('touchend', 140, 404);
  pruefe('B4 und er führt dorthin zurück', ansicht === 'export');
  ausbewegt();
  state.bewegung = 'aus';
  themaAnwenden();
  zeige('journal');
  finger('touchstart', 8, 400);
  finger('touchmove', 140, 404);
  pruefe('B5 bei Bewegung aus folgt nichts', !rueckZug && !abbild());
  finger('touchend', 140, 404);
  pruefe('B6 der Wisch führt trotzdem nach Hause', ansicht === 'home');
  state.bewegung = 'an';
  themaAnwenden();

  // ── L · Die Terminzeile leuchtet ────────────────────────────
  aufbauen();
  var zeile = q('[data-termin="T"]'), r = zeile.getBoundingClientRect();
  zeile.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: r.left + r.width * 0.8,
    clientY: r.top + r.height / 2, pointerType: 'touch' }));
  return warten(LANG_MS + 100);
}).then(function () {
  ausbewegt();
  pruefe('L0 lange gedrückt ist der Termin offen', ansicht === 'termin', ansicht);
  finger('touchstart', 8, 400);
  finger('touchmove', 40, 401);
  finger('touchmove', 170, 404);
  return warten(100);
}).then(function () {
  finger('touchend', 170, 404);
  pruefe('L1 noch unterwegs leuchtet nichts', !q('.leuchtet'));
  // Wann sie leuchtet: erst, wenn der Tropfen in ihr aufgegangen ist.
  var h = alle('body > .tropfen-huelle').filter(function (x) { return x._fluss && x._fluss.p.ziel === 0; }).pop();
  leuchtSpur = [];
  var spaeh = setInterval(function () {
    leuchtSpur.push([!!q('#ansicht [data-termin="T"].leuchtet'), !!(h && h.isConnected), alle('.leuchtet').length]);
  }, 20);
  return warten(RUHE + LEUCHT_DAUER).then(function () { clearInterval(spaeh); });
}).then(function () {
  var an = leuchtSpur.findIndex(function (x) { return x[0]; });
  pruefe('L2 nach dem Wisch leuchtet die Terminzeile, aus der er kam — sobald der Tropfen in ihr ist', ansicht === 'home' &&
    an > 0 && !leuchtSpur[an][1] && leuchtSpur.every(function (x) { return x[2] <= 1; }), JSON.stringify(leuchtSpur.slice(0, 40)));
  pruefe('L3 und hört wieder auf', !q('.leuchtet'));
}).then(function () {
  // Mit dem Pfeil
  var z = q('[data-termin="T"]'), r2 = z.getBoundingClientRect();
  z.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: r2.left + r2.width * 0.8,
    clientY: r2.top + r2.height / 2, pointerType: 'touch' }));
  return warten(LANG_MS + 100);
}).then(function () {
  ausbewegt();
  q('#zurueckKnopf').click();
  ausbewegt();
  leuchtSpur = [];
  var spaeh = setInterval(function () { leuchtSpur.push(!!q('#ansicht [data-termin="T"].leuchtet')); }, 20);
  return warten(RUHE + LEUCHT_DAUER).then(function () { clearInterval(spaeh); });
}).then(function () {
  pruefe('L4 nach dem Pfeil leuchtet sie ebenso', ansicht === 'home' && leuchtSpur.indexOf(true) >= 0 && !q('.leuchtet'));
}).then(function () {
  // Speichern: erst die Meldung, dann leuchtet die Zeile — kein zweites Zurückfließen.
  zeige('termin', 'T');
  ausbewegt();
  terminSpeichern();
  pruefe('L5 gespeichert: das Dashboard steht, die Meldung zeigt sich, nichts leuchtet', ansicht === 'home' &&
    !q('#hinweisBlatt').hidden && !q('.leuchtet'));
  hinweisSchliessen();
  ausbewegt();
  return warten(hinweisDauer + 50);
}).then(function () {
  pruefe('L6 fließt die Meldung in die Zeile, leuchtet sie', !!q('#ansicht [data-termin="T"].leuchtet'));
  return warten(LEUCHT_DAUER + 50);
}).then(function () {
  // Kein Termin: Der Menüknopf nickt, nichts leuchtet.
  zeige('journal');
  ausbewegt();
  q('#zurueckKnopf').click();
  ausbewegt();
  return warten(TROPFEN_DAUER + 50);
}).then(function () {
  pruefe('L7 ohne Termin als Herkunft leuchtet nichts', ansicht === 'home' && !q('.leuchtet'));
});
`);
