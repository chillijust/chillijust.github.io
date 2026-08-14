// Prüft die Betonungszeichen: Ohne sie lässt sich ein russisches Wort nicht
// aussprechen — молоко́ klingt «malakó», nicht «molokó».
//
// Zwei Regeln tragen alles:
//   1. **Gespeichert wird eine Zahl, nie ein zweites Mal das Wort.** Die
//      Kennung im Lernstand *ist* das russische Wort; eine zweite Schreibweise
//      könnte einen Tippfehler tragen und damit einen Lernstand löschen.
//   2. **Gezeigt wird sie, verglichen nie.** Wer das Zeichen tippt oder nicht,
//      hat dieselbe Antwort gegeben.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

// Dateiprüfung: In den Wortlisten selbst darf **kein** Betonungszeichen stehen.
// Zwei Blöcke tragen bewusst welche und stehen darum am Ende: BETONUNG kann
// gar nichts anderes, und die Prüfwörter in ORTHO leben davon. Gelesen wird
// bis zum ersten der beiden — welcher zuerst kommt, ist dann egal.
const daten = html.slice(html.indexOf('DATEN:START'), html.indexOf('DATEN:ENDE'));
const grenze = Math.min.apply(null, ['var BETONUNG', 'var ORTHO']
  .map((m) => daten.indexOf(m)).filter((i) => i > 0));
const wortlisten = daten.slice(0, grenze);
const zeichen = (wortlisten.match(/́/g) || []).length;
console.log('Betonungszeichen in den Wortlisten:', zeichen,
  zeichen === 0 ? '(keine · richtig)' : '(unerwartet!)');
if (zeichen !== 0) {
  throw new Error('Im Wortschatz stehen ' + zeichen + ' Betonungszeichen — sie gehören in BETONUNG');
}

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
var MARKE = '́';

