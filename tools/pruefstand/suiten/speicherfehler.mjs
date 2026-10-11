// Was man sieht, ist gespeichert — auch in Formularen (ADR 0049, James N3):
// Scheitert das Speichern, bleibt ein Formular offen mit allem, was darin
// steht, und der Stand der Seite ist der von davor. Bis 0.17.0T10 schloß das
// Formular trotzdem, die Seite zeigte den neuen Eintrag, und nach dem
// Neuladen war er fort. Dasselbe gilt fürs Löschen, Rückfall, Drang, Timer,
// Reflexion und Tickets. Was die App von allein schreibt, rollt nicht zurück.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('speicherfehler', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };
var echtSchreiben = Storage.prototype.setItem;
function voll() { Storage.prototype.setItem = function () { throw new Error('voll'); }; }
function frei() { Storage.prototype.setItem = echtSchreiben; }
function gespeichert() { return JSON.parse(localStorage.getItem(SPEICHER)); }
function warnt() { return /Speichern ging nicht/.test(q('#meldung').textContent); }
function bereit() { hinweisSchliessen(); ausbewegt(); q('#meldung').textContent = ''; }

frisch();
state.abgewoehnen.push({ id: 'a1', name: 'Rauchen', start: new Date(2026, 9, 1).getTime(), rueckfaelle: [], draenge: [], archiviert: null });
state.gewohnheiten.push(gewohnheitLesen({ id: 'g1', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01',
  erledigt: [], timer: { minuten: 10 } }));
state.termine.push(terminLesen({ id: 't1', titel: 'Arzt', tag: '2026-10-20', von: '10:00', wiederholung: 'keine' }));
speichern();
var anfang = JSON.stringify(state);

// ── G · Eine neue Gewohnheit ─────────────────────────────────
zeige('neu');
entwurf.name = 'Laufen';
bereit();
voll();
q('#gwSpeichern').click();
pruefe('G1 scheitert das Speichern, bleibt das Formular offen, mit dem Namen darin', ansicht === 'neu' && !!entwurf &&
  entwurf.name === 'Laufen' && warnt());
pruefe('G2 und die Seite kennt die Gewohnheit nicht', state.gewohnheiten.length === 1 && JSON.stringify(state) === anfang);
frei();
q('#gwSpeichern').click();
pruefe('G3 geht es wieder, ist sie genau einmal gespeichert', ansicht === 'home' &&
  gespeichert().gewohnheiten.filter(function (g) { return g.name === 'Laufen'; }).length === 1);
anfang = JSON.stringify(state);

// ── T · Ein neuer Termin, ein gelöschter ─────────────────────
zeige('terminNeu');
terminEntwurf.titel = 'Friseur';
terminEntwurf.von = '09:00';
bereit();
voll();
q('#tmSpeichern').click();
pruefe('T1 ein Termin, der nicht gespeichert ist, läßt sein Formular offen', ansicht === 'terminNeu' &&
  terminEntwurf.titel === 'Friseur' && JSON.stringify(state) === anfang && warnt());
frei();
zeige('termin', 't1');
bereit();
voll();
q('#tmLoeschen').click();
q('#hinweisOk').click();
pruefe('T2 ein Löschen, das nicht gespeichert ist, läßt den Termin stehen', ansicht === 'termin' && !!terminNach('t1') &&
  JSON.stringify(state) === anfang);
frei();

// ── A · Archivieren, Rückfall, Drang ─────────────────────────
zeige('bearbeiten', 'g1');
bereit();
voll();
archivieren();
pruefe('A1 nicht gespeichert, bleibt die Gewohnheit und ihr Formular', ansicht === 'bearbeiten' &&
  !gewohnheitNach('g1').archiviert && JSON.stringify(state) === anfang);
pruefe('A2 ein Rückfall, der nicht gespeichert ist, zählt nicht', rueckfallEintragen('a1', 'x') === false &&
  lasterNach('a1').rueckfaelle.length === 0);
pruefe('A3 eine Welle, die nicht gespeichert ist, beginnt nicht', welleBeginnen('a1') === false && !state.welle);
frei();
welleBeginnen('a1');
state.welle.start -= WELLE_MS;
speichern();
var mitWelle = JSON.stringify(state);
voll();
pruefe('A4 ein gewonnener Drang und ein Abbruch ebenso', welleGewonnen() === false && welleAbbrechen() === false &&
  !!state.welle && lasterNach('a1').draenge.length === 0 && JSON.stringify(state) === mitWelle);
frei();
welleAbbrechen();
anfang = JSON.stringify(state);

// ── R · Reflexion ────────────────────────────────────────────
var mo = wochenAnfang(heuteSchluessel());
voll();
pruefe('R1 eine Reflexion, die nicht gespeichert ist, steht nicht im Journal', reflexionSpeichern(mo, 'gut', '') === null &&
  !reflexionNach(mo) && JSON.stringify(state) === anfang);
frei();

// ── Z · Timer ────────────────────────────────────────────────
zeige('home');
bereit();
voll();
timerStarten('g1');
pruefe('Z1 ein Timer, der nicht gespeichert ist, startet nicht', !state.timer && !timerOffen());
frei();
timerStarten('g1');
ausbewegt();
var lauf = JSON.stringify(state);
voll();
q('#timerFertig').click();
pruefe('Z2 «Fertig», nicht gespeichert, läßt ihn offen und hakt nichts ab', !!state.timer && timerOffen() &&
  !erledigtAm('g1', '2026-10-14') && JSON.stringify(state) === lauf);
timerPause();
pruefe('Z3 eine Pause, die nicht gespeichert ist, hält ihn nicht an', !state.timer.pausiert);
timerFertig(true);
pruefe('Z4 das Ende von allein rollt nicht zurück — es versuchte es sonst jede Sekunde neu', !state.timer);
frei();
timerSchliessen();
ausbewegt();
speichern();

// ── K · Tickets ──────────────────────────────────────────────
anfang = JSON.stringify(state);
ticketBlattOeffnen(q('#ticketKnopf'));
q('#tkTitel').value = 'Knopf klemmt';
bereit();
voll();
ticketSichern();
pruefe('K1 ein Ticket, das nicht gespeichert ist, läßt sein Blatt offen, mit dem Titel darin',
  q('#ticketBlatt').classList.contains('offen') && !!ticketEntwurf && ticketEntwurf.titel === 'Knopf klemmt' &&
  JSON.stringify(state) === anfang);
frei();
ticketSichern();
pruefe('K2 geht es wieder, ist es genau einmal gespeichert', gespeichert().tickets.filter(function (t) {
  return t.titel === 'Knopf klemmt'; }).length === 1);
ausbewegt();
var tk = state.tickets[0];
ticketBlattOeffnen(q('#ticketKnopf'), tk.id);
anfang = JSON.stringify(state);
voll();
ticketLoeschen(ticketEntwurf);
pruefe('K3 ein Löschen, das nicht gespeichert ist, läßt Ticket und Blatt stehen', !!ticketNach(tk.id) &&
  q('#ticketBlatt').classList.contains('offen') && !!ticketEntwurf && JSON.stringify(state) === anfang);
frei();
ticketBlattSchliessen();
ausbewegt();
frisch();
`);
