// Feinschliff (Bauabschnitt 8): Leerzustände, Chili-Jubel über den Haken
// hinaus, Bewegung, wo vorher etwas sprang.
//
// Die Uhr steht: «jetzt» ist Dienstag, der 13. Oktober 2026, 12:00.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('feinschliff', html, String.raw`
var UHR = new Date(2026, 9, 13, 12, 0).getTime();
jetzt = function () { return new Date(UHR); };
var M = 60e3, H = 36e5, T = 864e5;
var heute = '2026-10-13';
function tage(von, bis) {
  var l = [];
  for (var k = von; k <= bis; k = tagPlus(k, 1)) l.push(k);
  return l;
}
function gewohnheit(id, angelegt, erledigt, rhythmus, name) {
  var g = gewohnheitLesen({ id: id, name: name || 'Lesen', rhythmus: rhythmus || { art: 'taeglich' },
    angelegt: angelegt, erledigt: erledigt || [] });
  state.gewohnheiten.push(g);
  return g;
}
function laster(id, start, rueckfaelle, name) {
  var a = lasterLesen({ id: id, name: name || 'Rauchen', start: start, rueckfaelle: rueckfaelle || [], draenge: [] });
  state.abgewoehnen.push(a);
  return a;
}
function glas() {
  var b = q('#hinweisBlatt');
  return !b.hidden && b.classList.contains('offen') && q('#hinweisKarte').classList.contains('bestaetigung')
    ? q('#hinweisTitel').textContent + ' · ' + q('#hinweisText').textContent : '';
}
function chili() { return q('#chiliFigur') ? q('#chiliFigur').className : 'fehlt'; }
function zuKlein(sel) {
  ausbewegt();
  return alle(sel).filter(function (b) {
    var r = b.getBoundingClientRect();
    return r.width && (r.width < 44 || r.height < 44);
  }).map(function (b) { return b.id || b.textContent.trim(); });
}
function siezt() {
  var t = q('#app').innerText + ' ' + q('#hinweisBlatt').innerText;
  var m = t.match(/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/g);
  return m ? m.join(' | ') : '';
}
function neu() { frisch(); hinweisSchliessen(); jubelGehabt = {}; }
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }

// ── A · Leerzustände ────────────────────────────────────────
neu();
pruefe('A1 ganz leer: die Chili begrüßt zum ersten Mal', /Hallo/.test(q('.willkommen h2').textContent) &&
  /Erste Gewohnheit/.test(q('#ersteGewohnheit').textContent) && !q('#gwAnlegen'));

laster('a1', UHR - 3 * T);
render();
var leer = q('#gwAnlegen');
pruefe('A2 nur Abgewöhnen: wo Gewohnheiten stünden, steht der Weg dorthin',
  !q('.willkommen') && !!leer && !!leer.closest('.kachel.leer') &&
  /Gewohnheiten/.test(leer.closest('section').querySelector('h2').textContent) &&
  /Noch keine Gewohnheit/.test(leer.closest('.kachel').textContent));
pruefe('A3 die Chili bleibt dabei einmal, oben im Ring', alle('#chiliFigur').length === 1 && !!q('.tagesring #chiliFigur'));
pruefe('A4 der leere Abschnitt steht vor dem Abgewöhnen',
  leer.getBoundingClientRect().top < q('[data-ab="a1"]').getBoundingClientRect().top);
pruefe('A5 sein Knopf ist groß genug', zuKlein('#gwAnlegen').length === 0, zuKlein('#gwAnlegen'));
leer.click();
pruefe('A6 er öffnet «Neue Gewohnheit»', ansicht === 'neu');

neu();
state.termine.push(terminLesen({ id: 't1', titel: 'Zahnarzt', tag: heute, ganztags: true, wiederholung: 'keine' }));
render();
pruefe('A7 nur ein Termin: auch dann der Weg zur Gewohnheit', !!q('#gwAnlegen') && !q('#ersteGewohnheit'));

