// Kalender-Export (0.5.0T): die Rechnung der .ics, die Erinnerung einer
// Gewohnheit, die Ansicht mit Teilen und Laden.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
// Teilen und Laden werden abgefangen — gefragt ist, was hinausginge.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('export', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var HEUTE = '2026-10-14';
var CRLF = String.fromCharCode(13, 10);
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
function zuKlein() {
  ausbewegt();
  return alle('#app button, #app input, #app select').filter(function (k) {
    var r = k.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    return r.width < 44 || r.height < 44;
  }).map(function (k) { return k.id || k.className || k.textContent.trim().slice(0, 20); });
}
function tippe(id, wert) {
  var f = q('#' + id);
  f.value = wert;
  f.dispatchEvent(new Event('input', { bubbles: true }));
}
function siezt() { return q('#app').innerText.match(/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/g); }
function hat(zeilen, z) { return zeilen.indexOf(z) !== -1; }
function feld(zeilen, name) {
  for (var i = 0; i < zeilen.length; i++) if (zeilen[i].indexOf(name + ':') === 0) return zeilen[i].slice(name.length + 1);
  return null;
}
function neu() { rueckZiel = null; frisch(); }
// Alles wieder neu, als wäre nie exportiert worden (ADR 0011).
function ohneMarken() { state.termine.concat(state.gewohnheiten).forEach(function (e) { e.imKalender = null; }); }

// ── I · Die Rechnung ────────────────────────────────────────
pruefe('I1 Text wird maskiert', icsText('a,b;c\\d' + String.fromCharCode(10) + 'e') === 'a\\,b\\;c\\\\d\\ne');
var lang = 'DESCRIPTION:' + new Array(120).join(String.fromCharCode(252)), gefaltet = icsFalten(lang);
var stuecke = gefaltet.split(CRLF);
pruefe('I2 lange Zeilen werden gefaltet, höchstens 75 Byte', stuecke.length > 2 && stuecke.every(function (z) {
  return new TextEncoder().encode(z).length <= 75;
}), stuecke.map(function (z) { return new TextEncoder().encode(z).length; }).join());
pruefe('I3 und lassen sich verlustfrei entfalten', gefaltet.split(CRLF + ' ').join('') === lang &&
  icsFalten('KURZ:x') === 'KURZ:x');
var vl = { '15': '-PT15M', '0': 'PT0M', '60': '-PT1H', '120': '-PT2H', '1440': '-P1D', '-540': 'PT9H',
  '900': '-PT15H', '2340': '-P1DT15H', '9540': '-P6DT15H' };
pruefe('I4 der Vorlauf wird TRIGGER', Object.keys(vl).every(function (m) { return icsVorlauf(+m) === vl[m]; }),
  Object.keys(vl).map(function (m) { return m + '=' + icsVorlauf(+m); }).join(' '));

var S = '20261014T060000Z';
var z = terminEreignis(tm({ id: 'tz', titel: 'Zahnarzt', tag: '2026-10-16', von: '09:30', bis: '10:15',
  ort: 'Praxis, 2. Stock', notiz: 'Karte', vorlauf: 15 }), S);
pruefe('I5 ein Termin mit Uhrzeit', z[0] === 'BEGIN:VEVENT' && z[z.length - 1] === 'END:VEVENT' &&
  feld(z, 'UID') === 'tz@chillinal' && feld(z, 'DTSTART') === '20261016T093000' && feld(z, 'DTEND') === '20261016T101500' &&
  feld(z, 'SUMMARY') === 'Zahnarzt' && feld(z, 'LOCATION') === 'Praxis\\, 2. Stock' && feld(z, 'DESCRIPTION') === 'Karte' &&
  feld(z, 'DTSTAMP') === S && feld(z, 'RRULE') === null, z.join(' | '));
pruefe('I6 mit Erinnerung als VALARM', hat(z, 'BEGIN:VALARM') && hat(z, 'TRIGGER:-PT15M') && hat(z, 'ACTION:DISPLAY') &&
  z.indexOf('END:VALARM') < z.indexOf('END:VEVENT'));
