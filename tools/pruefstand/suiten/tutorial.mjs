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
// Das Loch gleitet von Ziel zu Ziel, und die Blase klappt jedes Mal auf. Im
// kopflosen Browser läuft keine Zeit — bei jeder Messung stünde also noch der
// **alte** Zustand da. Für die Messung wird beides abgeschaltet; geprüft wird
// die Geometrie, nicht die Animation. Wer eines davon vergisst, misst
// Vergangenheit — genau daran ist die Zipfelprüfung schon einmal gescheitert.
(function () {
  var s = document.createElement('style');
  s.textContent = '#tutLoch, #tutGespann { transition: none !important; }' +
    '#tutSprech.klappt { animation: none !important; }';
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
  pruefe('A1 dreizehn Schritte', TUTORIALS.home.length === 13, String(TUTORIALS.home.length));
  pruefe('A2 jeder hat Ort, Ziel und Text',
    TUTORIALS.home.every(function (s) { return s.length === 3; }));
  pruefe('A3 jeder Text ist kurz genug fürs Overlay',
    TUTORIALS.home.every(function (s) { return s[2].length <= 230; }),
    String(Math.max.apply(null, TUTORIALS.home.map(function (s) { return s[2].length; }))));
  pruefe('A4 und keiner ist eine Überschrift',
    TUTORIALS.home.every(function (s) { return s[2].length >= 40; }),
    String(Math.min.apply(null, TUTORIALS.home.map(function (s) { return s[2].length; }))));
  pruefe('A5 kein Ziel kommt zweimal vor', (function () {
    var z = {};
    TUTORIALS.home.forEach(function (s) { z[s[1]] = 1; });
    return Object.keys(z).length === TUTORIALS.home.length;
  })());
  pruefe('A6 die App duzt auch hier', TUTORIALS.home.every(function (s) {
    return !/\bSie\b|\bIhnen\b|\bIhre\b/.test(s[2]);
  }));

  // ── B · Der Knopf auf Home wechselt die Gestalt (ADR 0080) ─
  // Wer die App noch nicht kennt, bekommt das goldene Angebot im Inhalt; wer
  // sie kennt, findet ein kleines Fragezeichen im Kopf. **Nie beides.**
  function sichtbar(w) {
    var el = q(w);
    return !!el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
  }
  pruefe('B1 es gibt das Angebot genau einmal', alle('#tutKnopf').length === 1,
    String(alle('#tutKnopf').length));
  pruefe('B2 ungespielt steht es ganz oben im Inhalt',
    q('#main section').firstElementChild === q('#tutKnopf'),
    q('#main section').firstElementChild.className);
  pruefe('B2b und ist als Angebot ausgezeichnet', q('#tutKnopf').classList.contains('oben'));
  pruefe('B2b2 der runde Knopf im Kopf bleibt dann weg', !sichtbar('#tutRund'));
  // Nur **fertig** tauscht die Gestalt. Dass die App einmal gefragt hat,
  // reicht nicht: Wer abbricht, hat das Tutorial nicht gesehen.
  state.tutorialGesehen = true;
  renderHome();
  renderKopf();
  pruefe('B2c gefragt allein ändert nichts',
    q('#main section').firstElementChild === q('#tutKnopf') && !sichtbar('#tutRund'));
  state.tutorialFertig = true;
  renderHome();
  renderKopf();
  pruefe('B2d durchgespielt wandert er als Fragezeichen in den Kopf',
    sichtbar('#tutRund') && !!q('#tutRund svg'));
  pruefe('B2e und der goldene Riegel ist verschwunden', alle('#tutKnopf').length === 0,
    String(alle('#tutKnopf').length));
  // **Auch in den Übungen** — das war der zweite Teil des Befunds.
  setTab('lernsets');
  pruefe('B2f in einer Übung mit eigener Spur steht er auch', sichtbar('#tutRund'));
  setTab('buchstaben');
  pruefe('B2g in einer ohne Spur nicht', !sichtbar('#tutRund'));
  setTab('home');
  q('#tutRund').click();
  pruefe('B2h und er startet die Spur der Ansicht',
    tutOffen && tutSpur === 'home', tutSpur);
  tutEnde();
  state.tutorialGesehen = false;
  state.tutorialFertig = false;
  setTab('home');
  renderHome();
  renderKopf();
  pruefe('B3 vor dem Start ist nichts offen',
    q('#tutHof').hidden && q('#tutGespann').getAttribute('aria-hidden') === 'true');

  // ── B9 · Der Scheinwerfer atmet (ADR 0083, löst 0081 ab) ──
  // Nicht mehr ein Ring, der aufblitzt, sondern eine Fläche, die langsam ein
  // und aus atmet — und zwar innerhalb des Ziels. Der Ring lag in derselben
  // box-shadow-Liste wie die Verdunklung; zwei Einträge gegen einen lassen
  // sich nicht interpolieren, also fiel die Verdunklung für einen Augenblick
  // ganz weg und der ganze Bildschirm blitzte auf.
  pruefe('B9 der Atem sitzt im Kind, nicht im Loch', (function () {
    var st = getComputedStyle(q('#tutLoch'), '::after');
    return st.animationName === 'tutAtem' &&
      st.animationIterationCount === 'infinite' &&
      parseFloat(st.animationDuration) > 4;
  })(), getComputedStyle(q('#tutLoch'), '::after').animationName + ' / ' +
    getComputedStyle(q('#tutLoch'), '::after').animationDuration);
  // Läge die Deckung auf dem Loch selbst, blendete sie den Schatten mit aus —
  // dasselbe Blitzen, nur mit anderer Ursache.
  pruefe('B9b das Loch selbst wird nicht angefaßt',
    getComputedStyle(q('#tutLoch')).animationName === 'none',
    getComputedStyle(q('#tutLoch')).animationName);
  // Ein einziger Schatten, und der bleibt: Sobald zwei darin stünden, wäre
  // die Liste wieder nicht interpolierbar.
  pruefe('B9c und trägt genau einen Schatten, den großen', (function () {
    var s = getComputedStyle(q('#tutLoch')).boxShadow;
    return s.indexOf('9999px') !== -1 && s.split('rgb').length === 2;
  })(), getComputedStyle(q('#tutLoch')).boxShadow.slice(0, 60));

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
    q('#tutGespann').getAttribute('aria-hidden') === 'true');
  pruefe('C6 und merkt sich, dass gefragt wurde', state.tutorialGesehen === true);
  pruefe('C6b aber nicht, dass es gelaufen wäre', state.tutorialFertig === false);
  pruefe('C6c das Angebot bleibt oben stehen',
    q('#main section').firstElementChild === q('#tutKnopf') &&
    q('#tutKnopf').classList.contains('oben'),
    q('#main section').firstElementChild.className);
  pruefe('C7 der Körper ist wieder frei', !document.body.classList.contains('tut-offen'));

  // Und mitten drin abgebrochen genauso: Drei Schritte weit gekommen ist nicht
  // durchgespielt.
  q('#tutKnopf').click();
  knopf('Loslegen').click();
  q('#tutVor').click();
  q('#tutVor').click();
  pruefe('C8 mitten im Tutorial', tutSchritt === 2, String(tutSchritt));
  q('#tutZu').click();
  pruefe('C8b ein Abbruch mitten drin zählt nicht', state.tutorialFertig === false);
  pruefe('C8c das Angebot steht weiter oben',
    q('#main section').firstElementChild === q('#tutKnopf'),
    q('#main section').firstElementChild.className);

  // ── D · Jeder Schritt findet sein Ziel ────────────────────
  // Der eigentliche Zweck dieser Suite.
  reicherStand();
  q('#tutKnopf').click();
  knopf('Loslegen').click();
  var fehlt = [];
  var ohneLoch = [];
  var ohneZipfel = [];
  var verdeckt = [];
  for (var i = 0; i < TUTORIALS.home.length; i++) {
    var sch = TUTORIALS.home[i];
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
      // **Das Gespann darf den Scheinwerfer nie verdecken.** Eine Erklärung,
      // die auf dem liegt, wovon sie spricht, ist keine.
      var g = q('#tutGespann').getBoundingClientRect();
      if (g.left < l.right - 1 && g.right > l.left + 1 &&
          g.top < l.bottom - 1 && g.bottom > l.top + 1) {
        verdeckt.push(sch[2].slice(0, 24) + ' [Gespann ' + Math.round(g.top) + '–' +
          Math.round(g.bottom) + ' auf Loch ' + Math.round(l.top) + '–' +
          Math.round(l.bottom) + ']');
      }
      // Der Zipfel zeigt auf die **Chili** — sie spricht, nicht die Blase.
      var oben = q('#tutGespann').classList.contains('chili-oben');
      var zi = q('#tutZipfel').getBoundingClientRect();
      var ch = q('#tutChili').getBoundingClientRect();
      var zeigt = oben ? (zi.top <= ch.bottom + 2) : (zi.bottom >= ch.top - 2);
      var waagerecht = zi.left >= ch.left - 24 && zi.right <= ch.right + 24;
      if (!zeigt || !waagerecht) {
        ohneZipfel.push(sch[2].slice(0, 24) + ' [' + (oben ? 'Chili oben' : 'Chili unten') +
          ' Zipfel ' + Math.round(zi.top) + '/' + Math.round(zi.left) +
          ' Chili ' + Math.round(ch.top) + '/' + Math.round(ch.left) + ']');
      }
      // Und sie steht **neben** dem Angeleuchteten, nicht irgendwo: senkrecht
      // dicht daran, waagerecht unter seiner Mitte. Genau das ging beim
      // Trichter schief — er leuchtete rechts oben, sie stand links.
      var abstand = oben ? (ch.top - l.bottom) : (l.top - ch.bottom);
      if (abstand < -2 || abstand > 40) {
        ohneZipfel.push(sch[2].slice(0, 24) + ': senkrecht ' + Math.round(abstand) + ' px daneben');
      }
      // Waagerecht darf sie nur abweichen, wo der Bildrand sie hält.
      var chMitte = ch.left + ch.width / 2;
      var lMitte = l.left + l.width / 2;
      var amRand = chMitte < ch.width || chMitte > window.innerWidth - ch.width;
      if (Math.abs(chMitte - lMitte) > l.width / 2 + 8 && !amRand) {
        ohneZipfel.push(sch[2].slice(0, 24) + ': waagerecht bei ' + Math.round(chMitte) +
          ' statt ' + Math.round(lMitte));
      }
    }
    if (i < TUTORIALS.home.length - 1) q('#tutVor').click();
  }
  pruefe('E1 jedes Ziel gibt es wirklich', fehlt.length === 0, fehlt.join(' | '));
  pruefe('E2 und das Loch liegt darüber', ohneLoch.length === 0, ohneLoch.join(' | '));
  pruefe('E2b das Gespann verdeckt den Scheinwerfer nie',
    verdeckt.length === 0, verdeckt.join(' | '));
  pruefe('E2c der Zipfel zeigt auf die Chili', ohneZipfel.length === 0, ohneZipfel.join(' | '));
  pruefe('E3 der letzte Schritt schließt ab',
    q('#tutVor').getAttribute('aria-label') === 'Fertig',
    q('#tutVor').getAttribute('aria-label'));
  pruefe('E3b während der Schritte gibt es keine beschrifteten Knöpfe',
    q('#tutKnoepfe').hidden && alle('#tutKnoepfe [data-tut]').length === 0);
  pruefe('E4 der Zähler stimmt — für das Ohr',
    q('#tutZaehler').textContent === 'Schritt 13 von 13', q('#tutZaehler').textContent);

  // ── E5 · Die Punktreihe ───────────────────────────────────
  // Sie ersetzt die Zeile «Schritt 3 von 12». Ein Zeichen je Schritt, genau
  // eines markiert, alles davor abgehakt — sonst zeigt sie nicht, wo man ist.
  var p = alle('#tutPunkte i');
  pruefe('E5 ein Punkt je Schritt', p.length === TUTORIALS.home.length, String(p.length));
  pruefe('E6 genau einer ist der jetzige',
    alle('#tutPunkte i.hier').length === 1 &&
    p[p.length - 1].classList.contains('hier'));
  pruefe('E7 alle davor sind abgehakt',
    alle('#tutPunkte i.war').length === TUTORIALS.home.length - 1,
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
  // Durchgelaufen heißt: Der goldene Riegel ist weg, das Fragezeichen im Kopf
  // ist da (ADR 0080). Genau dieser Übergang war der Zweck des Umbaus.
  pruefe('F3 die Übersicht ist da und trägt jetzt das Fragezeichen',
    !!q('#main .kachelfeld') && !q('#tutKnopf') &&
    q('#tutRund').hidden === false,
    (q('#tutKnopf') ? 'Riegel noch da' : 'Riegel weg') + ' / ' +
    (q('#tutRund').hidden ? 'kein Knopf' : 'Knopf da'));
  // Bleibt sie in der zugeklappten Blase stehen, ist sie weg — die Ansicht
  // hätte dann gar keine Figur mehr.
  pruefe('F4 die Chili ist zurück in der Ansicht',
    !q('#tutChili').contains(q('#chiliFigur')) &&
    document.body.contains(q('#chiliFigur')));

  // ── G · Der Schritt in einer Übung ────────────────────────
  // Einer der zwölf führt woandershin. Danach muss der Weg zurückführen.
  var fremd = TUTORIALS.home.filter(function (s) { return s[0] !== 'home'; });
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
  pruefe('H5 und der Knopf steht trotzdem noch oben', state.tutorialFertig === false);

  // ── I · Der Merker überlebt Speichern und Laden ───────────
  var kopie = mergeState(JSON.parse(JSON.stringify(state)));
  pruefe('I1 der Merker übersteht das Verschmelzen', kopie.tutorialGesehen === true);
  pruefe('I2 ein alter Stand ohne Merker fängt bei false an',
    mergeState({ boxes: {} }).tutorialGesehen === false &&
    mergeState({ boxes: {} }).tutorialFertig === false);
  pruefe('I3 Fortschritt zurücksetzen fragt wieder',
    defaultState().tutorialGesehen === false && defaultState().tutorialFertig === false);
  pruefe('I4 beide Merker überstehen das Verschmelzen einzeln',
    mergeState({ tutorialGesehen: true }).tutorialFertig === false &&
    mergeState({ tutorialFertig: true }).tutorialFertig === true);

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

  // ── Z · Das Loch liegt auf dem Ziel (ADR 0067) ───────────
  // Jeder Streifen unverdunkelten Grundes neben dem Angeleuchteten ist ein
  // leuchtender Rahmen — und der zieht den Blick stärker an als das, was er
  // zeigen soll. Erst waren es 22 px, dann 4; jetzt sind es keine.
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  tutStarten(false);
  for (var zs = 0; zs < TUTORIALS.home.length; zs++) {
    if (TUTORIALS.home[zs][1].indexOf('lernsets') !== -1) tutSchritt = zs;
  }
  tutZeichnen();
  var ziel = q(TUTORIALS.home[tutSchritt][1]);
  var loch = q('#tutLoch');
  var zr = ziel.getBoundingClientRect();
  var lr = loch.getBoundingClientRect();
  pruefe('Z1 das Loch liegt genau auf dem Ziel',
    Math.abs(lr.top - zr.top) < 1 && Math.abs(lr.left - zr.left) < 1 &&
    Math.abs(lr.width - zr.width) < 1 && Math.abs(lr.height - zr.height) < 1,
    [lr.top - zr.top, lr.left - zr.left, lr.width - zr.width, lr.height - zr.height]
      .map(function (n) { return n.toFixed(1); }).join(' / '));
  // Der Radius wird gemessen, nicht gesetzt: Eine Kachel hat 18 px.
  pruefe('Z2 und trägt den Radius des Ziels',
    getComputedStyle(loch).borderRadius === getComputedStyle(ziel).borderRadius,
    getComputedStyle(loch).borderRadius + ' / ' + getComputedStyle(ziel).borderRadius);
  // Und der Atem endet an derselben Kante — er erbt den gemessenen Radius,
  // statt einen eigenen zu behaupten. Sonst leuchtete es über die Ecken hinaus.
  pruefe('Z2b der Atem endet an der Kante des Ziels', (function () {
    var a = getComputedStyle(loch, '::after');
    var lr2 = loch.getBoundingClientRect();
    return a.borderRadius === getComputedStyle(ziel).borderRadius &&
      Math.abs(parseFloat(a.width) - lr2.width) < 1 &&
      Math.abs(parseFloat(a.height) - lr2.height) < 1;
  })(), getComputedStyle(loch, '::after').borderRadius + ' / ' +
    getComputedStyle(loch, '::after').width);
  // Ein runder Knopf bleibt rund — ein fester Wert schnitte ihm die Ecken auf.
  for (var zk = 0; zk < TUTORIALS.home.length; zk++) {
    if (TUTORIALS.home[zk][1] === '#menuKnopf') tutSchritt = zk;
  }
  tutZeichnen();
  pruefe('Z3 ein runder Knopf bleibt rund',
    getComputedStyle(q('#tutLoch')).borderRadius ===
    getComputedStyle(q('#menuKnopf')).borderRadius,
    getComputedStyle(q('#tutLoch')).borderRadius);
  // **Kein weicher Innenrand mehr** — was es nicht gibt, kann nicht blass
  // stehenbleiben (die Warnung aus ADR 0051 ist damit erledigt).
  pruefe('Z4 der Schatten deckt nur nach außen',
    getComputedStyle(q('#tutLoch')).boxShadow.indexOf('inset') === -1,
    getComputedStyle(q('#tutLoch')).boxShadow);
  tutEnde();
  ansichtenZuruecksetzen();

  // ── J · Die Übungsspuren (ADR 0079) ───────────────────────
  // Dieselbe Frage wie in Abschnitt D, nur für die drei eigenen Spuren: Findet
  // jeder Schritt sein Ziel? Ein Wähler, der ins Leere zeigt, ist ein stiller
  // Fehler — er verdunkelt den Schirm und leuchtet nichts an.
  function stand(spur) {
    state = defaultState();
    ansichtenZuruecksetzen();
    state.tutorialGesehen = true;
    state.tutorialFertig = true;
    if (spur === 'tippen') {
      ALL_VOCAB.forEach(function (v) {
        state.boxes[v.id] = state.settings.tippenStufe;
        state.lastSeen[v.id] = Date.now();
      });
    } else if (spur === 'uebersetzen') {
      ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
      trLevel = 1; trDir = 'gemischt'; trModus = 'lernen'; trTask = null;
    }
    setTab(spur);
  }

  ['lernsets', 'tippen', 'uebersetzen'].forEach(function (spur) {
    stand(spur);
    tutEnde();
    tutStarten(spur);
    pruefe('J-' + spur + '-1 die Frage steht davor',
      tutOffen && tutSpur === spur && tutSchritt === -1 &&
      q('#tutText').textContent === TUT_FRAGE[spur],
      q('#tutText').textContent.slice(0, 40));
    pruefe('J-' + spur + '-2 sie nennt die Übung, nicht die App',
      q('#tutText').textContent.indexOf('diese App funktioniert') === -1);
    knopf('Loslegen').click();
    var schritte = TUTORIALS[spur];
    var kaputt = [];
    for (var i = 0; i < schritte.length; i++) {
      var sch = schritte[i];
      if (currentTab !== spur) kaputt.push(sch[1] + ': Ort ' + currentTab);
      var ziel = q(sch[1]);
      if (!ziel || !ziel.getClientRects().length) {
        kaputt.push(sch[1] + ': gibt es nicht');
      } else {
        var l = q('#tutLoch').getBoundingClientRect();
        var z = ziel.getBoundingClientRect();
        if (!(l.width >= z.width - 1 && l.height >= z.height - 1 &&
              l.left <= z.left + 1 && l.top <= z.top + 1)) {
          kaputt.push(sch[1] + ': Loch deckt es nicht');
        }
      }
      if (i < schritte.length - 1) q('#tutVor').click();
    }
    pruefe('J-' + spur + '-3 jeder Schritt findet sein Ziel', kaputt.length === 0,
      kaputt.join(' | '));
    pruefe('J-' + spur + '-4 der Zähler nennt die Länge der Spur',
      q('#tutZaehler').textContent === 'Schritt ' + schritte.length + ' von ' + schritte.length,
      q('#tutZaehler').textContent);
    q('#tutVor').click();
    pruefe('J-' + spur + '-5 am Ende ist es zu und man steht in der Übung',
      !tutOffen && currentTab === spur, currentTab);
    // **Die Heimspur bleibt unberührt**: Wer «Tippen» erklärt bekommt, hat
    // damit nicht das große Tutorial durchlaufen.
    pruefe('J-' + spur + '-6 der Merker gilt nur für diese Spur',
      state.tutUebung[spur] === 1 &&
      ['lernsets', 'tippen', 'uebersetzen'].filter(function (a) {
        return a !== spur && state.tutUebung[a];
      }).length === 0,
      JSON.stringify(state.tutUebung));
  });

  // ── K · Angeboten wird einmal, und nur mit Bühne ───────────
  stand('lernsets');
  tutEnde();
  state.tutUebung = {};
  setTab('home');
  setTab('lernsets');
  pruefe('K1 beim ersten Betreten wird gefragt',
    tutOffen && tutSpur === 'lernsets' && tutSchritt === -1);
  tutEnde();
  setTab('home');
  setTab('lernsets');
  pruefe('K2 beim zweiten Mal nicht mehr', !tutOffen, String(tutSpur));
  // **Ein Scheinwerfer ohne Bühne wartet.** In «Tippen» steht vor der ersten
  // Freischaltung ein Leerzustand — dort gäbe es nichts anzuleuchten.
  state = defaultState();
  ansichtenZuruecksetzen();
  state.tutorialGesehen = true;
  setTab('home');
  setTab('tippen');
  pruefe('K3 im Leerzustand wird nicht gefragt',
    !tutOffen && !state.tutUebung.tippen,
    (q(TUTORIALS.tippen[0][1]) ? 'Ziel da' : 'kein Ziel') + ' / ' + String(tutOffen));
  // Und vor dem großen Tutorial auch nicht: zwei Angebote übereinander sind
  // eines zu viel.
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  setTab('lernsets');
  pruefe('K4 vor dem großen Tutorial schweigt sie',
    !tutOffen && !state.tutUebung.lernsets);

  // ── L · Der Weg zurück zur Spur (ADR 0080) ─────────────────
  // Er liegt im Kopf, nicht im Trichter: eine Sache, ein Ort.
  stand('lernsets');
  tutEnde();
  state.tutorialFertig = true;
  renderKopf();
  pruefe('L1 im Kopf steht der runde Knopf',
    q('#tutRund').hidden === false && !!q('#tutRund svg'));
  q('#tutRund').click();
  pruefe('L2 ein Tipp startet die Spur dieser Übung',
    tutOffen && tutSpur === 'lernsets', tutSpur);
  tutEnde();
  // In einer Übung ohne eigene Spur gibt es ihn nicht.
  setTab('buchstaben');
  pruefe('L3 ohne eigene Spur ist er weg', q('#tutRund').hidden === true);
  // Und im Trichter steht seit ADR 0080 nichts mehr dazu.
  pruefe('L4 der Trichter trägt keine Hilfezeile mehr', !q('[data-fw="tutspur"]'));

  // ── M · Zwei Plätze für eine Leiste (ADR 0082) ────────────
  // In einer Übung steht sie rechts **über der Aufgabenkachel**, mit Abstand
  // dazu, und ihre Knöpfe sind kleiner. Überall sonst hängt sie in der
  // Kopfzeile und gibt sie in alter Größe dorthin weiter.
  stand('uebersetzen');
  tutEnde();
  state.tutorialFertig = true;
  renderKopf();
  var leiste = q('#uebLeiste');
  var karte = q('#main .card');
  pruefe('M1 in der Übung steht sie im Inhalt, bei der Kachel',
    !!leiste && q('#main').contains(leiste) &&
    leiste.classList.contains('bei-kachel'),
    leiste ? leiste.className : 'keine');
  pruefe('M1b und der Knopf ist sichtbar', q('#tutRund').hidden === false);
  pruefe('M2 sie sitzt rechts',
    Math.abs(q('#tutRund').getBoundingClientRect().right -
      karte.getBoundingClientRect().right) < 20,
    q('#tutRund').getBoundingClientRect().right.toFixed(0) + ' / ' +
    karte.getBoundingClientRect().right.toFixed(0));
  pruefe('M2b über der Kachel, mit etwas Abstand', (function () {
    var luft = karte.getBoundingClientRect().top -
      q('#tutRund').getBoundingClientRect().bottom;
    return luft >= 4 && luft <= 24;
  })(), (karte.getBoundingClientRect().top -
    q('#tutRund').getBoundingClientRect().bottom).toFixed(0) + ' px');

  // Dort ist der Kreis kleiner, die Fläche bleibt bei 44.
  var r = q('#tutRund').getBoundingClientRect();
  pruefe('M3 bei der Kachel ist der Kreis kleiner',
    Math.round(r.width) === 36, r.width.toFixed(0));
  pruefe('M3b das Zeichen darin bleibt gleich groß',
    Math.round(q('#tutRund svg').getBoundingClientRect().width) === 20,
    q('#tutRund svg').getBoundingClientRect().width.toFixed(0));
  pruefe('M3c aber die Fläche misst weiterhin 44 px', (function () {
    var mx = r.left + r.width / 2;
    var my = r.top + r.height / 2;
    return [[mx - 21, my], [mx + 21, my], [mx, my - 21], [mx, my + 21]].every(function (pt) {
      var el = document.elementFromPoint(pt[0], pt[1]);
      return !!el && (el === q('#tutRund') || q('#tutRund').contains(el));
    });
  })());

  // ── M4 · Überall sonst: zurück in die Kopfzeile ───────────
  setTab('home');
  pruefe('M4 auf der Übersicht hängt sie im Kopf',
    q('.kopf-rechts').contains(q('#uebLeiste')) &&
    !q('#uebLeiste').classList.contains('bei-kachel'));
  pruefe('M4b und der Knopf hat dort seine alte Größe',
    Math.round(q('#tutRund').getBoundingClientRect().width) === 44,
    q('#tutRund').getBoundingClientRect().width.toFixed(0));
  pruefe('M4c er steht in einer Reihe mit dem Menüknopf',
    Math.abs(q('#tutRund').getBoundingClientRect().top -
      q('#menuKnopf').getBoundingClientRect().top) < 2);

  // In einer Übung ohne eigene Spur bleibt der Knopf weg — und mit ihm die
  // Leiste, sonst stünde ein Streifen Luft über der Aufgabe.
  setTab('buchstaben');
  pruefe('M5 ohne Spur ist der Knopf weg', q('#tutRund').hidden === true);

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
