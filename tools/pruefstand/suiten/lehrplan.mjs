// Prüft den Lehrplan als Ganzes — das, was mit Etappe 6 wächst (ADR 0057):
//
//   · Wie viel vom Wortschatz überhaupt im Lernweg liegt.
//   · Dass kein Lernset über SET_MAX geht und keines leer ist.
//   · Dass jede Satzstufe Bestand hat.
//   · Dass der **Neuschnitt der Sets** die Jubelmarken richtig aufräumt —
//     das ist der Grund für die erste Ziffer der Version.
//
// **Die Zahlen stehen als Untergrenzen da, nicht als Fixpunkte.** Eine Suite,
// die «genau 102 Sätze» verlangt, ist beim nächsten Zuwachs rot, ohne dass
// etwas kaputt wäre — und dann gewöhnt man sich das Rot an.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');
const saetze = JSON.parse(readFileSync(WURZEL + '/data/saetze.json', 'utf8'));
const vokabeln = JSON.parse(readFileSync(WURZEL + '/data/vokabeln.json', 'utf8'));
const woerter = Object.values(vokabeln).flat().length;
const drin = new Set();
saetze.forEach((s) => s.benoetigt.forEach((b) => drin.add(b)));
console.log('Sätze in /data:', saetze.length,
  '· im Lernweg:', drin.size + '/' + woerter,
  '(' + Math.round((drin.size / woerter) * 100) + ' %)');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  tutEnde();
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Der Lernweg deckt den Wortschatz ──────────────────
  var imWeg = {};
  SENTENCES.forEach(function (s) {
    s.benoetigt.forEach(function (w) { imWeg[w] = true; });
  });
  var anteil = Object.keys(imWeg).length / ALL_VOCAB.length;
  pruefe('A1 der Lernweg deckt mindestens die Hälfte des Wortschatzes',
    anteil >= 0.5, Math.round(anteil * 100) + ' %');
  // **Ein Wort ohne Satz ist ein Wort ohne Weg.** Es steht in keinem Set,
  // schaltet nichts frei und taucht in «Übersetzen» nie auf. Die Zahl darf
  // fallen, nie steigen — darum steht sie hier als Obergrenze.
  var heimatlos = ALL_VOCAB.filter(function (v) { return !imWeg[v.id]; });
  pruefe('A2 die heimatlosen Wörter werden weniger, nicht mehr',
    heimatlos.length <= 194, String(heimatlos.length));

  // ── B · Die Lernsets ──────────────────────────────────────
  pruefe('B1 es gibt mehr als ein Dutzend Sets', LERNSETS.length >= 12,
    String(LERNSETS.length));
  var zuGross = LERNSETS.filter(function (s) { return s.woerter.length > SET_MAX; });
  pruefe('B2 kein Set geht über SET_MAX', zuGross.length === 0,
    zuGross.map(function (s) { return 'Set ' + (s.nr + 1) + ': ' + s.woerter.length; }).join(' '));
  var leer = LERNSETS.filter(function (s) { return !s.woerter.length; });
  pruefe('B3 kein Set ist leer', leer.length === 0,
    leer.map(function (s) { return 'Set ' + (s.nr + 1); }).join(' '));
  var ohneSatz = LERNSETS.filter(function (s) { return !s.saetze.length; });
  pruefe('B4 jedes Set trägt Sätze', ohneSatz.length === 0,
    ohneSatz.map(function (s) { return 'Set ' + (s.nr + 1); }).join(' '));
  // Jedes Wort steht in genau einem Set — sonst zählte der Fortschritt doppelt.
  var wieOft = {};
  LERNSETS.forEach(function (s) {
    s.woerter.forEach(function (v) { wieOft[v.id] = (wieOft[v.id] || 0) + 1; });
  });
  pruefe('B5 kein Wort steht in zwei Sets',
    Object.keys(wieOft).every(function (k) { return wieOft[k] === 1; }));
  pruefe('B6 die Sets führen genau die Wörter des Lernwegs',
    Object.keys(wieOft).length === Object.keys(imWeg).length,
    Object.keys(wieOft).length + '/' + Object.keys(imWeg).length);

  // ── C · Die Satzstufen ────────────────────────────────────
  [1, 2, 3].forEach(function (n) {
    var wieviele = SENTENCES.filter(function (s) { return s.stufe === n; }).length;
    pruefe('C' + n + ' Stufe ' + n + ' hat Bestand', wieviele >= 15, String(wieviele));
  });
  // Innerhalb einer Stufe stehen die Sätze nach Reifegrad — wer die Datei
  // liest, soll den Weg sehen, und die Sets entstehen aus derselben Ordnung.
  var reife = function (s) {
    return Math.max.apply(null, s.benoetigt.map(function (w) {
      return VOKABEL[w] ? VOKABEL[w].nr : 0;
    }));
  };
  var schief = 0;
  for (var i = 1; i < SENTENCES.length; i++) {
    if (SENTENCES[i].stufe === SENTENCES[i - 1].stufe &&
      reife(SENTENCES[i]) < reife(SENTENCES[i - 1])) schief++;
  }
  pruefe('C4 die Sätze stehen nach Reifegrad', schief === 0, String(schief));

  // ── D · Der Neuschnitt räumt die Jubelmarken auf ──────────
  // **Der Grund für die erste Ziffer der Version.** «set:7» meint nach einem
  // Neuschnitt etwas anderes als vorher.
  state = defaultState();
  pruefe('D1 ein frischer Stand kennt seinen Schnitt noch nicht',
    state.setSchnitt === 0);
  state.gefeiert['set:0'] = 1;
  state.gefeiert['set:7'] = 1;
  state.gefeiert['thema:Farben'] = 1;
  state.gefeiert.abc = 1;
  setSchnittPruefen();
  pruefe('D2 die Set-Marken fallen weg',
    !state.gefeiert['set:0'] && !state.gefeiert['set:7']);
  pruefe('D3 Thema, Alphabet und Regeln bleiben — sie hängen nicht am Schnitt',
    state.gefeiert['thema:Farben'] === 1 && state.gefeiert.abc === 1);
  pruefe('D4 der Schnitt ist jetzt vermerkt', state.setSchnitt === LERNSETS.length,
    String(state.setSchnitt));

  // Beim zweiten Mal passiert nichts mehr — eine Marke, die *jetzt* entsteht,
  // gehört zu diesem Schnitt und muss bleiben.
  state.gefeiert['set:0'] = 1;
  setSchnittPruefen();
  pruefe('D5 beim zweiten Mal bleibt alles stehen', state.gefeiert['set:0'] === 1);

  // Und was wirklich geschafft ist, trägt jubelNachtragen() sofort wieder ein.
  state = defaultState();
  LERNSETS[0].woerter.forEach(function (v) {
    state.boxes[v.id] = BOX_MAX;
    state.lastSeen[v.id] = Date.now();
  });
  setSchnittPruefen();
  jubelNachtragen();
  pruefe('D6 ein geschafftes Set gilt danach wieder als gefeiert',
    state.gefeiert['set:0'] === 1);
  pruefe('D7 ein nicht geschafftes nicht', !state.gefeiert['set:' + (LERNSETS.length - 1)]);

  // ── E · Der Dativ ─────────────────────────────────────────
  pruefe('E1 es gibt einen Dativ-Baustein',
    GRAMMATIK.some(function (b) { return b.aufgabe === 'dat'; }));
  var dativB = GRAMMATIK.filter(function (b) { return b.aufgabe === 'dat'; })[0];
  // **Der Dativ ist der Fall des Empfängers** — empfangen kann nur, wer lebt.
  // «книге нравится» wäre tadellos gebeugt und trotzdem Unsinn (ADR 0043).
  var pool = gramWortPool(dativB);
  pruefe('E2 geübt wird nur an Lebewesen',
    pool.length > 0 && pool.every(function (v) { return belebt(v.art); }),
    pool.filter(function (v) { return !belebt(v.art); })
      .map(function (v) { return v.ru; }).join(' '));
  pruefe('E3 und es sind genug davon', pool.length >= 8, String(pool.length));
  pruefe('E4 die Beispiele stehen alle im Lehrplan',
    dativB.beispiele.every(function (w) { return !!VOKABEL[w]; }),
    dativB.beispiele.filter(function (w) { return !VOKABEL[w]; }).join(' '));

  // Die Maschine rechnet ihn — dieselben Fälle wie im Build.
  pruefe('E5 weiblich -а wird -е', grammForm('мама', 'wb', 'dat') === 'маме');
  pruefe('E6 männlich nimmt -у', grammForm('слон', 'mb', 'dat') === 'слону');
  pruefe('E7 männlich -ь nimmt -ю', grammForm('медведь', 'mb', 'dat') === 'медведю',
    grammForm('медведь', 'mb', 'dat'));
  pruefe('E8 weiblich -ь nimmt -и', grammForm('мышь', 'wb', 'dat') === 'мыши');

  // Die Aufgabe steht am Schirm, und sie fragt nach «wem».
  state = defaultState();
  ansichtenZuruecksetzen();
  GRAMMATIK.forEach(function (b) {
    state.gramBox[b.id] = b.aufgabe === 'dat' ? 0 : BOX_MAX;
    state.gramSeen[b.id] = Date.now();
  });
  gramWahl = dativB.id;
  setTab('grammatik');
  pruefe('E9 die Aufgabe fragt nach dem Empfänger',
    q('.card .task-label') && q('.card .task-label').textContent.indexOf('Wem?') === 0,
    q('.card .task-label') ? q('.card .task-label').textContent : 'keine');
  pruefe('E10 und sie bietet Formen zur Wahl', alle('[data-gramopt]').length >= 3,
    String(alle('[data-gramopt]').length));
  pruefe('E11 die Lösung ist die Dativform',
    gramQ && gramQ.loesung === grammForm(gramQ.wort.ru, gramQ.wort.art, 'dat'),
    gramQ ? gramQ.wort.ru + ' → ' + gramQ.loesung : 'keine Frage');

  // ── F · Der Jubel behauptet keine Zahl, die er nicht kennt ─
  var festeZahl = JUBEL.regel.filter(function (paar) {
    return /zehn|ZEHN|elf|ELF/.test(paar[0] + paar[1]);
  });
  pruefe('F1 der Regel-Jubel nennt keine ausgeschriebene Zahl',
    festeZahl.length === 0, festeZahl.map(function (p) { return p[0]; }).join(' | '));

  // ── G · Die Betonung hält Schritt ─────────────────────────
  // Neue Sätze bringen keine neuen Wörter mit, aber die Prüfung kostet nichts
  // und würde es merken.
  var ohne = ALL_VOCAB.filter(function (v) {
    var n = 0;
    for (var k = 0; k < v.ru.length; k++) if (VOKALE.indexOf(v.ru.charAt(k)) !== -1) n++;
    return n > 1 && v.ru.indexOf('ё') === -1 && !BETONUNG[v.ru];
  });
  pruefe('G1 fast jedes mehrsilbige Wort trägt eine Betonung',
    ohne.length <= 5, ohne.map(function (v) { return v.ru; }).slice(0, 8).join(' '));
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

writeFileSync(BAU + '/t-lehrplan.html', testseite(html, test));
console.log('Lehrplan-Testseite geschrieben');
