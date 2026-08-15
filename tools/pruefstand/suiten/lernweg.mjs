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
  var kacheln = alle('[data-uebung]').map(function (b) { return b.dataset.uebung; }).join(',');
  pruefe('A1 Reihenfolge der Übungen',
    kacheln === 'lernsets,freestyle,tippen,schreibung,uebersetzen,buchstaben,grammatik,power', kacheln);

  // B · Lernsets statt Päckchen
  state.boxes = {}; state.lastSeen = {};
  pruefe('B1 Sets aus den Sätzen gebildet', LERNSETS.length > 0 && LERNSETS[0].woerter.length <= SET_MAX);
  pruefe('B2 Start im ersten Set', aktuellesSet() === 0);
  pruefe('B3 zweites Set gesperrt', !setFrei(1));
  stufe(LERNSETS[0].woerter, SATZ_STUFE - 1);
  pruefe('B4 eine Stufe zu wenig reicht nicht', aktuellesSet() === 0 && !setFrei(1));
  stufe(LERNSETS[0].woerter, SATZ_STUFE);
  pruefe('B5 Stufe 2 schaltet frei', aktuellesSet() === 1 && setFrei(1), 'Set ' + aktuellesSet());
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
