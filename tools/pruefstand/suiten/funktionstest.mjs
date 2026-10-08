// Baut eine Testkopie von index.html mit injiziertem Klickpfad.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = `
var log = [];
function pruefe(name, cond, extra) { log.push((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' [' + extra + ']' : '')); }
function q(sel) { return document.querySelector(sel); }
function alle(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

try {
  // A · Üben, Multiple Choice mit Bestätigen
  state.settings = { confirmUeben: true, confirmUebersetzen: true, requireComplete: false };
  state.boxes = {};
  setTab('lernsets');
  uebNext(true);
  pruefe('A1 Modus ist Multiple Choice', uebQ.mode !== 'tiles', uebQ.mode);
  alle('[data-opt]')[0].click();
  pruefe('A2 noch nicht bewertet', uebPhase === 'ask', uebPhase);
  pruefe('A3 Auswahl markiert', !!q('.option.picked'));
  pruefe('A4 Bestätigen aktiv', q('#uebConfirm') && !q('#uebConfirm').disabled);
  var vorher = state.answered;
  q('#uebConfirm').click();
  pruefe('A5 nach Bestätigen bewertet', uebPhase === 'feedback', uebPhase);
  pruefe('A6 Zähler erhöht', state.answered === vorher + 1);

  // B · Auswahl wechseln, bevor bestätigt wird
  state.boxes = {};
  uebNext(true);
  var opts = alle('[data-opt]');
  opts[0].click();
  var ersteWahl = uebPicked;
  alle('[data-opt]')[1].click();
  pruefe('B1 Auswahl wechselbar', uebPicked !== ersteWahl && uebPhase === 'ask');

  // C · Einstellung aus: sofortige Wertung
  state.settings.confirmUeben = false;
  uebNext(true);
  alle('[data-opt]')[0].click();
  pruefe('C1 ohne Bestätigen sofort bewertet', uebPhase === 'feedback', uebPhase);
  pruefe('C2 kein Bestätigen-Knopf', !q('#uebConfirm'));
  state.settings.confirmUeben = true;

  // D · Üben, Buchstaben-Kacheln
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = 2; });
  for (var i = 0; i < 40 && (!uebQ || uebQ.mode !== 'tiles'); i++) uebNext(true);
  pruefe('D0 Kachel-Modus erreicht', uebQ.mode === 'tiles', uebQ.mode);
  if (uebQ.mode === 'tiles') {
    var n = uebQ.laenge;
    for (var k = 0; k < n; k++) alle('[data-tile]').filter(function (b) { return !b.disabled; })[0].click();
    pruefe('D1 vollständig, aber nicht bewertet', uebPhase === 'ask' && uebBuilt.length === n, uebPhase + '/' + uebBuilt.length);
    pruefe('D1b mehr Kacheln als Felder', uebQ.tiles.length > uebQ.laenge, uebQ.tiles.length + '>' + uebQ.laenge);
    pruefe('D2 Bestätigen aktiv', !q('#uebConfirm').disabled);
    q('#uebConfirm').click();
    pruefe('D3 bewertet', uebPhase === 'feedback', uebPhase);

    // E · «Erst bei vollständiger Lösung»
    // Die Aufgabenform wird ausgelost — also so lange weiterblättern, bis
    // wieder Kacheln kommen. Vorher hing es am Zufall, ob E1 und E2 überhaupt
    // liefen, und die Zahl der Prüfungen schwankte still von Lauf zu Lauf.
    state.settings.requireComplete = true;
    for (var e = 0; e < 40; e++) { uebNext(true); if (uebQ.mode === 'tiles') break; }
    pruefe('E0 Kachel-Modus wieder erreicht', uebQ.mode === 'tiles', uebQ.mode);
    alle('[data-tile]')[0].click();
    pruefe('E1 unvollständig gesperrt', q('#uebConfirm').disabled);
    var rest = uebQ.laenge - 1;
    for (var m = 0; m < rest; m++) alle('[data-tile]').filter(function (b) { return !b.disabled; })[0].click();
    pruefe('E2 vollständig entsperrt', !q('#uebConfirm').disabled);
    state.settings.requireComplete = false;
  }

  // F · Übersetzen
  setTab('uebersetzen');
  // Gezielt den längsten Satz: die Auswahl lost aus den vordersten vieren, und
  // an einem Zwei-Wort-Satz lässt sich «Teilsatz» nicht prüfen.
  var kandidaten = freieSaetze(trLevel).slice().sort(function (a, b) {
    return tokenize(b.de).length - tokenize(a.de).length;
  });
  trTask = null; buildTransTask(kandidaten[0]); renderUebersetzen();
  var zielZahl = trTask.targetTokens.length;
  for (var w = 0; w < zielZahl; w++) alle('[data-wtile]').filter(function (b) { return !b.disabled; })[0].click();
  pruefe('F1 kein Selbstauslöser bei voller Länge', trPhase === 'ask' && trBuilt.length === zielZahl, trPhase + '/' + trBuilt.length);
  pruefe('F2 gelegte Wörter sind Knöpfe', alle('button.built-word').length === zielZahl);
  var mitte = Math.floor(zielZahl / 2);
  var wortMitte = trWort(trBuilt[mitte]);
  alle('[data-built]')[mitte].click();
  pruefe('F3 mittleres Wort entfernt', trBuilt.length === zielZahl - 1 &&
    trBuilt.map(trWort).indexOf(wortMitte) === -1, wortMitte);
  pruefe('F4 Kachel wieder verfügbar',
    alle('[data-wtile]').filter(function (b) { return b.textContent === wortMitte && !b.disabled; }).length === 1);
  q('#trUndo').click();
  pruefe('F5 Rücktaste entfernt letztes Wort', trBuilt.length === zielZahl - 2);
  pruefe('F6 Bestätigen aktiv bei Teilsatz', !q('#trConfirm').disabled);
  q('#trConfirm').click();
  pruefe('F7 Teilsatz wird als falsch gewertet', trPhase === 'feedback' && trCorrect === false, trPhase + '/' + trCorrect);

  // G · Übersetzen richtig lösen
  buildTransTask(freieSaetze(trLevel)[1]); renderUebersetzen();
  trTask.targetTokens.forEach(function (tok) {
    var treffer = alle('[data-wtile]').filter(function (b) { return b.textContent === tok && !b.disabled; })[0];
    if (treffer) treffer.click();
  });
  q('#trConfirm').click();
  pruefe('G1 richtige Lösung erkannt', trPhase === 'feedback' && trCorrect === true, String(trCorrect));

  // H · Einstellungen: Schalter, Rückweg, Speicherung
  setTab('bilanz');
  q('#menuKnopf').click();
  q('[data-ziel="einstellungen"]').click();
  pruefe('H1 Einstellungen über das Menü erreichbar', currentTab === 'einstellungen' && !!q('[data-set]'));
  q('[data-set="confirmUebersetzen"]').click();
  pruefe('H2 Schalter umgelegt', state.settings.confirmUebersetzen === false);
  pruefe('H3 Schalter zeigt Zustand', q('[data-set="confirmUebersetzen"]').getAttribute('aria-checked') === 'false');
  q('[data-set="confirmUeben"]').click();
  pruefe('H4 dritter Schalter gesperrt, wenn beide aus', q('[data-set="requireComplete"]').disabled);
  q('[data-set="confirmUeben"]').click();
  q('[data-set="confirmUebersetzen"]').click();
  var davorH = ansichtStapel[ansichtStapel.length - 1];
  q('#setBack').click();
  pruefe('H5 Zurück führt in die Ansicht davor', currentTab === davorH,
    currentTab + ' statt ' + davorH);

  // I · Rücksetzen behält Einstellungen
  state.settings.requireComplete = true;
  setTab('sicherung');
  q('#rsAsk').click();
  q('#rsYes').click();
  pruefe('I1 Einstellungen überleben Rücksetzen', state.settings.requireComplete === true && state.answered === 0,
    JSON.stringify(state.settings));

  // J · Persistenz
  setTimeout(function () {
    var roh = localStorage.getItem('russisch_trainer_v1');
    var gespeichert = roh ? JSON.parse(roh) : null;
    pruefe('J1 Einstellungen gespeichert', !!(gespeichert && gespeichert.settings &&
      gespeichert.settings.requireComplete === true), roh ? JSON.stringify(gespeichert.settings) : 'nichts');
    var alt = mergeState({ boxes: { x: 1 }, answered: 7 });
    pruefe('J2 alter Stand ohne settings bekommt Vorgaben',
      alt.settings.confirmUeben === true && alt.answered === 7);

    // K · Kopfbereich
    state.boxes = {};
    ALL_VOCAB.slice(0, 30).forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
    state.streak = 5;
    updateKopf();
    var label = q('#kopfLabel').textContent;
    // Seit ADR 0074 steht dort ein Anteil, keine Absolutzahl — und die Serie
    // sagt, was sie zählt.
    pruefe('K1 Kopf nennt den Anteil in Prozent',
      label.indexOf(Math.round(30 / ALL_VOCAB.length * 100) + ' % gemeistert') === 0, label);
    pruefe('K2 Serie ab 3 sichtbar',
      label.indexOf('5 richtig in Folge') !== -1 && !!q('.kopf-serie'), label);
    // **Ein Anteil darf nicht runden, bis er lügt.**
    pruefe('K2b ein einzelnes Wort ist nicht «0 %»',
      prozentText(1 / 395 * 100, 1, 395) === 'unter 1 %', prozentText(1 / 395 * 100, 1, 395));
    pruefe('K2c und 100 % gehört dem, der wirklich alle hat',
      prozentText(99.9, 394, 395) === '99 %' && prozentText(100, 395, 395) === '100 %',
      prozentText(99.9, 394, 395) + ' / ' + prozentText(100, 395, 395));
    var breite = parseFloat(q('#kopfFill').style.width);
    pruefe('K3 Fortschrittsleiste gefüllt', breite > 0 && breite < 100, q('#kopfFill').style.width);
    state.streak = 2; updateKopf();
    pruefe('K4 Serie unter 3 ausgeblendet',
      q('#kopfLabel').textContent.indexOf('in Folge') === -1 && !q('.kopf-serie'),
      q('#kopfLabel').textContent);

    // L · Statuszeile
    zeigeStatus('ok', 'gespeichert');
    pruefe('L1 Erfolg erscheint mit Haken', q('#saveNote').className === 'ok show' && !!q('#saveNote .icon'));

    // M · Symbole statt Emoji
    pruefe('M1 Menüeinträge tragen SVG', alle('.menueintrag svg').length === 4);
    pruefe('M2 kein Emoji-Zeichen im Dokument', document.body.innerHTML.indexOf('\\u2699') === -1);

    setTimeout(function () {
      pruefe('L2 Erfolg verschwindet von selbst', q('#saveNote').className.indexOf('show') === -1,
        q('#saveNote').className);
      zeigeStatus('err', 'Speichern fehlgeschlagen');
      setTimeout(function () {
        pruefe('L3 Fehler bleibt stehen', q('#saveNote').className === 'err show', q('#saveNote').className);
        pruefe('L4 Fehler ohne Haken', !q('#saveNote .icon'));
        var pre = document.createElement('pre');
        pre.id = 'testlog';
        pre.textContent = log.join('\\n');
        document.body.appendChild(pre);
        document.title = log.filter(function (l) { return l.indexOf('FAIL') === 0; }).length === 0
          ? 'ALLE ' + log.length + ' TESTS BESTANDEN'
          : 'FEHLGESCHLAGEN: ' + log.filter(function (l) { return l.indexOf('FAIL') === 0; }).length;
      }, 2600);
    }, 2600);
  }, 700);
} catch (e) {
  document.title = 'AUSNAHME: ' + e.message;
  var pre2 = document.createElement('pre');
  pre2.id = 'testlog';
  pre2.textContent = log.join('\\n') + '\\nAUSNAHME: ' + e.message + '\\n' + e.stack;
  document.body.appendChild(pre2);
}
`;

writeFileSync(BAU + '/t-funktionstest.html', testseite(html, test));
console.log('Testseite geschrieben');
