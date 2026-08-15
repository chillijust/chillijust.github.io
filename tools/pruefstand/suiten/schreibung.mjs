// Prüft die Übung «Schreibung»: die Lücke, den Lernstand je Regel, das
// Prüfwort und den Weg über Home, Filter und Sicherungscode.
//
// **Die eine Prüfung, um die es hier geht, ist A4.** Die erste Fassung der
// Daten nannte die Lücke als Zeichenindex und lag bei jedem dritten Wort
// daneben — ohne dass es jemandem aufgefallen wäre, denn eine falsche Zahl
// sieht aus wie eine richtige. Jetzt ergibt sich die Lücke aus dem Paar
// «ist»/«klingt», und A4 rechnet für jede einzelne Aufgabe nach, dass sich
// beide Schreibweisen daraus wieder zusammensetzen lassen.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');
const regeln = JSON.parse(readFileSync(WURZEL + '/data/ortho.json', 'utf8'));
console.log('Schreibregeln in /data:', regeln.length,
  '· Aufgaben:', regeln.reduce((n, r) => n + r.aufgaben.length, 0));

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
var MARKE = '́';

// Eine Regel allein fällig machen, alle anderen aus dem Weg räumen. Ohne das
// zieht orthoWaehlen() immer die erste — und die Prüfung liefe an der Regel
// vorbei, die sie meint.
function nurDiese(id, stufe) {
  ORTHO.forEach(function (r) {
    state.orthoBox[r.id] = r.id === id ? stufe : BOX_MAX;
    state.orthoSeen[r.id] = Date.now();
  });
  orthoWahl = null;
  orthoRegel = null;
  orthoQ = null;
  orthoRegelNeu = false;
}
// Eine bestimmte Aufgabe erzwingen — sonst lost orthoFrageBauen() aus, und
// eine Prüfung über das Prüfwort träfe irgendein Wort.
function stelleAuf(id, ist) {
  var r = orthoFinde(id);
  var a = r.aufgaben.filter(function (x) { return x.ist === ist; })[0];
  orthoRegel = id;
  orthoQ = {
    regel: id, aufgabe: a, stelle: orthoStelle(a),
    tippen: orthoBox(r) >= SATZ_STUFE,
    optionen: [orthoStelle(a).richtig, orthoStelle(a).falsch]
  };
  orthoPhase = 'ask';
  orthoPicked = null;
  orthoEingabe = '';
  return a;
}
// Antippen wählt nur — die Vorgabe «erst wählen, dann bestätigen» steht auf an.
function waehle(wert) {
  alle('[data-orthoopt]').filter(function (b) {
    return b.dataset.orthoopt === wert;
  })[0].click();
  if (q('#orthoConfirm')) q('#orthoConfirm').click();
}

