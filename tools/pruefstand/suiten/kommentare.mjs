// Prüft die Kommentarzeile und den Umzug des Fakts: Sagt die Chili nach jeder
// Auflösung etwas, sagt sie das Richtige, und wiederholt sie sich nicht?
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
// Ein Satz mit Platzhalter steht im Topf als «{n} Zeichen …» und auf dem
// Schirm mit eingesetzter Zahl — also Anfang und Ende vergleichen. Ohne
// regulären Ausdruck, denn dessen Maskierung braucht «$&», und genau das
// verschluckte früher der Seitenbau.
function inTopf(topf, text) {
  return (KOMMENTAR_TOPF[topf] || []).some(function (v) {
    if (v === text) return true;
    var auf = v.indexOf('{');
    var zu = v.indexOf('}');
    if (auf === -1 || zu < auf) return false;
    var vorn = v.slice(0, auf);
    var hinten = v.slice(zu + 1);
    return text.length > vorn.length + hinten.length &&
      text.slice(0, vorn.length) === vorn &&
      (hinten === '' || text.slice(text.length - hinten.length) === hinten);
  });
}
// Ein Topf, ohne Losglück: der Würfel wird kurz festgehalten.
function mitWuerfel(wert, tun) {
  var echt = Math.random;
  Math.random = function () { return wert; };
  try { tun(); } finally { Math.random = echt; }
}

