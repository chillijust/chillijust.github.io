// Prüft die vier Tickets: «Mehr …», die Vorgabe, das Power-Training, Grammatik wiederholen.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // A · «Mehr …» statt «Warum?»
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.gramSeen[GRAMMATIK[0].id] = Date.now();
  setTab('grammatik');
  pruefe('A1 der Knopf heißt «Mehr …»', q('#gramWarum').textContent.indexOf('Mehr') === 0,
    q('#gramWarum').textContent);
  pruefe('A2 «Warum?» steht nirgends mehr', main.textContent.indexOf('Warum?') === -1);
  q('#gramWarum').click();
  pruefe('A3 er zeigt weiter die Regelkarte', !!q('.gram-tabelle'));

  // B · Die Vorgabe ist ein eigenes Feld
  gramRegelOffen = false; gramQ = null; renderGrammatik();
  pruefe('B1 die Vorgabe steht als Feld da', !!q('.gram-vorgabe'));
  pruefe('B2 sie nennt die Bedeutung', !!q('.gv-bedeutung') &&
    q('.gv-bedeutung').textContent === gramQ.wort.de, q('.gv-bedeutung').textContent);
  // Beim Präsens steht die verlangte Person darin — golden hervorgehoben
  var pb = GRAMMATIK.filter(function (x) { return x.aufgabe === 'praes'; })[0];
  state.gramSeen[pb.id] = Date.now();
  gramWahl = pb.id; gramBaustein = pb.id; gramQ = null;
  renderGrammatik();
  pruefe('B3 die verlangte Person steht hervorgehoben da', !!q('.gv-verlangt') &&
    q('.gv-verlangt').textContent.indexOf(PERSON_DE[gramQ.person]) !== -1,
    q('.gv-verlangt') && q('.gv-verlangt').textContent);
  pruefe('B4 sie ist kein Kleingedrucktes mehr',
    getComputedStyle(q('.gv-verlangt')).fontSize !== getComputedStyle(q('.gram-vorgabe')).fontSize);

  // C · Grammatik gezielt wiederholen
  state = defaultState();
  ansichtenZuruecksetzen();
  GRAMMATIK.forEach(function (b) {
    state.gramBox[b.id] = BOX_MAX;
    state.gramSeen[b.id] = Date.now();
  });
  setTab('grammatik');
  pruefe('C1 alles sitzt, nichts ist fällig', gramPool().length === 0);
  pruefe('C2 die Auswahl steht bereit', filterHatWahl() && !q('#filterKnopf').hidden);
  renderFilter();
  var chips = alle('#filterInhalt [data-fw="gramwahl"]');
  pruefe('C3 ein Eintrag je Baustein plus «Der Reihe nach»',
    chips.length === GRAMMATIK.length + 1, String(chips.length));
  pruefe('C4 gemeisterte sind als solche vermerkt',
    chips[1].textContent.indexOf('sitzt') !== -1, chips[1].textContent);
  filterWaehlen('gramwahl', GRAMMATIK[2].id);
  pruefe('C5 der gewählte Baustein ist dran',
    gramWahl === GRAMMATIK[2].id && gramAktuell().id === GRAMMATIK[2].id);
  pruefe('C6 und es gibt eine Aufgabe dazu', !!gramQ || !!q('[data-gramdeutung]'));
  pruefe('C7 die Auswahl zeigt, dass etwas gesetzt ist', filterAktiv());
  filterWaehlen('gramwahl', '');
  pruefe('C8 zurück auf «Der Reihe nach»', gramWahl === null && !filterAktiv());
  ansichtenZuruecksetzen();
  pruefe('C9 Zurücksetzen räumt die Wahl weg', gramWahl === null);

  // D · Der Vorrat des Power-Trainings
  state = defaultState();
  ansichtenZuruecksetzen();
  var drei = ALL_VOCAB.slice(0, 3);
  pruefe('D1 leer heißt gesperrt', ptPool().length === 0 && !ptOffen());
  pruefe('D2 die Kachel sagt das auch', uebungsStand('power').gesperrt === true);
  drei.forEach(function (v) { state.patzer[v.id] = Date.now(); state.boxes[v.id] = SATZ_STUFE - 1; });
  pruefe('D3 drei gefallene Wörter öffnen die Übung', ptPool().length === 3 && ptOffen());
  pruefe('D4 die Kachel ist offen', !uebungsStand('power').gesperrt);
  // Wer wieder oben ist, fliegt raus — und zwar beim Nachsehen, nicht später
  state.boxes[drei[0].id] = SATZ_STUFE;
  pruefe('D5 wer wieder sitzt, verlässt den Vorrat', ptPool().length === 2);
  pruefe('D6 und ist auch aus dem Speicher weg', state.patzer[drei[0].id] === undefined);
  pruefe('D7 unter drei ist wieder zu', !ptOffen());

  // E · Eine Runde
  state = defaultState();
  ansichtenZuruecksetzen();
  var fuenf = ALL_VOCAB.slice(0, 5);
  fuenf.forEach(function (v, i) {
    state.patzer[v.id] = 1000 + i;
    state.boxes[v.id] = SATZ_STUFE - 1;
  });
  setTab('power');
  pruefe('E1 die Runde nimmt genau drei Wörter', ptSatz.length === PT_WOERTER,
    String(ptSatz.length));
  pruefe('E2 die zuletzt gefallenen zuerst',
    ptSatz[0].v.id === fuenf[4].id, ptSatz[0].v.id);
  pruefe('E3 eine Frage steht da', !!ptQ && !!q('.card'));
  pruefe('E4 die erste Stufe sind Kacheln', ptQ.stufe === 'kacheln' && !!q('[data-pttile]'));
  pruefe('E5 gefragt wird auf Deutsch', q('.word').textContent.indexOf(ptQ.wort.de) === 0,
    q('.word').textContent);

  // Richtig zusammensetzen
  function loesen() {
    if (ptQ.stufe === 'kacheln') {
      ptQ.wort.ru.split('').forEach(function (ch) {
        var frei = ptQ.tiles.filter(function (t) {
          return t.ch === ch && ptBuilt.indexOf(t.key) === -1;
        })[0];
        if (frei) ptBuilt.push(frei.key);
      });
    } else {
      ptEingabe = ptQ.wort.ru;
    }
    ptPruefen();
  }
  var wortA = ptQ.wort.id;
  loesen();
  pruefe('E6 richtig erkannt', ptCorrect === true);
  pruefe('E7 der Treffer zählt',
    ptSatz.filter(function (e) { return e.v.id === wortA; })[0].treffer === 1);
  pruefe('E8 der Leitner-Stand steigt mit', state.boxes[wortA] === SATZ_STUFE);
  q('#ptNext').click();
  pruefe('E9 danach ein anderes Wort', ptQ.wort.id !== wortA, ptQ.wort.id);

  // F · Die Stufen steigen
  pruefe('F1 Treffer 0 und 1 sind Kacheln',
    ptStufe(0) === 'kacheln' && ptStufe(1) === 'kacheln');
  pruefe('F2 danach tippen mit Umschrift',
    ptStufe(2) === 'tippen-hilfe' && ptStufe(3) === 'tippen-hilfe');
  pruefe('F3 zuletzt ohne', ptStufe(4) === 'tippen');
  pruefe('F4 fünf Treffer je Wort', PT_RUNDEN === 5);

  // G · Eine Runde zu Ende bringen
  var wachhund = 0;
  while (ptPhase !== 'fertig' && wachhund < 60) {
    wachhund++;
    if (!ptQ) { ptFrageBauen(); continue; }
    loesen();
    ptFrageBauen();
  }
  pruefe('G1 die Runde geht zu Ende', ptPhase === 'fertig', 'Schritte: ' + wachhund);
  pruefe('G2 jedes Wort hat seine fünf',
    ptSatz.every(function (e) { return e.treffer >= PT_RUNDEN; }),
    ptSatz.map(function (e) { return e.treffer; }).join());
  renderPower();
  pruefe('G3 der Abschluss zeigt sich', main.textContent.indexOf('Runde geschafft') !== -1);
  pruefe('G4 mit einer Zeile je Wort', alle('.pt-zeile').length === PT_WOERTER);
  pruefe('G5 und einem Weg hinaus', !!q('#ptHeim'));

  // H · Falsch geschrieben kostet einen Treffer
  state = defaultState();
  ansichtenZuruecksetzen();
  fuenf.forEach(function (v, i) {
    state.patzer[v.id] = 1000 + i;
    state.boxes[v.id] = SATZ_STUFE - 1;
  });
  setTab('power');
  loesen();
  ptFrageBauen();
  var e0 = ptSatz.filter(function (e) { return e.treffer > 0; })[0];
  var vorher = e0.treffer;
  // dasselbe Wort noch einmal, diesmal falsch
  ptQ = { wort: e0.v, eintrag: e0, stufe: 'tippen' };
  ptEingabe = 'квкв';
  ptPruefen();
  pruefe('H1 falsch erkannt', ptCorrect === false);
  pruefe('H2 der Treffer fällt zurück', e0.treffer === vorher - 1, String(e0.treffer));
  pruefe('H3 aber nie unter null', (function () {
    e0.treffer = 0; ptQ = { wort: e0.v, eintrag: e0, stufe: 'tippen' };
    ptEingabe = 'квкв'; ptPruefen();
    return e0.treffer === 0;
  })());

  // I · Die Wege hinein
  state = defaultState();
  ansichtenZuruecksetzen();
  pruefe('I1 die Kachel steht auf Home', UEBUNGEN.filter(function (u) {
    return u.id === 'power';
  }).length === 1);
  setTab('home');
  pruefe('I2 und ist sichtbar', !!q('[data-uebung="power"]'));
  pruefe('I3 gesperrt, solange nichts gefallen ist',
    q('[data-uebung="power"]').className.indexOf('gesperrt') !== -1);
  // Aus «Übersetzen» heraus
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  fuenf.forEach(function (v, i) {
    state.patzer[v.id] = 1000 + i;
    state.boxes[v.id] = SATZ_STUFE - 1;
  });
  trDir = 'ru-de'; trLevel = 1; trTask = null;
  setTab('uebersetzen');
  pruefe('I4 ein Weg steht in der Fußzeile', !!q('#ptLosFuss'), main.textContent.slice(-80));
  q('#ptLosFuss').click();
  pruefe('I5 er führt hin', currentTab === 'power');

  // J · Zurücksetzen räumt auch hier auf
  ansichtenZuruecksetzen();
  pruefe('J1 die Runde ist weg', ptSatz === null && ptQ === null && ptPhase === 'ask');

  // K · Der Sicherungscode bleibt schlank — Gefallenes gehört nicht hinein
  state = defaultState();
  state.patzer = { 'дом': 123 };
  state.boxes['дом'] = 1;
  var code = encodeBackup();
  var zurueck = mergeState(decodeBackup(code));
  pruefe('K1 gefallene Wörter stehen nicht im Code',
    Object.keys(zurueck.patzer).length === 0, JSON.stringify(zurueck.patzer));
  pruefe('K2 der Lernstand kommt aber zurück', (zurueck.boxes['дом'] || 0) === 1,
    String(zurueck.boxes['дом']));
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

writeFileSync(BAU + '/t-power.html', testseite(html, test));
console.log('Power-Testseite geschrieben');
