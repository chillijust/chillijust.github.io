// Prüft die Übung «Buchstaben»: Inhalte, Tafel, Quiz, Trennung vom Wortschatz.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');
const daten = JSON.parse(readFileSync(WURZEL + '/data/buchstaben.json', 'utf8'));

console.log('Buchstaben in /data:', daten.length);
if (daten.length !== 33) { console.error('Unerwartet!'); process.exit(1); }

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }


try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // A · Inhalte
  pruefe('A1 33 Buchstaben', ALPHABET.length === 33, String(ALPHABET.length));
  pruefe('A2 vier Felder je Eintrag', ALPHABET.every(function (b) { return b.length === 4; }));
  pruefe('A3 Groß und Klein gehören zusammen',
    ALPHABET.every(function (b) { return b[0].toLowerCase() === b[1]; }));
  pruefe('A4 keine Dublette', new Set(ALPHABET.map(function (b) { return b[1]; })).size === 33);
  pruefe('A5 beginnt mit А und endet mit Я',
    ALPHABET[0][1] === 'а' && ALPHABET[32][1] === 'я');
  pruefe('A6 jede Merkhilfe hilft wirklich',
    ALPHABET.every(function (b) { return b[3].length >= 20; }));
  pruefe('A7 sechs falsche Freunde benannt', ABC_TUECKISCH.length === 6);
  pruefe('A8 sie stehen alle im Alphabet',
    ABC_TUECKISCH.split('').every(function (c) {
      return ALPHABET.some(function (b) { return b[1] === c; });
    }));
  pruefe('A9 ihre Laute sind die erwarteten',
    ABC_TUECKISCH.split('').map(function (c) {
      return ALPHABET.filter(function (b) { return b[1] === c; })[0][2];
    }).join(',') === 'w,n,r,s,u,ch',
    ABC_TUECKISCH.split('').map(function (c) {
      return ALPHABET.filter(function (b) { return b[1] === c; })[0][2];
    }).join(','));
  pruefe('A10 dieselben Zeichen wie auf der Tastatur',
    new Set(KB_ROWS.reduce(function (a, r) { return a.concat(r); }, [])).size === 33);

  // B · Tafel
  setTab('buchstaben');
  pruefe('B0 geübt wird ohne Umweg', abcAnsicht === 'ueben' && !q('.abc-tafel'));
  pruefe('B0b der Tafelknopf steht bereit',
    !q('#tafelKnopf').hidden && !q('#tafelKnopf').classList.contains('aktiv'));
  q('#tafelKnopf').click();
  pruefe('B1 er führt zur Tafel', abcAnsicht === 'tafel' && alle('.abc-kachel').length === 33);
  pruefe('B1b und zeigt, dass man dort steht',
    q('#tafelKnopf').classList.contains('aktiv') &&
    q('#tafelKnopf').getAttribute('aria-pressed') === 'true');
  pruefe('B2 falsche Freunde hervorgehoben', alle('.abc-kachel.tueckisch').length === 6);
  pruefe('B3 Trefferfläche groß genug',
    q('.abc-kachel').getBoundingClientRect().height >= 44,
    q('.abc-kachel').getBoundingClientRect().height.toFixed(0));
  pruefe('B4 noch keine Merkhilfe offen', !q('.abc-hilfe'));
  var wIndex = -1;
  ALPHABET.forEach(function (b, i) { if (b[1] === 'в') wIndex = i; });
  alle('[data-abc]')[wIndex].click();
  pruefe('B5 Antippen zeigt die Merkhilfe',
    !!q('.abc-hilfe') && q('.abc-hilfe').textContent.indexOf('Wasser') !== -1);
  alle('[data-abc]')[wIndex].click();
  pruefe('B6 nochmal Antippen schließt sie', !q('.abc-hilfe'));
  q('#tafelKnopf').click();
  pruefe('B7 derselbe Knopf führt zurück ins Üben', abcAnsicht === 'ueben' && !q('.abc-tafel'));

  // C · Quiz
  abcAnsicht = 'ueben';
  abcRichtung = 'zeichen';
  abcQ = null;
  renderBuchstaben();
  pruefe('C1 eine Frage steht', !!abcQ && !!q('[data-abcopt]'));
  pruefe('C2 vier Antworten', alle('[data-abcopt]').length === 4);
  pruefe('C3 die richtige ist dabei',
    abcQ.options.some(function (o) { return o[1] === abcQ.b[1]; }));
  pruefe('C4 keine doppelten Laute in den Antworten',
    new Set(abcQ.options.map(function (o) { return o[2]; })).size === 4);
  pruefe('C5 gefragt wird das Zeichen', q('.word').textContent.indexOf(abcQ.b[0]) === 0,
    q('.word').textContent);
  var richtig = abcQ.options.map(function (o) { return o[1]; }).indexOf(abcQ.b[1]);
  var gefragt = abcQ.b;
  alle('[data-abcopt]')[richtig].click();
  pruefe('C6 Auswahl allein wertet nicht', abcPhase === 'ask');
  q('#abcConfirm').click();
  pruefe('C7 richtig erkannt', abcPhase === 'feedback' && abcCorrect === true);
  pruefe('C8 die Stufe steigt', state.abcBox[gefragt[1]] === 1);
  pruefe('C9 die Merkhilfe steht dabei', main.textContent.indexOf(gefragt[3]) !== -1);
  q('#abcNext').click();
  pruefe('C10 die nächste Frage kommt', abcPhase === 'ask' && abcQ.b[1] !== gefragt[1]);

  // D · Falsch senkt die Stufe
  state.abcBox[abcQ.b[1]] = 2;
  var falsch = abcQ.options.filter(function (o) { return o[1] !== abcQ.b[1]; })[0];
  var gefragt2 = abcQ.b;
  abcPicked = falsch[1];
  abcPruefen();
  pruefe('D1 falsch erkannt', abcCorrect === false);
  pruefe('D2 die Stufe fällt', state.abcBox[gefragt2[1]] === 1, String(state.abcBox[gefragt2[1]]));
  pruefe('D3 die Auflösung steht da',
    main.textContent.indexOf(gefragt2[2]) !== -1 && !!q('.feedback.bad'));

  // E · Richtung
  abcRichtung = 'laut';
  abcQ = null;
  renderBuchstaben();
  pruefe('E1 jetzt wird der Laut gefragt', q('.word').textContent === abcQ.b[2],
    q('.word').textContent);
  pruefe('E2 die Antworten sind Zeichen',
    q('[data-abcopt]').textContent.indexOf(abcQ.options[0][0]) === 0);

  // F · Freiwillig heißt getrennt
  var vorherSerie = state.streak, vorherAnzahl = state.answered;
  abcQ = null; renderBuchstaben();
  abcPicked = abcQ.b[1];
  abcPruefen();
  pruefe('F1 die Serie bleibt unberührt', state.streak === vorherSerie, String(state.streak));
  pruefe('F2 «beantwortet» zählt nicht mit', state.answered === vorherAnzahl);
  pruefe('F3 der Wortschatz bleibt sauber', Object.keys(state.boxes).length === 0);
  pruefe('F4 eigener Topf gefüllt', Object.keys(state.abcBox).length > 0);
  pruefe('F5 fremde Zeichen fallen beim Einlesen weg',
    Object.keys(mergeState({ abcBox: { 'а': 3, 'z': 4, '§': 1 } }).abcBox).join(',') === 'а');

  // G · Home und Filter
  setTab('home');
  pruefe('G1 fünfte Kachel auf Home ist «Buchstaben»',
    alle('[data-uebung]').map(function (b) { return b.dataset.uebung; }).join(',') ===
    'lernsets,freestyle,tippen,uebersetzen,buchstaben,grammatik,power',
    alle('[data-uebung]').map(function (b) { return b.dataset.uebung; }).join(','));
  pruefe('G2 sie nennt ihren Stand',
    alle('.kachel-stand')[4].textContent.indexOf('von 33') !== -1,
    alle('.kachel-stand')[4].textContent);
  q('[data-uebung="buchstaben"]').click();
  pruefe('G3 die Kachel führt hin', currentTab === 'buchstaben');
  abcAnsicht = 'ueben'; abcRichtung = 'gemischt'; renderKopf();
  pruefe('G4 Regelfall färbt den Filter nicht', !q('#filterKnopf').classList.contains('aktiv'));
  q('#filterKnopf').click();
  pruefe('G5 Stapel und Richtung im Filter, die Tafel nicht mehr',
    alle('.filtergruppe').length === 2 && !q('[data-fw="abcansicht"]') &&
    !!q('[data-fw="abcstapel"]') && !!q('[data-fw="abcrichtung"]'),
    String(alle('.filtergruppe').length));
  q('[data-fw="abcrichtung"][data-fv="zeichen"]').click();
  pruefe('G6 Richtung gewechselt und Frage neu', abcRichtung === 'zeichen' && !!abcQ);
  pruefe('G7 und der Filter zeigt die Abweichung',
    q('#filterKnopf').classList.contains('aktiv'));

  // H · Alles gelernt
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
  abcQ = null;
  renderBuchstaben();
  pruefe('H1 Leerzustand statt Frage', !q('[data-abcopt]') && !!q('.leer'));
  pruefe('H2 er führt zur Tafel', !!q('#abcZurTafel'));
  pruefe('H3 auch der Leerzustand trägt den Kopf', alle('.paket-punkte .pp').length === 33);
  setTab('home');
  pruefe('H4 die Kachel sagt es', alle('.kachel-stand')[4].textContent === 'alles gemeistert',
    alle('.kachel-stand')[4].textContent);

  // I · Sicherungscode nimmt die Buchstaben mit
  var code = encodeBackup();
  pruefe('I1 neun Felder', code.split('~').length === 9, String(code.split('~').length));
  var zurueck = mergeState(decodeBackup(code));
  pruefe('I2 Buchstabenstände erhalten',
    ALPHABET.every(function (b) { return zurueck.abcBox[b[1]] === BOX_MAX; }));
  pruefe('I3 der Überblick nennt sie', bkUeberblick(state).indexOf('33 Buchstaben') !== -1,
    bkUeberblick(state));
  // Ein alter Code mit sieben Feldern muss weiter gehen
  var alt = code.split('~');
  var rumpf = alt.slice(0, 6).join('~');
  var alterCode = rumpf + '~' + bkPruefsumme(rumpf);
  var a7 = mergeState(decodeBackup(alterCode));
  pruefe('I4 siebenfeldrige Codes bleiben lesbar',
    Object.keys(a7.abcBox).length === 0 && a7.streak === state.streak);

  // J · Zurücksetzen räumt auch hier auf
  abcAnsicht = 'ueben'; abcOffen = 'в'; abcQ = { b: ALPHABET[0] };
  abcBuilt = [1, 2]; abcRevealed = true;
  ansichtenZuruecksetzen();
  pruefe('J1 Ansicht, Richtung und Frage zurück',
    abcAnsicht === 'ueben' && abcRichtung === 'gemischt' && abcOffen === null && abcQ === null);
  pruefe('J2 auch Gelegtes und Aufgedecktes', abcBuilt.length === 0 && abcRevealed === false);

  // K · Zwei Schwellen: sitzt ab Stufe 2, gemeistert ab Stufe 4
  state = defaultState();
  ansichtenZuruecksetzen();
  state.abcBox['а'] = SATZ_STUFE;
  state.abcBox['б'] = BOX_MAX;
  var aBu = ALPHABET[0], bBu = ALPHABET[1];
  pruefe('K1 Stufe 2 heißt «sitzt»', abcSitzt(aBu) === true);
  pruefe('K2 Stufe 2 heißt noch nicht «gemeistert»', abcGemeistert(aBu) === false);
  pruefe('K3 Stufe 4 heißt beides', abcSitzt(bBu) && abcGemeistert(bBu));
  pruefe('K4 gezählt wird beides getrennt',
    abcGelernt() === 2 && abcMeisterschaft() === 1,
    abcGelernt() + '/' + abcMeisterschaft());
  state.abcSeen['б'] = Date.now();
  var poolIds = abcPool().map(function (b) { return b[1]; });
  pruefe('K5 was nur sitzt, bleibt im Stapel', poolIds.indexOf('а') !== -1);
  pruefe('K6 was gemeistert ist, verlässt ihn', poolIds.indexOf('б') === -1);
  pruefe('K7 der Kopf trennt sitzen und meistern',
    abcKopfHtml().indexOf('2 von 33 auf Stufe 2') !== -1 &&
    abcKopfHtml().indexOf('1 gemeistert') !== -1);

  // L · Kachelmodus — den Laut zusammensetzen
  state = defaultState();
  ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
  state.abcBox['щ'] = SATZ_STUFE;
  var schtsch = ALPHABET.filter(function (b) { return b[1] === 'щ'; })[0];
  pruefe('L1 mehrzeichige Laute sind kachelbar', abcKachelbar(schtsch) === true);
  pruefe('L2 einzeichige nicht',
    abcKachelbar(ALPHABET.filter(function (b) { return b[1] === 'а'; })[0]) === false);
  pruefe('L3 die Zeichen ohne Laut auch nicht',
    ALPHABET.filter(function (b) { return b[1] === 'ъ' || b[1] === 'ь'; })
      .every(function (b) { return !abcKachelbar(b); }));
  setTab('buchstaben');
  abcAnsicht = 'ueben'; abcRichtung = 'zeichen'; abcQ = null;
  renderBuchstaben();
  pruefe('L4 ab Stufe 2 wird zusammengesetzt', abcQ.modus === 'kacheln', abcQ.modus);
  pruefe('L5 ein Fach je Zeichen des Lauts', alle('.slot').length === schtsch[2].length,
    String(alle('.slot').length));
  pruefe('L6 mehr Kacheln als Fächer', alle('[data-abctile]').length > alle('.slot').length,
    alle('[data-abctile]').length + '/' + alle('.slot').length);
  pruefe('L7 gefragt wird das Zeichen', q('.word').textContent.indexOf('Щ') === 0,
    q('.word').textContent);
  pruefe('L8 Fortschrittspunkte über der Frage', alle('.paket-punkte .pp').length === 33);
  pruefe('L9 die Leiter des Buchstabens steht auf der Karte',
    alle('.boxdots span.on').length === SATZ_STUFE + 1,
    String(alle('.boxdots span.on').length));
  // Zwei legen, eines zurücknehmen
  alle('[data-abctile]')[0].click();
  alle('[data-abctile]').filter(function (t) { return !t.disabled; })[0].click();
  pruefe('L10 zwei Kacheln liegen', abcBuilt.length === 2, String(abcBuilt.length));
  q('#abcUndo').click();
  pruefe('L11 die Rücktaste nimmt eine zurück', abcBuilt.length === 1);
  q('#abcUndo').click();
  // Nun den richtigen Laut legen
  schtsch[2].split('').forEach(function (c) {
    var frei = alle('[data-abctile]').filter(function (t) {
      return t.textContent === c && !t.disabled;
    });
    if (frei.length) frei[0].click();
  });
  pruefe('L12 die Fächer sind gefüllt', alle('.slot.filled').length === schtsch[2].length);
  pruefe('L13 gelegt wertet noch nicht', abcPhase === 'ask');
  q('#abcConfirm').click();
  pruefe('L14 richtig zusammengesetzt', abcCorrect === true, String(abcCorrect));
  pruefe('L15 die Stufe steigt', state.abcBox['щ'] === SATZ_STUFE + 1,
    String(state.abcBox['щ']));

  // M · Aufdecken zählt als Fehler
  state = defaultState();
  ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
  state.abcBox['ж'] = 3;
  abcAnsicht = 'ueben'; abcRichtung = 'zeichen'; abcQ = null;
  renderBuchstaben();
  pruefe('M1 «Aufdecken» steht bereit', !!q('#abcReveal'));
  q('#abcReveal').click();
  pruefe('M2 danach steht die Lösung da',
    abcPhase === 'feedback' && abcCorrect === false &&
    main.textContent.indexOf('Lösung') !== -1);
  pruefe('M3 die Stufe fällt', state.abcBox['ж'] === 2, String(state.abcBox['ж']));
  pruefe('M4 die Merkhilfe steht darunter',
    main.textContent.indexOf('Journal') !== -1);
  q('#abcNext').click();
  pruefe('M5 die nächste Frage ist wieder offen',
    abcPhase === 'ask' && abcRevealed === false && abcBuilt.length === 0);

  // N · Feste Richtung «Laut → Zeichen» bleibt auch oben erhalten
  abcRichtung = 'laut'; abcQ = null;
  renderBuchstaben();
  pruefe('N1 keine Kacheln in der Gegenrichtung', abcQ.modus === 'laut' && !q('[data-abctile]'));
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

const skript = '\n<script>\nwindow.addEventListener("error", function (e) { document.title = "SEITENFEHLER: " + e.message; });\nsetTimeout(function () {' + test + '}, 150);\n</scr' + 'ipt>\n';
writeFileSync(BAU + '/t-buchstaben.html', html.replace('</body>', skript + '</body>'));
console.log('Buchstaben-Testseite geschrieben');
