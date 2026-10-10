// Zeichen, die sich bewegen (ADR 0035, neu bewegt in 0.14.0T, ADR 0051): Jedes
// Zeichen der Meldung malt seine Scheibe selbst und endet mit dem Puls — der
// Haken schließt erst den Kreis, beim Hinweis zeichnet sich der Kreis und der
// Punkt fällt, die Warnung zeichnet sich und wackelt, «Kopiert» zeichnet zwei
// Blätter und fächert sie auf, «Datei geladen» zeichnet die Schale, der Pfeil
// fliegt hinein, die Schale gibt nach. Ein Fehlschlag trägt die Warnung, ein
// Eingabehinweis das «i». Auf der Kachel zeichnet sich der Haken wie bisher.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('zeichen', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function zeichen() { return q('#hinweisHaken'); }
function anim(sel) { var el = q(sel); return el ? getComputedStyle(el).animationName : 'fehlt'; }
// Alle Bewegungen eines Teils: Name, Beginn, Ende in Sekunden.
function laeufe(el) {
  var st = getComputedStyle(el);
  if (st.animationName === 'none') return [];
  var w = st.animationDelay.split(','), d = st.animationDuration.split(','), m = st.animationIterationCount.split(',');
  return st.animationName.split(',').map(function (n, i) {
    var mal = parseFloat(m[i % m.length]) || 1, von = parseFloat(w[i % w.length]);
    return { name: n.trim(), von: von, bis: von + parseFloat(d[i % d.length]) * mal };
  });
}
function ende(el) { return Math.max.apply(null, laeufe(el).map(function (l) { return l.bis; }).concat([0])); }
var ALLE = ['haken', 'hinweis', 'warnung', 'kopie', 'laden'];
function probe(name) {
  var d = document.createElement('span');
  d.className = 'hinweis-haken zeichnet' + (name === 'hinweis' ? ' neutral' : name === 'warnung' ? ' warnend' : '');
  d.setAttribute('data-zeichen', name);
  d.innerHTML = zeichenBild(name);
  q('#app').appendChild(d);
  return d;
}
var ok = function (t, f) { f(true); };
kopieren = ok;

// ── G · im Glas ─────────────────────────────────────────────
frisch();
bestaetigen('Gespeichert', '', null, null);
pruefe('G1 «Gespeichert»: der Kreis schließt sich, der Haken zieht sich, der Puls folgt',
  zeichen().getAttribute('data-zeichen') === 'haken' && zeichen().classList.contains('zeichnet') &&
  anim('#hinweisHaken .zm-kreis') === 'z-zeichnen' && anim('#hinweisHaken .zm-haken') === 'z-zeichnen' &&
  anim('#hinweisHaken .zm-puls') === 'zm-puls' && q('#hinweisHaken .zm-haken').getAttribute('pathLength') === '1');
hinweisSchliessen();
melden('Gib ihr noch einen Namen.');
pruefe('G2 ein Eingabehinweis: das «i», der Kreis zeichnet sich, der Punkt fällt',
  zeichen().getAttribute('data-zeichen') === 'hinweis' && zeichen().classList.contains('neutral') &&
  !zeichen().classList.contains('warnend') && anim('#hinweisHaken .zm-rand') === 'z-zeichnen' &&
  anim('#hinweisHaken .zm-punkt') === 'zm-tropfen' && anim('#hinweisHaken .zm-i') === 'z-zeichnen');
hinweisSchliessen();
bestaetigen('Gespeichert', '', null, null);
var erst = zeichen().classList.contains('zeichnet');
zeichen().classList.remove('zeichnet');
bestaetigen('Gespeichert', '', null, null);
pruefe('G3 jedes Mal von vorn', erst && zeichen().classList.contains('zeichnet'));
hinweisSchliessen();