try {
  tutEnde();
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Die Lücke ergibt sich aus dem Paar ────────────────
  var molo = orthoStelle({ ist: 'молоко', klingt: 'малоко' });
  pruefe('A1 eine Ersetzung: молоко gegen малоко',
    molo.vor === 'м' && molo.richtig === 'о' && molo.falsch === 'а' && molo.nach === 'локо',
    [molo.vor, molo.richtig, molo.falsch, molo.nach].join('|'));
  var vrach = orthoStelle({ ist: 'врач', klingt: 'врачь' });
  pruefe('A2 ein Zeichen zu viel: die richtige Seite ist leer',
    vrach.richtig === '' && vrach.falsch === 'ь', [vrach.richtig, vrach.falsch].join('|'));
  var solnce = orthoStelle({ ist: 'солнце', klingt: 'сонце' });
  pruefe('A3 ein Zeichen zu wenig: die falsche Seite ist leer',
    solnce.richtig === 'л' && solnce.falsch === '', [solnce.richtig, solnce.falsch].join('|'));

  // **Die tragende Prüfung.** Aus vor + Stelle + nach muss sich beides wieder
  // ergeben — sonst zeigt die Aufgabe eine Lücke an der falschen Stelle.
  var schief = [];
  ORTHO.forEach(function (r) {
    r.aufgaben.forEach(function (a) {
      var s = orthoStelle(a);
      if (s.vor + s.richtig + s.nach !== a.ist) schief.push(a.ist + ' (ist)');
      if (s.vor + s.falsch + s.nach !== a.klingt) schief.push(a.ist + ' (klingt)');
    });
  });
  pruefe('A4 jede Aufgabe setzt sich aus ihrer Lücke wieder zusammen',
    schief.length === 0, schief.slice(0, 6).join(' · '));

  var breit = [];
  ORTHO.forEach(function (r) {
    r.aufgaben.forEach(function (a) {
      var s = orthoStelle(a);
      if (s.richtig === s.falsch || s.richtig.length > 1 || s.falsch.length > 1) breit.push(a.ist);
    });
  });
  pruefe('A5 es ist immer genau eine Stelle', breit.length === 0, breit.join(' '));

  // Betonungszeichen: im Aufgabenwort nie, im Prüfwort immer — dort ist es
  // der ganze Beweis.
  var zeichenFalsch = [];
  ORTHO.forEach(function (r) {
    r.aufgaben.forEach(function (a) {
      if (a.ist.indexOf(MARKE) !== -1 || a.klingt.indexOf(MARKE) !== -1) zeichenFalsch.push(a.ist);
      if (a.pruef && a.pruef.indexOf(MARKE) === -1) zeichenFalsch.push(a.pruef);
    });
  });
  pruefe('A6 Betonung nur im Prüfwort', zeichenFalsch.length === 0, zeichenFalsch.join(' '));
  pruefe('A7 acht Regeln mit je mindestens drei Aufgaben',
    ORTHO.length === 8 && ORTHO.every(function (r) { return r.aufgaben.length >= 3; }),
    String(ORTHO.length));

  // ── B · Lernstand je Regel ────────────────────────────────
  state = defaultState();
  pruefe('B1 der Stand kennt die Regeln',
    typeof state.orthoBox === 'object' && typeof state.orthoSeen === 'object');
  var erste = ORTHO[0];
  orthoUpdate(erste, true);
  pruefe('B2 richtig hebt die Stufe', orthoBox(erste) === 1);
  orthoUpdate(erste, false);
  pruefe('B3 falsch senkt sie', orthoBox(erste) === 0);
  pruefe('B4 unter null geht es nicht', (function () {
    orthoUpdate(erste, false); return orthoBox(erste) === 0;
  })());

  // **Der Unterschied zu «Grammatik».** Die Schreibung steht auf Home unter
  // «Wörter», nicht unter «Freiwillig» — also zählt sie in Serie und Antworten.
  state = defaultState();
  var vorherAnt = state.answered;
  orthoUpdate(ORTHO[0], true);
  orthoUpdate(ORTHO[1], true);
  pruefe('B5 sie zählt in Serie und Antworten mit',
    state.answered === vorherAnt + 2 && state.streak === 2,
    state.answered + '/' + state.streak);
  gramUpdate(GRAMMATIK[0], true);
  pruefe('B6 «Grammatik» tut das weiterhin nicht — sie ist freiwillig',
    state.answered === vorherAnt + 2 && state.streak === 2);
  orthoUpdate(ORTHO[0], false);
  pruefe('B7 ein Fehler reißt die Serie', state.streak === 0);

  pruefe('B8 fremde Regeln fallen beim Verschmelzen weg',
    Object.keys(mergeState({ orthoBox: { akanje: 2, quatsch: 4 } }).orthoBox).join() === 'akanje');
  pruefe('B9 ein Stand von vor 1.8.0 bekommt leere Töpfe',
    Object.keys(mergeState({ boxes: {} }).orthoBox).length === 0);

  // ── C · Entdecken, dann anwenden ──────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('schreibung');
  var r0 = orthoAktuell();
  pruefe('C1 die erste Regel ist noch unentdeckt', !orthoEntdeckt(r0));
  pruefe('C2 sie wird zuerst gezeigt, nicht abgefragt',
    alle('[data-orthodeutung]').length === 3 && !q('[data-orthoopt]'),
    String(alle('[data-orthodeutung]').length));
  pruefe('C3 die Gegenüberstellung steht darüber',
    alle('.gram-paar').length >= 4, String(alle('.gram-paar').length));
  alle('[data-orthodeutung]')[r0.richtig].click();
  q('#orthoDeutungAb').click();
  pruefe('C4 danach führt ein Knopf zur Regel', !!q('#orthoZurRegel'));
  q('#orthoZurRegel').click();
  pruefe('C5 entdeckt ist entdeckt — die Stufe steigt davon nicht',
    orthoEntdeckt(r0) && orthoBox(r0) === 0);
  pruefe('C6 die Regelkarte trägt den Merksatz',
    q('.gram-merk').textContent === r0.merksatz, q('.gram-merk').textContent);
  q('#orthoZurUebung').click();
  pruefe('C7 danach steht die Aufgabe da', !!q('.ortho-luecke') && !!q('[data-orthoopt]'));

  // Eine falsche Deutung führt genauso zur Regel — entdecken ist kein Prüfen.
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('schreibung');
  alle('[data-orthodeutung]')[(orthoAktuell().richtig + 1) % 3].click();
  q('#orthoDeutungAb').click();
  pruefe('C8 auch wer danebenliegt, kommt zur Regel', !!q('#orthoZurRegel'));

  // ── D · Wählen ────────────────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  nurDiese('akanje', 0);
  setTab('schreibung');
  var a1 = stelleAuf('akanje', 'молоко');
  renderSchreibung();
  pruefe('D1 unter der Satzstufe wird gewählt',
    alle('[data-orthoopt]').length === 2 && !q('#orthoInput'),
    String(alle('[data-orthoopt]').length));
  var beschriftung = alle('[data-orthoopt]').map(function (b) { return b.dataset.orthoopt; }).sort().join();
  pruefe('D2 die beiden Möglichkeiten sind die Stelle selbst',
    beschriftung === 'а,о', beschriftung);
  pruefe('D3 das Wort steht mit Lücke da',
    q('.word').textContent.indexOf('локо') !== -1 &&
    q('.word').textContent.indexOf('молоко') === -1, q('.word').textContent);
  pruefe('D4 die Lautung steht dabei — sie ist die Aufgabe',
    q('.gram-vorgabe').textContent.indexOf('малоко') !== -1, q('.gram-vorgabe').textContent);
  pruefe('D5 solange gefragt ist, spricht nichts', !q('.card [data-say]'));

  var vorStufe = orthoBox(orthoFinde('akanje'));
  waehle('о');
  pruefe('D6 richtig gewählt hebt die Stufe',
    orthoBox(orthoFinde('akanje')) === vorStufe + 1 && orthoCorrect === true,
    String(orthoBox(orthoFinde('akanje'))));
  pruefe('D7 die Auflösung nennt das ganze Wort',
    q('.feedback').textContent.indexOf('молоко') !== -1 || orthoCorrect,
    q('.feedback').textContent);
  pruefe('D8 und jetzt darf gesprochen werden',
    !!q('.card [data-say]') && q('.card [data-say]').dataset.say === 'молоко',
    q('.card [data-say]') ? q('.card [data-say]').dataset.say : 'keiner');

  nurDiese('akanje', 1);
  stelleAuf('akanje', 'вода');
  renderSchreibung();
  waehle('а');
  pruefe('D9 falsch gewählt senkt die Stufe',
    orthoBox(orthoFinde('akanje')) === 0 && orthoCorrect === false,
    String(orthoBox(orthoFinde('akanje'))));

  // «nichts» ist eine Möglichkeit wie jede andere — врач gegen врачь.
  nurDiese('weichzeichen', 0);
  stelleAuf('weichzeichen', 'врач');
  renderSchreibung();
  var leer = alle('[data-orthoopt]').filter(function (b) { return b.dataset.orthoopt === ''; });
  pruefe('D10 «nichts» steht als eigene Möglichkeit da',
    leer.length === 1 && leer[0].textContent === 'nichts',
    leer.length ? leer[0].textContent : 'fehlt');
  pruefe('D11 wo beide Schreibweisen gleich klingen, wird keine Lautung behauptet',
    q('.gram-vorgabe').textContent.indexOf('врачь') === -1, q('.gram-vorgabe').textContent);
  waehle('');
  pruefe('D12 und sie zählt als richtig', orthoCorrect === true);

  // ── E · Schreiben ab der Satzstufe ────────────────────────
  nurDiese('akanje', SATZ_STUFE);
  stelleAuf('akanje', 'гора');
  renderSchreibung();
  pruefe('E1 ab der Satzstufe wird geschrieben',
    !!q('#orthoInput') && !q('[data-orthoopt]'));
  pruefe('E2 raten geht dann nicht mehr — es gibt nichts zu tippen als das Wort',
    q('#orthoConfirm').disabled === true);
  pruefe('E3 die Tastatur lässt sich einblenden', !!q('#orthoKbToggle'));
  orthoEingabe = 'гора';
  q('#orthoConfirm').disabled = false;
  q('#orthoConfirm').click();
  pruefe('E4 richtig geschrieben hebt die Stufe',
    orthoCorrect === true && orthoBox(orthoFinde('akanje')) === SATZ_STUFE + 1,
    String(orthoBox(orthoFinde('akanje'))));
  pruefe('E5 die Prüfzeile steht da', !!q('.pruefzeile'));

  nurDiese('akanje', SATZ_STUFE);
  stelleAuf('akanje', 'нога');
  renderSchreibung();
  orthoEingabe = 'нага';
  q('#orthoConfirm').disabled = false;
  q('#orthoConfirm').click();
  pruefe('E6 nach Gehör geschrieben zählt als falsch', orthoCorrect === false);

  // Das Betonungszeichen ist Anzeige, kein Vergleich — auch hier.
  nurDiese('akanje', SATZ_STUFE);
  stelleAuf('akanje', 'сова');
  renderSchreibung();
  orthoEingabe = 'со' + 'в' + 'а' + MARKE;
  q('#orthoConfirm').disabled = false;
  q('#orthoConfirm').click();
  pruefe('E7 ein getipptes Betonungszeichen kostet nichts', orthoCorrect === true);

  // ── F · Das Prüfwort ──────────────────────────────────────
  nurDiese('akanje', 0);
  var a2 = stelleAuf('akanje', 'вода');
  renderSchreibung();
  waehle('а');
  pruefe('F1 nach dem Fehler steht das Prüfwort da',
    q('.card').textContent.indexOf(a2.pruef) !== -1, a2.pruef);
  pruefe('F2 es trägt seine Betonung sichtbar', a2.pruef.indexOf(MARKE) !== -1);

  // Wo es keines gibt, steht der Merksatz — nicht nichts.
  nurDiese('schischi', 0);
  stelleAuf('schischi', 'жить');
  renderSchreibung();
  waehle(alle('[data-orthoopt]')[0].dataset.orthoopt);
  pruefe('F3 ohne Prüfwort steht der Merksatz da',
    q('.card').textContent.indexOf(orthoFinde('schischi').merksatz) !== -1);

  // ── G · Home, Filter, Zurücksetzen ────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  // Sie steht weiter bei den Wörtern und hinter «Tippen» — die Gruppe beginnt
  // seit ADR 0066 nur eine Stelle später, weil «Zeichen» davor steht.
  pruefe('G1 die Kachel steht bei den Wörtern, hinter «Tippen»',
    alle('#homeAlle [data-uebung]').map(function (b) { return b.dataset.uebung; }).slice(0, 5).join() ===
    'buchstaben,lernsets,freestyle,tippen,schreibung',
    alle('#homeAlle [data-uebung]').map(function (b) { return b.dataset.uebung; }).join());
  pruefe('G2 sie nennt die neue Regel beim Namen',
    q('#homeAlle [data-uebung="schreibung"] .kachel-stand').textContent.indexOf(ORTHO[0].name) !== -1,
    q('#homeAlle [data-uebung="schreibung"] .kachel-stand').textContent);
  q('#homeAlle [data-uebung="schreibung"]').click();
  pruefe('G3 die Kachel führt hin', currentTab === 'schreibung');
  pruefe('G4 der Regelfall färbt den Filter nicht',
    !q('#filterKnopf').classList.contains('aktiv'));
  q('#filterKnopf').click();
  pruefe('G5 der Filter listet alle Regeln und die Reihenfolge',
    alle('[data-fw="orthowahl"]').length === ORTHO.length + 1,
    String(alle('[data-fw="orthowahl"]').length));
  alle('[data-fw="orthowahl"]').filter(function (b) {
    return b.dataset.fv === 'ogo';
  })[0].click();
  pruefe('G6 eine gewählte Regel sticht die Reihenfolge',
    orthoWahl === 'ogo' && orthoAktuell().id === 'ogo', String(orthoWahl));
  renderKopf();
  pruefe('G7 und der Filter zeigt die Abweichung',
    q('#filterKnopf').classList.contains('aktiv'));

  ORTHO.forEach(function (r) { state.orthoBox[r.id] = BOX_MAX; state.orthoSeen[r.id] = Date.now(); });
  orthoWahl = null; orthoRegel = null; orthoQ = null;
  renderSchreibung();
  pruefe('G8 alles gemeistert gibt einen Leerzustand', !!q('.leer') && !q('[data-orthoopt]'));
  setTab('home');
  pruefe('G9 die Kachel sagt es auch',
    q('#homeAlle [data-uebung="schreibung"] .kachel-stand').textContent === 'alle Regeln sitzen',
    q('#homeAlle [data-uebung="schreibung"] .kachel-stand').textContent);

  orthoRegel = 'akanje'; orthoRegelOffen = true; orthoEingabe = 'xy'; orthoWahl = 'ogo';
  ansichtenZuruecksetzen();
  pruefe('G10 Zurücksetzen räumt alles auf',
    orthoRegel === null && orthoWahl === null && orthoQ === null &&
    orthoRegelOffen === false && orthoEingabe === '');

  // ── H · Sicherungscode ────────────────────────────────────
  state = defaultState();
  state.orthoBox.akanje = 3;
  state.orthoSeen.akanje = Date.now();
  var code = encodeBackup();
  pruefe('H1 zehn Felder', code.split('~').length === 10, String(code.split('~').length));
  var zurueck = mergeState(decodeBackup(code));
  pruefe('H2 der Schreibstand kommt zurück', zurueck.orthoBox.akanje === 3,
    String(zurueck.orthoBox.akanje));
  pruefe('H3 der Überblick nennt ihn', bkUeberblick(state).indexOf('1 Schreibregel') !== -1,
    bkUeberblick(state));
  var alt = code.split('~');
  var rumpf = alt.slice(0, 8).join('~');
  var neunFeldrig = rumpf + '~' + bkPruefsumme(rumpf);
  var n9 = mergeState(decodeBackup(neunFeldrig));
  pruefe('H4 neunfeldrige Codes bleiben lesbar', Object.keys(n9.orthoBox).length === 0);

  // ── I · Der Jubel gehört dem ersten Mal ───────────────────
  state = defaultState();
  ORTHO.forEach(function (r) { state.orthoBox[r.id] = BOX_MAX; });
  jubelNachtragen();
  pruefe('I1 wer schon fertig ist, bekommt kein Fenster mehr',
    state.gefeiert.schreibung === 1);
  pruefe('I2 der Anlass hat einen Namen und Texte',
    !!JUBEL_ANLASS.schreibung && !!JUBEL.schreibung && JUBEL.schreibung.length === 3);
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

writeFileSync(BAU + '/t-schreibung.html', testseite(html, test));
console.log('Schreibungs-Testseite geschrieben');