try {
  // Erst den Scheinwerfer aus. Solange das Tutorial läuft, steht die Figur in
  // **seiner** Blase — die Kommentarblase schweigt dann zu Recht, und ohne
  // diesen Zug prüfte die Suite bloß, dass zwei Blasen sich nicht ins Gehege
  // kommen (ADR 0060).
  tutEnde();
  // ── A · Die Töpfe ─────────────────────────────────────────
  state = defaultState(); ansichtenZuruecksetzen();
  var toepfe = ['richtig', 'trocken', 'serie', 'jo', 'weich', 'lang',
    'eins', 'knapp', 'daneben', 'auf'];
  pruefe('A1 alle zehn Töpfe sind gefüllt',
    toepfe.every(function (t) { return (KOMMENTAR_TOPF[t] || []).length > 0; }),
    toepfe.map(function (t) { return t + ':' + (KOMMENTAR_TOPF[t] || []).length; }).join(' '));
  pruefe('A2 kein Satz steht in zwei Töpfen', (function () {
    var alleTexte = [];
    toepfe.forEach(function (t) { alleTexte = alleTexte.concat(KOMMENTAR_TOPF[t]); });
    var einzeln = {};
    alleTexte.forEach(function (x) { einzeln[x] = 1; });
    return Object.keys(einzeln).length === alleTexte.length;
  })());
  pruefe('A3 der Vorrat ist breit genug für lange Sitzungen',
    KOMMENTARE.length >= 60, String(KOMMENTARE.length));

  // ── B · Der richtige Topf zum Ergebnis ────────────────────
  // Aufgedeckt sticht alles: Wer nachsieht, hat nichts behauptet.
  kommentarSetzen({ ok: false, aufgedeckt: true, loesung: 'книга', eingabe: '', daneben: 5 });
  pruefe('B1 Aufdecken bekommt seinen eigenen Ton', inTopf('auf', kommentar), kommentar);
  kommentarSetzen({ ok: false, loesung: 'книга', eingabe: 'книжа', getippt: true, daneben: 1 });
  pruefe('B2 ein Zeichen hat seinen eigenen Topf', inTopf('eins', kommentar), kommentar);
  pruefe('B2b und kein Satz dort behauptet eine andere Zahl',
    KOMMENTAR_TOPF.eins.every(function (t) {
      return t.indexOf('Zwei') === -1 && t.indexOf('zwei') === -1 && t.indexOf('{f}') === -1;
    }));
  kommentarSetzen({ ok: false, loesung: 'книга', eingabe: 'кот', getippt: true, daneben: 4 });
  pruefe('B3 vier Zeichen daneben heißt «daneben»', inTopf('daneben', kommentar), kommentar);
  kommentarSetzen({ ok: false, loesung: 'книга', eingabe: 'книг', getippt: true, daneben: 2 });
  pruefe('B4 zwei Zeichen sind knapp', inTopf('knapp', kommentar), kommentar);
  pruefe('B4b und «knapp» behauptet keine feste Zahl',
    KOMMENTAR_TOPF.knapp.every(function (t) {
      return t.indexOf('Ein Buchstabe') === -1 && t.indexOf('Zwei Zeichen') === -1;
    }));

  // ── C · Besonderheiten, aber nur beim Schreiben ───────────
  // Eine gelegte Kachel ist keine Behauptung über die Schreibweise (ADR 0033).
  state.streak = 0;
  mitWuerfel(0.1, function () {
    kommentarSetzen({ ok: true, loesung: 'ёлка', eingabe: 'ёлка', getippt: true, daneben: 0 });
  });
  pruefe('C1 ё richtig geschrieben wird bemerkt', inTopf('jo', kommentar), kommentar);
  mitWuerfel(0.1, function () {
    kommentarSetzen({ ok: true, loesung: 'ёлка', eingabe: 'ёлка', getippt: false, daneben: 0 });
  });
  pruefe('C2 gelegt zählt dafür nicht', !inTopf('jo', kommentar), kommentar);
  mitWuerfel(0.1, function () {
    kommentarSetzen({ ok: true, loesung: 'мать', eingabe: 'мать', getippt: true, daneben: 0 });
  });
  pruefe('C3 das Weichzeichen wird bemerkt', inTopf('weich', kommentar), kommentar);
  mitWuerfel(0.4, function () {
    kommentarSetzen({ ok: true, loesung: 'здравствуйте', eingabe: 'здравствуйте', getippt: true, daneben: 0 });
  });
  pruefe('C4 ein langes Wort auch', inTopf('lang', kommentar), kommentar);
  state.streak = 7;
  mitWuerfel(0.1, function () {
    kommentarSetzen({ ok: true, loesung: 'дом', eingabe: 'дом', getippt: true, daneben: 0 });
  });
  pruefe('C5 eine Serie sticht alles andere', inTopf('serie', kommentar), kommentar);
  state.streak = 0;

  // ── D · Trocken ist Würze, nicht Grundton ─────────────────
  mitWuerfel(0.1, function () {
    kommentarSetzen({ ok: true, loesung: 'дом', eingabe: 'дом', getippt: true, daneben: 0 });
  });
  pruefe('D1 ein niedriger Wurf wird trocken', inTopf('trocken', kommentar), kommentar);
  mitWuerfel(0.8, function () {
    kommentarSetzen({ ok: true, loesung: 'дом', eingabe: 'дом', getippt: true, daneben: 0 });
  });
  pruefe('D2 ein hoher freundlich', inTopf('richtig', kommentar), kommentar);

  // ── E · Platzhalter werden gefüllt ────────────────────────
  pruefe('E1 keine geschweifte Klammer bleibt stehen', (function () {
    for (var i = 0; i < 200; i++) {
      state.streak = i % 9;
      kommentarSetzen({
        ok: i % 2 === 0, loesung: 'книга', eingabe: 'книжа', getippt: true, daneben: (i % 4)
      });
      if (/\{/.test(kommentar)) return false;
    }
    return true;
  })());
  state.streak = 0;

  // ── F · Nichts wiederholt sich sofort ─────────────────────
  kommentarZuletzt = [];
  var folge = [];
  for (var f = 0; f < 6; f++) {
    kommentarSetzen({ ok: false, loesung: 'книга', eingabe: 'кот', getippt: true, daneben: 4 });
    folge.push(kommentar);
  }
  pruefe('F1 sechs Sätze aus einem Topf, keiner doppelt', (function () {
    var einzeln = {};
    folge.forEach(function (x) { einzeln[x] = 1; });
    return Object.keys(einzeln).length === folge.length;
  })(), folge.join(' | '));
  pruefe('F2 das Gedächtnis wächst nicht über sechs',
    kommentarZuletzt.length <= 6, String(kommentarZuletzt.length));

  // ── G · Die Einstellung schaltet ab ───────────────────────
  state.settings.kommentare = false;
  kommentarSetzen({ ok: true, loesung: 'дом', eingabe: 'дом', getippt: true, daneben: 0 });
  pruefe('G1 aus heißt aus', kommentar === '', kommentar);
  pruefe('G2 und die Blase bleibt weg', (function () {
    chiliAktualisieren();
    return q('#chiliBlase').hidden === true;
  })());
  state.settings.kommentare = true;

  // ── H · Die Blase steht in fünf Übungen, nicht in sechs ───
  // Sie hängt an der Figur, und die zieht der Beobachter auf «main» nach —
  // der läuft erst nach diesem Zug. Hier wird darum von Hand nachgezogen.
  function nachAntwort(tab, tun) {
    state = defaultState(); ansichtenZuruecksetzen();
    ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
    setTab(tab);
    tun();
    chiliAktualisieren();
    return q('#chiliBlase').hidden === false;
  }
  pruefe('H1 «Lernsets» kommentiert', nachAntwort('lernsets', function () {
    uebNext(true);
    uebPicked = uebQ.word.id;
    if (uebQ.mode === 'tiles') { uebQ.mode = 'choice'; }
    uebPruefen();
  }));
  pruefe('H2 «Tippen» kommentiert', nachAntwort('tippen', function () {
    tippenModus = 'alle'; tWord = null; renderTippen();
    q('#tInput').value = tWord.ru;
    q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
    q('#tCheck').click();
  }));
  pruefe('H3 «Übersetzen» kommentiert', nachAntwort('uebersetzen', function () {
    trTask = null; buildTransTask(); trTask.art = 'tippen';
    trEingabe = trTask.satz.ru; trPruefen(); renderUebersetzen();
  }));
  pruefe('H4 «Grammatik» kommentiert', nachAntwort('grammatik', function () {
    // Ohne einen entdeckten Baustein steht dort der Leerzustand, keine Frage.
    GRAMMATIK.forEach(function (x) { state.gramSeen[x.id] = 0; });
    gramBaustein = GRAMMATIK[0].id; gramQ = null; renderGrammatik();
    gramPicked = gramQ.loesung; gramPruefen(); renderGrammatik();
  }));
  pruefe('H5 «Buchstaben» bleibt draußen', !nachAntwort('buchstaben', function () {
    abcAnsicht = 'ueben'; abcQ = null; renderBuchstaben();
    abcQ.modus = 'wahl'; abcPicked = abcQ.b[1]; abcPruefen(); renderBuchstaben();
  }));

  // ── L · Die Blase hängt an der Figur (ADR 0060) ───────────
  state = defaultState(); ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  setTab('lernsets');
  uebNext(true);
  kommentar = 'Probe.';
  chiliAktualisieren();
  var blase = q('#chiliBlase');

  pruefe('L1 die alte Zeile gibt es nicht mehr', !q('.kommentar'));
  // **Nicht in der Bühne.** Die wird umgehängt — sonst flöge die Blase beim
  // Öffnen des Menüs mit in den runden Knopf.
  pruefe('L2 sie steckt nicht in der Chili-Bühne',
    !q('#chiliBuehne').contains(blase));
  pruefe('L3 sondern in der rechten Kopfgruppe',
    blase.parentNode.className === 'kopf-rechts', blase.parentNode.className);
  pruefe('L4 sie sagt, was der Kommentar sagt',
    q('#chiliBlaseText').textContent === kommentar, q('#chiliBlaseText').textContent);
  pruefe('L5 sie meldet sich ruhig',
    blase.getAttribute('role') === 'status' &&
    blase.getAttribute('aria-live') === 'polite');

  // **Der Zipfel wird gemessen, nicht geraten.** Die Figur ist das erste Stück
  // der Gruppe, aber nicht immer gleich weit vom Rand: In «Buchstaben» steht
  // der Tafelknopf neben ihr, in «Übersetzen» der Wissensknopf.
  var ohne = parseFloat(blase.style.getPropertyValue('--zipfel'));
  pruefe('L6 der Zipfel steht auf einem gemessenen Wert', ohne > 20, String(ohne));
  q('#tafelKnopf').hidden = false;
  chiliAktualisieren();
  var mit = parseFloat(blase.style.getPropertyValue('--zipfel'));
  q('#tafelKnopf').hidden = true;
  chiliAktualisieren();
  pruefe('L7 ein weiterer Knopf schiebt ihn mit', mit > ohne + 30,
    ohne + ' -> ' + mit);

  // **Sie endet am Inhaltsrand und wächst nach links.** Ein langer Satz darf
  // bis dorthin, aber nicht darüber hinaus.
  kommentar = 'Ein ziemlich langer Satz, der die Blase bis an den rechten Rand ' +
    'wachsen lassen soll und dabei umbrechen muss, statt aus dem Bild zu laufen.';
  chiliAktualisieren();
  var r = blase.getBoundingClientRect();
  pruefe('L8 auch ein langer Satz bleibt im Bild',
    r.left >= 0 && r.right <= window.innerWidth + 1,
    Math.round(r.left) + '..' + Math.round(r.right) + ' von ' + window.innerWidth);
  pruefe('L9 und die Blase bleibt schmaler als das Bild',
    r.width > 120 && r.width <= window.innerWidth,
    String(Math.round(r.width)));

  // **Verlässt die Figur den Kopf, geht die Blase mit.** Ein Zipfel, der auf
  // einen leeren Platz zeigt, wäre schlimmer als gar keine Blase.
  kommentar = 'Probe.';
  chiliAktualisieren();
  q('#menuKnopf').click();
  pruefe('L10 im Menü schweigt sie', blase.hidden === true);
  q('#menuKnopf').click();
  pruefe('L11 und danach steht sie wieder da', blase.hidden === false);

  // ── I · Der Fakt hat überall dieselbe Gestalt ─────────────
  // Vorher: eigener Bildschirm in «Lernsets», Streifen in den drei anderen.
  // updateBox() zählt jede Antwort mit — wer im Test selbst antwortet, muss
  // also eine unter der Schwelle anfangen, nicht auf ihr.
  function faktNach(tab, vorZaehler, weiter) {
    state = defaultState(); ansichtenZuruecksetzen();
    ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
    state.answered = vorZaehler;
    setTab(tab);
    weiter();
    return !!q('.sprechblase') && !!q('#factNext') && !!q('#factFav');
  }
  pruefe('I1 «Lernsets» zeigt die Karte', faktNach('lernsets', 5, function () { uebNext(false); }));
  pruefe('I2 «Tippen» auch', faktNach('tippen', 4, function () {
    tippenModus = 'alle'; tWord = null; renderTippen();
    q('#tInput').value = tWord.ru;
    q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
    q('#tCheck').click();
    q('#tNext').click();
  }));
  pruefe('I3 «Übersetzen» auch', faktNach('uebersetzen', 5, function () {
    trTask = null; buildTransTask(); trTask.art = 'tippen';
    trEingabe = trTask.satz.ru; trPruefen(); renderUebersetzen();
    q('#trNext').click();
  }));
  pruefe('I4 die Chili steht dabei',
    !!q('.fakt-fuss [data-chili]') || !!q('.fakt-fuss #chiliBuehne'),
    (q('.fakt-fuss') || {}).innerHTML);
  pruefe('I5 kein Faktstreifen mehr im Dokument', !q('.fakt-streifen'));

  // Und der Weg zurück in die Übung.
  q('#factNext').click();
  pruefe('I6 «Weiter üben» räumt die Karte weg', faktKarte === '' && !q('.sprechblase'));
  pruefe('I7 und die Aufgabe steht wieder da', !!q('.card'));

  // ── J · Ansichtszustand ───────────────────────────────────
  faktKarte = 'irgendwas'; kommentar = 'irgendwas';
  ansichtenZuruecksetzen();
  pruefe('J1 die Faktkarte fällt weg', faktKarte === '');
  pruefe('J2 der Kommentar auch', kommentar === '');

  // ── K · Der Schalter steht in den Einstellungen ───────────
  state = defaultState(); ansichtenZuruecksetzen();
  setTab('einstellungen');
  einstReiter = 'darstellung';
  renderEinstellungen();
  pruefe('K1 die Zeile ist da', !!q('[data-set="kommentare"]'),
    alle('[data-set]').map(function (b) { return b.dataset.set; }).join(' '));
  pruefe('K2 und sie steht im Sicherungscode',
    BK_SETTINGS.indexOf('kommentare') !== -1, BK_SETTINGS.join(','));
  pruefe('K3 ein Code überlebt den Schalter', (function () {
    state.settings.kommentare = false;
    var wieder = decodeBackup(encodeBackup());
    return wieder.settings.kommentare === false;
  })());

  // ── M · Gesagt ist gesagt (ADR 0063) ─────────────────────
  // Der Kommentar gehört zur **Auflösung**, nicht zur nächsten Aufgabe. Bis
  // 2.4.3 wurde er nur beim Antworten neu gesetzt und nie gelöscht — nach
  // «Weiter» stand der Satz zur vorigen Aufgabe weiter über der neuen.
  // Die Blase hängt am Beobachter von #main, und der meldet sich erst im
  // nächsten Zug. Für eine Prüfung wird darum von Hand nachgezogen.
  function blaseDa() { chiliAktualisieren(); return q('#chiliBlase').hidden === false; }
  state = defaultState(); ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  setTab('lernsets');
  uebNext(true);
  pruefe('M1 vor der Antwort schweigt sie', !blaseDa());
  uebPicked = uebQ.word.id;
  if (uebQ.mode === 'tiles') uebQ.mode = 'choice';
  // **Richtig antworten, sonst hält die Nachschrift den Weg zu** (ADR 0090):
  // Seit «Lernsets» tippen läßt, verlangt ein Schreibfehler dort das
  // Nachschreiben — und «Weiter» bleibt gesperrt, bis es sitzt.
  if (uebQ.mode === 'tippen') uebEingabe = uebQ.word.ru;
  uebPruefen();
  pruefe('M2 nach der Antwort sagt sie etwas', blaseDa() && !!kommentar);
  var vorher = kommentar;
  q('#uebNext').click();
  pruefe('M3 nach «Weiter» ist sie still', !blaseDa() && kommentar === '',
    'war «' + vorher + '», ist «' + kommentar + '»');

  // Dasselbe in den anderen Übungen: Wer eine neue Aufgabe baut, löscht den
  // Satz zur alten — das steht in aufgabeBeginnt() und sonst nirgends.
  kommentar = 'Steht noch da.';
  tippenModus = 'alle'; tWord = null; setTab('tippen'); renderTippen();
  pruefe('M4 «Tippen» räumt beim Aufbauen auf', kommentar === '', kommentar);
  kommentar = 'Steht noch da.';
  setTab('uebersetzen'); trTask = null; buildTransTask();
  pruefe('M5 «Übersetzen» auch', kommentar === '', kommentar);
  kommentar = 'Steht noch da.';
  GRAMMATIK.forEach(function (x) { state.gramSeen[x.id] = 0; });
  gramBaustein = GRAMMATIK[0].id; gramQ = null; setTab('grammatik'); renderGrammatik();
  pruefe('M6 «Grammatik» auch', kommentar === '', kommentar);
  // Und die Uhr läuft weiterhin mit — beides gehört zum Beginn einer Aufgabe.
  pruefe('M7 die Uhr wird dabei gestellt', aufgabeSeit > 0, String(aufgabeSeit));

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

writeFileSync(BAU + '/t-kommentare.html', testseite(html, test));
console.log('Kommentar-Testseite geschrieben');
