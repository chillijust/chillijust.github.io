// Gestaltung, Block 7 aus Nachricht 15 (James, 12): Das Glas von Timer und
// Drang ist dichter als das des Hinweises — Zeit und Knöpfe stehen vor einer
// vollen Liste —, aber nicht unschärfer, die Unschärfe ruckelt am Gerät.
// Lange Titel auf dem Dashboard brechen nach zwei Zeilen mit «…» ab; ganz
// stehen sie im Vorlesetext, beim Bearbeiten und in der Exportliste.
// Kleinteile nach Bildvergleich (Wahl des Nutzers): «10 von 12» bleibt eine
// Zeile, die Kalenderpunkte sind eine Stufe größer, ein Schalter aus ist in
// Hell gefaßt.
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

  // ── K · Kleinteile ─────────────────────────────────────────
  frisch();
  var h = heuteSchluessel();
  state.gewohnheiten = [];
  for (var i = 0; i < 12; i++) state.gewohnheiten.push(gewohnheitLesen({ id: 'g' + i, name: 'G' + i,
    rhythmus: { art: 'taeglich' }, angelegt: tagPlus(h, -5), erledigt: i < 10 ? [h] : [] }));
  zeige('home');
  ausbewegt();
  var z = q('#tagesZahl');
  pruefe('K1 «10 von 12» steht auf einer Zeile', z.textContent === '10 von 12' &&
    z.getBoundingClientRect().height <= parseFloat(cs(z).lineHeight) + 1, z.getBoundingClientRect().height);
  pruefe('K2 die Zahl rückt nicht über die Karte', z.getBoundingClientRect().right <= q('.held-kopf .wahl').getBoundingClientRect().left);
  var kp = alle('#app .kal-raster.woche .kp');
  pruefe('K3 Punkte in der Woche 9 px, Ring 2 px', kp.length > 0 && kp.every(function (p) {
    return p.getBoundingClientRect().width === 9 && (p.classList.contains('erledigt') || cs(p).boxShadow.indexOf('2px') !== -1);
  }));
  zeige('neu');
  q('#gwErinnern .schalter-spur').style.transition = 'none';
  var spur = function () { return cs(q('#gwErinnern .schalter-spur')).boxShadow; };
  document.documentElement.setAttribute('data-thema', 'hell');
  var hell = spur();
  document.documentElement.setAttribute('data-thema', 'dunkel');
  var dunkel = spur();
  document.documentElement.removeAttribute('data-thema');
  pruefe('K4 ein Schalter aus ist in Hell gefaßt, in Dunkel nicht', q('#gwErinnern').getAttribute('aria-checked') === 'false' &&
    hell.indexOf('rgb(176, 174, 165)') !== -1 && dunkel.indexOf('rgba(255, 255, 255, 0)') !== -1, hell + ' / ' + dunkel);
});
`);
