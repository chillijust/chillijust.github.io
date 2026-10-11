// Was von außen kommt, bricht nichts (James, N4 und N8): Eine ID aus einem
// veränderten Sicherungscode geht maskiert in jeden Selektor, eine doppelte
// fällt weg; ein Stand aus einer Fassung mit anderem Schema wird nicht
// eingelesen und beim Start nicht überschrieben.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('einlesen', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
var QUOTE = String.fromCharCode(34), SCHRAEG = String.fromCharCode(92);

// ── I · IDs aus einem Import ─────────────────────────────────
frisch();
var boese = 'bad' + QUOTE + ']x' + SCHRAEG;
state.gewohnheiten = [gewohnheitLesen({ id: boese, name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01',
  erledigt: [], timer: { minuten: 10 } })];
zeige('home');
ausbewegt();
var fehler = null;
try {
  timerStarten(boese);
  ausbewegt();
} catch (e) { fehler = e; }
pruefe('I1 eine ID mit Anführungszeichen, Klammer und Schrägstrich bricht keinen Selektor', !fehler && !!kachelVon(boese) &&
  kachelVon(boese).getAttribute('data-haken') === boese && timerOffen(), fehler && fehler.message);
pruefe('I2 und geht maskiert hinein', mitWert('data-haken', boese).indexOf(SCHRAEG + QUOTE) !== -1);
state.timer = null;
timerSchliessen();
ausbewegt();
var doppelt = stand({ schema: 1, gewohnheiten: [
  { id: 'd', name: 'Erste', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] },
  { id: 'd', name: 'Zweite', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] }] });
pruefe('I3 von zwei Einträgen mit derselben ID bleibt der erste', doppelt.gewohnheiten.length === 1 &&
  doppelt.gewohnheiten[0].name === 'Erste');

// ── S · Ein fremdes Schema ───────────────────────────────────
pruefe('S1 fremd ist nur ein anderes Schema, keins gilt als 1', schemaFremd({ schema: 999 }) && schemaFremd({ schema: '1' }) &&
  !schemaFremd({ schema: 1 }) && !schemaFremd({}));
frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'g1', name: 'Neu', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] })];
state.schema = 999;
var kuenftig = sicherungsCode(zeitJetzt());
state.schema = 1;
state.gewohnheiten = [];
speichern();
var vorher = JSON.stringify(state);
zeige('sicherung');
q('#scEingabe').value = kuenftig;
q('#scEinlesen').click();
pruefe('S2 ein Code aus einer neueren Fassung wird abgelehnt und gesagt, nicht erst gefragt', JSON.stringify(state) === vorher &&
  /neueren Fassung/.test(q('#hinweisTitel').textContent + ' ' + q('#hinweisText').textContent) && q('#hinweisNein').hidden,
  q('#hinweisTitel').textContent);
hinweisSchliessen();
ausbewegt();
return warten(30).then(function () {
  localStorage.setItem(SPEICHER, JSON.stringify({ schema: 2, gewohnheiten: [] }));
  var sperre = speicherUnlesbar();
  pruefe('S3 ein gespeicherter Stand mit fremdem Schema sperrt das Schreiben', !!sperre && sperre.neuer === true &&
    sperre.roh.indexOf('"schema":2') !== -1);
  speicherSperre = sperre;
  sperreZeigen();
  pruefe('S4 und sagt, woher er kommt', /neueren Fassung/.test(q('#hinweisText').textContent) && speichern() === false &&
    JSON.parse(localStorage.getItem(SPEICHER)).schema === 2);
  speicherSperre = null;
  hinweisSchliessen();
  ausbewegt();
  frisch();
  speichern();
});
`);