var ohne = terminEreignis(tm({ id: 'o', von: '23:30' }), S);
pruefe('I7 ohne Ende eine Stunde, über Mitternacht', feld(ohne, 'DTEND') === '20261015T003000' &&
  !hat(ohne, 'BEGIN:VALARM') && feld(ohne, 'LOCATION') === null, feld(ohne, 'DTEND'));
var ganz = terminEreignis(tm({ id: 'gz', tag: '2026-10-31', ganztags: true, vorlauf: -540 }), S);
pruefe('I8 ganztags als Datum, Ende am Folgetag', hat(ganz, 'DTSTART;VALUE=DATE:20261031') &&
  hat(ganz, 'DTEND;VALUE=DATE:20261101') && hat(ganz, 'TRIGGER:PT9H'), ganz.join(' | '));
var reihe = terminEreignis(tm({ wiederholung: 'woechentlich', wiederholungBis: '2026-12-16' }), S);
var reiheGanz = terminEreignis(tm({ ganztags: true, wiederholung: 'monatlich', wiederholungBis: '2027-03-31' }), S);
pruefe('I9 eine Reihe mit Ende', feld(reihe, 'RRULE') === 'FREQ=WEEKLY;UNTIL=20261216T235959' &&
  feld(reiheGanz, 'RRULE') === 'FREQ=MONTHLY;UNTIL=20270331', feld(reihe, 'RRULE') + ' ' + feld(reiheGanz, 'RRULE'));
pruefe('I10 und ohne', feld(terminEreignis(tm({ wiederholung: 'taeglich' }), S), 'RRULE') === 'FREQ=DAILY');

var gt = gewohnheitEreignis(gw({ erinnerung: '07:30' }), S);
pruefe('I11 eine tägliche Gewohnheit', feld(gt, 'UID') === 'g@chillinal' && feld(gt, 'DTSTART') === '20261001T073000' &&
  feld(gt, 'DTEND') === '20261001T074500' && feld(gt, 'RRULE') === 'FREQ=DAILY' && hat(gt, 'TRIGGER:PT0M') &&
  feld(gt, 'SUMMARY') === 'Lesen', gt.join(' | '));
// Angelegt an einem Donnerstag, fällig Montag und Mittwoch: der erste Termin ist der Montag danach.
var gwt = gewohnheitEreignis(gw({ angelegt: '2026-10-01', erinnerung: '20:00',
  rhythmus: { art: 'wochentage', tage: [3, 1] } }), S);
pruefe('I12 Wochentage als BYDAY, Beginn am ersten fälligen', feld(gwt, 'RRULE') === 'FREQ=WEEKLY;BYDAY=MO,WE' &&
  feld(gwt, 'DTSTART') === '20261005T200000', feld(gwt, 'RRULE') + ' ' + feld(gwt, 'DTSTART'));
pruefe('I13 x-mal pro Woche erinnert täglich', feld(gewohnheitEreignis(gw({ erinnerung: '08:00',
  rhythmus: { art: 'proWoche', anzahl: 3 } }), S), 'RRULE') === 'FREQ=DAILY');
pruefe('I14 der Stempel ist UTC', /^\d{8}T\d{6}Z$/.test(icsStempel(Date.UTC(2026, 9, 14, 6, 0, 0))) &&
  icsStempel(Date.UTC(2026, 9, 14, 6, 0, 0)) === S);

state = grundStand();
state.termine = [tm({ id: 'kommt', tag: '2026-10-20' }), tm({ id: 'vorbei', tag: '2026-10-01' }),
  tm({ id: 'heute', tag: HEUTE }), tm({ id: 'reiheAus', tag: '2026-09-01', wiederholung: 'taeglich',
  wiederholungBis: '2026-10-13' }), tm({ id: 'reiheLaeuft', tag: '2026-09-01', wiederholung: 'monatlich' })];
state.gewohnheiten = [gw({ id: 'mit', erinnerung: '07:00' }), gw({ id: 'ohne' }),
  gw({ id: 'archiv', erinnerung: '07:00', archiviert: '2026-10-10' })];
