// Prüft das Tutorial: Findet jeder Schritt sein Ziel, liegt das Loch darüber,
// zählt «Verstanden» durch, und räumt jeder Ausgang auf?
//
// Der Kern: **Ein Wähler, der ins Leere zeigt, ist ein stiller Fehler.** Das
// Overlay ginge auf, alles wäre dunkel, und nichts leuchtete — der Build kann
// das nicht sehen, nur der echte DOM.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
// Loch **und** Blase gleiten von Ziel zu Ziel. Im kopflosen Browser läuft
// keine Zeit, also stünde bei jeder Messung noch der **alte** Ort da. Für die
// Messung wird das Gleiten abgeschaltet — geprüft wird die Geometrie, nicht
// die Animation. Wer hier eines der beiden vergisst, misst Vergangenheit.
(function () {
  var s = document.createElement('style');
  s.textContent = '#tutLoch, #tutKarte { transition: none !important; }';
  document.head.appendChild(s);
})();
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function knopf(text) {
  return alle('#tutKnoepfe [data-tut]').filter(function (b) {
    return b.textContent === text;
  })[0];
}
// Ein Stand, in dem jede Übung erreichbar ist — sonst fehlten Kacheln.
function reicherStand() {
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = 0; });
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = 2; });
  state.answered = 120;
  state.streak = 3;
  updateKopf();
  setTab('home');
}

