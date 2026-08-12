// Die App duzt. Diese Suite liest den sichtbaren Text der Oberfläche und
// sucht nach Höflichkeitsformen — mit einer kurzen, benannten Ausnahmeliste.
//
// Die Falle, um die es geht: «Sie» ist nicht immer die Anrede. «вы» heißt
// «ihr / Sie», «Sie schreibt einen Brief» ist она пишет, und «Sie sind
// männlich» steht über drei Wörtern. Eine pauschale Ersetzung würde den
// Lehrstoff beschädigen — darum prüft diese Suite den **gerenderten Text**
// und nennt jede Ausnahme beim Namen.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

// Was «Sie» heißen darf, ohne die Anrede zu sein. Jede Zeile ist eine bewusste
// Entscheidung, keine Bequemlichkeit.
var ERLAUBT = [
  'ihr / Sie',              // вы — Lehrstoff
  'euer / Ihr',             // ваш — Lehrstoff
  'Sie schreibt',           // она пишет — dritte Person, nicht die Anrede
  'Sie kocht',
  'Sie spricht',
  'Sie sind männlich',      // über папа, дедушка, дядя
  'Ihr Stamm ist der Infinitiv',
  'Sie stehen wieder in',   // über gefallene Buchstaben
  'Sie sammeln sich hier an',   // über die Sprachfakten
  'Sie liegen nur auf diesem Gerät'  // über die Tickets
];
function hoeflich(text) {
  var treffer = [];
  var muster = /[^.!?]*\b(Sie|Ihnen|Ihre|Ihrem|Ihren|Ihrer|Ihr)\b[^.!?]*/g;
  var m;
  while ((m = muster.exec(text)) !== null) {
    var satz = m[0].replace(/\s+/g, ' ');
    var ok = false;
    for (var i = 0; i < ERLAUBT.length; i++) {
      if (satz.indexOf(ERLAUBT[i]) !== -1) { ok = true; break; }
    }
    // Ein Fenster **um** die Fundstelle, nicht ab Satzanfang: Ohne Punkt im
    // Text wird der Treffer sonst hunderte Zeichen lang, und die Meldung
    // zeigt alles außer der Stelle, um die es geht.
    if (!ok) {
      var wo = m.index + m[0].indexOf(m[1]);
      treffer.push('…' + text.slice(Math.max(0, wo - 30), wo + 40).replace(/\s+/g, ' ') + '…');
    }
  }
  return treffer;
}

// Der Text der Oberfläche — gezielt aus den Behältern, die ihn tragen.
//
// Nicht «document.body.innerText»: Im kopflosen Browser gibt es kein Layout,
// und innerText liefert dann nur ein paar hundert Zeichen. Nicht
// «document.body.textContent»: Das nimmt das eingespritzte Prüfskript mit —
// und darin steht «Schreiben Sie das Wort.» als Beispiel. Beides sah grün aus
// und prüfte nichts.
function sichtbarerText() {
  var teile = [];
  ['#kopf', '#main', '#menuPanel', '#filterPanel', '#meldeBlatt', '#jubelBlatt']
    .forEach(function (sel) {
      var el = q(sel);
      if (el) teile.push(el.textContent || '');
    });
  return teile.join('\n');
}
function textVon(tun) {
  state = defaultState();
  ansichtenZuruecksetzen();
  tun();
  var t = sichtbarerText();
  if (t.length < 40) log.push('FAIL Textprüfung liest zu wenig [' + t.length + ']');
  return t;
}

