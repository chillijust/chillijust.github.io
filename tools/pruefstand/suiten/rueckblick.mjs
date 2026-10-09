// Rückblick (0.6.0T2): die Heatmap in der Gewohnheit und im Abgewöhnen —
// 26 Wochen, Spalten Mo–So, getönt nach dem Zustand des Tages. Ein Tipp ins
// Raster wählt die Woche, ihre Tage stehen darunter groß; ein Tag nennt sich
// in der Zeile, geändert wird nichts (ADR 0015).
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026 (KW 42, 12.–18.).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('rueckblick', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };
var HEUTE = '2026-10-14';
function vor(n) { return tagPlus(HEUTE, -n); }
function gw(id, rhythmus, angelegt, erledigt) {
  return gewohnheitLesen({ id: id, name: id, rhythmus: rhythmus, angelegt: angelegt, erledigt: erledigt || [] });
}
function zelle(k) { return q('#hmRaster [data-hm-tag="' + k + '"]'); }
function wie(k) { var z = zelle(k); return z ? z.getAttribute('data-hm') : 'fehlt'; }
function aufbauen() {
  frisch();
  // Mo–Fr; heute Mi offen, Di erledigt, Mo verpaßt, So nicht dran, Sa trotzdem erledigt.
  state.gewohnheiten = [
    gw('A', { art: 'wochentage', tage: [1, 2, 3, 4, 5] }, vor(30), [vor(1), vor(4), vor(8), vor(9)]),
    gw('W', { art: 'proWoche', anzahl: 3 }, vor(30), [vor(1)])
  ];
  state.abgewoehnen = [lasterLesen({ id: 'L', name: 'Rauchen', start: new Date(2026, 8, 1, 9).getTime(),
    rueckfaelle: [{ zeit: new Date(2026, 8, 20, 22).getTime(), notiz: '' },
      { zeit: new Date(2026, 8, 20, 23).getTime(), notiz: '' }] })];
  zeige('bearbeiten', 'A');
}

// ── R · Raster ──────────────────────────────────────────────
aufbauen();
var ERSTER = tagPlus(wochenAnfang(HEUTE), -7 * (HM_WOCHEN - 1));
pruefe('R1 die Gewohnheit trägt den Rückblick über dem Stand', !!q('#hmRaster') &&
  alle('.abschnitt h2')[0].textContent === 'Rückblick' && alle('.abschnitt h2')[1].textContent === 'Stand');
pruefe('R2 sechs Monate, Woche für Woche', alle('#hmRaster [data-hm-tag]').length === HM_WOCHEN * 7 &&
  alle('#hmRaster .hm-monat').length === HM_WOCHEN && ausSchluessel(ERSTER).getDay() === 1 &&
  !!zelle(ERSTER) && !!zelle(tagPlus(wochenAnfang(HEUTE), 6)) && !zelle(tagPlus(ERSTER, -1)));
pruefe('R3 Spalten sind Wochen: Montag oben, die laufende rechts',
  alle('#hmRaster [data-hm-tag]')[7].getAttribute('data-hm-tag') === tagPlus(ERSTER, 7) &&
  alle('#hmRaster [data-hm-tag]').pop().getAttribute('data-hm-tag') === '2026-10-18');
pruefe('R4 erledigt, verpaßt, nicht dran', wie(vor(1)) === 'erledigt' && wie(vor(2)) === 'verpasst' &&
  wie(vor(3)) === 'frei' && wie(vor(4)) === 'erledigt',
  [vor(1), vor(2), vor(3), vor(4)].map(wie).join());
pruefe('R5 heute offen ist kein Aussetzer, morgen ist Zukunft', wie(HEUTE) === 'offen' &&
  zelle(HEUTE).classList.contains('heute') && wie(tagPlus(HEUTE, 1)) === 'zukunft' &&
  getComputedStyle(zelle(tagPlus(HEUTE, 1))).visibility === 'hidden');
pruefe('R6 vor dem Anlegen ist «vorher»', wie(vor(31)) === 'vorher' && wie(vor(30)) !== 'vorher');
var monate = alle('#hmRaster .hm-monat').map(function (m) { return m.textContent; });
var okt = Math.round((ausSchluessel(wochenAnfang('2026-10-01')) - ausSchluessel(ERSTER)) / 864e5 / 7);
pruefe('R7 ein Monat steht über der Woche seines Ersten', monate[okt] === 'Okt.' &&
  monate.filter(function (m) { return m; }).length >= 6, monate.join('|'));
