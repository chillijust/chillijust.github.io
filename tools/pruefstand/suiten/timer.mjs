// Timer und Zähler (ADR 0038): Eine Gewohnheit wird angetippt, mit einem Timer
// gemacht oder gezählt. Der Timer läuft in einem Glasfenster, das aus der
// Kachel tropft, und läuft weiter, wenn es zugeht; abgehakt wird am Ende oder
// mit «Fertig». Der Zähler hakt beim ersten Tipp ab und zählt weiter; «−»
// nimmt einen zurück.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr — und wird
// von Hand vorgestellt.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('timer', html, String.raw`
var UHR = new Date(2026, 9, 14, 8, 0).getTime(), HEUTE = '2026-10-14', MIN = 60000;
jetzt = function () { return new Date(UHR); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
var gongs = 0;
gong = function () { gongs++; };
function gw(id, mehr) {
  var g = { id: id, name: id, rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] };
  for (var k in mehr) g[k] = mehr[k];
  return gewohnheitLesen(g);
}
function kachel(id) { return q('[data-haken="' + id + '"]'); }
function offen() { return !q('#timerBlatt').hidden && q('#timerBlatt').classList.contains('offen'); }
function g(id) { return gewohnheitNach(id); }

// ── D · Gespeichert wird, was paßt ───────────────────────────
var t1 = gw('a', { timer: { minuten: 20, stumm: true } });
pruefe('D1 ein Timer mit Minuten und «stumm»', t1.timer.minuten === 20 && t1.timer.stumm === true && t1.zaehler === false);
pruefe('D2 was nicht paßt, fällt weg', [0, 241, 1.5, '10'].every(function (m) { return gw('x', { timer: { minuten: m } }).timer === null; }));
pruefe('D3 Timer und Zähler schließen sich aus', gw('x', { timer: { minuten: 5 }, zaehler: true }).zaehler === false);
var z1 = gw('z', { zaehler: true, erledigt: ['2026-10-12', '2026-10-13'],
  zaehlung: { '2026-10-12': 3, '2026-10-13': 1, '2026-10-11': 5, '2026-10-10': 2.5 } });
pruefe('D4 gezählt wird nur, was über eins hinausgeht und erledigt ist', JSON.stringify(z1.zaehlung) === '{"2026-10-12":3}' &&
  zaehlStand(z1, '2026-10-12') === 3 && zaehlStand(z1, '2026-10-13') === 1 && zaehlStand(z1, '2026-10-11') === 0,
  JSON.stringify(z1.zaehlung));
var roh = { gewohnheiten: [{ id: 'a', name: 'a', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [],
  timer: { minuten: 10 } }, { id: 'b', name: 'b', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] }],
  timer: { id: 'a', tag: HEUTE, start: UHR, ms: 10 * MIN, stumm: false } };
pruefe('D5 ein laufender Timer übersteht das Laden', stand(roh).timer && stand(roh).timer.id === 'a');
roh.timer.id = 'b';
pruefe('D6 aber nur für eine Gewohnheit mit Timer', stand(roh).timer === null);

// ── F · Im Formular: Abhaken ─────────────────────────────────
frisch();
zeige('neu');
pruefe('F1 «Abhaken» bietet Antippen, Timer, Zähler', alle('[data-weise]').map(function (b) { return b.textContent; }).join() ===
  'Antippen,Timer,Zähler' && q('[data-weise="tipp"]').getAttribute('aria-pressed') === 'true' && q('#gwTimerTeil').hidden);
q('[data-richtung="ab"]').click();
pruefe('F2 beim Abgewöhnen gibt es das nicht', q('#gwWeise').hidden);
q('[data-richtung="an"]').click();
q('#gwName').value = 'Lesen'; q('#gwName').dispatchEvent(new Event('input'));
q('[data-weise="timer"]').click();
ausbewegt();
pruefe('F3 Timer zeigt Minuten und «Ton am Ende»', !q('#gwTimerTeil').hidden && q('#gwMinuten').value === '10' &&
  q('#gwTon').getAttribute('aria-checked') === 'true' && parseFloat(getComputedStyle(q('#gwMinuten')).fontSize) >= 16);
q('#gwMinuten').value = '0'; q('#gwMinuten').dispatchEvent(new Event('input'));
q('#gwSpeichern').click();
pruefe('F4 null Minuten gehen nicht', ansicht === 'neu' && state.gewohnheiten.length === 0);
q('#gwMinuten').value = '20'; q('#gwMinuten').dispatchEvent(new Event('input'));
q('#gwTon').click();
q('#gwSpeichern').click();
var lesen = state.gewohnheiten[0];
pruefe('F5 gespeichert: 20 Minuten, stumm', ansicht === 'home' && lesen && lesen.timer.minuten === 20 &&
  lesen.timer.stumm === true && !lesen.zaehler, JSON.stringify(lesen && lesen.timer));
