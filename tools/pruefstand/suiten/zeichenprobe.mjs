// Zeichenprobe (0.13.3T, D nachgebessert bis 0.13.3T4): Am Ende des Dashboards steht je Zeichen das heutige und
// drei neue Fassungen zur Wahl, dazu D aus der Wahl des Nutzers (0.13.3T2) — Haken, Hinweis, Warnung (neu), Kopiert,
// Datei geladen. Ein Tipp zeigt die Fassung in einer echten Meldung; jede
// bewegt sich und ist fertig, bevor die Bestätigung geht. Danach trägt eine
// gewöhnliche Meldung wieder ihr heutiges Zeichen. Geht mit der Kachel.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('zeichenprobe', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function mitDaten() {
  frisch();
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] })];
  render();
}
function zeichen() { return q('#hinweisHaken'); }
var namen = Object.keys(ZEICHEN_PROBE);

// ── K · die Kachel ──────────────────────────────────────────
mitDaten();
var reihen = alle('#zeichenProbe .zp-reihe');
pruefe('K1 die Kachel steht als letzte auf dem Dashboard', !!q('#zeichenProbe') && !q('#zeichenProbe').nextElementSibling);
pruefe('K2 je Zeichen eine Reihe mit vier Fassungen', reihen.length === namen.length && namen.every(function (z) {
  return ['a', 'b', 'c', 'd'].every(function (v) { return !!q('#zeichenProbe [data-probe="' + z + ':' + v + '"] svg'); });
}), reihen.length);
pruefe('K3 das heutige steht daneben, wo es eins gibt', ZEICHEN.every(function (z) {
  return !!q('#zeichenProbe [data-probe="' + z + ':"] .hinweis-haken:not([data-variante])');
}) && !q('#zeichenProbe [data-probe="warnung:"]'));
pruefe('K4 jede Zelle ist groß genug zum Tippen', alle('#zeichenProbe button').every(function (b) {
  var r = b.getBoundingClientRect(); return r.height >= 44 && r.width >= 44;
}));
var breit = document.documentElement.clientWidth;
pruefe('K5 nichts ragt über den Rand', alle('#zeichenProbe .zp-zelle').every(function (b) {
  return b.getBoundingClientRect().right <= breit;
}));

// ── B · jede Fassung bewegt sich, kurz genug ────────────────
// Ein Teil kann mehrere Bewegungen tragen — jede zählt, die späteste entscheidet.
function ende(el) {
  var st = getComputedStyle(el);
  if (st.animationName === 'none') return 0;
  var warten = st.animationDelay.split(','), dauer = st.animationDuration.split(','), mal = st.animationIterationCount.split(',');
  return Math.max.apply(null, st.animationName.split(',').map(function (x, i) {
    var n = (mal[i % mal.length] || '1').trim(); n = n === 'infinite' ? 99 : parseFloat(n) || 1;
    return parseFloat(warten[i % warten.length]) + parseFloat(dauer[i % dauer.length]) * n;
  }));
}
q('#zpAlle').click();
var bericht = {};
var bewegt = alle('#zeichenProbe [data-variante]').every(function (s) {
  var teile = Array.prototype.slice.call(s.querySelectorAll('svg *')).filter(function (el) {
    return getComputedStyle(el).animationName !== 'none';
  });
  var laenge = Math.max.apply(null, teile.map(ende).concat([0]));
  bericht[s.getAttribute('data-zeichen') + s.getAttribute('data-variante')] = laenge;
  return s.classList.contains('zeichnet') && teile.length > 0 && laenge * 1000 <= BESTAETIGUNG_MS - 200;
});
pruefe('B1 «Alle abspielen»: jede Fassung bewegt sich und ist vor der Bestätigung fertig', bewegt, JSON.stringify(bericht));
pruefe('B2 das heutige bewegt sich mit', ZEICHEN.every(function (z) {
  return q('#zeichenProbe [data-probe="' + z + ':"] .hinweis-haken').classList.contains('zeichnet');
}));

// ── D · aus der Wahl, jede endet mit dem Puls ───────────────
function letzte(s) {
  var teile = Array.prototype.slice.call(s.querySelectorAll('svg *')).filter(function (el) {
    return getComputedStyle(el).animationName !== 'none'; });
  var spaet = Math.max.apply(null, teile.map(ende));
  return teile.filter(function (el) { return ende(el) === spaet; })[0];
}
var dZellen = alle('#zeichenProbe [data-variante="d"]');
pruefe('D1 jede D-Fassung endet mit dem Puls', dZellen.length === namen.length && dZellen.every(function (s) {
  var l = letzte(s); return l && l.classList.contains('zv-puls');
}));
pruefe('D5 der Puls zeigt sich nicht, solange er wartet', alle('#zeichenProbe .zv-puls').every(function (el) {
  var st = getComputedStyle(el); return st.animationName === 'none' || st.animationFillMode === 'forwards';
}));
var hd = q('#zeichenProbe [data-probe="hinweis:d"] .hinweis-haken');
pruefe('D2 Hinweis D: der Kreis um das i zeichnet sich, der Punkt fällt', getComputedStyle(hd.querySelector('.zv-rand')).animationName === 'z-zeichnen' &&
  getComputedStyle(hd.querySelector('.zv-punkt')).animationName === 'zv-tropfen');
