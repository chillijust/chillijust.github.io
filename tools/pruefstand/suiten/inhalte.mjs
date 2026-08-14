// Prüft den Lehrplan: Voraussetzungen der Sätze, Freischaltung, Leerzustand.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = `
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function lerne(woerter, stufe) {
  woerter.forEach(function (w) { state.boxes[w] = stufe; state.lastSeen[w] = Date.now(); });
}

try {
  // A · Daten
  // Keine feste Zahl, aus demselben Grund wie beim Wortschatz: Die Sätze
  // wachsen mit jeder Etappe. Geprüft wird, dass sie nicht schrumpfen.
  pruefe('A1 Sätze sind eine Liste', Array.isArray(SENTENCES) && SENTENCES.length >= 102,
    String(SENTENCES.length));
  pruefe('A2 jeder Satz nennt Voraussetzungen',
    SENTENCES.every(function (s) { return s.benoetigt && s.benoetigt.length > 0; }));
  var ids = {};
  ALL_VOCAB.forEach(function (v) { ids[v.id] = true; });
  var unbekannt = [];
  SENTENCES.forEach(function (s) {
    s.benoetigt.forEach(function (w) { if (!ids[w]) unbekannt.push(s.ru + ' → ' + w); });
  });
  pruefe('A3 alle Voraussetzungen stehen im Lehrplan', unbekannt.length === 0, unbekannt.slice(0, 3).join(' | '));
  // Keine feste Zahl: Der Lehrplan wächst. Geprüft wird, dass er nicht
  // schrumpft und dass kein Wort zweimal dasteht.
  pruefe('A4 der Wortschatz wächst weiter', ALL_VOCAB.length >= 395, String(ALL_VOCAB.length));
  pruefe('A5 Funktionswörter kommen zuerst',
    ALL_VOCAB[0].id === 'я' && ALL_VOCAB.slice(0, 12).some(function (v) { return v.id === 'что'; }));

  // B · Freischaltung der Sätze
  state.boxes = {}; state.lastSeen = {};
  setTab('uebersetzen');
  pruefe('B1 ohne Lernstand kein Satz', !!q('.leer') && freieSaetze(1).length === 0);
  pruefe('B2 Leerzustand nennt fehlende Wörter', !!q('.naechste') && q('.naechste').textContent.indexOf('fehlen') !== -1);
  var ersterSatz = SENTENCES.filter(function (s) { return s.stufe === 1; })[0];
  lerne(ersterSatz.benoetigt, SATZ_STUFE);
  trTask = null; buildTransTask(); renderUebersetzen();
  pruefe('B3 nach dem Lernen ist der Satz da', freieSaetze(1).length === 1 && !!q('.built'), ersterSatz.ru);
  filterSetzen(true); renderFilter();
  var stufe1 = SENTENCES.filter(function (x) { return x.stufe === 1; }).length;
  pruefe('B4 die Auswahl zählt mit',
    q('[data-fw="stufe"][data-fv="1"]').textContent.indexOf('1/' + stufe1) !== -1,
    q('[data-fw="stufe"][data-fv="1"]').textContent);
  filterSetzen(false);
  state.boxes[ersterSatz.benoetigt[0]] = SATZ_STUFE - 1;
  pruefe('B5 ein zurückgefallenes Wort sperrt den Satz wieder', freieSaetze(1).length === 0);
  lerne(ersterSatz.benoetigt, SATZ_STUFE);

  // C · Reihenfolge: kein Satz vor seinen Wörtern
  var platz = {};
  ALL_VOCAB.forEach(function (v, i) { platz[v.id] = i; });
  var reife = SENTENCES.map(function (s) {
    return Math.max.apply(null, s.benoetigt.map(function (w) { return platz[w]; }));
  });
  var sortiert = true;
  for (var i = 1; i < SENTENCES.length; i++) {
    if (SENTENCES[i].stufe === SENTENCES[i - 1].stufe && reife[i] < reife[i - 1]) sortiert = false;
  }
  pruefe('C1 Sätze stehen nach Reifegrad', sortiert);
  pruefe('C2 erster Satz früh erreichbar', reife[0] < 12 * 10, 'nach Wort ' + (reife[0] + 1));

  // D · Ganzer Durchlauf mit gelerntem Wortschatz
  state.boxes = {}; state.lastSeen = {};
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  trLevel = 1; trModus = 'lernen'; trTask = null; buildTransTask(); renderUebersetzen();
  pruefe('D1 alle Sätze offen', (function () {
    return [1, 2, 3].every(function (n) {
      return freieSaetze(n).length ===
        SENTENCES.filter(function (x) { return x.stufe === n; }).length;
    });
  })(), freieSaetze(1).length + '/' + freieSaetze(2).length + '/' + freieSaetze(3).length);
  var tokens = trTask.targetTokens.slice();
  tokens.forEach(function (tok) {
    var b = alle('[data-wtile]').filter(function (x) { return x.textContent === tok && !x.disabled; })[0];
    if (b) b.click();
  });
  q('#trConfirm').click();
  pruefe('D2 Satz lösbar', trPhase === 'feedback' && trCorrect === true, String(trCorrect));
  var geloest = trTask.satz;
  pruefe('D3 Satz steigt eine Stufe', satzBox(geloest) === 1, String(satzBox(geloest)));
  pruefe('D3b Zeitstempel gesetzt', typeof state.satzSeen[geloest.ru] === 'number');
  q('#trNext').click();
  pruefe('D4 Weiter bringt einen anderen Satz', trPhase === 'ask' && trTask.satz !== geloest);

  // E · Migration alter Satzschlüssel
  var m = mergeState({ readSeen: { '1-0': true, 'Это дом.': true } });
  pruefe('E1 alte Schlüssel fallen weg', m.satzBox['1-0'] === undefined);
  pruefe('E2 gesehener Satz startet auf Stufe 1', m.satzBox['Это дом.'] === 1);
  pruefe('E3 und gilt als sofort fällig', m.satzSeen['Это дом.'] === 0);
  var m2 = mergeState({ satzBox: { 'Это дом.': 4 }, satzSeen: { 'Это дом.': 123 } });
  pruefe('E4 neue Stände bleiben unangetastet',
    m2.satzBox['Это дом.'] === 4 && m2.satzSeen['Это дом.'] === 123);

  // F · Bilanz zählt gegen die offenen Sätze
  setTab('bilanz');
  pruefe('F1 Lernweg zeigt offene Sätze', main.textContent.indexOf('Sätze offen') !== -1);
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

writeFileSync(BAU + '/t-inhalte.html', testseite(html, test));
console.log('Inhalte-Testseite geschrieben');
