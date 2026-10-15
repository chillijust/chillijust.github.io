// Was ein Knopf öffnet, tropft aus ihm (0.11.0T, ADR 0032): Formularteile aus
// dem gewählten Knopf und zurück hinein, die Tage der Heatmap aus dem Punkt im
// Raster, die Zeilen von «Alle Tickets» aus ihrem Knopf. Dazu ist Glas im
// Tropfen dichter und gefaßt — bei gleichem Tempo —, damit man es sieht.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('tropfen', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function huellen() { return alle('body > .tropfen-huelle'); }
// Die Hülle fließt selbst (ADR 0054): woher sie quillt oder wohin sie fließt,
// sagt ihre Feder.
function fluss(h) { return h && h._fluss ? h._fluss.o : null; }
function quellMitte(h) {
  var r = fluss(h) && fluss(h).quelle();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: NaN, y: NaN };
}
function schatten(h) { var s = h && h.previousElementSibling; return s ? (s.style.filter.match(/drop-shadow/g) || []).length : 0; }
function nahe(p, r) { return Math.abs(p.x - (r.left + r.width / 2)) < 2 && Math.abs(p.y - (r.top + r.height / 2)) < 2; }
function alpha(farbe) { var m = /rgba?\(([^)]*)\)/.exec(farbe || ''); if (!m) return -1; var t = m[1].split(','); return t.length > 3 ? parseFloat(t[3]) : 1; }

// ── G · Glas im Tropfen ─────────────────────────────────────
frisch();
var wurzel = getComputedStyle(document.documentElement);
pruefe('G1 Glas hat eine dichte Tönung für unterwegs, dichter als die Karte',
  alpha(wurzel.getPropertyValue('--glas-tropfen')) >= 0.8 && alpha(wurzel.getPropertyValue('--glas-tropfen')) > alpha(wurzel.getPropertyValue('--glas')),
  wurzel.getPropertyValue('--glas-tropfen'));
var knopf = document.createElement('button');
knopf.style.cssText = 'position: fixed; left: 40px; top: 700px; width: 120px; height: 44px;';
document.body.appendChild(knopf);
hinweisZeigen('Hinzufügen', 'Was möchtest du an diesem Tag hinzufügen?', knopf.getBoundingClientRect(), knopf, { wahl: {
  knoepfe: [{ text: 'Termin', tun: function () {} }] } });
var h = q('body > .tropfen-huelle.glas'), o = fluss(h);
pruefe('G2 das Wahlfenster tropft aus dem Knopf, schneller als eine Ansicht (ADR 0013)', !!o &&
  nahe(quellMitte(h), knopf.getBoundingClientRect()) && o.schnell === fpKlemme(HINWEIS_DAUER / fluessigTakt('hinweis').dauer, 0.4, 2) &&
  o.schnell < 1);
pruefe('G3 unterwegs ist die Hülle dicht, am Ziel so getönt wie die Karte', !!o && alpha(o.farbe) >= 0.8 && alpha(o.farbeAmZiel) < 0.5,
  o && o.farbe + ' | ' + o.farbeAmZiel);