try {
  // ── 0 · Der allererste Start ──────────────────────────────
  // Die Testseite lädt mit leerem Speicher — genau der Fall, in dem die App
  // von selbst fragt. Das ist kein Störgeräusch, sondern die Funktion: erst
  // hier belegt, dann weggeräumt, damit der Rest von einem ruhigen Schirm
  // ausgeht.
  pruefe('00 beim allerersten Start fragt die App von selbst',
    tutOffen === true && q('#tutHof').hidden === false, String(tutOffen));
  pruefe('01 und zwar mit der Frage', q('#tutText').textContent.indexOf('Ich zeige dir') === 0,
    q('#tutText').textContent.slice(0, 40));
  tutEnde();

  // ── A · Die Schritte selbst ───────────────────────────────
  reicherStand();
  pruefe('A1 zwölf Schritte', TUTORIAL.length === 12, String(TUTORIAL.length));
  pruefe('A2 jeder hat Ort, Ziel und Text',
    TUTORIAL.every(function (s) { return s.length === 3; }));
  pruefe('A3 jeder Text ist kurz genug fürs Overlay',
    TUTORIAL.every(function (s) { return s[2].length <= 230; }),
    String(Math.max.apply(null, TUTORIAL.map(function (s) { return s[2].length; }))));
  pruefe('A4 und keiner ist eine Überschrift',
    TUTORIAL.every(function (s) { return s[2].length >= 40; }),
    String(Math.min.apply(null, TUTORIAL.map(function (s) { return s[2].length; }))));
  pruefe('A5 kein Ziel kommt zweimal vor', (function () {
    var z = {};
    TUTORIAL.forEach(function (s) { z[s[1]] = 1; });
    return Object.keys(z).length === TUTORIAL.length;
  })());
  pruefe('A6 die App duzt auch hier', TUTORIAL.every(function (s) {
    return !/\bSie\b|\bIhnen\b|\bIhre\b/.test(s[2]);
  }));

  // ── B · Der Knopf auf Home ────────────────────────────────
  pruefe('B1 der Knopf steht ganz unten', !!q('#tutKnopf'));
  pruefe('B2 und zwar nach den Kacheln', (function () {
    var kacheln = alle('#main .kachel');
    var letzte = kacheln[kacheln.length - 1];
    return !!letzte &&
      (letzte.compareDocumentPosition(q('#tutKnopf')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  })());
  pruefe('B3 vor dem Start ist nichts offen',
    q('#tutHof').hidden && q('#tutKarte').getAttribute('aria-hidden') === 'true');

  // ── C · Erst die Frage, dann der Scheinwerfer ─────────────
  q('#tutKnopf').click();
  pruefe('C1 das Overlay ist offen', tutOffen && !q('#tutHof').hidden);
  pruefe('C2 und fragt zuerst', q('#tutText').textContent.indexOf('Ich zeige dir') === 0,
    q('#tutText').textContent.slice(0, 40));
  pruefe('C3 mit «Abbrechen» und «Loslegen»', !!knopf('Abbrechen') && !!knopf('Loslegen'));
  pruefe('C4 noch leuchtet nichts', q('#tutHof').classList.contains('ohne-ziel'));

  // Abbrechen räumt auf.
  knopf('Abbrechen').click();
  pruefe('C5 Abbrechen schließt', !tutOffen && q('#tutHof').hidden &&
    q('#tutKarte').getAttribute('aria-hidden') === 'true');
  pruefe('C6 und merkt sich das', state.tutorialGesehen === true);
  pruefe('C7 der Körper ist wieder frei', !document.body.classList.contains('tut-offen'));

  // ── D · Jeder Schritt findet sein Ziel ────────────────────
  // Der eigentliche Zweck dieser Suite.
  reicherStand();
  q('#tutKnopf').click();
  knopf('Loslegen').click();
  var fehlt = [];
  var ohneLoch = [];
  var ohneZipfel = [];
  for (var i = 0; i < TUTORIAL.length; i++) {
    var sch = TUTORIAL[i];
    pruefe('D' + (i + 1) + ' Schritt ' + (i + 1) + ' · ' + sch[2].slice(0, 28),
      tutSchritt === i && q('#tutText').textContent === sch[2],
      tutSchritt + '/' + q('#tutText').textContent.slice(0, 28));
    if (currentTab !== sch[0]) fehlt.push(sch[2] + ': Ort ' + currentTab + ' statt ' + sch[0]);
    var ziel = q(sch[1]);
    if (!ziel) fehlt.push(sch[2] + ': «' + sch[1] + '» gibt es nicht');
    else {
      var l = q('#tutLoch').getBoundingClientRect();
      var z = ziel.getBoundingClientRect();
      // Das Loch muss das Ziel wirklich decken, nicht bloß irgendwo liegen.
      if (!(l.width >= z.width && l.height >= z.height &&
            l.left <= z.left + 1 && l.top <= z.top + 1)) {
        ohneLoch.push(sch[2] + ' [' + Math.round(l.left) + ',' + Math.round(l.top) +
          ' ' + Math.round(l.width) + 'x' + Math.round(l.height) + ' gegen ' +
          Math.round(z.left) + ',' + Math.round(z.top) + ' ' +
          Math.round(z.width) + 'x' + Math.round(z.height) + ']');
      }
      // Der Zipfel zeigt zum Ziel — und darf nie ins Nichts zeigen. Er sitzt
      // entweder oben (Blase unter dem Ziel) oder unten (Blase darüber).
      var kl = q('#tutKarte').classList;
      var zi = q('#tutZipfel').getBoundingClientRect();
      var k = q('#tutKarte').getBoundingClientRect();
      if (!kl.contains('ohne-zipfel')) {
        var richtung = kl.contains('zipfel-oben') ? (k.top >= z.bottom - 20)
          : kl.contains('zipfel-unten') ? (k.bottom <= z.top + 20) : false;
        var waagerecht = zi.left >= k.left - 1 && zi.right <= k.right + 1;
        if (!richtung || !waagerecht) {
          ohneZipfel.push(sch[2] + ' [' + (kl.contains('zipfel-oben') ? 'oben' : 'unten') +
            ' Karte ' + Math.round(k.top) + '–' + Math.round(k.bottom) +
            ' Ziel ' + Math.round(z.top) + '–' + Math.round(z.bottom) + ']');
        }
      }
    }
    if (i < TUTORIAL.length - 1) q('#tutVor').click();
  }
  pruefe('E1 jedes Ziel gibt es wirklich', fehlt.length === 0, fehlt.join(' | '));
  pruefe('E2 und das Loch liegt darüber', ohneLoch.length === 0, ohneLoch.join(' | '));
  pruefe('E2b der Zipfel zeigt zum Ziel', ohneZipfel.length === 0, ohneZipfel.join(' | '));
  pruefe('E3 der letzte Schritt schließt ab',
    q('#tutVor').getAttribute('aria-label') === 'Fertig',
    q('#tutVor').getAttribute('aria-label'));
  pruefe('E3b während der Schritte gibt es keine beschrifteten Knöpfe',
    q('#tutKnoepfe').hidden && alle('#tutKnoepfe [data-tut]').length === 0);
  pruefe('E4 der Zähler stimmt — für das Ohr',
    q('#tutZaehler').textContent === 'Schritt 12 von 12', q('#tutZaehler').textContent);

  // ── E5 · Die Punktreihe ───────────────────────────────────
  // Sie ersetzt die Zeile «Schritt 3 von 12». Ein Zeichen je Schritt, genau
  // eines markiert, alles davor abgehakt — sonst zeigt sie nicht, wo man ist.
  var p = alle('#tutPunkte i');
  pruefe('E5 ein Punkt je Schritt', p.length === TUTORIAL.length, String(p.length));
  pruefe('E6 genau einer ist der jetzige',
    alle('#tutPunkte i.hier').length === 1 &&
    p[p.length - 1].classList.contains('hier'));
  pruefe('E7 alle davor sind abgehakt',
    alle('#tutPunkte i.war').length === TUTORIAL.length - 1,
    String(alle('#tutPunkte i.war').length));
  pruefe('E8 der Ausgang steht bereit', !q('#tutZu').hidden);

  // ── E9 · Die Chili erzählt ────────────────────────────────
  // Sie gibt es **einmal**. Im Tutorial steht sie in der Blase — und bleibt
  // dort, auch wenn der Filter-Schritt die Ansicht darunter wechselt.
  pruefe('E9 es gibt weiterhin genau eine Figur',
    alle('#chiliFigur').length === 1 && alle('#chiliBuehne').length === 1);
  pruefe('E10 und sie steht in der Blase',
    q('#tutChili').contains(q('#chiliFigur')));

  // ── F · Der Ausgang führt zurück nach Home ────────────────
  q('#tutVor').click();
  pruefe('F1 fertig schließt', !tutOffen && q('#tutHof').hidden);
  pruefe('F2 und steht wieder auf Home', currentTab === 'home', currentTab);
  pruefe('F3 die Übersicht ist da', !!q('#tutKnopf'));
  // Bleibt sie in der zugeklappten Blase stehen, ist sie weg — die Ansicht
  // hätte dann gar keine Figur mehr.
  pruefe('F4 die Chili ist zurück in der Ansicht',
    !q('#tutChili').contains(q('#chiliFigur')) &&
    document.body.contains(q('#chiliFigur')));

  // ── G · Der Schritt in einer Übung ────────────────────────
  // Einer der zwölf führt woandershin. Danach muss der Weg zurückführen.
  var fremd = TUTORIAL.filter(function (s) { return s[0] !== 'home'; });
  pruefe('G1 genau ein Schritt liegt außerhalb von Home', fremd.length === 1,
    String(fremd.length));
  pruefe('G2 und zeigt auf die Auswahl', fremd[0][1] === '#filterKnopf', fremd[0][1]);

  // ── H · Beim ersten Start wird gefragt ────────────────────
  // Nachgestellt: frischer Stand, nichts beantwortet.
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  pruefe('H1 ein frischer Stand hat es nicht gesehen', state.tutorialGesehen === false);
  pruefe('H2 die Bedingung greift',
    !state.tutorialGesehen && state.answered === 0 && currentTab === 'home');
  tutStarten();
  pruefe('H3 die Frage steht da', tutOffen && q('#tutText').textContent.indexOf('Ich zeige dir') === 0);
  knopf('Abbrechen').click();
  pruefe('H4 danach greift die Bedingung nicht mehr', state.tutorialGesehen === true);

  // ── I · Der Merker überlebt Speichern und Laden ───────────
  var kopie = mergeState(JSON.parse(JSON.stringify(state)));
  pruefe('I1 der Merker übersteht das Verschmelzen', kopie.tutorialGesehen === true);
  pruefe('I2 ein alter Stand ohne Merker fängt bei false an',
    mergeState({ boxes: {} }).tutorialGesehen === false);
  pruefe('I3 Fortschritt zurücksetzen fragt wieder',
    defaultState().tutorialGesehen === false);

  // ── J · Ohne Ziel bleibt der Schirm dunkel ────────────────
  // Die Eingangsfrage leuchtet nichts an. Dann muss der **Hof** decken: Ein
  // Loch außerhalb des Bildes deckt nichts, sein Schatten reicht nur 9999 px
  // und endet genau am Bildrand. Genau dieser Fehler war da — die Frage stand
  // auf einer taghellen Übersicht.
  reicherStand();
  tutStarten();
  pruefe('J1 der Schritt hat kein Ziel', q('#tutHof').classList.contains('ohne-ziel'));
  var hofFarbe = getComputedStyle(q('#tutHof')).backgroundColor;
  pruefe('J2 dann deckt der Hof selbst ab',
    hofFarbe !== 'transparent' && hofFarbe !== 'rgba(0, 0, 0, 0)', hofFarbe);
  pruefe('J3 und das Loch ist weg',
    getComputedStyle(q('#tutLoch')).display === 'none');
  // Mit Ziel dagegen ist der Hof durchsichtig — sonst läge der Deckel doppelt
  // und der Scheinwerfer wäre dunkler als der Rest.
  tutWeiter();
  var mitFarbe = getComputedStyle(q('#tutHof')).backgroundColor;
  pruefe('J4 mit Ziel deckt allein das Loch',
    !q('#tutHof').classList.contains('ohne-ziel') &&
    (mitFarbe === 'transparent' || mitFarbe === 'rgba(0, 0, 0, 0)'), mitFarbe);
  tutEnde();
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

writeFileSync(BAU + '/t-tutorial.html', testseite(html, test));
console.log('Tutorial-Testseite geschrieben');
