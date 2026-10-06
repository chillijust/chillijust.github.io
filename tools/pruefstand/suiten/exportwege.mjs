// Die Wege hinaus (0.5.0T8): Die Knöpfe der Export-Kachel tropfen auf und zu,
// statt zu schnappen; unter «Bearbeiten» kommt «Markierung aufheben», wenn
// allein Dazugeholtes gewählt ist, und setzt es auf neu zurück; nach «Als
// Datei laden» steht ein Hinweis mittig, bis «OK» kommt. Er tropft wie die
// Ansichten — derselbe Weg, 60 % schneller (0.5.0T11, ADR 0013).
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('exportwege', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function laeuft(el) { return !!el && el.getAnimations().some(function (a) { return a.playState === 'running'; }); }
function geister() { return alle('body > .geist, #app .geist'); }
function tm(id, tag) { return terminLesen({ id: id, titel: id, tag: tag, von: '10:00', wiederholung: 'keine' }); }
function zeile(id) { return q('[data-termin="' + id + '"], [data-exwahl$=":' + id + '"]'); }
function laden() {
  var klickWar = HTMLAnchorElement.prototype.click, urlWar = URL.createObjectURL;
  URL.createObjectURL = function () { return 'blob:pruefung'; };
  HTMLAnchorElement.prototype.click = function () {};
  q('#exLaden').click();
  HTMLAnchorElement.prototype.click = klickWar;
  URL.createObjectURL = urlWar;
}
// Der Browser kürzt Ecken («0% 50% 50% 50%» wird «0% 50% 50%»): so vergleichen.
function token(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function offen() { return !q('#hinweisBlatt').hidden && q('#hinweisBlatt').classList.contains('offen'); }
function clips(el) {
  return el.getAnimations().map(function (a) { return a.effect.getKeyframes()[0].clipPath || ''; }).join();
}
Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });

frisch();
state.termine = [tm('kino', '2026-10-20'), tm('arzt', '2026-10-22')];
speichern();
zeige('export');
ausbewegt();
pruefe('W1 Neues: die Wege stehen offen, der Satz verborgen', !q('#exWege').hidden && q('#exNichts').hidden &&
  q('#exAufhebenTeil').hidden);

// ── H · Der Hinweis nach dem Laden ──────────────────────────
var vorher = q('#exLaden').getBoundingClientRect();
laden();
var karte = q('#hinweisKarte'), huelle = q('body > .tropfen-huelle');
function bilder(el) { var a = el && el.getAnimations()[0]; return a ? a.effect.getKeyframes() : []; }
function dauer(el) { var a = el && el.getAnimations()[0]; return a ? a.effect.getTiming().duration : 0; }
var erstes = bilder(huelle)[0] || {}, letztes = bilder(huelle).slice(-1)[0] || {};
pruefe('H1 statt der Meldung ein Hinweis, der wartet', offen() && q('#hinweisTitel').textContent === 'Datei geladen' &&
  /Öffne sie/.test(q('#hinweisText').textContent) && karte.getAttribute('role') === 'alertdialog' &&
  !q('#meldung').classList.contains('zeigt'));
var innen = huelle && huelle.firstChild && huelle.firstChild.shadowRoot && huelle.firstChild.shadowRoot.lastChild;
pruefe('H2a auch der Tropfen ist Glas, der Geist darin klar', !!huelle && huelle.classList.contains('glas') &&
  /blur\(/.test(getComputedStyle(huelle).backdropFilter || getComputedStyle(huelle).webkitBackdropFilter || '') &&
  !!innen && innen.classList.contains('im-tropfen') && getComputedStyle(innen).backgroundImage === 'none' &&
  /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(innen).backgroundColor));
pruefe('H2 er quillt mit dem Tropfen der Ansichten aus «Als Datei laden»', laeuft(huelle) &&
  dauer(huelle) === HINWEIS_DAUER && HINWEIS_DAUER === Math.round(TROPFEN_DAUER * 0.4) && bilder(huelle).length === 5 && Number(erstes.opacity) === 0 &&
  erstes.borderRadius === TROPFEN && Math.abs(parseFloat(erstes.left) + parseFloat(erstes.width) / 2 -
  (vorher.left + vorher.width / 2)) < 2 && letztes.borderRadius === '18px' && karte.style.opacity === '0',
  JSON.stringify([erstes, letztes]));
pruefe('H3 die Kachel hat ihre Knöpfe schon zugetropft', q('#exWege').hidden && !q('#exLaden').getClientRects().length &&
  !q('#exNichts').hidden &&
  !!q('#app .geist') && vorher.height > 0);
