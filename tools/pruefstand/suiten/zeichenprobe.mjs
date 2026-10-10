// Zeichenprobe (0.13.3T): Am Ende des Dashboards steht je Zeichen das heutige und
// drei neue Fassungen zur Wahl — Haken, Hinweis, Warnung (neu), Kopiert,
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
pruefe('K2 je Zeichen eine Reihe mit drei Fassungen', reihen.length === namen.length && namen.every(function (z) {
  return ['a', 'b', 'c'].every(function (v) { return !!q('#zeichenProbe [data-probe="' + z + ':' + v + '"] svg'); });
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
function ende(el) {
  var st = getComputedStyle(el), n = st.animationIterationCount === 'infinite' ? 99 : parseFloat(st.animationIterationCount) || 1;
  return st.animationName === 'none' ? 0 : parseFloat(st.animationDelay) + parseFloat(st.animationDuration) * n;
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
