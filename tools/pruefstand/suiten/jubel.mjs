// Prüft, dass ein Jubel dem ersten Mal gehört: Was einmal geschafft war und
// nach einem Rückfall repariert wird, feiert nicht erneut.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }

// Die Fenster mitzählen, statt sie anzusehen.
var echterJubel = jubelZeigen;
var gezaehlt = [];
function zaehlen(an) { gezaehlt = []; jubelZeigen = function (a) { gezaehlt.push(a); }; }
function zurueck() { jubelZeigen = echterJubel; }

// Eine Antwort in «Lernsets»/«Freestyle» durchs echte uebPruefen() schicken.
function antworte(wort, richtig) {
  uebNext(true);
  if (!uebQ) return false;
  uebQ.word = wort;
  uebQ.mode = 'choice';
  uebPicked = richtig ? wort.id : '—keins—';
  uebPruefen();
  return true;
}
function setVoll(nr, stufe) {
  LERNSETS[nr].woerter.forEach(function (v) { state.boxes[v.id] = stufe; });
}

try {
  // ── A · Die Merkliste selbst ──────────────────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  pruefe('A1 ein frischer Stand hat noch nichts gefeiert',
    Object.keys(state.gefeiert).length === 0);
  pruefe('A2 eine unbekannte Marke gilt als offen', !jubelSchon('set:0'));
  zaehlen();
  jubelEinmal('set:0', 'set', { n: 1, m: 1, s: 'Satz' });
  pruefe('A3 der erste Aufruf feiert', gezaehlt.length === 1, gezaehlt.join());
  jubelEinmal('set:0', 'set', { n: 1, m: 1, s: 'Satz' });
  pruefe('A4 der zweite nicht mehr', gezaehlt.length === 1, gezaehlt.join());
  pruefe('A5 und die Marke steht im Stand', jubelSchon('set:0'));
  zurueck();

  // ── B · Ein Set: einmal feiern, nicht zweimal ─────────────
  state = defaultState(); ansichtenZuruecksetzen();
  uebModus = 'lernsets'; uebAuswahl = 0; setTab('lernsets');
  // Elf von zwölf Wörtern sitzen; das letzte macht das Set voll.
  var woerter = LERNSETS[0].woerter;
  setVoll(0, SATZ_STUFE);
  var letztes = woerter[woerter.length - 1];
  state.boxes[letztes.id] = SATZ_STUFE - 1;
  uebGeschafftesSet = null;
  antworte(letztes, true);
  pruefe('B1 das volle Set meldet sich', uebGeschafftesSet === 0, String(uebGeschafftesSet));
  zaehlen();
  uebNext(true);
  pruefe('B2 und das Fenster geht auf', gezaehlt.join() === 'set', gezaehlt.join());
  zurueck();
  pruefe('B3 danach ist die Marke gesetzt', jubelSchon('set:0'));

  // Ein Wort fällt zurück — genau der Fall aus dem Ticket.
  var gefallen = woerter[3];
  state.boxes[gefallen.id] = SATZ_STUFE - 1;
  pruefe('B4 damit ist das Set wieder offen', !setGeschafft(0) && aktuellesSet() === 0);
  uebGeschafftesSet = null;
  antworte(gefallen, true);
  pruefe('B5 ein einzelnes repariertes Wort feiert NICHT',
    uebGeschafftesSet === null, String(uebGeschafftesSet));
  zaehlen();
  uebNext(true);
  pruefe('B6 und öffnet auch kein Fenster', gezaehlt.length === 0, gezaehlt.join());
  zurueck();

  // Das nächste Set feiert dagegen sehr wohl.
  setVoll(0, SATZ_STUFE); setVoll(1, SATZ_STUFE);
  var l1 = LERNSETS[1].woerter[LERNSETS[1].woerter.length - 1];
  state.boxes[l1.id] = SATZ_STUFE - 1;
  uebGeschafftesSet = null;
  antworte(l1, true);
  pruefe('B7 ein neues Set feiert weiterhin', uebGeschafftesSet === 1, String(uebGeschafftesSet));

  // ── C · Themen ────────────────────────────────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  uebModus = 'freestyle'; setTab('freestyle');
  var thema = Object.keys(VOCAB_THEMES)[0];
  var themaWoerter = ALL_VOCAB.filter(function (v) { return v.theme === thema; });
  themaWoerter.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  var tw = themaWoerter[0];
  state.boxes[tw.id] = BOX_MAX - 1;
  zaehlen();
  antworte(tw, true);
  pruefe('C1 das volle Thema feiert', gezaehlt.join() === 'thema', gezaehlt.join());
  zurueck();
  // Ein Wort fällt und kommt zurück.
  var tw2 = themaWoerter[2];
  state.boxes[tw2.id] = BOX_MAX - 1;
  zaehlen();
  antworte(tw2, true);
  pruefe('C2 ein aufgefrischtes Wort feiert nicht noch einmal',
    gezaehlt.length === 0, gezaehlt.join());
  zurueck();
  pruefe('C3 ein anderes Thema hat seine eigene Marke',
    !jubelSchon('thema:' + Object.keys(VOCAB_THEMES)[1]));

  // ── D · Alphabet ──────────────────────────────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  var bu = ALPHABET[5];
  state.abcBox[bu[1]] = BOX_MAX - 1;
  abcAnsicht = 'ueben'; abcQ = null; setTab('buchstaben');
  zaehlen();
  abcQ.b = bu; abcQ.modus = 'wahl'; abcPicked = bu[1]; abcPruefen();
  pruefe('D1 das volle Alphabet feiert', gezaehlt.join() === 'abc', gezaehlt.join());
  zurueck();
  var bu2 = ALPHABET[9];
  state.abcBox[bu2[1]] = BOX_MAX - 1;
  abcQ = null; renderBuchstaben();
  zaehlen();
  abcQ.b = bu2; abcQ.modus = 'wahl'; abcPicked = bu2[1]; abcPruefen();
  pruefe('D2 ein aufgefrischter Buchstabe nicht noch einmal',
    gezaehlt.length === 0, gezaehlt.join());
  zurueck();

  // ── E · Grammatik ─────────────────────────────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  GRAMMATIK.forEach(function (x) { state.gramBox[x.id] = BOX_MAX; state.gramSeen[x.id] = 0; });
  var reg = GRAMMATIK[2];
  state.gramBox[reg.id] = BOX_MAX - 1;
  gramBaustein = reg.id; gramQ = null; setTab('grammatik');
  zaehlen();
  gramQ.baustein = reg.id; gramQ.tippen = false; gramPicked = gramQ.loesung; gramPruefen();
  pruefe('E1 alle Regeln feiern', gezaehlt.join() === 'regel', gezaehlt.join());
  zurueck();
  var reg2 = GRAMMATIK[5];
  state.gramBox[reg2.id] = BOX_MAX - 1;
  gramBaustein = reg2.id; gramQ = null; renderGrammatik();
  zaehlen();
  gramQ.baustein = reg2.id; gramQ.tippen = false; gramPicked = gramQ.loesung; gramPruefen();
  pruefe('E2 eine aufgefrischte Regel nicht noch einmal',
    gezaehlt.length === 0, gezaehlt.join());
  zurueck();

  // ── F · Power-Training feiert weiter jedes Mal ────────────
  // Der leere Topf ist keine Auszeichnung, sondern eine erledigte Aufgabe —
  // sie kommt wieder, und dann darf sie auch wieder gefeiert werden.
  pruefe('F1 der leere Topf trägt keine Marke',
    Object.keys(state.gefeiert).filter(function (k) {
      return k.indexOf('power') === 0;
    }).length === 0);

  // ── G · Was schon geschafft war, gilt als gefeiert ────────
  // Ein Stand von vor dieser Liste, oder eine eingespielte Sicherung.
  state = defaultState(); ansichtenZuruecksetzen();
  setVoll(0, SATZ_STUFE);
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  pruefe('G1 vor dem Nachtragen ist nichts vermerkt', !jubelSchon('set:0') && !jubelSchon('abc'));
  jubelNachtragen();
  pruefe('G2 danach das geschaffte Set', jubelSchon('set:0'));
  pruefe('G3 und das volle Alphabet', jubelSchon('abc'));
  pruefe('G4 aber nicht, was offen ist', !jubelSchon('set:1') && !jubelSchon('regel'));
  // Und der Rückfall danach feiert nicht.
  state.boxes[LERNSETS[0].woerter[2].id] = SATZ_STUFE - 1;
  uebModus = 'lernsets'; uebAuswahl = 0; setTab('lernsets');
  uebGeschafftesSet = null;
  antworte(LERNSETS[0].woerter[2], true);
  pruefe('G5 ein nachgetragenes Set feiert nicht erneut',
    uebGeschafftesSet === null, String(uebGeschafftesSet));

  // ── H · Der Stand überlebt Speichern und Laden ────────────
  var kopie = mergeState(JSON.parse(JSON.stringify(state)));
  pruefe('H1 die Marken überstehen das Verschmelzen', !!kopie.gefeiert['set:0']);
  var mitMuell = JSON.parse(JSON.stringify(state));
  mitMuell.gefeiert['set:999'] = 1;
  mitMuell.gefeiert['thema:Gibt es nicht'] = 1;
  var sauber = mergeState(mitMuell);
  pruefe('H2 Marken auf verschwundene Sets fallen weg',
    !sauber.gefeiert['set:999'] && !sauber.gefeiert['thema:Gibt es nicht'] &&
    !!sauber.gefeiert['set:0'], Object.keys(sauber.gefeiert).join());
  var leer = mergeState({ boxes: {} });
  pruefe('H3 ein Stand ohne Liste bekommt eine leere',
    leer.gefeiert && Object.keys(leer.gefeiert).length === 0);

  // ── I · Zurücksetzen räumt die Liste mit ──────────────────
  pruefe('I1 ein frischer Stand ist wieder leer',
    Object.keys(defaultState().gefeiert).length === 0);
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

writeFileSync(BAU + '/t-jubel.html', testseite(html, test));
console.log('Jubel-Testseite geschrieben');
