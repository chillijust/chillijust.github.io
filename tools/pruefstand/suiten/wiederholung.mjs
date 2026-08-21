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
function tippenAntwort(text) {
  q('#tInput').value = text;
  q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tCheck').click();
}
function stufe(liste, n, alter) {
  liste.forEach(function (v) {
    state.boxes[v.id] = n;
    state.lastSeen[v.id] = Date.now() - (alter || 0);
  });
}

try {
  state.settings.tippenStufe = 3;

  // ── A · Fertig heißt raus ─────────────────────────────────
  // ADR 0015 gilt weiter: Was auf der Endstufe steht, verlässt den Lernstapel.
  // Neu ist, wohin es geht — **nirgendwohin** (ADR 0091). Es kommt nicht
  // wieder, und der Stapel «Wiederholung», der es einmal zurückbrachte,
  // existiert nicht mehr.
  leer();
  var drei = ALL_VOCAB.slice(0, 3);
  stufe(drei, 3);
  tippenModus = 'lernen';
  pruefe('A1 begonnene Wörter sind offen', tippenLernen().length === 3);
  pruefe('A2 und noch ist keines fertig', tippenFertig().length === 0);
  stufe([drei[0]], BOX_MAX);
  pruefe('A3 fertiges Wort verlässt den Lernstapel', tippenLernen().length === 2);
  pruefe('A4 und zählt als fertig', tippenFertig().length === 1);

  // ── B · Die Endstufe ist das Ende ─────────────────────────
  // **Der Kern von ADR 0091.** Früher entschied hier die Auffrischfrist; wer
  // sie auf 21 stellte, sah das Wort nach 21 Tagen wieder. Jetzt nie mehr —
  // egal wie lange man wartet. Geprüft wird mit einem Jahr, nicht mit drei
  // Wochen: Eine Frist, die man nicht sieht, zeigt sich erst im Extrem.
  pruefe('B1 nach 22 Tagen bleibt es draußen',
    (function () {
      stufe([drei[0]], BOX_MAX, 22 * TAG);
      return tippenLernen().length === 2 && !faellig(drei[0], Date.now());
    })());
  pruefe('B2 nach einem Jahr auch',
    (function () {
      stufe([drei[0]], BOX_MAX, 365 * TAG);
      return !faellig(drei[0], Date.now());
    })());
  pruefe('B3 die Frist ist unendlich, nicht null',
    intervallFuer(BOX_MAX) === Infinity, String(intervallFuer(BOX_MAX)));
  // **Die Leiter darunter trägt weiter den Lernprozeß.** Sie zur Diskussion zu
  // stellen hieße, das Leitner-System selbst zu verstellen (ADR 0015).
  pruefe('B4 untere Stufen behalten ihre Leiter',
    intervallFuer(0) === INTERVALL[0] && intervallFuer(1) === INTERVALL[1] &&
    intervallFuer(2) === INTERVALL[2] && intervallFuer(3) === INTERVALL[3]);
  pruefe('B5 ein Wort auf Stufe 1 wird nach einem Tag fällig',
    (function () {
      leer(); stufe([drei[0]], 1, 2 * TAG);
      return faellig(drei[0], Date.now());
    })());

  // ── C · «Alle» ist der Weg zurück ─────────────────────────
  // Ohne Auffrischen braucht es einen Weg zu Gemeistertem — sonst wäre
  // «fertig» eine Einbahnstraße, und ADR 0048 verlangt das Gegenteil.
  leer();
  stufe(drei, BOX_MAX);
  tippenModus = 'alle';
  tWord = null; tResult = null;
  renderTippen();
  pruefe('C1 «Alle» liefert auch Gemeistertes', tippenAlle().length === 3);
  pruefe('C2 und die Übung gibt eine Aufgabe her', !!q('#tInput'), tippenModus);
  pruefe('C3 die Karte sagt, worum es geht',
    q('.task-label').textContent.indexOf('Festigen') !== -1,
    q('.task-label').textContent);
  var gefragtC = tWord;
  tippenAntwort(gefragtC.ru);
  pruefe('C4 Stufe bleibt auf dem Höchstwert',
    state.boxes[gefragtC.id] === BOX_MAX, String(state.boxes[gefragtC.id]));

  // ── D · Fehler senkt die Stufe ────────────────────────────
  leer();
  stufe(drei, BOX_MAX);
  tippenModus = 'alle';
  tWord = null; tResult = null;
  renderTippen();
  var gefragt = tWord;
  tippenAntwort('\u043a\u0432\u0430\u043a\u0441');
  pruefe('D1 Fehler senkt die Stufe', state.boxes[gefragt.id] === BOX_MAX - 1,
    String(state.boxes[gefragt.id]));
  pruefe('D2 es steht wieder im Lernstapel',
    tippenLernen().indexOf(gefragt) !== -1, String(tippenLernen().length));

  // ── E · Zwei Stapel, nicht drei ───────────────────────────
  leer();
  stufe(ALL_VOCAB.slice(0, 4), 3);
  stufe(ALL_VOCAB.slice(4, 6), BOX_MAX);
  tippenModus = 'lernen'; tippenSet = null;
  tWord = null; tResult = null;
  setTab('tippen');
  q('#filterKnopf').click();
  var kacheln = alle('[data-fw="tmodus"]');
  pruefe('E1 zwei Stapel mit Beständen', kacheln.length === 2 &&
    kacheln[0].textContent.indexOf('Lernen · 4') === 0 &&
    kacheln[1].textContent.indexOf('Alle · 6') === 0,
    kacheln.map(function (x) { return x.textContent; }).join(' | '));
  pruefe('E1b keiner heißt «Wiederholung»',
    kacheln.every(function (x) { return x.textContent.indexOf('Wiederholung') === -1; }));
  kacheln[1].click();
  pruefe('E2 Klick wechselt den Stapel', tippenModus === 'alle', tippenModus);

  // **Der Leerzustand ist eine Auskunft, kein Fehler.** Früher schaltete die
  // App von selbst auf «Wiederholung» um; den Stapel gibt es nicht mehr, also
  // steht dort jetzt «Alles getippt» — und ein Ausgang gehört dazu, sonst
  // wäre es eine Falle.
  leer();
  stufe(ALL_VOCAB.slice(4, 6), BOX_MAX);
  tippenModus = 'lernen';
  tWord = null; tResult = null;
  renderTippen();
  pruefe('E3 alles getippt', !q('#tInput') &&
    main.textContent.indexOf('Alles getippt') !== -1, main.textContent.slice(0, 120));
  pruefe('E4 und der Leerzustand verspricht kein Wiedersehen',
    main.textContent.indexOf('Auffrisch') === -1 &&
    main.textContent.indexOf('ruhen') === -1, main.textContent.slice(0, 200));
  pruefe('E5 er hat einen Ausgang', !!q('#tZuAlle'));
  q('#tZuAlle').click();
  pruefe('E6 und der führt zum Festigen', tippenModus === 'alle' && !!q('#tInput'),
    tippenModus);

  // ── F · Übersetzen: derselbe Gedanke ──────────────────────
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
    trLernen(1).length === alleEins.length - 1);
  pruefe('F3 und zählt als fertig', trFertig(1).indexOf(s0) !== -1);
  state.satzSeen[s0.ru] = Date.now() - 365 * TAG;
  pruefe('F4 auch nach einem Jahr kommt er nicht zurück',
    trLernen(1).indexOf(s0) === -1 && !satzFaellig(s0, Date.now()));

  // ── G · «Alle» in «Übersetzen» ────────────────────────────
  trModus = 'alle'; trTask = null;
  buildTransTask();
  pruefe('G1 «Alle» liefert auch Gemeistertes',
    trPool().length === alleEins.length, String(trPool().length));
  pruefe('G2 und eine Aufgabe kommt zustande', !!trTask);
  trModus = 'lernen'; trTask = null;

  // ── H · Die Stapel-Chips in «Übersetzen» ──────────────────
  leer();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  trLevel = 1; trModus = 'lernen'; trTask = null;
  setTab('uebersetzen');
  q('#filterKnopf').click();
  var tk = alle('[data-fw="trmodus"]');
  pruefe('H1 zwei Stapel mit Beständen', tk.length === 2 &&
    tk[0].textContent.indexOf('Lernen') === 0 &&
    tk[1].textContent.indexOf('Alle') === 0,
    tk.map(function (x) { return x.textContent; }).join(' | '));
  pruefe('H2 Stufenwahl steht darüber', !!q('[data-fw="stufe"][data-fv="1"]'));

  // ── I · Nichts verspricht mehr ein Wiedersehen ────────────
  // **Vier Leerzustände versprachen einmal eines** (ADR 0074) — zwei in
  // «Tippen», zwei in «Übersetzen». Keiner darf es mehr tun, und dazu kommen
  // die drei Regelübungen, die «ruhen bis zur nächsten Auffrischung» sagten.
  var orte = [];
  function ortPruefen(name) {
    var t = main.textContent;
    if (t.indexOf('Auffrisch') !== -1 || t.indexOf('auffrisch') !== -1 ||
      t.indexOf('ruhen bis') !== -1 || t.indexOf('zur Sicherheit') !== -1) {
      orte.push(name + ': ' + t.slice(0, 80));
    }
  }
  leer();
  stufe(ALL_VOCAB.slice(0, 2), BOX_MAX);
  tippenModus = 'lernen'; tippenSet = null; tWord = null; tResult = null;
  setTab('tippen'); ortPruefen('tippen leer');
  trLevel = 1; trModus = 'lernen'; trTask = null;
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  freieSaetze(1).forEach(function (x) {
    state.satzBox[x.ru] = BOX_MAX; state.satzSeen[x.ru] = Date.now();
  });
  setTab('uebersetzen'); ortPruefen('uebersetzen leer');
  ALPHABET.forEach(function (b) { state.abcBox[b.zeichen] = BOX_MAX; state.abcSeen[b.zeichen] = Date.now(); });
  abcQ = null; setTab('buchstaben'); ortPruefen('buchstaben leer');
  GRAMMATIK.forEach(function (b) { state.gramBox[b.id] = BOX_MAX; state.gramSeen[b.id] = Date.now(); });
  gramQ = null; setTab('grammatik'); ortPruefen('grammatik leer');
  ORTHO.forEach(function (r) { state.orthoBox[r.id] = BOX_MAX; state.orthoSeen[r.id] = Date.now(); });
  orthoQ = null; setTab('schreibung'); ortPruefen('schreibung leer');
  pruefe('I1 kein Leerzustand verspricht ein Wiedersehen',
    orte.length === 0, orte.join(' | '));

  // ── J · Die Einstellung ist weg ───────────────────────────
  pruefe('J1 keine Auffrischfrist in den Vorgaben',
    defaultSettings().auffrischen === undefined);
  pruefe('J2 ein gespeicherter Wert bringt sie nicht zurück',
    mergeState({ settings: { auffrischen: 7 } }).settings.auffrischen === undefined);
  pruefe('J3 und kein Zähler steht mehr in den Einstellungen',
    (function () {
      einstReiter = 'lernweg';
      setTab('einstellungen');
      return alle('[data-zaehler]').length === 0 &&
        main.textContent.indexOf('Auffrischen nach') === -1;
    })());
  // **Der Sicherungscode behält die Stelle.** Ein älterer Code führt dort eine
  // Zahl; sie wird überlesen, nicht geraten — und das Schema, das dahinter
  // steht, darf nicht verrutschen.
  state = defaultState();
  state.settings.schema = 'gruen';
  pruefe('J4 das Schema übersteht Sichern und Einspielen',
    mergeState(decodeBackup(encodeBackup())).settings.schema === 'gruen',
    mergeState(decodeBackup(encodeBackup())).settings.schema);
  pruefe('J5 ein alter Code mit Frist wird gelesen, ohne zu verrutschen',
    (function () {
      // Die Frist stand an Stelle 3 des Einstellungsfeldes; ein Code von
      // damals trägt dort «21» statt «-». Die Prüfsumme wird **neu gerechnet**,
      // nicht umgangen — sonst prüfte der Test den Fehlerpfad statt den Fall.
      var teile = encodeBackup().split('~');
      var e = teile[5].split('.');
      e[2] = '21';
      teile[5] = e.join('.');
      var ohne = teile.slice(0, teile.length - 1).join('~');
      var zurueck = mergeState(decodeBackup(ohne + '~' + bkPruefsumme(ohne)));
      return zurueck.settings.schema === 'gruen' &&
        zurueck.settings.auffrischen === undefined;
    })());

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
  uebAuswahl = 0; state.setBleib = 0;
  // **Seit ADR 0091 ist die Lage eine andere:** Die zehn gemeisterten Wörter
  // sind nach vierzig Tagen *nicht* fällig, sondern fertig. Fällig kann nur
  // noch sein, was unfertig ist — und die zwei waren gestern dran, also ist
  // auch dort nichts fällig. Der alte Befund kann so nicht mehr entstehen.
  pruefe('W1 die Lage stimmt: nichts ist fällig, zwei sind unfertig',
    faelligeAnzahl(uebPool()) === 0 && wFehlt.length === 2,
    String(faelligeAnzahl(uebPool())));
  var wTreffer = 0;
  for (var wi = 0; wi < 100; wi++) {
    var wV = waehleWort(uebPool());
    if (wV && wFehlt.indexOf(wV.id) !== -1) wTreffer++;
  }
  // **Die Sorge dahinter bleibt** — nur die Ursache ist eine andere. Ohne den
  // Zweig «Unfertiges vor Fertigem» fielen die zwei fehlenden Wörter unter die
  // allgemeine Sortierung zurück: gemessen 27 von 100. Mit ihm sind es 50, und
  // die Zahl ist **strukturell, nicht zufällig**: Das Muster lautet A · B ·
  // Pause · Pause, weil die Dreiersperre nach zwei Treffern beide aussperrt.
  // Zufällig wären es 17 von 100.
  pruefe('W2 die fehlenden Wörter kommen wirklich dran', wTreffer > 40,
    wTreffer + ' von 100');
  // **Und die Sperre wirkt trotzdem** (ADR 0090): Zwei Wörter lassen sich
  // nicht hundertmal hintereinander abfragen, ohne daß etwas dazwischen kommt.
  pruefe('W3 aber nicht als Dauerschleife', wTreffer < 100,
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

  // ── X · Abstand statt Abtippen (ADR 0090) ─────────────────
  // **Gemeldet:** «Ich hatte "guten Morgen" schon 6 von 12 Mal.» Gemessen war
  // die Folge «муж · муж · муж · с · с · с» — ein Wort mit angefangener
  // Tippfolge ist immer fällig und besetzte die Auswahl allein.
  //
  // Dreimal dasselbe Wort abzutippen zeigt nichts. Die Folge soll beweisen,
  // daß die Schreibweise **bleibt**, und dafür braucht sie Abstand.
  state = defaultState();
  ansichtenZuruecksetzen();
  ['lernsets', 'tippen', 'uebersetzen'].forEach(function (k) { state.tutUebung[k] = 1; });
  tutEnde();
  var xW = LERNSETS[0].woerter;
  xW.forEach(function (v) {
    state.boxes[v.id] = BOX_MAX - 1;
    state.lastSeen[v.id] = Date.now();
  });
  uebAuswahl = 0; state.setBleib = 0;
  var xFolge = [];
  for (var xi = 0; xi < 30; xi++) {
    var xV = waehleWort(uebPool());
    if (!xV) break;
    xFolge.push(xV.id);
    updateBox(xV.id, true, true);
  }
  var xDoppelt = 0;
  for (var xj = 1; xj < xFolge.length; xj++) if (xFolge[xj] === xFolge[xj - 1]) xDoppelt++;
  pruefe('X1 kein Wort kommt unmittelbar zweimal', xDoppelt === 0,
    xDoppelt + ' Wiederholungen · ' + xFolge.slice(0, 8).join(' '));
  // Auch nicht mit einem einzigen Wort dazwischen, solange der Vorrat reicht.
  var xNah = 0;
  for (var xk = 2; xk < xFolge.length; xk++) if (xFolge[xk] === xFolge[xk - 2]) xNah++;
  pruefe('X2 und auch nicht mit nur einem dazwischen', xNah === 0,
    xNah + ' zu nah');
  // **Die Sperre darf den Vorrat nicht leeren.** Bei zwei Wörtern gibt es
  // keinen Abstand — dann muß trotzdem etwas kommen.
  state = defaultState();
  ansichtenZuruecksetzen();
  var xZwei = ALL_VOCAB.slice(0, 2);
  xZwei.forEach(function (v) { state.boxes[v.id] = 2; state.lastSeen[v.id] = Date.now(); });
  uebAuswahl = 'alle';
  var xLeer = 0;
  for (var xm = 0; xm < 10; xm++) {
    if (!waehleWort(xZwei)) xLeer++;
  }
  pruefe('X3 ein kleiner Vorrat liefert trotzdem', xLeer === 0, String(xLeer));
  // Und bei einem einzigen Wort erst recht.
  pruefe('X4 ein einziges Wort kommt weiter dran',
    !!waehleWort([xZwei[0]]) && !!waehleWort([xZwei[0]]));

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
