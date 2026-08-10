// Prüft die Detailansichten der Bilanz und die Ringdiagramme.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function segmente() {
  return alle('.donut circle:not(.donut-grund)').map(function (c) {
    return parseFloat(c.getAttribute('stroke-dasharray'));
  });
}

try {
  state = defaultState();
  ALL_VOCAB.forEach(function (v, i) {
    if (i < 120) { state.boxes[v.id] = i % 5; state.lastSeen[v.id] = Date.now() - i * 3600000; }
  });
  SENTENCES.slice(0, 8).forEach(function (x, i) {
    state.satzBox[x.ru] = i % 5; state.satzSeen[x.ru] = Date.now();
  });
  state.streak = 7; state.bestStreak = 19; state.answered = 254;
  state.typingStats = { correct: 33, wrong: 5 };
  state.transStats = { correct: 8, wrong: 2 };
  bilanzDetail = null;
  setTab('bilanz');

  // A · Kacheln sind Knöpfe
  var kacheln = alle('[data-detail]');
  pruefe('A1 sechs Kacheln führen weiter', kacheln.length === 6, String(kacheln.length));
  pruefe('A2 es sind Knöpfe', kacheln.every(function (b) { return b.tagName === 'BUTTON'; }));
  pruefe('A3 sie zeigen es an', alle('.stat-mehr').length === 6);
  pruefe('A4 Trefferfläche groß genug',
    kacheln[0].getBoundingClientRect().height >= 44);
  pruefe('A5 Ziele wie erwartet',
    kacheln.map(function (b) { return b.dataset.detail; }).join(',') ===
    'woerter,woerter,woerter,saetze,antworten,serie',
    kacheln.map(function (b) { return b.dataset.detail; }).join(','));

  // B · Wörter
  q('[data-detail="woerter"]').click();
  pruefe('B1 Detail offen', bilanzDetail === 'woerter' && !!q('.donut'));
  pruefe('B2 der Kopf nennt es', q('#kopfTitel').textContent === 'Wörter' &&
    q('#kopfEyebrow').textContent === 'Bilanz',
    q('#kopfEyebrow').textContent + '/' + q('#kopfTitel').textContent);
  var segs = segmente();
  pruefe('B3 fünf Stufen als Segmente', segs.length === 5, String(segs.length));
  var summe = segs.reduce(function (a, b) { return a + b; }, 0);
  pruefe('B4 die Segmente füllen den Ring genau',
    Math.abs(summe - 2 * Math.PI * 42) < 0.5, summe.toFixed(2));
  var gemeistert = ALL_VOCAB.filter(function (v) { return (state.boxes[v.id] || 0) >= BOX_MAX; }).length;
  pruefe('B5 die Mitte nennt die gemeisterten',
    q('.donut-wert').textContent === String(gemeistert), q('.donut-wert').textContent);
  pruefe('B6 Legende mit fünf Zeilen', alle('.leg').length === 5);
  pruefe('B7 Legende zählt richtig',
    alle('.leg-wert').map(function (x) { return x.textContent; }).join(',') ===
    [4, 3, 2, 1, 0].map(function (bi) {
      return ALL_VOCAB.filter(function (v) { return (state.boxes[v.id] || 0) === bi; }).length;
    }).join(','),
    alle('.leg-wert').map(function (x) { return x.textContent; }).join(','));
  pruefe('B8 nur begonnene Themen',
    alle('.theme-row').length === Object.keys(VOCAB_THEMES).filter(function (t) {
      return VOCAB_THEMES[t].some(function (w) { return (state.boxes[w[0]] || 0) > 0; });
    }).length, String(alle('.theme-row').length));
  pruefe('B9 kein Leak: keine Wortliste',
    !ALL_VOCAB.slice(200).some(function (v) { return main.textContent.indexOf(v.ru) !== -1; }));

  // C · Zurück
  q('#detailBack').click();
  pruefe('C1 zurück zur Übersicht', bilanzDetail === null && !!q('[data-detail]'));
  pruefe('C2 der Kopf auch', q('#kopfTitel').textContent === 'Bilanz');
  q('[data-detail="saetze"]').click();
  q('#zurueck').click();
  pruefe('C3 der Pfeil führt erst zur Bilanz', currentTab === 'bilanz' && bilanzDetail === null);
  q('#zurueck').click();
  pruefe('C4 und dann nach Home', currentTab === 'home');

  // D · Sätze
  setTab('bilanz');
  q('[data-detail="saetze"]').click();
  // Leere Segmente werden bewusst weggelassen — gezeichnet wird, was es gibt.
  var werte = [0, 0, 0];
  SENTENCES.forEach(function (x) {
    if (satzBox(x) >= BOX_MAX) werte[0]++;
    else if (satzFrei(x)) werte[1]++;
    else werte[2]++;
  });
  var segs2 = segmente();
  pruefe('D1 ein Segment je vorhandener Gruppe',
    segs2.length === werte.filter(function (n) { return n > 0; }).length,
    segs2.length + ' bei ' + werte.join('/'));
  pruefe('D2 Mitte nennt die sitzenden — wie die Kachel',
    q('.donut-wert').textContent === String(werte[0]),
    q('.donut-wert').textContent + ' statt ' + werte[0]);
  pruefe('D3 Summe der Legende ist der Bestand',
    alle('.leg-wert').reduce(function (n, x) { return n + parseInt(x.textContent, 10); }, 0) === SENTENCES.length);
  pruefe('D4 je Stufe eine Zeile', alle('.theme-row').length === 3);
  pruefe('D5 kein Leak: kein Satztext',
    !SENTENCES.some(function (x) { return main.textContent.indexOf(x.ru) !== -1; }));
  q('#detailBack').click();

  // E · Antworten
  q('[data-detail="antworten"]').click();
  pruefe('E1 zwei Ringe', alle('.donut').length === 2 && alle('.donut.klein').length === 2);
  pruefe('E2 Quote Tippen', alle('.donut-wert')[0].textContent === '87 %',
    alle('.donut-wert')[0].textContent);
  pruefe('E3 Quote Übersetzen', alle('.donut-wert')[1].textContent === '80 %',
    alle('.donut-wert')[1].textContent);
  pruefe('E4 die Gesamtzahl steht dabei', main.textContent.indexOf('254 Antworten') !== -1);
  q('#detailBack').click();

  // F · Serie
  q('[data-detail="serie"]').click();
  pruefe('F1 Mitte zeigt die laufende Serie', q('.donut-wert').textContent === '7');
  pruefe('F2 und nennt die beste', q('.donut-text').textContent.indexOf('von 19') !== -1,
    q('.donut-text').textContent);
  q('#detailBack').click();

  // G · Leerer Stand wirft nicht
  state = defaultState();
  bilanzDetail = 'woerter'; renderBilanz();
  pruefe('G1 ohne Fortschritt zeichenbar', !!q('.donut') && q('.donut-wert').textContent === '0');
  bilanzDetail = 'antworten'; renderBilanz();
  pruefe('G2 ohne Antworten kein Prozentwert',
    alle('.donut-wert')[0].textContent === '—', alle('.donut-wert')[0].textContent);
  bilanzDetail = 'serie'; renderBilanz();
  pruefe('G3 ohne Serie zeichenbar', q('.donut-wert').textContent === '0');
  bilanzDetail = 'saetze'; renderBilanz();
  pruefe('G4 ohne freie Sätze zeichenbar', !!q('.donut'));

  // H · Nach dem Wiederherstellen ist das Detail zu
  bilanzDetail = 'woerter';
  ansichtenZuruecksetzen();
  pruefe('H1 ansichtenZuruecksetzen räumt es ab', bilanzDetail === null);
} catch (e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + (e.stack || '').split('\n')[1]);
}

var pre = document.createElement('pre');
pre.id = 'testlog';
pre.textContent = log.join('\n');
document.body.appendChild(pre);
var f = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
document.title = f.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + f.length;
`;

writeFileSync(BAU + '/t-bilanz.html', testseite(html, test));
console.log('Bilanz-Testseite geschrieben');
