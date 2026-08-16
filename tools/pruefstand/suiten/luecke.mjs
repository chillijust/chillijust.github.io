// Prüft die Kontext-Lücke: Ein Wort wird im Satz gelernt, nicht daneben.
//
// Der Kern: **Die Lücke darf nur dort aufgehen, wo der Satz lesbar ist.** Ein
// Satz voller unbekannter Wörter erklärt nichts, er verwirrt. Und die Ablenker
// müssen andere Formen *desselben* Wortes sein — sonst ist es wieder eine
// Vokabelfrage mit einem Satz drumherum.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

// **Genau ein Wort fällig machen.** Steht alles auf demselben Stand, zieht
// «waehleWort» die frühen Wörter aus dem Lehrplan — und das sind Pronomen,
// die gar keine anderen Formen haben. Eine Suite, die darauf wartet, wartet
// ewig, und das sagt nichts über die Lücke aus.
// **Die Lücke lebt auf der Satzstufe** (ADR 0088). Darüber wird in «Lernsets»
// und «Freestyle» nur noch geschrieben — eine Lücke, die nicht meistern kann,
// hielte das Wort dort nur auf. Der Vorgabewert ist darum SATZ_STUFE und nicht
// mehr BOX_MAX; auf der Endstufe käme nie wieder eine Lücke.
function nurDieses(ru, stufe) {
  ALL_VOCAB.forEach(function (v) {
    state.boxes[v.id] = BOX_MAX;
    state.lastSeen[v.id] = Date.now();
  });
  state.boxes[ru] = stufe === undefined ? SATZ_STUFE : stufe;
  state.lastSeen[ru] = 0;
}

// Eine Lücke erzwingen: so lange neu bauen, bis eine kommt. Der Modus wird
// ausgelost, darum ist Suchen ehrlicher als Nachhelfen.
function holLuecke(versuche) {
  for (var i = 0; i < (versuche || 300); i++) {
    uebQ = null;
    uebZuruecksetzen();
    uebQ = buildQuestion();
    if (uebQ && uebQ.mode === 'luecke') return uebQ;
  }
  return null;
}

