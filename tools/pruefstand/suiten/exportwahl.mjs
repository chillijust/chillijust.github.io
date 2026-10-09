// Auswählen, was hinausgeht (0.11.0T, ADR 0034): «Bearbeiten» gibt es immer;
// darin trägt jeder Abschnitt einen Schalter «alle», jeder Eintrag ein Häkchen.
// Neues läßt sich abwählen, und die Abwahl bleibt gemerkt; Dagewesenes holt
// man wie bisher dazu. Häkchen und Schalter tropfen aus «Bearbeiten».
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('exportwahl', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var HEUTE = '2026-10-14';
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function tm(id, titel, tag) { return terminLesen({ id: id, titel: titel, tag: tag, von: '10:00', wiederholung: 'keine' }); }
function gw(id, name) {
  return gewohnheitLesen({ id: id, name: name, rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [], erinnerung: '07:00' });
}
function uids() { return (kalenderDatei(HEUTE, zeitJetzt()).match(/UID:[^@]+/g) || []).map(function (u) { return u.slice(4); }).sort().join(); }
function zeile(id) { return q('[data-exwahl$=":' + id + '"]'); }
function aufbauen() {
  frisch();
  exportWahl = {};
  state.termine = [tm('kino', 'Kino', '2026-10-20'), tm('arzt', 'Arzt', '2026-10-22')];
  state.gewohnheiten = [gw('lesen', 'Lesen'), gw('laufen', 'Laufen')];
  speichern();
  zeige('export');
  ausbewegt();
}

// ── A · Häkchen je Eintrag ──────────────────────────────────
aufbauen();
pruefe('A1 «Bearbeiten» steht da, auch wenn noch nichts im Kalender ist', !!q('#exBearbeiten'));
q('#exBearbeiten').click();
ausbewegt();
pruefe('A2 jeder Eintrag trägt ein Häkchen, alles Neue ist gewählt', alle('#ansicht .ex-zeile').length === 4 &&
  alle('#ansicht .ex-zeile').every(function (z) { return z.getAttribute('aria-pressed') === 'true' && !!z.querySelector('.ex-haken.an'); }));
pruefe('A3 jeder Abschnitt trägt «alle», an', alle('#ansicht [data-exalle]').length === 2 &&
  alle('#ansicht [data-exalle]').every(function (b) { return b.getAttribute('aria-checked') === 'true'; }));
pruefe('A4 groß genug zum Tippen', alle('#ansicht [data-exalle], #ansicht .ex-zeile').every(function (b) {
  var r = b.getBoundingClientRect(); return r.height >= 44 && r.width >= 44; }));
zeile('kino').click();
pruefe('A5 ein Tipp wählt Neues ab: es bleibt draußen', !exMit('t', terminNach('kino')) && state.exportOhne['t:kino'] === true &&
  zeile('kino').getAttribute('aria-pressed') === 'false' && q('#exZahl').textContent === '3' && uids() === 'arzt,laufen,lesen', uids());
pruefe('A6 die Abwahl ist gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).exportOhne['t:kino'] === true);
pruefe('A7 und überlebt das Laden', laden().exportOhne['t:kino'] === true);
q('#exBearbeiten').click();
pruefe('A8 nach «Fertig» bleibt sie, abgedunkelt mit Vermerk', q('[data-termin="kino"]').classList.contains('ex-alt') &&
  /bleibt draußen/.test(q('[data-termin="kino"]').textContent) && /1 bleibt draußen/.test(q('.ex-leiste').textContent),
  q('.ex-leiste').textContent);

// ── K · Abschnitt «alle» ────────────────────────────────────
q('#exBearbeiten').click();
q('[data-exalle="g"]').click();
pruefe('K1 «alle» aus: keine Gewohnheit geht mit', !exMit('g', gewohnheitNach('lesen')) && !exMit('g', gewohnheitNach('laufen')) &&
  q('[data-exalle="g"]').getAttribute('aria-checked') === 'false' && uids() === 'arzt', uids());
q('[data-exalle="t"]').click();
pruefe('K2 bei Terminen ebenso; nichts gewählt, der Satz sagt es', uids() === '' && q('#exZahl').textContent === '0' &&
  !q('#exNichts').hidden && /Nichts ist gewählt/.test(q('#exNichts').textContent), q('#exNichts').textContent);
q('[data-exalle="t"]').click();
pruefe('K3 «alle» an: alle Termine wieder mit', exMit('t', terminNach('kino')) && exMit('t', terminNach('arzt')) &&
  !state.exportOhne['t:kino'] && q('[data-exalle="t"]').getAttribute('aria-checked') === 'true');
zeile('lesen').click();
pruefe('K4 ein Häkchen schaltet «alle» an', q('[data-exalle="g"]').getAttribute('aria-checked') === 'true' &&
  uids() === 'arzt,kino,lesen', uids());

// ── E · Export und Dagewesenes ─────────────────────────────
exportiertMerken(exportAuswahl(HEUTE));
zeige('export');
ausbewegt();
pruefe('E1 Exportiertes ist im Kalender, Abgewähltes bleibt neu und draußen', !!terminNach('kino').imKalender &&
  !gewohnheitNach('laufen').imKalender && state.exportOhne['g:laufen'] === true && q('#exZahl').textContent === '0');
q('#exBearbeiten').click();
q('[data-exalle="t"]').click();
pruefe('E2 «alle» bei lauter Dagewesenem holt alles noch einmal dazu', exMit('t', terminNach('kino')) &&
  exMit('t', terminNach('arzt')) && exportWahl['t:kino'] === true);
q('[data-exalle="t"]').click();
q('[data-exalle="g"]').click();
pruefe('E3 «alle» mit Neuem darunter holt nur das Neue', exMit('g', gewohnheitNach('laufen')) && !exMit('g', gewohnheitNach('lesen')));

// ── S · Speicher ────────────────────────────────────────────
pruefe('S1 Fremdes und Gelöschtes fällt beim Lesen heraus', JSON.stringify(stand({
  termine: [{ id: 'a', titel: 'A', tag: HEUTE, von: '10:00', wiederholung: 'keine' }],
  exportOhne: { 't:a': true, 't:weg': true, 'g:a': true, 't:b': 'ja' } }).exportOhne) === '{"t:a":true}');
pruefe('S2 ein leerer Stand wählt nichts ab', JSON.stringify(stand({}).exportOhne) === '{}');

// ── T · Tropfen aus «Bearbeiten» ────────────────────────────
aufbauen();
var kr = q('#exBearbeiten').getBoundingClientRect();
q('#exBearbeiten').click();
var h = q('#ansicht .ex-haken'), a = h && h.getAnimations()[0], k = a ? a.effect.getKeyframes() : [];
var m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(k[0] && k[0].transform || '');
pruefe('T1 die Häkchen tropfen aus «Bearbeiten»', !!m && k[k.length - 1].transform === 'none' && /scale/.test(k[0].transform),
  k[0] && k[0].transform);
var sa = q('[data-exalle]').getAnimations();
pruefe('T2 ebenso die Schalter, nacheinander', sa.length > 0 && alle('#ansicht .ex-haken').map(function (x) {
  return x.getAnimations()[0].effect.getTiming().delay; }).some(function (d) { return d > 0; }));
return durch().then(function () {
  q('#exBearbeiten').click();
  var geister = alle('body > .geist');
  pruefe('T3 «Fertig»: sie fließen als Geister in den Knopf zurück', geister.length === 6 &&
    geister.every(function (g) { return g.getAnimations().length > 0; }));
  return durch();
}).then(function () {
  pruefe('T4 danach ist aufgeräumt', !alle('body > .geist').length);

  // «alle» tropft auch (ADR 0036): Was sich ändert, rollt als Perle aus dem
  // Schalter an seinen Platz; was bleibt, steht still. Der Knauf gleitet.
  q('#exBearbeiten').click();
  ausbewegt();
  var sg = q('[data-exalle="g"]'), sr = sg.getBoundingClientRect();
  sg.click();
  sg = q('[data-exalle="g"]');
  var hl = zeile('lesen').querySelector('.ex-haken'), hf = zeile('laufen').querySelector('.ex-haken');
  var al = hl.getAnimations()[0], kl = al ? al.effect.getKeyframes() : [];
  var ml = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(kl[0] && kl[0].transform || '');
  var still = !q('[data-exwahl="t:kino"] .ex-haken').getAnimations().length && hf.getAnimations().length === 1;
  var gleitet = sg.querySelector('.schalter-knauf').getAnimations().length === 1 &&
    sg.querySelector('.schalter-spur').getAnimations().length === 1;
  ausbewegt();
  var hr = hl.getBoundingClientRect();
  pruefe('T6 «alle» aus: das Häkchen, das geht, tropft aus dem Schalter', !!ml && /scale/.test(kl[0].transform) &&
    Math.abs(hr.left + hr.width / 2 + parseFloat(ml[1]) - (sr.left + sr.width / 2)) < 3 &&
    Math.abs(hr.top + hr.height / 2 + parseFloat(ml[2]) - (sr.top + sr.height / 2)) < 3, kl[0] && kl[0].transform);
  pruefe('T7 was sich nicht ändert, steht still', still);
  pruefe('T8 der Knauf gleitet hinüber, statt zu springen', gleitet);
  return durch();
}).then(function () {
  q('[data-exalle="g"]').click();
  pruefe('T9 «alle» an: beide Häkchen tropfen, nacheinander', alle('[data-exwahl^="g:"] .ex-haken').map(function (x) {
    var a = x.getAnimations()[0]; return a ? a.effect.getTiming().delay : -1; }).join() === '0,45');
  ausbewegt();
  pruefe('T10 und stehen danach gewählt', alle('[data-exwahl^="g:"] .ex-haken.an').length === 2);
  q('#exBearbeiten').click();
  return durch();
}).then(function () {
  state.bewegung = 'aus';
  q('#exBearbeiten').click();
  pruefe('T5 ohne Bewegung steht alles sofort', !q('#ansicht .ex-haken').getAnimations().length);
  state.bewegung = 'auto';
  frisch();
  speichern();
});
`);
