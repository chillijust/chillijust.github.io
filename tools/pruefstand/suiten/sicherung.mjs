// Prüft Sicherungscode, Wiederherstellung und das Neuaufbauen der Rubriken.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  // Ein Stand, der jede Ecke berührt
  state = defaultState();
  ALL_VOCAB.slice(0, 40).forEach(function (v, i) {
    state.boxes[v.id] = (i % 4) + 1;
    state.lastSeen[v.id] = Date.now() - i * TAG;
  });
  SENTENCES.slice(0, 6).forEach(function (x, i) {
    state.satzBox[x.ru] = (i % 4) + 1;
    state.satzSeen[x.ru] = Date.now() - i * TAG;
  });
  state.fakten[faktId(FACTS[0])] = { n: 3, f: true };
  state.fakten[faktId(FACTS[5])] = { n: 1, f: false };
  state.streak = 7; state.bestStreak = 19; state.answered = 254; state.factIdx = 12;
  state.typingStats = { correct: 33, wrong: 5 };
  state.transStats = { correct: 8, wrong: 2 };
  state.settings.tippenStufe = 2;
  state.settings.auffrischen = 14;
  state.settings.schema = 'classic';
  state.settings.ton = false;
  state.settings.requireComplete = true;
  var vorher = JSON.parse(JSON.stringify(state));

  // A · Aufbau des Codes
  var code = encodeBackup();
  pruefe('A1 trägt Kopf und Version', code.indexOf('CHG2~') === 0, code.slice(0, 12));
  pruefe('A2 elf Felder', code.split('~').length === 11, String(code.split('~').length));
  pruefe('A3 eine einzige Zeile', code.indexOf('\n') === -1 && code.indexOf(' ') === -1);
  // Der Bindestrich hält die Stellen frei, an denen bis ADR 0039 Darstellung
  // und Farbton standen — sonst rutschte das Schema dorthin, wo ein älterer
  // Code etwas anderes führt.
  pruefe('A4 nur unverfängliche Zeichen', /^[A-Za-z0-9.~-]+$/.test(code));
  var alt = btoa(unescape(encodeURIComponent(JSON.stringify(vorher))));
  pruefe('A5 deutlich kürzer als der alte Klumpen', code.length * 3 < alt.length,
    code.length + ' statt ' + alt.length + ' Zeichen');

  // B · Hin und zurück
  var zurueck = mergeState(decodeBackup(code));
  pruefe('B1 Wortstufen erhalten',
    ALL_VOCAB.slice(0, 40).every(function (v) { return zurueck.boxes[v.id] === vorher.boxes[v.id]; }));
  pruefe('B2 Zeitstempel auf den Tag genau',
    ALL_VOCAB.slice(0, 40).every(function (v) {
      return Math.abs(zurueck.lastSeen[v.id] - vorher.lastSeen[v.id]) < TAG;
    }));
  pruefe('B3 Satzstufen erhalten',
    SENTENCES.slice(0, 6).every(function (x) { return zurueck.satzBox[x.ru] === vorher.satzBox[x.ru]; }));
  pruefe('B4 Fakten erhalten', zurueck.fakten[faktId(FACTS[0])].n === 3 &&
    zurueck.fakten[faktId(FACTS[0])].f === true &&
    zurueck.fakten[faktId(FACTS[5])].f === false);
  pruefe('B5 Zahlen erhalten', zurueck.streak === 7 && zurueck.bestStreak === 19 &&
    zurueck.answered === 254 && zurueck.factIdx === 12 &&
    zurueck.typingStats.correct === 33 && zurueck.transStats.wrong === 2);
  pruefe('B6 Einstellungen erhalten', zurueck.settings.tippenStufe === 2 &&
    zurueck.settings.auffrischen === 14 && zurueck.settings.schema === 'classic' &&
    zurueck.settings.ton === false && zurueck.settings.requireComplete === true &&
    zurueck.settings.confirmUeben === true);
  pruefe('B7 Unberührtes bleibt unberührt',
    Object.keys(zurueck.boxes).length === 40 && Object.keys(zurueck.satzBox).length === 6);

  // C · Prüfsumme und Fehlerfälle
  var kaputt = code.slice(0, code.length - 30);
  var gefangen = '';
  try { decodeBackup(kaputt); } catch (e) { gefangen = e.message; }
  pruefe('C1 abgeschnittener Code fliegt auf', gefangen !== '', gefangen);
  gefangen = '';
  try { decodeBackup(code.replace('CHG2~', 'CHG2~x')); } catch (e) { gefangen = e.message; }
  pruefe('C2 verändertes Zeichen fliegt auf', gefangen === 'Prüfsumme', gefangen);
  gefangen = '';
  try { decodeBackup('völliger unsinn'); } catch (e) { gefangen = 'geworfen'; }
  pruefe('C3 Fremdtext wird abgewiesen', gefangen === 'geworfen');
  pruefe('C4 Leerzeichen und Umbrüche stören nicht',
    decodeBackup('  ' + code.slice(0, 20) + '\n' + code.slice(20) + ' \n').streak === 7);

  // D · Alter Code bleibt lesbar
  var altDaten = mergeState(decodeBackup(alt));
  pruefe('D1 Format 1 wird noch verstanden',
    altDaten.boxes[ALL_VOCAB[0].id] === vorher.boxes[ALL_VOCAB[0].id] && altDaten.streak === 7);

  // E · Unbekannte Inhalte fallen weg statt zu stören
  var mitMuell = code.split('~');
  mitMuell[1] = 'zzzzzz3001' + mitMuell[1];
  var rumpf = mitMuell.slice(0, 6).join('~');
  var geflickt = rumpf + '~' + bkPruefsumme(rumpf);
  var e5 = mergeState(decodeBackup(geflickt));
  pruefe('E1 unbekannte Kennung wird übersprungen', Object.keys(e5.boxes).length === 40);

  // F · Der eigentliche Fehler: Rubriken bauen neu auf
  state = mergeState(vorher);
  ansichtenZuruecksetzen();
  state.settings.tippenStufe = 3;
  ALL_VOCAB.slice(0, 3).forEach(function (v) { state.boxes[v.id] = 3; state.lastSeen[v.id] = Date.now(); });
  setTab('tippen');
  var altesWort = tWord;
  pruefe('F1 Tippen zeigt ein Wort', !!altesWort && !!q('#tInput'));
  q('#tInput').value = 'falsch';
  q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tCheck').click();
  pruefe('F2 Rückmeldung steht', tResult === 'wrong');
  setTab('uebersetzen');
  trLevel = 2; trModus = 'wiederholung';
  setTab('sicherung');

  // Ein ganz anderer Stand: nichts gelernt
  var leerCode = (function () {
    var merk = state;
    state = defaultState();
    var c = encodeBackup();
    state = merk;
    return c;
  })();
  q('#bkIn').value = leerCode;
  q('#bkImport').click();
  pruefe('F3 Meldung nennt den Inhalt',
    main.textContent.indexOf('Wiederhergestellt: 0 Wörter') !== -1, backupMsg);
  pruefe('F4 Tippen hat seinen Zustand vergessen',
    tWord === null && tResult === null && tippenModus === 'lernen');
  pruefe('F5 Übersetzen ebenso', trTask === null && trPhase === 'ask' && trModus === 'lernen');
  pruefe('F6 Lernsets ebenso', uebQ === null && uebPhase === 'ask');
  setTab('tippen');
  pruefe('F7 Tippen zeigt jetzt den Leerzustand', !q('#tInput') && !!q('.leer'),
    tWord ? tWord.ru : 'kein Wort');
  pruefe('F8 nicht mehr das alte Wort', tWord !== altesWort);
  pruefe('F8b auch Stufe und Stapel stehen wieder auf Anfang',
    trLevel === 1 && trModus === 'lernen', trLevel + '/' + trModus);
  setTab('uebersetzen');
  pruefe('F9 Übersetzen zeigt den Leerzustand', !!q('.leer') && !q('.built'));

  // G · Zurücksetzen räumt genauso auf
  state = mergeState(vorher);
  ALL_VOCAB.slice(0, 3).forEach(function (v) { state.boxes[v.id] = 3; state.lastSeen[v.id] = Date.now(); });
  ansichtenZuruecksetzen();
  setTab('tippen');
  pruefe('G1 wieder ein Wort da', !!tWord);
  setTab('sicherung');
  q('#rsAsk').click();
  q('#rsYes').click();
  pruefe('G2 Fortschritt weg', Object.keys(state.boxes).length === 0);
  pruefe('G3 Ansichten ebenfalls zurückgesetzt', tWord === null && trTask === null && uebQ === null);
  setTab('tippen');
  pruefe('G4 Tippen zeigt den Leerzustand', !!q('.leer') && !q('#tInput'));

  // H · Das Farbschema folgt dem Code
  state = defaultState();
  state.settings.schema = 'blau';
  var blauCode = encodeBackup();
  state.settings.schema = 'dark';
  updateDarstellung();
  setTab('sicherung');
  q('#bkIn').value = blauCode;
  q('#bkImport').click();
  pruefe('H1 das Schema greift sofort',
    document.documentElement.getAttribute('data-schema') === 'blau',
    String(document.documentElement.getAttribute('data-schema')));

  // I · Eigene Rubrik im Menü
  setTab('home');
  q('#menuKnopf').click();
  var eintrag = q('.menueintrag[data-ziel="sicherung"]');
  pruefe('I1 die Sicherung steht im Menü', !!eintrag && !!eintrag.querySelector('svg'));
  pruefe('I2 zwischen Bilanz und Einstellungen',
    alle('.menueintrag').map(function (b) { return b.dataset.ziel; }).join(',') ===
    'bilanz,sicherung,einstellungen,tickets',
    alle('.menueintrag').map(function (b) { return b.dataset.ziel; }).join(','));
  eintrag.click();
  pruefe('I3 sie führt hin', currentTab === 'sicherung' && !!q('#bkMake') && !!q('#bkIn'));
  pruefe('I4 der Kopf trägt ihren Namen',
    q('#kopfTitel').textContent === 'Sicherung' && q('#kopfEyebrow').textContent === 'Menü',
    q('#kopfTitel').textContent);
  pruefe('I5 das Zurücksetzen steht dort mit', !!q('#rsAsk'));
  pruefe('I6 der Filterknopf hat hier nichts zu suchen', q('#filterKnopf').hidden);

  // J · Die Bilanz verweist nur noch dorthin
  setTab('bilanz');
  pruefe('J1 kein Codefeld mehr in der Bilanz', !q('#bkMake') && !q('#bkIn') && !q('#rsAsk'));
  pruefe('J2 aber ein Weg dorthin', !!q('#zuSicherung'));
  q('#zuSicherung').click();
  pruefe('J3 der Weg führt hin', currentTab === 'sicherung' && !!q('#bkMake'));
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

writeFileSync(BAU + '/t-sicherung.html', testseite(html, test));
console.log('Testseite geschrieben');