var faellig = 0, erl = 0;
for (var k = vor(30); k < HEUTE; k = tagPlus(k, 1)) {
  if (!faelligAm(state.gewohnheiten[0], k)) continue;
  faellig++;
  if (state.gewohnheiten[0].erledigt.indexOf(k) !== -1) erl++;
}
pruefe('R8 die Zeile zählt nur fällige Tage', q('#hmZeile').textContent === erl + ' von ' + faellig + ' fälligen Tagen erledigt.',
  q('#hmZeile').textContent + ' / ' + erl + ' von ' + faellig);
var raster = q('#hmRaster').getBoundingClientRect(), kachel = q('.kachel.hm').getBoundingClientRect();
pruefe('R9 das Raster paßt in die Kachel', raster.right <= kachel.right && raster.left >= kachel.left,
  raster.right + ' > ' + kachel.right);

// ── T · Woche und Tag ───────────────────────────────────────
var vorhin = JSON.stringify(state);
function titel() { return q('#hmTitel').textContent; }
function tagKnopf(k) { return q('#hmWoche [data-hm-wahl="' + k + '"]'); }
function spalteMitte(w) {
  var r = q('#hmRaster [data-hm-mo="' + w + '"]').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, breite: r.width };
}
function rasterTipp(x, y) {
  q('#hmRaster').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
}
ausbewegt();
pruefe('T1 die laufende Woche steht offen', titel() === 'KW 42 · 12.–18. Oktober' &&
  alle('#hmWoche [data-hm-wahl]').length === 7 && tagKnopf(HEUTE).classList.contains('heute') &&
  tagKnopf(tagPlus(HEUTE, 1)).disabled && !tagKnopf(HEUTE).disabled, titel());
pruefe('T2 jeder Tag ist groß genug für den Finger', alle('#hmWoche button').every(function (b) {
  var r = b.getBoundingClientRect();
  return r.width >= 44 && r.height >= 44;
}), alle('#hmWoche button').map(function (b) { var r = b.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }).join());
var rahmen = q('#hmRahmen').getBoundingClientRect(), montag = zelle(wochenAnfang(HEUTE)).getBoundingClientRect();
pruefe('T3 der Rahmen steht um die laufende Woche', Math.abs(rahmen.left - (montag.left - 2)) < 1.5 &&
  rahmen.width > montag.width && rahmen.height > montag.height * 7, rahmen.left + ' / ' + montag.left);
tagKnopf(vor(2)).click();
pruefe('T4 ein Tag nennt sich in der Zeile', q('#hmZeile').textContent === 'Mo, 12. Okt. · verpasst' &&
  tagKnopf(vor(2)).getAttribute('aria-pressed') === 'true' && zelle(vor(2)).classList.contains('gewaehlt'),
  q('#hmZeile').textContent);
tagKnopf(vor(2)).click();
pruefe('T5 nochmal getippt, und es steht wieder die Summe', /fälligen Tagen erledigt\.$/.test(q('#hmZeile').textContent) &&
  !q('#hmRaster .gewaehlt') && !q('#hmWoche .gewaehlt'), q('#hmZeile').textContent);
tagKnopf(HEUTE).click();
pruefe('T6 heute heißt «Heute»', q('#hmZeile').textContent === 'Heute, 14. Okt. · offen', q('#hmZeile').textContent);
var name = q('#gwName');
name.value = 'Lesen am Abend';
q('#hmWoche [data-hm-schritt="-1"]').click();
pruefe('T7 ‹ blättert zurück, der Wochentag wandert mit', titel() === 'KW 41 · 5.–11. Oktober' &&
  q('#hmZeile').textContent === 'Mi, 7. Okt. · verpasst' && tagKnopf(vor(7)).classList.contains('gewaehlt') &&
  alle('#hmRaster .gewaehlt').length === 1, titel() + ' / ' + q('#hmZeile').textContent);