var datei = kalenderDatei(HEUTE, zeitJetzt()), zeilen = datei.split(CRLF);
var uids = zeilen.filter(function (x) { return x.indexOf('UID:') === 0; }).map(function (x) { return x.slice(4); });
pruefe('I15 die Datei ist ein Kalender', zeilen[0] === 'BEGIN:VCALENDAR' && zeilen[1] === 'VERSION:2.0' &&
  datei.slice(-15) === 'END:VCALENDAR' + CRLF && hat(zeilen, 'PRODID:-//Chilli//Chilli Journal ' + APP_VERSION + '//DE'));
pruefe('I16 jede Zeile endet mit CRLF', datei.replace(new RegExp(CRLF, 'g'), '').indexOf(String.fromCharCode(10)) === -1 &&
  datei.replace(new RegExp(CRLF, 'g'), '').indexOf(String.fromCharCode(13)) === -1);
pruefe('I17 Vergangenes, Archiviertes und Gewohnheiten ohne Uhrzeit bleiben draußen',
  uids.join() === 'reiheLaeuft@chillinal,heute@chillinal,kommt@chillinal,mit@chillinal', uids.join());
pruefe('I18 jedes BEGIN hat sein END', ['VEVENT', 'VALARM', 'VCALENDAR'].every(function (w) {
  return zeilen.filter(function (x) { return x === 'BEGIN:' + w; }).length ===
    zeilen.filter(function (x) { return x === 'END:' + w; }).length;
}));
pruefe('I19 die UIDs bleiben von Export zu Export', kalenderDatei(HEUTE, zeitJetzt() + 3600000).split(CRLF)
  .filter(function (x) { return x.indexOf('UID:') === 0; }).map(function (x) { return x.slice(4); }).join() === uids.join());

// ── G · Die Erinnerung einer Gewohnheit ─────────────────────
pruefe('G1 eine gültige Uhrzeit bleibt, alles andere wird null', gw({ erinnerung: '06:45' }).erinnerung === '06:45' &&
  gw({ erinnerung: '25:00' }).erinnerung === null && gw({ erinnerung: 7 }).erinnerung === null &&
  gw({}).erinnerung === null);
pruefe('G2 der Zeitpunkt des Exports wird gelesen', stand({ exportiert: 1791000000000 }).exportiert === 1791000000000 &&
  stand({ exportiert: 'gestern' }).exportiert === null && grundStand().exportiert === null);
neu();
zeige('neu');
pruefe('G3 eine neue Gewohnheit erinnert nicht', q('#gwErinnern').getAttribute('aria-checked') === 'false' &&
  q('#gwUhrTeil').hidden && !q('#gwErinnerung').hidden);
var name = q('#gwName');
tippe('gwName', 'Dehnen');
q('#gwErinnern').click();
pruefe('G4 der Schalter zeigt die Uhrzeit, ohne neu zu zeichnen', !q('#gwUhrTeil').hidden && q('#gwUhr').value === '08:00' &&
  q('#gwName') === name && name.value === 'Dehnen');
pruefe('G5 Trefferflächen', zuKlein().length === 0, zuKlein().join(', '));
pruefe('G6 das Formular duzt', !siezt(), siezt() && siezt().join(' | '));
q('[data-art="proWoche"]').click();
pruefe('G7 x-mal pro Woche sagt, daß täglich erinnert wird', /Jeden Tag/.test(q('#gwErText').textContent));
q('[data-art="taeglich"]').click();
tippe('gwUhr', '');
q('#gwSpeichern').click();
pruefe('G8 ohne Uhrzeit hält es an', ansicht === 'neu' && !state.gewohnheiten.length &&
  /Uhrzeit/.test(q('#meldung').textContent));
tippe('gwUhr', '06:15');
q('#gwSpeichern').click();
var dehnen = state.gewohnheiten[0];
pruefe('G9 angelegt mit Erinnerung', ansicht === 'home' && dehnen && dehnen.erinnerung === '06:15' &&
  JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten[0].erinnerung === '06:15');
