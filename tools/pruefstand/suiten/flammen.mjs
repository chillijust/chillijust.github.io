// Prüft die Fortschrittsreihe: Strich am Anfang, danach eine Flamme, die mit
// der Stufe wächst — und nur die goldene flackert.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

// Eine Reihe aller fünf Stände in ein Übungsfeld hängen und ausmessen.
function reihe() {
  var w = document.createElement('div');
  w.className = 'paket-punkte';
  var h = '';
  for (var i = 0; i <= BOX_MAX; i++) h += ppHtml(i);
  w.innerHTML = h;
  main.appendChild(w);
  return w;
}
function hoehe(el) { return el.getBoundingClientRect().height; }

try {
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');

  var w = reihe();
  var pp = Array.prototype.slice.call(w.children);

  // ── A · Was steht da überhaupt ────────────────────────────
  pruefe('A1 fünf Zeichen, eines je Stufe', pp.length === BOX_MAX + 1, String(pp.length));
  pruefe('A2 die Null bleibt ein Strich — ohne Bild',
    !pp[0].querySelector('svg') && pp[0].classList.contains('s0'));
  pruefe('A3 ab der ersten Stufe brennt eine Flamme',
    pp.slice(1).every(function (p) { return !!p.querySelector('svg'); }));
  pruefe('A4 und es ist dieselbe Flamme wie im Knopf',
    pp[BOX_MAX].querySelector('.flamme-aussen') && pp[BOX_MAX].querySelector('.flamme-innen'));
  pruefe('A5 die Pfade stehen nur einmal im Quelltext',
    FLAMME_PFADE.length > 100 && ICON.flamme.indexOf(FLAMME_PFADE) !== -1 &&
    ICON.flammeEng.indexOf(FLAMME_PFADE) !== -1);
  pruefe('A6 der enge Ausschnitt ist enger als der weite',
    ICON.flammeEng.indexOf('viewBox="0 0 24 24"') === -1 &&
    ICON.flamme.indexOf('viewBox="0 0 24 24"') !== -1);

  // ── B · Die Flamme wächst mit der Stufe ───────────────────
  var hs = pp.map(function (p) {
    var s = p.querySelector('svg');
    return s ? hoehe(s) : 0;
  });
  var waechst = true;
  for (var i = 2; i <= BOX_MAX; i++) if (!(hs[i] > hs[i - 1])) waechst = false;
  pruefe('B1 jede Stufe ist höher als die vorige', waechst, hs.join(' < '));
  pruefe('B2 Gold ist die größte', hs[BOX_MAX] === Math.max.apply(null, hs), String(hs[BOX_MAX]));
  pruefe('B3 auch in der Breite', (function () {
    var br = pp.slice(1).map(function (p) { return p.querySelector('svg').getBoundingClientRect().width; });
    for (var j = 1; j < br.length; j++) if (!(br[j] > br[j - 1])) return false;
    return true;
  })());
  pruefe('B4 der Strich bleibt flach — flacher als jede Flamme',
    hoehe(pp[0]) < hs[1], hoehe(pp[0]) + ' / ' + hs[1]);

  // ── C · Alle stehen auf einer Linie ───────────────────────
  // Eine Flamme wächst nach oben; wüchse sie um ihre Mitte, hinge der Strich
  // in der Luft. Der Boden ist die gemeinsame Kante.
  var boeden = pp.map(function (p) { return Math.round(p.getBoundingClientRect().bottom); });
  pruefe('C1 alle Zeichen enden auf derselben Höhe',
    boeden.every(function (b) { return b === boeden[0]; }), boeden.join(' '));
  pruefe('C2 die Reihe richtet sich unten aus',
    ['end', 'flex-end'].indexOf(getComputedStyle(w).alignItems) !== -1,
    getComputedStyle(w).alignItems);
  // Der Drehpunkt liegt im unteren Viertel: Eine Flamme wächst aus ihrem Fuß,
  // sie dehnt sich nicht um ihre Mitte.
  pruefe('C3 und die Flamme wächst aus ihrem Fuß', (function () {
    var pfad = pp[BOX_MAX].querySelector('.flamme-aussen');
    var teile = getComputedStyle(pfad).transformOrigin.split(' ');
    var y = parseFloat(teile[1]);
    var kasten = pfad.getBBox();
    return y > kasten.y + kasten.height * 0.75;
  })(), getComputedStyle(pp[BOX_MAX].querySelector('.flamme-aussen')).transformOrigin);

  // ── D · Geflackert wird nur in Gold ───────────────────────
  function flackert(p) {
    var a = p.querySelector('.flamme-aussen');
    return !!a && getComputedStyle(a).animationName === 'flackern';
  }
  pruefe('D1 die goldene Flamme flackert', flackert(pp[BOX_MAX]));
  pruefe('D2 die Zwischenstufen stehen still',
    pp.slice(1, BOX_MAX).every(function (p) { return !flackert(p); }));
  pruefe('D3 die Flamme im Knopf flackert weiterhin', (function () {
    var k = q('#menuKnopf .punkt .flamme-aussen');
    return !!k && getComputedStyle(k).animationName === 'flackern';
  })());
  pruefe('D4 benachbarte Flammen haben einen eigenen Takt', (function () {
    var v = pp.map(function (p) {
      var a = p.querySelector('.flamme-aussen');
      return a ? getComputedStyle(a).animationDelay : '';
    }).filter(Boolean);
    var einzeln = {};
    v.forEach(function (x) { einzeln[x] = 1; });
    return Object.keys(einzeln).length > 1;
  })());

  // ── E · Die Farben der Stufen bleiben, wie sie waren ──────
  function farbe(p) {
    var s = p.querySelector('svg');
    return getComputedStyle(s).color;
  }
  var wurzel = getComputedStyle(document.documentElement);
  function tokenFarbe(name) {
    var d = document.createElement('span');
    d.style.color = 'var(' + name + ')';
    document.body.appendChild(d);
    var c = getComputedStyle(d).color;
    d.remove();
    return c;
  }
  pruefe('E1 Stufe 1 trägt --dim', farbe(pp[1]) === tokenFarbe('--dim'), farbe(pp[1]));
  pruefe('E2 Stufe 2 und 3 tragen --ice',
    farbe(pp[2]) === tokenFarbe('--ice') && farbe(pp[3]) === tokenFarbe('--ice'), farbe(pp[2]));
  pruefe('E3 Stufe 2 ist die blassere von beiden',
    parseFloat(getComputedStyle(pp[2].querySelector('svg')).opacity) <
    parseFloat(getComputedStyle(pp[3].querySelector('svg')).opacity));
  // **Die Endstufe trägt seit ADR 0088 Glut, nicht den Akzent** — außen rot,
  // innen der helle Kern. In «Dark» gehört das zur Palette; in den hellen
  // Schemata entscheidet der Schalter.
  pruefe('E4 Stufe 4 trägt die Glut', farbe(pp[BOX_MAX]) === tokenFarbe('--flamme'),
    farbe(pp[BOX_MAX]) + ' / ' + tokenFarbe('--flamme'));
  pruefe('E4b und einen helleren Kern darin',
    getComputedStyle(pp[BOX_MAX].querySelector('.flamme-innen')).color ===
      tokenFarbe('--flamme-kern'),
    getComputedStyle(pp[BOX_MAX].querySelector('.flamme-innen')).color);
  pruefe('E4c sie ist größer als die Stufe darunter',
    parseFloat(getComputedStyle(pp[BOX_MAX].querySelector('svg')).height) >
    parseFloat(getComputedStyle(pp[BOX_MAX - 1].querySelector('svg')).height),
    getComputedStyle(pp[BOX_MAX].querySelector('svg')).height);
  // **In einem hellen Schema steht sie nur auf Ansage** (ADR 0088).
  var schemaVorherF = state.settings.schema;
  state.settings.schema = 'rosa';
  state.settings.flammeHell = false;
  updateDarstellung();
  pruefe('E4d hell und ohne Schalter: der ruhige Akzent',
    farbe(pp[BOX_MAX]) === tokenFarbe('--akzent'), farbe(pp[BOX_MAX]));
  state.settings.flammeHell = true;
  updateDarstellung();
  pruefe('E4e mit Schalter auch dort die Glut',
    farbe(pp[BOX_MAX]) === tokenFarbe('--flamme'), farbe(pp[BOX_MAX]));
  state.settings.schema = schemaVorherF;
  state.settings.flammeHell = false;
  updateDarstellung();
  pruefe('E5 der Strich trägt --line',
    getComputedStyle(pp[0]).backgroundColor === tokenFarbe('--line'),
    getComputedStyle(pp[0]).backgroundColor);
  w.remove();

  // ── F · Alle vier Reihen gehen durch dieselbe Hand ────────
  function zaehle(id, code) {
    code();
    var r = alle('.paket-punkte .pp');
    var mitBild = r.filter(function (p) { return !!p.querySelector('svg'); }).length;
    pruefe(id + ' hat eine Reihe', r.length > 0, String(r.length));
    return mitBild;
  }
  ALL_VOCAB.forEach(function (v, i) { state.boxes[v.id] = (i % BOX_MAX) + 1; });
  pruefe('F1 «Lernsets» brennt', zaehle('F1', function () {
    uebAuswahl = 0; setTab('lernsets');
  }) > 0);
  ALPHABET.forEach(function (b, i) { state.abcBox[b[1]] = (i % BOX_MAX) + 1; });
  pruefe('F2 «Buchstaben» brennt', zaehle('F2', function () {
    abcAnsicht = 'ueben'; abcQ = null; setTab('buchstaben');
  }) > 0);
  GRAMMATIK.forEach(function (x, i) {
    state.gramBox[x.id] = (i % BOX_MAX) + 1;
    state.gramSeen[x.id] = 0;   // lange her, also fällig — sonst steht dort der Leerzustand
  });
  pruefe('F3 «Grammatik» brennt', zaehle('F3', function () {
    gramBaustein = null; gramQ = null; setTab('grammatik');
  }) > 0);
  // Power-Training: drei zurückgefallene Wörter, eine halbe Runde.
  state = defaultState();
  ALL_VOCAB.slice(0, 4).forEach(function (v) {
    state.boxes[v.id] = SATZ_STUFE - 1; state.patzer[v.id] = 1;
  });
  setTab('power');
  if (ptSatz) { ptSatz[0].treffer = PT_RUNDEN; render(); }
  pruefe('F4 «Power-Training» brennt bei einem Treffer',
    alle('.paket-punkte .pp.s' + BOX_MAX + ' svg').length >= PT_RUNDEN,
    String(alle('.paket-punkte .pp svg').length));
  pruefe('F5 und lässt die offenen Runden als Strich stehen',
    alle('.paket-punkte .pp.s0').length > 0 &&
    alle('.paket-punkte .pp.s0 svg').length === 0);

  // ── G · Die Reihe verträgt Unfug ──────────────────────────
  // ── H · Der Takt bleibt über den Umbruch hinweg ───────────
  // In einer Flexbox verteilt die letzte Zeile den Restplatz unter ihre paar
  // Zeichen — die Flammen stünden dort weiter auseinander als darüber. Genau
  // das war der Befund am Gerät.
  state = defaultState();
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
  abcAnsicht = 'ueben'; abcQ = null; setTab('buchstaben');
  // Auf Handybreite festnageln, damit die Reihe umbricht — sonst hinge die
  // Prüfung am Fenster des Testbrowsers.
  q('.paket-punkte').style.width = '300px';
  var reihe33 = alle('.paket-punkte .pp');
  var kasten = reihe33.map(function (p) { return p.getBoundingClientRect(); });
  pruefe('H1 alle 33 Buchstaben stehen da', reihe33.length === ALPHABET.length,
    String(reihe33.length));
  pruefe('H2 und brauchen mehr als eine Zeile', (function () {
    var oben = {};
    kasten.forEach(function (k) { oben[Math.round(k.top)] = 1; });
    return Object.keys(oben).length > 1;
  })());
  pruefe('H3 jedes Fach ist gleich breit', (function () {
    var b = kasten.map(function (k) { return Math.round(k.width * 10); });
    return b.every(function (x) { return x === b[0]; });
  })(), kasten.map(function (k) { return k.width.toFixed(1); }).join(' ').slice(0, 60));
  pruefe('H4 der Abstand ist überall derselbe — auch in der letzten Zeile', (function () {
    var zeilen = {};
    kasten.forEach(function (k) {
      var y = Math.round(k.top);
      (zeilen[y] = zeilen[y] || []).push(k.left);
    });
    var takte = [];
    Object.keys(zeilen).forEach(function (y) {
      var xs = zeilen[y].sort(function (a, b) { return a - b; });
      for (var j = 1; j < xs.length; j++) takte.push(Math.round((xs[j] - xs[j - 1]) * 10));
    });
    return takte.every(function (t) { return t === takte[0]; });
  })());
  pruefe('H5 jede Zeile fängt am selben Rand an', (function () {
    var zeilen = {};
    kasten.forEach(function (k) {
      var y = Math.round(k.top);
      zeilen[y] = Math.min(zeilen[y] === undefined ? 1e9 : zeilen[y], Math.round(k.left));
    });
    var v = Object.keys(zeilen).map(function (y) { return zeilen[y]; });
    return v.every(function (x) { return x === v[0]; });
  })());
  pruefe('H6 und nichts steht über den Rand hinaus',
    document.documentElement.scrollWidth <= window.innerWidth + 1,
    document.documentElement.scrollWidth + ' / ' + window.innerWidth);

  pruefe('G1 ohne Angabe kommt der Strich', ppHtml().indexOf('s0') !== -1);
  pruefe('G2 eine zu große Stufe wird gekappt',
    ppHtml(99).indexOf('s' + BOX_MAX) !== -1, ppHtml(99));
  pruefe('G3 eine negative auch', ppHtml(-3).indexOf('s0') !== -1, ppHtml(-3));
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

writeFileSync(BAU + '/t-flammen.html', testseite(html, test));
console.log('Flammen-Testseite geschrieben');
