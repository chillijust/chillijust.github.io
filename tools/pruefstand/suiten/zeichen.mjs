// Prüft die drei Tickets: Buchstaben einfärben, Tastatur von selbst, Weg in die Liste.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
// Die Marken als Kurzschrift: o = stimmt, x = falsch, _ = fehlt
function bild(e, l) {
  return zeichenMarken(e, l).map(function (m) {
    return m.art === 'ok' ? 'o' : m.art === 'weg' ? 'x' : '_';
  }).join('');
}

try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Die Zeichenauswertung ─────────────────────────────
  pruefe('A1 alles richtig ist alles grün', bild('дом', 'дом') === 'ooo', bild('дом', 'дом'));
  pruefe('A2 ein falsches Zeichen an seiner Stelle',
    bild('том', 'дом') === 'xoo', bild('том', 'дом'));
  // Welches der beiden о als «zu viel» gilt, ist beliebig — es gibt zwei
  // gleich gute Zuordnungen. Gefordert ist nur: genau eines steht rot.
  var doppelt = bild('доом', 'дом');
  pruefe('A3 ein Zeichen zu viel',
    doppelt.length === 4 && (doppelt.match(/x/g) || []).length === 1 &&
    doppelt.indexOf('_') === -1, doppelt);
  pruefe('A4 ein fehlendes Zeichen', bild('дм', 'дом') === 'o_o', bild('дм', 'дом'));
  pruefe('A5 die Marken tragen die getippten Zeichen',
    zeichenMarken('том', 'дом').map(function (m) { return m.z; }).join('') === 'том');
  pruefe('A6 drei fehlende Zeichen sind drei Balken',
    (bild('д', 'домик').match(/_/g) || []).length === 4, bild('д', 'домик'));

  // Was normalize() übersieht, muss auch die Farbe übersehen.
  pruefe('A7 Großschreibung ist kein Fehler', bild('Дом', 'дом') === 'ooo', bild('Дом', 'дом'));
  pruefe('A8 ё und е sind dasselbe', bild('ёлка', 'елка') === 'oooo', bild('ёлка', 'елка'));
  pruefe('A9 ein fehlender Punkt ist kein Fehler',
    bild('дом', 'дом.') === 'ooo', bild('дом', 'дом.'));
  pruefe('A10 ein Punkt zu viel ist kein Fehler',
    bild('дом.', 'дом') === 'oooo', bild('дом.', 'дом'));
  pruefe('A11 ein Komma mittendrin stört nicht',
    bild('да, дом', 'да дом') === 'ooooooo', bild('да, дом', 'да дом'));
  pruefe('A12 Leerraum zählt nicht', bild('дадом', 'да дом') === 'ooooo',
    bild('дадом', 'да дом'));
  pruefe('A13 auch auf Deutsch', bild('Das Haus', 'das haus') === 'oooooooo',
    bild('Das Haus', 'das haus'));

  // Alles, was normalize() gleichsetzt, muss vollständig grün sein.
  var paare = [['дом', 'Дом.'], ['я живу', 'Я живу!'], ['ёж', 'еж']];
  pruefe('A14 was als richtig gilt, steht ganz in Grün',
    paare.every(function (p) {
      return normalize(p[0]) !== normalize(p[1]) || bild(p[0], p[1]).indexOf('x') === -1;
    }));

  pruefe('A15 leere Eingabe ergibt keine Zeile',
    pruefzeileHtml('', 'дом', true) === '' && pruefzeileHtml('   ', 'дом', true) === '');
  pruefe('A16 eine richtige Antwort bekommt keine Nebenzeile',
    pruefzeileHtml('дом', 'дом.', true).indexOf('pruef-note') === -1);
  pruefe('A17 eine falsche schon',
    pruefzeileHtml('том', 'дом', true).indexOf('1 Zeichen steht falsch') !== -1);
  pruefe('A18 Fehlendes wird gezählt',
    pruefzeileHtml('дм', 'дом', true).indexOf('1 fehlt') !== -1,
    pruefzeileHtml('дм', 'дом', true));
  pruefe('A19 beides zusammen',
    pruefzeileHtml('тм', 'дом', true).indexOf('1 Zeichen steht falsch · 1 fehlt') !== -1,
    pruefzeileHtml('тм', 'дом', true));
  pruefe('A20 die Eingabe wird escapt',
    pruefzeileHtml('<b>', 'дом', true).indexOf('<b>') === -1 &&
    pruefzeileHtml('<b>', 'дом', true).indexOf('&lt;') !== -1);
  pruefe('A21 die Zahl der Marken entspricht der Eingabe',
    zeichenMarken('привет мир', 'привет мир').length === 10);

  // ── B · Im Ablauf von «Übersetzen» ────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  SENTENCES.forEach(function (sz) { state.satzBox[sz.ru] = 3; });
  trLevel = 1; trDir = 'gemischt'; trModus = 'lernen';
  setTab('uebersetzen');
  // Eine Schreibaufgabe ins Russische erzwingen.
  var versuche = 0;
  while (versuche++ < 200 && (!trTask || trTask.art !== 'tippen' || !trTask.loesungRu)) {
    trTask = null;
    buildTransTask();
  }
  pruefe('B0 eine Schreibaufgabe ins Russische gefunden',
    !!trTask && trTask.art === 'tippen' && !!trTask.loesungRu);
  renderUebersetzen();
  pruefe('B1 in der Frage steht ein Eingabefeld', !!q('#trInput'));
  pruefe('B2 und keine Prüfzeile', !q('.pruefzeile'));

  // Falsch antworten: ein Zeichen tauschen.
  var loesung = trTask.solution;
  trEingabe = loesung.replace(/./, function (c) { return c === 'а' ? 'о' : 'а'; });
  trPruefen();
  renderUebersetzen();
  pruefe('B3 nach der Abgabe steht die Prüfzeile da', !!q('.pruefzeile'));
  pruefe('B4 und das Feld ist weg', !q('#trInput'));
  pruefe('B5 sie zeigt grüne und rote Zeichen',
    alle('.pruefzeile .z-ok').length > 0 && alle('.pruefzeile .z-weg').length > 0,
    alle('.pruefzeile .z-ok').length + ' grün, ' + alle('.pruefzeile .z-weg').length + ' rot');
  pruefe('B6 sie trägt den getippten Text',
    q('.pruefzeile').textContent === trEingabe,
    q('.pruefzeile').textContent + ' statt ' + trEingabe);
  pruefe('B7 die Lösung steht weiterhin darunter',
    main.textContent.indexOf(loesung) !== -1);

  // Richtig antworten: alles grün, keine Nebenzeile.
  trEingabe = '';
  trPhase = 'ask';
  trRevealed = false;
  versuche = 0;
  while (versuche++ < 200 && (!trTask || trTask.art !== 'tippen' || !trTask.loesungRu)) {
    trTask = null;
    buildTransTask();
  }
  trEingabe = trTask.solution;
  trPruefen();
  renderUebersetzen();
  pruefe('B8 richtig heißt ganz grün',
    trCorrect && alle('.pruefzeile .z-weg').length === 0 &&
    alle('.pruefzeile .z-fehlt').length === 0,
    alle('.pruefzeile .z-weg').length + ' rot');
  pruefe('B9 und keine Nebenzeile', !q('.pruef-note'));

  // Aufdecken: nichts geschrieben, nichts einzufärben.
  trEingabe = '';
  trPhase = 'ask';
  trRevealed = false;
  versuche = 0;
  while (versuche++ < 200 && (!trTask || trTask.art !== 'tippen' || !trTask.loesungRu)) {
    trTask = null;
    buildTransTask();
  }
  trEingabe = '';
  trRevealed = true;
  trFinish(false);
  renderUebersetzen();
  pruefe('B10 wer aufgibt, bekommt keine Prüfzeile', !q('.pruefzeile'));

  // ── C · Die Tastatur von selbst ───────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  pruefe('C1 die Vorgabe ist an', state.settings.tastaturAuto === true);
  pruefe('C2 kyrillisch heißt: von selbst', tastaturVorgabe(true) === true);
  pruefe('C3 deutsch heißt: nie', tastaturVorgabe(false) === false);
  state.settings.tastaturAuto = false;
  pruefe('C4 ausgeschaltet bleibt sie zu', tastaturVorgabe(true) === false);
  state.settings.tastaturAuto = true;

  // «Tippen» — die Antwort ist immer kyrillisch. Gemeistertes steht seit
  // ADR 0091 nur noch in «Alle»; im Lernstapel wäre hier nichts.
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.settings.tippenStufe = 2;
  tippenModus = 'alle';
  tKb = null;
  setTab('tippen');
  pruefe('C5 in «Tippen» steht die Tastatur gleich da',
    tKb === true && !!q('[data-key]'), String(tKb));
  pruefe('C6 der Knopf bietet das Ausblenden an',
    q('#tKbToggle').textContent.indexOf('ausblenden') !== -1, q('#tKbToggle').textContent);

  // «Übersetzen» — nur, wenn die Lösung russisch ist.
  SENTENCES.forEach(function (sz) { state.satzBox[sz.ru] = 3; });
  trLevel = 1; trDir = 'ru-de'; trModus = 'lernen';
  trKb = null;
  trTask = null;
  versuche = 0;
  while (versuche++ < 200 && (!trTask || trTask.art !== 'tippen')) {
    trTask = null;
    buildTransTask();
  }
  setTab('uebersetzen');
  pruefe('C7 ins Deutsche schreiben: keine kyrillische Tastatur',
    !q('[data-trkey]') && !q('#trKbToggle'));

  trDir = 'de-ru';
  trKb = null;
  trTask = null;
  versuche = 0;
  while (versuche++ < 200 && (!trTask || trTask.art !== 'tippen' || !trTask.loesungRu)) {
    trTask = null;
    buildTransTask();
  }
  renderUebersetzen();
  pruefe('C8 ins Russische schreiben: Tastatur gleich da',
    trKb === true && !!q('[data-trkey]'), String(trKb));

  // Wer sie zuklappt, behält das — die Vorgabe greift nur einmal.
  tippe(q('#trKbToggle'));
  pruefe('C9 zugeklappt bleibt zugeklappt', trKb === false && !q('[data-trkey]'));

  // ── D · Die Einstellung ───────────────────────────────────
  setTab('einstellungen');
  einstReiter = 'tastatur';
  renderEinstellungen();
  pruefe('D1 der Schalter heißt neu', !!q('[data-set="tastaturAuto"]'));
  pruefe('D2 der alte ist weg', !q('[data-set="tastaturAn"]'));
  pruefe('D3 er steht auf an',
    q('[data-set="tastaturAuto"]').getAttribute('aria-checked') === 'true');
  tippe(q('[data-set="tastaturAuto"]'));
  pruefe('D4 er lässt sich umlegen', state.settings.tastaturAuto === false);
  tippe(q('[data-set="tastaturAuto"]'));

  // ── E · Der Sicherungscode ────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  state.settings.tastaturAuto = false;
  state.settings.ton = true;
  var code = encodeBackup();
  var zurueck = mergeState(decodeBackup(code));
  pruefe('E1 der Schalter kommt zurück', zurueck.settings.tastaturAuto === false,
    String(zurueck.settings.tastaturAuto));
  state.settings.tastaturAuto = true;
  zurueck = mergeState(decodeBackup(encodeBackup()));
  pruefe('E2 auch eingeschaltet', zurueck.settings.tastaturAuto === true);
  pruefe('E3 die anderen Schalter bleiben heil',
    zurueck.settings.ton === true && zurueck.settings.confirmUeben === true);

  // Ein alter Code kannte die Einstellung nicht — dann gilt die Vorgabe.
  var teile = code.split('~');
  var e = teile[5].split('.');
  e[0] = e[0].slice(0, 5);              // fünf Schalter wie früher
  teile[5] = e.join('.');
  // Prüfsumme neu setzen, sonst weist decodeBackup den Code ab.
  var alt = teile.slice(0, -1).join('~');
  var alterCode = alt + '~' + bkPruefsumme(alt);
  var altZurueck = decodeBackup(alterCode);
  pruefe('E4 ein alter Code wird noch gelesen', !!altZurueck);
  if (altZurueck) {
    pruefe('E5 und lässt die neue Vorgabe stehen',
      mergeState(altZurueck).settings.tastaturAuto === true,
      String(mergeState(altZurueck).settings.tastaturAuto));
  }

  // ── F · Vom Meldeblatt in die Liste ───────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('freestyle');
  tippe(q('#meldeKnopf'));
  pruefe('F1 das Blatt ist offen', meldeOffen);
  pruefe('F2 es führt in die Liste', !!q('#meldeAlle') && !q('#meldeAlle').hidden);
  // Ein Entwurf muss den Weg überleben (ADR 0025).
  q('#meldeTitel').value = 'Halb geschrieben';
  q('#meldeText').value = 'Und noch mehr';
  tippe(q('#meldeAlle'));
  pruefe('F3 das Blatt klappt zu', !meldeOffen);
  pruefe('F4 und wir stehen in der Liste', currentTab === 'tickets', currentTab);
  tippe(q('#meldeKnopf'));
  pruefe('F5 der Entwurf lebt noch',
    q('#meldeTitel').value === 'Halb geschrieben' && q('#meldeText').value === 'Und noch mehr',
    q('#meldeTitel').value);
  pruefe('F6 in der Liste selbst steht der Weg nicht da', q('#meldeAlle').hidden === true);
  // Und «Abbrechen» wirft ihn weiterhin weg.
  tippe(q('#meldeAbbruch'));
  tippe(q('#meldeKnopf'));
  pruefe('F7 «Abbrechen» wirft ihn weg', q('#meldeTitel').value === '');
  tippe(q('#meldeAbbruch'));

  setTab('freestyle');
  tippe(q('#meldeKnopf'));
  pruefe('F8 außerhalb der Liste ist er wieder da', q('#meldeAlle').hidden === false);
  pruefe('F9 er ist groß genug zum Treffen',
    q('#meldeAlle').getBoundingClientRect().height >= 44,
    q('#meldeAlle').getBoundingClientRect().height.toFixed(0));
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

writeFileSync(BAU + '/t-zeichen.html', testseite(html, test));
console.log('Zeichen-Testseite geschrieben');
