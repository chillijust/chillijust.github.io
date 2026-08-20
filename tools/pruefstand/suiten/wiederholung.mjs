// Prüft die Wiederholungslogik in «Tippen» und «Übersetzen».
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function leer() { state.boxes = {}; state.lastSeen = {}; state.satzBox = {}; state.satzSeen = {}; }
function stufe(liste, n, alter) {
  liste.forEach(function (v) {
    state.boxes[v.id] = n;
    state.lastSeen[v.id] = Date.now() - (alter || 0);
  });
}

try {
  state.settings.tippenStufe = 3;
  state.settings.auffrischen = 21;

  // A · Tippen: fertig heißt raus
  leer();
  var drei = ALL_VOCAB.slice(0, 3);
  stufe(drei, 3);
  tippenModus = 'lernen';
  pruefe('A1 begonnene Wörter sind offen', tippenLernen().length === 3);
  pruefe('A2 nichts zum Auffrischen', tippenWiederholung().length === 0 && tippenRuhend().length === 0);
  stufe([drei[0]], BOX_MAX);
  pruefe('A3 fertiges Wort verlässt den Lernstapel', tippenLernen().length === 2);
  pruefe('A4 es ruht, statt sofort wiederzukommen',
    tippenRuhend().length === 1 && tippenWiederholung().length === 0);

  // B · Nach der Frist kommt es zurück
  stufe([drei[0]], BOX_MAX, 22 * TAG);
  pruefe('B1 nach 22 Tagen fällig', tippenWiederholung().length === 1 && tippenRuhend().length === 0);
  state.settings.auffrischen = 30;
  pruefe('B2 längere Frist hält es zurück', tippenWiederholung().length === 0);
  state.settings.auffrischen = 7;
  pruefe('B3 kürzere Frist holt es früher', tippenWiederholung().length === 1);
  state.settings.auffrischen = 21;

  // C · Richtig getippt heißt wieder raus
  tippenModus = 'wiederholung';
  setTab('tippen');
  pruefe('C1 Wiederholung zeigt genau dieses Wort', tWord === drei[0], tWord && tWord.ru);
  pruefe('C2 die Karte sagt, worum es geht',
    q('.task-label').textContent.indexOf('Sicherheit') !== -1, q('.task-label').textContent);
  q('#tInput').value = drei[0].ru;
  q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tCheck').click();
  pruefe('C3 Stufe bleibt auf dem Höchstwert', state.boxes[drei[0].id] === BOX_MAX);
  pruefe('C4 und es ist wieder draußen',
    tippenWiederholung().length === 0 && tippenRuhend().length === 1);

  // D · Falsch getippt schickt es zurück ins Lernen
  stufe([drei[1]], BOX_MAX, 22 * TAG);
  tippenModus = 'wiederholung';
  tWord = null; tResult = null;
  renderTippen();
  q('#tInput').value = 'квакс';
  q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tCheck').click();
  pruefe('D1 Fehler senkt die Stufe', state.boxes[drei[1].id] === BOX_MAX - 1);
  pruefe('D2 es steht wieder im Lernstapel',
    tippenLernen().indexOf(drei[1]) !== -1, String(tippenLernen().length));

  // E · Kacheln und Umschaltung
  leer();
  stufe(ALL_VOCAB.slice(0, 4), 3);
  stufe(ALL_VOCAB.slice(4, 6), BOX_MAX, 22 * TAG);
  tippenModus = 'lernen';
  tWord = null; tResult = null;
  setTab('tippen');
  filterSetzen(true); renderFilter();
  var kacheln = alle('[data-fw="tmodus"]');
  pruefe('E1 drei Stapel mit Beständen', kacheln.length === 3 &&
    kacheln[0].textContent.indexOf('Lernen · 4') === 0 &&
    kacheln[1].textContent.indexOf('Wiederholung · 2') === 0 &&
    kacheln[2].textContent.indexOf('Alle · 6') === 0,
    kacheln.map(function (k) { return k.textContent; }).join(' | '));
  kacheln[1].click();
  pruefe('E2 Klick wechselt den Stapel', tippenModus === 'wiederholung' &&
    (state.boxes[tWord.id] || 0) === BOX_MAX, tWord && tWord.ru);
  // Lernstapel leeren: dann muss von selbst umgeschaltet werden
  leer();
  stufe(ALL_VOCAB.slice(4, 6), BOX_MAX, 22 * TAG);
  tippenModus = 'lernen';
  tWord = null; tResult = null;
  renderTippen();
  pruefe('E3 leerer Lernstapel schaltet auf Wiederholung',
    tippenModus === 'wiederholung' && !!q('#tInput'), tippenModus);
  // Beides leer: Leerzustand nennt den Termin
  leer();
  stufe(ALL_VOCAB.slice(4, 6), BOX_MAX);
  tippenModus = 'lernen';
  tWord = null; tResult = null;
  renderTippen();
  pruefe('E4 alles getippt', !q('#tInput') && main.textContent.indexOf('Alles getippt') !== -1);
  pruefe('E5 der Leerzustand nennt den Termin',
    main.textContent.indexOf('in 21 Tagen') !== -1 || main.textContent.indexOf('morgen') !== -1,
    main.textContent.slice(0, 200));

  // F · Übersetzen: derselbe Gedanke
  leer();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  trLevel = 1; trModus = 'lernen'; trTask = null;
  setTab('uebersetzen');
  var alleEins = freieSaetze(1);
  pruefe('F1 alle Sätze der Stufe sind offen', trLernen(1).length === alleEins.length);
  var s0 = alleEins[0];
  state.satzBox[s0.ru] = BOX_MAX;
  state.satzSeen[s0.ru] = Date.now();
  pruefe('F2 sitzender Satz verlässt den Lernstapel',
    trLernen(1).length === alleEins.length - 1 && trRuhend(1).length === 1);
  pruefe('F3 und ist noch nicht fällig', trWiederholung(1).length === 0);
  state.satzSeen[s0.ru] = Date.now() - 22 * TAG;
  pruefe('F4 nach der Frist ist er fällig', trWiederholung(1).length === 1);

  // G · Lösen und Zurückfallen
  trModus = 'wiederholung'; trTask = null;
  buildTransTask();
  renderUebersetzen();
  pruefe('G1 Wiederholung zeigt genau diesen Satz', trTask.satz === s0, trTask && trTask.satz.ru);
  // Ein sitzender Satz wird geschrieben, nicht gelegt — die Auffrischung prüft
  // dasselbe wie die letzten beiden Lernrunden.
  pruefe('G1b die Sicherheitsrunde wird getippt',
    trTask.art === 'tippen' && !!q('#trInput') && !q('[data-wtile]'), trTask.art);
  trEingabe = trTask.solution;
  q('#trInput').value = trEingabe;
  q('#trInput').dispatchEvent(new Event('input'));
  q('#trConfirm').click();
  pruefe('G2 richtig gelöst', trCorrect === true);
  pruefe('G3 Stufe bleibt oben', satzBox(s0) === BOX_MAX);
  pruefe('G4 und der Satz ist wieder draußen',
    trWiederholung(1).length === 0 && trRuhend(1).length === 1);
  state.satzSeen[s0.ru] = Date.now() - 22 * TAG;
  trModus = 'wiederholung'; trTask = null; trBuilt = []; trPhase = 'ask';
  buildTransTask();
  renderUebersetzen();
  q('#trReveal').click();
  pruefe('G5 Aufdecken senkt die Stufe', satzBox(s0) === BOX_MAX - 1);
  pruefe('G6 der Satz steht wieder im Lernstapel', trLernen(1).indexOf(s0) !== -1);

  // H · Kacheln in Übersetzen
  trModus = 'lernen'; trTask = null; trBuilt = []; trPhase = 'ask';
  buildTransTask();
  renderUebersetzen();
  filterSetzen(true); renderFilter();
  var tk = alle('[data-fw="trmodus"]');
  // Drei Stapel: «Alle» kam dazu, damit Fertiges vor Ablauf der Frist noch
  // einmal drankommen kann.
  pruefe('H1 drei Stapel mit Beständen', tk.length === 3 &&
    tk[0].textContent.indexOf('Lernen · ' + trLernen(1).length) === 0 &&
    tk[2].textContent.indexOf('Alle · ' + freieSaetze(1).length) === 0,
    tk.map(function (k) { return k.textContent; }).join(' | '));
  pruefe('H2 Stufenwahl steht darüber', !!q('[data-fw="stufe"][data-fv="1"]'));
  filterSetzen(false);
  // Alle Sätze der Stufe sitzen lassen
  freieSaetze(1).forEach(function (x) {
    state.satzBox[x.ru] = BOX_MAX;
    state.satzSeen[x.ru] = Date.now();
  });
  trModus = 'lernen'; trTask = null;
  buildTransTask();
  renderUebersetzen();
  pruefe('H3 sitzt alles, sagt die Ansicht das',
    !q('.built') && !q('#trInput') && main.textContent.indexOf('sitzt') !== -1,
    main.textContent.slice(0, 120));

  // I · Einstellung — die Frist zählt man hoch und runter, sie ist keine Liste
  // von vier Meinungen mehr.
  state.settings.auffrischen = 21;
  setTab('einstellungen');
  function taste(schritt) {
    return alle('[data-zaehler="auffrischen"]').filter(function (b) {
      return b.dataset.schritt === String(schritt);
    })[0];
  }
  pruefe('I1 die Frist hat zwei Tasten', !!taste(-1) && !!taste(1));
  pruefe('I1b und zeigt ihren Wert', q('.zaehler-wert').textContent.indexOf('21') === 0,
    q('.zaehler-wert').textContent);
  taste(1).click();
  pruefe('I2 plus zählt hoch', state.settings.auffrischen === 22,
    String(state.settings.auffrischen));
  taste(-1).click(); taste(-1).click();
  pruefe('I2b minus zählt runter', state.settings.auffrischen === 20,
    String(state.settings.auffrischen));
  pruefe('I2c und die Ansicht zieht mit',
    q('.zaehler-wert').textContent.indexOf('20') === 0, q('.zaehler-wert').textContent);
  // Ein Tipp zählt **einmal**. Gedrückt halten zählt weiter, und der Klick, der
  // beim Loslassen noch kommt, darf keinen Tag draufsetzen — darum zählt schon
  // das Drücken allein nicht.
  state.settings.auffrischen = 21;
  renderEinstellungen();
  taste(1).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  pruefe('I2d Drücken allein zählt noch nicht', state.settings.auffrischen === 21,
    String(state.settings.auffrischen));
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  taste(1).click();
  pruefe('I2e ein Tipp zählt genau einen Tag', state.settings.auffrischen === 22,
    String(state.settings.auffrischen));

  state.settings.auffrischen = 7;
  pruefe('I3 wirkt auf das Intervall', intervallFuer(BOX_MAX) === 7 * TAG);
  pruefe('I4 untere Stufen bleiben unberührt', intervallFuer(1) === INTERVALL[1]);

  // Die Grenzen: unter einem Tag wäre «fertig» kein Zustand mehr, über einem
  // Jahr keine Frist. **Am Anschlag sperrt die Taste**, sonst tippt man ins
  // Leere und hält die Zahl für kaputt.
  state.settings.auffrischen = AUFFRISCH_MIN;
  renderEinstellungen();
  pruefe('I5 am unteren Anschlag sperrt Minus', taste(-1).disabled && !taste(1).disabled);
  taste(-1).click();
  pruefe('I5b und ändert nichts', state.settings.auffrischen === AUFFRISCH_MIN,
    String(state.settings.auffrischen));
  state.settings.auffrischen = AUFFRISCH_MAX;
  renderEinstellungen();
  pruefe('I6 am oberen Anschlag sperrt Plus', taste(1).disabled && !taste(-1).disabled);

  // Ein Stand aus dem Speicher wird auf die Grenzen gezogen, nicht verworfen:
  // Bis 1.4.1 gab es nur 7/14/21/30 — jeder andere Wert fiel auf 21 zurück.
  pruefe('I7 zu große Frist wird gekappt',
    mergeState({ settings: { auffrischen: 9999 } }).settings.auffrischen === AUFFRISCH_MAX);
  // **Null ist seit ADR 0074 ein gültiger Wert** und heißt «gar nicht mehr».
  // Bis 2.4.15 galt sie als Unsinn und fiel auf 21 zurück.
  pruefe('I7b Unsinn fällt auf die Vorgabe',
    mergeState({ settings: { auffrischen: -3 } }).settings.auffrischen === 21,
    String(mergeState({ settings: { auffrischen: -3 } }).settings.auffrischen));
  pruefe('I7b2 die Null überlebt',
    mergeState({ settings: { auffrischen: 0 } }).settings.auffrischen === 0,
    String(mergeState({ settings: { auffrischen: 0 } }).settings.auffrischen));
  pruefe('I7c ein alter Wert überlebt',
    mergeState({ settings: { auffrischen: 14 } }).settings.auffrischen === 14);
  pruefe('I7d ein krummer auch',
    mergeState({ settings: { auffrischen: 18 } }).settings.auffrischen === 18);
  state.settings.auffrischen = 21;

  // ── J · Null heißt gar nicht (ADR 0074) ───────────────────
  // Die Frist steht an genau einer Stelle: intervallFuer(). Alles andere —
  // Wörter, Sätze, Buchstaben, Regeln — fragt sie. Eine Frist, die nie
  // abläuft, ist unendlich, nicht null.
  state.settings.auffrischen = 0;
  pruefe('J1 abgeschaltet ist die Frist unendlich',
    intervallFuer(BOX_MAX) === Infinity, String(intervallFuer(BOX_MAX)));
  pruefe('J2 die Leiter darunter bleibt, wie sie war',
    intervallFuer(0) === INTERVALL[0] && intervallFuer(1) === INTERVALL[1],
    intervallFuer(1) + ' / ' + INTERVALL[1]);

  state = defaultState();
  ansichtenZuruecksetzen();
  state.settings.auffrischen = 0;
  var lang = ALL_VOCAB[0];
  state.boxes[lang.id] = BOX_MAX;
  state.lastSeen[lang.id] = 1;   // vor Ewigkeiten gesehen
  pruefe('J3 ein fertiges Wort wird nie wieder fällig',
    faellig(lang, Date.now()) === false);
  var s0 = SENTENCES[0];
  state.satzBox[s0.ru] = BOX_MAX;
  state.satzSeen[s0.ru] = 1;
  pruefe('J4 ein fertiger Satz auch', satzFaellig(s0, Date.now()) === false);
  // Und mit einer Frist kommt es zurück — sonst hätte die Null nichts bewiesen.
  state.settings.auffrischen = 21;
  pruefe('J5 mit Frist kommt es sehr wohl zurück',
    faellig(lang, Date.now()) === true && satzFaellig(s0, Date.now()) === true);

  // Was im Zählerfeld steht: «0 Tage» hieße «sofort wieder fällig».
  state.settings.auffrischen = 0;
  einstReiter = 'lernweg';
  setTab('einstellungen');
  var feld = q('[data-zaehler="auffrischen"]').parentNode.querySelector('.zaehler-wert');
  pruefe('J6 null steht als «gar nicht» da, nicht als «0 Tage»',
    feld.textContent.indexOf('gar nicht') !== -1 &&
    feld.textContent.indexOf('0') === -1, feld.textContent);
  pruefe('J7 und die Minustaste ist am Anschlag zu',
    alle('[data-zaehler="auffrischen"]').filter(function (t) {
      return t.dataset.schritt === '-1';
    })[0].disabled === true);

  // Der Leerzustand darf kein Wiedersehen versprechen, das es nicht gibt.
  ALL_VOCAB.forEach(function (v) {
    state.boxes[v.id] = BOX_MAX;
    state.lastSeen[v.id] = 1;
  });
  // **Vier Leerzustände versprechen ein Wiedersehen** — zwei in «Tippen», zwei
  // in «Übersetzen». Bei abgeschalteter Frist gibt es keins. Geprüft werden
  // alle vier: Die erste Fassung dieser Reparatur fasste zwei an, und die
  // dritte hinterließ «Die nächste Auffrischung kommt .»
  var stellen = [
    ['tippen', 'wiederholung'], ['tippen', 'lernen'],
    ['uebersetzen', 'wiederholung'], ['uebersetzen', 'lernen']
  ];
  var schlecht = [];
  stellen.forEach(function (p) {
    if (p[0] === 'tippen') tippenModus = p[1]; else trModus = p[1];
    setTab(p[0]);
    var t = main.textContent;
    if (/Infinity|NaN|kommt \.|kommt \s*\./.test(t)) schlecht.push(p.join('/') + ': ' + t.slice(0, 90));
  });
  pruefe('J8 kein Leerzustand verspricht ein Wiedersehen, das es nicht gibt',
    schlecht.length === 0, schlecht.join(' | '));
  tippenModus = 'lernen'; trModus = 'lernen';

  // Und die Null überlebt den Sicherungscode: Ein Oder-Rückfall auf 21 hätte
  // sie still verschluckt, weil eine Null in JavaScript falsch ist.
  state.settings.auffrischen = 0;
  pruefe('J9 die Null übersteht Sichern und Einspielen',
    mergeState(decodeBackup(encodeBackup())).settings.auffrischen === 0,
    String(mergeState(decodeBackup(encodeBackup())).settings.auffrischen));
  state.settings.auffrischen = 21;
  pruefe('J10 und eine echte Frist auch',
    mergeState(decodeBackup(encodeBackup())).settings.auffrischen === 21,
    String(mergeState(decodeBackup(encodeBackup())).settings.auffrischen));
  // ── W · Fertigwerden geht vor Auffrischen (ADR 0090) ──────
  // **Gemeldet:** «Wenn ich zu einem früheren Set gehe, um es zu
  // vervollständigen, brauche ich eine Ewigkeit — es kommen zu viele
  // Wiederholungen dazwischen.» Gemessen waren es **null** von hundert
  // Ziehungen: Unter dem Fälligen stand nichts Unfertiges, und die Bedingung
  // nahm dann immer das Fällige.
  state = defaultState();
  ansichtenZuruecksetzen();
  ['lernsets', 'tippen', 'uebersetzen'].forEach(function (k) { state.tutUebung[k] = 1; });
  tutEnde();
  var wW = LERNSETS[0].woerter;
  var wGestern = Date.now() - TAG;
  var wLange = Date.now() - 40 * TAG;
  wW.forEach(function (v, i) {
    var fehlt = i >= wW.length - 2;
    state.boxes[v.id] = fehlt ? BOX_MAX - 1 : BOX_MAX;
    state.lastSeen[v.id] = fehlt ? wGestern : wLange;
  });
  var wFehlt = wW.slice(wW.length - 2).map(function (v) { return v.id; });
  uebModus = 'lernsets'; uebAuswahl = 0; state.setBleib = 0;
  pruefe('W1 die Lage stimmt: zehn fällig, zwei unfertig',
    faelligeAnzahl(uebPool()) === wW.length - 2 && wFehlt.length === 2,
    String(faelligeAnzahl(uebPool())));
  var wTreffer = 0;
  for (var wi = 0; wi < 100; wi++) {
    var wV = waehleWort(uebPool());
    if (wV && wFehlt.indexOf(wV.id) !== -1) wTreffer++;
  }
  // Ein Drittel ist die Grenze zwischen «kommt dran» und «kommt nicht dran».
  // Vor der Reparatur waren es null.
  pruefe('W2 die fehlenden Wörter kommen wirklich dran', wTreffer > 33,
    wTreffer + ' von 100');
  // **Und das Auffrischen hört nicht auf** — es soll nur nicht alles besetzen.
  pruefe('W3 die gemeisterten kommen weiter dran', wTreffer < 95,
    wTreffer + ' von 100');

  // **Eine angefangene Folge ist keine Wiedervorlage.** Jeder Treffer erneuert
  // den Zeitstempel; ohne diese Regel galt ein Wort nach dem ersten getippten
  // Treffer eine Woche lang als nicht fällig — und kam nie zum zweiten.
  var wEins = ALL_VOCAB[0];
  state.boxes[wEins.id] = BOX_MAX - 1;
  state.lastSeen[wEins.id] = Date.now();
  state.tippFolge[wEins.id] = 0;
  pruefe('W4 frisch geübt und ohne Folge: nicht fällig',
    faellig(wEins, Date.now()) === false);
  updateBox(wEins.id, true, true);
  pruefe('W5 nach dem ersten getippten Treffer aber schon',
    state.tippFolge[wEins.id] === 1 && faellig(wEins, Date.now()) === true,
    String(state.tippFolge[wEins.id]));
  updateBox(wEins.id, true, true);
  updateBox(wEins.id, true, true);
  pruefe('W6 die erfüllte Folge wird abgeräumt',
    state.boxes[wEins.id] === BOX_MAX && (state.tippFolge[wEins.id] || 0) === 0,
    state.boxes[wEins.id] + ' / ' + state.tippFolge[wEins.id]);
  // Sonst gälte das gemeisterte Wort für immer als fällig.
  state.lastSeen[wEins.id] = Date.now();
  pruefe('W7 und danach ruht es wieder', faellig(wEins, Date.now()) === false);
  state.setBleib = null;

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

writeFileSync(BAU + '/t-wiederholung.html', testseite(html, test));
console.log('Testseite geschrieben');
