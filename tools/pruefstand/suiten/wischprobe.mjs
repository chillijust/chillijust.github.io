// Wischprobe (0.15.0T3): drei kleine Kalender am Ende des Dashboards, je eine
// Art zu blättern — Karussell, Schieben und Blenden, Tropfen. Sie folgen dem
// Finger, rasten nach Weg oder Schwung ein, federn sonst zurück; ein Pfeil
// spielt dieselbe Bewegung. Der echte Kalender bleibt davon unberührt.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026 (KW 42).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('wischprobe', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
var HEUTE = '2026-10-14';
function aufbauen() {
  frisch();
  wpArt = 'woche'; wpGefuehl = 'eins'; wpVersatz = { a: 0, b: 0, c: 0 };
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(HEUTE, -20), erledigt: [] })];
  zeige('home');
}
function karte(v) { return q('[data-wp="' + v + '"]'); }
function seite(v, r) { return karte(v).querySelector('[data-rolle="' + r + '"]'); }
function titel(v) { return seite(v, 'jetzt').querySelector('.kal-titel').textContent; }
function zeiger(typ, el, x, y) {
  el.dispatchEvent(new PointerEvent(typ, { bubbles: true, pointerId: 3, isPrimary: true, pointerType: 'touch', clientX: x, clientY: y }));
}
function mitte(v) { var r = karte(v).querySelector('.wp-fenster').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 60 }; }
// Ein Zug in Schritten, je «dt» ms auseinander; dann loslassen.
function ziehen(v, dx, dy, schritte, dt) {
  var f = karte(v).querySelector('.wp-fenster'), m = mitte(v), i = 0;
  zeiger('pointerdown', f, m.x, m.y);
  return new Promise(function (fertig) {
    (function weiter() {
      i++;
      zeiger('pointermove', f, m.x + dx * i / schritte, m.y + dy * i / schritte);
      if (i < schritte) setTimeout(weiter, dt); else fertig();
    }());
  });
}
function los(v, x, y) { var m = mitte(v); zeiger('pointerup', karte(v), x === undefined ? m.x : x, y === undefined ? m.y : y); }
var RUHE = Math.max(WP_DAUER.a, WP_DAUER.b, WP_DAUER.c) + 400;

// ── A · Aufbau ──────────────────────────────────────────────
aufbauen();
pruefe('A1 die Probe steht am Ende des Dashboards, mit drei Kalendern',
  !!q('#app #wischProbe') && q('#ansicht').lastElementChild.id === 'wischProbe' &&
  alle('#wischProbe .wp-karte').length === 3);
pruefe('A2 jeder zeigt die laufende Woche, mit Titel, Wochentagen und Tagen', ['a', 'b', 'c'].every(function (v) {
  return titel(v) === 'KW 42 · 12.–18. Oktober' && seite(v, 'jetzt').querySelectorAll('.kal-wt').length === 7 &&
    seite(v, 'jetzt').querySelectorAll('.kal-tag').length === 7;
}));
pruefe('A3 die Tage der Probe tragen kein Ziel des echten Kalenders', !q('#wischProbe [data-kaltag]') &&
  !q('#wischProbe button.kal-tag'));
pruefe('A4 die Pfeile liegen außerhalb dessen, was gleitet', alle('#wischProbe [data-wp-schritt]').length === 6 &&
  !q('#wischProbe .wp-fenster [data-wp-schritt]'));
pruefe('A5 Pfeile groß genug', alle('#wischProbe [data-wp-schritt]').every(function (b) {
  var r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44;
}));
pruefe('A6 das Fenster läßt senkrecht die Seite rollen', getComputedStyle(karte('a').querySelector('.wp-fenster')).touchAction === 'pan-y');

