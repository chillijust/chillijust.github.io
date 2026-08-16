// Prüft Päckchen-Freischaltung, Tippen-Sperre, Fälligkeit und ID-Migration.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = `
var log = [];
function pruefe(name, cond, extra) { log.push((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' [' + extra + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function stufe(woerter, s) { woerter.forEach(function (v) { state.boxes[v.id] = s; state.lastSeen[v.id] = Date.now(); }); }

// **Wer eine Übung betritt, stellt die Spuren still** (CLAUDE.md). Sonst
// öffnet sich beim ersten Betreten das Angebot der Übungsspur, sein Hof liegt
// über allem, und jede Messung mit elementFromPoint trifft ihn statt das Ziel.
function spurenStill() {
  ['lernsets', 'tippen', 'uebersetzen'].forEach(function (k) { state.tutUebung[k] = 1; });
}

try {

  // A · Reihenfolge der Übungen
  setTab('home');
  // Die Reihenfolge steht im aufklappbaren Teil — oben steht nur, was fällig
  // ist, und das wechselt mit dem Lernstand (ADR 0065).
  var kacheln = alle('#homeAlle [data-uebung]').map(function (b) { return b.dataset.uebung; }).join(',');
  pruefe('A1 Reihenfolge der Übungen',
    kacheln === 'buchstaben,lernsets,freestyle,tippen,schreibung,power,grammatik,uebersetzen', kacheln);

  // B · Lernsets statt Päckchen
  state.boxes = {}; state.lastSeen = {};
  pruefe('B1 Sets aus den Sätzen gebildet', LERNSETS.length > 0 && LERNSETS[0].woerter.length <= SET_MAX);
  pruefe('B2 Start im ersten Set', aktuellesSet() === 0);
  pruefe('B3 zweites Set gesperrt', !setFrei(1));
  // **Nicht «sitzt», sondern «gemeistert»** — und nicht alle, sondern vier von
  // fünf (ADR 0086). Ein Set voller Wörter auf Satzstufe schaltet nichts mehr
  // frei; erst die Endstufe zählt, dafür reichen 80 Prozent.
  stufe(LERNSETS[0].woerter, SATZ_STUFE);
  pruefe('B4 die Satzstufe allein reicht nicht mehr',
    aktuellesSet() === 0 && !setFrei(1), 'Set ' + aktuellesSet());
  var s0 = LERNSETS[0].woerter;
  for (var bi = 0; bi < setSchwelle(0) - 1; bi++) state.boxes[s0[bi].id] = BOX_MAX;
  pruefe('B4b einer unter der Schwelle reicht auch nicht',
    aktuellesSet() === 0 && !setFrei(1),
    setMeister(0) + '/' + setSchwelle(0) + ' von ' + s0.length);
  state.boxes[s0[setSchwelle(0) - 1].id] = BOX_MAX;
  pruefe('B5 vier von fünf schalten frei', aktuellesSet() === 1 && setFrei(1),
    'Set ' + aktuellesSet() + ' · ' + setMeister(0) + '/' + s0.length);
  pruefe('B5b und das Set gilt nicht als komplett', !setKomplett(0));
  pruefe('B6 freigeschaltet sind zwei Sets',
    freigeschalteteWoerter().length === LERNSETS[0].woerter.length + LERNSETS[1].woerter.length);

  // C · Auswahl bleibt im Set
  setTab('lernsets');
  uebAuswahl = 'aktuell';
  var drin = 0;
  for (var i = 0; i < 40; i++) {
    if (LERNSETS[1].woerter.indexOf(waehleWort(uebPool())) !== -1) drin++;
  }
  pruefe('C1 Auswahl bleibt im laufenden Set', drin === 40, drin + '/40');
  uebAuswahl = 'alle';
  var ausAlt = 0;
  for (var j = 0; j < 60; j++) {
    if (LERNSETS[0].woerter.indexOf(waehleWort(uebPool(), true)) !== -1) ausAlt++;
  }
  pruefe('C2 Wiederholung greift auf ältere Sets zu', ausAlt > 0, ausAlt + '/60');
  uebAuswahl = 'aktuell';

  // D · Fälligkeit
  var w0 = LERNSETS[0].woerter[0];
  state.boxes[w0.id] = 1;
  state.lastSeen[w0.id] = Date.now();
  pruefe('D1 gerade gesehen ist nicht fällig', !faellig(w0, Date.now()));
  state.lastSeen[w0.id] = Date.now() - 2 * TAG;
  pruefe('D2 nach zwei Tagen ist Stufe 1 fällig', faellig(w0, Date.now()));
  state.boxes[w0.id] = 4;
  pruefe('D3 Stufe 4 hält 21 Tage', !faellig(w0, Date.now()));
  state.lastSeen[w0.id] = Date.now() - 22 * TAG;
  pruefe('D4 nach 22 Tagen wieder fällig', faellig(w0, Date.now()));

  // E · Tippen-Sperre
  state.boxes = {}; state.lastSeen = {};
  state.settings.tippenStufe = 3;
  state.settings.auffrischen = 21;
  tippenModus = 'lernen';
  setTab('tippen');
  pruefe('E1 ohne gelernte Wörter leer', !!q('.leer') && !q('#tInput'));
  pruefe('E2 Leerzustand führt zu den Lernsets', !!q('#tZuUeben'));
  stufe(LERNSETS[0].woerter.slice(0, 3), 3);
  setTab('tippen');
  pruefe('E3 mit drei begonnenen Wörtern spielbar', !!q('#tInput') && tippenPool().length === 3);
  pruefe('E4 nur Wörter unter der Endstufe im Pool',
    tippenLernen().every(function (v) { return state.boxes[v.id] >= 3 && state.boxes[v.id] < BOX_MAX; }));
  var vorher = tWord;
  q('#tInput').value = 'falsch';
  q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tCheck').click();
  pruefe('E5 nach Fehler bleibt die Auflösung stehen', tWord === vorher && !!q('.feedback.bad'), String(state.boxes[vorher.id]));
  pruefe('E6 Fehler senkt unter die Schwelle', state.boxes[vorher.id] === 2 && tippenLernen().length === 2);
  stufe(LERNSETS[0].woerter.slice(0, 3), 3);
  state.settings.tippenStufe = 2;
  pruefe('E8 Schwelle 2 öffnet mehr Wörter', tippenLernen().length > 2, String(tippenLernen().length));
  state.settings.tippenStufe = 3;

  // F · Migration alter Kennungen
  var alt = mergeState({ boxes: { 'Grundlagen::привет': 3, 'спасибо': 2 }, lastSeen: { 'Grundlagen::привет': 111 } });
  pruefe('F1 Themenpräfix entfernt', alt.boxes['привет'] === 3 && alt.boxes['спасибо'] === 2,
    Object.keys(alt.boxes).join(','));
  pruefe('F2 Zeitstempel wandert mit', alt.lastSeen['привет'] === 111);
  pruefe('F3 Vokabel-Kennung ist das Wort', ALL_VOCAB[0].id === ALL_VOCAB[0].ru, ALL_VOCAB[0].id);

  // G · Einstellungen
  setTab('einstellungen');
  pruefe('G1 Stufenwahl vorhanden', alle('[data-wahl="tippenStufe"]').length === 3);
  alle('[data-wahl="tippenStufe"]')[0].click();
  pruefe('G2 Stufe umgestellt', state.settings.tippenStufe === 2);
  var g = mergeState({ settings: { tippenStufe: 99 } });
  pruefe('G3 unsinnige Stufe wird verworfen', g.settings.tippenStufe === 3, String(g.settings.tippenStufe));
  state.settings.tippenStufe = 4;
  // Die Tastaturvorgabe steht seit den Reitern auf «Eingabe».
  einstReiter = 'tastatur';
  renderEinstellungen();
  q('[data-set="tastaturAuto"]').click();
  pruefe('G4 Tastaturvorgabe umschaltbar', state.settings.tastaturAuto === false);
  state.settings.tastaturAuto = true;

  // H · Setkopf in «Lernsets»
  state.boxes = {}; state.lastSeen = {};
  uebAuswahl = 'aktuell';
  setTab('lernsets');
  filterSetzen(true); renderFilter();
  pruefe('H1 Setwahl im Filterpanel',
    alle('[data-fw="set"]').length === LERNSETS.length + 2, String(alle('[data-fw="set"]').length));
  pruefe('H2 gesperrte Sets sind deaktiviert', q('[data-fw="set"][data-fv="5"]').disabled);
  filterSetzen(false);
  pruefe('H3 Fortschritt wird angezeigt',
    q('.paket-text').textContent.indexOf('0 von ' + LERNSETS[0].woerter.length + ' auf Stufe 2') === 0,
    q('.paket-text').textContent);
  pruefe('H4 ein Balken je Wort', alle('.pp').length === LERNSETS[0].woerter.length);

  // ── K · Der letzte Schritt gehört der Tastatur (ADR 0086) ─
  // Wer ein Wort unter fertigen Kacheln wiedererkennt, hat es wiedererkannt.
  // Gemeistert ist es erst, wenn er es selbst geschrieben hat.
  state = defaultState(); ansichtenZuruecksetzen();
  var kw = ALL_VOCAB[0];
  state.boxes[kw.id] = BOX_MAX - 1;
  updateBox(kw.id, true, false);
  pruefe('K1 gelegt bringt bis vor die Endstufe, nicht darüber',
    state.boxes[kw.id] === BOX_MAX - 1, String(state.boxes[kw.id]));
  pruefe('K1b und die App merkt sich, daß sie gedeckelt hat', tippDeckel === true);
  // **Dreimal hintereinander** (ADR 0088): Ein Treffer kann ein Zufall sein.
  updateBox(kw.id, true, true);
  pruefe('K2 ein getippter Treffer reicht noch nicht',
    state.boxes[kw.id] === BOX_MAX - 1 && tippDeckel === true,
    state.boxes[kw.id] + ' · noch ' + tippRest);
  pruefe('K2b und die Zeile sagt, wie viele fehlen', tippRest === TIPP_FOLGE - 1,
    String(tippRest));
  updateBox(kw.id, true, true);
  pruefe('K2c der zweite auch nicht', state.boxes[kw.id] === BOX_MAX - 1,
    String(state.boxes[kw.id]));
  updateBox(kw.id, true, true);
  pruefe('K2d der dritte meistert', state.boxes[kw.id] === BOX_MAX &&
    tippDeckel === false, String(state.boxes[kw.id]));
  // **Ein Fehler reißt die Folge ab** — sonst zählte ein Treffer von vorgestern
  // noch mit.
  state.boxes[kw.id] = BOX_MAX - 1;
  state.tippFolge[kw.id] = 0;
  updateBox(kw.id, true, true);
  updateBox(kw.id, true, true);
  updateBox(kw.id, false, true);
  pruefe('K2e ein Fehler setzt die Folge zurück', state.tippFolge[kw.id] === 0,
    String(state.tippFolge[kw.id]));
  state.boxes[kw.id] = BOX_MAX - 1;
  updateBox(kw.id, true, true);
  pruefe('K2f und danach fängt sie von vorn an',
    state.boxes[kw.id] === BOX_MAX - 1 && tippRest === TIPP_FOLGE - 1,
    state.boxes[kw.id] + ' · noch ' + tippRest);
  state.boxes[kw.id] = BOX_MAX;
  // **Wer oben steht, bleibt oben.** Eine Wiederholung per Kachel ist kein
  // Rückschritt — ohne diese Grenze stufte jede richtige Kachelantwort ein
  // fertiges Wort wieder herunter.
  updateBox(kw.id, true, false);
  pruefe('K3 ein fertiges Wort fällt durch eine Kachel nicht zurück',
    state.boxes[kw.id] === BOX_MAX, String(state.boxes[kw.id]));
  // Und falsch bleibt falsch: Der Deckel wirkt nur nach oben.
  updateBox(kw.id, false, false);
  pruefe('K4 falsch stuft weiter zurück', state.boxes[kw.id] === BOX_MAX - 1,
    String(state.boxes[kw.id]));

  // ── L · Die Schwelle öffnet, sie schiebt nicht (ADR 0086) ─
  state = defaultState(); ansichtenZuruecksetzen();
  var lw = LERNSETS[0].woerter;
  lw.forEach(function (v) { state.boxes[v.id] = BOX_MAX - 1; });
  for (var li = 0; li < setSchwelle(0); li++) state.boxes[lw[li].id] = BOX_MAX;
  pruefe('L1 bei 80 Prozent ist das Set geschafft',
    setGeschafft(0) && !setKomplett(0),
    setMeister(0) + '/' + lw.length + ' · Schwelle ' + setSchwelle(0));
  pruefe('L2 und der Weg führt ins nächste', aktuellesSet() === 1);
  // Wer bleiben will, bleibt — auch wenn das nächste Set offen steht.
  state.setBleib = 0;
  pruefe('L3 «bleiben» hält das Set fest', aktuellesSet() === 0 && setFrei(1),
    String(aktuellesSet()));
  // Ist dort nichts mehr zu holen, fällt der Merker von selbst weg.
  lw.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  pruefe('L4 ein volles Set hält niemanden', setKomplett(0) && aktuellesSet() === 1,
    String(aktuellesSet()));
  // Ein Merker auf ein Set, das es nicht gibt, darf nicht in die Irre führen.
  state.setBleib = 999;
  pruefe('L5 ein unbekanntes Set wird übergangen', aktuellesSet() === 1,
    String(aktuellesSet()));
  state.setBleib = null;

  // ── M · Der Knopf statt der wiederkehrenden Frage (ADR 0088) ─
  // Die Meldung kommt genau einmal je Set. Danach wartet der Weg nach vorn
  // als Pfeil neben der Flammenreihe — ein Knopf fragt nicht.
  state = defaultState(); ansichtenZuruecksetzen();
  spurenStill(); tutEnde();
  uebModus = 'lernsets'; uebAuswahl = 'aktuell';
  setTab('lernsets');
  pruefe('M1 solange nichts offensteht, gibt es keinen Pfeil', !q('#setWeiter'));
  var mw = LERNSETS[0].woerter;
  mw.forEach(function (v) { state.boxes[v.id] = BOX_MAX - 1; });
  for (var mi = 0; mi < setSchwelle(0); mi++) state.boxes[mw[mi].id] = BOX_MAX;
  state.setBleib = 0;
  renderUeben();
  pruefe('M2 sobald das nächste Set offen ist, steht er da', !!q('#setWeiter'));
  pruefe('M2b und ist groß genug zum Antippen', (function () {
    var r = q('#setWeiter').getBoundingClientRect();
    var mx = r.left + r.width / 2, my = r.top + r.height / 2;
    return [[mx - 21, my], [mx + 21, my]].every(function (pt) {
      var el = document.elementFromPoint(pt[0], pt[1]);
      return !!el && (el === q('#setWeiter') || q('#setWeiter').contains(el));
    });
  })(), (function () {
    // Beim Fehlschlag steht hier, **was** die Fläche abfängt — eine Zahl allein
    // sagt nicht, ob der Knopf zu klein ist oder etwas darüberliegt.
    var r = q('#setWeiter').getBoundingClientRect();
    var mx = r.left + r.width / 2, my = r.top + r.height / 2;
    return [[mx - 21, my], [mx + 21, my], [mx, my - 21], [mx, my + 21]].map(function (pt) {
      var el = document.elementFromPoint(pt[0], pt[1]);
      return el ? (el.id || el.className || el.tagName) : 'null';
    }).join(' | ');
  })());
  q('#setWeiter').click();
  pruefe('M3 er springt ins nächste Set',
    state.setBleib === null && aktuellesSet() === 1, String(aktuellesSet()));
  pruefe('M3b und bleibt in «Lernsets»', currentTab === 'lernsets', currentTab);
  pruefe('M4 dort steht er nicht mehr', !q('#setWeiter'));

  // ── N · Die Meldung kommt einmal, nicht immer wieder ───────
  state = defaultState(); ansichtenZuruecksetzen();
  var nw = LERNSETS[0].woerter;
  nw.forEach(function (v) { state.boxes[v.id] = BOX_MAX - 1; });
  for (var ni = 0; ni < setSchwelle(0) - 1; ni++) state.boxes[nw[ni].id] = BOX_MAX;
  setFenster = null;
  var nLetztes = nw[setSchwelle(0) - 1];
  // Dreimal hintereinander richtig geschrieben — erst dann ist es gemeistert.
  var nSetVorher = aktuellesSet();
  var nVorher = state.boxes[nLetztes.id];
  for (var nk = 0; nk < TIPP_FOLGE; nk++) updateBox(nLetztes.id, true, true);
  meisterFolgen(nLetztes, nVorher, nSetVorher);
  pruefe('N1 die Schwelle meldet sich', !!setFenster && setFenster.nr === 0,
    JSON.stringify(setFenster));
  setFensterZeigen();
  alle('[data-jubel]')[0].click();   // «bleiben»
  pruefe('N2 «bleiben» hält das Set', state.setBleib === 0, String(state.setBleib));
  // Ein weiteres gemeistertes Wort fragt **nicht** noch einmal.
  setFenster = null;
  var nZweites = nw[setSchwelle(0)];
  var nSetVorher2 = aktuellesSet();
  var nVorher2 = state.boxes[nZweites.id];
  for (var nk2 = 0; nk2 < TIPP_FOLGE; nk2++) updateBox(nZweites.id, true, true);
  meisterFolgen(nZweites, nVorher2, nSetVorher2);
  pruefe('N3 und danach kommt sie nicht wieder', setFenster === null,
    JSON.stringify(setFenster));
  state.setBleib = null;
} catch (e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + e.stack.split('\\n')[1]);
}

var pre = document.createElement('pre');
pre.id = 'testlog';
pre.textContent = log.join('\\n');
document.body.appendChild(pre);
var fehler = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
document.title = fehler.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + fehler.length;
`;

writeFileSync(BAU + '/t-lernweg.html', testseite(html, test));
console.log('Lernweg-Testseite geschrieben');
