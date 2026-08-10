// Prüft die Meister-Rückmeldung, den Tippmodus in «Übersetzen» und den Klang.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }


// Ein Kontext, der mitschreibt statt zu klingen — Headless hat keinen Ton.
var geplant = [];
var kontextStand = 'running';
function ScheinKontext() {
  this.destination = {};
  var selbst = this;
  Object.defineProperty(this, 'state', { get: function () { return kontextStand; } });
  Object.defineProperty(this, 'currentTime', { get: function () { return 100; } });
  this.resume = function () {
    return new Promise(function (fertig) { kontextStand = 'running'; fertig(); });
  };
  this.createOscillator = function () {
    var o = { frequency: { value: 0 }, type: '', connect: function () {},
      start: function (t) { o.startzeit = t; }, stop: function () {} };
    geplant.push(o);
    return o;
  };
  this.createBuffer = function (k, n, r) { return { kanaele: k, laenge: n, rate: r }; };
  this.createBufferSource = function () {
    var qu = { buffer: null, connect: function () {}, start: function () { selbst.stille = true; } };
    return qu;
  };
  this.createGain = function () {
    var pegel = [];
    return { gain: {
      setValueAtTime: function (v, t) { pegel.push(['set', v, t]); },
      exponentialRampToValueAtTime: function (v, t) { pegel.push(['ramp', v, t]); }
    }, connect: function () {}, verlauf: pegel };
  };
}
Object.defineProperty(window, 'AudioContext', { configurable: true, value: ScheinKontext });
Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: ScheinKontext });

function warte(f) { return new Promise(function (fertig) { setTimeout(function () { f(); fertig(); }, 30); }); }

try {
  state = defaultState();
  ansichtenZuruecksetzen();
  tonWerk = null;

  // A · Der Klang wacht auf
  pruefe('A1 «interrupted» gilt als Schlaf',
    tonSchlaeft({ state: 'interrupted' }) === true && tonSchlaeft({ state: 'suspended' }) === true);
  pruefe('A2 laufend ist kein Schlaf', tonSchlaeft({ state: 'running' }) === false);
  geplant = []; kontextStand = 'running';
  ton(true);
  pruefe('A3 «richtig» ist ein Zweiklang', geplant.length === 2, String(geplant.length));
  pruefe('A4 und liegt in der Zukunft',
    geplant.every(function (o) { return o.startzeit > 100; }),
    geplant.map(function (o) { return o.startzeit; }).join());
  pruefe('A5 aufsteigende Terz aus Sinus',
    geplant[0].frequency.value === 880 && geplant[1].frequency.value === 1318.5 &&
    geplant[0].type === 'sine',
    geplant.map(function (o) { return o.frequency.value; }).join('/') + ' ' + geplant[0].type);
  pruefe('A6 die zweite Note kommt versetzt',
    Math.abs((geplant[1].startzeit - geplant[0].startzeit) - 0.09) < 0.001,
    String(geplant[1].startzeit - geplant[0].startzeit));
  geplant = [];
  ton(false);
  pruefe('A7 «falsch» bleibt tief und dreieckig',
    geplant[0].frequency.value === 196 && geplant[0].type === 'triangle',
    geplant[0].frequency.value + '/' + geplant[0].type);
  geplant = [];
  tonMeister();
  pruefe('A8 «gemeistert» ist ein aufsteigender Vierklang',
    geplant.length === 4 && geplant[0].frequency.value === 880 &&
    geplant[3].frequency.value === 1760,
    geplant.map(function (o) { return o.frequency.value; }).join('/'));
  pruefe('A9 im selben Sinus wie «richtig»',
    geplant.every(function (o) { return o.type === 'sine'; }));

  // B · Aus dem Schlaf heraus wird trotzdem gespielt
  geplant = []; kontextStand = 'interrupted';
  ton(true);
  pruefe('B1 im Schlaf wird nichts sofort geplant', geplant.length === 0);
} catch (e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + (e.stack || '').split('\n')[1]);
}

