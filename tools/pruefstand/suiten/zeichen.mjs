// Zeichen, die sich bewegen (0.11.0T, ADR 0035): Der Haken zeichnet sich —
// im Glas wie auf der Kachel —, beim Hinweis fällt der Punkt und der Strich
// wächst, der Pfeil von «Datei geladen» fällt in die Schale, beim Kopieren
// schiebt sich das zweite Blatt aus dem ersten. Jedes Mal, wenn es erscheint;
// ohne Bewegung steht es still.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('zeichen', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var HEUTE = '2026-10-14';
function zeichen() { return q('#hinweisHaken'); }
function anim(sel) { var el = q(sel); return el ? getComputedStyle(el).animationName : 'fehlt'; }
kopieren = function (t, f) { f(true); };

// ── G · im Glas ─────────────────────────────────────────────
frisch();
bestaetigen('Gespeichert', '', null, null);
pruefe('G1 «Gespeichert»: der Haken zeichnet sich', zeichen().getAttribute('data-zeichen') === 'haken' &&
  zeichen().classList.contains('zeichnet') && anim('#hinweisHaken .z-strich') === 'z-zeichnen' &&
  q('#hinweisHaken .z-strich').getAttribute('pathLength') === '1', anim('#hinweisHaken .z-strich'));
hinweisSchliessen();
melden('Gib ihr noch einen Namen.');
pruefe('G2 ein Hinweis: der Punkt fällt, dann wächst der Strich', zeichen().getAttribute('data-zeichen') === 'hinweis' &&
  zeichen().classList.contains('neutral') && anim('#hinweisHaken .z-punkt') === 'z-fallen' &&
  anim('#hinweisHaken .z-strich') === 'z-zeichnen' &&
  parseFloat(getComputedStyle(q('#hinweisHaken .z-strich')).animationDelay) >= 0.3);
hinweisSchliessen();
bestaetigen('Gespeichert', '', null, null);
var erst = zeichen().classList.contains('zeichnet');
zeichen().classList.remove('zeichnet');
bestaetigen('Gespeichert', '', null, null);
pruefe('G3 jedes Mal von vorn', erst && zeichen().classList.contains('zeichnet'));
hinweisSchliessen();

// ── W · weich, nicht zu flink und nicht zu träge (ADR 0036, 0037) ─
// 0.11.0T war am Gerät zu flink, 0.11.0T2 einen Tick zu träge: Jede Bewegung
// liegt dazwischen, läuft ohne Ruck an — und ist fertig, bevor die kürzeste
// Bestätigung geht.
function zeit(sel) {
  var el = q(sel), st = el && getComputedStyle(el);
  return st ? { dauer: parseFloat(st.animationDuration), warten: parseFloat(st.animationDelay), kurve: st.animationTimingFunction } : null;
}
function allesZeichen(name) { var d = document.createElement('div'); d.className = 'zeichnet'; d.setAttribute('data-zeichen', name);
  d.innerHTML = ICON[name]; q('#app').appendChild(d); return d; }
var proben = ['haken', 'hinweis', 'laden', 'kopie'].map(allesZeichen);
var zeiten = {
  haken: zeit('[data-zeichen="haken"] .z-strich'), punkt: zeit('[data-zeichen="hinweis"] .z-punkt'),
  strich: zeit('[data-zeichen="hinweis"] .z-strich'), pfeil: zeit('[data-zeichen="laden"] .z-pfeil'),
  blatt: zeit('[data-zeichen="kopie"] .z-blatt')
};
proben.forEach(function (d) { d.remove(); });
var flink = { haken: 0.42, punkt: 0.34, strich: 0.42, pfeil: 0.62, blatt: 0.5 };   // 0.11.0T
var traege = { haken: 0.7, punkt: 0.55, strich: 0.7, pfeil: 0.95, blatt: 0.8 };     // 0.11.0T2
pruefe('W1 jedes Zeichen liegt zwischen zu flink und zu träge', Object.keys(flink).every(function (k) {
  return zeiten[k] && zeiten[k].dauer >= flink[k] * 1.1 && zeiten[k].dauer <= traege[k] * 0.8; }), JSON.stringify(zeiten));
pruefe('W2 und ist fertig, bevor die Bestätigung geht', Object.keys(zeiten).every(function (k) {
  return zeiten[k] && (zeiten[k].dauer + zeiten[k].warten) * 1000 <= BESTAETIGUNG_MS - 200; }));
pruefe('W3 der Punkt fällt weich, nicht beschleunigt bis zum Aufprall', zeiten.punkt &&
  /cubic-bezier\(0?\.35, 0, 0?\.3, 1\)/.test(zeiten.punkt.kurve), zeiten.punkt && zeiten.punkt.kurve);

// ── K · Kopieren ────────────────────────────────────────────
frisch();
zeige('sicherung');
sicherungKopieren();
pruefe('K1 Sicherungscode kopiert: zwei Blätter, das zweite schiebt sich heraus, grün',
  zeichen().getAttribute('data-zeichen') === 'kopie' && !zeichen().classList.contains('neutral') &&
  anim('#hinweisHaken .z-blatt') === 'z-blatt' && q('#hinweisTitel').textContent === 'Kopiert');
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
pruefe('L1 «Datei geladen»: der Pfeil fällt in die Schale, «OK» bleibt', zeichen().getAttribute('data-zeichen') === 'laden' &&
  !zeichen().hidden && anim('#hinweisHaken .z-pfeil') === 'z-pfeil' && !q('#hinweisOk').hidden &&
  !zeichen().classList.contains('neutral'));
hinweisSchliessen();
hinweisZeigen('Hinweis', 'Ohne Zeichen.', null, null);
pruefe('L2 ein Hinweis mit «OK», der kein Zeichen nennt, trägt keins', zeichen().hidden);
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
hinweisSchliessen();

// ── B · ohne Bewegung ───────────────────────────────────────
state.bewegung = 'aus';
themaAnwenden();
bestaetigen('Gespeichert', '', null, null);
pruefe('B1 ohne Bewegung steht das Zeichen still', anim('#hinweisHaken .z-strich') === 'none');
hinweisSchliessen();
state.bewegung = 'auto';
themaAnwenden();
frisch();
speichern();
`);