zeige('bearbeiten', dehnen.id);
pruefe('G10 die Gewohnheit zeigt ihre Erinnerung', q('#gwErinnern').getAttribute('aria-checked') === 'true' &&
  q('#gwUhr').value === '06:15');
q('#gwErinnern').click();
q('#gwSpeichern').click();
pruefe('G11 ausgeschaltet ist sie weg', state.gewohnheiten[0].erinnerung === null);
zeige('neu');
q('[data-richtung="ab"]').click();
pruefe('G12 Abgewöhnen kennt keine Erinnerung', q('#gwErinnerung').hidden);

// ── A · Die Ansicht ─────────────────────────────────────────
neu();
menueOeffnen();
q('[data-menue="export"]').click();
pruefe('A1 das Menü öffnet den Export', ansicht === 'export' && q('#kopf h1').textContent === 'Kalender-Export' &&
  !!q('#zurueckKnopf'));
pruefe('A2 leer sagt sie, was fehlt', !!q('#exLeer') && !q('#exLaden') && !q('#exTeilen'));
state.termine = [tm({ id: 'kommt', titel: 'Kino', tag: '2026-10-20' }), tm({ id: 'vorbei', titel: 'Alt', tag: '2026-10-01' })];
state.gewohnheiten = [gw({ id: 'mit', name: 'Lesen', erinnerung: '07:00' }), gw({ id: 'ohne', name: 'Laufen' }),
  gw({ id: 'archiv', name: 'Weg', erinnerung: '07:00', archiviert: '2026-10-10' })];
render();
pruefe('A3 sie zeigt die kommenden Termine', alle('#ansicht [data-termin]').map(function (b) {
  return b.getAttribute('data-termin');
}).join() === 'kommt');
pruefe('A4 und jede laufende Gewohnheit', alle('#ansicht [data-exgw]').map(function (b) {
  return b.getAttribute('data-exgw');
}).join() === 'mit,ohne');
pruefe('A5 eine ohne Uhrzeit sagt, daß sie draußen bleibt', /bleibt draußen/.test(q('[data-exgw="ohne"]').textContent) &&
  q('[data-exgw="ohne"]').classList.contains('aus') && /07:00/.test(q('[data-exgw="mit"]').textContent));
pruefe('A6 Blau bleibt dem Termin', getComputedStyle(q('[data-exgw="mit"] .tm-zeit')).borderLeftColor !==
  getComputedStyle(q('[data-termin="kommt"] .tm-zeit')).borderLeftColor);
pruefe('A7 die Zahl zählt, was hinausgeht', q('#exZahl').textContent === '2' && q('#exZuletzt').textContent === 'noch nie');
pruefe('A8 Trefferflächen', zuKlein().length === 0, zuKlein().join(', '));
pruefe('A9 die Ansicht duzt', !siezt(), siezt() && siezt().join(' | '));

// Ohne Teilen ist «Als Datei laden» der Hauptknopf.
var teilenWar = navigator.share, kannWar = navigator.canShare;
Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });
render();
pruefe('A10 ohne Teilen nur Laden, als Hauptknopf', !q('#exTeilen') && !!q('#exLaden') &&
  !q('#exLaden').classList.contains('zart'));

// Laden: die Adresse und der Klick werden abgefangen.
var erwartetLaden = kalenderDatei(HEUTE, zeitJetzt());
var blobs = [], geklickt = null, klickWar = HTMLAnchorElement.prototype.click, urlWar = URL.createObjectURL;
URL.createObjectURL = function (b) { blobs.push(b); return 'blob:pruefung'; };
HTMLAnchorElement.prototype.click = function () { geklickt = { href: this.getAttribute('href'), name: this.download }; };
q('#exLaden').click();
HTMLAnchorElement.prototype.click = klickWar;
URL.createObjectURL = urlWar;
pruefe('A11 Laden reicht chillinal.ics weiter', geklickt && geklickt.name === 'chillinal.ics' &&
  geklickt.href === 'blob:pruefung' && blobs.length === 1 && /text\/calendar/.test(blobs[0].type), JSON.stringify(geklickt));
