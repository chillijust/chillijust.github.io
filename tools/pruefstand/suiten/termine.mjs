// Termine (0.4.0T): Lesen, Wiederholung, «Termine heute», der blaue Punkt im
// Kalender, die Tagesliste mit «Hinzufügen», das Formular.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr (KW 42).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('termine', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var HEUTE = '2026-10-14';
function tm(roh) {
  var t = { id: 't', titel: 'T', tag: HEUTE, von: '10:00', wiederholung: 'keine' };
  for (var k in roh) t[k] = roh[k];
  return terminLesen(t);
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
function gespeichert() { return JSON.parse(localStorage.getItem(SPEICHER)).termine; }
function siezt() { return q('#app').innerText.match(/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/g); }

// ── L · Lesen ───────────────────────────────────────────────
pruefe('L1 der Grundstand hat keine Termine', Array.isArray(grundStand().termine) && !grundStand().termine.length);
var voll = tm({ titel: '  Zahnarzt  ', bis: '10:30', ort: ' Praxis ', notiz: 'Karte', vorlauf: 30 });
pruefe('L2 ein Termin wird gelesen', voll && voll.titel === 'Zahnarzt' && voll.ort === 'Praxis' &&
  voll.bis === '10:30' && voll.vorlauf === 30 && voll.ganztags === false, JSON.stringify(voll));
pruefe('L3 ohne Titel kein Termin', tm({ titel: '   ' }) === null);
pruefe('L4 ohne gültigen Tag kein Termin', tm({ tag: '2026-02-30' }) === null && tm({ tag: 5 }) === null);
pruefe('L5 ohne Beginn nur ganztags', tm({ von: null }) === null && tm({ von: '24:00' }) === null &&
  !!tm({ von: null, ganztags: true }));
var ganz = tm({ ganztags: true, von: '10:00', bis: '11:00', vorlauf: -540 });
pruefe('L6 ganztags trägt keine Uhrzeit', ganz.von === null && ganz.bis === null && ganz.vorlauf === -540);
pruefe('L7 ein Ende vor dem Beginn fällt weg', tm({ bis: '09:00' }).bis === null && tm({ bis: '10:00' }).bis === null);
pruefe('L8 fremde Wiederholung wird einmalig', tm({ wiederholung: 'jaehrlich' }).wiederholung === 'keine');
pruefe('L9 ein Reihenende vor dem Anfang fällt weg', tm({ wiederholung: 'taeglich', wiederholungBis: '2026-10-01' })
  .wiederholungBis === null && tm({ wiederholung: 'taeglich', wiederholungBis: HEUTE }).wiederholungBis === HEUTE);
pruefe('L10 ein einmaliger Termin hat kein Reihenende', tm({ wiederholungBis: '2026-12-01' }).wiederholungBis === null);
pruefe('L11 ein Vorlauf aus der falschen Liste fällt weg', tm({ vorlauf: -540 }).vorlauf === null &&
  tm({ ganztags: true, vorlauf: 15 }).vorlauf === null && tm({ vorlauf: 7 }).vorlauf === null);
pruefe('L12 zu lange Texte werden gekürzt', tm({ titel: new Array(100).join('x') }).titel.length === TITEL_MAX &&
  tm({ ort: new Array(200).join('x') }).ort.length === ORT_MAX);
var gelesen = stand({ termine: [{ id: 'a', titel: 'A', tag: HEUTE, von: '09:00' }, { id: 'a', titel: 'B', tag: HEUTE,
  von: '09:00' }, { titel: 'ohne id', tag: HEUTE, von: '09:00' }, 'quatsch'] });
pruefe('L13 doppelte, namenlose und kaputte fallen weg', gelesen.termine.length === 1 && gelesen.termine[0].titel === 'A');
pruefe('L14 ein Stand ohne Termine bekommt eine leere Liste', Array.isArray(stand({}).termine));

// ── W · Wiederholung ────────────────────────────────────────
var einmal = tm({}), taeglich = tm({ wiederholung: 'taeglich', wiederholungBis: '2026-10-20' });
var woche = tm({ wiederholung: 'woechentlich' }), monat = tm({ tag: '2026-08-31', wiederholung: 'monatlich' });
pruefe('W1 einmal heißt nur an diesem Tag', terminAm(einmal, HEUTE) && !terminAm(einmal, '2026-10-15') &&
  !terminAm(einmal, '2026-10-13'));
pruefe('W2 täglich bis zum Reihenende', terminAm(taeglich, '2026-10-20') && !terminAm(taeglich, '2026-10-21') &&
  !terminAm(taeglich, '2026-10-13'));
pruefe('W3 wöchentlich am selben Wochentag', terminAm(woche, '2026-10-21') && terminAm(woche, '2027-01-06') &&
  !terminAm(woche, '2026-10-22'));
pruefe('W4 monatlich am selben Tag', terminAm(monat, '2026-10-31') && terminAm(monat, '2026-12-31') &&
  !terminAm(monat, '2026-10-30'));
pruefe('W5 ein Monat ohne den Tag fällt aus', !terminAm(monat, '2026-09-30') && !terminAm(monat, '2026-11-30') &&
  !terminAm(monat, '2027-02-28'));
pruefe('W6 über die Zeitumstellung hinweg', terminAm(woche, '2026-10-28') && terminAm(woche, '2027-03-31'));
state = grundStand();
state.termine = [tm({ id: 'b', titel: 'B', von: '14:00' }), tm({ id: 'g', titel: 'Ganz', ganztags: true }),
  tm({ id: 'a', titel: 'A', von: '09:00' }), tm({ id: 'c', titel: 'C', von: '09:00' })];
pruefe('W7 ganztags zuerst, dann nach Uhrzeit und Titel', termineAm(HEUTE).map(function (t) { return t.id; })
  .join() === 'g,a,c,b');
pruefe('W8 Texte für Zeit und Reihe', terminZeitText(voll) === '10:00–10:30' && terminZeitText(ganz) === 'ganztägig' &&
  wiederholungText(taeglich) === 'täglich bis Di, 20. Okt.' && wiederholungText(einmal) === '');

// ── D · Dashboard ───────────────────────────────────────────
frisch();
pruefe('D1 ohne alles die Begrüßung', !!q('#ersteGewohnheit') && !q('.tm-liste'));
state.termine = [tm({ id: 'z', titel: 'Zahnarzt', von: '09:30', bis: '10:15', ort: 'Praxis' }),
  tm({ id: 'o', titel: 'Oma', ganztags: true }), tm({ id: 'm', titel: 'Morgen', tag: '2026-10-15' })];
zeige('home');
pruefe('D2 ein Termin allein reicht fürs Dashboard', !q('#ersteGewohnheit') && !!q('.held #kalRaster'));
var abschnitte = alle('#ansicht h2').map(function (h) { return h.textContent; });
pruefe('D3 «Termine heute» steht unter der Karte', abschnitte[0] === 'Termine heute' &&
  q('.held').nextElementSibling.querySelector('.tm-liste') !== null, abschnitte.join());
var zeilen = alle('#ansicht > .abschnitt [data-termin]').map(function (z) { return z.getAttribute('data-termin'); });
pruefe('D4 nur heute, ganztags zuerst', zeilen.join() === 'o,z', zeilen.join());
pruefe('D5 die Zeile sagt Zeit, Titel und Ort', /09:30/.test(q('[data-termin="z"]').textContent) &&
  /10:15/.test(q('[data-termin="z"]').textContent) && /Praxis/.test(q('[data-termin="z"]').textContent));
pruefe('D6 der Strich ist blau', getComputedStyle(q('[data-termin="z"] .tm-zeit')).borderLeftColor ===
  getComputedStyle(q('.kp.termin')).backgroundColor);
pruefe('D7 Trefferflächen', zuKlein().length === 0, zuKlein().join(', '));
q('#ansicht > .abschnitt [data-termin="z"]').click();
pruefe('D8 Antippen hakt ab wie eine Kachel und öffnet nicht (ADR 0042)', ansicht === 'home' &&
  terminNach('z').erledigt.join() === HEUTE);
q('#ansicht > .abschnitt [data-termin="z"]').click();
pruefe('D8a noch ein Tipp nimmt es zurück', ansicht === 'home' && !terminNach('z').erledigt.length);
zeige('termin', 'z');
pruefe('D8b geöffnet zeigt er sich', ansicht === 'termin' && q('#tmTitel').value === 'Zahnarzt' &&
  q('#kopf h1').textContent === 'Termin');
q('#zurueckKnopf').click();
state.termine = [tm({ id: 'm', titel: 'Morgen', tag: '2026-10-15' })];
zeige('home');
pruefe('D9 ohne Termin heute kein Abschnitt', !alle('#ansicht h2').some(function (h) {
  return h.textContent === 'Termine heute';
}));
zeige('termin', 'gibtsnicht');
pruefe('D10 ein unbekannter Termin landet zu Hause', ansicht === 'home');

// ── K · Kalender ────────────────────────────────────────────
frisch();
kalVersatz = 0;
kalTag = null;
state.gewohnheiten = [gewohnheitLesen({ id: 'g', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01',
  erledigt: ['2026-10-13'] })];
state.termine = [tm({ id: 'w', titel: 'Laufen', tag: '2026-10-07', von: '18:00', wiederholung: 'woechentlich' }),
  tm({ id: 'x', titel: 'Kino', tag: '2026-10-16', von: '20:00' }), tm({ id: 'y', titel: 'Essen', tag: '2026-10-16',
  von: '19:00' })];
zeige('home');
function punkte(k) {
  return alle('[data-kaltag="' + k + '"] .kp').map(function (p) { return p.className.replace('kp ', ''); }).join();
}
pruefe('K1 ein blauer Punkt vorn, wenn Termine da sind', punkte(HEUTE) === 'termin,offen' &&
  punkte('2026-10-16') === 'termin,kommt' && punkte('2026-10-13') === 'erledigt', punkte(HEUTE));
pruefe('K2 einer je Tag, nicht je Termin', alle('[data-kaltag="2026-10-16"] .kp.termin').length === 1);
pruefe('K3 die Ansage zählt die Termine', /2 Termine/.test(q('[data-kaltag="2026-10-16"]').getAttribute('aria-label')) &&
  /1 Termin,/.test(q('[data-kaltag="2026-10-14"]').getAttribute('aria-label')));
q('[data-kaltag="2026-10-16"]').click();
pruefe('K4 der Tag zeigt seine Termine, nach Uhrzeit', alle('#kalLeiste [data-termin]').map(function (z) {
  return z.getAttribute('data-termin');
}).join() === 'y,x');
pruefe('K5 und darunter die Gewohnheiten, die kommen', alle('#kalLeiste .kal-zeile.kommt').length > 0);
pruefe('K6 und «Hinzufügen» für diesen Tag', !!q('#kalNeu') && q('#kalNeu').getAttribute('data-tag') === '2026-10-16');
pruefe('K7 Trefferflächen mit offener Leiste', zuKlein().length === 0, zuKlein().join(', '));
q('#kalLeiste [data-termin="x"]').click();
pruefe('K8 ein Termin in der Leiste öffnet ihn', ansicht === 'termin' && q('#tmTitel').value === 'Kino');
zeige('home');
q('#kalNeu').click();
q('#hinweisWahl [data-neutermin="2026-10-16"]').click();
pruefe('K9 «Hinzufügen» · Termin legt ihn dort an', ansicht === 'terminNeu' && q('#tmTag').value === '2026-10-16' &&
  q('#kopf h1').textContent === 'Neuer Termin');
state.gewohnheiten = [];
kalTag = HEUTE;
zeige('home');
pruefe('K10 ohne Gewohnheit kein Wort darüber', !q('#kalLeiste .kal-zeile') && !q('#kalLeiste .kal-voraus') &&
  !/Gewohnheit/.test(q('#kalLeiste').textContent));

// ── F · Das Formular ────────────────────────────────────────
frisch();
kalVersatz = 0;
kalTag = null;
menueOeffnen();
q('[data-menue="termin"]').click();
pruefe('F1 «Neuer Termin» im Menü öffnet das Formular', ansicht === 'terminNeu' && !!q('#tmTitel'));
pruefe('F2 er beginnt heute zur nächsten vollen Stunde', q('#tmTag').value === HEUTE && q('#tmVon').value === '09:00' &&
  q('#tmBis').value === '' && q('#tmVorlauf').value === '15');
pruefe('F3 Trefferflächen', zuKlein().length === 0, zuKlein().join(', '));
pruefe('F4 das Formular duzt', !siezt(), siezt() && siezt().join(' | '));
q('#tmSpeichern').click();
pruefe('F5 ohne Titel kein Termin', ansicht === 'terminNeu' && !state.termine.length && /Titel/.test(q('#meldung').textContent));
var feld = q('#tmTitel');
tippe('tmTitel', 'Laufen');
q('[data-wdh="woechentlich"]').click();
pruefe('F6 die Wahl zeichnet nicht neu', q('#tmTitel') === feld && feld.value === 'Laufen');
pruefe('F7 eine Reihe zeigt ihr Ende und den Wochentag', !q('#tmEndeTeil').hidden &&
  q('#tmWdhText').textContent === 'Jeden Mittwoch.');
q('[data-wdh="keine"]').click();
pruefe('F8 einmal braucht kein Ende', q('#tmEndeTeil').hidden && q('#tmWdhText').textContent === 'Nur an diesem Tag.');
q('#tmGanz').click();
var wahl = alle('#tmVorlauf option').map(function (o) { return o.value; }).join();
pruefe('F9 ganztags blendet die Uhrzeit aus', q('#tmZeiten').hidden && q('#tmGanz').getAttribute('aria-checked') === 'true' &&
  getComputedStyle(q('#tmZeiten')).display === 'none');
pruefe('F10 und wechselt die Erinnerung', wahl === ',' + VORLAUF_GANZ.join() && q('#tmVorlauf').value === '-540', wahl);
q('#tmGanz').click();
pruefe('F11 zurück zur Uhrzeit', !q('#tmZeiten').hidden && q('#tmVorlauf').value === '15');
tippe('tmVon', '18:00');
tippe('tmBis', '17:00');
q('#tmSpeichern').click();
pruefe('F12 ein Ende vor dem Beginn hält an', !state.termine.length && /Ende/.test(q('#meldung').textContent));
tippe('tmBis', '19:00');
tippe('tmTag', '2026-11-04');
q('[data-wdh="monatlich"]').click();
pruefe('F13 der Monat nennt den Tag', q('#tmWdhText').textContent === 'Jeden Monat am 4.');
tippe('tmWdhBis', '2026-10-01');
q('#tmSpeichern').click();
pruefe('F14 eine Reihe, die vor sich endet, hält an', !state.termine.length && /Reihe/.test(q('#meldung').textContent));
tippe('tmWdhBis', '');
q('[data-wdh="woechentlich"]').click();
tippe('tmOrt', 'Park');
q('#tmVorlauf').value = '60';
q('#tmVorlauf').dispatchEvent(new Event('change', { bubbles: true }));
q('#tmSpeichern').click();
var neu = state.termine[0];
pruefe('F15 angelegt', state.termine.length === 1 && neu.titel === 'Laufen' && neu.tag === '2026-11-04' &&
  neu.von === '18:00' && neu.bis === '19:00' && neu.wiederholung === 'woechentlich' && neu.wiederholungBis === null &&
  neu.vorlauf === 60 && neu.ort === 'Park' && /^t/.test(neu.id), JSON.stringify(neu));
pruefe('F16 und gespeichert', gespeichert().length === 1 && gespeichert()[0].id === neu.id);
pruefe('F17 die Bestätigung nennt den Tag', q('#hinweisKarte').classList.contains('bestaetigung') &&
  q('#hinweisTitel').textContent === 'Angelegt' && q('#hinweisText').textContent === 'Für Mi, 4. Nov.',
  q('#hinweisTitel').textContent + ' | ' + q('#hinweisText').textContent);
hinweisSchliessen();
pruefe('F18 der Kalender springt zum Tag', ansicht === 'home' && kalTag === '2026-11-04' && kalVersatz === 3 &&
  !!q('#kalLeiste [data-termin="' + neu.id + '"]'));
pruefe('F19 auch im Monat', (function () {
  state.kalender = 'monat'; kalZeige('2026-11-04'); var m = kalVersatz;
  kalZeige('2026-09-30'); var z = kalVersatz;
  state.kalender = 'woche'; kalZeige('2026-10-05'); return m === 1 && z === -1 && kalVersatz === -1;
})());

// Bearbeiten und Löschen
zeige('termin', neu.id);
pruefe('F20 bearbeiten zeigt, was gespeichert ist', q('#tmTitel').value === 'Laufen' && q('#tmBis').value === '19:00' &&
  q('[data-wdh="woechentlich"]').getAttribute('aria-pressed') === 'true' && !q('#tmEndeTeil').hidden &&
  q('#tmVorlauf').value === '60' && q('#tmOrt').value === 'Park' && q('#tmSpeichern').textContent === 'Speichern');
tippe('tmTitel', 'Laufen im Park');
tippe('tmBis', '');
q('#tmSpeichern').click();
pruefe('F21 gespeichert unter derselben id', state.termine.length === 1 && state.termine[0].id === neu.id &&
  state.termine[0].titel === 'Laufen im Park' && state.termine[0].bis === null && q('#hinweisTitel').textContent === 'Gespeichert');
hinweisSchliessen();
zeige('termin', neu.id);
q('#tmLoeschen').click();
pruefe('F22 er fragt im Glas nach der ganzen Reihe (ADR 0041)', state.termine.length === 1 &&
  q('#hinweisBlatt').classList.contains('offen') && q('#hinweisTitel').textContent === 'Ganze Reihe löschen?' &&
  !!q('body > .tropfen-huelle.glas'));
q('#hinweisOk').click();
pruefe('F23 «Löschen» im Glas löscht', !state.termine.length && !gespeichert().length && ansicht === 'home');
state.termine = [tm({ id: 'e' })];
zeige('termin', 'e');
q('#tmLoeschen').click();
pruefe('F24 ein einzelner fragt schlicht', q('#hinweisTitel').textContent === 'Löschen?' && !!hinweisFrage);
pruefe('F24a mit «Löschen» und «Nein» (ADR 0042)', q('#hinweisOk').textContent === 'Löschen' && q('#hinweisNein').textContent === 'Nein');
q('#hinweisNein').click();
zeige('home');
pruefe('F25 Zurück ohne Speichern ändert nichts', state.termine.length === 1);

// ── H · Abhaken (ADR 0041) ──────────────────────────────────
frisch();
kalVersatz = 0;
kalTag = null;
state.termine = [tm({ id: 'arzt', titel: 'Arzt' }), tm({ id: 'lauf', titel: 'Lauf', wiederholung: 'taeglich', tag: '2026-10-10' })];
zeige('home');
ausbewegt();
var hk = q('#app .tm-liste [data-terminhaken="arzt"]');
pruefe('H1 «Termine heute»: jede Zeile ist selbst ihr Haken, groß genug (ADR 0042)', !!hk && alle('#app [data-terminhaken]').every(function (b) {
  var r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && b.matches('[data-termin]') &&
    !!b.querySelector('.tm-haken .kal-haken') && /tippen hakt ab, lange drücken öffnet/.test(b.getAttribute('aria-label')); }) &&
  hk.getAttribute('aria-pressed') === 'false' && alle('#app .tm-reihe button').length === alle('#app .tm-reihe').length);
hk.click();
var reihe = q('#app [data-terminhaken="arzt"]').closest('.tm-reihe');
pruefe('H2 ein Tipp hakt ab — gespeichert, grün, blaß, durchgestrichen', state.termine[0].erledigt.join() === HEUTE &&
  gespeichert()[0].erledigt.join() === HEUTE && reihe.classList.contains('erledigt') &&
  getComputedStyle(reihe.querySelector('.tm-titel')).textDecorationLine === 'line-through' &&
  getComputedStyle(reihe.querySelector('.kal-haken')).backgroundColor === getComputedStyle(q('.kal-haken')).backgroundColor &&
  q('#app [data-terminhaken="arzt"]').getAttribute('aria-pressed') === 'true');
pruefe('H3 der Haken öffnet den Termin nicht', ansicht === 'home');
pruefe('H3a der Haken tritt nicht mit zurück, nur Zeit und Text', getComputedStyle(reihe.querySelector('.tm-haken')).opacity === '1' &&
  getComputedStyle(reihe.querySelector('.tm-text')).opacity === '0.55');
q('#app [data-terminhaken="lauf"]').click();
pruefe('H4 eine Reihe hakt nur den Tag ab', state.termine[1].erledigt.join() === HEUTE);
kalTag = '2026-10-13';
zeige('home');
ausbewegt();
pruefe('H5 gestern ist die Reihe noch offen, abhakbar', q('#kalLeiste [data-terminhaken="lauf"]').getAttribute('aria-pressed') === 'false');
kalTag = '2026-10-15';
zeige('home');
pruefe('H6 ein kommender Tag hat keinen Haken', !!q('#kalLeiste [data-termin="lauf"]') && !q('#kalLeiste [data-terminhaken]'));
q('#kalLeiste [data-termin="lauf"]').click();
pruefe('H6a dort öffnet schon das Antippen', ansicht === 'termin' && q('#tmTitel').value === 'Lauf');
zeige('home');
terminAbhaken('lauf', '2026-10-15');
pruefe('H7 auch nicht über die Funktion', state.termine[1].erledigt.join() === HEUTE);
kalTag = null;
zeige('home');
q('#app [data-terminhaken="arzt"]').click();
pruefe('H8 noch ein Tipp nimmt ihn zurück', !state.termine[0].erledigt.length && !gespeichert()[0].erledigt.length);
var roh = stand({ termine: [{ id: 'x', titel: 'X', tag: HEUTE, von: '09:00', erledigt: [HEUTE, HEUTE, 'quatsch', 7] }] });
pruefe('H9 gelesen bleibt nur ein gültiger Tag, einmal', roh.termine[0].erledigt.join() === HEUTE &&
  terminLesen({ id: 'y', titel: 'Y', tag: HEUTE, von: '09:00' }).erledigt.length === 0);
zeige('termin', 'lauf');
tippe('tmTitel', 'Laufen');
q('#tmSpeichern').click();
pruefe('H10 Bearbeiten behält den Haken', state.termine[1].titel === 'Laufen' && state.termine[1].erledigt.join() === HEUTE);
zeige('home');

// ── M · Menü ────────────────────────────────────────────────
menueOeffnen();
pruefe('M1 «Neuer Termin» trägt kein «bald» mehr', !q('[data-menue="termin"] .bald') &&
  !q('[data-menue="termin"]').hasAttribute('aria-disabled'));
menueSchliessen();
frisch();
speichern();
`);
