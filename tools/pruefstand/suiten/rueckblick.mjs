// Rückblick (0.6.0T): die Heatmap in der Gewohnheit und im Abgewöhnen —
// 26 Wochen, Spalten Mo–So, getönt nach dem Zustand des Tages; Antippen oder
// darüber streichen nennt den Tag, ändert aber nichts (ADR 0015).
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

// ── T · Antippen ────────────────────────────────────────────
var vorhin = JSON.stringify(state);
zelle(vor(2)).click();
pruefe('T1 Antippen nennt den Tag', q('#hmZeile').textContent === 'Mo, 12. Okt. · verpasst' &&
  zelle(vor(2)).classList.contains('gewaehlt'), q('#hmZeile').textContent);
zelle(HEUTE).click();
pruefe('T2 heute heißt «Heute», die alte Wahl geht', q('#hmZeile').textContent === 'Heute, 14. Okt. · offen' &&
  alle('#hmRaster .gewaehlt').length === 1, q('#hmZeile').textContent);
zelle(tagPlus(HEUTE, 2)).click();
pruefe('T3 die Zukunft läßt sich nicht wählen', q('#hmZeile').textContent === 'Heute, 14. Okt. · offen');
zelle(vor(3)).click();
pruefe('T4 nicht dran heißt so', q('#hmZeile').textContent === 'So, 11. Okt. · nicht dran', q('#hmZeile').textContent);
pruefe('T5 geändert wird hier nichts', JSON.stringify(state) === vorhin);
ausbewegt();
var von = zelle(vor(9)).getBoundingClientRect(), nach = zelle(vor(1)).getBoundingClientRect();
function zeiger(art, r) {
  var ziel = art === 'pointerdown' ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : q('#hmRaster');
  ziel.dispatchEvent(new PointerEvent(art, { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
    pointerType: 'touch' }));
}
zeiger('pointerdown', von);
var erst = q('#hmZeile').textContent;
zeiger('pointermove', nach);
var dann = q('#hmZeile').textContent;
zeiger('pointerup', nach);
zeiger('pointermove', von);
pruefe('T6 der Finger streicht über das Raster', erst === 'Mo, 5. Okt. · erledigt' &&
  dann === 'Di, 13. Okt. · erledigt' && q('#hmZeile').textContent === dann, erst + ' / ' + dann);
pruefe('T7 senkrecht gehört die Geste dem Blättern', getComputedStyle(q('#hmRaster')).touchAction === 'pan-y');

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
zelle('2026-09-20').click();
pruefe('L4 Antippen nennt den Rückfall', q('#hmZeile').textContent === 'So, 20. Sep. · Rückfall', q('#hmZeile').textContent);
`);
