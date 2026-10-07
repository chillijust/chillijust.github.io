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
pruefe('D1 ein Timer mit Minuten und «stumm»', t1.timer.minuten === 20 && t1.timer.stumm === true && t1.zaehler === null);
pruefe('D2 was nicht paßt, fällt weg', [0, 241, 1.5, '10'].every(function (m) { return gw('x', { timer: { minuten: m } }).timer === null; }));
pruefe('D3 Timer und Zähler schließen sich aus', gw('x', { timer: { minuten: 5 }, zaehler: true }).zaehler === null);
var z1 = gw('z', { zaehler: true, erledigt: ['2026-10-12', '2026-10-13'],
  zaehlung: { '2026-10-12': 3, '2026-10-13': 1, '2026-10-11': 5, '2026-10-10': 2.5 } });
pruefe('D4 gezählt wird die Menge erledigter Tage', JSON.stringify(z1.zaehlung) === '{"2026-10-12":3,"2026-10-13":1}' &&
  zaehlStand(z1, '2026-10-12') === 3 && zaehlStand(z1, '2026-10-13') === 1 && zaehlStand(z1, '2026-10-11') === 0,
  JSON.stringify(z1.zaehlung));
var roh = { gewohnheiten: [{ id: 'a', name: 'a', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [],
  timer: { minuten: 10 } }, { id: 'b', name: 'b', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] }],
  timer: { id: 'a', tag: HEUTE, start: UHR, ms: 10 * MIN, stumm: false } };
pruefe('D5 ein laufender Timer übersteht das Laden', stand(roh).timer && stand(roh).timer.id === 'a');
// ADR 0040: Schritt und Einheit; ein älterer Stand zählt in Einern.
pruefe('D7 ein älterer Zähler zählt in Einern', JSON.stringify(z1.zaehler) === '{"schritt":1,"einheit":""}');
var zl = gw('l', { zaehler: { schritt: 0.3, einheit: ' L ' } });
pruefe('D8 Schritt 0,3 und Einheit L', zl.zaehler.schritt === 0.3 && zl.zaehler.einheit === 'L');
pruefe('D9 ein Schritt, der nicht paßt, fällt weg', [0, -1, '0.3', 1001].every(function (x) {
  return gw('x', { zaehler: { schritt: x } }).zaehler === null; }));
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
pruefe('F7 auf Zähler umgestellt: kein Timer mehr', !!lesen.zaehler && lesen.zaehler.schritt === 1 && lesen.timer === null);
lesen.zaehlung[HEUTE] = 4; lesen.erledigt.push(HEUTE);
zeige('bearbeiten', lesen.id);
q('[data-weise="tipp"]').click();
q('#gwSpeichern').click();
pruefe('F8 zurück auf Antippen: die Haken bleiben, die Zahlen gehen', !lesen.zaehler &&
  JSON.stringify(lesen.zaehlung) === '{}' && lesen.erledigt.indexOf(HEUTE) !== -1);
zeige('bearbeiten', lesen.id);
q('[data-weise="zaehler"]').click();
ausbewegt();
pruefe('F9 Zähler zeigt «Je Tipp» und «Einheit», Schrift ab 16 px', !q('#gwZaehlerTeil').hidden && q('#gwSchritt').value === '1' &&
  ['#gwSchritt', '#gwEinheit'].every(function (s) { return parseFloat(getComputedStyle(q(s)).fontSize) >= 16; }));
q('#gwSchritt').value = '0,333'; q('#gwSchritt').dispatchEvent(new Event('input'));
q('#gwSpeichern').click();
pruefe('F10 mehr als zwei Stellen hinter dem Komma gehen nicht', ansicht === 'bearbeiten' && !lesen.zaehler);
q('#gwSchritt').value = '0,3'; q('#gwSchritt').dispatchEvent(new Event('input'));
q('#gwEinheit').value = 'L'; q('#gwEinheit').dispatchEvent(new Event('input'));
q('#gwSpeichern').click();
pruefe('F11 gespeichert: je Tipp 0,3 L', JSON.stringify(lesen.zaehler) === '{"schritt":0.3,"einheit":"L"}',
  JSON.stringify(lesen.zaehler));

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
var huelle = alle('body > .tropfen-huelle').pop(), b0 = huelle ? huelle.getAnimations()[0].effect.getKeyframes()[0] : {};
var sch = q('[data-haken="lesen"] .gw-scheibe').getBoundingClientRect();
pruefe('T2 das Fenster tropft aus der Kachel, aus Glas', offen() && q('#timerKarte').classList.contains('glas') &&
  !!huelle && q('#timerName').textContent === 'lesen' && q('#timerKarte [data-timerrest]').textContent === '20:00');
pruefe('T2a es beginnt klein, in der Scheibe — nicht so groß wie die Kachel (ADR 0040)', parseFloat(b0.width) <= 48 &&
  Math.abs(parseFloat(b0.left) + parseFloat(b0.width) / 2 - (sch.left + sch.width / 2)) < 2 &&
  Math.abs(parseFloat(b0.top) + parseFloat(b0.height) / 2 - (sch.top + sch.height / 2)) < 2, [b0.left, b0.top, b0.width].join());
ausbewegt();
pruefe('T3 Fertig, Abbrechen, Pause, Ton — groß genug', ['#timerFertig', '#timerAbbrechen', '#timerPause', '#timerTon'].every(function (s) {
  var r = q(s).getBoundingClientRect(); return r.height >= 44 && r.width >= 44; }));
var ringR = q('#timerKarte .timer-bild').getBoundingClientRect(), zeitR = q('#timerKarte .timer-zeit').getBoundingClientRect(),
  pauseR = q('#timerPause').getBoundingClientRect(), mx = ringR.left + ringR.width / 2, my = ringR.top + ringR.height / 2;
