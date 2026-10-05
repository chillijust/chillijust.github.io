// Die Wege hinaus (0.5.0T8): Die Knöpfe der Export-Kachel tropfen auf und zu,
// statt zu schnappen; unter «Bearbeiten» kommt «Markierung aufheben», wenn
// allein Dazugeholtes gewählt ist, und setzt es auf neu zurück; nach «Als
// Datei laden» steht ein Hinweis mittig, bis «OK» kommt.
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
var karte = q('#hinweisKarte'), erstes = laeuft(karte) ? karte.getAnimations()[0].effect.getKeyframes()[0] : {};
pruefe('H1 statt der Meldung ein Hinweis, der wartet', offen() && q('#hinweisTitel').textContent === 'Datei geladen' &&
  /Öffne sie/.test(q('#hinweisText').textContent) && karte.getAttribute('role') === 'alertdialog' &&
  !q('#meldung').classList.contains('zeigt'));
pruefe('H2 er quillt als Tropfen aus «Als Datei laden»', laeuft(karte) && Number(erstes.opacity) === 0 &&
  /translate\(/.test(erstes.transform) && /%/.test(erstes.borderRadius) && laeuft(q('#hinweisInhalt')), JSON.stringify(erstes));
pruefe('H3 die Kachel hat ihre Knöpfe schon zugetropft', q('#exWege').hidden && !q('#exLaden').getClientRects().length &&
  !q('#exNichts').hidden &&
  !!q('#app .geist') && vorher.height > 0);
return durch().then(function () {
  var k = karte.getBoundingClientRect(), mx = innerWidth / 2, my = innerHeight / 2;
  pruefe('H4 mittig', Math.abs(k.left + k.width / 2 - mx) < 2 && Math.abs(k.top + k.height / 2 - my) < 2,
    [k.left, k.top, k.width, k.height, innerWidth, innerHeight].join());
  pruefe('H5 «OK» ist groß genug', q('#hinweisOk').getBoundingClientRect().height >= 44 &&
    q('#hinweisOk').textContent === 'OK');
  pruefe('H6 er duzt', !/(^|\s)(Sie|Ihnen)\b/.test(q('#hinweisBlatt').textContent));
  return warten(4000);   // eine Meldung wäre nach 2,6 s fort
}).then(function () {
  pruefe('H7 nach vier Sekunden steht er noch', offen());
  q('#hinweisOk').click();
  pruefe('H8 «OK» schließt sofort, der Tropfen fließt in «Zuletzt»', !offen() && laeuft(karte) &&
    laeuft(q('#exZuletzt')) && getComputedStyle(q('#hinweisBlatt')).pointerEvents === 'none');
  return durch();
}).then(function () {
  pruefe('H9 danach ist er weg', q('#hinweisBlatt').hidden && !laeuft(karte) && geister().length === 0);

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
    /2 Einträge gelten wieder als neu/.test(q('#meldung').textContent) && !offen() && q('#exZahl').textContent === '2' &&
    !q('.ex-alt') && !q('#exBearbeiten'));
  return durch();
}).then(function () {
  // ── O · Ohne Bewegung ─────────────────────────────────────
  var echt = bewegungAus;
  bewegungAus = function () { return true; };
  laden();
  pruefe('O1 ohne Bewegung: kein Geist, kein Tropfen', offen() && geister().length === 0 &&
    !q('#hinweisKarte').getAnimations().length && !q('#app .ex-wege').getAnimations().length);
  q('#hinweisOk').click();
  pruefe('O2 und «OK» schließt auf der Stelle', q('#hinweisBlatt').hidden);
  bewegungAus = echt;
});
`);
