// Sicherung (0.8.0, ADR 0020): der Sicherungscode — verdichtete Tage, Prüfsumme,
// was mitfährt und was nicht, die Kachel nach 30 Tagen, Kopieren, Einlesen mit
// Frage im Glas, Rückgängig. Chillingos Speicher bleibt dabei unberührt.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('sicherung', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var HEUTE = '2026-10-14', ALT = 'russisch_' + 'trainer_v1';
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function reihe(von, n, schritt) {
  var r = [], k = von;
  for (var i = 0; i < n; i++) { r.push(k); k = tagPlus(k, schritt || 1); }
  return r;
}
try { localStorage.setItem(ALT, '{"chillingo":true}'); } catch (e) { /* egal */ }

// ── A · Tage verdichten ─────────────────────────────────────
var jahr = reihe('2025-10-01', 365);
pruefe('A1 ein Jahr täglich geht hin und zurück', tageEntfalten(tageVerdichten(jahr)).join() === jahr.join());
pruefe('A2 und ist kurz', tageVerdichten(jahr).length < 24, tageVerdichten(jahr));
var bunt = ['2026-03-27', '2026-03-28', '2026-03-30', '2026-04-02', '2026-04-05', '2026-10-24', '2026-10-25',
  '2026-10-26', '2026-10-27'];
pruefe('A3 Lücken und Zeitumstellung überstehen', tageEntfalten(tageVerdichten(bunt)).join() === bunt.join(),
  tageVerdichten(bunt));
pruefe('A4 nichts bleibt nichts', tageVerdichten([]) === '' && tageEntfalten('').length === 0);
pruefe('A5 Unsinn ergibt keine Tage', tageEntfalten('2026-01-01.x*!').length === 0 && tageEntfalten('kaputt').length === 0 &&
  tageEntfalten(42).length === 0);

// ── B · Der Code ────────────────────────────────────────────
function bestueckt() {
  frisch();
  state.thema = 'dunkel';
  state.gewohnheiten = [gewohnheitLesen({ id: 'g1', name: 'Übung äöü ß', rhythmus: { art: 'wochentage', tage: [1, 4] },
    angelegt: '2026-07-01', erledigt: reihe('2026-07-02', 40, 2), erinnerung: '07:30' })];
  state.abgewoehnen = [lasterLesen({ id: 'a1', name: 'Zucker', start: new Date(2026, 8, 1).getTime(),
    rueckfaelle: [{ zeit: new Date(2026, 8, 20).getTime(), notiz: 'Kuchen' }], draenge: [new Date(2026, 9, 1).getTime()] })];
  state.termine = [terminLesen({ id: 't1', titel: 'Zahnarzt', tag: '2026-10-16', von: '09:30', vorlauf: 15 })];
  state.journal = [reflexionLesen({ woche: '2026-10-05', gut: 'Viel gelesen', stoerte: '', zeit: 1791700000000 })];
  state.tickets = [ticketLesen({ id: 'k1', art: 'fehler', titel: 'Etwas klemmt', erstellt: 1791000000000, stand: 'x' })];
  state.welle = { id: 'a1', start: zeitJetzt() };
}
bestueckt();
var code = sicherungsCode(zeitJetzt()), roh = codeLesen(code);
pruefe('B1 der Code beginnt mit seiner Kennung', /^CHJ1~[0-9a-z]+~[A-Za-z0-9+\/=]+$/.test(code));
pruefe('B2 er liest sich zurück', !!roh);
pruefe('B3 Tickets und die laufende Welle fahren nicht mit', roh && roh.tickets === undefined && roh.welle === undefined);
var zurueck = stand(roh);
pruefe('B4 alles andere kommt gleich an', JSON.stringify(zurueck.gewohnheiten) === JSON.stringify(state.gewohnheiten) &&
  JSON.stringify(zurueck.abgewoehnen) === JSON.stringify(state.abgewoehnen) &&
  JSON.stringify(zurueck.termine) === JSON.stringify(state.termine) &&
  JSON.stringify(zurueck.journal) === JSON.stringify(state.journal) && zurueck.thema === 'dunkel');
pruefe('B5 der Zeitpunkt des Codes ist der der Sicherung', zurueck.gesichert === zeitJetzt());
pruefe('B6 Umlaute überstehen', zurueck.gewohnheiten[0].name === 'Übung äöü ß');
pruefe('B7 Zeilenumbrüche und Leerraum stören nicht',
  !!codeLesen(' ' + code.slice(0, 30) + '\n  ' + code.slice(30, 61) + '\r\n' + code.slice(61) + '\n'));
