// Gestaltung, Block 7 aus Nachricht 15 (James, 12): Das Glas von Timer und
// Drang ist dichter als das des Hinweises — Zeit und Knöpfe stehen vor einer
// vollen Liste —, aber nicht unschärfer, die Unschärfe ruckelt am Gerät.
// Lange Titel auf dem Dashboard brechen nach zwei Zeilen mit «…» ab; ganz
// stehen sie im Vorlesetext, beim Bearbeiten und in der Exportliste.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('gestaltung', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function farbe(wert) {
  var p = document.createElement('div');
  p.style.background = wert;
  q('#app').appendChild(p);
  var f = getComputedStyle(p).backgroundColor;
  p.remove();
  return f;
}
function cs(el) { return getComputedStyle(el); }
var LANG = 'Zahnarzt Dr. Müller-Lüdenscheidt, Kontrolle und Reinigung';
pruefe('T0 der lange Titel paßt ins Feld', LANG.length <= TITEL_MAX);
function aufbauen() {
  frisch();
  var h = heuteSchluessel();
  state.gewohnheiten = [gewohnheitLesen({ id: 'a', name: 'Lesen', rhythmus: { art: 'taeglich' },
    angelegt: tagPlus(h, -5), erledigt: [], timer: { minuten: 20, stumm: true } }),
    gewohnheitLesen({ id: 'b', name: 'Jeden Morgen zehn Minuten Dehnen auf der Matte', rhythmus: { art: 'taeglich' },
      angelegt: tagPlus(h, -5), erledigt: [] })];
  state.abgewoehnen = [];
  state.termine = [terminLesen({ id: 't1', titel: LANG, tag: h, von: '09:30', ort: 'Hauptstraße 12' }),
    terminLesen({ id: 't2', titel: 'Kurz', tag: tagPlus(h, 3), von: '12:00' })];
  zeige('home');
}

// ── G · Glas von Timer und Drang ─────────────────────────────
aufbauen();
var dicht = farbe('var(--glas-dicht)'), duenn = farbe('var(--glas)');
pruefe('G1 Timer und Drang tragen das dichte Glas', cs(q('#timerKarte')).backgroundColor === dicht &&
  cs(q('#drangKarte')).backgroundColor === dicht, cs(q('#timerKarte')).backgroundColor + ' / ' + dicht);
pruefe('G2 der Hinweis behält das dünne', cs(q('#hinweisBlatt .hinweis-karte')).backgroundColor === duenn &&
  dicht !== duenn);
pruefe('G3 dichter heißt deckender, in Hell und Dunkel', ['hell', 'dunkel'].every(function (t) {
  document.documentElement.setAttribute('data-thema', t);
  var a = function (f) { return parseFloat(f.split(',')[3]); };
  return a(farbe('var(--glas-dicht)')) >= 0.75 && a(farbe('var(--glas-dicht)')) > a(farbe('var(--glas)')) + 0.3;
}));
document.documentElement.removeAttribute('data-thema');
var unschaerfe = function (el) { return cs(el).webkitBackdropFilter || cs(el).backdropFilter; };
pruefe('G4 nicht unschärfer als der Hinweis', unschaerfe(q('#timerKarte')) === unschaerfe(q('#hinweisBlatt .hinweis-karte')),
  unschaerfe(q('#timerKarte')));
timerStarten('a');
return warten(HINWEIS_DAUER + 3 * TROPFEN_DAUER + 400).then(function () {
  ausbewegt();
  pruefe('G5 offen und angekommen: dichtes Glas', timerOffen() && !q('#timerKarte').classList.contains('im-tropfen') &&
    cs(q('#timerKarte')).backgroundColor === dicht);
  timerSchliessen();
  return warten(HINWEIS_DAUER + 3 * TROPFEN_DAUER + 400);
}).then(function () {
  ausbewegt();

  // ── T · Titel auf zwei Zeilen ──────────────────────────────
  aufbauen();
  ausbewegt();
  var titel = q('#app .tm-liste [data-termin="t1"] .tm-titel');
  var zeile = parseFloat(cs(titel).lineHeight);
  pruefe('T1 ein langer Termintitel nimmt höchstens zwei Zeilen', titel.getBoundingClientRect().height <= 2 * zeile + 1,
    titel.getBoundingClientRect().height + ' > ' + 2 * zeile);
  pruefe('T2 und ist wirklich gekürzt, nicht nur kurz', titel.scrollHeight > titel.clientHeight + 1);
  pruefe('T3 der Vorlesetext trägt den ganzen Titel', titel.textContent === LANG &&
    q('#app [data-termin="t1"]').getAttribute('aria-label').indexOf(LANG) === 0);
  pruefe('T4 auch der Name einer Gewohnheit endet nach zwei Zeilen', alle('#app .gw-kachel .gw-name').every(function (n) {
    return cs(n).webkitLineClamp === '2' && cs(n).overflow === 'hidden';
  }));
  pruefe('T5 ein kurzer Titel bleibt eine Zeile', alle('#app .tm-titel').every(function (n) {
    return n.textContent !== 'Kurz' || n.getBoundingClientRect().height <= zeile + 1;
  }));
  zeige('export');
  ausbewegt();
  var ex = alle('#app .ex-zeile .tm-titel').filter(function (n) { return n.textContent === LANG; })[0];
  pruefe('T6 in der Exportliste steht der Titel ganz', !!ex && ex.scrollHeight <= ex.clientHeight + 1 &&
    ex.getBoundingClientRect().height > 2 * zeile, ex && ex.getBoundingClientRect().height);
});
`);