// ── W · kurz genug, mit dem Puls am Ende ────────────────────
var proben = ALLE.map(probe), bericht = {};
pruefe('W1 jedes Zeichen bewegt sich und ist fertig, bevor die kürzeste Bestätigung geht', proben.every(function (d) {
  var teile = Array.prototype.slice.call(d.querySelectorAll('svg *')).filter(function (el) { return laeufe(el).length; });
  var laenge = Math.max.apply(null, teile.map(ende).concat([0]));
  bericht[d.getAttribute('data-zeichen')] = laenge;
  return teile.length > 0 && laenge * 1000 <= BESTAETIGUNG_MS - 200;
}), JSON.stringify(bericht));
pruefe('W2 jedes endet mit dem Puls', proben.every(function (d) {
  var puls = d.querySelector('.zm-puls');
  return !!puls && Array.prototype.slice.call(d.querySelectorAll('svg *')).every(function (el) { return ende(el) <= ende(puls) + 0.001; });
}));
pruefe('W3 der Puls zeigt sich nicht, solange er wartet', proben.every(function (d) {
  var st = getComputedStyle(d.querySelector('.zm-puls'));
  return st.animationFillMode === 'forwards' && st.opacity === '0';
}));
function teil(name, sel) { return laeufe(q('#app [data-zeichen="' + name + '"].zeichnet ' + sel)); }
var w = teil('warnung', '.zm-wackeln')[0];
var wGezeichnet = Math.max(teil('warnung', '.zm-dreieck')[0].bis, teil('warnung', '.zm-ausruf')[0].bis, teil('warnung', '.zm-punkt')[0].bis);
pruefe('W4 die Warnung zeichnet sich erst, dann wackelt sie', w && w.name === 'zm-wackeln' && w.von >= wGezeichnet - 0.001,
  JSON.stringify(w) + ' ' + wGezeichnet);
var kopie = ['.zm-hinten', '.zm-vorn'].map(function (sel) { return teil('kopie', sel); });
var kGezeichnet = Math.max.apply(null, kopie.map(function (l) { return l.filter(function (x) { return x.name === 'z-zeichnen'; })[0].bis; }));
pruefe('W5 «Kopiert»: erst zeichnen sich beide Blätter, dann fächern sie auf', kopie.every(function (l) {
  var f = l.filter(function (x) { return x.name !== 'z-zeichnen'; });
  return f.length === 1 && f[0].von >= kGezeichnet - 0.001;
}), JSON.stringify(kopie));
var schale = teil('laden', '.zm-schale'), pfeil = teil('laden', '.zm-pfeil')[0];
pruefe('W6 «Datei geladen»: die Schale zeichnet sich, der Pfeil fliegt hinein, dann gibt sie nach',
  schale.length === 2 && schale[0].name === 'z-zeichnen' && schale[1].name === 'zm-tauchen' &&
  pfeil.name === 'zm-fallen' && pfeil.von >= schale[0].bis - 0.1 && schale[1].von >= pfeil.von, JSON.stringify(schale.concat([pfeil])));
proben.forEach(function (d) { d.remove(); });

// ── F · ein Fehlschlag trägt die Warnung ────────────────────
function warnt() { return zeichen().getAttribute('data-zeichen') === 'warnung' && zeichen().classList.contains('warnend') &&
  !zeichen().classList.contains('neutral') && !zeichen().hidden; }
frisch();
var setzen = Storage.prototype.setItem;
Storage.prototype.setItem = function () { throw new Error('voll'); };
var gespeichert = speichern();
Storage.prototype.setItem = setzen;
pruefe('F1 «Speichern ging nicht»', !gespeichert && warnt() && /Speichern ging nicht/.test(q('#hinweisTitel').textContent));
hinweisSchliessen();
// Die Sicherung zeigt den Code von Hand, wenn Kopieren scheitert; eine
// Meldung bringen der Rohtext gesperrter Daten und die Tickets.
var sperreWar = speicherSperre;
speicherSperre = { roh: 'x' };
kopieren = function (t, f) { f(false); };
sperreKopieren();
speicherSperre = sperreWar;
pruefe('F2 Kopieren ging nicht', warnt() && /Kopieren ging nicht/.test(q('#hinweisTitel').textContent));
kopieren = ok;
hinweisSchliessen();
zeige('sicherung');
$('scEingabe').value = 'Unsinn';
sicherungEinlesen();
pruefe('F3 ein ungültiger Sicherungscode', warnt() && /kein gültiger/.test(q('#hinweisTitel').textContent));
hinweisSchliessen();
sperreZeigen();
pruefe('F4 unlesbare Daten tragen die Warnung', warnt() && !!q('#hinweisWahl [data-sperre="neu"]'));
hinweisSchliessen();
bestaetigen('Gespeichert', '', null, null);
pruefe('F5 danach trägt eine Bestätigung wieder den grünen Haken', zeichen().getAttribute('data-zeichen') === 'haken' &&
  !zeichen().classList.contains('warnend') && !!q('#hinweisHaken .zm-haken'));