try {
  tutEnde();

  // ── A · Die Bausteine ─────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = 0; });

  pruefe('A1 ein Wort im Satz findet seine Stelle', (function () {
    var v = VOKABEL['книга'];
    return !!v && lueckeStellen(v).length > 0;
  })());
  pruefe('A2 die Stelle nennt die gebeugte Form, nicht die Grundform', (function () {
    var st = lueckeStellen(VOKABEL['книга']);
    return st.some(function (x) { return x.form === 'книгу'; });
  })(), lueckeStellen(VOKABEL['книга']).map(function (x) { return x.form; }).join(','));

  // Ein Wort als Teilzeichenkette darf nicht zählen — «он» steckt in «она».
  pruefe('A3 nur ganze Wörter zählen',
    lueckeFindet('Она читает.', 'она') === true &&
    lueckeFindet('Она читает.', 'он') === false);
  pruefe('A4 groß am Satzanfang zählt mit', lueckeFindet('Она читает.', 'Она') === true);

  // Der Strich steht an der Stelle des Wortes, der Rest bleibt.
  var text = lueckeText('Я читаю книгу.', 'книгу');
  pruefe('A5 die Lücke ersetzt genau das Wort',
    text.indexOf('книгу') === -1 && text.indexOf('Я читаю') === 0 && text.indexOf('.') !== -1, text);
  pruefe('A6 und nur das erste Vorkommen',
    (lueckeText('Да, да.', 'да').match(/——/g) || []).length === 1,
    lueckeText('Да, да.', 'да'));

  // ── B · Die Ablenker ──────────────────────────────────────
  // Andere Formen desselben Wortes — das ist der ganze Gewinn.
  var ab = lueckeAblenker(VOKABEL['книга'], 'книгу');
  pruefe('B1 es gibt drei', ab.length === 3, ab.join(','));
  pruefe('B2 keiner ist die richtige Form', ab.indexOf('книгу') === -1, ab.join(','));
  pruefe('B3 keiner kommt doppelt', (function () {
    var g = {};
    return ab.every(function (f) { if (g[f]) return false; g[f] = 1; return true; });
  })(), ab.join(','));
  pruefe('B4 alle gehören zum selben Wort', ab.every(function (f) {
    return f.indexOf('книг') === 0;
  }), ab.join(','));
  var abV = lueckeAblenker(VOKABEL['читать'], 'читаю');
  pruefe('B5 auch ein Verb bekommt Formen, keine anderen Wörter',
    abV.length >= 2 && abV.every(function (f) { return f.indexOf('чит') === 0; }), abV.join(','));

  // ── C · Wann sie aufgeht ──────────────────────────────────
  // Nur bei sitzenden Wörtern und lesbaren Sätzen.
  state = defaultState();
  ansichtenZuruecksetzen();
  uebModus = 'freestyle'; uebThema = 'Alle';
  setTab('freestyle');
  nurDieses('книга', SATZ_STUFE - 1);
  pruefe('C1 unter der Satzstufe gibt es keine Lücke', holLuecke(150) === null);

  nurDieses('книга');
  var qq = holLuecke();
  pruefe('C2 über der Satzstufe schon', !!qq && qq.word.id === 'книга',
    qq ? qq.word.id : 'keine');

  // Im Lesemodus geht es um Buchstaben, nicht um Formen.
  uebLesen = true;
  pruefe('C3 im Lesemodus nicht', holLuecke(150) === null);
  uebLesen = false;

  // Ein Wort ohne andere Formen bekommt keine Lücke — zwischen «он» und «он»
  // gäbe es nichts zu wählen.
  nurDieses('он');
  pruefe('C4 ein unveränderliches Wort bekommt keine',
    holLuecke(150) === null && lueckeStellen(VOKABEL['он']).length > 0);

  // ── D · Der Satz muss lesbar sein ─────────────────────────
  // **Die eigentliche Regel.** Ein Satz mit unbekannten Wörtern darf nie eine
  // Lücke tragen, auch wenn das gefragte Wort längst sitzt.
  state = defaultState();
  ansichtenZuruecksetzen();
  var wort = VOKABEL['книга'];
  state.boxes[wort.id] = BOX_MAX;
  var stellenOhne = lueckeStellen(wort);
  pruefe('D1 ohne freie Sätze keine Stelle', stellenOhne.length === 0,
    String(stellenOhne.length));
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = SATZ_STUFE; });
  var stellenMit = lueckeStellen(wort);
  pruefe('D2 mit freien Sätzen schon', stellenMit.length > 0);
  pruefe('D3 und jede Stelle ist wirklich frei',
    stellenMit.every(function (x) { return satzFrei(x.satz); }));

  // ── E · Die Aufgabe am Schirm ─────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  uebModus = 'freestyle'; uebThema = 'Alle';
  setTab('freestyle');
  nurDieses('книга');
  var qz = holLuecke();
  pruefe('E1 eine Lücke ist zu bekommen', !!qz);
  if (qz) {
    uebPhase = 'ask';
    renderUeben();
    // Die Kopfzeile der Übung trägt auch ein «task-label» — gefragt ist das
    // in der Karte, nicht das erste im Dokument.
    pruefe('E2 die Frage nennt ihren Zweck',
      q('.card .task-label').textContent.indexOf('Form') !== -1,
      q('.card .task-label').textContent);
    pruefe('E3 der Satz steht mit Lücke da',
      q('.word').textContent.indexOf('——') !== -1 &&
      q('.word').textContent.indexOf(qz.form) === -1, q('.word').textContent);
    pruefe('E4 die deutsche Fassung hilft', !!q('.luecke-de') &&
      q('.luecke-de').textContent === qz.satz.de);
    // **Der Hörknopf schweigt, solange die Lücke offen ist** — er läse den
    // Satz samt fehlendem Wort vor, also die Antwort.
    pruefe('E4b und nichts verrät die Lösung', !q('.card [data-say]'),
      q('.card [data-say]') ? q('.card [data-say]').dataset.say : '');
    pruefe('E5 vier Formen zur Wahl', alle('.option').length === 4,
      String(alle('.option').length));
    pruefe('E6 alle kyrillisch ausgezeichnet',
      alle('.option').every(function (b) { return b.classList.contains('cyr'); }));
    pruefe('E7 die richtige ist dabei',
      alle('.option').some(function (b) { return b.textContent === qz.form; }),
      alle('.option').map(function (b) { return b.textContent; }).join(','));

    // Richtig gewählt zählt wie jede andere Antwort.
    var vorher = state.boxes[qz.word.id];
    state.boxes[qz.word.id] = 2;
    uebPicked = qz.form;
    uebPruefen();
    pruefe('E8 richtig wird als richtig gewertet', uebCorrect === true);
    pruefe('E9 und zählt auf den Leitner-Stand', state.boxes[qz.word.id] === 3,
      String(state.boxes[qz.word.id]));
    pruefe('E10 nach der Auflösung steht der ganze Satz da',
      !!q('.luecke-satz') && q('.luecke-satz').textContent === qz.satz.ru,
      q('.luecke-satz') ? q('.luecke-satz').textContent : 'fehlt');
    pruefe('E11 die richtige Kachel ist markiert', !!q('.option.right') &&
      q('.option.right').textContent === qz.form);
  }

  // Falsch gewählt: die Lösung nennt die Form **und** das Wort, zu dem sie
  // gehört — eine Endung allein erklärt nichts.
  nurDieses('книга');
  var qf = holLuecke();
  if (qf) {
    uebPhase = 'ask';
    uebPicked = alle_falsch(qf);
    uebPruefen();
    pruefe('F1 falsch wird als falsch gewertet', uebCorrect === false);
    pruefe('F2 die Auflösung nennt Form und Grundwort',
      main.textContent.indexOf(qf.form) !== -1 &&
      main.textContent.indexOf(qf.word.de) !== -1);
    pruefe('F3 die gewählte Kachel ist als falsch markiert', !!q('.option.wrong'));
  } else {
    pruefe('F1 falsch wird als falsch gewertet', false, 'keine Lücke zu bekommen');
  }
  function alle_falsch(qx) {
    var f = qx.options.filter(function (o) { return o.id !== qx.form; })[0];
    return f ? f.id : 'xxx';
  }

  // ── G · Aufdecken bleibt Aufdecken ────────────────────────
  nurDieses('книга');
  var qa = holLuecke();
  if (qa) {
    uebPhase = 'ask';
    renderUeben();
    var vor = state.boxes[qa.word.id];
    q('#uebReveal').click();
    pruefe('G1 Aufdecken stuft zurück wie überall',
      state.boxes[qa.word.id] === Math.max(0, vor - 1), vor + '→' + state.boxes[qa.word.id]);
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

writeFileSync(BAU + '/t-luecke.html', testseite(html, test));
console.log('Lücken-Testseite geschrieben');
