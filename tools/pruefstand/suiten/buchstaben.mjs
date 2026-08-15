// Prüft die Übung «Buchstaben»: Inhalte, Tafel, Quiz, Trennung vom Wortschatz.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
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
  // **Und zwar bei jeder Frage, nicht bei dieser einen.** Vier Buchstaben teilen
  // sich zwei Laute (ж/ш «sch», з/с «s»); standen zwei davon nebeneinander, gab
  // es zwei gleich beschriftete Antworten. Das passierte selten genug, dass die
  // Prüfung darüber nur ab und zu rot wurde — eine flatterhafte Prüfung ist eine
  // schlechte, also fragt sie jetzt hundert Fragen statt einer.
  pruefe('C4 keine doppelten Laute in den Antworten',
    new Set(abcQ.options.map(function (o) { return o[2]; })).size === 4);
  var doppelt = null;
  for (var dv = 0; dv < 100 && !doppelt; dv++) {
    abcQ = null;
    renderBuchstaben();
    if (!abcQ || !abcQ.options) continue;
    var laute = abcQ.options.map(function (o) { return o[2]; });
    if (new Set(laute).size !== laute.length) doppelt = abcQ.b[1] + ': ' + laute.join();
  }
  pruefe('C4b auch in hundert weiteren Fragen nicht', !doppelt, doppelt || '');
  abcQ = null;
  renderBuchstaben();
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
  // **Die Reihenfolge ist der Lernweg** (ADR 0066): Zeichen, Wörter, Sätze.
  // «Buchstaben» steht darum vorn, nicht hinten unter «Freiwillig» — das
  // widersprach dem Tutorial, das seit jeher mit ihnen anfängt.
  pruefe('G1 «Buchstaben» steht ganz vorn',
    alle('#homeAlle [data-uebung]').map(function (b) { return b.dataset.uebung; }).join(',') ===
    'buchstaben,lernsets,freestyle,tippen,schreibung,power,grammatik,uebersetzen',
    alle('#homeAlle [data-uebung]').map(function (b) { return b.dataset.uebung; }).join(','));
  // **Nach Namen fragen, nicht nach Platz**: Die sechste Kachel war eine
  // Position, keine Aussage — seit die Übersicht oben eine Auswahl trägt,
  // zählt sie anders (ADR 0065).
  pruefe('G2 sie nennt ihren Stand',
    q('#homeAlle [data-uebung="buchstaben"] .kachel-stand').textContent.indexOf('von 33') !== -1,
    q('#homeAlle [data-uebung="buchstaben"] .kachel-stand').textContent);
  q('#homeAlle [data-uebung="buchstaben"]').click();
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
  pruefe('H4 die Kachel sagt es',
    q('#homeAlle [data-uebung="buchstaben"] .kachel-stand').textContent === 'alles gemeistert',
    q('#homeAlle [data-uebung="buchstaben"] .kachel-stand').textContent);

  // I · Sicherungscode nimmt die Buchstaben mit
  var code = encodeBackup();
  pruefe('I1 elf Felder', code.split('~').length === 11, String(code.split('~').length));
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
  abcAnsicht = 'ueben'; abcRichtung = 'zeichen';
  // **Seit den schärfenden Formen ist die Kachelaufgabe nicht mehr sicher.**
  // щ steht in zwei Minimalpaaren, und dann kommt manchmal jene Frage. Also
  // so lange bauen, bis die gemeinte Form dasteht — das ist keine Nachsicht,
  // die Kachelaufgabe muss ja weiterhin vorkommen.
  abcQ = null;
  for (var kv = 0; kv < 60 && (!abcQ || abcQ.modus !== 'kacheln'); kv++) {
    abcQ = null;
    abcFrageBauen();
  }
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
  // ── P · Die drei schärfenden Formen (ADR 0058) ────────────
  // Erkennen ist nicht dasselbe wie unterscheiden. Alle drei bewerten den
  // Buchstaben, an dem sie hängen — sonst gehörten sie nicht hierher.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = 1; state.abcSeen[b[1]] = Date.now(); });
  setTab('buchstaben');

  function formVon(zeichen, modus) {
    var b = ALPHABET.filter(function (x) { return x[1] === zeichen; })[0];
    for (var i = 0; i < 400; i++) {
      abcQ = null;
      if (modus === 'paar' && abcPaarAufgabe(b)) return abcQ;
      if (modus === 'silbe' && abcSilbenAufgabe(b)) return abcQ;
      if (modus === 'betonung' && abcBetonungsAufgabe(b)) return abcQ;
    }
    return null;
  }

  var paarQ = formVon('щ', 'paar');
  pruefe('P1 das Minimalpaar kommt zustande', !!paarQ);
  pruefe('P2 es hat genau zwei Möglichkeiten — mehr hat ein Paar nicht',
    paarQ.options.length === 2, String(paarQ.options.length));
  pruefe('P3 die gesuchte ist dabei',
    paarQ.options.some(function (o) { return o.id === 'щ'; }) && paarQ.loesung === 'щ');
  pruefe('P4 die andere ist der Partner aus den Daten',
    PAARE.some(function (p) {
      var andere = paarQ.options.filter(function (o) { return o.id !== 'щ'; })[0].id;
      return (p[0] === 'щ' && p[1] === andere) || (p[1] === 'щ' && p[0] === andere);
    }));
  pruefe('P5 gefragt wird mit der Merkhilfe, nicht mit dem Laut',
    paarQ.frage2 && paarQ.frage2.length > 5 && paarQ.frage2.indexOf('щ') === -1,
    paarQ.frage2);

  var silbeQ = formVon('я', 'silbe');
  pruefe('P6 die Silbenleiter kommt zustande', !!silbeQ);
  pruefe('P7 vier Silben stehen zur Wahl', silbeQ.options.length === 4,
    String(silbeQ.options.length));
  pruefe('P8 die richtige trägt genau diesen Vokal',
    silbeQ.loesung.charAt(1) === 'я' && silbeQ.weich === true, silbeQ.loesung);
  pruefe('P9 die falschen tragen die andere Seite', (function () {
    var hart = 'аоуыэ';
    return silbeQ.options.filter(function (o) { return o.id !== silbeQ.loesung; })
      .every(function (o) { return hart.indexOf(o.id.charAt(1)) !== -1; });
  })(), silbeQ.options.map(function (o) { return o.id; }).join(' '));
  var silbeHart = formVon('а', 'silbe');
  pruefe('P10 bei einem harten Vokal dreht sich die Frage um',
    silbeHart.weich === false && silbeHart.frage.indexOf('hart') !== -1,
    silbeHart.frage);
  pruefe('P11 immer vier verschiedene Konsonanten', (function () {
    var k = silbeQ.options.map(function (o) { return o.id.charAt(0); });
    return k.filter(function (c, i) { return k.indexOf(c) !== i; }).length === 0;
  })());

  var betQ = formVon('о', 'betonung');
  pruefe('P12 die Betonungsaufgabe kommt zustande', !!betQ);
  pruefe('P13 eine Lesart je Vokal',
    betQ.options.length === abcVokalzahl(betQ.wort.ru), String(betQ.options.length));
  pruefe('P14 die richtige Lesart stimmt mit der Betonungsliste überein',
    betQ.loesung === abcBetontStelle(betQ.wort.ru, BETONUNG[betQ.wort.ru]));
  pruefe('P15 der betonte Vokal ist genau dieser Buchstabe', (function () {
    var i = betQ.loesung.indexOf('́');
    return betQ.loesung.charAt(i - 1) === 'о';
  })(), betQ.loesung);
  // **Die Frage darf die Antwort nicht schon zeigen.**
  pruefe('P16 das Wort steht ohne Zeichen da', betQ.wort.ru.indexOf('́') === -1);
  pruefe('P17 jede Lesart trägt genau ein Zeichen',
    betQ.options.every(function (o) { return (o.text.match(/́/g) || []).length === 1; }));

  // Alle drei bewerten den Buchstaben — richtig hebt, falsch senkt.
  ['paar', 'silbe', 'betonung'].forEach(function (m, i) {
    var zeichen = m === 'paar' ? 'щ' : m === 'silbe' ? 'я' : 'о';
    var b = ALPHABET.filter(function (x) { return x[1] === zeichen; })[0];
    state.abcBox[zeichen] = 2;
    abcQ = formVon(zeichen, m);
    abcPhase = 'ask';
    abcPicked = abcQ.loesung;
    abcPruefen();
    var hoch = abcBox(b) === 3;
    abcQ = formVon(zeichen, m);
    abcPhase = 'ask';
    abcPicked = 'kaputt';
    abcPruefen();
    pruefe('P1' + (8 + i) + ' «' + m + '» bewertet den Buchstaben',
      hoch && abcBox(b) === 2, m + ': ' + abcBox(b));
  });

  // **Sie führen nicht ein, sie schärfen** — auf Stufe 0 kommen sie nicht.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = 0; });
  var frueh = [];
  for (var mv = 0; mv < 120; mv++) {
    abcQ = null;
    abcFrageBauen();
    if (abcQ && abcQ.loesung !== undefined) frueh.push(abcQ.modus);
  }
  pruefe('P21 auf Stufe 0 schärft nichts', frueh.length === 0, frueh.slice(0, 4).join(' '));

  // **Wer eine Richtung festlegt, bekommt sie auch.** Die schärfenden Formen
  // sind weder das eine noch das andere — sie kommen nur bei «gemischt».
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = 2; state.abcSeen[b[1]] = Date.now(); });
  ['zeichen', 'laut'].forEach(function (r) {
    abcRichtung = r;
    var fremd = [];
    for (var rv = 0; rv < 120; rv++) {
      abcQ = null;
      abcFrageBauen();
      if (abcQ && abcQ.loesung !== undefined) fremd.push(abcQ.modus);
    }
    pruefe('P22 «' + r + '» bleibt bei seiner Richtung', fremd.length === 0,
      fremd.slice(0, 4).join(' '));
  });
  abcRichtung = 'gemischt';
  var gesehen = {};
  for (var gv = 0; gv < 600; gv++) {
    abcQ = null;
    abcFrageBauen();
    if (abcQ && abcQ.loesung !== undefined) gesehen[abcQ.modus] = true;
  }
  pruefe('P23 bei «gemischt» kommen alle drei vor',
    gesehen.paar && gesehen.silbe && gesehen.betonung,
    Object.keys(gesehen).join(' '));

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

writeFileSync(BAU + '/t-buchstaben.html', testseite(html, test));
console.log('Buchstaben-Testseite geschrieben');
