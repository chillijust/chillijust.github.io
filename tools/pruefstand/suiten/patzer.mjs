// Prüft die vier Tickets: Fortsetzen, Wortauswertung mit Strafe, Zurückwischen.
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

  // A · Buchstabenabstand
  pruefe('A1 gleich ist null', editAbstand('книга', 'книга') === 0);
  pruefe('A2 ein Buchstabe ersetzt', editAbstand('книга', 'книжа') === 1);
  pruefe('A3 ein Buchstabe fehlt', editAbstand('книга', 'книа') === 1);
  pruefe('A4 leer gegen Wort', editAbstand('', 'дом') === 3);
  pruefe('A5 zwei Ersetzungen', editAbstand('дом', 'кот') === 2, String(editAbstand('дом','кот')));

  // B · Wortweiser Abgleich
  var d = trWortDiff('я читаю книгу', 'Я читаю книгу.');
  pruefe('B1 alles richtig', d.every(function (x) { return x.abstand === 0; }),
    d.map(function (x) { return x.ziel + ':' + x.abstand; }).join(' '));
  d = trWortDiff('я читаю книга', 'Я читаю книгу.');
  pruefe('B2 ein Wort mit einem Buchstaben daneben',
    d.length === 3 && d[2].abstand === 1 && d[0].abstand === 0, JSON.stringify(d));
  d = trWortDiff('я читаю', 'Я читаю книгу.');
  pruefe('B3 fehlendes Wort zählt voll', d[2].abstand === 5 && d[2].getippt === '',
    JSON.stringify(d[2]));
  d = trWortDiff('книгу читаю я', 'Я читаю книгу.');
  pruefe('B4 vertauscht ist nicht unbekannt',
    d.every(function (x) { return x.abstand === 0; }), JSON.stringify(d));

  // C · Welche Vokabel steckt dahinter?
  var satz = SENTENCES.filter(function (s) { return s.ru === 'Я читаю книгу.'; })[0];
  pruefe('C1 gebeugte Form findet ihre Grundform',
    trVokabelZu(satz, 'книгу').id === 'книга');
  pruefe('C2 Verbform ebenso', trVokabelZu(satz, 'читаю').id === 'читать');
  pruefe('C3 Grundform direkt', trVokabelZu(satz, 'я').id === 'я');
  pruefe('C4 Unbekanntes bleibt unbekannt', trVokabelZu(satz, 'блаблабла') === null);

  // D · Drei Fehler hintereinander stufen zurück
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  trDir = 'de-ru'; trLevel = satz.stufe; trModus = 'lernen';
  setTab('uebersetzen');

  function schreibe(text) {
    buildTransTask(satz);
    trTask.art = 'tippen';
    trEingabe = text;
    trPruefen();
  }
  pruefe('D0 der Satz ist zunächst frei', satzFrei(satz));
  schreibe('я читаю книга');
  pruefe('D1 erster Fehler zählt', state.wortFehler['книга'] === 1,
    JSON.stringify(state.wortFehler));
  pruefe('D2 noch keine Strafe', state.boxes['книга'] === BOX_MAX);
  // Wie knapp es war, sagt seit ADR 0049 die Kommentarzeile — der Kasten
  // bleibt dem vorbehalten, was Folgen ankündigt.
  pruefe('D3 noch kein Kasten, nur ein Kommentar',
    patzerMeldung === null && !!kommentar, kommentar);
  pruefe('D4 und der spricht vom einen Buchstaben',
    KOMMENTAR_TOPF.eins.indexOf(kommentar) !== -1, kommentar);
  schreibe('я читаю книга');
  pruefe('D5 zweiter Fehler', state.wortFehler['книга'] === 2);
  pruefe('D6 jetzt warnt der Kasten vor',
    !!patzerMeldung && patzerMeldung.art === 'knapp' &&
    patzerMeldung.note.indexOf('Noch einmal') === 0,
    patzerMeldung && patzerMeldung.note);
  schreibe('я читаю книга');
  pruefe('D7 dritter Fehler stuft zurück', state.boxes['книга'] === SATZ_STUFE - 1,
    String(state.boxes['книга']));
  pruefe('D8 der Zähler ist wieder bei null', state.wortFehler['книга'] === undefined);
  pruefe('D9 der Satz ist wieder gesperrt', !satzFrei(satz));
  pruefe('D10 die Meldung sagt es deutlich',
    patzerMeldung.art === 'zurueck' && patzerMeldung.woerter.length === 1 &&
    patzerMeldung.woerter[0].id === 'книга');
  renderUebersetzen();
  pruefe('D11 «Uff» steht auf dem Schirm',
    main.textContent.indexOf('Uff') !== -1 && main.textContent.indexOf('noch mal lernen') !== -1);
  pruefe('D12 und nennt das Wort', !!q('.patzer-worte'));

  // E · Richtig geschrieben löscht die Serie
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  trDir = 'de-ru'; trLevel = satz.stufe;
  schreibe('я читаю книга');
  schreibe('я читаю книга');
  pruefe('E1 zwei Fehler stehen an', state.wortFehler['книга'] === 2,
    trDir + '/' + JSON.stringify(state.wortFehler));
  schreibe('я читаю книгу');
  pruefe('E2 richtig geschrieben räumt auf', state.wortFehler['книга'] === undefined);
  pruefe('E3 und stuft nichts zurück', state.boxes['книга'] === BOX_MAX);
  pruefe('E4 keine Patzermeldung bei richtig', patzerMeldung === null);
  schreibe('я читаю книга');
  pruefe('E5 die Serie beginnt von vorn', state.wortFehler['книга'] === 1);

  // F · Nur die russische Seite wird gewertet
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  trDir = 'ru-de';
  for (var i = 0; i < 4; i++) {
    buildTransTask(satz);
    trTask.art = 'tippen';
    trEingabe = 'ich lese ein Buchx';
    trPruefen();
  }
  pruefe('F1 deutsche Rechtschreibung stuft nichts zurück',
    Object.keys(state.wortFehler).length === 0, JSON.stringify(state.wortFehler));
  pruefe('F2 und meldet auch nichts', patzerMeldung === null);

  // G · Kacheln werden nicht gewertet
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  trDir = 'de-ru';
  buildTransTask(satz);
  trTask.art = 'kacheln';
  trBuilt = [];
  trPruefen();
  pruefe('G1 aus Kacheln verschreibt man sich nicht',
    Object.keys(state.wortFehler).length === 0 && patzerMeldung === null);

  // H · Wer schon unten steht, fällt nicht weiter
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.boxes['книга'] = 1;
  for (var k = 0; k < 3; k++) schreibe('я читаю книга');
  pruefe('H1 keine zweite Strafe für dieselbe Lücke', state.boxes['книга'] === 1,
    String(state.boxes['книга']));

  // H2 · Aufdecken ist kein Verschreiben
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  trDir = 'de-ru'; trLevel = satz.stufe;
  for (var r = 0; r < 4; r++) {
    buildTransTask(satz);
    trTask.art = 'tippen';
    trEingabe = '';
    trRevealed = true;
    trFinish(false);
  }
  pruefe('H2 Aufgeben straft nicht', Object.keys(state.wortFehler).length === 0,
    JSON.stringify(state.wortFehler));
  pruefe('H3 und stuft nichts zurück', state.boxes['книга'] === BOX_MAX);
  pruefe('H4 und meldet keinen Patzer', patzerMeldung === null);

  // I · Fortsetzen
  state = defaultState();
  ansichtenZuruecksetzen();
  pruefe('I1 ohne Vorgeschichte die alte Empfehlung', empfehlung().ziel === 'lernsets');
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  zuletztGeuebt('uebersetzen');
  var e = empfehlung();
  pruefe('I2 danach führt sie dorthin zurück', e.ziel === 'uebersetzen', e.ziel);
  pruefe('I3 und sagt das auch', e.titel.indexOf('Weiter mit') === 0 &&
    e.titel.indexOf('Übersetzen') !== -1, e.titel);
  pruefe('I4 mit dem Stand der Übung', e.note.indexOf('Du warst gerade dort') !== -1, e.note);
  state.zuletzt.zeit = Date.now() - FORTSETZEN_FRIST - 1000;
  pruefe('I5 nach der Frist wieder der Lernstand', empfehlung().ziel !== 'uebersetzen',
    empfehlung().ziel);
  state = defaultState();
  zuletztGeuebt('uebersetzen');
  pruefe('I6 eine gesperrte Übung wird nicht empfohlen', empfehlung().ziel !== 'uebersetzen',
    empfehlung().ziel);
  state = defaultState();
  state.zuletzt = { uebung: 'gibtsnicht', zeit: Date.now() };
  var m = mergeState(JSON.parse(JSON.stringify(state)));
  pruefe('I7 eine unbekannte Übung fällt beim Laden weg', m.zuletzt === null);

  // J · Der Rückweg als Funktion
  state = defaultState();
  setTab('home');          // von hier aus ist der Stapel leer und der Weg eindeutig
  setTab('bilanz');
  bilanzDetail = 'woerter';
  renderBilanz();
  zurueckGehen();
  pruefe('J1 aus dem Detail zur Bilanz', currentTab === 'bilanz' && bilanzDetail === null);
  zurueckGehen();
  pruefe('J2 von dort nach Hause', currentTab === 'home');
  zurueckGehen();
  pruefe('J3 zu Hause tut sie nichts', currentTab === 'home');

  // K · Die Wischgeste
  function wisch(vonX, nachX, vonY, nachY) {
    document.dispatchEvent(new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: document.body, clientX: vonX, clientY: vonY })]
    }));
    document.dispatchEvent(new TouchEvent('touchend', {
      changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: nachX, clientY: nachY })]
    }));
  }
  setTab('bilanz');
  wisch(8, 200, 400, 410);
  pruefe('K1 vom Rand zur Mitte heißt zurück', currentTab === 'home', currentTab);
  setTab('bilanz');
  wisch(200, 380, 400, 410);
  pruefe('K2 aus der Mitte heraus nicht', currentTab === 'bilanz');
  setTab('bilanz');
  wisch(8, 40, 400, 410);
  pruefe('K3 ein kurzer Weg reicht nicht', currentTab === 'bilanz');
  setTab('bilanz');
  wisch(8, 100, 400, 700);
  pruefe('K4 senkrecht ist Scrollen', currentTab === 'bilanz');
  setTab('bilanz');
  menuSetzen(true);
  wisch(8, 200, 400, 410);
  pruefe('K5 bei offenem Blatt schweigt sie', currentTab === 'bilanz');
  menuSetzen(false);
  setTab('home');
  wisch(8, 200, 400, 410);
  pruefe('K6 zu Hause geschieht nichts', currentTab === 'home');
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

writeFileSync(BAU + '/t-patzer.html', testseite(html, test));
console.log('Patzer-Testseite geschrieben');