pruefe('T8 das Formular bleibt stehen', q('#gwName') === name && name.value === 'Lesen am Abend');
q('#hmWoche [data-hm-schritt="1"]').click();
pruefe('T9 › zurück zur laufenden, dann ist Schluß', titel() === 'KW 42 · 12.–18. Oktober' &&
  q('#hmWoche [data-hm-schritt="1"]').disabled && !q('#hmWoche [data-hm-schritt="-1"]').disabled);
var m = spalteMitte(10);
rasterTipp(m.x, m.y);
pruefe('T10 ein Tipp ins Raster wählt die Woche', hm.woche === 10 &&
  titel().indexOf('KW ' + kalenderwoche(tagPlus(ERSTER, 70))) === 0, titel());
m = spalteMitte(3);
rasterTipp(m.x + m.breite * 0.45, q('#hmRaster').getBoundingClientRect().top + 2);
pruefe('T11 auch knapp daneben, auch über der Monatszeile', hm.woche === 3, hm.woche);
pruefe('T12 vor dem Anlegen heißt es so', (tagKnopf(tagPlus(ERSTER, 21)).click(), q('#hmZeile').textContent) ===
  WT_KURZ[1] + ', ' + ausSchluessel(tagPlus(ERSTER, 21)).getDate() + '. ' + MON_KURZ[ausSchluessel(tagPlus(ERSTER, 21)).getMonth()] +
  ' · noch nicht angelegt', q('#hmZeile').textContent);
rasterTipp(spalteMitte(0).x - 40, spalteMitte(0).y);
pruefe('T13 ganz vorn ist ‹ aus', hm.woche === 0 && q('#hmWoche [data-hm-schritt="-1"]').disabled);
name.value = 'A';
pruefe('T14 geändert wird hier nichts', JSON.stringify(state) === vorhin);
pruefe('T15 das Raster läßt das Blättern in Ruhe', getComputedStyle(q('#hmRaster')).touchAction === 'auto');
zeige('home');
zeige('bearbeiten', 'A');
pruefe('T16 wer wiederkommt, beginnt bei der laufenden Woche', titel() === 'KW 42 · 12.–18. Oktober' &&
  q('#hmZeile').textContent.indexOf('fälligen') !== -1);

// ── W · x-mal pro Woche ─────────────────────────────────────
zeige('home');
zeige('bearbeiten', 'W');
pruefe('W1 pro Woche verpaßt keinen Tag', wie(vor(1)) === 'erledigt' && wie(vor(2)) === 'frei' &&
  !q('#hmRaster [data-hm="verpasst"]'));
pruefe('W2 die Zeile zählt die Haken', q('#hmZeile').textContent === '1-mal erledigt.', q('#hmZeile').textContent);

// ── L · Abgewöhnen ──────────────────────────────────────────
zeige('home');
zeige('abgewoehnen', 'L');
pruefe('L1 Abgewöhnen trägt den Rückblick über dem Stand', !!q('#hmRaster') &&
  alle('.abschnitt h2')[0].textContent === 'Rückblick' && alle('.abschnitt h2')[1].textContent === 'Stand');
pruefe('L2 frei, Rückfall, vor dem Start', wie('2026-09-19') === 'sauber' && wie('2026-09-20') === 'rueckfall' &&
  wie('2026-08-31') === 'start' && wie('2026-09-01') === 'sauber' && wie(HEUTE) === 'sauber',
  ['2026-09-19', '2026-09-20', '2026-08-31', '2026-09-01', HEUTE].map(wie).join());
pruefe('L3 zwei Rückfälle an einem Tag sind ein Tag', q('#hmZeile').textContent === '43 Tage frei, 1 mit Rückfall.',
  q('#hmZeile').textContent);
q('#hmRaster').dispatchEvent(new MouseEvent('click', { bubbles: true,
  clientX: zelle('2026-09-14').getBoundingClientRect().left + 3, clientY: zelle('2026-09-14').getBoundingClientRect().top + 3 }));
q('#hmWoche [data-hm-wahl="2026-09-20"]').click();
pruefe('L4 Woche gewählt, Tag getippt: der Rückfall', q('#hmZeile').textContent === 'So, 20. Sep. · Rückfall', q('#hmZeile').textContent);
`);
