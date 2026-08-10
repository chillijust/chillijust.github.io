// Prüft die Farbschemata: eine Liste statt zweier Achsen (ADR 0039).
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }

function stil(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
// rgb(…) oder #… zu Zahlen. Erst auf die Raute prüfen: «#8B93A1» enthält
// Ziffern, und eine Ziffernsuche macht daraus 8, 93, 1.
function kanaele(farbe) {
  if (farbe.charAt(0) === '#') {
    var h = farbe.slice(1);
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) +
      h.charAt(2) + h.charAt(2);
    return [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
  }
  var m = farbe.match(/\d+/g);
  return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
}
// WCAG-Kontrast — die Zahl, die zählt, wenn eine Palette taugen soll.
function leuchte(c) {
  var v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function kontrast(a, b) {
  var ka = kanaele(a), kb = kanaele(b);
  function L(k) { return 0.2126 * leuchte(k[0]) + 0.7152 * leuchte(k[1]) + 0.0722 * leuchte(k[2]); }
  var la = L(ka), lb = L(kb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function setze(schema) {
  state.settings.schema = schema;
  updateDarstellung();
}
var HELL = ['classic', 'gruen', 'blau', 'rosa'];
var ALLE = ['dark'].concat(HELL);

try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Die Liste ─────────────────────────────────────────
  pruefe('A1 die Vorgabe ist «dark»', state.settings.schema === 'dark',
    state.settings.schema);
  pruefe('A2 es gibt fünf Schemata', SCHEMATA.length === 5,
    SCHEMATA.map(function (t) { return t.wert; }).join(','));
  pruefe('A3 alle fünf sind dabei',
    ALLE.every(function (w) {
      return SCHEMATA.some(function (t) { return t.wert === w; });
    }));
  pruefe('A4 jedes nennt seinen Grund als Zahl',
    SCHEMATA.every(function (t) { return /^#[0-9A-F]{6}$/.test(t.grund); }));
  pruefe('A5 ein unbekanntes fällt auf «dark» zurück', schemaVon('lila').wert === 'dark');
  pruefe('A6 «Darstellung» gibt es nicht mehr',
    defaultSettings().darstellung === undefined && defaultSettings().farbe === undefined);

  // ── B · Das Attribut am Wurzelelement ─────────────────────
  var wurzel = document.documentElement;
  setze('dark');
  pruefe('B1 «dark» trägt kein Attribut', !wurzel.hasAttribute('data-schema'));
  setze('gruen');
  pruefe('B2 ein helles Schema trägt eines',
    wurzel.getAttribute('data-schema') === 'gruen');
  setze('dark');
  pruefe('B3 zurück auf «dark» räumt es weg', !wurzel.hasAttribute('data-schema'));
  pruefe('B4 die alten Achsen sind weg',
    !wurzel.hasAttribute('data-theme') && !wurzel.hasAttribute('data-farbe'));

  // Die Kachel liegt in **jedem** Schema über dem Grund, und darüber liegt
  // card-2 — es trägt Chips, Schalter und Tasten (ADR 0041).
  var summe = function (v) {
    return kanaele(stil(v)).reduce(function (a, b) { return a + b; });
  };
  pruefe('B5 die Kachel liegt überall über dem Grund',
    ALLE.every(function (f) { setze(f); return summe('--card') > summe('--bg'); }),
    (function () { setze('dark'); return stil('--card') + ' über ' + stil('--bg'); })());
  // card-2 trägt Chips, Schalter und Tasten. In welche Richtung es von der
  // Kachel abrückt, entscheidet das Schema — in «Dark» nach oben, in den
  // hellen nach unten. Verlangt ist nur, dass es überhaupt abrückt.
  pruefe('B6 card-2 ist von der Kachel zu unterscheiden',
    ALLE.every(function (f) {
      setze(f);
      return Math.abs(summe('--card-2') - summe('--card')) >= 12;
    }), (function () { setze('dark'); return stil('--card-2') + ' neben ' + stil('--card'); })());

  // ── C · Fünf Schemata, fünf Erscheinungen ─────────────────
  var gruende = {};
  ALLE.forEach(function (f) { setze(f); gruende[f] = stil('--bg'); });
  var werte = ALLE.map(function (k) { return gruende[k]; });
  pruefe('C1 fünf verschiedene Gründe',
    werte.filter(function (v, i) { return werte.indexOf(v) === i; }).length === 5,
    werte.join(' '));

  setze('dark');
  pruefe('C2 «dark» ist dunkel',
    (function () { var k = kanaele(gruende.dark); return (k[0] + k[1] + k[2]) / 3 < 60; })());
  pruefe('C3 die vier übrigen sind hell',
    HELL.every(function (f) {
      var k = kanaele(gruende[f]);
      return (k[0] + k[1] + k[2]) / 3 > 200;
    }), HELL.map(function (f) {
      var k = kanaele(gruende[f]);
      return f + ':' + Math.round((k[0] + k[1] + k[2]) / 3);
    }).join(' '));

  pruefe('C4 die hellen sind auseinanderzuhalten',
    (function () {
      for (var i = 0; i < HELL.length; i++) {
        for (var j = i + 1; j < HELL.length; j++) {
          var a = kanaele(gruende[HELL[i]]), b = kanaele(gruende[HELL[j]]);
          var abstand = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
          if (abstand < 12) return HELL[i] + '/' + HELL[j] + ' zu nah (' + abstand + ')';
        }
      }
      return true;
    })() === true);

  // ── D · Nur die Flächen wandern ───────────────────────────
  setze('classic');
  var neutral = {};
  ['--text', '--dim', '--gold', '--good', '--bad', '--ice'].forEach(function (v) {
    neutral[v] = stil(v);
  });
  pruefe('D1 Schrift und Signalfarben sind in allen hellen Schemata gleich',
    HELL.every(function (f) {
      setze(f);
      return Object.keys(neutral).every(function (v) { return stil(v) === neutral[v]; });
    }));
  pruefe('D2 die Flächen dagegen wandern',
    ['--bg', '--card', '--card-2', '--line', '--glow'].every(function (v) {
      setze('gruen');
      var getoent = stil(v);
      setze('classic');
      return getoent !== stil(v);
    }));

  // ── E · Die Kachel steht vom Grund ab ─────────────────────
  // Der Wunsch war ausdrücklich mehr Kontrast zwischen Kachel und Grund —
  // vorher lag er bei 1,09 und war kaum zu sehen.
  var schwaechste = 99, wo = '';
  ALLE.forEach(function (f) {
    setze(f);
    var k = kontrast(stil('--card'), stil('--bg'));
    if (k < schwaechste) { schwaechste = k; wo = f; }
  });
  pruefe('E1 die Kachel hebt sich vom Grund ab', schwaechste >= 1.15,
    schwaechste.toFixed(3) + ' bei ' + wo);

  // ── F · Lesbar bleibt lesbar ──────────────────────────────
  // Seit dem Abdunkeln (ADR 0042) wird gegen feste Grenzen gemessen, nicht
  // gegen «classic»: Der Maßstab ist selbst mitgewandert, und die Zahlen
  // stehen heute über denen von vorher.
  var PAARE = [['--text', '--bg'], ['--text', '--card'], ['--dim', '--bg'],
    ['--gold', '--card'], ['--good', '--card'], ['--bad', '--card'], ['--ice', '--card']];

  function messe(f) {
    setze(f);
    return PAARE.map(function (paar) { return kontrast(stil(paar[0]), stil(paar[1])); });
  }

  // Gemessen wird der **anteilige** Verlust: 0,7 weniger bei einem Kontrast von
  // 13 ist belanglos, 0,3 weniger bei 3,5 wäre es nicht.
  var grund = messe('classic');
  var schlimmster = 0, woV = '';
  ['gruen', 'blau', 'rosa'].forEach(function (f) {
    messe(f).forEach(function (k, i) {
      var verlust = (grund[i] - k) / grund[i];
      if (verlust > schlimmster) {
        schlimmster = verlust;
        woV = f + ' ' + PAARE[i].join(' auf ') + ': ' +
          grund[i].toFixed(2) + ' → ' + k.toFixed(2);
      }
    });
  });
  pruefe('F1 keine Farbe verschlechtert den Kontrast merklich',
    schlimmster < 0.1, 'größter Verlust ' + (schlimmster * 100).toFixed(1) + ' %' +
    (woV ? ' bei ' + woV : ''));

  // Die Bedienfläche trägt kleine Schrift — Chips, Schalter, Tastenkappen.
  // Vor dem Abdunkeln stand «dim» dort bei 2,8 und Gold bei 2,6.
  var KLEIN = [['--dim', '--card-2'], ['--gold', '--card-2'],
    ['--dim', '--bg'], ['--dim', '--card'], ['--gold', '--card']];
  var kleinste = 99, woK = '';
  HELL.forEach(function (f) {
    setze(f);
    KLEIN.forEach(function (paar) {
      var k = kontrast(stil(paar[0]), stil(paar[1]));
      if (k < kleinste) { kleinste = k; woK = f + ' ' + paar.join(' auf '); }
    });
  });
  pruefe('F1b auch auf der Bedienfläche bleibt Kleines lesbar',
    kleinste >= 3, kleinste.toFixed(2) + ' bei ' + woK);
  pruefe('F1c und «dim» hält überall AA', (function () {
    var m = 99;
    HELL.forEach(function (f) {
      setze(f);
      ['--bg', '--card', '--card-2'].forEach(function (fl) {
        m = Math.min(m, kontrast(stil('--dim'), stil(fl)));
      });
    });
    return m >= 4.5 ? true : m.toFixed(2);
  })() === true);

  var schlechteste = 99, woAbs = '';
  ALLE.forEach(function (f) {
    messe(f).forEach(function (k, i) {
      if (k < schlechteste) { schlechteste = k; woAbs = f + ' ' + PAARE[i].join(' auf '); }
    });
  });
  pruefe('F2 nichts fällt unter die Grenze für große Schrift (3,0)',
    schlechteste >= 3, schlechteste.toFixed(2) + ' bei ' + woAbs);

  var text = 99;
  ALLE.forEach(function (f) {
    setze(f);
    text = Math.min(text, kontrast(stil('--text'), stil('--bg')),
      kontrast(stil('--text'), stil('--card')));
  });
  pruefe('F3 die Lesetexte bleiben weit über AA (4,5)', text >= 4.5, text.toFixed(2));

  // ── G · Die Statusleiste folgt ────────────────────────────
  var meta = q('meta[name="theme-color"]');
  pruefe('G1 jedes Schema färbt sie mit seinem Grund',
    ALLE.every(function (f) {
      setze(f);
      return meta.getAttribute('content') === schemaVon(f).grund;
    }), meta.getAttribute('content'));
  setze('dark');
  pruefe('G2 «dark» nennt seinen Grund', meta.getAttribute('content') === '#1A1A18',
    meta.getAttribute('content'));

  // Ein aufgeklapptes Blatt liegt über der Seite: in «Dark» der Grund, in den
  // hellen die Kachel (ADR 0042).
  setze('dark');
  pruefe('G4 in «Dark» trägt das Blatt den Grund',
    kanaele(stil('--blatt')).join(',') === kanaele(stil('--bg')).join(','), stil('--blatt'));
  pruefe('G5 in den hellen die Kachel',
    HELL.every(function (f) {
      setze(f);
      return kanaele(stil('--blatt')).join(',') === kanaele(stil('--card')).join(',');
    }));
  // Was nützt die Angabe, wenn kein Blatt sie nimmt: Menü und Auswahl teilen
  // sich dieselbe Klasse, und dort muss sie ankommen.
  setze('dark');
  pruefe('G6 die Blätter nehmen sie auch',
    alle('.menuinhalt').length >= 2 &&
    alle('.menuinhalt').every(function (el) {
      return kanaele(getComputedStyle(el).backgroundColor).join(',') ===
        kanaele(stil('--blatt')).join(',');
    }), alle('.menuinhalt').length + ' Blätter, erstes ' +
    (alle('.menuinhalt')[0] ? getComputedStyle(alle('.menuinhalt')[0]).backgroundColor : '—'));
  setze('dark');
  pruefe('G3 und die Zahl stimmt mit dem Stylesheet überein',
    ALLE.every(function (f) {
      setze(f);
      return kanaele(stil('--bg')).join(',') === kanaele(schemaVon(f).grund).join(',');
    }), (function () { setze('dark'); return stil('--bg') + ' / ' + schemaVon('dark').grund; })());
  setze('dark');

  // ── H · In den Einstellungen ──────────────────────────────
  setTab('einstellungen');
  // Das Farbschema steht seit den Reitern auf «Darstellung».
  einstReiter = 'darstellung';
  renderEinstellungen();
  pruefe('H1 die Zeile steht da', !!q('[data-wahltext="schema"]'));
  pruefe('H2 mit fünf Knöpfen', alle('[data-wahltext="schema"]').length === 5,
    String(alle('[data-wahltext="schema"]').length));
  pruefe('H3 «Dark» ist gewählt',
    alle('[data-wahltext="schema"]').filter(function (b) {
      return b.classList.contains('active');
    })[0].dataset.wert === 'dark');
  pruefe('H4 eine zweite Achse gibt es nicht mehr',
    !q('[data-wahltext="darstellung"]') && !q('[data-wahltext="farbe"]'));

  var rosaKnopf = alle('[data-wahltext="schema"]').filter(function (b) {
    return b.dataset.wert === 'rosa';
  })[0];
  tippe(rosaKnopf);
  pruefe('H5 ein Tipp legt es um', state.settings.schema === 'rosa');
  pruefe('H6 und wirkt sofort', wurzel.getAttribute('data-schema') === 'rosa');

  // ── I · Der Sicherungscode ────────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  state.settings.schema = 'blau';
  state.settings.ton = true;
  var code = encodeBackup();
  var zurueck = mergeState(decodeBackup(code));
  pruefe('I1 das Schema kommt zurück', zurueck.settings.schema === 'blau',
    zurueck.settings.schema);
  pruefe('I2 und die übrigen Schalter bleiben heil',
    zurueck.settings.ton === true && zurueck.settings.tastaturAuto === true);

  // Jedes Schema übersteht die Reise.
  pruefe('I3 alle fünf überstehen den Code',
    ALLE.every(function (f) {
      state.settings.schema = f;
      return mergeState(decodeBackup(encodeBackup())).settings.schema === f;
    }));
  state.settings.schema = 'dark';

  // Ein Code von vor ADR 0039: an Stelle 4 und 5 stehen noch die zwei Achsen,
  // das Schemafeld fehlt.
  function alterCode(darstellung, farbe) {
    var teile = encodeBackup().split('~');
    var e = teile[5].split('.');
    e[3] = String(darstellung);
    e[4] = String(farbe);
    e.pop();                                 // das Schemafeld gab es noch nicht
    teile[5] = e.join('.');
    var alt = teile.slice(0, -1).join('~');
    return alt + '~' + bkPruefsumme(alt);
  }
  var m1 = mergeState(decodeBackup(alterCode(2, 0)));   // hell · nacht
  pruefe('I4 «hell · nacht» wird zu «classic»', m1.settings.schema === 'classic',
    m1.settings.schema);
  var m2 = mergeState(decodeBackup(alterCode(1, 2)));   // dunkel · blau
  pruefe('I5 ein Farbton wiegt schwerer als dunkel', m2.settings.schema === 'blau',
    m2.settings.schema);
  var m3 = mergeState(decodeBackup(alterCode(0, 0)));   // system · nacht
  pruefe('I6 «system · nacht» wird zu «dark»', m3.settings.schema === 'dark',
    m3.settings.schema);

  // Ein Code ohne jede Angabe — dann gilt die Vorgabe.
  var teile = encodeBackup().split('~');
  var ee = teile[5].split('.');
  ee.length = 3;
  teile[5] = ee.join('.');
  var kurz = teile.slice(0, -1).join('~');
  var m4 = mergeState(decodeBackup(kurz + '~' + bkPruefsumme(kurz)));
  pruefe('I7 ohne Angabe gilt «dark»', m4.settings.schema === 'dark', m4.settings.schema);

  // ── J · Alte Lernstände im Speicher ───────────────────────
  pruefe('J1 ein unsinniges Schema wird verworfen',
    mergeState({ settings: { schema: 'neon' } }).settings.schema === 'dark');
  pruefe('J2 ein alter Stand mit Farbton nimmt ihn mit',
    mergeState({ settings: { darstellung: 'dunkel', farbe: 'rosa' } }).settings.schema === 'rosa');
  pruefe('J3 ein alter heller Stand wird «classic»',
    mergeState({ settings: { darstellung: 'hell', farbe: 'nacht' } }).settings.schema === 'classic');
  pruefe('J4 ein alter dunkler Stand bleibt dunkel',
    mergeState({ settings: { darstellung: 'dunkel', farbe: 'nacht' } }).settings.schema === 'dark');
  pruefe('J5 ein Stand ganz ohne Einstellungen auch',
    mergeState({}).settings.schema === 'dark');
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

writeFileSync(BAU + '/t-farbton.html', testseite(html, test));
console.log('Farbschema-Testseite geschrieben');
