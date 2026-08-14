// Prüft Lernsets, Freestyle, Zusatzkacheln, Themenfilter und Tastaturvorgabe.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = `
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function lerne(liste, stufe) {
  liste.forEach(function (v) { state.boxes[v.id] = stufe; state.lastSeen[v.id] = Date.now(); });
}

try {
  // A · Navigation und Name
  setTab('home');
  var kacheln = alle('[data-uebung]').map(function (b) { return b.dataset.uebung; }).join(',');
  pruefe('A1 sieben Übungen auf Home',
    kacheln === 'lernsets,freestyle,tippen,schreibung,uebersetzen,buchstaben,grammatik,power', kacheln);
  pruefe('A2 App heißt Chillingo', q('h1').textContent.indexOf('Chillingo') === 0 &&
    document.title.indexOf('Chillingo') === 0);
  pruefe('A3 Doppeltipp-Zoom aus',
    getComputedStyle(document.documentElement).touchAction === 'manipulation',
    getComputedStyle(document.documentElement).touchAction);

  // B · Lernsets
  state.boxes = {}; state.lastSeen = {};
  // Keine Obergrenze mehr: Mit den Sätzen wachsen die Sets. Geprüft wird, dass
  // überhaupt welche entstehen — die Suite «lehrplan» sieht sie sich genauer an.
  pruefe('B1 Sets gebildet', LERNSETS.length >= 8, String(LERNSETS.length));
  pruefe('B2 jedes Set hat Wörter und Sätze',
    LERNSETS.every(function (s) { return s.woerter.length > 0 && s.saetze.length > 0; }));
  pruefe('B3 kein Wort in zwei Sets', (function () {
    var g = {}, ok = true;
    LERNSETS.forEach(function (s) { s.woerter.forEach(function (v) { if (g[v.id]) ok = false; g[v.id] = true; }); });
    return ok;
  })());
  pruefe('B4 erstes Set öffnet Sätze', LERNSETS[0].saetze.length >= 3, String(LERNSETS[0].saetze.length));
  pruefe('B5 Start im ersten Set', aktuellesSet() === 0 && !setFrei(1));
  setTab('lernsets');
  pruefe('B6 Kopf zeigt Set und Satzzahl',
    q('.paket-text').textContent.indexOf('bis zu ' + LERNSETS[0].saetze.length + ' Sätzen') !== -1,
    q('.paket-text').textContent);
  var drin = 0;
  for (var i = 0; i < 30; i++) if (LERNSETS[0].woerter.indexOf(waehleWort(uebPool())) !== -1) drin++;
  pruefe('B7 Auswahl bleibt im Set', drin === 30, drin + '/30');

  // C · Set schafft Sätze frei
  lerne(LERNSETS[0].woerter, SATZ_STUFE);
  pruefe('C1 Set geschafft', setGeschafft(0) && aktuellesSet() === 1);
  var offen = LERNSETS[0].saetze.filter(satzFrei).length;
  pruefe('C2 die Sätze des Sets sind offen', offen === LERNSETS[0].saetze.length,
    offen + '/' + LERNSETS[0].saetze.length);
  setTab('uebersetzen');
  pruefe('C3 Übersetzen ist nach einem Set spielbar', !q('.leer') && !!q('.built'));

  // D · Freestyle
  setTab('freestyle');
  filterSetzen(true); renderFilter();
  pruefe('D1 Themenwahl statt Setwahl', !!q('[data-fw="thema"]') && !q('[data-fw="set"]'));
  pruefe('D2 alle Themen wählbar',
    alle('[data-fw="thema"]').length === Object.keys(VOCAB_THEMES).length + 1,
    String(alle('[data-fw="thema"]').length));
  filterSetzen(false);
  uebThema = 'Tiere';
  uebNext(true);
  var nurThema = true;
  for (var j = 0; j < 20; j++) if (waehleWort(uebPool()).theme !== 'Tiere') nurThema = false;
  pruefe('D3 Freestyle bleibt im Thema', nurThema);
  pruefe('D4 Freestyle ohne Sperre', uebPool().length === VOCAB_THEMES['Tiere'].length);
  uebThema = 'Alle';
  uebNext(true);
  pruefe('D5 «Alle» nutzt den ganzen Bestand', uebPool().length === ALL_VOCAB.length);

  // E · Wechsel der Rubrik setzt die Frage neu
  var vorher = uebQ;
  setTab('lernsets');
  pruefe('E1 Rubrikwechsel baut neu auf', uebModus === 'lernsets' && uebQ !== vorher);

  // F · Zusatzkacheln
  state.boxes = {}; state.lastSeen = {};
  var wort = ALL_VOCAB.filter(function (v) { return v.ru.length >= 5 && v.ru.indexOf(' ') === -1; })[0];
  state.boxes[wort.id] = 3;
  uebModus = 'freestyle'; uebThema = wort.theme;
  var versuche = 0, gefunden = null;
  while (versuche < 60 && !gefunden) {
    var f = buildQuestion();
    if (f && f.mode === 'tiles') gefunden = f;
    versuche++;
  }
  pruefe('F1 Kachelmodus erreichbar', !!gefunden);
  if (gefunden) {
    pruefe('F2 mehr Kacheln als Buchstaben', gefunden.tiles.length > gefunden.laenge,
      gefunden.tiles.length + ' Kacheln für ' + gefunden.laenge + ' Buchstaben');
    var vorhandene = gefunden.tiles.map(function (t) { return t.ch; });
    var noetig = gefunden.word.ru.split('');
    var alleDa = noetig.every(function (c) {
      var i = vorhandene.indexOf(c);
      if (i === -1) return false;
      vorhandene.splice(i, 1);
      return true;
    });
    pruefe('F3 alle nötigen Buchstaben liegen bereit', alleDa);
    uebQ = gefunden; uebPhase = 'ask'; uebBuilt = []; renderUeben();
    pruefe('F4 Felder entsprechen der Wortlänge', alle('.slot').length === gefunden.laenge);
    alle('[data-tile]').slice(0, gefunden.laenge).forEach(function (b) { b.click(); });
    pruefe('F5 nicht mehr Buchstaben als Felder', uebBuilt.length === gefunden.laenge);
    alle('[data-tile]').forEach(function (b) { b.click(); });
    pruefe('F6 überzählige Kacheln bleiben wirkungslos', uebBuilt.length === gefunden.laenge);
  }

  // G · Tastatur in Tippen
  // Stufe 3, nicht BOX_MAX: Fertiges verlässt den Lernstapel und wäre nicht da.
  state.boxes = {}; state.lastSeen = {};
  ALL_VOCAB.slice(0, 5).forEach(function (v) { state.boxes[v.id] = 3; state.lastSeen[v.id] = Date.now(); });
  tippenModus = 'lernen';
  tWord = null; tResult = null; tKb = null;
  setTab('tippen');
  // Getippt wird hier immer Kyrillisch — die eingebaute Tastatur kommt darum
  // von selbst (ADR 0037).
  pruefe('G1 Tastatur steht gleich da', !!q('[data-key]') && !!q('#tKbToggle'));
  q('#tKbToggle').click();
  pruefe('G2 Tastatur lässt sich ausblenden', !q('[data-key]'));
  state.settings.tastaturAuto = false;
  tKb = null;
  setTab('tippen');
  pruefe('G3 ausgeschaltet bleibt sie zu', !q('[data-key]'));
  state.settings.tastaturAuto = true;
  state.settings.tastaturAn = false;

  // H · Bilanz: Themen mit Fortschritt
  state.boxes = {}; state.lastSeen = {};
  VOCAB_THEMES['Tiere'].slice(0, 2).forEach(function (w) { state.boxes[w[0]] = BOX_MAX; });
  themenOffen = false;
  setTab('bilanz');
  var zeilen = alle('.theme-list').pop().querySelectorAll('.theme-row').length;
  pruefe('H1 nur Themen mit Fortschritt', zeilen === 1, String(zeilen));
  pruefe('H2 Ausklappen angeboten', !!q('#themenMehr'));
  q('#themenMehr').click();
  var alleZeilen = alle('.theme-list').pop().querySelectorAll('.theme-row').length;
  pruefe('H3 alle Themen nach dem Ausklappen', alleZeilen === Object.keys(VOCAB_THEMES).length,
    String(alleZeilen));
  q('#themenMehr').click();
  pruefe('H4 wieder einklappbar',
    alle('.theme-list').pop().querySelectorAll('.theme-row').length === 1);
  // I · Aufgaben sitzen tiefer, Listen nicht
  function tief(id) { setTab(id); return document.body.classList.contains('aufgabe'); }
  pruefe('I1 Übungen rücken nach unten',
    ['lernsets', 'freestyle', 'tippen', 'uebersetzen', 'buchstaben', 'grammatik']
      .every(tief));
  pruefe('I2 Home nicht', !tief('home'));
  pruefe('I3 Menüansichten nicht',
    ['bilanz', 'einstellungen', 'tickets', 'sicherung', 'fakten'].every(function (id) {
      return !tief(id);
    }));
  setTab('uebersetzen');
  var mainStil = getComputedStyle(document.getElementById('main'));
  pruefe('I4 der freie Raum wird 2:1 geteilt',
    mainStil.display === 'flex' && mainStil.flexDirection === 'column',
    mainStil.display + '/' + mainStil.flexDirection);
  setTab('bilanz');
  pruefe('I5 in Listen bleibt der Fluss normal',
    getComputedStyle(document.getElementById('main')).display === 'block');


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

writeFileSync(BAU + '/t-rubriken.html', testseite(html, test));
console.log('Rubriken-Testseite geschrieben');