// ── Z · Ziehen ──────────────────────────────────────────────
return ziehen('a', -100, 4, 10, 60).then(function () {
  pruefe('Z1 Karussell: die Seite geht 1:1 mit dem Finger', /\(-100px\)/.test(seite('a', 'jetzt').style.transform), seite('a', 'jetzt').style.transform);
  pruefe('Z2 die nächste Woche hängt daneben und ist zu sehen', getComputedStyle(seite('a', 'danach')).visibility === 'visible');
  pruefe('Z3 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);
  pruefe('Z4 der echte Kalender bleibt stehen', kalVersatz === 0);
  los('a', mitte('a').x - 100);
  return warten(RUHE);
}).then(function () {
  pruefe('Z5 kurz und langsam: federt zurück', wpVersatz.a === 0 && !seite('a', 'jetzt').style.transform &&
    titel('a') === 'KW 42 · 12.–18. Oktober');
  return ziehen('a', -200, 0, 8, 40);
}).then(function () {
  los('a', mitte('a').x - 200);
  return warten(RUHE);
}).then(function () {
  pruefe('Z6 weit genug: die nächste Woche rastet ein, Titel mit', wpVersatz.a === 1 && titel('a') === 'KW 43 · 19.–25. Oktober', titel('a'));
  return ziehen('a', 40, 0, 2, 20);
}).then(function () {
  los('a', mitte('a').x + 40);
  return warten(RUHE);
}).then(function () {
  pruefe('Z7 ein kurzer, schneller Schubs blättert auch — zurück', wpVersatz.a === 0, wpVersatz.a);
  return ziehen('a', -20, 120, 4, 30);
}).then(function () {
  los('a', mitte('a').x - 20, mitte('a').y + 120);
  return warten(RUHE);
}).then(function () {
  pruefe('Z8 eher nach unten: nichts gleitet, nichts blättert', wpVersatz.a === 0 && !seite('a', 'jetzt').style.transform);
  var f = karte('a').querySelector('.wp-fenster'), r = f.getBoundingClientRect();
  zeiger('pointerdown', f, 6, r.top + 60);
  zeiger('pointermove', f, 200, r.top + 60);
  zeiger('pointerup', f, 200, r.top + 60);
  pruefe('Z9 am Rand beginnt kein Blättern', wpVersatz.a === 0 && !seite('a', 'jetzt').style.transform);
  // Abgebrochen (das System nimmt den Finger): zurück.
  return ziehen('a', -220, 0, 6, 30);
}).then(function () {
  zeiger('pointercancel', karte('a'), 0, 0);
  return warten(RUHE);
}).then(function () {
  pruefe('Z10 abgebrochen: zurück, nicht geblättert', wpVersatz.a === 0 && !seite('a', 'jetzt').style.transform);

  // ── G · Gebremst ────────────────────────────────────────────
  q('[data-wp-gefuehl="bremse"]').click();
  return ziehen('a', -100, 0, 10, 60);
}).then(function () {
  pruefe('G1 gebremst: halb so weit wie der Finger', /\(-50px\)/.test(seite('a', 'jetzt').style.transform), seite('a', 'jetzt').style.transform);
  los('a', mitte('a').x - 100);
  return warten(RUHE);
}).then(function () {
  pruefe('G2 kurz und langsam federt auch gebremst zurück', wpVersatz.a === 0, wpVersatz.a);
  return ziehen('a', -200, 0, 20, 60);
}).then(function () {
  los('a', mitte('a').x - 200);
  return warten(RUHE);
}).then(function () {
  pruefe('G3 geblättert wird nach dem Weg des Fingers, nicht des Bilds', wpVersatz.a === 1, wpVersatz.a);
  q('[data-wp-gefuehl="eins"]').click();

  // ── B, C · Die anderen Arten ─────────────────────────────────
  return ziehen('b', -150, 0, 5, 30);
}).then(function () {
  var j = seite('b', 'jetzt'), n = seite('b', 'danach');
  pruefe('B1 Schieben und Blenden: die alte geht mit und blendet aus', /\(-150px\)/.test(j.style.transform) && +j.style.opacity < 1);
  pruefe('B2 die neue blendet von der Seite her auf', +n.style.opacity > 0 && /translateX\(\d/.test(n.style.transform));
  los('b', mitte('b').x - 150);
  return warten(RUHE);
}).then(function () {
  pruefe('B3 und rastet ein', wpVersatz.b === 1 && titel('b') === 'KW 43 · 19.–25. Oktober');
  return ziehen('c', 150, 0, 5, 30);
}).then(function () {
  var j = seite('c', 'jetzt'), n = seite('c', 'davor');
  pruefe('C1 Tropfen: die alte zieht sich zusammen, die neue quillt', /inset/.test(j.style.clipPath) && /inset/.test(n.style.clipPath) &&
    getComputedStyle(n).visibility === 'visible');
  los('c', mitte('c').x + 150);
  return warten(RUHE);
}).then(function () {
  pruefe('C2 nach rechts: die Woche davor', wpVersatz.c === -1 && titel('c') === 'KW 41 · 5.–11. Oktober');
  pruefe('C3 danach steht alles wieder still', ['jetzt', 'davor', 'danach'].every(function (r) {
    var s = seite('c', r); return !s.style.clipPath && !s.style.transform && !s.style.opacity;
  }) && !karte('c').querySelector('.wp-spur').style.height);

  // ── P · Pfeile ────────────────────────────────────────────
  karte('b').querySelector('[data-wp-schritt="1"]').click();
  return warten(60);
}).then(function () {
  pruefe('P1 ein Pfeil spielt dieselbe Bewegung', !!seite('b', 'jetzt').style.transform && wpVersatz.b === 1);
  return warten(RUHE);
}).then(function () {
  pruefe('P2 und blättert danach', wpVersatz.b === 2 && titel('b') === 'KW 44 · 26. Okt. – 1. Nov.', titel('b'));

  // ── M · Monat ─────────────────────────────────────────────
  q('[data-wp-art="monat"]').click();
  pruefe('M1 im Monat: alle drei auf dem laufenden Monat', ['a', 'b', 'c'].every(function (v) { return titel(v) === 'Oktober 2026'; }) &&
    wpVersatz.a === 0 && wpVersatz.b === 0 && wpVersatz.c === 0);
  return ziehen('a', -200, 0, 8, 40);
}).then(function () {
  var h = parseFloat(karte('a').querySelector('.wp-spur').style.height);
  pruefe('M2 die Höhe gleitet beim Ziehen mit', h > 0, karte('a').querySelector('.wp-spur').style.height);
  los('a', mitte('a').x - 200);
  return warten(RUHE);
}).then(function () {
  var spur = karte('a').querySelector('.wp-spur');
  pruefe('M3 November rastet ein, die Spur ist so hoch wie er', titel('a') === 'November 2026' && !spur.style.height &&
    Math.abs(spur.offsetHeight - seite('a', 'jetzt').offsetHeight) < 1);

  // ── O · Ohne Bewegung ─────────────────────────────────────
  state.bewegung = 'aus';
  karte('a').querySelector('[data-wp-schritt="1"]').click();
  pruefe('O1 ohne Bewegung blättert ein Pfeil sofort', titel('a') === 'Dezember 2026');
  state.bewegung = 'an';
  pruefe('O2 der echte Kalender blieb die ganze Zeit stehen', kalVersatz === 0 && state.kalender === 'woche');
  frisch();
});
`);