warte(function () {}).then(function () {
  try {
    pruefe('B2 nach dem Aufwachen dann doch', geplant.length === 2, String(geplant.length));
    pruefe('B3 und der Kontext läuft wieder', kontextStand === 'running');
    geplant = []; kontextStand = 'suspended';
    tonWecken();
    pruefe('B4 jeder Tipp weckt den Kontext', kontextStand === 'running');

    // B5 · Der Stummschalter: die Sitzungsart muss gesetzt werden
    var sitzung = { type: 'auto' };
    Object.defineProperty(navigator, 'audioSession', { configurable: true, value: sitzung });
    tonSitzungGesetzt = false;
    tonSitzung();
    pruefe('B5 kurze Rückmeldungen laufen als «transient»', sitzung.type === 'transient',
      sitzung.type);
    // Eine Fassung, die «transient» nicht kennt, fällt auf «playback» zurück
    var alt = { _t: 'auto' };
    Object.defineProperty(alt, 'type', {
      get: function () { return alt._t; },
      set: function (v) { if (v !== 'transient') alt._t = v; }
    });
    Object.defineProperty(navigator, 'audioSession', { configurable: true, value: alt });
    tonSitzungGesetzt = false;
    tonSitzung();
    pruefe('B6 sonst wenigstens «playback»', alt.type === 'playback', alt.type);

    // B7 · Freigeben spielt einen stillen Puffer in der Geste
    tonEntsperrt = false;
    tonWerk.stille = false;
    tonEntsperren();
    pruefe('B7 die Freigabe spielt einen stillen Puffer', tonWerk.stille === true);
    pruefe('B8 und geschieht genau einmal', tonEntsperrt === true);

    // B9 · Die Selbstauskunft nennt jede Ursache beim Namen
    pruefe('B9 sie nennt Einstellung, Kontext und Sitzung',
      tonAuskunft().indexOf('Einstellung an') !== -1 &&
      tonAuskunft().indexOf('Kontext') !== -1 &&
      tonAuskunft().indexOf('Sitzung') !== -1, tonAuskunft());
    state.settings.ton = false;
    pruefe('B10 ein ausgeschalteter Schalter steht zuerst',
      tonAuskunft().indexOf('Einstellung aus') === 0, tonAuskunft());
    state.settings.ton = true;

    // C · Gemeistert: nur der Übergang zählt
    meisterMeldung = null;
    pruefe('C1 Übergang auf die Endstufe meldet',
      meisterPruefen(BOX_MAX - 1, BOX_MAX, 'Wort', 'мир — Frieden', '3 von 380') === true);
    pruefe('C2 die Meldung trägt Text und Hinweis',
      meisterMeldung.was === 'Wort' && meisterMeldung.text === 'мир — Frieden');
    meisterMeldung = null;
    pruefe('C3 wer schon oben war, meistert nicht erneut',
      meisterPruefen(BOX_MAX, BOX_MAX, 'Wort', 'x') === false && meisterMeldung === null);
    pruefe('C4 und darunter erst recht nicht',
      meisterPruefen(1, 2, 'Wort', 'x') === false && meisterMeldung === null);

    // D · Wort meistern in «Lernsets»
    state = defaultState();
    ansichtenZuruecksetzen();
    ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX - 1; });
    setTab('lernsets');
    uebNext(true);
    pruefe('D1 vor der Antwort keine Meldung', !q('.meister'));
    var wort = uebQ.word;
    if (uebQ.mode === 'tiles') {
      uebQ.word.ru.split('').forEach(function (ch) {
        var b = alle('[data-tile]').filter(function (x) { return x.textContent === ch && !x.disabled; })[0];
        if (b) b.click();
      });
    } else {
      alle('[data-opt]').filter(function (b) {
        return b.textContent === (uebQ.mode === 'mc-de' ? wort.de : wort.ru);
      })[0].click();
    }
    q('#uebConfirm').click();
    pruefe('D2 richtig beantwortet', uebCorrect === true, String(uebCorrect));
    pruefe('D3 die Meldung steht da', !!q('.meister'));
    pruefe('D4 sie nennt das Wort und die Zahl',
      q('.meister').textContent.indexOf(wort.ru) !== -1 &&
      q('.meister').textContent.indexOf('von ' + ALL_VOCAB.length) !== -1,
      q('.meister').textContent);
    q('#uebNext').click();
    pruefe('D5 bei der nächsten Frage ist sie weg', !q('.meister') && meisterMeldung === null);

    // E · Ein schon gemeistertes Wort meldet nicht noch einmal
    state.boxes = {};
    ALL_VOCAB.forEach(function (v) {
      state.boxes[v.id] = BOX_MAX;
      state.lastSeen[v.id] = Date.now() - 30 * TAG;
    });
    // Die Aufgabenform wird ausgelost — also weiterblättern, bis eine Wahlfrage
    // kommt. Stand die Prüfung in einem «if», fiel sie mal weg und mal nicht,
    // und die Zahl der Prüfungen schwankte still von Lauf zu Lauf.
    for (var w = 0; w < 40; w++) { uebNext(true); if (uebQ && uebQ.mode !== 'tiles') break; }
    pruefe('E0 eine Wahlfrage erreicht', !!uebQ && uebQ.mode !== 'tiles', uebQ && uebQ.mode);
    alle('[data-opt]').filter(function (b) {
      return b.textContent === (uebQ.mode === 'mc-de' ? uebQ.word.de : uebQ.word.ru);
    })[0].click();
    q('#uebConfirm').click();
    pruefe('E1 Auffrischen meldet nicht', uebCorrect === true && !q('.meister'));

    // F · Sätze werden zweimal getippt
    state = defaultState();
    ansichtenZuruecksetzen();
    ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
    var satz = freieSaetze(1)[0];
    pruefe('F1 ein neuer Satz wird gelegt', trArt(satz) === 'kacheln', trArt(satz));
    state.satzBox[satz.ru] = 1;
    pruefe('F2 auf Stufe 1 noch immer', trArt(satz) === 'kacheln');
    state.satzBox[satz.ru] = TR_TIPPEN;
    pruefe('F3 ab Stufe 2 wird geschrieben', trArt(satz) === 'tippen');
    state.satzBox[satz.ru] = BOX_MAX - 1;
    pruefe('F4 auch die letzte Runde davor', trArt(satz) === 'tippen');
    state.satzBox[satz.ru] = BOX_MAX;
    pruefe('F5 und die Auffrischung ebenso', trArt(satz) === 'tippen');

    // F2 · Die Richtung wechselt mit der Stufe
    trDir = 'gemischt';
    var stufen = [];
    [0, 1, 2, 3, BOX_MAX].forEach(function (b) {
      state.satzBox[satz.ru] = b;
      stufen.push(b + ':' + trRichtungFuer(satz) + '/' + trArt(satz));
    });
    pruefe('F6 die Leiter läuft von verstehen zu schreiben',
      stufen.join(' ') === '0:ru-de/kacheln 1:de-ru/kacheln 2:ru-de/tippen ' +
        '3:de-ru/tippen 4:de-ru/tippen',
      stufen.join(' '));
    pruefe('F7 beide Richtungen kommen vor',
      stufen.some(function (x) { return x.indexOf('ru-de') !== -1; }) &&
      stufen.some(function (x) { return x.indexOf('de-ru') !== -1; }));
    trDir = 'ru-de';
    state.satzBox[satz.ru] = 1;
    pruefe('F8 eine feste Wahl schlägt die Staffelung', trRichtungFuer(satz) === 'ru-de');
    trDir = 'de-ru';
    state.satzBox[satz.ru] = 0;
    pruefe('F9 in beide Richtungen', trRichtungFuer(satz) === 'de-ru');
    trDir = 'gemischt';

    // F3 · Deutsche Artikel zählen nicht mit
    pruefe('F10 Artikel fallen im Deutschen weg',
      trVergleichbar('Ich lese ein Buch.', true) === trVergleichbar('Ich lese das Buch', true),
      trVergleichbar('Ich lese ein Buch.', true));
    pruefe('F11 der Rest zählt sehr wohl',
      trVergleichbar('Ich lese ein Buch', true) !== trVergleichbar('Ich lese eine Zeitung', true));
    pruefe('F12 im Russischen zählt jedes Wort',
      trVergleichbar('я читаю книгу', false) !== trVergleichbar('читаю книгу', false));

    // G · Der Tippmodus in der Ansicht
    state.satzBox = {}; state.satzSeen = {};
    state.satzBox[satz.ru] = TR_TIPPEN;
    trLevel = 1; trModus = 'lernen';
    setTab('uebersetzen');
    // Stufe 2 heißt in der Staffelung RU → DE; die Lösung ist also deutsch.
    buildTransTask(satz);
    renderUebersetzen();
    pruefe('G1 ein Feld statt Kacheln', !!q('#trInput') && !q('[data-wtile]'));
    pruefe('G2 der Kopf sagt es', main.textContent.indexOf('selbst schreiben') !== -1);
    pruefe('G2b und nennt die Richtung', main.textContent.indexOf('RU \u2192 DE') !== -1,
      q('.card-meta').textContent);
    pruefe('G2c das Feld steht linksbündig',
      getComputedStyle(q('#trInput')).textAlign === 'left',
      getComputedStyle(q('#trInput')).textAlign);
    pruefe('G3 leer darf man nicht abgeben', q('#trConfirm').disabled);
    q('#trInput').value = 'völlig daneben';
    q('#trInput').dispatchEvent(new Event('input'));
    pruefe('G4 mit Text schon', !q('#trConfirm').disabled);
    q('#trConfirm').click();
    pruefe('G5 falsch erkannt', trCorrect === false);
    pruefe('G6 die Lösung steht da', main.textContent.indexOf(trTask.solution) !== -1);

    // Richtig, mit anderer Groß-/Kleinschreibung und ohne Punkt. Die falsche
    // Antwort hat den Satz eine Stufe kosten lassen — zurückstellen, sonst
    // stünden wieder Kacheln da.
    state.satzBox[satz.ru] = TR_TIPPEN;
    buildTransTask(satz); renderUebersetzen();
    var loesung = trTask.solution;
    q('#trInput').value = loesung.toUpperCase().replace(/[.!?]/g, '') + '   ';
    q('#trInput').dispatchEvent(new Event('input'));
    q('#trConfirm').click();
    pruefe('G7 Satzzeichen und Schreibung sind egal', trCorrect === true, loesung);

    // H · Die eingebaute Tastatur nur für Kyrillisch
    state.satzBox[satz.ru] = TR_TIPPEN;
    trDir = 'de-ru';
    trKb = null;
    buildTransTask(satz); renderUebersetzen();
    pruefe('H1 kyrillische Lösung bekommt eine Tastatur', !!q('#trKbToggle'));
    // Sie kommt von selbst — der Knopf klappt sie zu, nicht auf (ADR 0037).
    pruefe('H2 sie steht gleich da', alle('[data-trkey]').length > 30,
      String(alle('[data-trkey]').length));
    q('#trKbToggle').click();
    pruefe('H2b der Knopf klappt sie zu', !q('[data-trkey]'));
    q('#trKbToggle').click();
    var taste = alle('[data-trkey]')[0];
    var zeichen = taste.textContent;
    taste.click();
    pruefe('H3 eine Taste schreibt ins Feld',
      trEingabe === zeichen && q('#trInput').value === zeichen, trEingabe);
    alle('[data-trkey]').filter(function (b) { return b.dataset.trkey === 'BS'; })[0].click();
    pruefe('H4 die Rücktaste nimmt zurück', trEingabe === '');
    trDir = 'ru-de';
    buildTransTask(satz); renderUebersetzen();
    pruefe('H5 deutsche Lösung braucht keine', !q('#trKbToggle'));

    // I · Satz meistern
    state.satzBox[satz.ru] = BOX_MAX - 1;
    buildTransTask(satz); renderUebersetzen();
    q('#trInput').value = trTask.solution;
    q('#trInput').dispatchEvent(new Event('input'));
    q('#trConfirm').click();
    pruefe('I1 der Satz sitzt jetzt', satzBox(satz) === BOX_MAX);
    pruefe('I2 und wird gemeldet',
      !!q('.meister') && q('.meister').textContent.indexOf('Satz gemeistert') !== -1,
      q('.meister') ? q('.meister').textContent : 'keine');

    // J · Buchstabe meistern
    state = defaultState();
    ansichtenZuruecksetzen();
    ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
    state.abcBox['ф'] = BOX_MAX - 1;
    setTab('buchstaben');
    abcRichtung = 'laut'; abcQ = null; renderBuchstaben();
    abcPicked = abcQ.b[1];
    abcPruefen();
    pruefe('J1 der Buchstabe sitzt', abcBox(abcQ.b) === BOX_MAX);
    pruefe('J2 und wird gemeldet',
      !!q('.meister') && q('.meister').textContent.indexOf('Buchstabe gemeistert') !== -1,
      q('.meister') ? q('.meister').textContent : 'keine');
    pruefe('J3 mit der eigenen Zahl',
      q('.meister').textContent.indexOf('von ' + ALPHABET.length + ' Buchstaben') !== -1);
  } catch (e) {
    log.push('AUSNAHME: ' + e.message + ' | ' + (e.stack || '').split('\n')[1]);
  }

  var pre = document.createElement('pre');
  pre.id = 'testlog';
  pre.textContent = log.join('\n');
  document.body.appendChild(pre);
  var f = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
  document.title = f.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + f.length;
});
`;

writeFileSync(BAU + '/t-meister.html', testseite(html, test));
console.log('Meister-Testseite geschrieben');
