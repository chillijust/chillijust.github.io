// Auswertungen werden gemerkt (P2, Nachricht 15): Die Rechnung läuft je
// Gewohnheit vom Anlegen bis heute; ein Haken fragte sie über tagVoll,
// umschaltenUndZeichnen und das Zeichnen mehrfach. Gezählt werden
// Rechenschritte (auswertungenGerechnet), keine Millisekunden — das bleibt im
// virtuellen Takt des Prüfstands aussagekräftig. Drei Jahre, 40 Gewohnheiten.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('auswertung', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };
var echtSchreiben = Storage.prototype.setItem;
frisch();
state.bewegung = 'aus';
var heute = heuteSchluessel(), beginn = tagPlus(heute, -3 * 365);
var RHYTHMEN = [{ art: 'taeglich' }, { art: 'wochentage', tage: [1, 3, 5] }, { art: 'proWoche', anzahl: 3 }];
state.gewohnheiten = [];
for (var i = 0; i < 40; i++) {
  var erl = [];
  // Jeder zweite bis fünfte Tag erledigt, je Gewohnheit verschoben: Lücken und Serien.
  for (var k = beginn, n = 0; k < heute; k = tagPlus(k, 1), n++) if ((n + i) % (2 + i % 4) !== 0) erl.push(k);
  state.gewohnheiten.push(gewohnheitLesen({ id: 'g' + i, name: 'G' + i, rhythmus: RHYTHMEN[i % 3], angelegt: beginn, erledigt: erl }));
}
speichern();
// Dieselbe Rechnung frisch, ohne Gedächtnis: eine Kopie ist ein neues Objekt.
function frischGerechnet(g) { return auswerten(gewohnheitLesen(JSON.parse(JSON.stringify(g))), heute); }
function gleich(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

var vorher = auswertungenGerechnet;
zeige('home');
var erstes = auswertungenGerechnet - vorher;
pruefe('P1 das erste Zeichnen rechnet jede Gewohnheit genau einmal', erstes === 40, erstes);
vorher = auswertungenGerechnet;
render();
pruefe('P2 ein zweites Zeichnen rechnet nichts mehr', auswertungenGerechnet === vorher, auswertungenGerechnet - vorher);
pruefe('P3 gemerkt ist dasselbe wie frisch gerechnet, für alle 40', state.gewohnheiten.every(function (g) {
  return gleich(auswerten(g, heute), frischGerechnet(g));
}));

// ── Ein Haken: nur die eine Gewohnheit wird neu gerechnet ─────
vorher = auswertungenGerechnet;
var g0 = state.gewohnheiten[0], warHeute = g0.erledigt.indexOf(heute) !== -1;
q('[data-haken="g0"]').click();
pruefe('P4 ein Haken rechnet nur die eine Gewohnheit neu, einmal', auswertungenGerechnet - vorher === 1 &&
  (g0.erledigt.indexOf(heute) !== -1) !== warHeute, auswertungenGerechnet - vorher);
pruefe('P5 und ihr Ergebnis stimmt', gleich(auswerten(g0, heute), frischGerechnet(g0)) &&
  auswerten(g0, heute).erledigtHeute === !warHeute);
hinweisSchliessen();

// ── Was den Schlüssel ändert, rechnet neu ─────────────────────
var g1 = state.gewohnheiten[1], alt = auswerten(g1, heute);
g1.erledigt = g1.erledigt.slice(0, -10);
pruefe('P6 geänderte Tage, auch ohne Speichern: neu gerechnet, stimmt', auswerten(g1, heute) !== alt &&
  gleich(auswerten(g1, heute), frischGerechnet(g1)));
var g2 = state.gewohnheiten[2], vorRhythmus = auswerten(g2, heute);
g2.rhythmus = { art: 'taeglich' };
pruefe('P7 ein anderer Rhythmus: neu gerechnet, stimmt', auswerten(g2, heute) !== vorRhythmus &&
  gleich(auswerten(g2, heute), frischGerechnet(g2)));
var g3 = state.gewohnheiten[3], vorBeginn = auswerten(g3, heute);
g3.angelegt = tagPlus(g3.angelegt, 400);
pruefe('P8 ein späterer Beginn: neu gerechnet, stimmt', auswerten(g3, heute) !== vorBeginn &&
  gleich(auswerten(g3, heute), frischGerechnet(g3)));
var morgen = tagPlus(heute, 1);
pruefe('P9 ein anderer Tag: neu gerechnet, nicht der von heute', auswerten(g0, morgen) !== auswerten(g0, heute) &&
  auswerten(g0, morgen).punkte[6].tag === morgen);

// ── Rücknahme: Speichern scheitert, der Stand springt zurück ──
var vorRueck = JSON.stringify(state.gewohnheiten[5].erledigt);
Storage.prototype.setItem = function () { throw new Error('voll'); };
q('[data-haken="g5"]').click();
Storage.prototype.setItem = echtSchreiben;
hinweisSchliessen();
var g5 = gewohnheitNach('g5');
pruefe('P10 nach der Rücknahme gilt der alte Stand, auch in der Auswertung und auf der Kachel',
  JSON.stringify(g5.erledigt) === vorRueck && gleich(auswerten(g5, heute), frischGerechnet(g5)) &&
  q('[data-haken="g5"]').getAttribute('aria-pressed') === String(auswerten(g5, heute).erledigtHeute));

// ── Eingefroren: niemand schreibt in ein geteiltes Ergebnis ───
var geschrieben = false;
try { auswerten(g0, heute).staerke = 2; geschrieben = auswerten(g0, heute).staerke === 2; } catch (e) { /* so soll es sein */ }
pruefe('P11 ein Ergebnis ist eingefroren', !geschrieben && Object.isFrozen(auswerten(g0, heute)) &&
  Object.isFrozen(auswerten(g0, heute).punkte));
`);
