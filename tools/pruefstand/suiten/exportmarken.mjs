// Was schon im Kalender steht (ADR 0011): Jeder Eintrag merkt sich seinen
// Export; Neues geht immer mit, Exportiertes nur, wenn es unter «Bearbeiten»
// dazugeholt wird; Geändertes trägt einen Vermerk.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('exportmarken', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var HEUTE = '2026-10-14';
function tm(roh) {
  var t = { id: 't', titel: 'T', tag: HEUTE, von: '10:00', wiederholung: 'keine' };
  for (var k in roh) t[k] = roh[k];
  return terminLesen(t);
}
function gw(roh) {
  var g = { id: 'g', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] };
  for (var k in roh) g[k] = roh[k];
  return gewohnheitLesen(g);
}
function uids(text) { return (text.match(/UID:[^@]+/g) || []).map(function (u) { return u.slice(4); }).join(); }
function dateiLaden() {
  var blobs = [], klickWar = HTMLAnchorElement.prototype.click, urlWar = URL.createObjectURL;
  URL.createObjectURL = function (b) { blobs.push(b); return 'blob:pruefung'; };
  HTMLAnchorElement.prototype.click = function () {};
  q('#exLaden').click();
  HTMLAnchorElement.prototype.click = klickWar;
  URL.createObjectURL = urlWar;
  return blobs[0];
}
function zeile(id) { return q('[data-termin="' + id + '"], [data-exgw="' + id + '"], [data-exwahl$=":' + id + '"]'); }
Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });

frisch();
state.termine = [tm({ id: 'kino', titel: 'Kino', tag: '2026-10-20' }), tm({ id: 'arzt', titel: 'Arzt', tag: '2026-10-22', von: '09:00' })];
state.gewohnheiten = [gw({ id: 'lesen', erinnerung: '07:00' }), gw({ id: 'laufen', name: 'Laufen' })];
speichern();
zeige('export');

// ── A · Der Bestand ist offen ───────────────────────────────
pruefe('A1 ohne Marke ist alles neu und geht mit', exStatus('t', terminNach('kino')) === 'neu' &&
  q('#exZahl').textContent === '3' && !q('.ex-alt'));
pruefe('A2 nichts exportiert, kein «Bearbeiten»', !q('#exBearbeiten'));
pruefe('A3 ein alter Stand ohne Feld liest sich als neu', terminLesen({ id: 'x', titel: 'X', tag: HEUTE, von: '10:00' }).imKalender === null &&
  gw({ id: 'y' }).imKalender === null);
pruefe('A4 eine kaputte Marke auch', tm({ imKalender: { am: 'gestern', abdruck: 'ab' } }).imKalender === null &&
  tm({ imKalender: { am: 5, abdruck: '<script>' } }).imKalender === null);

