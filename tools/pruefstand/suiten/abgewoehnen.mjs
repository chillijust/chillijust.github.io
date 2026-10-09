// Abgewöhnen (Bauabschnitt 3): frei seit, Rekord, Stärke, Rückfall, die
// 10-Minuten-Welle — Rechnung, Speicher, Anlegen, Kachel, Takt, Bearbeiten.
//
// Die Uhr steht und wird von Hand weitergedreht: «jetzt» ist Mittwoch, der
// 14. Oktober 2026, 12:00.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

// Von außen: Was stand() braucht, steht vor dem ersten laden() — sonst wäre es
// beim Start undefined, und jede Notiz fiele still aus dem Speicher.
const laedt = html.indexOf('var state = laden();');
for (const name of ['NOTIZ_MAX']) {
  const steht = html.indexOf('var ' + name + ' =');
  if (steht === -1 || laedt === -1 || steht > laedt) {
    throw new Error(name + ' steht nicht vor «var state = laden();»');
  }
}

suite('abgewoehnen', html, String.raw`
var UHR = new Date(2026, 9, 14, 12, 0).getTime();
jetzt = function () { return new Date(UHR); };
var M = 60e3, H = 36e5, T = 864e5;
var nr = 0;
function laster(start, rueckfaelle, draenge, name) {
  return lasterLesen({ id: 'a' + (++nr), name: name || 'Rauchen', start: start,
    rueckfaelle: rueckfaelle || [], draenge: draenge || [] });
}
function rf(zeit, notiz) { return { zeit: zeit, notiz: notiz || '' }; }
function nahe(a, b) { return Math.abs(a - b) < 1e-9; }
function eingeben(sel, text) {
  var feld = q(sel);
  feld.value = text;
  feld.dispatchEvent(new Event('input'));
}
function meldung() { return q('#meldung').textContent; }
function zuKlein(wurzel) {
  ausbewegt();
  return alle(wurzel + ' button, ' + wurzel + ' input, ' + wurzel + ' textarea').filter(function (b) {
    var r = b.getBoundingClientRect();
    return r.width && (r.width < 44 || r.height < 44);
  }).map(function (b) { return b.id || b.textContent.trim() || b.className; });
}
function siezt() {
  var t = q('#app').innerText;
  var m = t.match(/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/g);
  return m ? m.join(' | ') : '';
}
frisch();

// ── A · Rechnung ────────────────────────────────────────────
pruefe('A1 Dauer: Sekunden, Minuten, Stunden, Tage',
  dauer(0) === '0 min 00 s' && dauer(65e3) === '1 min 05 s' && dauer(3 * H + 12 * M) === '3 h 12 min' &&
  dauer(12 * T + 4 * H + 59 * M) === '12 T 4 h', [dauer(0), dauer(65e3), dauer(3 * H + 12 * M)].join(' / '));
pruefe('A2 Restzeit der Welle', restText(WELLE_MS) === '10:00' && restText(1) === '0:01' && restText(0) === '0:00');
var ohne = lasterAuswerten(laster(UHR - 5 * T), UHR);
pruefe('A3 ohne Rückfall: frei seit dem Start', ohne.frei === 5 * T && ohne.rueckfaelle === 0);
var zwei = laster(UHR - 40 * T, [rf(UHR - 25 * T), rf(UHR - 12 * T)]);
var e2 = lasterAuswerten(zwei, UHR);
pruefe('A4 ein Rückfall setzt «frei seit» zurück', e2.frei === 12 * T, e2.frei);
pruefe('A5 der Rekord bleibt stehen', e2.rekord === 15 * T && !e2.rekordLaeuft, e2.rekord);
var e3 = lasterAuswerten(zwei, UHR + 4 * T);
pruefe('A6 die laufende Strecke wird Rekord, sobald sie länger ist', e3.rekord === 16 * T && e3.rekordLaeuft);
pruefe('A7 Stärke: 30 Tage frei samt heute ergeben 31 von 66',
  nahe(lasterAuswerten(laster(UHR - 30 * T), UHR).staerke, 31 / 66));
pruefe('A8 Stärke: nach 66 freien Tagen voll, nicht mehr',
  lasterAuswerten(laster(UHR - 100 * T), UHR).staerke === 1);
var drei = laster(UHR - 30 * T, [rf(UHR - 20 * T), rf(UHR - 10 * T), rf(UHR - 10 * T + H)]);
pruefe('A9 Rückfalltage zählen nicht frei, zwei am selben Tag einmal',
  nahe(lasterAuswerten(drei, UHR).staerke, 29 / 66), lasterAuswerten(drei, UHR).staerke * 66);
var spaeter = lasterAuswerten(laster(UHR - 3 * T, [rf(UHR + H)]), UHR);
pruefe('A10 ein Rückfall nach «jetzt» zählt noch nicht', spaeter.frei === 3 * T && spaeter.rueckfaelle === 0);

// ── B · Speicher ────────────────────────────────────────────
var gut = lasterLesen({ id: 'x', name: '  Zucker  ', start: UHR - T, rueckfaelle: [rf(UHR - H, 'Kuchen')],
  draenge: [UHR - 2 * H], archiviert: null });
pruefe('B1 Gültiges kommt durch, Name getrimmt',
  gut && gut.name === 'Zucker' && gut.rueckfaelle.length === 1 && gut.draenge.length === 1);
pruefe('B2 ohne Name oder Start fällt es weg',
  !lasterLesen({ id: 'x', name: '', start: UHR }) && !lasterLesen({ id: 'x', name: 'a', start: 'gestern' }) &&
  !lasterLesen({ id: 'x', name: 'a' }));
var vorher = lasterLesen({ id: 'x', name: 'a', start: UHR - T, rueckfaelle: [rf(UHR - 2 * T), rf(UHR - H), { zeit: 'x' }] });
pruefe('B3 ein Rückfall vor dem Start oder ohne Zeit fällt weg', vorher.rueckfaelle.length === 1);
var lang = lasterLesen({ id: 'x', name: 'a', start: UHR - T, rueckfaelle: [rf(UHR - H, new Array(400).join('x'))] });
pruefe('B4 die Notiz wird auf NOTIZ_MAX gekürzt', lang.rueckfaelle[0].notiz.length === NOTIZ_MAX);
var wirr = lasterLesen({ id: 'x', name: 'a', start: UHR - T, rueckfaelle: [rf(UHR - H), rf(UHR - 5 * H)] });
pruefe('B5 Rückfälle werden sortiert', wirr.rueckfaelle[0].zeit === UHR - 5 * H);
var roh = { abgewoehnen: [{ id: 'a', name: 'a', start: UHR - T }, { id: 'a', name: 'b', start: UHR - T },
  { id: 'b', name: 'b', start: UHR - T, archiviert: '2026-10-13' }] };
pruefe('B6 eine doppelte id kommt nur einmal', stand(roh).abgewoehnen.length === 2);
roh.welle = { id: 'gibtsnicht', start: UHR };
pruefe('B7 eine Welle für Unbekanntes fällt weg', stand(roh).welle === null);
roh.welle = { id: 'b', start: UHR };
pruefe('B8 eine Welle für Archiviertes ebenso', stand(roh).welle === null);
roh.welle = { id: 'a', start: UHR };
pruefe('B9 eine gültige Welle bleibt', stand(roh).welle && stand(roh).welle.id === 'a');
pruefe('B10 der Grundstand kennt beides', Array.isArray(grundStand().abgewoehnen) && grundStand().welle === null);
var altStand = stand({ gewohnheiten: [] });
pruefe('B11 ein Stand von 0.2 ohne die Felder lädt', altStand.abgewoehnen.length === 0 && altStand.welle === null);

// ── C · Anlegen ─────────────────────────────────────────────
frisch();
zeige('neu');
pruefe('C1 das Formular beginnt beim Angewöhnen',
  q('[data-richtung="an"]').getAttribute('aria-pressed') === 'true' && q('#abStart').hidden && !q('#rhAbschnitt').hidden);
q('[data-richtung="ab"]').click();
pruefe('C2 Abgewöhnen blendet den Rhythmus aus und «frei seit» ein',
  q('#rhAbschnitt').hidden && !q('#abStart').hidden && /Rauchen/.test(q('#gwName').placeholder) &&
  q('#rhAbschnitt').getBoundingClientRect().height === 0);
pruefe('C3 «frei seit» steht auf jetzt', q('#abTag').value === '2026-10-14' && q('#abUhr').value === '12:00');
pruefe('C4 die Felder sind groß genug', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
q('#gwSpeichern').click();
pruefe('C5 ohne Namen wird nichts angelegt', ansicht === 'neu' && state.abgewoehnen.length === 0);
UHR += 37e3;   // ein paar Sekunden später
eingeben('#gwName', 'Rauchen');
q('#gwSpeichern').click();
var a1 = state.abgewoehnen[0];
pruefe('C6 angelegt, auf die Sekunde «jetzt»', a1 && a1.name === 'Rauchen' && a1.start === UHR && a1.id.charAt(0) === 'a',
  a1 && a1.start - UHR);
pruefe('C7 im Speicher', JSON.parse(localStorage.getItem(SPEICHER)).abgewoehnen.length === 1);
pruefe('C8 das Dashboard zeigt die Kachel unter «Abgewöhnen»', ansicht === 'home' && !!q('[data-ab="' + a1.id + '"]') &&
  alle('#ansicht h2').some(function (h) { return h.textContent === 'Abgewöhnen'; }));
pruefe('C9 statt Willkommen der Tagesring, die Chili genau einmal',
  !q('.willkommen') && !!q('.tagesring') && alle('#chiliFigur').length === 1);
zeige('neu');
q('[data-richtung="ab"]').click();
eingeben('#gwName', 'Zucker');
eingeben('#abTag', '2026-10-11');
eingeben('#abUhr', '08:30');
q('#gwSpeichern').click();
var a2 = state.abgewoehnen[1];
pruefe('C10 rückwirkend: Tag und Uhrzeit gelten', a2 && a2.start === new Date(2026, 9, 11, 8, 30).getTime());
zeige('neu');
q('[data-richtung="ab"]').click();
eingeben('#gwName', 'Später');
eingeben('#abTag', '2026-10-15');
q('#gwSpeichern').click();
pruefe('C11 ein Start in der Zukunft wird abgewiesen',
  ansicht === 'neu' && state.abgewoehnen.length === 2 && /Zukunft/.test(meldung()));
pruefe('C11a ein Fehler kommt im Glas, mit neutralem Zeichen (ADR 0019)', !q('#hinweisBlatt').hidden &&
  q('#hinweisKarte').classList.contains('glas') && q('#hinweisHaken').classList.contains('neutral') &&
  q('#hinweisTitel').textContent === 'Der Start liegt in der Zukunft' && q('#hinweisOk').hidden);
hinweisSchliessen();
q('[data-richtung="an"]').click();
q('#gwSpeichern').click();
pruefe('C12 zurück auf Angewöhnen wird es eine Gewohnheit',
  state.gewohnheiten.length === 1 && state.gewohnheiten[0].name === 'Später' && state.abgewoehnen.length === 2);

// ── D · Kachel und Takt ─────────────────────────────────────
var zahl = q('[data-frei="' + a1.id + '"]');
pruefe('D1 die Kachel nennt «frei seit»', zahl && zahl.textContent === '0 min 00 s', zahl && zahl.textContent);
UHR += 65e3;
takt();
pruefe('D2 der Takt zählt weiter, ohne neu zu zeichnen',
  q('[data-frei="' + a1.id + '"]') === zahl && zahl.textContent === '1 min 05 s', zahl.textContent);
pruefe('D3 die Zahl hat gleich breite Ziffern', getComputedStyle(zahl).fontVariantNumeric.indexOf('tabular-nums') !== -1);
pruefe('D4 jede Kachel hat Drang und Rückfall', alle('.ab-kachel').every(function (k) {
  return !!k.querySelector('[data-drang]') && !!k.querySelector('[data-rueckfall]');
}));
pruefe('D5 alles auf dem Dashboard ist groß genug', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
pruefe('D6 «Noch kein Rückfall», solange keiner war', /Noch kein Rückfall/.test(q('.ab-kachel').textContent));
q('[data-ab="' + a1.id + '"]').click();
pruefe('D7 Antippen öffnet sie', ansicht === 'abgewoehnen' && q('#kopf h1').textContent === 'Abgewöhnen');
zeige('home');

// ── E · Rückfall ────────────────────────────────────────────
UHR += 3 * H;
render();
q('[data-rueckfall="' + a1.id + '"]').click();
pruefe('E1 «Rückfall» fragt erst', ansicht === 'rueckfall' && q('#kopf h1').textContent === 'Rückfall' &&
  !!q('#rfNotiz') && a1.rueckfaelle.length === 0);
pruefe('E2 und sagt, daß der Rekord bleibt', /Rekord von 3 h 1 min bleibt/.test(q('#app').textContent));
q('#rfAbbrechen').click();
pruefe('E3 Abbrechen trägt nichts ein', ansicht === 'home' && a1.rueckfaelle.length === 0);
q('[data-rueckfall="' + a1.id + '"]').click();
eingeben('#rfNotiz', '  Stress im Büro  ');
q('#rfEintragen').click();
pruefe('E4 Eintragen: mit Zeit und Notiz', a1.rueckfaelle.length === 1 && a1.rueckfaelle[0].zeit === UHR &&
  a1.rueckfaelle[0].notiz === 'Stress im Büro');
pruefe('E5 zurück auf dem Dashboard, frei ab jetzt', ansicht === 'home' &&
  q('[data-frei="' + a1.id + '"]').textContent === '0 min 00 s' && /neu/.test(meldung()));
pruefe('E5a «Eingetragen» kommt im Glas, mit Haken, Satz für Satz', !q('#hinweisBlatt').hidden &&
  q('#hinweisKarte').classList.contains('bestaetigung') && !q('#hinweisHaken').classList.contains('neutral') &&
  q('#hinweisTitel').textContent === 'Eingetragen' && q('#hinweisText').textContent === 'Ab jetzt zählt es neu.');
hinweisSchliessen();
pruefe('E6 der Rekord steht auf der Kachel', /Rekord 3 h 1 min/.test(q('[data-ab="' + a1.id + '"]').textContent));
pruefe('E7 gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).abgewoehnen[0].rueckfaelle.length === 1);

// ── F · Die Welle ───────────────────────────────────────────
UHR += H;
render();
q('[data-drang="' + a1.id + '"]').click();
pruefe('F1 «Drang» startet die Welle', ansicht === 'welle' && state.welle && state.welle.id === a1.id &&
  state.welle.start === UHR && q('#kopf h1').textContent === 'Drang');
pruefe('F2 zehn Minuten, «Gewonnen» noch nicht', q('#welleZeit').textContent === '10:00' && !q('#welleGewonnen') &&
  !!q('#welleNachgegeben'));
pruefe('F3 die Chili sitzt im Ring, genau einmal', alle('#chiliFigur').length === 1 && !!q('.welle-bild #chiliFigur'));
pruefe('F4 ein Satz zum Aussitzen', q('.welle-satz').textContent.length > 20);
pruefe('F5 die Welle ist gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).welle.id === a1.id);
var u = 2 * Math.PI * 15.5;
UHR += 5 * M;
takt();
pruefe('F6 nach fünf Minuten ist der Ring halb leer', q('#welleZeit').textContent === '5:00' &&
  Math.abs(+q('#welleFuell').getAttribute('stroke-dashoffset') - u / 2) < 0.02);
pruefe('F7 vorzeitig gewinnt man nicht', welleGewonnen() === false && state.welle !== null);
q('#zurueckKnopf').click();
var dk = q('[data-drang="' + a1.id + '"]');
pruefe('F8 zurück: die Welle läuft weiter, der Knopf trägt die Restzeit',
  ansicht === 'home' && state.welle && /Welle 5:00/.test(dk.textContent) && q('.ab-kachel.welle') !== null);
UHR += 61e3;
takt();
pruefe('F9 der Takt zählt sie herunter', /Welle 3:59/.test(dk.textContent), dk.textContent);
q('[data-drang="' + a2.id + '"]').click();
pruefe('F10 eine Welle zur Zeit', ansicht === 'welle' && state.welle.id === a1.id && /schon eine Welle/.test(meldung()));
pruefe('F11 nach einem Neuladen ist sie noch da', laden().welle && laden().welle.id === a1.id);
UHR += 4 * M;
takt();
pruefe('F12 ist sie durch, fragt sie nach dem Ausgang', !!q('#welleGewonnen') && q('#welleZeit').textContent === '0:00' &&
  q('#welle').classList.contains('durch'));
q('#welleGewonnen').click();
pruefe('F13 Gewonnen zählt und beendet die Welle', a1.draenge.length === 1 && a1.draenge[0] === UHR && state.welle === null);
pruefe('F14 die Chili flammt auf dem Dashboard', ansicht === 'home' && q('#chiliFigur').classList.contains('flammt'));
pruefe('F15 die Kachel zählt den Drang', /1 Drang besiegt/.test(q('[data-ab="' + a1.id + '"]').textContent));
q('[data-drang="' + a1.id + '"]').click();
UHR += 2 * M;
q('#welleNachgegeben').click();
pruefe('F16 Nachgegeben geht jederzeit und führt zum Rückfall', ansicht === 'rueckfall' &&
  /Zurück zur Welle/.test(q('#rfAbbrechen').textContent));
q('#rfAbbrechen').click();
pruefe('F17 von dort zurück zur Welle', ansicht === 'welle' && state.welle !== null);
q('#welleNachgegeben').click();
q('#rfEintragen').click();
pruefe('F18 eingetragen ist die Welle vorbei', state.welle === null && a1.rueckfaelle.length === 2 && ansicht === 'home');
zeige('welle');
pruefe('F19 ohne Welle führt «welle» nach Hause', ansicht === 'home');

// ── G · Bearbeiten ──────────────────────────────────────────
var startVorher = a1.start;
zeige('abgewoehnen', a1.id);
pruefe('G1 der Stand steht oben', /Frei seit/.test(q('#app').textContent) && /Dränge besiegt/.test(q('#app').textContent) &&
  !q('[data-richtung]') && q('#rhAbschnitt').hidden);
var zeilen = alle('.rf-zeile');
pruefe('G2 die Rückfälle, neuester zuerst', zeilen.length === 2 && /Büro/.test(zeilen[1].textContent) &&
  !/Büro/.test(zeilen[0].textContent));
pruefe('G3 alles ist groß genug', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
eingeben('#gwName', 'Nicht mehr rauchen');
q('#gwSpeichern').click();
pruefe('G4 Speichern läßt den Start auf die Sekunde', a1.start === startVorher && a1.name === 'Nicht mehr rauchen');
zeige('abgewoehnen', a1.id);
eingeben('#abTag', '2026-10-14');
eingeben('#abUhr', '23:00');
UHR = new Date(2026, 9, 14, 23, 30).getTime();
q('#gwSpeichern').click();
pruefe('G5 ein Start nach dem ersten Rückfall wird abgewiesen', ansicht === 'abgewoehnen' && a1.start === startVorher &&
  /ersten Rückfall/.test(meldung()));
var b = q('[data-rf-loeschen="0"]');
b.click();
pruefe('G6 Löschen fragt erst, im Glas (ADR 0041)', a1.rueckfaelle.length === 2 && q('#hinweisBlatt').classList.contains('offen') && !!hinweisFrage &&
  /Rückfall löschen/.test(q('#hinweisTitel').textContent) && b.textContent === 'Löschen');
q('#hinweisNein').click();
pruefe('G7 «Abbrechen» läßt ihn stehen', a1.rueckfaelle.length === 2 && !q('#hinweisBlatt').classList.contains('offen'));
q('[data-rf-loeschen="1"]').click();
q('#hinweisOk').click();
pruefe('G8 «Löschen» im Glas löscht', a1.rueckfaelle.length === 1 && a1.rueckfaelle[0].notiz === 'Stress im Büro' &&
  alle('.rf-zeile').length === 1);
welleBeginnen(a1.id);
zeige('abgewoehnen', a1.id);
q('#gwArchivieren').click();
pruefe('G9 Archivieren fragt erst, im Glas', !a1.archiviert && q('#hinweisBlatt').classList.contains('offen') && !!hinweisFrage && /Archivieren/.test(q('#hinweisTitel').textContent));
q('#hinweisOk').click();
pruefe('G10 archiviert: weg vom Dashboard, die Welle mit', a1.archiviert === '2026-10-14' && state.welle === null &&
  ansicht === 'home' && !q('[data-ab="' + a1.id + '"]'));
zeige('abgewoehnen', 'gibtsnicht');
pruefe('G11 Unbekanntes führt nach Hause', ansicht === 'home');

// ── H · Duzen ───────────────────────────────────────────────
welleBeginnen(a2.id);
zeige('welle');
pruefe('H1 die Welle duzt', siezt() === '', siezt());
pruefe('H2 und ist groß genug', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
zeige('rueckfall', a2.id);
pruefe('H3 der Rückfall duzt', siezt() === '', siezt());
pruefe('H4 und ist groß genug', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
zeige('abgewoehnen', a2.id);
pruefe('H5 die Detailansicht duzt', siezt() === '', siezt());
zeige('neu');
q('[data-richtung="ab"]').click();
pruefe('H6 das Formular duzt', siezt() === '', siezt());
`);
