// Prüft die Wahl des Vorrats: ein einzelnes Lernset in «Tippen», der Stapel
// «Alle» dort und in «Buchstaben». Kurz: Kann man üben, was man üben will —
// auch wenn die Leiter es gerade nicht vorsieht?
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function ids(liste) { return liste.map(function (v) { return v.id; }); }

try {
  // ── A · Ein Set sticht die Stufenschwelle ─────────────────
  // Der Kern des Wunsches: Ein frisch geschafftes Set steht auf SATZ_STUFE (2),
  // «Tippen» beginnt aber bei tippenStufe (3). Ohne diesen Vorrang fände man
  // genau die Wörter nicht, die man gerade gelernt hat.
  state = defaultState();
  ansichtenZuruecksetzen();
  var setW = LERNSETS[0].woerter;
  setW.forEach(function (v) { state.boxes[v.id] = SATZ_STUFE; });
  setTab('tippen');

  pruefe('A1 die Vorgabe ist der ganze Wortschatz', tippenSet === null);
  pruefe('A2 auf Stufe 2 findet «Der Reihe nach» nichts',
    tippenLernen().length === 0, String(tippenLernen().length));
  pruefe('A3 die Schwelle ist die Einstellung',
    tippenSchwelle(null) === state.settings.tippenStufe, String(tippenSchwelle(null)));
  tippenSet = 0;
  pruefe('A4 ein Set senkt sie auf «begonnen»', tippenSchwelle(0) === 1, String(tippenSchwelle(0)));
  pruefe('A5 und damit steht das ganze Set bereit',
    tippenLernen().length === setW.length, tippenLernen().length + '/' + setW.length);
  pruefe('A6 es kommen nur Wörter dieses Sets', tippenLernen().every(function (v) {
    return ids(setW).indexOf(v.id) !== -1;
  }));

  // ── B · Der Stapel «Alle» ─────────────────────────────────
  // Was nie drankam, bleibt draußen: «Tippen» ist eine Behauptung, keine erste
  // Begegnung.
  state = defaultState(); ansichtenZuruecksetzen();
  ALL_VOCAB.slice(0, 5).forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  ALL_VOCAB.slice(5, 8).forEach(function (v) { state.boxes[v.id] = 1; });
  setTab('tippen');
  tippenSet = null;
  pruefe('B1 «Alle» nimmt alles Begonnene', tippenAlle().length === 8, String(tippenAlle().length));
  pruefe('B2 und nichts Ungesehenes', tippenAlle().every(function (v) {
    return (state.boxes[v.id] || 0) >= 1;
  }));
  pruefe('B3 «Wiederholung» findet nichts — die Frist läuft noch',
    tippenWiederholung().length === 0, String(tippenWiederholung().length));
  pruefe('B4 genau das ist der Ausweg: gemeistert und trotzdem übbar',
    tippenAlle().filter(function (v) { return (state.boxes[v.id] || 0) >= BOX_MAX; }).length === 5);

  // ── C · Der Ausweg steht auch im Leerzustand ──────────────
  state = defaultState(); ansichtenZuruecksetzen();
  ALL_VOCAB.slice(0, 5).forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  tippenModus = 'lernen'; tWord = null;
  setTab('tippen');
  pruefe('C1 ohne Ausweg wäre hier Schluss', !q('#tInput'));
  pruefe('C2 «Alles getippt» steht da', (q('.leer h3') || {}).textContent === 'Alles getippt',
    (q('.leer h3') || {}).textContent);
  pruefe('C3 und ein Knopf führt hinaus', !!q('#tZuAlle'));
  q('#tZuAlle').click();
  pruefe('C4 er schaltet auf «Alle»', tippenModus === 'alle', tippenModus);
  pruefe('C5 und es steht wieder eine Aufgabe da', !!q('#tInput') && !!tWord);
  pruefe('C6 die Karte sagt, worum es geht',
    q('.task-label').textContent.indexOf('Festigen') !== -1, q('.task-label').textContent);

  // ── D · Die Auswahl zeigt, was sie liefert ────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  LERNSETS[0].woerter.forEach(function (v) { state.boxes[v.id] = SATZ_STUFE; });
  setTab('tippen');
  filterSetzen(true); renderFilter();
  var stapel = alle('[data-fw="tmodus"]');
  pruefe('D1 drei Stapel', stapel.length === 3, String(stapel.length));
  var woher = alle('[data-fw="tset"]');
  pruefe('D2 «Der Reihe nach» plus jedes Set',
    woher.length === LERNSETS.length + 1, String(woher.length));
  pruefe('D3 gesperrte Sets sind gesperrt', (function () {
    for (var i = 0; i < LERNSETS.length; i++) {
      if (woher[i + 1].disabled !== !setFrei(i)) return false;
    }
    return true;
  })());
  pruefe('D4 die Zahl am Set stimmt mit dem überein, was es liefert',
    woher[1].textContent.indexOf('· ' + tippenWoerter(0, tippenModus).length) !== -1,
    woher[1].textContent);
  // Die Zahl muss dem **gewählten Stapel** folgen, nicht einem festen.
  stapel[2].click();       // «Alle»
  filterSetzen(true); renderFilter();
  woher = alle('[data-fw="tset"]');
  pruefe('D5 sie folgt dem gewählten Stapel',
    woher[1].textContent.indexOf('· ' + tippenWoerter(0, 'alle').length) !== -1,
    woher[1].textContent);

  // ── E · Ein Set wählen wirkt sofort ───────────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  LERNSETS[0].woerter.forEach(function (v) { state.boxes[v.id] = SATZ_STUFE; });
  setTab('tippen');
  filterSetzen(true); renderFilter();
  q('[data-fw="tset"][data-fv="0"]').click();
  pruefe('E1 das Set steht', tippenSet === 0, String(tippenSet));
  pruefe('E2 das Blatt ist zu', !filterOffen);
  pruefe('E3 der Knopf ist gefärbt', q('#filterKnopf').classList.contains('aktiv'));
  pruefe('E4 die Aufgabe kommt aus dem Set',
    ids(LERNSETS[0].woerter).indexOf(tWord.id) !== -1, tWord && tWord.ru);
  pruefe('E5 die Karte nennt es', q('.task-label').textContent.indexOf('Set 1') !== -1,
    q('.task-label').textContent);
  // Zurück zum ganzen Wortschatz.
  filterSetzen(true); renderFilter();
  q('[data-fw="tset"][data-fv=""]').click();
  pruefe('E6 «Der Reihe nach» kehrt zurück', tippenSet === null);

  // ── F · Ein unberührtes Set hat einen eigenen Leerzustand ─
  state = defaultState(); ansichtenZuruecksetzen();
  LERNSETS[0].woerter.forEach(function (v) { state.boxes[v.id] = SATZ_STUFE; });
  setTab('tippen');
  tippenSet = 1; tWord = null; tResult = null;
  renderTippen();
  pruefe('F1 kein «Noch kein Wort freigeschaltet» — das wäre gelogen',
    (q('.leer h3') || {}).textContent.indexOf('unberührt') !== -1,
    (q('.leer h3') || {}).textContent);
  pruefe('F2 und ein Weg zurück steht da', !!q('#tAlleSets'));
  q('#tAlleSets').click();
  pruefe('F3 er führt zum ganzen Wortschatz', tippenSet === null);

  // ── G · Ein verschwundenes Set fällt nicht ins Leere ──────
  // Die Set-Nummern hängen am Lehrplan. Zeigt der Stand auf ein Set, das es
  // nicht mehr gibt, muss die Übung weiterlaufen statt leer zu bleiben.
  tippenSet = 999;
  pruefe('G1 der Vorrat fällt auf den Wortschatz zurück',
    tippenVorrat(999).length === ALL_VOCAB.length, String(tippenVorrat(999).length));
  tippenSet = null;

  // ── H · Buchstaben: alle 33, wann man will ────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
  abcAnsicht = 'ueben'; abcQ = null;
  setTab('buchstaben');
  pruefe('H1 gemeistert und nicht fällig heißt: leer',
    abcPoolVon('reihe').length === 0, String(abcPoolVon('reihe').length));
  pruefe('H2 genau der Zustand, aus dem es keinen Ausgang gab',
    (q('.leer h3') || {}).textContent === 'Das Alphabet sitzt', (q('.leer h3') || {}).textContent);
  pruefe('H3 jetzt gibt es einen', !!q('#abcAlle'));
  q('#abcAlle').click();
  pruefe('H4 er schaltet auf «Alle»', abcStapel === 'alle', abcStapel);
  pruefe('H5 und alle 33 stehen bereit', abcPool().length === ALPHABET.length,
    String(abcPool().length));
  pruefe('H6 eine Frage steht da', !!abcQ && !!q('.card'));
  pruefe('H7 der Filterknopf ist gefärbt', q('#filterKnopf').classList.contains('aktiv'));

  // Und über die Auswahl geht es genauso.
  abcStapel = 'reihe'; abcQ = null; renderBuchstaben(); renderKopf();
  filterSetzen(true); renderFilter();
  var abcStapelChips = alle('[data-fw="abcstapel"]');
  pruefe('H8 zwei Stapel im Blatt', abcStapelChips.length === 2, String(abcStapelChips.length));
  pruefe('H9 «Alle» nennt die 33',
    abcStapelChips[1].textContent.indexOf('· ' + ALPHABET.length) !== -1,
    abcStapelChips[1].textContent);
  abcStapelChips[1].click();
  pruefe('H10 auch von dort wirkt es', abcStapel === 'alle' && abcPool().length === ALPHABET.length);
  pruefe('H11 die Richtung steht weiterhin daneben', (function () {
    filterSetzen(true); renderFilter();
    return alle('[data-fw="abcrichtung"]').length === 3;
  })());

  // ── I · Geübt wird wie sonst auch ─────────────────────────
  // «Alle» ist ein anderer Vorrat, kein anderer Lernstand: Eine richtige
  // Antwort zählt weiter, ein Fehler kostet weiter.
  state = defaultState(); ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
  abcStapel = 'alle'; abcAnsicht = 'ueben'; abcQ = null;
  setTab('buchstaben');
  var b0 = abcQ.b;
  abcQ.modus = 'wahl'; abcPicked = 'kein Laut'; abcPruefen();
  pruefe('I1 ein Fehler kostet auch im Grind-Stapel',
    abcBox(b0) === BOX_MAX - 1, String(abcBox(b0)));

  state = defaultState(); ansichtenZuruecksetzen();
  LERNSETS[0].woerter.forEach(function (v) { state.boxes[v.id] = SATZ_STUFE; });
  tippenSet = 0; tippenModus = 'alle'; tWord = null;
  setTab('tippen');
  var w0 = tWord;
  var vorher = state.boxes[w0.id];
  var feld = q('#tInput');
  feld.value = w0.ru;
  feld.dispatchEvent(new Event('input', { bubbles: true }));
  q('#tCheck').click();
  pruefe('I2 eine richtige Antwort zählt auch dort',
    state.boxes[w0.id] === vorher + 1, vorher + ' → ' + state.boxes[w0.id]);

  // ── J · Der Ansichtszustand wird zurückgesetzt ────────────
  tippenSet = 3; tippenModus = 'alle'; abcStapel = 'alle';
  ansichtenZuruecksetzen();
  pruefe('J1 das Set fällt zurück', tippenSet === null, String(tippenSet));
  pruefe('J2 der Stapel auch', tippenModus === 'lernen', tippenModus);
  pruefe('J3 und der Buchstabenstapel', abcStapel === 'reihe', abcStapel);
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

writeFileSync(BAU + '/t-grinden.html', testseite(html, test));
console.log('Grind-Testseite geschrieben');
