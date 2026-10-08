// Prüft Fakten-Sammlung, Darstellungswahl, App-Symbol, klebende Leiste
// und den gemeinsamen Lernstand von Lernsets und Freestyle.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = `
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  // A · Fakten: Bestand und Auswahl
  pruefe('A1 Bestand stark gewachsen', FACTS.length >= 100, String(FACTS.length));
  pruefe('A2 keine Dublette', new Set(FACTS).size === FACTS.length);
  state.fakten = {};
  var erste = {};
  for (var i = 0; i < 40; i++) {
    var f = naechsterFakt();
    faktGezeigt(f);
    erste[f] = true;
  }
  pruefe('A3 zeigt zuerst Ungesehenes', Object.keys(erste).length === 40, String(Object.keys(erste).length));
  var summe = FACTS.reduce(function (n, f) { return n + faktStand(f).n; }, 0);
  pruefe('A4 Zähler wird geführt', summe === 40 && Object.keys(state.fakten).length === 40, String(summe));

  // B · Favoriten
  state.fakten = {};
  pruefe('B1 anfangs kein Favorit', !faktStand(FACTS[3]).f);
  faktFavorit(FACTS[3]);
  pruefe('B2 Favorit gesetzt', faktStand(FACTS[3]).f === true);
  faktFavorit(FACTS[3]);
  pruefe('B3 Favorit wieder gelöst', faktStand(FACTS[3]).f === false);
  faktFavorit(FACTS[3]);

  // C · Faktenansicht
  faktGezeigt(FACTS[0]); faktGezeigt(FACTS[0]); faktGezeigt(FACTS[1]);
  faktenFilter = 'gesehen';
  setTab('fakten');
  pruefe('C1 Ansicht listet Gesehenes', alle('.faktzeile').length === 2, String(alle('.faktzeile').length));
  pruefe('C2 Häufigkeit steht dabei', main.textContent.indexOf('2× gezeigt') !== -1);
  q('[data-filter="favoriten"]').click();
  pruefe('C3 Favoritenfilter greift', alle('.faktzeile').length === 1);
  q('[data-filter="alle"]').click();
  pruefe('C4 alle Fakten anzeigbar', alle('.faktzeile').length === FACTS.length, String(alle('.faktzeile').length));
  pruefe('C5 Ungezeigtes ist markiert', alle('.faktzeile.neu').length === FACTS.length - 2,
    String(alle('.faktzeile.neu').length));
  var sternVorher = FACTS.filter(function (f) { return faktStand(f).f; }).length;
  q('[data-fav]').click();
  pruefe('C6 Stern in der Liste schaltet um',
    FACTS.filter(function (f) { return faktStand(f).f; }).length !== sternVorher);
  q('#faktenBack').click();
  pruefe('C7 Zurück verlässt die Ansicht', currentTab !== 'fakten', currentTab);

  // D · Faktenkarte beim Üben
  state.fakten = {}; state.answered = 5; state.boxes = {}; state.lastSeen = {};
  setTab('lernsets');
  uebNext(false);
  pruefe('D1 Fakt erscheint nach fünf Antworten', uebPhase === 'fact' && !!q('.sprechblase'), uebPhase);
  pruefe('D2 Fakt ist als gezeigt vermerkt', faktStand(faktKarte).n === 1);
  q('#factFav').click();
  pruefe('D3 Stern auf der Karte merkt vor', faktStand(faktKarte).f === true);
  q('#factAlle').click();
  pruefe('D4 «Alle Fakten» führt in die Sammlung', currentTab === 'fakten');
  setTab('lernsets');

  // **Erst das Tutorial schließen.** Die Testseite lädt mit leerem Speicher,
  // und dann fragt die App von selbst — diese Suite hat das nie bemerkt, weil
  // sie nur über JS zugreift. Seit der Grund der Seite sich mit verdunkelt
  // (ADR 0087), misst man hier sonst den abgedunkelten Wert.
  tutEnde();

  // E · Darstellung — eine Liste statt zweier Achsen (ADR 0039).
  // Ausführlich geprüft wird sie in farbton.mjs; hier steht nur, dass die
  // Wahl da ist und sofort greift.
  state.settings.schema = 'classic';
  updateDarstellung();
  pruefe('E1 ein helles Schema setzt data-schema',
    document.documentElement.getAttribute('data-schema') === 'classic');
  // Gefragt wird gegen die Liste, nicht gegen eine abgeschriebene Zahl: Die
  // Paletten werden gerechnet (tools/palette.py) und dürfen sich ändern —
  // dass der Grund des gewählten Schemas wirklich greift, bleibt die Frage.
  pruefe('E2 helle Farben greifen', (function () {
    var d = document.createElement('span');
    d.style.color = schemaVon('classic').grund;
    document.body.appendChild(d);
    var soll = getComputedStyle(d).color;
    d.remove();
    return getComputedStyle(document.body).backgroundColor === soll;
  })(), getComputedStyle(document.body).backgroundColor + ' / ' + schemaVon('classic').grund);
  state.settings.schema = 'dark';
  updateDarstellung();
  pruefe('E3 «dark» trägt kein Attribut',
    !document.documentElement.hasAttribute('data-schema'));
  pruefe('E4 Statusleistenfarbe folgt',
    q('meta[name="theme-color"]').getAttribute('content') === '#1A1A18',
    q('meta[name="theme-color"]').getAttribute('content'));
  pruefe('E5 die alten Achsen sind weg',
    !document.documentElement.hasAttribute('data-theme') &&
    !document.documentElement.hasAttribute('data-farbe'));
  setTab('einstellungen');
  // Das Farbschema steht seit den Reitern auf «Darstellung».
  einstReiter = 'darstellung';
  renderEinstellungen();
  pruefe('E6 Wahl in den Einstellungen', alle('[data-wahltext="schema"]').length === 5);
  alle('[data-wahltext="schema"]').filter(function (b) {
    return b.dataset.wert === 'rosa';
  })[0].click();
  pruefe('E7 Klick stellt um', state.settings.schema === 'rosa' &&
    document.documentElement.getAttribute('data-schema') === 'rosa');
  var m = mergeState({ settings: { schema: 'unsinn' } });
  pruefe('E8 unbekannte Angabe wird verworfen', m.settings.schema === 'dark');
  state.settings.schema = 'dark'; updateDarstellung();

  // F · App-Symbol und Titel
  pruefe('F1 Symbol eingebettet', (q('link[rel="apple-touch-icon"]') || {}).href &&
    q('link[rel="apple-touch-icon"]').href.indexOf('data:image/png;base64,') === 0);
  pruefe('F2 Name für den Home-Bildschirm',
    q('meta[name="apple-mobile-web-app-title"]').content === 'Chillingo');

  // G · Der Kopf klebt unterwegs, auf Home nicht
  setTab('home');
  pruefe('G1 auf Home scrollt der Kopf mit',
    getComputedStyle(q('#kopf')).position === 'relative' && !document.body.classList.contains('unterwegs'),
    getComputedStyle(q('#kopf')).position);
  pruefe('G2 Home zeigt Titel und Fortschritt',
    q('#kopfTitel').textContent.indexOf('Chillingo') === 0 && !q('#kopfFortschritt').hidden);
  pruefe('G3 kein Zurück-Pfeil auf Home', q('#zurueck').hidden === true);
  setTab('tippen');
  pruefe('G4 unterwegs klebt der Kopf',
    getComputedStyle(q('#kopf')).position === 'sticky' && document.body.classList.contains('unterwegs'));
  pruefe('G5 er nennt die Übung', q('#kopfTitel').textContent === 'Tippen' &&
    q('#kopfEyebrow').textContent === 'Übung');
  pruefe('G6 Zurück-Pfeil da und groß genug', !q('#zurueck').hidden &&
    q('#zurueck').getBoundingClientRect().height >= 44);
  pruefe('G7 der Kopf deckt ab', getComputedStyle(q('#kopf')).backgroundColor !== 'rgba(0, 0, 0, 0)');
  q('#zurueck').click();
  pruefe('G8 Zurück führt nach Home', currentTab === 'home' && !!q('.kachelfeld'));

  // H · Gemeinsamer Lernstand
  state.boxes = {}; state.lastSeen = {};
  var wort = ALL_VOCAB.filter(function (v) { return v.theme === 'Tiere'; })[0];
  uebAuswahl = 0;
  updateBox(wort.id, true);
  pruefe('H1 Freestyle schreibt in denselben Stand', state.boxes[wort.id] === 1);
  uebAuswahl = 'aktuell';
  var setWort = LERNSETS[0].woerter[0];
  updateBox(setWort.id, true);
  updateBox(setWort.id, true);
  uebAuswahl = 'alle';
  pruefe('H2 Lernsets-Fortschritt gilt auch im Freestyle', state.boxes[setWort.id] === 2);
  pruefe('H3 Freestyle-Fortschritt zählt für die Sets',
    LERNSETS[0].woerter.filter(function (v) { return (state.boxes[v.id] || 0) >= SATZ_STUFE; }).length === 1);
  var vokabelImSet = LERNSETS.some(function (s) {
    return s.woerter.some(function (v) { return v.id === setWort.id; });
  });
  pruefe('H4 dieselbe Kennung in beiden Rubriken', vokabelImSet && !!VOKABEL[setWort.id]);
} catch (e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + (e.stack || '').split('\\n')[1]);
}

var pre = document.createElement('pre');
pre.id = 'testlog';
pre.textContent = log.join('\\n');
document.body.appendChild(pre);
var f = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
document.title = f.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + f.length;
`;

writeFileSync(BAU + '/t-extras.html', testseite(html, test));
console.log('Extras-Testseite geschrieben');