// ── B · Exportieren setzt Marken ────────────────────────────
return dateiLaden().text().then(function (text) {
  pruefe('B1 die erste Datei trägt alles Neue', uids(text) === 'kino,arzt,lesen', uids(text));
  pruefe('B2 danach trägt jeder Eintrag seine Marke', ['kino', 'arzt'].every(function (id) {
    var t = terminNach(id); return t.imKalender && t.imKalender.am === zeitJetzt() && t.imKalender.abdruck === exAbdruck('t', t);
  }) && gewohnheitNach('lesen').imKalender && !gewohnheitNach('laufen').imKalender);
  var gespeichert = JSON.parse(localStorage.getItem(SPEICHER));
  pruefe('B3 gespeichert, und nach dem Laden noch da', !!gespeichert.termine[0].imKalender &&
    laden().termine[0].imKalender.abdruck === terminNach('kino').imKalender.abdruck);
  pruefe('B4 alles Exportierte ist abgedunkelt und sagt seit wann', alle('.ex-alt').length === 3 &&
    /im Kalender seit/.test(zeile('kino').textContent) && !zeile('laufen').classList.contains('ex-alt'));
  pruefe('B5 nichts mehr zu exportieren: keine Knöpfe, ein Satz', q('#exZahl').textContent === '0' && q('#exWege').hidden &&
    !q('#exLaden').getClientRects().length && !q('#exNichts').hidden);
  pruefe('B6 jetzt gibt es «Bearbeiten»', !!q('#exBearbeiten') && /3 Einträge stehen schon/.test(q('.ex-leiste').textContent));

  // ── C · Neues geht immer mit, nur das ─────────────────────
  state.termine.push(tm({ id: 'neu', titel: 'Neu', tag: '2026-10-25' }));
  render();
  pruefe('C1 ein neuer Termin zählt, der Rest nicht', q('#exZahl').textContent === '1' && !zeile('neu').classList.contains('ex-alt'));
  return dateiLaden().text();
}).then(function (text) {
  pruefe('C2 die Datei trägt nur ihn', uids(text) === 'neu', uids(text));

  // ── D · Geändert ──────────────────────────────────────────
  zeige('termin', 'kino');
  q('#tmTitel').value = 'Kino mit Anna';
  q('#tmTitel').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tmSpeichern').click();
  pruefe('D1 die Marke überlebt das Speichern', !!terminNach('kino').imKalender);
  zeige('export');
  pruefe('D2 geändert: Vermerk, weiter abgedunkelt, geht nicht von selbst', exStatus('t', terminNach('kino')) === 'geaendert' &&
    /geändert seit dem Export/.test(zeile('kino').textContent) && zeile('kino').classList.contains('ex-alt') &&
    q('#exZahl').textContent === '0');
  zeige('termin', 'kino');
  q('#tmTitel').value = 'Kino';
  q('#tmTitel').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tmSpeichern').click();
  zeige('export');
  pruefe('D3 zurückgeändert ist er wieder unverändert', exStatus('t', terminNach('kino')) === 'drin');
  var g = gewohnheitNach('lesen');
  umschalten('lesen', HEUTE);
  pruefe('D4 Abhaken ändert am Kalendereintrag nichts', exStatus('g', g) === 'drin');
  zeige('bearbeiten', 'lesen');
  q('#gwSpeichern').click();
  pruefe('D5 Speichern ohne Änderung auch nicht', exStatus('g', gewohnheitNach('lesen')) === 'drin');
  gewohnheitNach('lesen').erinnerung = '07:30';
  pruefe('D6 eine neue Uhrzeit schon', exStatus('g', gewohnheitNach('lesen')) === 'geaendert');
  gewohnheitNach('lesen').erinnerung = '07:00';

  // ── E · Bearbeiten ────────────────────────────────────────
  zeige('export');
  q('#exBearbeiten').click();
  pruefe('E1 «Bearbeiten» zeigt Kästchen, der Knopf heißt «Fertig»', exBearbeiten && q('#exBearbeiten').textContent === 'Fertig' &&
    alle('.ex-haken').length === 4 && /Tipp an/.test(q('.ex-leiste').textContent));
  pruefe('E2 Exportiertes ist abgewählt, nichts öffnet sich', zeile('kino').getAttribute('aria-pressed') === 'false' &&
    !q('#ansicht [data-termin]') && !q('#ansicht [data-exgw]'));
  pruefe('E3 die Gewohnheit ohne Uhrzeit ist nicht wählbar', q('.ex-gw.aus').getAttribute('aria-disabled') === 'true');
  zeile('kino').click();
  pruefe('E4 ein Tipp holt den Eintrag dazu', exportWahl['t:kino'] === true && zeile('kino').getAttribute('aria-pressed') === 'true' &&
    !zeile('kino').classList.contains('ex-alt') && /geht noch einmal mit/.test(zeile('kino').textContent) &&
    q('#exZahl').textContent === '1' && exBearbeiten);
  zeile('kino').click();
  pruefe('E5 ein zweiter nimmt ihn wieder heraus', !exportWahl['t:kino'] && q('#exZahl').textContent === '0');
  zeile('kino').click();
  zeile('lesen').click();
  q('#exBearbeiten').click();
  pruefe('E6 «Fertig» behält die Auswahl', !exBearbeiten && q('#exZahl').textContent === '2' && !!q('[data-termin="kino"]'));
  return dateiLaden().text();
}).then(function (text) {
  pruefe('E7 die Datei trägt genau das Dazugeholte', uids(text) === 'kino,lesen', uids(text));
  pruefe('E8 danach ist die Auswahl leer, alles wieder abgedunkelt', !Object.keys(exportWahl).length &&
    q('#exZahl').textContent === '0' && terminNach('kino').imKalender.am === zeitJetzt());
  q('#exBearbeiten').click();
  zeile('arzt').click();
  zeige('home');
  pruefe('E9 wer die Ansicht verläßt, verläßt «Bearbeiten»', !exBearbeiten);
  exportWahl = {};
  zeige('export');
  ausbewegt();
  var oben = alle('#ansicht .tm-zeile');
  pruefe('E10 Trefferflächen', oben.every(function (b) { return b.getBoundingClientRect().height >= 44; }) &&
    q('#exBearbeiten').getBoundingClientRect().height >= 44);
  pruefe('E11 die Ansicht duzt', !/(^|\s)(Sie|Ihnen)\b/.test(q('#app').innerText));
});
`);