try {
  tutEnde();
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Das Zeichen sitzt hinter dem richtigen Vokal ──────
  pruefe('A1 молоко trägt es auf dem dritten о',
    betontesWort('молоко') === 'моло' + 'к' + 'о' + MARKE, betontesWort('молоко'));
  pruefe('A2 книга auf dem ersten', betontesWort('книга') === 'кни' + MARKE + 'га',
    betontesWort('книга'));
  pruefe('A3 ein Wort ohne Angabe bleibt unberührt',
    betontesWort('да') === 'да' && betontesWort('дом') === 'дом');
  pruefe('A4 ein Wort mit ё auch — dort ist die Betonung eindeutig',
    betontesWort('ёлка') === 'ёлка' || !VOKABEL['ёлка']);
  pruefe('A5 mehrere Wörter bekommen mehrere Zeichen',
    (betontesWort('добрый день').match(/́/g) || []).length === 2,
    betontesWort('добрый день'));

  // **Die wichtigste Prüfung:** Nimmt man das Zeichen weg, steht wieder genau
  // das Wort da. Sonst wäre die Anzeige eine andere Vokabel.
  var kaputt = [];
  ALL_VOCAB.forEach(function (v) {
    if (betontesWort(v.ru).replace(/́/g, '') !== v.ru) kaputt.push(v.ru);
  });
  pruefe('A6 ohne Zeichen steht wieder genau das Wort da', kaputt.length === 0,
    kaputt.slice(0, 5).join(' '));

  // Und jedes Zeichen steht hinter einem Vokal, nirgends hinter einem Konsonanten.
  var schief = [];
  ALL_VOCAB.forEach(function (v) {
    var b = betontesWort(v.ru);
    for (var i = 1; i < b.length; i++) {
      if (b.charAt(i) === MARKE && VOKALE.indexOf(b.charAt(i - 1)) === -1) schief.push(v.ru);
    }
  });
  pruefe('A7 jedes Zeichen steht hinter einem Vokal', schief.length === 0,
    schief.slice(0, 5).join(' '));

  // ── B · Die Kennung bleibt unberührt ──────────────────────
  // **Der teuerste Fehler wäre hier.** Stünde die Betonung im Wort selbst,
  // verlöre jeder bestehende Lernstand seinen Anker.
  pruefe('B1 kein Wort im Wortschatz trägt ein Zeichen',
    ALL_VOCAB.every(function (v) { return v.ru.indexOf(MARKE) === -1; }));
  pruefe('B2 kein Satz trägt eines',
    SENTENCES.every(function (s) { return s.ru.indexOf(MARKE) === -1; }));
  pruefe('B3 die Betonungsliste kennt nur bekannte Wörter',
    Object.keys(BETONUNG).every(function (w) { return !!VOKABEL[w]; }));
  pruefe('B4 und jede Angabe zeigt auf einen vorhandenen Vokal', (function () {
    return Object.keys(BETONUNG).every(function (w) {
      var n = 0;
      for (var i = 0; i < w.length; i++) if (VOKALE.indexOf(w.charAt(i)) !== -1) n++;
      var l = typeof BETONUNG[w] === 'number' ? [BETONUNG[w]] : BETONUNG[w];
      return l.every(function (x) { return x >= 1 && x <= n; });
    });
  })());

  // ── C · Gezeigt, nie verglichen ───────────────────────────
  pruefe('C1 normalize wirft das Zeichen weg',
    normalize('моло' + 'к' + 'о' + MARKE) === normalize('молоко'));
  pruefe('C2 eine Antwort mit Zeichen zählt wie eine ohne',
    normalize('кни' + MARKE + 'га') === 'книга');
  pruefe('C3 der Hörknopf spricht ohne Zeichen',
    hoerknopf(betontesWort('молоко'), 'ru').indexOf(MARKE) === -1,
    hoerknopf(betontesWort('молоко'), 'ru'));
  pruefe('C4 die Hörzeile auch',
    hoerzeile(betontesWort('книга'), 'Buch').indexOf(MARKE) === -1);

  // ── D · Die Einstellung ───────────────────────────────────
  pruefe('D1 die Vorgabe ist «beim Lernen»', defaultSettings().betonung === 'lernen');
  state.settings.betonung = 'nie';
  pruefe('D2 «nie» zeigt nichts', ruAnzeige('молоко') === 'молоко');
  state.settings.betonung = 'immer';
  pruefe('D3 «immer» zeigt auch bei gemeistertem Wort', (function () {
    state.boxes['молоко'] = BOX_MAX;
    return ruAnzeige('молоко').indexOf(MARKE) !== -1;
  })());
  state.settings.betonung = 'lernen';
  state.boxes['молоко'] = 0;
  pruefe('D4 «beim Lernen» zeigt am Anfang', ruAnzeige('молоко').indexOf(MARKE) !== -1);
  state.boxes['молоко'] = BOX_MAX - 1;
  pruefe('D5 und blendet aus, sobald es fast sitzt',
    ruAnzeige('молоко') === 'молоко', ruAnzeige('молоко'));
  pruefe('D6 die Einstellung steht auf dem Lernweg-Reiter', (function () {
    einstReiter = 'lernweg';
    setTab('einstellungen');
    return alle('[data-wahltext="betonung"]').length === 3;
  })(), String(alle('[data-wahltext="betonung"]').length));
  alle('[data-wahltext="betonung"]').filter(function (b) {
    return b.dataset.wert === 'immer';
  })[0].click();
  pruefe('D7 ein Tipp stellt um', state.settings.betonung === 'immer');
  state.settings.betonung = 'lernen';

  // Ein Stand von vor 1.7.0 kennt die Einstellung nicht und bekommt die Vorgabe.
  pruefe('D8 ein alter Stand bekommt die Vorgabe',
    mergeState({ settings: {} }).settings.betonung === 'lernen');

  // ── E · Am Schirm ─────────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) {
    state.boxes[v.id] = 0;
    state.lastSeen[v.id] = Date.now();
  });
  state.lastSeen['молоко'] = 0;
  uebModus = 'freestyle'; uebThema = 'Alle';
  setTab('freestyle');
  var gefunden = null;
  for (var i = 0; i < 200 && !gefunden; i++) {
    uebQ = null; uebZuruecksetzen(); uebQ = buildQuestion();
    if (uebQ && uebQ.mode === 'mc-de' && uebQ.word.id === 'молоко') gefunden = uebQ;
  }
  pruefe('E1 eine russische Frage ist zu bekommen', !!gefunden);
  if (gefunden) {
    renderUeben();
    pruefe('E2 die Frage zeigt die Betonung',
      q('.word').textContent.indexOf(MARKE) !== -1, q('.word').textContent);
    pruefe('E3 der Hörknopf daneben nicht',
      !q('.word [data-say]') || q('.word [data-say]').dataset.say.indexOf(MARKE) === -1);
  }
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

writeFileSync(BAU + '/t-betonung.html', testseite(html, test));
console.log('Betonungs-Testseite geschrieben');