neu();
gewohnheit('g1', heute);
render();
pruefe('A8 mit einer Gewohnheit kein leerer Abschnitt', !q('#gwAnlegen') && !q('.kachel.leer'));

state.gewohnheiten[0].archiviert = heute;
render();
pruefe('A9 alles archiviert: kein «Hallo» wie beim ersten Mal', !!q('.willkommen') &&
  !/Hallo/.test(q('.willkommen h2').textContent) && /archiviert/.test(q('.willkommen p').textContent) &&
  /Neue Gewohnheit anlegen/.test(q('#ersteGewohnheit').textContent));
pruefe('A10 die Chili dabei genau einmal', alle('#chiliFigur').length === 1);

// Die Zeile unter der Heatmap
neu();
var g1 = gewohnheit('g1', heute);
zeige('bearbeiten', 'g1');
pruefe('A11 frisch angelegt: kein «0 von 0»', q('#hmZeile').textContent === 'Noch kein fälliger Tag vorbei.',
  q('#hmZeile').textContent);
neu();
gewohnheit('g2', heute, [], { art: 'proWoche', anzahl: 3 });
zeige('bearbeiten', 'g2');
pruefe('A12 pro Woche frisch: «Noch nichts erledigt.»', q('#hmZeile').textContent === 'Noch nichts erledigt.',
  q('#hmZeile').textContent);
neu();
gewohnheit('g3', '2026-10-12', ['2026-10-12']);
zeige('bearbeiten', 'g3');
pruefe('A13 mit einem Tag zählt sie wie bisher', q('#hmZeile').textContent === '1 von 1 fälligen Tagen erledigt.',
  q('#hmZeile').textContent);
neu();
// Montag, der 12., ist kein fälliger Tag (nur Mittwoch) — erledigt wurde er trotzdem.
gewohnheit('g4', '2026-10-12', ['2026-10-12'], { art: 'wochentage', tage: [3] });
zeige('bearbeiten', 'g4');
pruefe('A14 nur an freien Tagen erledigt: das sagt sie', q('#hmZeile').textContent === '1-mal erledigt, an freien Tagen.',
  q('#hmZeile').textContent);

// Der leere Export
neu();
zeige('export');
pruefe('A15 leerer Export: Satz und beide Wege', !!q('#exLeer') && !!q('#exTerminNeu') && !!q('#exGewohnheitNeu') &&
  /mit Erinnerung/.test(q('#exLeer').textContent));
pruefe('A16 die Knöpfe sind groß genug', zuKlein('.ex-leer-wege button').length === 0, zuKlein('.ex-leer-wege button'));
q('#exTerminNeu').click();
pruefe('A17 «Neuer Termin» öffnet das Formular', ansicht === 'terminNeu' && rueckZiel === 'export');
zurueckGehen();
pruefe('A18 zurück geht es in den Export', ansicht === 'export');
q('#exTerminNeu').click();
q('#tmTitel').value = 'Zahnarzt';
q('#tmTitel').dispatchEvent(new Event('input'));
q('#tmSpeichern').click();
hinweisSchliessen();
pruefe('A19 angelegt, steht man wieder im Export, mit dem Termin', ansicht === 'export' && !q('#exLeer') &&
  !!q('[data-termin]'), ansicht);
neu();
zeige('export');
q('#exGewohnheitNeu').click();
pruefe('A20 «Neue Gewohnheit» öffnet das Formular, zurück in den Export', ansicht === 'neu' && rueckZiel === 'export');
neu();
gewohnheit('g1', heute);
zeige('export');
pruefe('A21 mit Gewohnheit ohne Erinnerung: nur «Neuer Termin», der Satz zeigt nach oben',
  !!q('#exTerminNeu') && !q('#exGewohnheitNeu') && /oben/.test(q('#exLeer').textContent));
pruefe('A22 alles duzt', siezt() === '', siezt());

