// Prüft die vier Tickets: App-Symbol, «Mehr …» als Blatt, Buchstaben→Freestyle, Rückweg.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }

try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · «Mehr …» klappt auf wie das Menü ──────────────────
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.gramSeen[GRAMMATIK[0].id] = Date.now();
  state.gramBox[GRAMMATIK[0].id] = 1;
  gramWahl = GRAMMATIK[0].id;
  setTab('grammatik');
  pruefe('A1 die Regelkarte liegt schon im Baum', !!q('#gramRegelKlapp'));
  pruefe('A2 zugeklappt trägt sie kein «auf»',
    !q('#gramRegelKlapp').classList.contains('auf'));
  pruefe('A3 zugeklappt ist sie vor Vorlesern verborgen',
    q('#gramRegelKlapp').getAttribute('aria-hidden') === 'true');
  pruefe('A4 der Knopf heißt «Mehr …»', q('#gramWarum').textContent.indexOf('Mehr') === 0);
  pruefe('A5 und meldet seinen Zustand',
    q('#gramWarum').getAttribute('aria-expanded') === 'false');
  var klappVorher = q('#gramRegelKlapp');
  tippe(q('#gramWarum'));
  pruefe('A6 ein Tipp klappt auf', q('#gramRegelKlapp').classList.contains('auf'));
  pruefe('A7 ohne neu zu zeichnen — sonst gäbe es keinen Übergang',
    q('#gramRegelKlapp') === klappVorher);
  pruefe('A8 der Knopf meldet den neuen Zustand',
    q('#gramWarum').getAttribute('aria-expanded') === 'true');
  pruefe('A9 und die Karte ist wieder erreichbar',
    q('#gramRegelKlapp').getAttribute('aria-hidden') === 'false');
  pruefe('A10 die Karte trägt Tabelle und Merksatz',
    !!q('#gramRegelKlapp .gram-tabelle') && !!q('#gramRegelKlapp .gram-merk'));
  tippe(q('#gramWarum'));
  pruefe('A11 nochmal tippen klappt zu', !q('#gramRegelKlapp').classList.contains('auf'));
  pruefe('A12 der Zustand steht in gramRegelOffen', gramRegelOffen === false);

  // ── B · Der Rückweg führt zurück, nicht nach Hause ─────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  setTab('bilanz');
  pruefe('B1 von Home in die Bilanz', currentTab === 'bilanz');
  setTab('fakten');
  pruefe('B2 weiter zu den Fakten', currentTab === 'fakten');
  zurueckGehen();
  pruefe('B3 zurück führt in die Bilanz', currentTab === 'bilanz', currentTab);
  zurueckGehen();
  pruefe('B4 von dort nach Home', currentTab === 'home', currentTab);
  pruefe('B5 der Stapel ist leer', ansichtStapel.length === 0, String(ansichtStapel.length));

  setTab('bilanz');
  setTab('sicherung');
  zurueckGehen();
  pruefe('B6 auch aus der Sicherung geht es in die Bilanz', currentTab === 'bilanz', currentTab);

  // Ein Rundweg darf den Stapel nicht wachsen lassen.
  setTab('home');
  setTab('bilanz');
  setTab('sicherung');
  setTab('bilanz');
  pruefe('B7 ein Rundweg schneidet den Stapel ab',
    ansichtStapel.join(',') === 'home', ansichtStapel.join(','));
  zurueckGehen();
  pruefe('B8 und führt danach nach Home', currentTab === 'home');

  // Home räumt den Stapel — dort endet jeder Weg.
  setTab('bilanz');
  setTab('fakten');
  setTab('home');
  pruefe('B9 Home räumt den Stapel leer', ansichtStapel.length === 0);

  // Aus einer Übung heraus gilt derselbe Weg.
  setTab('freestyle');
  zurueckGehen();
  pruefe('B10 aus einer Übung nach Home', currentTab === 'home');

  // Die Detailansicht der Bilanz behält ihren eigenen Zwischenschritt.
  setTab('bilanz');
  bilanzDetail = 'woerter';
  zurueckGehen();
  pruefe('B11 erst die Detailansicht schließen', currentTab === 'bilanz' && !bilanzDetail);
  zurueckGehen();
  pruefe('B12 dann erst weiter zurück', currentTab === 'home');

  // Der «Zurück»-Knopf in den Menüansichten geht denselben Weg.
  setTab('bilanz');
  setTab('einstellungen');
  pruefe('B13 die Einstellungen haben einen Zurück-Knopf', !!q('#setBack'));
  tippe(q('#setBack'));
  pruefe('B14 er führt in die Bilanz', currentTab === 'bilanz', currentTab);

  // ── C · Buchstaben und Freestyle ──────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  pruefe('C1 ohne Buchstaben ist nichts lesbar', leseWoerter().length === 0,
    String(leseWoerter().length));

  // Alle Buchstaben meistern — dann ist alles lesbar.
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  pruefe('C2 mit allen Buchstaben ist alles lesbar',
    leseWoerter().length === ALL_VOCAB.length,
    leseWoerter().length + ' von ' + ALL_VOCAB.length);

  // Ein einziger fehlender Buchstabe schließt seine Wörter aus.
  state.abcBox['д'] = BOX_MAX - 1;
  var ohneD = leseWoerter();
  pruefe('C3 ein fehlender Buchstabe schließt seine Wörter aus',
    ohneD.length < ALL_VOCAB.length && ohneD.every(function (v) {
      return v.ru.toLowerCase().indexOf('д') === -1;
    }), String(ohneD.length));
  pruefe('C4 «sitzt» reicht nicht — gemeistert muss er sein',
    (state.abcBox['д'] || 0) >= SATZ_STUFE && ohneD.length < ALL_VOCAB.length);
  state.abcBox['д'] = BOX_MAX;

  // Der Schalter steht über dem Thema, nicht in der Auswahl.
  setTab('freestyle');
  pruefe('C5 der Schalter steht im Freestyle', !!q('#leseSchalter'));
  var kopf = q('#main section');
  pruefe('C6 er steht vor dem Thema',
    kopf.firstElementChild.id === 'leseSchalter', kopf.firstElementChild.className);
  pruefe('C7 ausgeschaltet trägt er kein Gold', !q('#leseSchalter').classList.contains('an'));
  pruefe('C8 er nennt die Zahl der lesbaren Wörter',
    q('.ls-zahl').textContent === String(leseWoerter().length), q('.ls-zahl').textContent);
  tippe(q('#leseSchalter'));
  pruefe('C9 ein Tipp legt den Modus um', uebLesen === true);
  pruefe('C10 und der Schalter zeigt es', q('#leseSchalter').classList.contains('an') &&
    q('#leseSchalter').getAttribute('aria-pressed') === 'true');

  // Der Vorrat folgt dem Modus.
  state.abcBox['д'] = 0;
  uebZuruecksetzen();
  var pool = uebPool();
  pruefe('C11 der Vorrat enthält nur Lesbares',
    pool.length > 0 && pool.every(function (v) { return v.ru.toLowerCase().indexOf('д') === -1; }),
    String(pool.length));
  pruefe('C12 ohne den Modus ist der Vorrat voll',
    (function () { uebLesen = false; var n = uebPool().length; uebLesen = true; return n; })()
      === ALL_VOCAB.length);

  // Der Modus schneidet quer durch die Themen — beides wirkt zusammen.
  uebThema = ALL_VOCAB[0].theme;
  var beides = uebPool();
  pruefe('C13 Thema und Modus wirken zusammen',
    beides.every(function (v) {
      return v.theme === uebThema && v.ru.toLowerCase().indexOf('д') === -1;
    }));
  uebThema = 'Alle';

  // Leerzustand: kein Weg hinein, aus dem man nicht wieder hinauskäme.
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = 0; });
  uebZuruecksetzen();
  renderUeben();
  pruefe('C14 leerer Vorrat zeigt einen Leerzustand', !!q('.leer'));
  pruefe('C15 mit einem Weg heraus', !!q('#leseAus') && !!q('#leseZuAbc'));
  tippe(q('#leseAus'));
  pruefe('C16 «Alle Wörter» nimmt den Modus heraus', uebLesen === false);
  pruefe('C17 und die Aufgabe steht wieder da', !!q('.card') && !!uebQ);

  // Der Schalter verschwindet, wenn es nichts zu lesen gibt.
  renderUeben();
  pruefe('C18 ohne lesbare Wörter steht kein Schalter da', !q('#leseSchalter'));
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  renderUeben();
  pruefe('C19 mit lesbaren Wörtern kommt er zurück', !!q('#leseSchalter'));

  // ── D · Der Wink in «Buchstaben» ──────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('buchstaben');
  pruefe('D1 ohne gemeisterte Buchstaben kein Wink', !q('.lese-wink'));
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  state.abcBox['а'] = 1;   // sonst ist alles gemeistert und die Übung leer
  renderBuchstaben();
  pruefe('D2 mit genug lesbaren Wörtern erscheint er',
    leseWoerter().length >= LESE_MINDEST ? !!q('.lese-wink') : true,
    String(leseWoerter().length));
  if (q('.lese-wink')) {
    pruefe('D3 er nennt die Zahl', q('.lese-wink strong').textContent
      .indexOf(String(leseWoerter().length)) === 0);
    pruefe('D4 und führt in den Modus', !!q('#leseLos'));
    tippe(q('#leseLos'));
    pruefe('D5 er landet im Freestyle', currentTab === 'freestyle', currentTab);
    pruefe('D6 im Lesemodus', uebLesen === true);
    pruefe('D7 über alle Themen', uebThema === 'Alle');
  }

  // ── E · Die gelockerte Strafe ─────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  uebLesen = true;
  pruefe('E1 fehlende Buchstaben werden erkannt',
    fehlendeBuchstaben('дом', 'том').join('') === 'д',
    fehlendeBuchstaben('дом', 'том').join(''));
  pruefe('E2 verdrehte Reihenfolge zählt nicht',
    fehlendeBuchstaben('дом', 'мод').length === 0,
    fehlendeBuchstaben('дом', 'мод').join(''));
  pruefe('E3 Leerzeichen zählen nicht mit',
    fehlendeBuchstaben('до свидания', 'досвидания').length === 0);

  for (var i = 1; i < LESE_STRAFE; i++) {
    leseWerten('дом', 'том', false);
    pruefe('E4.' + i + ' Fehler ' + i + ' zählt nur',
      state.leseFehler['д'] === i && state.abcBox['д'] === BOX_MAX,
      state.leseFehler['д'] + '/' + state.abcBox['д']);
  }
  leseWerten('дом', 'том', false);
  pruefe('E5 beim ' + LESE_STRAFE + '. Mal fällt der Buchstabe',
    state.abcBox['д'] === BOX_MAX - 1, String(state.abcBox['д']));
  pruefe('E6 der Zähler beginnt von vorn', !state.leseFehler['д']);
  pruefe('E7 es gibt eine Meldung dazu', !!leseMeldung &&
    leseMeldung.zeichen.join('') === 'д');
  pruefe('E8 der Buchstabe steht wieder in «Buchstaben»',
    abcPool().some(function (b) { return b[1] === 'д'; }));
  pruefe('E9 und seine Wörter sind aus dem Lesemodus draußen',
    leseWoerter().every(function (v) { return v.ru.toLowerCase().indexOf('д') === -1; }));

  // Richtig gelegt löscht die Serie.
  state.abcBox['д'] = BOX_MAX;
  leseWerten('дом', 'том', false);
  pruefe('E10 ein Fehler zählt wieder', state.leseFehler['д'] === 1);
  leseWerten('дом', 'дом', true);
  pruefe('E11 richtig gelegt löscht die Serie', !state.leseFehler['д']);

  // Ein Buchstabe auf Stufe 0 fällt nicht weiter.
  state.abcBox['ж'] = 0;
  for (var k = 0; k < LESE_STRAFE; k++) leseWerten('жаба', 'хаба', false);
  pruefe('E12 unter Stufe 0 fällt niemand', state.abcBox['ж'] === 0, String(state.abcBox['ж']));

  // Ohne den Modus wird gar nicht gewertet.
  uebLesen = false;
  state.leseFehler = {};
  leseWerten('дом', 'том', false);
  pruefe('E13 außerhalb des Modus zählt nichts',
    Object.keys(state.leseFehler).length === 0);

  // ── F · Der Zähler bleibt aus dem Sicherungscode ──────────
  state = defaultState();
  ansichtenZuruecksetzen();
  state.boxes['дом'] = 1;
  state.abcBox['д'] = 3;
  state.leseFehler['д'] = 2;
  var code = encodeBackup();
  var zurueck = mergeState(decodeBackup(code));
  pruefe('F1 der Buchstabenstand kommt zurück', zurueck.abcBox['д'] === 3,
    String(zurueck.abcBox['д']));
  pruefe('F2 der Fehlerzähler nicht',
    Object.keys(zurueck.leseFehler).length === 0, JSON.stringify(zurueck.leseFehler));

  // ── G · Nach dem Wiederherstellen steht nichts Altes da ───
  uebLesen = true;
  ansichtStapel.push('bilanz');
  ansichtenZuruecksetzen();
  pruefe('G1 der Lesemodus ist zurückgesetzt', uebLesen === false);
  pruefe('G2 der Rückwegstapel ist leer', ansichtStapel.length === 0);
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
writeFileSync(BAU + '/t-bruecke.html', html.replace('</body>', skript + '</body>'));
console.log('Brücken-Testseite geschrieben');