zeige('bearbeiten', lesen.id);
pruefe('F6 beim Öffnen steht es wieder so da', q('[data-weise="timer"]').getAttribute('aria-pressed') === 'true' &&
  q('#gwMinuten').value === '20' && q('#gwTon').getAttribute('aria-checked') === 'false');
q('[data-weise="zaehler"]').click();
q('#gwSpeichern').click();
pruefe('F7 auf Zähler umgestellt: kein Timer mehr', lesen.zaehler === true && lesen.timer === null);
lesen.zaehlung[HEUTE] = 4; lesen.erledigt.push(HEUTE);
zeige('bearbeiten', lesen.id);
q('[data-weise="tipp"]').click();
q('#gwSpeichern').click();
pruefe('F8 zurück auf Antippen: die Haken bleiben, die Zahlen gehen', !lesen.zaehler &&
  JSON.stringify(lesen.zaehlung) === '{}' && lesen.erledigt.indexOf(HEUTE) !== -1);

// ── T · Der Timer ───────────────────────────────────────────
frisch();
state.gewohnheiten = [gw('lesen', { timer: { minuten: 20 } }), gw('turnen', { timer: { minuten: 5, stumm: true } }),
  gw('wasser', { zaehler: true })];
zeige('home');
ausbewegt();
pruefe('T0 die Kachel nennt die Dauer', /20 min/.test(kachel('lesen').textContent), kachel('lesen').textContent);
kachel('lesen').click();
var start = state.timer && state.timer.start;
pruefe('T1 ein Tipp startet den Timer, noch nicht abgehakt', !!state.timer && state.timer.id === 'lesen' &&
  state.timer.tag === HEUTE && state.timer.ms === 20 * MIN && !erledigtAm('lesen', HEUTE));
pruefe('T2 das Fenster tropft aus der Kachel, aus Glas', offen() && q('#timerKarte').classList.contains('glas') &&
  alle('body > .tropfen-huelle').length > 0 && q('#timerName').textContent === 'lesen' &&
  q('#timerKarte [data-timerrest]').textContent === '20:00');
ausbewegt();
pruefe('T3 Fertig, Abbrechen, Ton — groß genug', ['#timerFertig', '#timerAbbrechen', '#timerTon'].every(function (s) {
  var r = q(s).getBoundingClientRect(); return r.height >= 44 && r.width >= 44; }));
UHR += 5 * MIN;
takt();
pruefe('T4 er läuft: Fenster und Kachel zeigen die Restzeit', q('#timerKarte [data-timerrest]').textContent === '15:00' &&
  q('#app [data-timerkachel="lesen"] [data-timerrest]').textContent === '15:00' &&
  q('[data-timerkachel="lesen"]').classList.contains('laeuft'));