// Kopiert D zeichnet erst, dann fächert es (0.13.3T3): Jede Verschiebung
// beginnt, wenn das letzte Blatt gezeichnet ist.
function laeufe(el) {
  var st = getComputedStyle(el), w = st.animationDelay.split(','), d = st.animationDuration.split(',');
  return st.animationName.split(',').map(function (n, i) { return { name: n.trim(), von: parseFloat(w[i]), bis: parseFloat(w[i]) + parseFloat(d[i]) }; });
}
var kopieD = ['.zv-hinten', '.zv-vorn'].map(function (sel) { return laeufe(q('#zeichenProbe [data-probe="kopie:d"] ' + sel)); });
var gezeichnet = Math.max.apply(null, kopieD.map(function (l) { return l.filter(function (x) { return x.name === 'z-zeichnen'; })[0].bis; }));
pruefe('D3 Kopiert D: erst zeichnen sich beide Blätter, dann fächern sie auf', kopieD.every(function (l) {
  var f = l.filter(function (x) { return x.name !== 'z-zeichnen'; });
  return f.length === 1 && f[0].von >= gezeichnet - 0.001;
}), JSON.stringify(kopieD));
var wd = q('#zeichenProbe [data-probe="warnung:d"] .hinweis-haken');
var wGezeichnet = Math.max.apply(null, ['.zv-dreieck', '.zv-ausruf', '.zv-punkt'].map(function (sel) { return ende(wd.querySelector(sel)); }));
var wWackeln = laeufe(wd.querySelector('.zv-wackeln'))[0];
pruefe('D6 Warnung D zeichnet sich wie A und wackelt erst danach wie B (0.13.3T4)',
  getComputedStyle(wd.querySelector('.zv-dreieck')).animationName === 'z-zeichnen' &&
  getComputedStyle(wd.querySelector('.zv-ausruf')).animationName === 'z-zeichnen' &&
  wWackeln.name === 'zv-wackeln' && wWackeln.von >= wGezeichnet - 0.001, JSON.stringify(wWackeln) + ' ' + wGezeichnet);
var ld = q('#zeichenProbe [data-probe="laden:d"] .hinweis-haken');
var schale = getComputedStyle(ld.querySelector('.zv-schale')).animationName;
pruefe('D4 Laden D: die Schale zeichnet sich und gibt nach, der Pfeil fliegt hinein', /z-zeichnen/.test(schale) &&
  /zv-tauchen/.test(schale) && getComputedStyle(ld.querySelector('.zv-pfeil')).animationName === 'zv-fallen', schale);

// ── M · als Meldung ─────────────────────────────────────────
q('#zeichenProbe [data-probe="warnung:b"]').click();
pruefe('M1 ein Tipp zeigt die Fassung als Meldung', !q('#hinweisBlatt').hidden &&
  zeichen().getAttribute('data-zeichen') === 'warnung' && zeichen().getAttribute('data-variante') === 'b' &&
  zeichen().classList.contains('warnend') && zeichen().classList.contains('zeichnet') && !!zeichen().querySelector('.zv-wackeln') &&
  /Fassung B/.test(q('#hinweisText').textContent));
hinweisSchliessen();
q('#zeichenProbe [data-probe="hinweis:c"]').click();
pruefe('M2 der Hinweis bleibt neutral, die Warnung geht', zeichen().classList.contains('neutral') &&
  !zeichen().classList.contains('warnend'));
hinweisSchliessen();
bestaetigen('Gespeichert', '', null, null);
pruefe('M3 danach trägt eine Meldung wieder ihr heutiges Zeichen', !zeichen().hasAttribute('data-variante') &&
  zeichen().getAttribute('data-zeichen') === 'haken' && !!zeichen().querySelector('.z-strich') && !zeichen().querySelector('.zv-scheibe'));
hinweisSchliessen();
q('#zeichenProbe [data-probe="haken:"]').click();
pruefe('M4 «Heute» zeigt das heutige', zeichen().getAttribute('data-zeichen') === 'haken' && !zeichen().hasAttribute('data-variante') &&
  /heute/.test(q('#hinweisText').textContent));
hinweisSchliessen();

// ── S · ohne Bewegung ───────────────────────────────────────
state.bewegung = 'aus';
themaAnwenden();
q('#zpAlle').click();
pruefe('S1 ohne Bewegung steht alles still und ist zu sehen', alle('#zeichenProbe [data-variante] svg *').every(function (el) {
  var st = getComputedStyle(el); return st.animationName === 'none';
}) && alle('#zeichenProbe .zv-scheibe').every(function (el) { return getComputedStyle(el).opacity === '1'; }));
state.bewegung = 'auto';
themaAnwenden();
frisch();
speichern();
`);