// ── B · Jubel: Stärke ───────────────────────────────────────
// 19 Tage lückenlos: 48 %. Der zwanzigste macht 50 %.
neu();
var gs = gewohnheit('gs', '2026-09-24', tage('2026-09-24', '2026-10-12'));
render();
pruefe('B1 vorher 48 %', prozent(auswerten(gs, heute).staerke) === 48, prozent(auswerten(gs, heute).staerke));
q('[data-haken="gs"]').click();
pruefe('B2 die Hälfte: Glas mit Haken, die Chili lodert', /^Halb gefestigt · «Lesen» hat 50 %/.test(glas()) &&
  chili() === 'lodert' && q('#hinweisHaken').getAttribute('data-zeichen') === 'haken', glas() + ' / ' + chili());
hinweisSchliessen();
q('[data-haken="gs"]').click();
pruefe('B3 zurückgenommen: kein Jubel', glas() === '' && chili() === '');
q('[data-haken="gs"]').click();
pruefe('B4 wieder gesetzt: einmal gefeiert ist genug', glas() === '', glas());
hinweisSchliessen();

// 64 Tage lückenlos: 89 %. Der 65. macht 90 %.
neu();
var gf = gewohnheit('gf', '2026-08-10', tage('2026-08-10', '2026-10-12'), null, 'Laufen');
render();
pruefe('B5 vorher 89 %', prozent(auswerten(gf, heute).staerke) === 89, prozent(auswerten(gf, heute).staerke));
q('[data-haken="gf"]').click();
pruefe('B6 90 %: «Gefestigt», die Chili lodert', /^Gefestigt · «Laufen» hat 90 %/.test(glas()) && chili() === 'lodert',
  glas());
hinweisSchliessen();

// Kein Meilenstein, kein Glas: ein gewöhnlicher Haken flammt nur.
neu();
gewohnheit('gn', '2026-10-10', ['2026-10-10', '2026-10-11', '2026-10-12']);
gewohnheit('gm', '2026-10-10', [], null, 'Wasser');
render();
q('[data-haken="gn"]').click();
pruefe('B7 ein gewöhnlicher Haken: nur flammen, kein Glas', chili() === 'flammt' && glas() === '', glas());

// Nie zweimal: gestern verpaßt, heute gesetzt.
neu();
gewohnheit('gw', '2026-10-05', tage('2026-10-05', '2026-10-11'), null, 'Dehnen');
gewohnheit('gx', '2026-10-05', [], null, 'Wasser');
render();
pruefe('B8 vorher warnt die Kachel', !!q('[data-haken="gw"]').closest('.warnen'));
q('[data-haken="gw"]').click();
pruefe('B9 der Aussetzer bleibt einer: Glas, die Chili flammt', /^Nicht zweimal/.test(glas()) && chili() === 'flammt',
  glas() + ' / ' + chili());
hinweisSchliessen();
q('[data-haken="gw"]').click();
q('[data-haken="gw"]').click();
pruefe('B10 noch einmal gesetzt: nicht noch einmal', glas() === '', glas());
hinweisSchliessen();

// Nachgetragen im Kalender: dieselbe Stufe, das Glas kommt aus der Zeile.
// 19 Tage am Stück, gestern nicht: 47 %. Gestern nachgetragen sind es
// zwanzig: 50 %.
neu();
gewohnheit('gk', '2026-09-23', tage('2026-09-23', '2026-10-11'));
kalTag = '2026-10-12';
render();
var zeile = q('[data-nachtrag="gk"]');
pruefe('B11 die Zeile zum Nachtragen steht da', !!zeile);
var vorStaerke = prozent(auswerten(state.gewohnheiten[0], heute).staerke);
zeile.click();
pruefe('B12 nachgetragen über die Hälfte: auch dann der Jubel', vorStaerke < 50 && /^Halb gefestigt/.test(glas()),
  vorStaerke + ' / ' + glas());
hinweisSchliessen();
kalTag = null;
pruefe('B13 alles duzt', siezt() === '', siezt());

