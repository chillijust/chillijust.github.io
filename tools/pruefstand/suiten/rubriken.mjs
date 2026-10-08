// Prüft Lernsets, Freestyle, Zusatzkacheln, Themenfilter und Tastaturvorgabe.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = `
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function lerne(liste, stufe) {
  liste.forEach(function (v) { state.boxes[v.id] = stufe; state.lastSeen[v.id] = Date.now(); });
}

try {
  // A · Navigation und Name
  setTab('home');
  // **Gefragt ist das volle Angebot**, nicht der schlanke Weg darüber: Seit
  // 2.4.7 steht oben eine kurze Auswahl des Fälligen, und dieselbe Übung kann
  // darum zweimal im Baum stehen (ADR 0065). Der vollständige Satz liegt in
  // «#homeAlle».
  var kacheln = alle('#homeAlle [data-uebung]').map(function (b) { return b.dataset.uebung; }).join(',');
  pruefe('A1 sieben Übungen auf Home',
    kacheln === 'buchstaben,lernsets,tippen,schreibung,power,grammatik,uebersetzen', kacheln);
  pruefe('A2 App heißt Chillingo', q('h1').textContent.indexOf('Chillingo') === 0 &&
    document.title.indexOf('Chillingo') === 0);
  pruefe('A3 Doppeltipp-Zoom aus',
    getComputedStyle(document.documentElement).touchAction === 'manipulation',
    getComputedStyle(document.documentElement).touchAction);

  // B · Lernsets
  state.boxes = {}; state.lastSeen = {};
  // Keine Obergrenze mehr: Mit den Sätzen wachsen die Sets. Geprüft wird, dass
  // überhaupt welche entstehen — die Suite «lehrplan» sieht sie sich genauer an.
  pruefe('B1 Sets gebildet', LERNSETS.length >= 8, String(LERNSETS.length));
  pruefe('B2 jedes Set hat Wörter und Sätze',
    LERNSETS.every(function (s) { return s.woerter.length > 0 && s.saetze.length > 0; }));
  pruefe('B3 kein Wort in zwei Sets', (function () {
    var g = {}, ok = true;
    LERNSETS.forEach(function (s) { s.woerter.forEach(function (v) { if (g[v.id]) ok = false; g[v.id] = true; }); });
    return ok;
  })());
  pruefe('B4 erstes Set öffnet Sätze', LERNSETS[0].saetze.length >= 3, String(LERNSETS[0].saetze.length));
  pruefe('B5 Start im ersten Set', aktuellesSet() === 0 && !setFrei(1));
  setTab('lernsets');
  pruefe('B6 Kopf zeigt Set und Satzzahl',
    q('.paket-text').textContent.indexOf('bis zu ' + LERNSETS[0].saetze.length + ' Sätzen') !== -1,
    q('.paket-text').textContent);
  var drin = 0;
  for (var i = 0; i < 30; i++) if (LERNSETS[0].woerter.indexOf(waehleWort(uebPool())) !== -1) drin++;
  pruefe('B7 Auswahl bleibt im Set', drin === 30, drin + '/30');

  // C · Set schafft Sätze frei
  // Die Sätze hängen an der Satzstufe je Wort, das Set an der Endstufe
  // (ADR 0086) — zwei Schwellen, zwei Wirkungen.
  lerne(LERNSETS[0].woerter, BOX_MAX);
  pruefe('C1 Set geschafft', setGeschafft(0) && aktuellesSet() === 1);
  var offen = LERNSETS[0].saetze.filter(satzFrei).length;
  pruefe('C2 die Sätze des Sets sind offen', offen === LERNSETS[0].saetze.length,
    offen + '/' + LERNSETS[0].saetze.length);
  setTab('uebersetzen');
  pruefe('C3 Übersetzen ist nach einem Set spielbar', !q('.leer') && !!q('.built'));

  // D · Die Auswahl in «Lernsets»
  // **Eine Themenwahl gibt es nicht mehr** (ADR 0091): «Freestyle» ist
  // entfallen, und mit ihm der einzige Ort, an dem nach Thema gefiltert wurde.
  setTab('lernsets');
  filterSetzen(true); renderFilter();
  pruefe('D1 Setwahl statt Themenwahl', !!q('[data-fw="set"]') && !q('[data-fw="thema"]'));
  pruefe('D2 «aktuell» und «alles Freigeschaltete» stehen zur Wahl',
    alle('[data-fw="auswahl"]').length >= 2 || !!q('[data-fw="set"]'));
  filterSetzen(false);
  uebAuswahl = 'aktuell';
  uebNext(true);
  var nurSet = true;
  var setWoerter = LERNSETS[aktuellesSet()].woerter.map(function (v) { return v.id; });
  for (var j = 0; j < 20; j++) {
    if (setWoerter.indexOf(waehleWort(uebPool()).id) === -1) nurSet = false;
  }
  pruefe('D3 das laufende Set bleibt unter sich', nurSet);
  pruefe('D4 und der Vorrat ist genau das Set',
    uebPool().length === LERNSETS[aktuellesSet()].woerter.length);
  uebAuswahl = 'alle';
  uebNext(true);
  pruefe('D5 «Alles Freigeschaltete» nimmt mehr',
    uebPool().length === freigeschalteteWoerter().length,
    uebPool().length + ' von ' + ALL_VOCAB.length);

  // E · Ein Wechsel der Auswahl setzt die Frage neu
  // **Den Rubrikwechsel gibt es nicht mehr** (ADR 0091) — «Lernsets» und
  // «Freestyle» waren zwei Eingänge in dieselbe Übung, und der Wechsel
  // zwischen ihnen räumte die laufende Frage weg. Geblieben ist die Auswahl.
  uebAuswahl = 'aktuell';
  uebNext(true);
  var vorher = uebQ;
  filterWaehlen('set', 'alle');
  pruefe('E1 ein Wechsel der Auswahl baut neu auf',
    uebAuswahl === 'alle' && uebQ !== vorher, uebAuswahl);
  uebAuswahl = 'aktuell';
  uebNext(true);

  // F · Zusatzkacheln
  state.boxes = {}; state.lastSeen = {};
  // **Das Wort muß im laufenden Set liegen.** Seit «Freestyle» fort ist, zieht
  // die Übung aus dem Set, nicht mehr aus dem ganzen Wortschatz.
  var wort = LERNSETS[0].woerter.filter(function (v) {
    return v.ru.length >= 5 && v.ru.indexOf(' ') === -1;
  })[0] || LERNSETS[0].woerter[0];
  // **Unterhalb der Tippstufe** (ADR 0088): Darüber wird in «Lernsets» nur
  // noch geschrieben, Kacheln kommen dort nicht mehr vor.
  state.boxes[wort.id] = SATZ_STUFE;
  uebAuswahl = 'aktuell';
  var versuche = 0, gefunden = null;
  while (versuche < 60 && !gefunden) {
    var f = buildQuestion();
    if (f && f.mode === 'tiles') gefunden = f;
    versuche++;
  }
  pruefe('F1 Kachelmodus erreichbar', !!gefunden);
  if (gefunden) {
    pruefe('F2 mehr Kacheln als Buchstaben', gefunden.tiles.length > gefunden.laenge,
      gefunden.tiles.length + ' Kacheln für ' + gefunden.laenge + ' Buchstaben');
    var vorhandene = gefunden.tiles.map(function (t) { return t.ch; });
    var noetig = gefunden.word.ru.split('');
    var alleDa = noetig.every(function (c) {
      var i = vorhandene.indexOf(c);
      if (i === -1) return false;
      vorhandene.splice(i, 1);
      return true;
    });
    pruefe('F3 alle nötigen Buchstaben liegen bereit', alleDa);
    uebQ = gefunden; uebPhase = 'ask'; uebBuilt = []; renderUeben();
    pruefe('F4 Felder entsprechen der Wortlänge', alle('.slot').length === gefunden.laenge);
    alle('[data-tile]').slice(0, gefunden.laenge).forEach(function (b) { b.click(); });
    pruefe('F5 nicht mehr Buchstaben als Felder', uebBuilt.length === gefunden.laenge);
    alle('[data-tile]').forEach(function (b) { b.click(); });
    pruefe('F6 überzählige Kacheln bleiben wirkungslos', uebBuilt.length === gefunden.laenge);
  }

  // G · Tastatur in Tippen
  // Stufe 3, nicht BOX_MAX: Fertiges verlässt den Lernstapel und wäre nicht da.
  state.boxes = {}; state.lastSeen = {};
  ALL_VOCAB.slice(0, 5).forEach(function (v) { state.boxes[v.id] = 3; state.lastSeen[v.id] = Date.now(); });
  tippenModus = 'lernen';
  tWord = null; tResult = null; tKb = null;
  setTab('tippen');
  // Getippt wird hier immer Kyrillisch — die eingebaute Tastatur kommt darum
  // von selbst (ADR 0037).
  pruefe('G1 Tastatur steht gleich da', !!q('[data-key]') && !!q('#tKbToggle'));
  q('#tKbToggle').click();
  pruefe('G2 Tastatur lässt sich ausblenden', !q('[data-key]'));
  state.settings.tastaturAuto = false;
  tKb = null;
  setTab('tippen');
  pruefe('G3 ausgeschaltet bleibt sie zu', !q('[data-key]'));
  state.settings.tastaturAuto = true;
  state.settings.tastaturAn = false;

  // H · Bilanz: Themen mit Fortschritt
  state.boxes = {}; state.lastSeen = {};
  VOCAB_THEMES['Tiere'].slice(0, 2).forEach(function (w) { state.boxes[w[0]] = BOX_MAX; });
  themenOffen = false;
  setTab('bilanz');
  var zeilen = alle('.theme-list').pop().querySelectorAll('.theme-row').length;
  pruefe('H1 nur Themen mit Fortschritt', zeilen === 1, String(zeilen));
  pruefe('H2 Ausklappen angeboten', !!q('#themenMehr'));
  q('#themenMehr').click();
  var alleZeilen = alle('.theme-list').pop().querySelectorAll('.theme-row').length;
  pruefe('H3 alle Themen nach dem Ausklappen', alleZeilen === Object.keys(VOCAB_THEMES).length,
    String(alleZeilen));
  q('#themenMehr').click();
  pruefe('H4 wieder einklappbar',
    alle('.theme-list').pop().querySelectorAll('.theme-row').length === 1);
  // I · Aufgaben sitzen tiefer, Listen nicht
  function tief(id) { setTab(id); return document.body.classList.contains('aufgabe'); }
  pruefe('I1 Übungen rücken nach unten',
    ['lernsets', 'tippen', 'uebersetzen', 'buchstaben', 'grammatik']
      .every(tief));
  pruefe('I2 Home nicht', !tief('home'));
  pruefe('I3 Menüansichten nicht',
    ['bilanz', 'einstellungen', 'tickets', 'sicherung', 'fakten'].every(function (id) {
      return !tief(id);
    }));
  setTab('uebersetzen');
  var mainStil = getComputedStyle(document.getElementById('main'));
  pruefe('I4 der freie Raum wird 2:1 geteilt',
    mainStil.display === 'flex' && mainStil.flexDirection === 'column',
    mainStil.display + '/' + mainStil.flexDirection);
  setTab('bilanz');
  pruefe('I5 in Listen bleibt der Fluss normal',
    getComputedStyle(document.getElementById('main')).display === 'block');



  // ── Z · Die Übersicht zeigt einen Weg (ADR 0065) ─────────
  // Acht gleichrangige Kacheln auf einmal überfordern: Man sieht ein Angebot,
  // aber keinen Anfang. Jetzt stehen oben die Empfehlung und höchstens drei
  // fällige Kacheln, alles Übrige liegt hinter einem Tipp.
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  pruefe('Z1 die Empfehlung steht oben', !!q('#homeEmpf'));
  var oben = alle('#main [data-uebung]').filter(function (b) {
    return !q('#homeAlle').contains(b);
  });
  pruefe('Z2 darunter höchstens drei Kacheln', oben.length <= 3, String(oben.length));
  // Was empfohlen ist, steht schon oben — zweimal dasselbe hilft niemandem.
  pruefe('Z3 das Empfohlene wird nicht wiederholt',
    oben.every(function (b) { return b.dataset.uebung !== empfehlung().ziel; }),
    empfehlung().ziel + ' / ' + oben.map(function (b) { return b.dataset.uebung; }).join());
  // Und nur, wo wirklich etwas zu tun ist — dieselbe Frage wie bei der
  // Empfehlung: «gesperrt» und «leer» fallen weg.
  pruefe('Z4 nur, wo Arbeit wartet', oben.every(function (b) {
    var st = uebungsStand(b.dataset.uebung);
    return !st.gesperrt && !st.leer;
  }), oben.map(function (b) { return b.dataset.uebung; }).join());

  // Das ganze Angebot liegt zugeklappt im Baum — nicht weggelassen: Das
  // Tutorial zeigt auf einzelne Kacheln, und ein Ziel, das es nicht gibt, wäre
  // ein stiller Fehler.
  pruefe('Z5 alle sieben stehen im Baum', alle('#homeAlle [data-uebung]').length === 7,
    String(alle('#homeAlle [data-uebung]').length));
  pruefe('Z6 zugeklappt sind sie nicht zu sehen',
    getComputedStyle(q('#homeAlle')).display === 'none');
  pruefe('Z7 der Knopf sagt, dass er zu ist',
    q('#homeAlleKnopf').getAttribute('aria-expanded') === 'false');
  pruefe('Z8 und er ist ein Touch-Ziel',
    q('#homeAlleKnopf').getBoundingClientRect().height >= 44,
    q('#homeAlleKnopf').getBoundingClientRect().height.toFixed(0));
  q('#homeAlleKnopf').click();
  pruefe('Z9 ein Tipp klappt auf',
    homeOffen === true && getComputedStyle(q('#homeAlle')).display !== 'none' &&
    q('#homeAlleKnopf').getAttribute('aria-expanded') === 'true');
  q('#homeAlleKnopf').click();
  pruefe('Z10 und der nächste wieder zu', homeOffen === false);
  // Ansichtszustand (ADR 0017): Nach dem Einspielen einer Sicherung steht dort
  // ein anderer Lernstand.
  homeOffen = true;
  ansichtenZuruecksetzen();
  pruefe('Z11 Zurücksetzen klappt sie zu', homeOffen === false);

  // **Der Scheinwerfer klappt selbst auf**, wenn sein Ziel im zugeklappten
  // Teil liegt. Seit ADR 0085 zeigt kein Schritt der Heimspur mehr auf eine
  // einzelne Kachel — geprüft wird darum die **Mechanik**, mit einem eigens
  // dorthin gesetzten Ziel. Eine Prüfung, die auf einen zufällig passenden
  // Schritt angewiesen ist, wird still, sobald der Inhalt sich ändert.
  setTab('home');
  tutStarten(false);
  var gemerkt = TUTORIALS.home.slice();
  // «Power-Training» ist am Anfang gesperrt und steht darum nie in der kurzen
  // Auswahl oben — sein Platz ist sicher der zugeklappte Teil.
  TUTORIALS.home = gemerkt.slice();
  TUTORIALS.home[0] = ['home', '[data-uebung="power"]',
    'Ein Ziel, das unten liegt — nur für diese Prüfung.'];
  tutSchritt = 0;
  pruefe('Z12a das Ziel liegt wirklich im zugeklappten Teil',
    homeOffen === false && !q('#main [data-uebung="power"]:not(#homeAlle *)'));
  tutZeichnen();
  pruefe('Z12 das Tutorial öffnet den Bereich für sein Ziel', homeOffen === true);
  pruefe('Z13 und leuchtet die Kachel an, nicht das Nichts',
    q('#tutLoch').getBoundingClientRect().width > 20,
    q('#tutLoch').getBoundingClientRect().width.toFixed(0));
  TUTORIALS.home = gemerkt;
  tutEnde();
  ansichtenZuruecksetzen();


  // ── Y · Die Empfehlung ist eine Leiter (ADR 0066) ────────
  // Sie fragte als Erstes, wo man zuletzt war — eine Auskunft über die
  // Vergangenheit, kein Vorschlag. Jetzt stehen oben die Defizite.
  state = defaultState();
  ansichtenZuruecksetzen();
  // **Ein Defizit sticht die Fortsetzung.** Drei zurückgefallene Wörter
  // blockieren ihre Sätze — dorthin, auch wenn man gerade woanders war.
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  var drei = ALL_VOCAB.slice(0, PT_MINDEST);
  drei.forEach(function (v) {
    state.boxes[v.id] = SATZ_STUFE - 1;
    state.patzer[v.id] = Date.now();
  });
  zuletztGeuebt('tippen');
  var e = empfehlung();
  pruefe('Y1 Zurückgefallenes sticht die Fortsetzung', e.ziel === 'power',
    e.ziel + ' — ' + e.titel);
  pruefe('Y2 und sagt, warum', e.note.indexOf('zurückgefallen') !== -1, e.note);

  // **Die Zeichen gehen vor, solange man am Anfang steht.**
  state = defaultState();
  ansichtenZuruecksetzen();
  zuletztGeuebt('tippen');
  pruefe('Y3 am Anfang zuerst die Zeichen', empfehlung().ziel === 'buchstaben',
    empfehlung().ziel + ' — ' + empfehlung().titel);
  // Wer längst liest, bekommt keine Ermahnung mehr: Dieselbe Lage, aber mit
  // Wortschatz im Rücken.
  ALL_VOCAB.slice(0, ABC_ZUERST_BIS + 5).forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  pruefe('Y4 mit Wortschatz im Rücken nicht mehr',
    empfehlung().ziel !== 'buchstaben', empfehlung().ziel);

  // **Unterhalb der Defizite gewinnt die Fortsetzung.**
  state = defaultState();
  ansichtenZuruecksetzen();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; });
  // **Eine Übung, die auch etwas hergibt.** «Tippen» wäre hier gesperrt, und
  // eine Fortsetzung ins Leere wird verworfen — der Test führe dann grün, ohne
  // die Fortsetzung je zu prüfen.
  zuletztGeuebt('grammatik');
  var f = empfehlung();
  pruefe('Y5 ohne Defizit führt sie zurück, wo man war', f.ziel === 'grammatik',
    f.ziel + ' — ' + f.titel);
  pruefe('Y6 und sagt es auch', f.titel.indexOf('Weiter mit') === 0, f.titel);
  // Jede Sprosse nennt einen Grund — eine leere Zeile wäre eine Ansage.
  pruefe('Y7 jede Empfehlung nennt einen Grund',
    empfLeiter().every(function (st) { return st.note && st.note.length > 8 && st.titel; }),
    empfLeiter().map(function (st) { return st.titel; }).join(' · '));

  // ── X · Die Kacheln sind wählbar (ADR 0066) ──────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  // Seit ADR 0075 teilt sich die Seite in «Meine Auswahl» und «Weitere
  // Übungen» — was oben steht, wiederholt sich unten nicht. Gezählt wird
  // darum über die ganze Seite, und dass nichts doppelt steht, ist Teil der
  // Zusage.
  function aufHome() {
    return alle('#main [data-uebung]').map(function (b) { return b.dataset.uebung; });
  }
  pruefe('X1 die Vorgabe zeigt alles, jede genau einmal',
    state.settings.homeAus.length === 0 && aufHome().length === 7 &&
    aufHome().filter(function (x, i) { return aufHome().indexOf(x) !== i; }).length === 0,
    aufHome().join());
  state.settings.homeAus = ['power', 'grammatik'];
  renderHome();
  pruefe('X2 Abgewähltes verschwindet',
    aufHome().length === 5 && aufHome().indexOf('power') === -1,
    aufHome().join());
  pruefe('X3 auch aus dem Fälligen',
    !q('#main [data-uebung="grammatik"]'));
  // Eine Gruppe, aus der alles weg ist, bekommt keine Überschrift über nichts.
  state.settings.homeAus = ['buchstaben'];
  renderHome();
  pruefe('X4 eine leere Gruppe hat keine Überschrift',
    alle('#homeAlle .gruppe-titel').map(function (p) { return p.textContent; }).indexOf('Zeichen') === -1,
    alle('#homeAlle .gruppe-titel').map(function (p) { return p.textContent; }).join());
  // **Und nichts Ausgeräumtes wird vorgeschlagen** — das wäre Widerspruch
  // statt Rat.
  pruefe('X5 Ausgeräumtes wird nicht empfohlen', empfehlung().ziel !== 'buchstaben',
    empfehlung().ziel);
  // **Vor dem Scheinwerfer gilt das nicht:** Acht Schritte zeigen auf je eine
  // Kachel, und ein Wähler ins Leere ist ein stiller Fehler.
  tutStarten(false);
  renderHome();
  pruefe('X6 im Tutorial stehen alle sieben da',
    alle('#homeAlle [data-uebung]').length === 7 && !!q('[data-uebung="buchstaben"]'),
    String(alle('#homeAlle [data-uebung]').length));
  tutEnde();
  // ── X7ff · Das Einrichte-Fenster (ADR 0075) ──────────────
  // Aus der Schalterreihe ist ein eigenes Fenster geworden: drei Rubriken,
  // eine Reihenfolge, und ein Weg zurück zur Automatik.
  state.settings.homeAus = [];
  state.settings.homeOben = null;
  einstReiter = 'darstellung';
  setTab('einstellungen');
  pruefe('X7 die Einstellungen führen ins Fenster', !!q('#zuEinrichten'));
  q('#zuEinrichten').click();
  pruefe('X7b es öffnet sich', currentTab === 'einrichten' && !!q('[data-liste="oben"]'));
  pruefe('X8 alle sieben stehen darin, jede genau einmal', (function () {
    var ids = alle('.einr-zeile').map(function (z) { return z.dataset.eid; });
    return ids.length === 7 && ids.filter(function (x, i) { return ids.indexOf(x) !== i; }).length === 0;
  })(), alle('.einr-zeile').map(function (z) { return z.dataset.eid; }).join());
  pruefe('X8b und es gibt drei Rubriken',
    alle('.einr-liste').length === 3 &&
    alle('.einr-liste').map(function (l) { return l.dataset.liste; }).join() ===
      'oben,weitere,versteckt');

  // Der Pfeil nach unten schiebt eine Rubrik weiter — bis ins Versteck.
  var vorher = einrRubrik('tippen');
  q('[data-runter="tippen"]').click();
  pruefe('X9 der Pfeil schiebt eine Rubrik weiter',
    einrRubrik('tippen') !== vorher, vorher + ' -> ' + einrRubrik('tippen'));
  while (einrRubrik('tippen') !== 'versteckt') q('[data-runter="tippen"]').click();
  pruefe('X9b ganz unten heißt versteckt',
    state.settings.homeAus.indexOf('tippen') !== -1 && !kachelSichtbar('tippen'),
    state.settings.homeAus.join());
  pruefe('X9c und am Anschlag ist der Pfeil zu',
    q('[data-runter="tippen"]').disabled === true);
  // Und wieder herauf.
  q('[data-hoch="tippen"]').click();
  pruefe('X10 der Weg zurück geht auch',
    einrRubrik('tippen') === 'weitere' && kachelSichtbar('tippen'),
    einrRubrik('tippen'));

  // **Von Hand hingezogen bleibt stehen** — auch ohne Arbeit. Das ist der
  // Unterschied zwischen «fällig» und «meine Auswahl».
  q('[data-hoch="tippen"]').click();
  pruefe('X10b oben angekommen', einrRubrik('tippen') === 'oben' &&
    state.settings.homeOben.indexOf('tippen') !== -1, String(state.settings.homeOben));
  setTab('home');
  pruefe('X10c die Kachel steht oben in «Meine Auswahl»',
    !!q('#main .gruppe-titel') &&
    main.textContent.indexOf('Meine Auswahl') !== -1 &&
    homeOben(null).indexOf('tippen') !== -1,
    homeOben(null).join());
  pruefe('X10d und nicht noch einmal unter «Weitere»',
    !q('#homeAlle [data-uebung="tippen"]'));
  pruefe('X10e der untere Bereich heißt jetzt «Weitere Übungen»',
    q('#homeAlleKnopf').textContent.indexOf('Weitere Übungen') !== -1,
    q('#homeAlleKnopf').textContent);

  // «Automatisch verteilen» gibt die obere Rubrik zurück an die App — das
  // Versteck aber nicht: Verstecken ist eine eigene Entscheidung.
  state.settings.homeAus = ['grammatik'];
  setTab('einrichten');
  q('#einrAuto').click();
  pruefe('X11 «Automatisch verteilen» stellt oben auf Automatik',
    state.settings.homeOben === null, String(state.settings.homeOben));
  pruefe('X11b und lässt das Versteckte versteckt',
    state.settings.homeAus.join() === 'grammatik', state.settings.homeAus.join());
  state.settings.homeAus = [];
  // Sie gehört zum Gerät, nicht zum Lernstand.
  state.settings.homeAus = ['tippen'];
  state.settings.homeOben = ['power'];
  pruefe('X12 sie steht nicht im Sicherungscode',
    (decodeBackup(encodeBackup()).settings.homeAus || []).length === 0 &&
    !decodeBackup(encodeBackup()).settings.homeOben,
    JSON.stringify((decodeBackup(encodeBackup()).settings || {}).homeAus));
  // Eine neue Übung taucht von selbst auf: Gespeichert wird das Abweichende,
  // nicht der Bestand (ADR 0066).
  pruefe('X12b eine unbekannte Kennung in der Auswahl fällt weg',
    homeOben(null).indexOf('gibtesnicht') === -1, (function () {
      state.settings.homeOben = ['power', 'gibtesnicht'];
      return homeOben(null).join();
    })());
  state = defaultState();
  ansichtenZuruecksetzen();

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

writeFileSync(BAU + '/t-rubriken.html', testseite(html, test));
console.log('Rubriken-Testseite geschrieben');
