// Prüft zwei Tickets: die Eingabetaste gibt ab, die Chili springt in den Auswahlknopf.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
function schreibe(el, wert) {
  el.value = wert;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
// Die Eingabetaste der Gerätetastatur — so kommt sie im Browser an.
function enter(el, umschalt) {
  var e = new KeyboardEvent('keydown', {
    key: 'Enter', bubbles: true, cancelable: true, shiftKey: !!umschalt
  });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

try {
  // ── A · «Tippen» ──────────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.settings.tippenStufe = 2;
  tippenModus = 'lernen';
  setTab('tippen');
  pruefe('A1 das Feld nennt der Taste ihren Zweck',
    q('#tInput').getAttribute('enterkeyhint') === 'go',
    q('#tInput').getAttribute('enterkeyhint'));
  schreibe(q('#tInput'), tWord.ru);
  var verhindert = enter(q('#tInput'));
  pruefe('A2 die Eingabetaste gibt ab', tResult === 'right', String(tResult));
  pruefe('A3 und der Umbruch wird unterdrückt', verhindert === true);
  pruefe('A4 die Prüfzeile steht da', !!q('.pruefzeile'));

  // Ohne Eingabe passiert nichts — der Knopf ist gesperrt.
  tippe(q('#tNext'));
  pruefe('A5 danach ist wieder gefragt', tResult === null && !!q('#tInput'));
  // «Prüfen» ist in «Tippen» nie gesperrt — eine leere Abgabe zählt dort als
  // Fehler. Die Taste liegt beim Schreiben zu nah, um das zu riskieren.
  enter(q('#tInput'));
  pruefe('A6 leer bleibt leer', tResult === null, String(tResult));
  pruefe('A7 der Knopf selbst wertet weiterhin',
    (function () { tippe(q('#tCheck')); return tResult === 'wrong'; })(), String(tResult));

  // ── B · «Übersetzen» ──────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  SENTENCES.forEach(function (sz) { state.satzBox[sz.ru] = 3; });
  trLevel = 1; trDir = 'de-ru'; trModus = 'lernen';
  var n = 0;
  while (n++ < 200 && (!trTask || trTask.art !== 'tippen' || !trTask.loesungRu)) {
    trTask = null;
    buildTransTask();
  }
  setTab('uebersetzen');
  pruefe('B0 eine Schreibaufgabe steht da', !!q('#trInput'));
  pruefe('B1 auch hier die Beschriftung',
    q('#trInput').getAttribute('enterkeyhint') === 'go');
  schreibe(q('#trInput'), trTask.solution);
  pruefe('B2 der Abgabeknopf ist offen', !q('#trConfirm').disabled);
  var v2 = enter(q('#trInput'));
  pruefe('B3 die Eingabetaste prüft', trPhase === 'feedback' && trCorrect === true,
    trPhase + '/' + trCorrect);
  pruefe('B4 kein Zeilenumbruch', v2 === true);

  // Mit Umschalt bleibt der Umbruch möglich — dann darf sie nicht abgeben.
  trEingabe = ''; trPhase = 'ask'; trCorrect = null; trRevealed = false;
  trTask = null;
  n = 0;
  while (n++ < 200 && (!trTask || trTask.art !== 'tippen' || !trTask.loesungRu)) {
    trTask = null;
    buildTransTask();
  }
  renderUebersetzen();
  schreibe(q('#trInput'), trTask.solution);
  var v3 = enter(q('#trInput'), true);
  pruefe('B5 mit Umschalt gibt sie nicht ab', trPhase === 'ask', trPhase);
  pruefe('B6 und der Umbruch bleibt erlaubt', v3 === false);

  // ── C · «Grammatik» ───────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  GRAMMATIK.forEach(function (b) {
    state.gramSeen[b.id] = Date.now();
    state.gramBox[b.id] = SATZ_STUFE;
  });
  gramWahl = 'akkusativ';
  gramBaustein = null; gramQ = null;
  setTab('grammatik');
  pruefe('C0 eine Schreibaufgabe steht da', !!q('#gramInput'));
  pruefe('C1 mit Beschriftung', q('#gramInput').getAttribute('enterkeyhint') === 'go');
  schreibe(q('#gramInput'), gramQ.loesung);
  enter(q('#gramInput'));
  pruefe('C2 die Eingabetaste prüft', gramPhase === 'feedback' && gramCorrect === true,
    gramPhase + '/' + gramCorrect);

  // ── D · Power-Training ────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.filter(function (v) {
    return v.ru.length >= 4 && v.ru.indexOf(' ') === -1;
  }).slice(0, PT_WOERTER).forEach(function (v) {
    state.boxes[v.id] = SATZ_STUFE - 1;
    state.patzer[v.id] = Date.now();
  });
  setTab('power');
  ptSatz.forEach(function (e) { e.treffer = 4; });
  ptQ = null; ptNaechstes(); renderPower();
  pruefe('D0 eine Schreibaufgabe steht da', !!q('#ptInput'), ptQ && ptQ.stufe);
  pruefe('D1 mit Beschriftung', q('#ptInput').getAttribute('enterkeyhint') === 'go');
  schreibe(q('#ptInput'), ptQ.wort.ru);
  enter(q('#ptInput'));
  pruefe('D2 die Eingabetaste prüft', ptPhase === 'feedback' && ptCorrect === true,
    ptPhase + '/' + ptCorrect);

  // ── E · Im Meldeblatt nicht ───────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('freestyle');
  tippe(q('#meldeKnopf'));
  q('#meldeText').value = 'Erste Zeile';
  var v5 = enter(q('#meldeText'));
  pruefe('E1 im Meldeblatt bleibt der Umbruch', v5 === false);
  pruefe('E2 und nichts wird gespeichert', tickets.length === 0, String(tickets.length));
  tippe(q('#meldeAbbruch'));

  // ── F · Die Chili im Auswahlknopf ─────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.slice(0, 40).forEach(function (v) { state.boxes[v.id] = 2; });
  setTab('freestyle');
  var knopf = q('#filterKnopf');
  pruefe('F1 der Knopf trägt sein Zeichen in einer Hülle',
    !!q('#filterZeichen') && !!q('#filterZeichen svg'));
  pruefe('F2 und einen Platz für die Figur', !!q('#chiliFilter'));
  pruefe('F3 zugeklappt steht sie nicht darin', !q('#chiliFilter #chiliBuehne'));

  tippe(knopf);
  pruefe('F4 aufgeklappt springt sie hinein', !!q('#chiliFilter #chiliBuehne'));
  pruefe('F5 der Knopf weiß es', knopf.classList.contains('mit-chili'));
  pruefe('F6 das Zeichen weicht',
    knopf.getAttribute('aria-expanded') === 'true');
  pruefe('F7 der Menüknopf trägt sie derweil nicht',
    !q('#menuKnopf').classList.contains('mit-chili'));

  filterSetzen(false);
  pruefe('F8 zugeklappt kommt sie zurück', !q('#chiliFilter #chiliBuehne'));
  pruefe('F9 und der Knopf vergisst es', !knopf.classList.contains('mit-chili'));

  // Das Menü hat weiterhin Vorrang — beide zugleich gibt es nicht.
  tippe(q('#menuKnopf'));
  pruefe('F10 das Menü holt sie zu sich', !!q('#chiliKnopf #chiliBuehne'));
  pruefe('F11 und der Auswahlknopf ist leer', !q('#chiliFilter #chiliBuehne'));
  menuSetzen(false);

  // Wo es nichts zu wählen gibt, steht der Knopf gar nicht da.
  setTab('bilanz');
  pruefe('F12 ohne Auswahl kein Knopf', q('#filterKnopf').hidden === true);
  pruefe('F13 und die Figur steht anderswo', !q('#chiliFilter #chiliBuehne'));
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

const skript = '\n<script>\nwindow.addEventListener("error", function (e) { document.title = "SEITENFEHLER: " + e.message; });\nsetTimeout(function () {' + test + '}, 150);\n</scr' + 'ipt>\n';
writeFileSync(BAU + '/t-enter.html', html.replace('</body>', skript + '</body>'));
console.log('Enter-Testseite geschrieben');