pruefe('B8 ein abgeschnittener Code wird abgelehnt', codeLesen(code.slice(0, -6)) === null);
var mitte = Math.floor(code.length * 0.7), anders = code.charAt(mitte) === 'A' ? 'B' : 'A';
pruefe('B9 ein verstümmelter auch', codeLesen(code.slice(0, mitte) + anders + code.slice(mitte + 1)) === null);
pruefe('B10 fremder Text auch', codeLesen('Hallo') === null && codeLesen('') === null && codeLesen(null) === null);
pruefe('B11 die Tage stehen verdichtet darin', JSON.parse(ausBase64(code.split('~')[2])).gewohnheiten[0].e.length < 40);

// ── C · Die Kachel: erst wenn es etwas zu verlieren gibt ────
frisch();
pruefe('C1 leer gibt es nichts zu sichern', !sicherungFaellig() && !q('[data-sicherung]'));
state.gewohnheiten = [gewohnheitLesen({ id: 'g1', name: 'Lesen', rhythmus: { art: 'taeglich' },
  angelegt: '2026-09-01', erledigt: reihe('2026-09-01', 28) })];
zeige('home');
pruefe('C2 mit wenig noch nicht', eintragZahl() < SICHERUNG_AB && !q('[data-sicherung]'));
state.gewohnheiten[0].erledigt = reihe('2026-09-01', 40);
zeige('home');
pruefe('C3 mit genug, nie gesichert: die Kachel steht da', sicherungFaellig() && !!q('[data-sicherung]') &&
  /nur auf diesem Gerät/.test(q('[data-sicherung]').textContent));
state.gesichert = zeitJetzt() - 10 * TAG_MS;
zeige('home');
pruefe('C4 vor zehn Tagen gesichert: keine', !q('[data-sicherung]'));
state.gesichert = zeitJetzt() - 31 * TAG_MS;
zeige('home');
pruefe('C5 nach dreißig wieder', !!q('[data-sicherung]') && /vor 31 Tagen/.test(q('[data-sicherung]').textContent));
q('[data-sicherung]').click();
pruefe('C6 sie führt in die Sicherung', ansicht === 'sicherung' && !!q('#scKopieren') && q('#kopf h1').textContent === 'Sicherung');
pruefe('C7 die Sicherung nennt das Alter', q('#scAlter').textContent === 'vor 31 Tagen');

// ── D · Kopieren ────────────────────────────────────────────
var kopiert = null, kopierenEcht = kopieren, geht = true;
kopieren = function (t, f) { kopiert = t; f(geht); };
geht = false;
q('#scKopieren').click();
pruefe('D1 geht die Zwischenablage nicht, steht der Code zum Kopieren da', !!q('#scCode') &&
  q('#scCode').value === kopiert && state.gesichert === zeitJetzt() - 31 * TAG_MS);
geht = true;
q('#scKopieren').click();
pruefe('D2 kopiert ist der Code', /^CHJ1~/.test(kopiert) && !!codeLesen(kopiert));
pruefe('D3 und die Sicherung gemerkt', state.gesichert === zeitJetzt() &&
  JSON.parse(localStorage.getItem(SPEICHER)).gesichert === zeitJetzt());
pruefe('D4 die Ansicht sagt «heute», das Feld ist fort', q('#scAlter').textContent === 'heute' && !q('#scCode'));
pruefe('D5 bestätigt im Glas mit Haken', !q('#hinweisBlatt').hidden && q('#hinweisKarte').classList.contains('bestaetigung') &&
  q('#hinweisTitel').textContent === 'Kopiert' && !q('#hinweisHaken').classList.contains('neutral'));
hinweisSchliessen();
kopieren = kopierenEcht;