try {
  // ── A · Die Prüfung prüft überhaupt etwas ─────────────────
  pruefe('A1 eine Höflichkeitsform wird gefunden',
    hoeflich('Schreiben Sie das Wort.').length === 1);
  pruefe('A2 eine erlaubte Stelle nicht',
    hoeflich('вы — ihr / Sie steht im Lehrplan.').length === 0);
  pruefe('A3 «sie» klein bleibt unberührt',
    hoeflich('Die Wörter, sie sitzen alle.').length === 0);

  // ── B · Jede Ansicht wird gelesen ─────────────────────────
  var orte = [
    ['Home', function () { setTab('home'); }],
    ['Lernsets', function () {
      ALL_VOCAB.slice(0, 30).forEach(function (v) { state.boxes[v.id] = 2; });
      setTab('lernsets'); uebNext(true);
    }],
    ['Lernsets leer', function () { setTab('lernsets'); uebLesen = true; renderUeben(); }],
    ['Tippen', function () {
      ALL_VOCAB.slice(0, 20).forEach(function (v) { state.boxes[v.id] = 3; });
      setTab('tippen');
    }],
    ['Tippen leer', function () { setTab('tippen'); }],
    ['Übersetzen', function () {
      ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
      setTab('uebersetzen');
    }],
    ['Übersetzen leer', function () { setTab('uebersetzen'); }],
    ['Buchstaben', function () { abcAnsicht = 'ueben'; abcQ = null; setTab('buchstaben'); }],
    ['Buchstaben Tafel', function () { abcAnsicht = 'tafel'; setTab('buchstaben'); }],
    ['Grammatik', function () {
      GRAMMATIK.forEach(function (x) { state.gramSeen[x.id] = 0; });
      gramBaustein = GRAMMATIK[0].id; gramQ = null; setTab('grammatik');
    }],
    ['Power leer', function () { setTab('power'); }],
    ['Bilanz', function () {
      ALL_VOCAB.slice(0, 40).forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
      state.streak = 4; state.bestStreak = 9; setTab('bilanz');
    }],
    ['Sicherung', function () { setTab('sicherung'); }],
    ['Tickets', function () { setTab('tickets'); }],
    ['Sprachfakten', function () { setTab('fakten'); }],
    ['Meldeblatt', function () { setTab('home'); meldeSetzen(true); }]
  ];
  orte.forEach(function (o, i) {
    var treffer = hoeflich(textVon(o[1]));
    pruefe('B' + (i + 1) + ' ' + o[0] + ' duzt', treffer.length === 0, treffer.join(' | '));
  });

  // Die Einstellungen haben vier Reiter — jeder wird gelesen.
  EINST_REITER.forEach(function (r, i) {
    var treffer = hoeflich(textVon(function () {
      setTab('einstellungen'); einstReiter = r.id; renderEinstellungen();
    }));
    pruefe('C' + (i + 1) + ' Einstellungen · ' + r.name + ' duzt',
      treffer.length === 0, treffer.join(' | '));
  });

  // ── D · Die Kommentare duzen ──────────────────────────────
  var schlimm = [];
  KOMMENTARE.forEach(function (k) {
    if (hoeflich(k[1]).length) schlimm.push(k[1]);
  });
  pruefe('D1 kein Kommentar siezt', schlimm.length === 0, schlimm.join(' | '));

  // ── E · Der Jubel auch ────────────────────────────────────
  var jubelSchlimm = [];
  Object.keys(JUBEL).forEach(function (anlass) {
    JUBEL[anlass].forEach(function (paar) {
      paar.forEach(function (t) { if (hoeflich(t).length) jubelSchlimm.push(t); });
    });
  });
  pruefe('E1 kein Jubeltext siezt', jubelSchlimm.length === 0, jubelSchlimm.join(' | '));

  // ── F · Der Lehrstoff bleibt unangetastet ─────────────────
  // Genau das ist die Gegenprobe: Hier **muss** «Sie» stehen bleiben.
  pruefe('F1 вы heißt weiterhin «ihr / Sie»', (function () {
    var v = ALL_VOCAB.filter(function (x) { return x.ru === 'вы'; })[0];
    return !!v && v.de.indexOf('Sie') !== -1;
  })());
  pruefe('F2 «Sie schreibt einen Brief» ist unverändert',
    SENTENCES.some(function (s) { return s.de === 'Sie schreibt einen Brief.'; }));
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

writeFileSync(BAU + '/t-anrede.html', testseite(html, test));
console.log('Anrede-Testseite geschrieben');