hinweisSchliessen();

// ── K · Kopieren ────────────────────────────────────────────
frisch();
zeige('sicherung');
sicherungKopieren();
pruefe('K1 Sicherungscode kopiert: zwei Blätter, grün', zeichen().getAttribute('data-zeichen') === 'kopie' &&
  !zeichen().classList.contains('neutral') && /zm-vorn/.test(anim('#hinweisHaken .zm-vorn')) &&
  q('#hinweisTitel').textContent === 'Kopiert');
hinweisSchliessen();
state.tickets = [ticketLesen({ id: 'k1', art: 'fehler', titel: 'Eins', erstellt: 1 })];
zeige('tickets');
var kk = q('#ansicht button[id*="opier"]');
if (kk) kk.click();
pruefe('K2 Tickets kopiert: dasselbe Zeichen', !!kk && zeichen().getAttribute('data-zeichen') === 'kopie' &&
  /Kopiert/.test(q('#hinweisTitel').textContent), kk && kk.id);
hinweisSchliessen();

// ── L · Laden ───────────────────────────────────────────────
frisch();
state.termine = [terminLesen({ id: 'kino', titel: 'Kino', tag: '2026-10-20', von: '20:00', wiederholung: 'keine' })];
zeige('export');
var urlWar = URL.createObjectURL, klickWar = HTMLAnchorElement.prototype.click;
URL.createObjectURL = function () { return 'blob:pruefung'; };
HTMLAnchorElement.prototype.click = function () {};
q('#exLaden').click();
URL.createObjectURL = urlWar;
HTMLAnchorElement.prototype.click = klickWar;
pruefe('L1 «Datei geladen»: der Pfeil fliegt in die Schale, «OK» bleibt', zeichen().getAttribute('data-zeichen') === 'laden' &&
  !zeichen().hidden && anim('#hinweisHaken .zm-pfeil') === 'zm-fallen' && !q('#hinweisOk').hidden &&
  !zeichen().classList.contains('neutral'));
hinweisSchliessen();
URL.createObjectURL = function () { throw new Error('nein'); };
q('#exLaden').click();
URL.createObjectURL = urlWar;
pruefe('L2 läßt sich die Datei nicht anlegen, warnt es', warnt() && /nicht anlegen/.test(q('#hinweisTitel').textContent));
hinweisSchliessen();
hinweisZeigen('Hinweis', 'Ohne Zeichen.', null, null);
pruefe('L3 ein Hinweis mit «OK», der kein Zeichen nennt, trägt keins', zeichen().hidden);
hinweisSchliessen();

// ── A · auf der Kachel ──────────────────────────────────────
frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] })];
render();
q('[data-haken="A"]').click();
pruefe('A1 abgehakt: der Haken auf der Kachel zeichnet sich', anim('.gw-kachel.gerade .gw-scheibe .z-strich') === 'z-zeichnen',
  anim('.gw-kachel.gerade .gw-scheibe .z-strich'));
q('[data-haken="A"]').click();
pruefe('A2 zurückgenommen: nichts zeichnet sich', anim('[data-haken="A"] .z-strich') !== 'z-zeichnen');
pruefe('A3 die Wahl der Zeichen steht nicht mehr auf dem Dashboard', !q('#ansicht .zp') && typeof zeichneZeichenProbe === 'undefined');
hinweisSchliessen();

// ── B · ohne Bewegung ───────────────────────────────────────
state.bewegung = 'aus';
themaAnwenden();
bestaetigen('Gespeichert', '', null, null);
pruefe('B1 ohne Bewegung steht das Zeichen still und ist ganz zu sehen', Array.prototype.slice.call(zeichen().querySelectorAll('svg *')).every(function (el) {
  return getComputedStyle(el).animationName === 'none'; }) && getComputedStyle(q('#hinweisHaken .zm-scheibe')).opacity === '1' &&
  getComputedStyle(q('#hinweisHaken .zm-puls')).opacity === '0');
hinweisSchliessen();
state.bewegung = 'auto';
themaAnwenden();
frisch();
speichern();
`);