var ecken = [[pauseR.left, pauseR.top], [pauseR.right, pauseR.top], [pauseR.left, pauseR.bottom], [pauseR.right, pauseR.bottom]];
pruefe('T3a Pause steht im Ring, unter den Zahlen (ADR 0041)', pauseR.top >= zeitR.bottom - 1 &&
  Math.abs(pauseR.left + pauseR.width / 2 - mx) < 2 && ecken.every(function (e) {
    return Math.sqrt(Math.pow(e[0] - mx, 2) + Math.pow(e[1] - my, 2)) < ringR.width / 2 * 0.92; }),
  [pauseR.top, zeitR.bottom, ringR.width].join());
UHR += 5 * MIN;
takt();
pruefe('T4 er läuft: Fenster und Kachel zeigen die Restzeit', q('#timerKarte [data-timerrest]').textContent === '15:00' &&
  q('#app [data-timerkachel="lesen"] [data-timerrest]').textContent === '15:00' &&
  q('[data-timerkachel="lesen"]').classList.contains('laeuft'));
q('#timerPause').click();
UHR += 10 * MIN;
takt();
pruefe('T4a Pause hält die Zeit an', !!state.timer.pausiert && q('#timerKarte [data-timerrest]').textContent === '15:00' &&
  /pausiert/.test(q('#app [data-timerkachel="lesen"]').textContent) && q('#timerPause').getAttribute('aria-label') === 'Weiter' &&
  q('#timerKarte').classList.contains('pausiert'));
q('#timerPause').click();
UHR += 1 * MIN;
takt();
pruefe('T4b weiter läuft sie von dort, wo sie stand', !state.timer.pausiert && q('#timerKarte [data-timerrest]').textContent === '14:00' &&
  q('#timerPause').getAttribute('aria-label') === 'Pause');
q('#timerBlatt').click();
var hin = alle('body > .tropfen-huelle').pop(), b1 = hin ? hin.getAnimations()[0].effect.getKeyframes() : [];
pruefe('T5 danebentippen schließt das Fenster, der Timer läuft weiter', !offen() && !!state.timer);
pruefe('T5a zu fließt es in die Scheibe', b1.length > 0 && parseFloat(b1[b1.length - 1].width) <= 48, b1.length ? b1[b1.length - 1].width : '');
return durch().then(function () {
  kachel('lesen').click();
  pruefe('T6 ein Tipp auf die Kachel holt das Fenster zurück, derselbe Lauf', offen() && state.timer.start === start + 10 * MIN);
  q('#timerTon').click();
  pruefe('T7 der Ton läßt sich für diesen Lauf abschalten', state.timer.stumm === true &&
    q('#timerTon').getAttribute('aria-pressed') === 'false' && g('lesen').timer.stumm === false);
  q('#timerTon').click();
  q('#timerAbbrechen').click();
  pruefe('T8 Abbrechen fragt erst, im Glas über dem Timer (ADR 0041)', !!state.timer && q('#hinweisBlatt').classList.contains('offen') && !!hinweisFrage &&
    /Timer abbrechen/.test(q('#hinweisTitel').textContent) && offen());
  q('#hinweisOk').click();
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
  q('#gwArchivieren').click(); q('#hinweisOk').click();
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
  // ── S · Je Tipp 0,3 L (ADR 0040) ──────────────────────────────
  frisch();
  state.gewohnheiten = [gw('trinken', { zaehler: { schritt: 0.3, einheit: 'L' } })];
  zeige('home');
  ausbewegt();
  for (var i = 0; i < 4; i++) kachel('trinken').click();
  pruefe('S1 viermal getippt sind 1,2 L — ohne Rundungsrest', zaehlStand(g('trinken'), HEUTE) === 1.2 &&
    /1,2 L heute/.test(kachel('trinken').textContent) && q('#app .gw-zahl').textContent === '1,2', zaehlStand(g('trinken'), HEUTE));
  q('[data-minus="trinken"]').click();
  pruefe('S2 «−» nimmt 0,3 zurück', zaehlStand(g('trinken'), HEUTE) === 0.9);
  for (var j = 0; j < 3; j++) q('[data-minus="trinken"]').click();
  pruefe('S3 bei null ist der Haken weg', !erledigtAm('trinken', HEUTE) && !q('[data-minus="trinken"]'));
  for (var m = 0; m < 34; m++) kachel('trinken').click();
  pruefe('S4 eine lange Zahl paßt kleiner in die Scheibe', q('#app .gw-zahl').textContent === '10,2' &&
    q('#app .gw-zahl').classList.contains('lang') && q('#app .gw-zahl').getBoundingClientRect().width <=
    q('#app .gw-scheibe').getBoundingClientRect().width, q('#app .gw-zahl').textContent);
  kalTag = HEUTE;
  render();
  pruefe('S5 die Tagesliste nennt die Menge', /10,2 L erledigt/.test(q('[data-nachtrag="trinken"]').textContent));
  // Jubel und «Angelegt» hängen an der Scheibe, nicht an der Kachel.
  frisch();
  state.gewohnheiten = [gw('neu', {})];
  kalTag = null;
  zeige('home');
  ausbewegt();
  q('#hinweisBlatt').classList.remove('offen');
  q('#hinweisBlatt').hidden = true;
  jubeln('Probe', '', 'neu');
  pruefe('S6 der Jubel tropft aus der Scheibe', !!hinweisQuelle && hinweisQuelle.width <= 48 &&
    hinweisZiel === q('[data-haken="neu"] .gw-scheibe'));
  hinweisSchliessen();
  frisch();
  speichern();
});
`);
