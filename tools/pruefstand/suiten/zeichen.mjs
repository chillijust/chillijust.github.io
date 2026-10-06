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
