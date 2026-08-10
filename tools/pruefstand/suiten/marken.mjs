// Prüft die Prüfzeile in den drei übrigen Übungen: Tippen, Grammatik, Power-Training.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
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
// Ein Zeichen des Wortes verdrehen, damit sicher etwas rot wird.
function verdreht(wort) {
  var c = wort.charAt(0);
  return (c === 'т' ? 'д' : 'т') + wort.slice(1);
}

try {
  // ── A · Die Gestalten ─────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  pruefe('A1 ohne Angabe gilt «satz»',
    pruefzeileHtml('том', 'дом', true).indexOf('class="pruefzeile satz cyr"') !== -1,
    pruefzeileHtml('том', 'дом', true).slice(0, 60));
  pruefe('A2 «wort» für Tippen',
    pruefzeileHtml('том', 'дом', true, 'wort').indexOf('pruefzeile wort cyr') !== -1);
  pruefe('A3 «form» für die kleinen Felder',
    pruefzeileHtml('том', 'дом', true, 'form').indexOf('pruefzeile form cyr') !== -1);
  pruefe('A4 ohne Kyrillisch keine cyr-Klasse',
    pruefzeileHtml('Haus', 'Haus', false, 'wort').indexOf('cyr') === -1);
  pruefe('A5 jede Gestalt hat eine eigene Regel',
    ['satz', 'wort', 'form'].every(function (g) {
      var p = document.createElement('p');
      p.className = 'pruefzeile ' + g;
      document.body.appendChild(p);
      var f = getComputedStyle(p).fontSize;
      p.remove();
      return parseFloat(f) > 12;
    }));

  // ── B · «Tippen» ──────────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.settings.tippenStufe = 2;
  tippenModus = 'lernen';
  setTab('tippen');
  // Ein längeres Wort erzwingen: Bei «он» bleibt nach dem Verdrehen des ersten
  // Zeichens nichts Grünes übrig, und die Prüfung flackerte je nach Losglück.
  var lang = tippenPool().filter(function (v) {
    return v.ru.length >= 5 && v.ru.indexOf(' ') === -1;
  });
  if (lang.length) { tWord = lang[0]; renderTippen(); }
  pruefe('B0 ein Wort mit mehreren Zeichen', tWord.ru.length >= 5, tWord.ru);
  pruefe('B1 in der Frage steht ein Feld', !!q('#tInput'));
  pruefe('B2 und keine Prüfzeile', !q('.pruefzeile'));

  var wort = tWord.ru;
  schreibe(q('#tInput'), verdreht(wort));
  pruefe('B3 der Text steht jetzt in tEingabe', tEingabe === verdreht(wort), tEingabe);
  tippe(q('#tCheck'));
  pruefe('B4 falsch gewertet', tResult === 'wrong', String(tResult));
  pruefe('B5 die Prüfzeile steht da', !!q('.pruefzeile.wort'));
  pruefe('B6 das Feld ist weg', !q('#tInput'));
  pruefe('B7 sie trägt das Getippte', q('.pruefzeile').textContent === verdreht(wort),
    q('.pruefzeile').textContent);
  pruefe('B8 grün und rot gemischt',
    alle('.pruefzeile .z-ok').length > 0 && alle('.pruefzeile .z-weg').length > 0,
    alle('.pruefzeile .z-ok').length + '/' + alle('.pruefzeile .z-weg').length);
  pruefe('B9 die Lösung steht weiter darunter', main.textContent.indexOf(wort) !== -1);

  // Weiter: neues Wort, leeres Feld.
  tippe(q('#tNext'));
  pruefe('B10 «Weiter» leert die Eingabe', tEingabe === '' && q('#tInput').value === '');
  pruefe('B11 und die Prüfzeile ist weg', !q('.pruefzeile'));

  // Richtig: alles grün, keine Nebenzeile.
  schreibe(q('#tInput'), tWord.ru);
  tippe(q('#tCheck'));
  pruefe('B12 richtig gewertet', tResult === 'right');
  pruefe('B13 alles grün', alle('.pruefzeile .z-weg').length === 0 &&
    alle('.pruefzeile .z-fehlt').length === 0);
  pruefe('B14 keine Nebenzeile', !q('.pruef-note'));

  // Die eingebaute Tastatur schreibt in dieselbe Ablage.
  tippe(q('#tNext'));
  var tasten = alle('[data-key]');
  var zeichen = tasten[0].dataset.key;
  tippe(tasten[0]);
  pruefe('B15 eine Taste schreibt in tEingabe',
    tEingabe === zeichen && q('#tInput').value === zeichen, tEingabe);
  tippe(alle('[data-key]').filter(function (b) { return b.dataset.key === 'BS'; })[0]);
  pruefe('B16 die Rücktaste nimmt zurück', tEingabe === '');

  // Der Hinweis darf das Getippte nicht wegwerfen — früher hing es am Feld.
  schreibe(q('#tInput'), 'при');
  tippe(q('#tHintBtn'));
  pruefe('B17 «Hinweis» behält das Getippte',
    tEingabe === 'при' && q('#tInput').value === 'при', tEingabe);
  pruefe('B18 und zeigt die Umschrift', !!q('.translit'));
  // Dasselbe beim Umschalten der Tastatur.
  tippe(q('#tKbToggle'));
  pruefe('B19 die Tastatur umzuschalten behält es auch',
    tEingabe === 'при' && q('#tInput').value === 'при', tEingabe);
  tippe(q('#tKbToggle'));

  // Nach dem Wiederherstellen einer Sicherung darf nichts stehen bleiben.
  tEingabe = 'rest';
  ansichtenZuruecksetzen();
  pruefe('B20 zurückgesetzt wird sie geleert', tEingabe === '');

  // ── C · «Grammatik» ───────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  GRAMMATIK.forEach(function (b) {
    state.gramSeen[b.id] = Date.now();
    state.gramBox[b.id] = SATZ_STUFE;      // ab hier wird getippt
  });
  // «Geschlecht» wird immer gewählt, nie getippt — also einen Baustein
  // nehmen, der nach einer Form fragt.
  gramWahl = 'akkusativ';
  gramBaustein = null;
  gramQ = null;
  setTab('grammatik');
  renderGrammatik();
  pruefe('C0 eine Schreibaufgabe gefunden', !!gramQ && !!gramQ.tippen);
  pruefe('C1 in der Frage steht ein Feld', !!q('#gramInput'));
  pruefe('C2 und keine Prüfzeile', !q('.pruefzeile'));

  var form = gramQ.loesung;
  schreibe(q('#gramInput'), verdreht(form));
  tippe(q('#gramConfirm'));
  pruefe('C3 falsch gewertet', gramCorrect === false);
  pruefe('C4 die Prüfzeile steht da', !!q('.pruefzeile.form'));
  pruefe('C5 das Feld ist weg', !q('#gramInput'));
  pruefe('C6 sie trägt das Getippte',
    q('.pruefzeile').textContent === verdreht(form), q('.pruefzeile').textContent);
  pruefe('C7 grün und rot gemischt',
    alle('.pruefzeile .z-ok').length > 0 && alle('.pruefzeile .z-weg').length > 0);
  pruefe('C8 die richtige Form steht weiter darunter',
    main.textContent.indexOf(form) !== -1);

  // ── D · Power-Training ────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  var gefallen = ALL_VOCAB.filter(function (v) {
    return v.ru.length >= 4 && v.ru.indexOf(' ') === -1;
  }).slice(0, PT_WOERTER);
  gefallen.forEach(function (v) {
    state.boxes[v.id] = SATZ_STUFE - 1;
    state.patzer[v.id] = Date.now();
  });
  setTab('power');
  // Auf die Tippstufe bringen: genug Treffer sammeln.
  ptSatz.forEach(function (e) { e.treffer = 4; });
  ptQ = null;
  ptNaechstes();
  renderPower();
  pruefe('D0 die Tippstufe ist erreicht', !!ptQ && ptQ.stufe === 'tippen',
    ptQ && ptQ.stufe);
  pruefe('D1 in der Frage steht ein Feld', !!q('#ptInput'));
  pruefe('D2 und keine Prüfzeile', !q('.pruefzeile'));

  var pw = ptQ.wort.ru;
  schreibe(q('#ptInput'), verdreht(pw));
  tippe(q('#ptConfirm'));
  pruefe('D3 falsch gewertet', ptCorrect === false);
  pruefe('D4 die Prüfzeile steht da', !!q('.pruefzeile.form'));
  pruefe('D5 das Feld ist weg', !q('#ptInput'));
  pruefe('D6 sie trägt das Getippte',
    q('.pruefzeile').textContent === verdreht(pw), q('.pruefzeile').textContent);
  pruefe('D7 grün und rot gemischt',
    alle('.pruefzeile .z-ok').length > 0 && alle('.pruefzeile .z-weg').length > 0);
  pruefe('D8 das richtige Wort steht weiter darunter', main.textContent.indexOf(pw) !== -1);

  // ── E · Kacheln bekommen keine Prüfzeile ──────────────────
  // In «Übersetzen» tun sie es auch nicht — gelegt ist nicht geschrieben.
  state = defaultState();
  ansichtenZuruecksetzen();
  gefallen.forEach(function (v) {
    state.boxes[v.id] = SATZ_STUFE - 1;
    state.patzer[v.id] = Date.now();
  });
  setTab('power');
  pruefe('E0 die Kachelstufe steht am Anfang', ptQ.stufe === 'kacheln', ptQ.stufe);
  var kacheln = alle('[data-pttile]');
  for (var i = 0; i < ptQ.laenge && i < kacheln.length; i++) tippe(alle('[data-pttile]')[i]);
  if (ptPhase === 'ask') tippe(q('#ptConfirm'));
  pruefe('E1 gelegt gibt es keine Prüfzeile', !q('.pruefzeile'), ptPhase);
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

writeFileSync(BAU + '/t-marken.html', testseite(html, test));
console.log('Marken-Testseite geschrieben');
