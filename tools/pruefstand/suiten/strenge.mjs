// Prüft die drei Strengen aus Etappe 5 (ADR 0056):
//
//   a) **Rekonstruktion** — wer sich verschreibt, schreibt einmal nach.
//   b) **Tagesmaß** — wie viel Neues an einem Tag anfangen darf.
//   c) **Fehlerprofil** — Ablenker aus den eigenen Verwechslungen.
//
// Alle drei sind Einstellungen. Die Suite prüft darum jedes Mal beides: dass
// die Strenge wirkt, **und** dass sie sich abschalten lässt. Eine Strenge ohne
// Ausschalter wäre eine Zumutung, ein Ausschalter ohne Wirkung eine Attrappe.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

// Ein Textfeld so beschreiben, wie es ein Finger täte.
function schreibe(el, wert) {
  el.value = wert;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
// Ein Wort mit mehreren Zeichen erzwingen — bei «он» bleibt nach dem
// Verdrehen nichts übrig, woran sich etwas zeigen ließe.
function langesWort(pool) {
  var lang = pool.filter(function (v) {
    return v.ru.length >= 5 && v.ru.indexOf(' ') === -1;
  });
  return lang.length ? lang[0] : pool[0];
}
function verdreht(w) { return w.charAt(1) + w.charAt(0) + w.slice(2); }

try {
  tutEnde();
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Die Vorgaben ──────────────────────────────────────
  pruefe('A1 nachschreiben gilt für Wörter, nicht für Sätze',
    defaultSettings().rekonstruktion === 'woerter');
  pruefe('A2 acht neue Wörter am Tag', defaultSettings().tagesmass === 8);
  pruefe('A3 das Fehlerprofil ist an', defaultSettings().fehlerprofil === true);
  pruefe('A4 ein Stand von vor 1.9.0 bekommt alle drei', (function () {
    var alt = mergeState({ settings: {} }).settings;
    return alt.rekonstruktion === 'woerter' && alt.tagesmass === 8 && alt.fehlerprofil === true;
  })());
  pruefe('A5 ein unsinniger Wert fällt auf die Vorgabe zurück',
    mergeState({ settings: { rekonstruktion: 'vielleicht' } }).settings.rekonstruktion === 'woerter');
  pruefe('A6 das Tagesmaß bleibt in seinen Grenzen',
    mergeState({ settings: { tagesmass: 999 } }).settings.tagesmass === TAGESMASS_MAX &&
    mergeState({ settings: { tagesmass: -3 } }).settings.tagesmass === 8,
    String(mergeState({ settings: { tagesmass: 999 } }).settings.tagesmass));

  // ── B · Rekonstruktion in «Tippen» ────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) {
    state.boxes[v.id] = state.settings.tippenStufe;
    state.lastSeen[v.id] = Date.now();
  });
  tippenModus = 'lernen';
  setTab('tippen');
  tWord = langesWort(tippenPool());
  renderTippen();
  var wort = tWord.ru;
  schreibe(q('#tInput'), verdreht(wort));
  q('#tCheck').click();
  pruefe('B1 falsch gewertet', tResult === 'wrong', String(tResult));
  pruefe('B2 die Nachschrift steht da', !!q('.reko') && !!q('#rekoInput'));
  pruefe('B3 sie zeigt die richtige Schreibweise',
    q('.reko-vorlage').textContent === wort, q('.reko-vorlage').textContent);
  pruefe('B4 «Weiter» ist zu', q('#tNext').disabled === true);
  var stufeVorher = state.boxes[tWord.id];
  var serieVorher = state.streak;

  // Halb hingeschrieben zählt nicht.
  schreibe(q('#rekoInput'), wort.slice(0, 2));
  pruefe('B5 halb geschrieben öffnet nichts', q('#tNext').disabled === true);

  schreibe(q('#rekoInput'), wort);
  pruefe('B6 richtig nachgeschrieben öffnet den Weg', q('#tNext').disabled === false);
  pruefe('B7 die Zeile sagt, dass es sitzt', !!q('.reko.sitzt') && !q('#rekoInput'));

  // **Die Nachschrift bewertet nichts.** Sonst tippte man sich aus dem Fehler.
  pruefe('B8 die Stufe bleibt, wo sie nach dem Fehler war',
    state.boxes[tWord.id] === stufeVorher, String(state.boxes[tWord.id]));
  pruefe('B9 und die Serie bleibt gerissen',
    state.streak === serieVorher && state.streak === 0, String(state.streak));

  q('#tNext').click();
  pruefe('B10 danach ist die Nachschrift weg', reko === null && !q('.reko'));

  // Richtig geschrieben verlangt nie eine Nachschrift.
  tWord = langesWort(tippenPool());
  renderTippen();
  schreibe(q('#tInput'), tWord.ru);
  q('#tCheck').click();
  pruefe('B11 wer richtig liegt, schreibt nichts nach',
    reko === null && !q('.reko') && q('#tNext').disabled === false);
  q('#tNext').click();

  // Die eingebaute Tastatur schreibt in dieselbe Ablage.
  tWord = langesWort(tippenPool());
  renderTippen();
  var w2 = tWord.ru;
  schreibe(q('#tInput'), verdreht(w2));
  q('#tCheck').click();
  reko.kb = true;
  renderTippen();
  var tasten = alle('[data-rekokey]');
  pruefe('B12 die Nachschrift hat eine eigene Tastatur', tasten.length > 30,
    String(tasten.length));
  tasten.filter(function (t) { return t.dataset.rekokey === w2.charAt(0); })[0].click();
  pruefe('B13 eine Taste schreibt in die Nachschrift',
    reko.eingabe === w2.charAt(0), reko.eingabe);

  // ── C · «Nie» schaltet sie ab ─────────────────────────────
  state.settings.rekonstruktion = 'nie';
  tWord = langesWort(tippenPool());
  tResult = null; tEingabe = ''; reko = null;
  renderTippen();
  schreibe(q('#tInput'), verdreht(tWord.ru));
  q('#tCheck').click();
  pruefe('C1 «nie» verlangt keine Nachschrift',
    reko === null && !q('.reko') && q('#tNext').disabled === false);
  state.settings.rekonstruktion = 'woerter';

  // ── D · Ganze Sätze bleiben in der Vorgabe draußen ────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  var satz = SENTENCES.filter(satzFrei)[0];
  trDir = 'de-ru'; trLevel = satz.stufe; trTask = null;
  setTab('uebersetzen');
  buildTransTask(satz);

  // **«Auch Sätze» heißt alle fünf Stufen, nicht zwei** (ADR 0073). Die Form
  // steigt mit der Satzstufe — erst Kacheln, dann Tippen — und die Richtung
  // wechselt mit ihr. Bis 2.4.14 verlangte die Einstellung nur bei getippten
  // Aufgaben etwas und griff damit in zwei von fünf Stufen. Geprüft wird
  // darum die ganze Leiter, nicht eine Stelle darauf.
  (function () {
    var vorher = state.settings.rekonstruktion;
    state.settings.rekonstruktion = 'immer';
    var d = SENTENCES.filter(satzFrei)[0];
    var alterDir = trDir, alterModus = trModus;
    trDir = 'gemischt'; trModus = 'alle'; trLevel = d.stufe;
    var gesehen = [];
    for (var box = 0; box <= BOX_MAX; box++) {
      state.satzBox[d.ru] = box;
      trTask = null;
      buildTransTask(d);
      if (trTask.art === 'tippen') trEingabe = 'квак квак';
      else trBuilt = [trTask.tiles[0].key];
      trPruefen();
      renderUebersetzen();
      gesehen.push(box + ':' + trTask.art + '/' + (trTask.loesungRu ? 'ru' : 'de') +
        '=' + (reko ? 'ja' : 'nein'));
      // Auf der russischen Seite muss sie kommen — gelegt wie getippt.
      if (trTask.loesungRu) {
        pruefe('D5.' + box + ' Stufe ' + box + ' (' + trTask.art + ', nach RU) verlangt sie',
          !!reko && reko.loesung === d.ru && q('#trNext').disabled === true,
          reko ? 'da, Weiter ' + (q('#trNext').disabled ? 'zu' : 'offen') : 'keine');
      } else {
        // Auf der deutschen nicht: Einen deutschen Satz abzuschreiben lehrt
        // kein Russisch. Das ist eine Entscheidung, keine Lücke.
        pruefe('D6.' + box + ' Stufe ' + box + ' (nach DE) verlangt nichts',
          reko === null && q('#trNext').disabled === false,
          reko ? 'doch' : 'richtig');
      }
    }
    pruefe('D7 die Leiter hat beide Formen und beide Richtungen',
      /kacheln/.test(gesehen.join()) && /tippen/.test(gesehen.join()) &&
      /\/ru=/.test(gesehen.join()) && /\/de=/.test(gesehen.join()),
      gesehen.join(' '));
    state.settings.rekonstruktion = vorher;
    trDir = alterDir; trModus = alterModus;
    delete state.satzBox[d.ru];
    trTask = null;
    trDir = 'de-ru'; trLevel = satz.stufe;
    setTab('uebersetzen');
    buildTransTask(satz);
  })();
  if (trTask && trTask.art === 'tippen' && trTask.loesungRu) {
    trEingabe = 'квакквак';
    trPruefen();
    pruefe('D1 ein Satz verlangt in der Vorgabe keine Nachschrift', reko === null);
    state.settings.rekonstruktion = 'immer';
    trPhase = 'ask'; trEingabe = 'квакквак';
    trPruefen();
    pruefe('D2 «auch Sätze» verlangt sie doch', !!reko && reko.loesung === satz.ru,
      reko ? reko.loesung : 'keine');
    state.settings.rekonstruktion = 'woerter';
    reko = null;
  } else {
    pruefe('D1 ein Satz verlangt in der Vorgabe keine Nachschrift', true, 'kein Tippsatz');
    pruefe('D2 «auch Sätze» verlangt sie doch', true, 'kein Tippsatz');
  }

  // Wer unter fertigen Wörtern wählt, behauptet keine Schreibweise (ADR 0070).
  state.settings.rekonstruktion = 'immer';
  rekoVerlangen('книга', false, false, false);
  pruefe('D3 eine Wahl verlangt keine Nachschrift', reko === null);
  rekoVerlangen('книга', true, true, false);
  pruefe('D4 richtig verlangt nie etwas', reko === null);
  state.settings.rekonstruktion = 'woerter';

  // ── E · Das Tagesmaß ──────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  pruefe('E1 am Anfang war heute nichts neu', neuHeute() === 0 && !tagesmassVoll());
  var neuling = ALL_VOCAB[0];
  updateBox(neuling.id, true);
  pruefe('E2 ein nie gesehenes Wort zählt als neu', neuHeute() === 1, String(neuHeute()));
  updateBox(neuling.id, true);
  pruefe('E3 dasselbe Wort noch einmal zählt nicht', neuHeute() === 1, String(neuHeute()));
  for (var i = 1; i < state.settings.tagesmass; i++) updateBox(ALL_VOCAB[i].id, true);
  pruefe('E4 das Maß ist voll', neuHeute() === state.settings.tagesmass && tagesmassVoll());
  pruefe('E5 der Vorrat schrumpft auf Bekanntes',
    uebVorrat(ALL_VOCAB).length === state.settings.tagesmass,
    String(uebVorrat(ALL_VOCAB).length));
  pruefe('E6 und die Auswahl liefert nur noch Bekanntes', (function () {
    for (var k = 0; k < 40; k++) {
      var v = waehleWort(ALL_VOCAB);
      if (!v || !state.lastSeen[v.id]) return false;
    }
    return true;
  })());
  // Ein neuer Tag räumt den Zähler.
  state.neuHeute.tag = 0;
  pruefe('E7 morgen ist der Zähler leer', neuHeute() === 0 && !tagesmassVoll());
  state.neuHeute.tag = heuteNr();

  // Null heißt: keine Grenze.
  state.settings.tagesmass = 0;
  pruefe('E8 ohne Grenze bremst nichts',
    !tagesmassVoll() && uebVorrat(ALL_VOCAB).length === ALL_VOCAB.length);
  state.settings.tagesmass = 8;

  // Der Leerzustand: Er muss dastehen **und** einen Ausgang haben.
  state = defaultState();
  ansichtenZuruecksetzen();
  state.settings.tagesmass = 1;
  uebModus = 'freestyle'; uebThema = Object.keys(VOCAB_THEMES)[3];
  var thema = VOCAB_THEMES[uebThema];
  updateBox(ALL_VOCAB[0].id, true);   // ein neues Wort aus einem anderen Thema
  setTab('freestyle');
  pruefe('E9 der Leerzustand steht da',
    !!q('.leer') && main.textContent.indexOf('Tagesmaß') !== -1,
    thema ? 'Thema ' + uebThema : '');
  pruefe('E10 er hat zwei Ausgänge', !!q('#massEinst') && !!q('#massWiederholen'));
  q('#massWiederholen').click();
  pruefe('E11 «Wiederholen» führt aus der Sackgasse',
    uebThema === 'Alle' && !!uebQ && !!state.lastSeen[uebQ.word.id],
    uebQ ? uebQ.word.ru : 'keine Frage');

  // Und die Kachel meldet es, damit die Empfehlung nicht hinschickt.
  state = defaultState();
  ansichtenZuruecksetzen();
  state.settings.tagesmass = 1;
  updateBox(LERNSETS[0].woerter[0].id, true);
  state.boxes[LERNSETS[0].woerter[0].id] = BOX_MAX;
  state.lastSeen[LERNSETS[0].woerter[0].id] = Date.now();
  var stand = uebungsStand('lernsets');
  pruefe('E12 die Kachel meldet ein volles Maß nicht als Arbeit',
    !stand.leer || stand.text.indexOf('Tagesmaß') !== -1, stand.text);

  // ── F · Das Fehlerprofil ──────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  var a = ALL_VOCAB[0], b = ALL_VOCAB[1], c = ALL_VOCAB[2];
  verwechseltNotieren(a.id, b.id);
  pruefe('F1 eine Verwechslung wird notiert', state.verwechselt[a.id][b.id] === 1);
  verwechseltNotieren(a.id, b.id);
  verwechseltNotieren(a.id, c.id);
  pruefe('F2 die häufigere steht vorn',
    verwechseltMit(a.id).map(function (v) { return v.id; }).join() === b.id + ',' + c.id,
    verwechseltMit(a.id).map(function (v) { return v.id; }).join());
  verwechseltNotieren(a.id, a.id);
  pruefe('F3 ein Wort verwechselt sich nicht mit sich selbst', !state.verwechselt[a.id][a.id]);
  for (var j = 0; j < 50; j++) verwechseltNotieren(a.id, b.id);
  pruefe('F4 der Zähler läuft nicht davon',
    state.verwechselt[a.id][b.id] === VERWECHSELT_MAX,
    String(state.verwechselt[a.id][b.id]));

  pruefe('F5 abgeschaltet notiert es nichts', (function () {
    state.settings.fehlerprofil = false;
    var vorher = JSON.stringify(state.verwechselt);
    verwechseltNotieren(c.id, b.id);
    var still = JSON.stringify(state.verwechselt) === vorher && verwechseltMit(a.id).length === 0;
    state.settings.fehlerprofil = true;
    return still;
  })());

  pruefe('F6 fremde Kennungen fallen beim Verschmelzen weg', (function () {
    var v = mergeState({ verwechselt: { quatsch: { a: 1 } } }).verwechselt;
    var w = mergeState({ verwechselt: {} }).verwechselt;
    var x = {};
    x[a.id] = {};
    x[a.id][b.id] = 2;
    x[a.id]['gibtesnicht'] = 5;
    var y = mergeState({ verwechselt: x }).verwechselt;
    return Object.keys(v).length === 0 && Object.keys(w).length === 0 &&
      Object.keys(y[a.id]).join() === b.id;
  })());

  // Die Ablenker kommen aus dem Profil — höchstens zwei, sonst wäre die Frage
  // eine Wiedervorlage statt einer Aufgabe.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = 1; state.lastSeen[v.id] = Date.now(); });
  var ziel = ALL_VOCAB[5];
  state.lastSeen[ziel.id] = 0;
  state.verwechselt[ziel.id] = {};
  state.verwechselt[ziel.id][ALL_VOCAB[9].id] = 4;
  state.verwechselt[ziel.id][ALL_VOCAB[11].id] = 3;
  state.verwechselt[ziel.id][ALL_VOCAB[13].id] = 2;
  uebModus = 'freestyle'; uebThema = 'Alle';
  var mitProfil = null;
  for (var m = 0; m < 300 && !mitProfil; m++) {
    uebQ = null; uebZuruecksetzen(); uebQ = buildQuestion();
    if (uebQ && uebQ.options && uebQ.word.id === ziel.id && uebQ.mode !== 'luecke') mitProfil = uebQ;
  }
  pruefe('F7 eine Frage zu diesem Wort ist zu bekommen', !!mitProfil);
  if (mitProfil) {
    var ids = mitProfil.options.map(function (o) { return o.id; });
    pruefe('F8 die beiden häufigsten Verwechslungen stehen dabei',
      ids.indexOf(ALL_VOCAB[9].id) !== -1 && ids.indexOf(ALL_VOCAB[11].id) !== -1,
      ids.join(' '));
    pruefe('F9 aber nicht alle drei — sonst wäre es eine Wiedervorlage',
      ids.indexOf(ALL_VOCAB[13].id) === -1, ids.join(' '));
    pruefe('F10 vier Möglichkeiten, jede genau einmal',
      ids.length === 4 && ids.filter(function (x, k) { return ids.indexOf(x) !== k; }).length === 0,
      ids.join(' '));
  }

  // Abgeschaltet greift der Zufall wieder.
  state.settings.fehlerprofil = false;
  pruefe('F11 abgeschaltet liefert das Profil nichts', verwechseltMit(ziel.id).length === 0);
  state.settings.fehlerprofil = true;

  // ── G · Die Einstellungen stehen auch da ──────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  einstReiter = 'lernweg';
  setTab('einstellungen');
  pruefe('G1 das Tagesmaß ist ein Zähler auf dem Lernweg',
    alle('[data-zaehler="tagesmass"]').length === 2,
    String(alle('[data-zaehler="tagesmass"]').length));
  pruefe('G2 das Fehlerprofil steht dort auch', !!q('[data-set="fehlerprofil"]'));
  alle('[data-zaehler="tagesmass"]').filter(function (t) {
    return t.dataset.schritt === '-1';
  })[0].click();
  pruefe('G3 die Taste zählt herunter', state.settings.tagesmass === 7,
    String(state.settings.tagesmass));
  state.settings.tagesmass = 0;
  renderEinstellungen();
  var wertfeld = q('[data-zaehler="tagesmass"]').parentNode.querySelector('.zaehler-wert');
  pruefe('G4 null steht als «ohne Grenze» da, nicht als «0 neu/Tag»',
    wertfeld.textContent.indexOf('ohne Grenze') !== -1 &&
    wertfeld.textContent.indexOf('0') === -1, wertfeld.textContent);
  pruefe('G5 und die Minustaste ist am Anschlag zu',
    alle('[data-zaehler="tagesmass"]').filter(function (t) {
      return t.dataset.schritt === '-1';
    })[0].disabled === true);

  einstReiter = 'antworten';
  renderEinstellungen();
  pruefe('G6 die Nachschrift steht bei der Abgabe',
    alle('[data-wahltext="rekonstruktion"]').length === 3,
    String(alle('[data-wahltext="rekonstruktion"]').length));
  alle('[data-wahltext="rekonstruktion"]').filter(function (b) {
    return b.dataset.wert === 'nie';
  })[0].click();
  pruefe('G7 ein Tipp stellt um', state.settings.rekonstruktion === 'nie');

  // Der Auffrischzähler darf davon nichts abbekommen.
  einstReiter = 'lernweg';
  renderEinstellungen();
  var vorherFrist = state.settings.auffrischen;
  alle('[data-zaehler="auffrischen"]').filter(function (t) {
    return t.dataset.schritt === '1';
  })[0].click();
  pruefe('G8 der Auffrischzähler rechnet weiter mit seinen Grenzen',
    state.settings.auffrischen === vorherFrist + 1 && state.settings.tagesmass === 0,
    state.settings.auffrischen + '/' + state.settings.tagesmass);

  // ── H · Nichts davon steht im Sicherungscode ──────────────
  // Beobachtungen über das Gerät, kein Lernstand — wie das Tempo (ADR 0052).
  state = defaultState();
  state.verwechselt[a.id] = {};
  state.verwechselt[a.id][b.id] = 3;
  state.neuHeute = { tag: heuteNr(), n: 5 };
  var code = encodeBackup();
  var zurueck = mergeState(decodeBackup(code));
  pruefe('H1 das Fehlerprofil bleibt auf dem Gerät',
    Object.keys(zurueck.verwechselt).length === 0);
  pruefe('H2 der Tageszähler auch', zurueck.neuHeute.n === 0);
  pruefe('H3 der Code hat darum weiterhin elf Felder',
    code.split('~').length === 11, String(code.split('~').length));

  // ── I · Zurücksetzen räumt die Nachschrift weg ────────────
  reko = { loesung: 'книга', eingabe: 'кн', kb: true };
  ansichtenZuruecksetzen();
  pruefe('I1 die Nachschrift ist weg', reko === null);
  pruefe('I2 und ohne sie steht der Weg offen', rekoFertig() === true);

  // ── J · Gelegt zählt jetzt mit (ADR 0070) ─────────────────
  // Wer ein Wort aus Kacheln falsch zusammensetzt, weiß seine Schreibweise so
  // wenig wie der, der es falsch tippt. Die Wahl unter fertigen Wörtern bleibt
  // draußen — dort behauptet niemand etwas über Buchstaben.

  // Die Schlüssel, die das Wort richtig legen würden.
  function legeSchluessel(frage, wort) {
    var frei = frage.tiles.slice();
    var keys = [];
    for (var i = 0; i < wort.length; i++) {
      for (var j = 0; j < frei.length; j++) {
        if (frei[j].ch === wort.charAt(i)) { keys.push(frei[j].key); frei.splice(j, 1); break; }
      }
    }
    return keys;
  }
  // Zwei Kacheln vertauschen, sodass wirklich etwas anderes dasteht.
  function falschGelegt(frage, wort) {
    var keys = legeSchluessel(frage, wort);
    if (keys.length !== wort.length) return null;
    for (var i = 1; i < keys.length; i++) {
      if (wort.charAt(i) !== wort.charAt(0)) {
        var k = keys.slice();
        k[0] = keys[i]; k[i] = keys[0];
        return k;
      }
    }
    return null;   // ein Wort aus lauter gleichen Buchstaben — gibt es nicht
  }

  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) {
    state.boxes[v.id] = SATZ_STUFE;
    state.lastSeen[v.id] = Date.now();
  });
  uebModus = 'freestyle'; uebThema = 'Alle'; uebLesen = false;
  setTab('freestyle');
  var kachelFrage = null, kachelKeys = null;
  for (var t = 0; t < 400 && !kachelKeys; t++) {
    uebZuruecksetzen();
    uebQ = buildQuestion();
    if (uebQ && uebQ.mode === 'tiles') {
      kachelKeys = falschGelegt(uebQ, uebQ.word.ru);
      if (kachelKeys) kachelFrage = uebQ;
    }
  }
  pruefe('J1 eine Kachelaufgabe ist zu bekommen', !!kachelFrage);
  if (kachelFrage) {
    var kachelWort = kachelFrage.word.ru;
    uebBuilt = kachelKeys;
    uebPruefen();
    pruefe('J2 falsch gelegt ist falsch', uebCorrect === false);
    pruefe('J3 die Nachschrift steht auch in «Freestyle» da',
      !!reko && reko.loesung === kachelWort && !!q('.reko') && !!q('#rekoInput'),
      reko ? reko.loesung : 'keine');
    pruefe('J4 «Weiter» ist zu', q('#uebNext').disabled === true);
    var kachelStufe = state.boxes[kachelFrage.word.id];
    schreibe(q('#rekoInput'), kachelWort);
    pruefe('J5 richtig nachgeschrieben öffnet den Weg', q('#uebNext').disabled === false);
    pruefe('J6 und bewertet dabei nichts',
      state.boxes[kachelFrage.word.id] === kachelStufe,
      String(state.boxes[kachelFrage.word.id]));
    q('#uebNext').click();
    pruefe('J7 danach ist sie weg', reko === null && !q('.reko'));
  }

  // Die Wahl bleibt draußen — auch die Lücke, dort stehen fertige Formen.
  var wahlFrage = null;
  for (var w = 0; w < 400 && !wahlFrage; w++) {
    uebZuruecksetzen();
    uebQ = buildQuestion();
    if (uebQ && uebQ.mode !== 'tiles') wahlFrage = uebQ;
  }
  pruefe('J8 eine Auswahlaufgabe ist zu bekommen', !!wahlFrage);
  if (wahlFrage) {
    var richtigeId = wahlFrage.mode === 'luecke' ? wahlFrage.form : wahlFrage.word.id;
    uebPicked = wahlFrage.options.filter(function (o) { return o.id !== richtigeId; })[0].id;
    uebPruefen();
    pruefe('J9 falsch gewählt', uebCorrect === false);
    pruefe('J10 eine Wahl verlangt nichts nachzuschreiben',
      reko === null && !q('.reko') && q('#uebNext').disabled === false);
    q('#uebNext').click();
  }

  // «Aufdecken» führt an jeder Prüfung vorbei — vorher blieb die Nachschrift
  // der letzten Aufgabe stehen. Darum räumt sie jetzt aufgabeBeginnt weg.
  reko = { loesung: 'квак', eingabe: 'квак', kb: null };
  uebNext(true);
  pruefe('J11 eine neue Aufgabe räumt die Nachschrift weg', reko === null);
  renderUeben();
  var aufdecken = q('#uebReveal');
  if (aufdecken) {
    aufdecken.click();
    pruefe('J12 wer aufdeckt, schreibt nichts nach',
      reko === null && !q('.reko') && q('#uebNext').disabled === false);
  } else {
    pruefe('J12 wer aufdeckt, schreibt nichts nach', false, 'kein Aufdecken-Knopf');
  }

  // Und im Power-Training, wo die erste Stufe immer eine Kachelaufgabe ist.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.lastSeen[v.id] = Date.now(); });
  var gefallen = ALL_VOCAB.filter(function (v) {
    return v.ru.length >= 4 && v.ru.indexOf(' ') === -1;
  }).slice(0, PT_WOERTER);
  gefallen.forEach(function (v, i) {
    state.boxes[v.id] = SATZ_STUFE - 1;
    state.patzer[v.id] = Date.now() - i;
  });
  setTab('power');
  ptRundeStarten();
  renderPower();
  pruefe('J13 die erste Stufe ist eine Kachelaufgabe',
    !!ptQ && ptQ.stufe === 'kacheln', ptQ ? ptQ.stufe : 'keine Frage');
  if (ptQ && ptQ.stufe === 'kacheln') {
    var ptWort = ptQ.wort.ru;
    var ptKeys = falschGelegt(ptQ, ptWort);
    pruefe('J14 es lässt sich falsch legen', !!ptKeys);
    if (ptKeys) {
      ptBuilt = ptKeys;
      ptPruefen();
      pruefe('J15 falsch gelegt verlangt auch hier die Nachschrift',
        ptCorrect === false && !!reko && reko.loesung === ptWort && !!q('#rekoInput'),
        reko ? reko.loesung : 'keine');
      pruefe('J16 «Weiter» ist zu', q('#ptNext').disabled === true);
      schreibe(q('#rekoInput'), ptWort);
      pruefe('J17 richtig nachgeschrieben öffnet den Weg', q('#ptNext').disabled === false);
    }
  }

  // «Nie» schaltet auch das Gelegte ab — eine Strenge ohne Ausschalter wäre
  // eine Zumutung.
  state.settings.rekonstruktion = 'nie';
  rekoVerlangen('книга', true, false, false);
  pruefe('J18 «nie» gilt auch für Gelegtes', reko === null);
  state.settings.rekonstruktion = 'woerter';
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

writeFileSync(BAU + '/t-strenge.html', testseite(html, test));
console.log('Strenge-Testseite geschrieben');