return durch().then(function () {
  var k = karte.getBoundingClientRect(), mx = innerWidth / 2, my = innerHeight / 2;
  pruefe('H4 mittig', Math.abs(k.left + k.width / 2 - mx) < 2 && Math.abs(k.top + k.height / 2 - my) < 2,
    [k.left, k.top, k.width, k.height, innerWidth, innerHeight].join());
  var kst = getComputedStyle(karte), glasFilter = kst.backdropFilter || kst.webkitBackdropFilter || '';
  pruefe('H4a die Karte ist aus Glas: getönt, durchscheinend, verschwommen', karte.classList.contains('glas') &&
    /blur\(/.test(glasFilter) && /saturate\(/.test(glasFilter) && /rgba\(.*0?\.\d+\)$/.test(kst.backgroundColor) &&
    !!token('--glas') && /inset/.test(kst.boxShadow), [glasFilter, kst.backgroundColor].join(' | '));
  var vorfahr = karte.parentElement, grenze = null;
  for (; vorfahr && vorfahr !== document.documentElement; vorfahr = vorfahr.parentElement) {
    var vs = getComputedStyle(vorfahr);
    if (Number(vs.opacity) < 1 || vs.filter !== 'none' || (vs.backdropFilter || 'none') !== 'none') grenze = vorfahr.id || vorfahr.className;
  }
  pruefe('H4b kein Vorfahr begrenzt das Glas — die Seite scheint durch, nicht nur der Schleier', grenze === null &&
    Number(getComputedStyle(q('#hinweisBlatt')).opacity) === 1, String(grenze));
  pruefe('H5 «OK» ist groß genug', q('#hinweisOk').getBoundingClientRect().height >= 44 &&
    q('#hinweisOk').textContent === 'OK');
  pruefe('H6 er duzt', !/(^|\s)(Sie|Ihnen)\b/.test(q('#hinweisBlatt').textContent));
  return warten(4000);   // eine Meldung wäre nach 2,6 s fort
}).then(function () {
  pruefe('H7 nach vier Sekunden steht er noch', offen());
  var r0 = karte.getBoundingClientRect();
  q('#hinweisOk').click();
  var zu = q('body > .tropfen-huelle'), z = q('#exZuletzt').getBoundingClientRect(), ende = bilder(zu)[3] || {};
  pruefe('H8 «OK» schließt sofort, der Tropfen fließt in «Zuletzt»', !offen() && laeuft(zu) &&
    dauer(zu) === HINWEIS_DAUER && (bilder(zu)[0] || {}).borderRadius === '18px' && ende.borderRadius === '50%' &&
    Math.abs(parseFloat(ende.top) + parseFloat(ende.height) / 2 - (z.top + z.height / 2)) < 2 &&
    karte.style.opacity === '0' && laeuft(q('#exZuletzt')) &&
    getComputedStyle(q('#hinweisBlatt')).pointerEvents === 'none', JSON.stringify(ende));
  var st = bilder(zu), form = (st[2] || {}).borderRadius;
  pruefe('H8a kurz vor dem Ziel ist er schon ein Tropfen und bleibt es', st.length === 5 &&
    st[2].offset === 0.4 && form === '50%' && form === st[3].borderRadius && form === st[4].borderRadius &&
    st[3].offset === 0.86 && parseFloat(st[2].width) < r0.width * 0.65, JSON.stringify(st.map(function (b) {
      return [b.offset, b.borderRadius, b.width]; })));
  pruefe('H8b der Tropfen ist rund, keine Spitze zeigt irgendwohin (ADR 0023)', st.every(function (b) {
    return !/(^|\s)0%/.test(b.borderRadius);
  }) && typeof tropfenSpitzeZu === 'undefined');
  pruefe('H8c die Ansichten behalten ihren Takt', TROPFEN_ZU_TAKT.join() === '0.38,0.7,0.9');
  pruefe('H8d auch zurück tropft er als Glas', zu.classList.contains('glas'));
  return durch();
}).then(function () {
  pruefe('H9 danach ist er weg', q('#hinweisBlatt').hidden && !laeuft(karte) && geister().length === 0 &&
    !q('body > .tropfen-huelle') && karte.style.opacity === '');
  var quelle = { left: 40, top: 600, width: 200, height: 50 }, fort = document.createElement('span');
  hinweisZeigen('Probe', 'Probe', quelle, fort);
  return durch();
}).then(function () {
  q('#hinweisOk').click();
  var rueck = bilder(q('body > .tropfen-huelle'))[3] || {};
  pruefe('H10 ist das Ziel nicht zu sehen, fließt er dorthin zurück, woher er kam',
    Math.abs(parseFloat(rueck.left) + parseFloat(rueck.width) / 2 - 140) < 2 &&
    Math.abs(parseFloat(rueck.top) + parseFloat(rueck.height) / 2 - 625) < 2, JSON.stringify(rueck));
  return durch();
}).then(function () {
  pruefe('H11 auch dann räumt er auf', q('#hinweisBlatt').hidden && !q('body > .tropfen-huelle'));

  // ── K · Die Kachel tropft auf und zu ──────────────────────
  q('#exBearbeiten').click();
  ausbewegt();
  zeile('kino').click();
  var wege = q('#exWege');
  pruefe('K1 die Wege sind sofort offen und tropfen auf', !wege.hidden && laeuft(wege) &&
    /round/.test(clips(q('#exLaden'))), clips(q('#exLaden')));
  pruefe('K2 der Satz zieht sich als Geist zusammen', q('#exNichts').hidden && geister().length === 1);
  return durch();
}).then(function () {
  pruefe('K3 danach ist alles ausgetropft', geister().length === 0 && !laeuft(q('#exWege')) &&
    !q('#exLaden').getAnimations().length);
  zeile('kino').click();
  var g = q('#app .geist');
  pruefe('K4 zu: die Wege gehen als Geist, die Knöpfe darin tropfen', q('#exWege').hidden && !q('#exNichts').hidden &&
    !!g && laeuft(g) && !!g.shadowRoot.querySelector('#exLaden') && laeuft(g.shadowRoot.querySelector('#exLaden')) &&
    !!g.shadowRoot.querySelector('#exAufheben'));
  return durch();
}).then(function () {
  pruefe('K5 und räumen sich auf', geister().length === 0);

  // ── A · Markierung aufheben ───────────────────────────────
  zeile('kino').click();
  pruefe('A1 nur Dazugeholtes gewählt: «Markierung aufheben» unter «Als Datei laden»', !q('#exAufhebenTeil').hidden &&
    q('#exAufheben').textContent === 'Markierung aufheben' &&
    q('#exLaden').compareDocumentPosition(q('#exAufheben')) === Node.DOCUMENT_POSITION_FOLLOWING &&
    q('#exAufheben').getBoundingClientRect().height >= 44);
  return durch();
}).then(function () {
  state.termine.push(tm('neu', '2026-10-25'));
  render();
  pruefe('A2 ist etwas Neues dabei, geht es', q('#exAufhebenTeil').hidden && !q('#exWege').hidden &&
    !!q('#app .geist') && laeuft(q('#app .geist')));
  return durch();
}).then(function () {
  state.termine.pop();
  render();
  pruefe('A3 ohne das Neue tropft es wieder auf', !q('#exAufhebenTeil').hidden && laeuft(q('#exAufheben')) &&
    /round/.test(clips(q('#exAufheben'))));
  return durch();
}).then(function () {
  q('#exBearbeiten').click();
  pruefe('A4 außerhalb von «Bearbeiten» nicht', q('#exAufhebenTeil').hidden && !q('#exAufheben').getClientRects().length && q('#exZahl').textContent === '1');
  q('#exBearbeiten').click();
  zeile('arzt').click();
  pruefe('A5 zwei gewählt, beide schon draußen', !q('#exAufhebenTeil').hidden && q('#exZahl').textContent === '2');
  q('#exAufheben').click();
  var gespeichert = JSON.parse(localStorage.getItem(SPEICHER));
  pruefe('A6 aufgehoben: beide gelten wieder als neu, gespeichert', terminNach('kino').imKalender === null &&
    terminNach('arzt').imKalender === null && exStatus('t', terminNach('kino')) === 'neu' &&
    gespeichert.termine.every(function (t) { return !t.imKalender; }));
  pruefe('A7 ohne Export, «Bearbeiten» ist zu, die Meldung sagt es', !exBearbeiten && !Object.keys(exportWahl).length &&
    q('#hinweisTitel').textContent === '2 Einträge gelten wieder als neu' && offen() &&
    q('#hinweisKarte').classList.contains('bestaetigung') && !q('#hinweisHaken').classList.contains('neutral') &&
    q('#exZahl').textContent === '2' && !q('.ex-alt') && !q('#exBearbeiten'));
  hinweisSchliessen();
  return durch();
}).then(function () {
  // ── O · Ohne Bewegung ─────────────────────────────────────
  var echt = bewegungAus;
  bewegungAus = function () { return true; };
  laden();
  pruefe('O1 ohne Bewegung: kein Geist, kein Tropfen', offen() && geister().length === 0 &&
    !q('body > .tropfen-huelle') && q('#hinweisKarte').style.opacity === '' && !q('#app .ex-wege').getAnimations().length);
  q('#hinweisOk').click();
  pruefe('O2 und «OK» schließt auf der Stelle', q('#hinweisBlatt').hidden);
  bewegungAus = echt;
});
`);
