// Einstellungen (0.8.0, ADR 0020): der Hinweis ab drei läßt sich abschalten,
// Bewegung läßt sich unabhängig vom Gerät reduzieren, alle Daten lassen sich
// löschen — mit Frage im Glas und Rückgängig in der Sicherung.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('einstellungen', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var ALT = 'russisch_' + 'trainer_v1';
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function gespeichert() { return JSON.parse(localStorage.getItem(SPEICHER)); }
try { localStorage.setItem(ALT, '{"chillingo":true}'); } catch (e) { /* egal */ }
frisch();

// ── A · Der Hinweis ab drei ─────────────────────────────────
pruefe('A1 von Haus aus an', grundStand().schwachHinweis === true && stand({}).schwachHinweis === true);
state.gewohnheiten = ['A', 'B', 'C'].map(function (n) {
  return gewohnheitLesen({ id: n, name: n, rhythmus: { art: 'taeglich' }, angelegt: '2026-10-10', erledigt: [] });
});
zeige('neu');
pruefe('A2 bei drei schwachen steht er da', !!q('#gwHinweis'));
zeige('einstellungen');
pruefe('A3 der Schalter ist an', q('#esHinweis').getAttribute('aria-checked') === 'true' &&
  q('#esHinweis').getAttribute('role') === 'switch');
q('#esHinweis').click();
pruefe('A4 ein Tipp schaltet ihn aus und merkt es', state.schwachHinweis === false && gespeichert().schwachHinweis === false &&
  q('#esHinweis').getAttribute('aria-checked') === 'false');
pruefe('A5 auch nach dem Laden', laden().schwachHinweis === false);
zeige('neu');
pruefe('A6 dann schweigt er', !q('#gwHinweis'));
zeige('einstellungen');
q('#esHinweis').click();
pruefe('A7 und wieder an', state.schwachHinweis === true);

// ── B · Bewegung reduzieren ─────────────────────────────────
var echt = bewegungAus();
pruefe('B1 von Haus aus folgt die App dem Gerät', grundStand().bewegung === 'auto' &&
  !document.documentElement.hasAttribute('data-bewegung'));
q('#esBewegung').click();
pruefe('B2 abgeschaltet: alles steht', state.bewegung === 'aus' && bewegungAus() === true &&
  document.documentElement.getAttribute('data-bewegung') === 'aus' && gespeichert().bewegung === 'aus');
pruefe('B3 auch im Stylesheet', getComputedStyle(q('.knopf')).transitionDuration === '0s');
zeige('home');
menueOeffnen();
pruefe('B4 das Menü öffnet ohne Tropfen', !q('#menue .blatt').getAnimations().length);
menueSchliessen();
pruefe('B5 und geht sofort zu', q('#menue').hidden);
var huellen = alle('body > .tropfen-huelle').length;
q('#ticketKnopf').click();
pruefe('B6 das Ticketblatt ohne Tropfen', alle('body > .tropfen-huelle').length === huellen &&
  q('#ticketBlatt').classList.contains('offen'));
q('#tkAbbrechen').click();
pruefe('B7 und zu ohne', q('#ticketBlatt').hidden);
pruefe('B8 nach dem Laden ebenso', laden().bewegung === 'aus' && stand({ bewegung: 'quatsch' }).bewegung === 'auto');
zeige('einstellungen');
q('#esBewegung').click();
pruefe('B9 wieder an folgt es dem Gerät', state.bewegung === 'auto' && bewegungAus() === echt &&
  !document.documentElement.hasAttribute('data-bewegung'));

// ── C · Alle Daten löschen ──────────────────────────────────
frisch();
state.thema = 'dunkel';
themaAnwenden();
state.gewohnheiten = [gewohnheitLesen({ id: 'g1', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01',
  erledigt: ['2026-10-02'] })];
state.termine = [terminLesen({ id: 't1', titel: 'Zahnarzt', tag: '2026-10-16', von: '09:30' })];
state.tickets = [ticketLesen({ id: 'k1', titel: 'Bleibt', erstellt: 5, stand: 'x' })];
speichern();
zeige('einstellungen');
var vorher = JSON.stringify(state);
q('#esLoeschen').click();
pruefe('C1 Löschen fragt erst im Glas', q('#hinweisTitel').textContent === 'Alle Daten löschen?' && !q('#hinweisNein').hidden &&
  q('#hinweisOk').textContent === 'Löschen' && /noch nie gesichert/.test(q('#hinweisText').textContent));
q('#hinweisNein').click();
pruefe('C2 Abbrechen läßt alles stehen', JSON.stringify(state) === vorher);
return durch().then(function () {
  q('#esLoeschen').click();
  q('#hinweisOk').click();
  pruefe('C3 Löschen leert die Daten', !state.gewohnheiten.length && !state.termine.length && gespeichert().gewohnheiten.length === 0);
  pruefe('C4 Darstellung und Tickets bleiben', state.thema === 'dunkel' && state.tickets.length === 1 &&
    document.documentElement.getAttribute('data-thema') === 'dunkel');
  pruefe('C5 das Glas sagt, wie es zurückgeht', q('#hinweisTitel').textContent === 'Gelöscht' &&
    /Sicherung/.test(q('#hinweisText').textContent));
  var alt = null;
  try { alt = localStorage.getItem(ALT); } catch (e) { /* egal */ }
  pruefe('C6 Chillingos Speicher bleibt unberührt', alt === '{"chillingo":true}');
  hinweisSchliessen();
  return durch();
}).then(function () {
  zeige('sicherung');
  q('#scRueck').click();
  pruefe('C7 in der Sicherung geht es rückgängig', state.gewohnheiten.length === 1 && state.termine.length === 1 &&
    gespeichert().gewohnheiten.length === 1);
  hinweisSchliessen();
  zeige('einstellungen');
  ausbewegt();
  var klein = alle('#ansicht button').filter(function (b) { return b.getBoundingClientRect().height < 44; });
  pruefe('D1 jeder Knopf ist groß genug', !klein.length, klein.map(function (b) { return b.id; }).join());
  pruefe('D2 die Ansicht duzt', !/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/.test(q('#ansicht').textContent));
  hinweisSchliessen();
  frisch();
  speichern();
  return durch();
});
`);