return durch().then(function () {
  // Der echte Weg über die Zwischenablage des Browsers.
  var geschrieben = null, ergebnis = null;
  try {
    Object.defineProperty(navigator, 'clipboard', { configurable: true,
      value: { writeText: function (t) { geschrieben = t; return Promise.resolve(); } } });
  } catch (e) { /* weiter */ }
  kopieren('Probe', function (ok) { ergebnis = ok; });
  return warten(10).then(function () {
    pruefe('D6 «kopieren» schreibt in die Zwischenablage und sagt, daß es ging', geschrieben === 'Probe' && ergebnis === true);
  });
}).then(function () {
  // ── E · Einlesen ──────────────────────────────────────────
  bestueckt();
  var fremd = sicherungsCode(zeitJetzt());
  frisch();
  state.gewohnheiten = [gewohnheitLesen({ id: 'gx', name: 'Eigenes', rhythmus: { art: 'taeglich' },
    angelegt: '2026-10-01', erledigt: ['2026-10-02'] })];
  state.tickets = [ticketLesen({ id: 'kx', art: 'wunsch', titel: 'Bleibt da', erstellt: 1791000000000, stand: 'x' })];
  speichern();
  zeige('sicherung');
  var vorher = JSON.stringify(state);
  q('#scEingabe').value = 'Das ist kein Code';
  q('#scEinlesen').click();
  pruefe('E1 Unsinn wird abgelehnt und gesagt', JSON.stringify(state) === vorher &&
    /kein gültiger Sicherungscode/.test(q('#hinweisTitel').textContent));
  hinweisSchliessen();
  return durch().then(function () {
    q('#scEingabe').value = fremd;
    q('#scEinlesen').click();
    pruefe('E2 ein gültiger Code fragt erst im Glas', !q('#hinweisBlatt').hidden && q('#hinweisKarte').classList.contains('glas') &&
      q('#hinweisTitel').textContent === 'Diesen Stand einlesen?' && !q('#hinweisNein').hidden &&
      q('#hinweisOk').textContent === 'Ersetzen');
    pruefe('E3 und sagt, was kommt', /1 Gewohnheit, 1 Abgewöhnen, 1 Termin, 1 Reflexion/.test(q('#hinweisText').textContent) &&
      /14\. Oktober/.test(q('#hinweisText').textContent), q('#hinweisText').textContent);
    q('#hinweisNein').click();
    pruefe('E4 Abbrechen ändert nichts', JSON.stringify(state) === vorher && !q('#hinweisBlatt').classList.contains('offen'));
    return durch();
  }).then(function () {
    q('#scEinlesen').click();
    q('#hinweisOk').click();
    pruefe('E5 Ersetzen übernimmt den Stand', state.gewohnheiten.length === 1 && state.gewohnheiten[0].id === 'g1' &&
      state.termine.length === 1 && state.thema === 'dunkel' && state.welle === null);
    pruefe('E6 die Tickets des Geräts bleiben', state.tickets.length === 1 && state.tickets[0].id === 'kx');
    pruefe('E7 gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten[0].id === 'g1');
    pruefe('E8 aus der Frage wird die Bestätigung, an Ort und Stelle', q('#hinweisKarte').classList.contains('bestaetigung') &&
      q('#hinweisTitel').textContent === 'Eingelesen' && q('#hinweisNein').hidden);
    pruefe('E9 die Darstellung folgt sofort', document.documentElement.getAttribute('data-thema') === 'dunkel');
    pruefe('E10 Rückgängig steht bereit', !!q('#scRueck'));
    hinweisSchliessen();
    return durch();
  }).then(function () {
    q('#scRueck').click();
    pruefe('E11 Rückgängig bringt den vorigen Stand', state.gewohnheiten.length === 1 && state.gewohnheiten[0].id === 'gx' &&
      state.thema === 'auto' && state.tickets[0].id === 'kx' && !q('#scRueck'));
    pruefe('E12 auch im Speicher', JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten[0].id === 'gx');
    hinweisSchliessen();
    return durch();
  });
}).then(function () {
  var alt = null;
  try { alt = localStorage.getItem(ALT); } catch (e) { /* egal */ }
  pruefe('F1 Chillingos Speicher bleibt unberührt', alt === '{"chillingo":true}');
  pruefe('F2 die Ansicht duzt', !/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/.test(q('#app').textContent.replace(/\bsie\b/g, '')));
  zeige('sicherung');
  ausbewegt();
  var klein = alle('#ansicht button').filter(function (b) { return b.getBoundingClientRect().height < 44; });
  pruefe('F3 jeder Knopf ist groß genug', !klein.length, klein.map(function (b) {
    return (b.id || b.className) + ' ' + Math.round(b.getBoundingClientRect().height);
  }).join(', '));
  frisch();
  speichern();
});
`);
