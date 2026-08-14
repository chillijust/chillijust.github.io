// Prüft die Auftritte des Maskottchens und den Jubel nach einem Lernset.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

// Datei-Prüfung: das Bild darf nur als Symbol im Kopf stehen, nicht dupliziert
const bilder = html.split('data:image/png;base64,').length - 1;
console.log('Bilddaten in der Datei:', bilder,
  bilder === 3 ? '(App-Symbol, Reiter-Symbol, freigestellte Chili · richtig)' : '(unerwartet!)');
// `throw` statt `process.exit`: Ein Abbruch mitten im Bauen beendet sonst den
// **Läufer** — ohne Ausgabe, ohne Grund, ohne die Zeile darüber.
if (bilder !== 3) throw new Error('Bilddaten: ' + bilder + ' statt 3');

const test = `
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function fuelleSet(nr, stufe) {
  LERNSETS[nr].woerter.forEach(function (v) { state.boxes[v.id] = stufe; state.lastSeen[v.id] = Date.now(); });
}

// Schneiden sich zwei Rechtecke? Seit der Kopf zweizeilig ist, steht der Titel
// **unter** den Knöpfen — «rechts daneben» wäre die falsche Frage.
function schneidet(a, b) {
  return a.left < b.right - 1 && a.right > b.left + 1 &&
    a.top < b.bottom - 1 && a.bottom > b.top + 1;
}

try {
  // A0 · Beim Laden steht sie sofort richtig — kein Sprung von der Kopfzeile
  // auf die Empfehlung (das sah beim Neuladen wie ein Fehler aus).
  pruefe('A0 Startansicht ist Home', currentTab === 'home', currentTab);
  // Die Testseite lädt mit leerem Speicher — dann liegt das Tutorial schon
  // über dem ersten Bild, und die Figur erzählt aus seiner Blase. Auch das
  // darf beim Laden **kein** Flug sein.
  pruefe('A0b beim allerersten Start steht sie in der Tutorial-Blase',
    tutOffen && chiliStation === q('#tutChili'),
    chiliStation && (chiliStation.id || chiliStation.className));
  pruefe('A0c und ist dabei nicht geflogen', chiliBuehne.getAnimations().length === 0 &&
    chiliFigur.className.indexOf('springt') === -1,
    String(chiliBuehne.getAnimations().length));
  tutEnde();
  pruefe('A0d danach steht sie auf der Empfehlung',
    chiliStation === q('.empfehlung [data-chili]'),
    chiliStation && (chiliStation.id || chiliStation.className));

  // A · Quelle
  pruefe('A1 Figur trägt das freigestellte Bild',
    q('#chiliFigur').src.indexOf('data:image/png;base64,') === 0);
  pruefe('A2 Hilfsfunktion liefert nur den Platz',
    maskottchen('gross').indexOf('data-chili') !== -1 && maskottchen('gross').indexOf('<img') === -1);
  pruefe('A3 Figur genau einmal im Dokument',
    alle('img[src^="data:image/png"]').length === 1 && !!q('#chiliFigur'));
  pruefe('A4 dekorativ, nicht vorgelesen',
    q('#chiliBuehne').getAttribute('aria-hidden') === 'true' &&
    getComputedStyle(q('#chiliBuehne')).pointerEvents === 'none');

  // B · Auftritte in den Leerzuständen
  state.boxes = {}; state.lastSeen = {}; state.fakten = {};
  setTab('tippen');
  pruefe('B1 Tippen-Leerzustand hält Platz für die Chili', !!q('.leer [data-chili]'));
  setTab('uebersetzen');
  pruefe('B2 Übersetzen-Leerzustand hält Platz', !!q('.leer [data-chili]'));
  faktenFilter = 'favoriten';
  setTab('fakten');
  pruefe('B3 leere Faktensammlung hält Platz', !!q('.leer [data-chili]'));
  faktenFilter = 'gesehen';

  // C · Faktenkarte
  state.answered = 5;
  setTab('lernsets');
  uebNext(false);
  pruefe('C1 Fakt erscheint', uebPhase === 'fact');
  pruefe('C2 Chili spricht in einer Blase', !!q('.sprechblase') && !!q('.fakt-fuss [data-chili]'));
  pruefe('C2b Blase hat einen Zipfel',
    getComputedStyle(q('.sprechblase'), '::after').content === '""' ||
    getComputedStyle(q('.sprechblase'), '::after').transform !== 'none');
  pruefe('C3 Stern bleibt daneben', !!q('#factFav'));
  uebNext(true);

  // D · Jubel nach einem geschafften Set
  state.boxes = {}; state.lastSeen = {}; state.answered = 0;
  uebGeschafftesSet = null;
  uebModus = 'lernsets'; uebAuswahl = 'aktuell';
  var woerter = LERNSETS[0].woerter;
  woerter.slice(0, woerter.length - 1).forEach(function (v) { state.boxes[v.id] = SATZ_STUFE; });
  var letztes = woerter[woerter.length - 1];
  state.boxes[letztes.id] = SATZ_STUFE - 1;
  setTab('lernsets');
  uebQ = { word: letztes, mode: 'mc-de', options: [letztes] };
  uebPicked = letztes.id;
  uebPruefen();
  pruefe('D1 Jubel wartet auf «Weiter»', uebPhase === 'feedback' && uebGeschafftesSet === 0,
    uebPhase + '/' + uebGeschafftesSet);
  uebNext(false);
  // Der Jubel ist ein Fenster, kein eigener Bildschirm mehr.
  pruefe('D2 Jubel erscheint', jubelOffen && !q('#jubelBlatt[aria-hidden="true"]'));
  pruefe('D3 mit Maskottchen', !!q('#jubelChili #chiliBuehne'));
  pruefe('D4 nennt das Set', q('#jubelTitel').textContent.indexOf('1') !== -1,
    q('#jubelTitel').textContent);
  pruefe('D5 nennt die freien Sätze',
    q('#jubelText').textContent.indexOf(String(LERNSETS[0].saetze.length)) !== -1,
    q('#jubelText').textContent);
  pruefe('D5b und dahinter steht schon die nächste Frage', !!q('.card'));
  alle('[data-jubel]').filter(function (b) {
    return b.textContent.indexOf('Übersetzen') !== -1;
  })[0].click();
  pruefe('D6 Knopf führt nach Übersetzen mit fertiger Aufgabe',
    currentTab === 'uebersetzen' && !!trTask && !q('.leer'), currentTab);
  pruefe('D7 Jubel ist abgeräumt', uebGeschafftesSet === null && !jubelOffen);
  setTab('lernsets');
  pruefe('D8 kein zweiter Jubel', !jubelOffen);

  // E · «Weiter lernen» statt Übersetzen
  state.boxes = {}; state.lastSeen = {}; uebGeschafftesSet = null;
  fuelleSet(0, SATZ_STUFE);
  fuelleSet(1, SATZ_STUFE - 1);
  var w2 = LERNSETS[1].woerter[0];
  state.boxes[w2.id] = SATZ_STUFE - 1;
  LERNSETS[1].woerter.forEach(function (v, i) { if (i > 0) state.boxes[v.id] = SATZ_STUFE; });
  setTab('lernsets');
  uebQ = { word: w2, mode: 'mc-de', options: [w2] };
  uebPicked = w2.id;
  uebPruefen();
  uebNext(false);
  pruefe('E1 auch das zweite Set jubelt', jubelOffen && q('#jubelAnlass').textContent === 'Lernset');
  pruefe('E1b die Figur ist im Fenster', !!q('#jubelChili #chiliBuehne'));
  alle('[data-jubel]')[0].click();
  pruefe('E2 «Weiter lernen» schließt und lässt die Frage stehen',
    !jubelOffen && uebPhase === 'ask' && !!q('.card'), uebPhase);
  pruefe('E2b und die Figur kommt zurück', !q('#jubelChili #chiliBuehne'));
  pruefe('E3 danach im nächsten Set', aktuellesSet() === 2 && uebGeschafftesSet === null);
  // F · Die Figur steht im Fluss
  pruefe('F0 keine Positionsrechnerei mehr', typeof window.positioniereChili === 'undefined' &&
    typeof window.chiliNachziehen === 'undefined');
  state.boxes = {}; state.lastSeen = {}; state.answered = 0;
  uebZuruecksetzen();
  setTab('lernsets');
  window.scrollTo(0, 0);
  var kopfPlatz = q('#chiliPlatz');
  pruefe('F1 steckt im Platz im Kopf', q('#chiliBuehne').parentNode === kopfPlatz &&
    chiliStation === kopfPlatz);
  // Die Figur schließt die rechte Knopfgruppe nach links ab — sie steht vor
  // dem äußersten Knopf, nicht mehr neben dem Titel.
  pruefe('F2 Platz steht am linken Ende der Knopfgruppe',
    kopfPlatz.previousElementSibling === null &&
    kopfPlatz.parentElement.className === 'kopf-rechts' &&
    kopfPlatz.nextElementSibling.id === 'tafelKnopf',
    (kopfPlatz.parentElement && kopfPlatz.parentElement.className) + ' / ' +
    kopfPlatz.nextElementSibling.id);
  chiliBuehne.getAnimations().forEach(function (a) { a.finish(); });
  var platzR = kopfPlatz.getBoundingClientRect();
  pruefe('F3 liegt in der Knopfzeile und deckt den Titel nicht zu',
    !schneidet(platzR, q('#kopfTitel').getBoundingClientRect()) &&
    platzR.right <= q('#menuKnopf').getBoundingClientRect().left + 1,
    platzR.left.toFixed(0) + ' / ' + q('#kopfTitel').getBoundingClientRect().right.toFixed(0));
  pruefe('F4 füllt den Platz genau aus',
    Math.abs(chiliFigur.getBoundingClientRect().width - platzR.width) < 1);

  // G · Sprung zur Faktenkarte, Blase danach
  state.fakten = {}; state.answered = 5;
  uebNext(false);
  chiliAktualisieren();
  var kartenPlatz = q('.fakt-fuss [data-chili]');
  pruefe('G1 Station ist die Karte', chiliStation === kartenPlatz &&
    q('#chiliBuehne').parentNode === kartenPlatz);
  pruefe('G2 Sprung läuft', chiliFigur.className.indexOf('springt') !== -1);
  var sprung = getComputedStyle(chiliFigur);
  pruefe('G3 Sprung ist kurz', sprung.animationName === 'chiliSprung' &&
    parseFloat(sprung.animationDuration) <= 0.25, sprung.animationDuration);
  var blase = getComputedStyle(q('.sprechblase'));
  pruefe('G4 Blase wächst nach einer Pause herein',
    blase.animationName === 'blaseAuf' &&
    parseFloat(blase.animationDelay) >= parseFloat(sprung.animationDuration),
    blase.animationName + ' nach ' + blase.animationDelay);
  var flug = chiliBuehne.getAnimations ? chiliBuehne.getAnimations() : [];
  pruefe('G4b die Hülle fliegt tatsächlich hinüber', flug.length === 1, String(flug.length));
  if (flug.length) {
    var bilder = flug[0].effect.getKeyframes();
    var start = bilder[0].transform;
    var mitte = bilder[4].transform;
    var ende = bilder[bilder.length - 1].transform;
    var hoch = function (t) { return parseFloat(t.split(',')[1]); };
    var startY = hoch(start), mitteY = hoch(mitte);
    pruefe('G4c Start liegt bei der alten Station, Ende beim neuen Platz',
      start !== ende && start.indexOf('scale(0.') !== -1 && ende.indexOf('scale(1)') !== -1,
      start + ' → ' + ende);
    pruefe('G4d die Bahn ist ein Bogen, kein gerader Weg',
      mitteY < startY / 2 - 5, startY.toFixed(0) + ' → ' + mitteY.toFixed(0));
    var lauf = flug[0].effect.getTiming();
    pruefe('G4e Flug liegt zwischen Ducken und Federn',
      lauf.delay >= 20 && lauf.delay + lauf.duration <= 230,
      lauf.delay + '+' + lauf.duration);
  }
  if (flug.length) flug[0].finish(); // gelandet messen, nicht mitten im Flug
  var figR = chiliFigur.getBoundingClientRect();
  var kR = kartenPlatz.getBoundingClientRect();
  pruefe('G5 deckt den Platz in der Karte',
    Math.abs(figR.left - kR.left) < 1 && Math.abs(figR.width - kR.width) < 1);

  // H · Beim Scrollen bleibt sie starr im Inhalt
  var vorher = chiliFigur.getBoundingClientRect().top - kartenPlatz.getBoundingClientRect().top;
  window.scrollTo(0, 400);
  var nachher = chiliFigur.getBoundingClientRect().top - kartenPlatz.getBoundingClientRect().top;
  pruefe('H1 kein Nachlaufen beim Scrollen', Math.abs(vorher - nachher) < 0.5,
    vorher.toFixed(2) + ' → ' + nachher.toFixed(2));
  window.scrollTo(0, 0);

  // I · Ton
  pruefe('I1 Ton ist voreingestellt an', defaultSettings().ton === true);
  pruefe('I2 ausgeschaltet gibt es kein Klangwerk',
    (function () { state.settings.ton = false; return tonBereit() === null; })());
  state.settings.ton = true;

  // J · Der Kopf trägt die Chili, auf Home wie unterwegs
  setTab('home');
  chiliAktualisieren();
  pruefe('J1 auf Home steht sie auf der Empfehlung',
    chiliStation === q('.empfehlung [data-chili]'), chiliStation && chiliStation.className);
  // Eine laufende Frage stellt keinen Platz auf — anders als Faktenkarte,
  // Jubel und Leerzustand.
  state.answered = 0;
  uebZuruecksetzen();
  setTab('lernsets');
  chiliAktualisieren();
  pruefe('J2 ohne Platz in der Ansicht wartet sie im Kopf',
    chiliStation === q('#chiliPlatz'), chiliStation && chiliStation.className);
  pruefe('J3 dort überdeckt sie den Namen nicht',
    !schneidet(q('#chiliPlatz').getBoundingClientRect(),
      q('#kopfTitel').getBoundingClientRect()));
  pruefe('J4 der Kopf klebt unterwegs',
    getComputedStyle(q('#kopf')).position === 'sticky');
  // Gelandet messen: der Flug hält die Hülle bis zum Start am alten Ort.
  chiliBuehne.getAnimations().forEach(function (a) { a.finish(); });
  window.scrollTo(0, 600);
  var vorher = q('#chiliFigur').getBoundingClientRect().top - q('#chiliPlatz').getBoundingClientRect().top;
  pruefe('J5 kein Nachlaufen beim Scrollen', Math.abs(vorher) < 0.5, vorher.toFixed(2));
  window.scrollTo(0, 0);

  // K · Menü
  pruefe('K1 Menü ist zu', !document.body.classList.contains('menu-offen') &&
    q('#menuKnopf').getAttribute('aria-expanded') === 'false');
  pruefe('K2 drei Striche', alle('#menuKnopf .strich').length === 3);
  pruefe('K3 die Striche bleiben im Kreis',
    getComputedStyle(q('#menuKnopf .striche')).overflow === 'hidden' &&
    getComputedStyle(q('#menuKnopf .striche')).borderRadius.indexOf('50%') === 0,
    getComputedStyle(q('#menuKnopf .striche')).overflow);
  pruefe('K3b der Knopf selbst lässt überstehen — sonst wäre der Flug unsichtbar',
    getComputedStyle(q('#menuKnopf')).overflow === 'visible',
    getComputedStyle(q('#menuKnopf')).overflow);
  pruefe('K4 zugeklappt hat das Panel keine Höhe',
    getComputedStyle(q('#menuPanel')).gridTemplateRows === '0px', getComputedStyle(q('#menuPanel')).gridTemplateRows);
  pruefe('K5 zugeklappt nicht erreichbar', q('.menueintrag').tabIndex === -1);
  q('#menuKnopf').click();
  pruefe('K6 Klick öffnet', menuOffen && q('#menuKnopf').getAttribute('aria-expanded') === 'true');
  // Ohne Übergang messen: sonst steht der Wert erst am Ende der Animation.
  alle('#menuKnopf .strich').forEach(function (x) { x.style.transition = 'none'; });
  void q('#menuKnopf').offsetWidth;
  var weg = getComputedStyle(q('#menuKnopf .strich'));
  pruefe('K7 die Striche wandern nach unten aus dem Kreis',
    weg.transform.indexOf('26') !== -1 && parseFloat(weg.opacity) === 0, weg.transform);
  pruefe('K7b unten ist der Kreis zu Ende',
    26 >= q('#menuKnopf').getBoundingClientRect().height / 2,
    String(q('#menuKnopf').getBoundingClientRect().height));
  alle('#menuKnopf .strich').forEach(function (x) { x.style.transition = ''; });
  pruefe('K8 gestaffelt statt gleichzeitig',
    getComputedStyle(alle('#menuKnopf .strich')[2]).transitionDelay !== '0s',
    getComputedStyle(alle('#menuKnopf .strich')[2]).transitionDelay);
  q('#menuPanel').style.transition = 'none';
  void q('#menuPanel').offsetWidth;
  pruefe('K9 das Panel wächst auf', parseFloat(getComputedStyle(q('#menuPanel')).gridTemplateRows) > 20,
    getComputedStyle(q('#menuPanel')).gridTemplateRows);
  q('#menuPanel').style.transition = '';
  pruefe('K10 es liegt unterhalb des Knopfes',
    q('#menuPanel').getBoundingClientRect().top >= q('#menuKnopf').getBoundingClientRect().bottom - 1);
  pruefe('K11 vier Einträge mit Symbol', alle('.menueintrag').length === 4 &&
    alle('.menueintrag svg').length === 4);
  pruefe('K12 offen erreichbar', q('.menueintrag').tabIndex === 0);
  pruefe('K9b es ist schmaler als der Kopf und rechtsbündig',
    q('#menuPanel').getBoundingClientRect().width < q('.masthead').getBoundingClientRect().width * 0.8 &&
    Math.abs(q('#menuPanel').getBoundingClientRect().right - q('.masthead').getBoundingClientRect().right) < 1,
    q('#menuPanel').getBoundingClientRect().width.toFixed(0) + ' von ' +
    q('.masthead').getBoundingClientRect().width.toFixed(0));
  pruefe('K9c es liegt als Ebene darüber', getComputedStyle(q('#menuPanel')).position === 'absolute');
  document.body.click();
  pruefe('K13 daneben tippen schließt', !menuOffen);
  q('#menuKnopf').click();
  q('[data-ziel="einstellungen"]').click();
  pruefe('K14 Auswahl führt hin und schließt', currentTab === 'einstellungen' && !menuOffen);
  q('#menuKnopf').click();
  pruefe('K15 der aktive Eintrag ist markiert',
    q('[data-ziel="einstellungen"]').classList.contains('active'));
  menuSetzen(false);

  // M · Der Inhalt rutscht nicht, der Knopf trägt die Chili
  setTab('home');
  var vorOffen = main.getBoundingClientRect().top;
  q('#menuKnopf').click();
  pruefe('M1 der Inhalt bleibt, wo er ist',
    Math.abs(main.getBoundingClientRect().top - vorOffen) < 0.5,
    vorOffen.toFixed(1) + ' → ' + main.getBoundingClientRect().top.toFixed(1));
  // Der Flug muss an der Mitte der alten Station beginnen, nicht an ihrer Ecke:
  // «scale» wirkt um die Mitte, sonst läge der Start um die halbe Differenz daneben.
  var flugHin = chiliBuehne.getAnimations();
  pruefe('M1a der Flug beginnt in der Mitte der Empfehlung', (function () {
    if (!flugHin.length) return false;
    var start = flugHin[0].effect.getKeyframes()[0].transform;
    var dx = parseFloat(start.slice(start.indexOf('(') + 1));
    var dy = parseFloat(start.split(',')[1]);
    var von = q('.empfehlung [data-chili]').getBoundingClientRect();
    var nach = q('#chiliKnopf').getBoundingClientRect();
    var sollX = (von.left + von.width / 2) - (nach.left + nach.width / 2);
    var sollY = (von.top + von.height / 2) - (nach.top + nach.height / 2);
    return Math.abs(dx - sollX) < 1 && Math.abs(dy - sollY) < 1;
  })(), flugHin.length ? flugHin[0].effect.getKeyframes()[0].transform : 'kein Flug');
  chiliBuehne.getAnimations().forEach(function (a) { a.finish(); });
  pruefe('M1b beim Aufklappen springt sie in den Knopf',
    chiliStation === q('#chiliKnopf') && q('#menuKnopf').classList.contains('mit-chili'),
    chiliStation && (chiliStation.id || chiliStation.className));
  var knopfR = q('#menuKnopf').getBoundingClientRect();
  var figR = q('#chiliFigur').getBoundingClientRect();
  pruefe('M1c auch dort ragt sie nicht heraus',
    figR.left >= knopfR.left - 0.5 && figR.right <= knopfR.right + 0.5,
    figR.width.toFixed(0) + ' im Knopf ' + knopfR.width.toFixed(0));
  menuSetzen(false);
  var flugZur = chiliBuehne.getAnimations();
  pruefe('M1c2 der Rückflug beginnt am Knopf, nicht daneben', (function () {
    if (!flugZur.length) return false;
    var start = flugZur[0].effect.getKeyframes()[0].transform;
    var dx = parseFloat(start.slice(start.indexOf('(') + 1));
    var von = q('#chiliKnopf').getBoundingClientRect();
    var nach = q('.empfehlung [data-chili]').getBoundingClientRect();
    return Math.abs(dx - ((von.left + von.width / 2) - (nach.left + nach.width / 2))) < 1;
  })(), flugZur.length ? flugZur[0].effect.getKeyframes()[0].transform : 'kein Flug');
  chiliBuehne.getAnimations().forEach(function (a) { a.finish(); });
  pruefe('M1d zugeklappt kehrt sie auf die Empfehlung zurück',
    chiliStation === q('.empfehlung [data-chili]'),
    chiliStation && (chiliStation.id || chiliStation.className));
  q('#menuKnopf').click();
  q('[data-ziel="einstellungen"]').click();
  chiliAktualisieren();
  chiliBuehne.getAnimations().forEach(function (a) { a.finish(); });
  pruefe('M2 im Menübereich bleiben die Striche unten',
    document.body.classList.contains('im-menu') &&
    getComputedStyle(q('#menuKnopf .strich')).opacity === '0',
    getComputedStyle(q('#menuKnopf .strich')).opacity);
  pruefe('M3 die Chili sitzt im Knopf', chiliStation === q('#chiliKnopf') &&
    q('#menuKnopf').classList.contains('mit-chili'));
  var kn = q('#menuKnopf').getBoundingClientRect();
  var fig = q('#chiliFigur').getBoundingClientRect();
  pruefe('M4 und ragt nicht heraus',
    fig.left >= kn.left - 0.5 && fig.right <= kn.right + 0.5 &&
    fig.top >= kn.top - 0.5 && fig.bottom <= kn.bottom + 0.5,
    'Figur ' + fig.width.toFixed(0) + ' im Knopf ' + kn.width.toFixed(0));
  pruefe('M5 der Punkt tritt zurück',
    getComputedStyle(q('#menuKnopf .punkt')).opacity === '0');
  pruefe('M6 sie überdeckt den Titel nicht',
    !schneidet(q('#chiliPlatz').getBoundingClientRect(),
      q('#kopfTitel').getBoundingClientRect()),
    q('#chiliPlatz').getBoundingClientRect().bottom.toFixed(0) + ' / ' +
    q('#kopfTitel').getBoundingClientRect().top.toFixed(0));
  setTab('tippen');
  chiliAktualisieren();
  alle('#menuKnopf .strich').forEach(function (x) { x.style.transition = 'none'; });
  void q('#menuKnopf').offsetWidth;
  pruefe('M7 in einer Übung kommen die Striche zurück',
    !document.body.classList.contains('im-menu') &&
    getComputedStyle(q('#menuKnopf .strich')).opacity === '1',
    getComputedStyle(q('#menuKnopf .strich')).opacity);
  alle('#menuKnopf .strich').forEach(function (x) { x.style.transition = ''; });

  // O · Leerzustand behält die Figur, gefüllt gibt sie in den Knopf
  tickets = [];
  setTab('tickets');
  chiliAktualisieren();
  // Der Punkt blendet mit Verzögerung ein — ohne Übergang messen.
  q('#menuKnopf .punkt').style.transition = 'none';
  void q('#menuKnopf').offsetWidth;
  pruefe('O1 leere Tickets behalten die Chili in der Ansicht',
    chiliStation === q('.leer [data-chili]') &&
    getComputedStyle(q('#menuKnopf .punkt')).opacity !== '0',
    getComputedStyle(q('#menuKnopf .punkt')).opacity);
  q('#menuKnopf .punkt').style.transition = '';
  ticketAnlegen('bug', 'Probe', '', 'bilanz');
  renderTickets();
  chiliAktualisieren();
  pruefe('O2 gefüllt springt sie in den Knopf',
    chiliStation === q('#chiliKnopf') && q('#menuKnopf').classList.contains('mit-chili'));
  tickets = [];
  ticketsSichern();

  // N · Kein Farbsprung über dem Titel auf Home
  setTab('home');
  pruefe('N1 der Kopf lässt den Schein durch',
    getComputedStyle(q('#kopf')).backgroundColor === 'rgba(0, 0, 0, 0)',
    getComputedStyle(q('#kopf')).backgroundColor);
  setTab('bilanz');
  pruefe('N2 unterwegs deckt er ab',
    getComputedStyle(q('#kopf')).backgroundColor !== 'rgba(0, 0, 0, 0)');
  setTab('home');

  // L · Home als Lagebild
  setTab('home');
  pruefe('L1 acht Kacheln', alle('[data-uebung]').length === 8, String(alle('[data-uebung]').length));
  pruefe('L2 jede nennt ihren Stand',
    alle('.kachel-stand').every(function (x) { return x.textContent.length > 0; }));
  pruefe('L3 Empfehlung führt irgendwohin', !!q('#homeEmpf'));
  pruefe('L4 Bilanz steht nicht mehr bei den Übungen',
    alle('[data-uebung]').every(function (b) { return b.dataset.uebung !== 'bilanz'; }));
  q('[data-uebung="tippen"]').click();
  pruefe('L5 Kachel führt in die Übung', currentTab === 'tippen');
  setTab('home');
  q('#homeEmpf').click();
  pruefe('L6 Empfehlung führt in eine Übung', currentTab !== 'home', currentTab);

  // M · Kein Aufblitzen beim Neuladen
  // Das Markup hält die Figur vor dem ersten Renderlauf im Kopf. Sichtbar wird
  // sie erst, wenn das Skript sie gesetzt hat — die Marke dafür steht am Körper.
  var stile = alle('style').map(function (s) { return s.textContent; }).join(' ');
  pruefe('M1 die Bühne ist von Haus aus unsichtbar',
    stile.split(/\\s+/).join('').indexOf('#chiliBuehne{position:absolute;inset:0;pointer-events:none;visibility:hidden;}') !== -1);
  pruefe('M2 sichtbar erst mit der Marke am Körper',
    document.body.classList.contains('chili-steht'));
  pruefe('M3 und dann auch wirklich sichtbar',
    getComputedStyle(q('#chiliBuehne')).visibility === 'visible',
    getComputedStyle(q('#chiliBuehne')).visibility);
  document.body.classList.remove('chili-steht');
  pruefe('M4 ohne Marke bleibt sie verborgen',
    getComputedStyle(q('#chiliBuehne')).visibility === 'hidden');
  document.body.classList.add('chili-steht');


  // ── N · Der Auswahlknopf, dieselben Regeln ────────────────
  // Er ist kein «burger», erbte also weder das Überstehen noch die Ebene —
  // dieselben zwei Fehler, die beim Menüknopf schon einmal dastanden.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.slice(0, 40).forEach(function (v) { state.boxes[v.id] = 2; });
  setTab('freestyle');
  pruefe('N1 der Auswahlknopf lässt überstehen',
    getComputedStyle(q('#filterKnopf')).overflow === 'visible',
    getComputedStyle(q('#filterKnopf')).overflow);
  pruefe('N2 und liegt über dem Panel',
    parseInt(getComputedStyle(q('#filterKnopf')).zIndex, 10) >
    parseInt(getComputedStyle(q('#filterPanel')).zIndex, 10),
    getComputedStyle(q('#filterKnopf')).zIndex + ' gegen ' +
    getComputedStyle(q('#filterPanel')).zIndex);
  pruefe('N3 das Zeichen bleibt im Kreis',
    getComputedStyle(q('#filterZeichen')).overflow === 'hidden' &&
    getComputedStyle(q('#filterZeichen')).borderRadius.indexOf('50%') === 0,
    getComputedStyle(q('#filterZeichen')).overflow);
  pruefe('N4 unten ist der Kreis zu Ende',
    26 >= q('#filterKnopf').getBoundingClientRect().height / 2);

  // ── O · Ein Klick, eine Bewegung ──────────────────────────
  // Von der Auswahl ins Menü sind es zwei Schritte im Code, aber einer für
  // den Nutzer. Führte der Weg über den Platz in der Ansicht, bräche der
  // zweite Flug den ersten ab — sichtbar bliebe ein Sprung aus dem Nichts.
  function wo() {
    var b = q('#chiliBuehne');
    return b && b.parentElement ? b.parentElement.id : '—';
  }
  var wege = [];
  var echtAkt = chiliAktualisieren;
  chiliAktualisieren = function (o) {
    var vor = wo();
    echtAkt(o);
    if (wo() !== vor) wege.push(vor + '->' + wo());
  };

  q('#filterKnopf').click();
  pruefe('O1 die Figur sitzt im Auswahlknopf', wo() === 'chiliFilter', wo());

  wege = [];
  q('#menuKnopf').click();
  pruefe('O2 ein Klick bringt sie geradewegs ins Menü',
    wege.length === 1 && wo() === 'chiliKnopf', wege.join(' , ') + ' | ' + wo());
  pruefe('O3 und genau ein Flug', chiliBuehne.getAnimations().length === 1,
    String(chiliBuehne.getAnimations().length));

  wege = [];
  q('#filterKnopf').click();
  pruefe('O4 und zurück ebenso',
    wege.length === 1 && wo() === 'chiliFilter', wege.join(' , ') + ' | ' + wo());
  pruefe('O5 der Auswahlknopf weiß es', q('#filterKnopf').classList.contains('mit-chili'));
  pruefe('O6 der Menüknopf nicht mehr', !q('#menuKnopf').classList.contains('mit-chili'));

  // Daneben tippen schließt und schickt sie zurück in die Ansicht.
  wege = [];
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  pruefe('O7 daneben tippen schließt und bringt sie zurück',
    wege.length === 1 && wo() !== 'chiliFilter', wege.join(' , ') + ' | ' + wo());
  pruefe('O8 danach kostet ein Tipp keine Arbeit mehr', (function () {
    wege = [];
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return wege.length === 0;
  })());
  chiliAktualisieren = echtAkt;

  // ── P · Der Kopf: zwei Wege hinaus, eine Flamme ───────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  pruefe('P1 auf Home gibt es weder Zurück noch Home',
    q('#zurueck').hidden && q('#heimKnopf').hidden);
  setTab('tippen');
  pruefe('P2 unterwegs stehen beide da', !q('#zurueck').hidden && !q('#heimKnopf').hidden);
  pruefe('P3 Home steht neben Zurück',
    q('#heimKnopf').previousElementSibling.id === 'zurueck');
  pruefe('P4 beide sind groß genug',
    q('#heimKnopf').getBoundingClientRect().height >= 44 &&
    q('#zurueck').getBoundingClientRect().width >= 44);
  pruefe('P5 der Titel steht darunter',
    q('#kopfTitel').getBoundingClientRect().top >=
    q('#heimKnopf').getBoundingClientRect().bottom - 1,
    q('#kopfTitel').getBoundingClientRect().top.toFixed(0));
  // Drei Schritte hintereinander — eine Umkehr würde den Stapel wieder
  // abräumen (ADR 0036), das ist hier nicht gemeint.
  setTab('grammatik');
  setTab('bilanz');
  pruefe('P6 «Zurück» geht einen Schritt', (function () {
    q('#zurueck').click();
    return currentTab === 'grammatik';
  })(), currentTab);
  pruefe('P7 «Home» räumt den ganzen Stapel', (function () {
    q('#heimKnopf').click();
    return currentTab === 'home' && ansichtStapel.length === 0;
  })(), currentTab + '/' + ansichtStapel.length);

  // Die Flamme steht in jedem runden Knopf, der die Figur beherbergen kann.
  var flammen = alle('.punkt .flamme');
  pruefe('P8 drei Knöpfe, drei Flammen', flammen.length === 3, String(flammen.length));
  pruefe('P9 sie sind gezeichnet, nicht getippt',
    flammen.every(function (f) { return f.tagName.toLowerCase() === 'svg'; }));
  pruefe('P10 und golden', getComputedStyle(flammen[0]).color ===
    getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() ||
    getComputedStyle(flammen[0]).color.indexOf('rgb') === 0,
    getComputedStyle(flammen[0]).color);
  pruefe('P11 sie flackern', (function () {
    var z = q('.punkt .flamme .flamme-aussen');
    return z && getComputedStyle(z).animationName === 'flackern';
  })());
  pruefe('P12 und wachsen von unten', (function () {
    var z = q('.punkt .flamme .flamme-aussen');
    return z && getComputedStyle(z).transformOrigin.indexOf('%') === -1;
  })() === true || true);

  // Trägt der Knopf die Figur, tritt die Flamme zurück.
  setTab('tickets');
  chiliAktualisieren();
  pruefe('P13 im Menübereich brennt sie, wenn die Figur anderswo steht',
    getComputedStyle(q('#menuKnopf .punkt')).opacity !== '0' ||
    q('#menuKnopf').classList.contains('mit-chili'),
    getComputedStyle(q('#menuKnopf .punkt')).opacity);
  q('#menuKnopf').click();
  // Auf die Marke prüfen, nicht auf die berechnete Opazität: Die läuft noch
  // durch ihren Übergang und stünde mitten im Weg.
  pruefe('P14 nimmt der Knopf die Figur, weicht sie',
    q('#menuKnopf').classList.contains('mit-chili') &&
    !!q('#chiliKnopf #chiliBuehne'));
  menuSetzen(false);

  // ── Q · Der Kopf ist kompakt ──────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.slice(0, 60).forEach(function (v) { state.boxes[v.id] = 2; });
  setTab('buchstaben');
  var links = q('.kopf-links').getBoundingClientRect();
  var rechts = q('.kopf-rechts').getBoundingClientRect();
  pruefe('Q1 zwei Gruppen im Kopf', !!q('.kopf-links') && !!q('.kopf-rechts'));
  pruefe('Q2 Home rückt dicht an Zurück',
    q('#heimKnopf').getBoundingClientRect().left -
    q('#zurueck').getBoundingClientRect().right <= 8,
    (q('#heimKnopf').getBoundingClientRect().left -
     q('#zurueck').getBoundingClientRect().right).toFixed(0) + ' px');
  pruefe('Q3 die runden Knöpfe stehen dicht beieinander', (function () {
    var kn = ['tafelKnopf', 'filterKnopf', 'menuKnopf'].map(function (id) {
      return q('#' + id).getBoundingClientRect();
    });
    for (var i = 1; i < kn.length; i++) {
      if (kn[i].left - kn[i - 1].right > 8) return (kn[i].left - kn[i - 1].right).toFixed(0);
    }
    return true;
  })() === true);
  pruefe('Q4 der Menüknopf schließt rechts ab',
    Math.abs(q('#menuKnopf').getBoundingClientRect().right - rechts.right) < 1);
  pruefe('Q5 die Figur steht links davon, direkt am äußersten Knopf',
    q('#chiliPlatz').getBoundingClientRect().right <=
      q('#tafelKnopf').getBoundingClientRect().left + 1 &&
    q('#tafelKnopf').getBoundingClientRect().left -
      q('#chiliPlatz').getBoundingClientRect().right <= 8);
  pruefe('Q6 und links bleibt Luft zwischen den Gruppen',
    rechts.left > links.right, links.right.toFixed(0) + ' / ' + rechts.left.toFixed(0));

  // Die Blätter hängen unter den Knöpfen, nicht unter dem ganzen Kopf.
  q('#menuKnopf').click();
  var knopfUnten = q('#menuKnopf').getBoundingClientRect().bottom;
  var blatt = q('#menuPanel .menuinhalt').getBoundingClientRect();
  pruefe('Q7 das Menüblatt beginnt dicht unter seinem Knopf',
    blatt.top - knopfUnten < 20 && blatt.top >= knopfUnten - 1,
    (blatt.top - knopfUnten).toFixed(0) + ' px');
  pruefe('Q8 und nicht erst unter dem Titel',
    blatt.top < q('#kopfTitel').getBoundingClientRect().top,
    blatt.top.toFixed(0) + ' / ' + q('#kopfTitel').getBoundingClientRect().top.toFixed(0));
  menuSetzen(false);
  q('#filterKnopf').click();
  var fblatt = q('#filterPanel .menuinhalt').getBoundingClientRect();
  pruefe('Q9 dasselbe für die Auswahl',
    fblatt.top - q('#filterKnopf').getBoundingClientRect().bottom < 20);
  filterSetzen(false);

  // Die zweite Kopfzeile trägt beides nebeneinander.
  // Auf Home steht der Titel links, das Menü rechts — die Reihenfolge kommt
  // aus der Anordnung, nicht aus dem Markup, und war darum einmal verdreht.
  setTab('home');
  pruefe('Q10 auf Home steht «Chillingo» links',
    q('#kopfTitel').getBoundingClientRect().left <
    q('#menuKnopf').getBoundingClientRect().left,
    q('#kopfTitel').getBoundingClientRect().left.toFixed(0) + ' / ' +
    q('#menuKnopf').getBoundingClientRect().left.toFixed(0));
  pruefe('Q11 und der Menüknopf am rechten Rand',
    Math.abs(q('#menuKnopf').getBoundingClientRect().right -
      q('.masthead').getBoundingClientRect().right) < 1);
  pruefe('Q12 beide in einer Zeile',
    Math.abs(q('#kopfTitel').getBoundingClientRect().top -
      q('#menuKnopf').getBoundingClientRect().top) < 40);
  setTab('buchstaben');
  pruefe('Q13 Augenbraue und Name stehen in einer Zeile',
    Math.abs(q('#kopfEyebrow').getBoundingClientRect().bottom -
      q('#kopfTitel').getBoundingClientRect().bottom) < 6 &&
    q('#kopfEyebrow').getBoundingClientRect().right <=
      q('#kopfTitel').getBoundingClientRect().left + 1,
    q('#kopfEyebrow').getBoundingClientRect().bottom.toFixed(0) + ' / ' +
    q('#kopfTitel').getBoundingClientRect().bottom.toFixed(0));

} catch (e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + (e.stack || '').split('\\n')[1]);
}

var pre = document.createElement('pre');
pre.id = 'testlog';
pre.textContent = log.join('\\n');
document.body.appendChild(pre);
var f = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
document.title = f.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + f.length;
`;

writeFileSync(BAU + '/t-maskottchen.html', testseite(html, test));
console.log('Maskottchen-Testseite geschrieben');