// ── C · Jubel: Rekord im Abgewöhnen ────────────────────────
neu();
// Erster Rückfall nach 2 Tagen, zweiter nach weiteren 3 Tagen: Rekord 3 T.
// Seit dem zweiten 2 T 23 h — eine Stunde fehlt noch.
var r2 = UHR - 2 * T - 23 * H;
var ar = laster('ar', r2 - 5 * T, [{ zeit: r2 - 3 * T }, { zeit: r2 }]);
render();
pruefe('C1 noch kein Rekord: kein Glas, keine Marke', glas() === '' && !state.gefeiert.ar);
UHR += H - 1000;
takt();
pruefe('C2 eine Sekunde davor: nichts', glas() === '' && !state.gefeiert.ar);
UHR += 2000;
takt();
pruefe('C3 überholt: der Takt feiert — Glas, die Chili lodert',
  /^Neuer Rekord · «Rauchen»/.test(glas()) && chili() === 'lodert', glas() + ' / ' + chili());
pruefe('C4 gemerkt ist der Rückfall, nach dem die Strecke begann', state.gefeiert.ar === r2 &&
  JSON.parse(localStorage.getItem(SPEICHER)).gefeiert.ar === r2);
hinweisSchliessen();
UHR += M;
takt();
render();
pruefe('C5 einmal je Strecke: weder Takt noch Neuzeichnen feiern wieder', glas() === '', glas());
pruefe('C6 die Marke übersteht das Neuladen', laden().gefeiert.ar === r2);
// Ein neuer Rückfall beginnt eine neue Strecke; überholt sie den Rekord, wieder.
rueckfallEintragen('ar', '');
render();
pruefe('C7 nach dem Rückfall: nichts zu feiern', glas() === '');
UHR += 4 * T;
render();
pruefe('C8 die nächste Strecke überholt (während die App zu war): gefeiert beim Öffnen',
  /^Neuer Rekord/.test(glas()) && state.gefeiert.ar !== r2, glas());
hinweisSchliessen();

neu();
laster('ak', UHR - 2 * H, [{ zeit: UHR - 2 * H + 10 * M }]);
render();
pruefe('C9 ein Rekord unter einer Stunde ist keiner zum Feiern', glas() === '' && !state.gefeiert.ak);
neu();
laster('ao', UHR - 30 * T);
render();
pruefe('C10 ohne Rückfall kein alter Rekord, kein Jubel', glas() === '' && !state.gefeiert.ao);

// stand(): nur Zeitpunkte, nur für Laster, die es gibt
var roh = { abgewoehnen: [{ id: 'x1', name: 'A', start: 1, rueckfaelle: [], draenge: [] }],
  gefeiert: { x1: 5, x2: 7, x3: 'kaputt' } };
var st = stand(roh);
pruefe('C11 stand() behält nur Gültiges', st.gefeiert.x1 === 5 && !('x2' in st.gefeiert) && !('x3' in st.gefeiert));
pruefe('C12 ohne Feld: leer', JSON.stringify(stand({}).gefeiert) === '{}' && JSON.stringify(stand({ gefeiert: 3 }).gefeiert) === '{}');
state.gefeiert.ao = UHR - T;
pruefe('C13 der Sicherungscode trägt die Marke mit', stand(codeLesen(sicherungsCode(UHR))).gefeiert.ao === UHR - T);

// ── D · Welle und Wochenreflexion ──────────────────────────
neu();
laster('aw', UHR - 5 * T);
render();
q('[data-drang="aw"]').click();
pruefe('D1 die Welle läuft, die Chili wippt nur', ansicht === 'welle' && chili() === '');
UHR += WELLE_MS;
takt();
pruefe('D2 durch: die Chili flammt', chili() === 'flammt' && !!q('#welleGewonnen'));
pruefe('D3 «Gewonnen» kommt in seinem Teil, sichtbar', !!q('#welleUrteil') && !q('#welleUrteil').hidden &&
  q('#welleUrteil').contains(q('#welleGewonnen')));
ausbewegt();
pruefe('D4 ausbewegt ist der Knopf groß genug', zuKlein('#welleGewonnen').length === 0);
render();
pruefe('D5 neu gezeichnet flammt sie nicht wieder', chili() === '');
q('#welleGewonnen').click();
hinweisSchliessen();