q('#timerBlatt').click();
pruefe('T5 danebentippen schließt das Fenster, der Timer läuft weiter', !offen() && !!state.timer);
return durch().then(function () {
  kachel('lesen').click();
  pruefe('T6 ein Tipp auf die Kachel holt das Fenster zurück, derselbe Lauf', offen() && state.timer.start === start);
  q('#timerTon').click();
  pruefe('T7 der Ton läßt sich für diesen Lauf abschalten', state.timer.stumm === true &&
    q('#timerTon').getAttribute('aria-pressed') === 'false' && g('lesen').timer.stumm === false);
  q('#timerTon').click();
  q('#timerAbbrechen').click();
  pruefe('T8 Abbrechen fragt erst', !!state.timer && q('#timerAbbrechen').textContent === 'Wirklich?');
  q('#timerAbbrechen').click();
  pruefe('T9 dann ist er fort, nichts abgehakt', !state.timer && !offen() && !erledigtAm('lesen', HEUTE));
  return durch();
}).then(function () {
  kachel('lesen').click();
  q('#timerFertig').click();
  pruefe('T10 «Fertig» hakt ab, ohne Gong', !state.timer && erledigtAm('lesen', HEUTE) && gongs === 0 && !offen());
  return durch();
}).then(function () {
  kachel('lesen').click();
  pruefe('T11 abgehakt nimmt ein Tipp den Haken zurück, wie sonst', !erledigtAm('lesen', HEUTE) && !state.timer);
  kachel('lesen').click();
  UHR += 20 * MIN;
  takt();
  pruefe('T12 durch: abgehakt, mit Gong', !state.timer && erledigtAm('lesen', HEUTE) && gongs === 1);
  return durch();
}).then(function () {
  kachel('turnen').click();
  UHR += 5 * MIN;
  takt();
  pruefe('T13 stumm: abgehakt, ohne Gong', erledigtAm('turnen', HEUTE) && gongs === 1);
  return durch();
}).then(function () {
  kachel('turnen').click();
  kachel('turnen').click();
  UHR += 3 * 60 * MIN;
  takt();
  pruefe('T14 lief er ab, während die App zu war: abgehakt, kein Gong Stunden später', erledigtAm('turnen', HEUTE) &&
    !state.timer && gongs === 1);
  return durch();
}).then(function () {
  frisch();
  state.gewohnheiten = [gw('lesen', { timer: { minuten: 20 } }), gw('turnen', { timer: { minuten: 5 } })];
  zeige('home');
  ausbewegt();
  kachel('lesen').click();
  q('#timerBlatt').click();
  return durch();
}).then(function () {
  kachel('turnen').click();
  pruefe('T15 ein zweiter Timer fragt erst im Glas', state.timer.id === 'lesen' && !q('#hinweisBlatt').hidden &&
    q('#hinweisTitel').textContent === 'Es läuft schon ein Timer');
  q('#hinweisOk').click();
  pruefe('T16 «Abbrechen, diesen starten»: einer läuft, der neue', state.timer.id === 'turnen' && offen());
  q('#timerBlatt').click();
  return durch();
}).then(function () {
  zeige('bearbeiten', 'turnen');
  q('#gwArchivieren').click(); q('#gwArchivieren').click();
  pruefe('T17 Archivieren beendet den Timer', !state.timer);
  pruefe('T18 der Sicherungscode trägt Timer, aber keinen Lauf', /"timer":\{"minuten":20/.test(ausBase64(sicherungsCode(UHR).split('~')[2])) &&
    !/"start"/.test(ausBase64(sicherungsCode(UHR).split('~')[2])));
  var ev = gewohnheitEreignis(gw('x', { erinnerung: '07:00', timer: { minuten: 20 } }), icsStempel(UHR));
  pruefe('T19 im Kalender so lang wie der Timer', ev.indexOf('DTEND:20261001T072000') !== -1, ev.join(' | '));

  // ── Z · Der Zähler ──────────────────────────────────────────
  frisch();
  state.gewohnheiten = [gw('wasser', { zaehler: true })];
  zeige('home');
  ausbewegt();
  kachel('wasser').click();
  pruefe('Z1 der erste Tipp zählt eins und hakt ab', erledigtAm('wasser', HEUTE) && zaehlStand(g('wasser'), HEUTE) === 1 &&
    q('#app .gw-zahl').textContent === '1');
  var minus = q('[data-minus="wasser"]');
  pruefe('Z2 daneben ein «−», groß genug', !!minus && minus.getBoundingClientRect().width >= 44 &&
    minus.getBoundingClientRect().height >= 44);
  kachel('wasser').click(); kachel('wasser').click();
  pruefe('Z3 weiter getippt, weiter gezählt', zaehlStand(g('wasser'), HEUTE) === 3 && g('wasser').zaehlung[HEUTE] === 3 &&
    /3× heute/.test(kachel('wasser').textContent));
  q('[data-minus="wasser"]').click();
  pruefe('Z4 «−» nimmt einen zurück', zaehlStand(g('wasser'), HEUTE) === 2 && erledigtAm('wasser', HEUTE));
  q('[data-minus="wasser"]').click(); q('[data-minus="wasser"]').click();
  pruefe('Z5 bei null ist der Haken weg und das «−» auch', !erledigtAm('wasser', HEUTE) && !q('[data-minus="wasser"]') &&
    JSON.stringify(g('wasser').zaehlung) === '{}');
  kachel('wasser').click(); kachel('wasser').click(); kachel('wasser').click();
  kalTag = HEUTE;
  render();
  var zeile = q('[data-nachtrag="wasser"]');
  pruefe('Z6 die Tagesliste nennt die Zahl', !!zeile && /3× erledigt/.test(zeile.textContent), zeile && zeile.textContent);
  zeile.click();
  pruefe('Z7 dort zurückgenommen ist auch die Zahl fort', !erledigtAm('wasser', HEUTE) && !g('wasser').zaehlung[HEUTE]);
  frisch();
  speichern();
});
`);