pruefe('G4 und trägt einen doppelten Schatten, mit Saum ums Glas', !!o && o.glas && schatten(h) === 2);
return durch().then(function () {
  hinweisSchliessen();
  var z = q('body > .tropfen-huelle.glas');
  pruefe('G5 zurück ebenso: dicht unterwegs, in den Knopf', !!fluss(z) && alpha(fluss(z).farbe) >= 0.8 &&
    nahe(quellMitte(z), knopf.getBoundingClientRect()));
  return durch();
}).then(function () {
  knopf.remove();

  // ── F · Formularteile tropfen aus ihrem Knopf ────────────────
  frisch();
  zeige('neu');
  ausbewegt();
  // Gemessen vor dem Tipp: Wird die Seite länger, schiebt die Bildlaufleiste
  // des kopflosen Browsers die Knöpfe danach um ein paar Pixel.
  var wt = q('[data-art="wochentage"]'), wtr = wt.getBoundingClientRect();
  wt.click();
  var h = huellen().slice(-1)[0];
  pruefe('F1 «Wochentage»: die Tage tropfen aus dem Knopf', !q('#rhTage').hidden && !!h && nahe(quellMitte(h), wtr) &&
    q('#rhTage').style.opacity === '0', JSON.stringify([quellMitte(h), wtr]));
  pruefe('F2 der Platz zieht sich auf der Feder des Tropfens auf', q('#rhTage').getAnimations().some(function (a) {
    return a.effect.getTiming().duration === taktBisZiel(fluessigTakt('ansichten', true)).dauer; }));
  pruefe('F3 die Hülle trägt den Grund ihrer Umgebung, keine Kante', !!h && h.style.background !== '' && !h.classList.contains('glas'),
    h && h.style.background);
  return durch();
}).then(function () {
  pruefe('F4 danach steht das Teil, sichtbar, ohne Hülle', !q('#rhTage').hidden && q('#rhTage').style.opacity === '' && !huellen().length);
  var tg = q('[data-art="taeglich"]'), tgr = tg.getBoundingClientRect();
  tg.click();
  var h = huellen().slice(-1)[0];
  pruefe('F5 «Täglich»: die Tage tropfen in den Knopf zurück', q('#rhTage').hidden && !!h &&
    nahe(quellMitte(h), tgr));
  return durch();
}).then(function () {
  pruefe('F6 danach ist aufgeräumt', !huellen().length && !alle('#app .geist').length);
  var er = q('#gwErinnern'), err = er.getBoundingClientRect();
  er.click();
  var h = huellen().slice(-1)[0];
  pruefe('F7 die Erinnerung: die Uhrzeit tropft aus dem Schalter', !q('#gwUhrTeil').hidden && !!h &&
    nahe(quellMitte(h), err));
  return durch();
}).then(function () {
  zeige('terminNeu', '2026-10-14');
  ausbewegt();
  var wo = q('[data-wdh="woechentlich"]'), wor = wo.getBoundingClientRect();
  wo.click();
  var h = huellen().slice(-1)[0];
  pruefe('F8 eine Wiederholung: «bis» tropft aus ihrem Knopf', !q('#tmEndeTeil').hidden && !!h &&
    nahe(quellMitte(h), wor));
  return durch();
}).then(function () {
  var gz = q('#tmGanz'), gzr = gz.getBoundingClientRect();
  gz.click();
  var h = huellen().slice(-1)[0];
  pruefe('F9 ganztags: die Zeiten tropfen in den Schalter', q('#tmZeiten').hidden && !!h &&
    nahe(quellMitte(h), gzr));
  return durch();
}).then(function () {
  state.bewegung = 'aus';
  q('#tmGanz').click();
  pruefe('F10 ohne Bewegung: das Teil steht sofort, kein Tropfen', !q('#tmZeiten').hidden && !huellen().length);
  state.bewegung = 'auto';

  // ── H · Heatmap: die Tage aus der getippten Woche ─────────────
  frisch();
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-06-01',
    erledigt: ['2026-10-12', '2026-10-13'] })];
  zeige('bearbeiten', 'A');
  ausbewegt();
  var zelle = q('#hmRaster [data-hm-tag="2026-09-02"]'), zr = zelle.getBoundingClientRect();
  q('#hmRaster').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: zr.left + zr.width / 2, clientY: zr.top + zr.height / 2 }));
  var h = huellen().slice(-1)[0];
  pruefe('H1 ein Tipp ins Raster: die Woche wechselt, ihre Tage tropfen aus dem Punkt', !!h &&
    q('#hmWoche').textContent.indexOf('KW 36') !== -1 && nahe(quellMitte(h), zr), q('#hmWoche').textContent.slice(0, 40));
  return durch();
}).then(function () {
  pruefe('H2 danach stehen die Tage', !huellen().length && q('#hmWoche').style.opacity === '');
  q('#hmWoche [data-hm-schritt="1"]').click();
  pruefe('H3 Blättern mit dem Pfeil tropft nicht', !huellen().length);

  // ── T · Alle Tickets: Zeilen aus dem Knopf ───────────────────
  frisch();
  state.tickets = [ticketLesen({ id: 'k1', art: 'fehler', titel: 'Eins', erstellt: 1 }),
    ticketLesen({ id: 'k2', art: 'wunsch', titel: 'Zwei', erstellt: 2 })];
  ticketBlattOeffnen(q('#ticketKnopf'));
  return durch();
}).then(function () {
  var alleKnopf = q('#tkAlle'), ar = alleKnopf.getBoundingClientRect();
  alleKnopf.click();
  var z = q('#ticketKarte .tk-zeile'), a = z.getAnimations()[0], k = a ? a.effect.getKeyframes() : [];
  // Die Zeile steht schon im ersten Bild (fill: backwards): ihre Lage ist die verschobene.
  var m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(k[0] && k[0].transform || ''), zr = z.getBoundingClientRect();
  pruefe('T1 jede Zeile beginnt als Perle unter «Alle Tickets»', !!m &&
    Math.abs(zr.left + 8 + 22 - (ar.left + ar.width / 2)) < 2 && k[k.length - 1].transform === 'none',
    k[0] && k[0].transform);
  pruefe('T2 nacheinander, wie zuvor', alle('#ticketKarte .tk-zeile').map(function (x) {
    return x.getAnimations()[0].effect.getTiming().delay; }).join() === '0,' + TK_STAFFEL);
  q('#tkListeZurueck').click();
  ticketBlattWechseln(true);
  var k2 = q('#ticketKarte .tk-zeile').getAnimations()[0].effect.getKeyframes();
  pruefe('T3 ohne Knopf (nach dem Speichern) tropfen sie an Ort und Stelle', !k2[0].transform || k2[0].transform === 'none');
  return durch();
}).then(function () {
  ticketBlattSchliessen();
  return durch();
}).then(function () {
  frisch();
  speichern();
});
`);