// Sonntag, Wochenreflexion vom Dashboard: zurück flammt die Chili.
neu();
UHR = new Date(2026, 9, 18, 12, 0).getTime();
gewohnheit('gr', '2026-10-12');
render();
q('[data-reflexion]').click();
q('#jrGut').value = 'Viel gelesen.';
q('#jrGut').dispatchEvent(new Event('input'));
q('#jrSpeichern').click();
pruefe('D6 gespeichert, zurück auf dem Dashboard flammt die Chili', ansicht === 'home' && chili() === 'flammt', chili());
hinweisSchliessen();
zeige('journal');
zeige('reflexion', '2026-10-12');
q('#jrStoerte').value = 'Wenig Schlaf.';
q('#jrStoerte').dispatchEvent(new Event('input'));
q('#jrSpeichern').click();
pruefe('D7 aus dem Journal geschrieben, geht es dorthin zurück — dort ist keine Chili', ansicht === 'journal' &&
  !q('#chiliFigur'), ansicht);
hinweisSchliessen();
UHR = new Date(2026, 9, 13, 12, 0).getTime();

// ── E · Was geht, zieht sich zusammen ──────────────────────
neu();
var al = laster('al', UHR - 9 * T, [{ zeit: UHR - 6 * T, notiz: 'eins' }, { zeit: UHR - 3 * T, notiz: 'zwei' }]);
zeige('abgewoehnen', 'al');
ausbewegt();
q('[data-rf-loeschen="1"]').click();
q('#hinweisOk').click();
var geister = alle('.rf-liste .geist');
pruefe('E1 der gelöschte Rückfall steht als Geist in der Liste', al.rueckfaelle.length === 1 && geister.length === 1 &&
  alle('.rf-liste .rf-zeile').length === 1, geister.length);
pruefe('E2 der Geist steht, wo die Zeile stand: oben', q('.rf-liste').firstElementChild === geister[0]);
ausbewegt();
return warten(30).then(function () {
pruefe('E3 ausbewegt ist er fort', alle('.rf-liste .geist').length === 0);
state.bewegung = 'aus';
themaAnwenden();
q('[data-rf-loeschen="0"]').click();
q('#hinweisOk').click();
pruefe('E4 ohne Bewegung kein Geist', al.rueckfaelle.length === 0 && alle('.rf-liste .geist').length === 0 &&
  !!q('.rf-leer'));
state.bewegung = 'auto';
themaAnwenden();

neu();
state.tickets.push(ticketLesen({ id: 'k1', art: 'fehler', titel: 'Eins', text: '', ort: 'kalender', grund: '',
  erstellt: UHR - 2 * M, stand: '0.9.0', abgegeben: null }));
state.tickets.push(ticketLesen({ id: 'k2', art: 'wunsch', titel: 'Zwei', text: '', ort: 'kalender', grund: '',
  erstellt: UHR - M, stand: '0.9.0', abgegeben: null }));
zeige('tickets');
ausbewegt();
q('[data-ticket="k1"]').click();
ausbewegt();
q('#tkLoeschen').click();
q('#hinweisOk').click();
pruefe('E5 ein gelöschtes Ticket geht als Geist aus der Liste', state.tickets.length === 1 &&
  alle('#tkOffen .tm-liste .geist').length === 1 && alle('#tkOffen [data-ticket]').length === 1);
ausbewegt();
return warten(30);
}).then(function () {
pruefe('E6 ausbewegt ist er fort', alle('#tkOffen .geist').length === 0);
hinweisSchliessen();
q('[data-ticket="k2"]').click();
ausbewegt();
q('#tkLoeschen').click();
q('#hinweisOk').click();
pruefe('E7 das letzte geht auch: vor dem Satz, der die Liste ersetzt', state.tickets.length === 0 &&
  alle('#tkOffen > .geist').length === 1 && q('#tkOffen > .geist').nextElementSibling === q('#tkOffen .klein'));
ausbewegt();
hinweisSchliessen();
});
`);