pruefe('A12 und merkt sich den Export', state.exportiert === zeitJetzt() &&
  JSON.parse(localStorage.getItem(SPEICHER)).exportiert === zeitJetzt() && q('#exZuletzt').textContent !== 'noch nie');
pruefe('A13 kein Link bleibt liegen', !document.querySelector('a[download]'));

// Teilen: einmal angenommen, einmal abgebrochen.
var geteilt = [], antwort = 'ja';
Object.defineProperty(navigator, 'canShare', { value: function () { return true; }, configurable: true, writable: true });
Object.defineProperty(navigator, 'share', { value: function (d) {
  geteilt.push(d);
  if (antwort === 'ja') return Promise.resolve();
  var e = new Error('abgebrochen'); e.name = 'AbortError';
  return Promise.reject(e);
}, configurable: true, writable: true });
state.exportiert = null;
ohneMarken();
render();
var erwartetTeilen = kalenderDatei(HEUTE, zeitJetzt());
pruefe('A14 mit Teilen zwei Knöpfe, Teilen vorn', !!q('#exTeilen') && q('#exLaden').classList.contains('zart') &&
  q('#exTeilen').compareDocumentPosition(q('#exLaden')) === Node.DOCUMENT_POSITION_FOLLOWING);
q('#exTeilen').click();
var blobDatei = blobs[0];
return Promise.resolve().then(function () { return new Promise(function (f) { setTimeout(f, 0); }); }).then(function () {
  var d = geteilt[0], f = d && d.files && d.files[0];
  pruefe('A15 Teilen reicht eine .ics-Datei weiter', f && f.name === 'chillinal.ics' && /text\/calendar/.test(f.type));
  pruefe('A16 und merkt sich den Export', state.exportiert === zeitJetzt() && /Geteilt/.test(q('#meldung').textContent));
  return blobText(f);
}).then(function (text) {
  pruefe('A17 die geteilte Datei ist die gerechnete', text === erwartetTeilen &&
    /BEGIN:VEVENT/.test(text));
  return blobText(blobDatei);
}).then(function (text) {
  pruefe('A18 die geladene ebenso', text === erwartetLaden);
  antwort = 'nein';
  ohneMarken();
  render();
  state.exportiert = null;
  q('#meldung').textContent = '';
  q('#exTeilen').click();
  return new Promise(function (f) { setTimeout(f, 0); });
}).then(function () {
  pruefe('A19 abgebrochen ist nicht exportiert und kein Fehler', state.exportiert === null &&
    !/ging nicht/.test(q('#meldung').textContent));
  Object.defineProperty(navigator, 'share', { value: teilenWar, configurable: true, writable: true });
  Object.defineProperty(navigator, 'canShare', { value: kannWar, configurable: true, writable: true });

  // Von hier und zurück.
  render();
  q('[data-exgw="ohne"]').click();
  pruefe('A20 eine Gewohnheit öffnet sich', ansicht === 'bearbeiten' && q('#gwName').value === 'Laufen');
  q('#zurueckKnopf').click();
  pruefe('A21 der Rückweg führt zum Export', ansicht === 'export');
  q('[data-exgw="ohne"]').click();
  q('#gwErinnern').click();
  q('#gwSpeichern').click();
  pruefe('A22 nach dem Speichern auch, und sie geht mit', ansicht === 'export' && q('#exZahl').textContent === '3' &&
    !q('[data-exgw="ohne"]').classList.contains('aus'));
  q('[data-termin="kommt"]').click();
  pruefe('A23 ein Termin öffnet sich', ansicht === 'termin' && q('#tmTitel').value === 'Kino');
  q('#zurueckKnopf').click();
  pruefe('A24 und zurück zum Export', ansicht === 'export');
  q('#zurueckKnopf').click();
  pruefe('A25 vom Export geht es nach Hause', ansicht === 'home');
  zeige('bearbeiten', 'mit');
  q('#zurueckKnopf').click();
  pruefe('A26 von zu Hause geöffnet bleibt es dabei', ansicht === 'home');
});
`);
