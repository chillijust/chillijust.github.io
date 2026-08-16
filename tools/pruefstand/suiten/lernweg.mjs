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
  updateBox(kw.id, true, true);
  pruefe('K2 getippt geht es hinauf', state.boxes[kw.id] === BOX_MAX,
    String(state.boxes[kw.id]));
  pruefe('K2b und ohne Deckel', tippDeckel === false);
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
