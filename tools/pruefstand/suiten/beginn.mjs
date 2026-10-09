// Eine Gewohnheit, die schon früher begann (0.11.0T, ADR 0033): Im Formular
// läßt sich der Beginn zurückstellen; jeder fällige Tag seitdem zählt als
// erledigt, bei x-mal pro Woche x Tage je Woche. Heute bleibt offen, der
// Beginn rückt nie vor.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('beginn', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
var HEUTE = '2026-10-14';
function tippen(el, text) { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); }
function anlegen(name, art, beginn) {
  zeige('neu');
  ausbewegt();
  tippen(q('#gwName'), name);
  if (art) q('[data-art="' + art + '"]').click();
  if (beginn) tippen(q('#gwBeginn'), beginn);
  q('#gwSpeichern').click();
  return state.gewohnheiten[state.gewohnheiten.length - 1];
}

// ── B · Formular ────────────────────────────────────────────
frisch();
zeige('neu');
ausbewegt();
var feld = q('#gwBeginn');
pruefe('B1 «Begonnen am» steht im Formular, heute vorgewählt, nicht in der Zukunft', !!feld && feld.type === 'date' &&
  feld.value === HEUTE && feld.max === HEUTE);
pruefe('B2 das Feld ist groß genug zum Tippen und zoomt nicht', feld.getBoundingClientRect().height >= 44 &&
  parseFloat(getComputedStyle(feld).fontSize) >= 16);
q('[data-richtung="ab"]').click();
pruefe('B3 beim Abgewöhnen weicht es — dort gilt «Frei seit»', q('#gwBeginnAbschnitt').hidden && !q('#abStart').hidden);
q('[data-richtung="an"]').click();
pruefe('B4 und kommt zurück', !q('#gwBeginnAbschnitt').hidden);

// ── T · Täglich ─────────────────────────────────────────────
frisch();
var g = anlegen('Lesen', null, '2026-10-01');
pruefe('T1 der Beginn ist der gewählte Tag', g.angelegt === '2026-10-01', g.angelegt);
pruefe('T2 jeder Tag bis gestern ist erledigt, heute offen', g.erledigt.length === 13 && g.erledigt[0] === '2026-10-01' &&
  g.erledigt[12] === '2026-10-13' && g.erledigt.indexOf(HEUTE) === -1, g.erledigt.join());
var a = auswerten(g, HEUTE), leer = auswerten(gewohnheitLesen({ id: 'x', name: 'x', rhythmus: { art: 'taeglich' },
  angelegt: HEUTE, erledigt: [] }), HEUTE);
pruefe('T3 Stärke und Serie zählen die Tage mit', a.serie === 13 && a.staerke > leer.staerke + 0.3, a.serie + ' ' + a.staerke);
pruefe('T4 gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten[0].angelegt === '2026-10-01');

// ── W · Wochentage ──────────────────────────────────────────
frisch();
zeige('neu');
ausbewegt();
tippen(q('#gwName'), 'Laufen');
q('[data-art="wochentage"]').click();
// Mo–Fr ist vorgewählt; Di und Do abwählen: Mo, Mi, Fr bleiben.
q('#rhTage [data-tag="2"]').click();
q('#rhTage [data-tag="4"]').click();
tippen(q('#gwBeginn'), '2026-10-05');
q('#gwSpeichern').click();
g = state.gewohnheiten[0];
pruefe('W1 nur die fälligen Wochentage', g.erledigt.join() === '2026-10-05,2026-10-07,2026-10-09,2026-10-12', g.erledigt.join());

// ── P · x-mal pro Woche ─────────────────────────────────────
frisch();
zeige('neu');
ausbewegt();
tippen(q('#gwName'), 'Schwimmen');
q('[data-art="proWoche"]').click();
tippen(q('#gwBeginn'), '2026-09-30');
q('#gwSpeichern').click();
g = state.gewohnheiten[0];
var jeWoche = {};
g.erledigt.forEach(function (k) { var m = wochenAnfang(k); jeWoche[m] = (jeWoche[m] || 0) + 1; });
pruefe('P1 drei je Woche; die erste (Mi–So) hat Platz für drei, die laufende bis gestern für zwei',
  jeWoche['2026-09-28'] === 3 && jeWoche['2026-10-05'] === 3 && jeWoche['2026-10-12'] === 2 &&
  g.erledigt[0] >= '2026-09-30' && g.erledigt[g.erledigt.length - 1] < HEUTE, JSON.stringify(jeWoche));
pruefe('P2 verteilt, nicht gehäuft: Di, Do, Sa', g.erledigt.filter(function (k) { return wochenAnfang(k) === '2026-10-05'; }).join() ===
  '2026-10-06,2026-10-08,2026-10-10', g.erledigt.join());

// ── K · aus dem Kalender ────────────────────────────────────
frisch();
zeige('neu', { richtung: 'an', tag: '2026-10-08' });
ausbewegt();
pruefe('K1 von einem vergangenen Tag aus beginnt sie an diesem Tag', q('#gwBeginn').value === '2026-10-08');
zeige('neu', { richtung: 'an', tag: '2026-10-20' });
ausbewegt();
pruefe('K2 von einem kommenden Tag aus heute', q('#gwBeginn').value === HEUTE);

// ── E · Bearbeiten ──────────────────────────────────────────
frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'E', name: 'Dehnen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-10',
  erledigt: ['2026-10-10', '2026-10-12'] })];
zeige('bearbeiten', 'E');
ausbewegt();
pruefe('E1 die Gewohnheit zeigt ihren Beginn, später geht nicht', q('#gwBeginn').value === '2026-10-10' &&
  q('#gwBeginn').max === '2026-10-10');
tippen(q('#gwBeginn'), '2026-10-07');
q('#gwSpeichern').click();
g = gewohnheitNach('E');
pruefe('E2 früher: die Tage davor kommen dazu, Offenes danach bleibt offen', g.angelegt === '2026-10-07' &&
  g.erledigt.join() === '2026-10-07,2026-10-08,2026-10-09,2026-10-10,2026-10-12', g.erledigt.join());
zeige('bearbeiten', 'E');
ausbewegt();
tippen(q('#gwBeginn'), '2026-10-11');
q('#gwSpeichern').click();
pruefe('E3 später geht nicht: nichts ändert sich, ein Hinweis sagt es', gewohnheitNach('E').angelegt === '2026-10-07' &&
  ansicht === 'bearbeiten' && /früher/.test(q('#hinweisTitel').textContent), q('#hinweisTitel').textContent);
hinweisSchliessen();
tippen(q('#gwBeginn'), '');
q('#gwSpeichern').click();
pruefe('E4 ein leeres Feld speichert nicht', gewohnheitNach('E').angelegt === '2026-10-07' && ansicht === 'bearbeiten');
hinweisSchliessen();
frisch();
speichern();
`);
