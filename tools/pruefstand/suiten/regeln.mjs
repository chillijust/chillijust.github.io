// Prüft die vier neuen Grammatik-Bausteine: Mehrzahl, Genitiv, Übereinstimmung,
// Vergangenheit — die Formen selbst und die Übung darum herum.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
// Einen Baustein aufschlagen und die Übung dazu zeichnen.
function oeffne(id, stufe) {
  state = defaultState();
  ansichtenZuruecksetzen();
  GRAMMATIK.forEach(function (b) {
    state.gramSeen[b.id] = Date.now();
    state.gramBox[b.id] = BOX_MAX;
  });
  state.gramBox[id] = stufe === undefined ? 0 : stufe;
  gramWahl = id; gramBaustein = null; gramQ = null;
  setTab('grammatik');
  return gramFinde(id);
}
function probe(name, paare, bauen) {
  var falsch = [];
  Object.keys(paare).forEach(function (k) {
    var ist = bauen(k);
    if (ist !== paare[k]) falsch.push(k + ' → ' + ist + ' statt ' + paare[k]);
  });
  pruefe(name, falsch.length === 0, falsch.join(' · '));
}

try {
  // ── A · Die Formen selbst ─────────────────────────────────
  probe('A1 Mehrzahl: hart nimmt ы, weich и, sächlich tauscht', {
    'стол': 'столы', 'билет': 'билеты', 'музей': 'музеи', 'книга': 'книги',
    'газета': 'газеты', 'кухня': 'кухни', 'дверь': 'двери', 'окно': 'окна',
    'море': 'моря', 'сумка': 'сумки', 'улица': 'улицы', 'ключ': 'ключи'
  }, function (w) { return plural(w, VOKABEL[w] ? VOKABEL[w].art : 'm'); });

  pruefe('A2 nach к г х ж ч ш щ nie ы',
    ['книги', 'сумки', 'аптеки', 'ключи'].every(function (f, i) {
      return plural(['книга', 'сумка', 'аптека', 'ключ'][i], 'w') === f;
    }));
  pruefe('A3 die Ausnahmen kommen aus den Daten',
    plural('дом', 'm') === 'дома' && plural('брат', 'mb') === 'братья' &&
    plural('ребёнок', 'mb') === 'дети', plural('дом', 'm'));

  probe('A4 Genitiv', {
    'хлеб': 'хлеба', 'стол': 'стола', 'музей': 'музея', 'окно': 'окна',
    'море': 'моря', 'книга': 'книги', 'газета': 'газеты', 'кухня': 'кухни',
    'дверь': 'двери', 'соль': 'соли', 'вода': 'воды', 'Россия': 'России'
  }, function (w) { return genitiv(w, VOKABEL[w] ? VOKABEL[w].art : 'm'); });
  pruefe('A5 flüchtige Vokale stehen in den Daten',
    genitiv('день', 'm') === 'дня' && genitiv('время', 's') === 'времени',
    genitiv('день', 'm'));

  probe('A6 Vergangenheit: männlich', {
    'читать': 'читал', 'работать': 'работал', 'писать': 'писал', 'быть': 'был',
    'жить': 'жил', 'смотреть': 'смотрел', 'говорить': 'говорил'
  }, function (w) { return praeteritum(w, 'm'); });
  pruefe('A7 und die vier Endungen',
    praeteritum('читать', 'm') === 'читал' && praeteritum('читать', 'w') === 'читала' &&
    praeteritum('читать', 's') === 'читало' && praeteritum('читать', 'p') === 'читали');
  pruefe('A8 rückbezüglich hängt sich an',
    praeteritum('учиться', 'm') === 'учился' && praeteritum('учиться', 'w') === 'училась',
    praeteritum('учиться', 'w'));
  pruefe('A9 was nicht auf -ть endet, steht in den Daten',
    praeteritum('идти', 'm') === 'шёл' && praeteritum('идти', 'w') === 'шла' &&
    praeteritum('есть', 'p') === 'ели' && praeteritum('мочь', 'w') === 'могла',
    praeteritum('идти', 'm'));

  probe('B1 Adjektiv weiblich', {
    'новый': 'новая', 'большой': 'большая', 'маленький': 'маленькая',
    'хороший': 'хорошая', 'синий': 'синяя', 'дорогой': 'дорогая'
  }, function (w) { return adjektiv(w, 'w'); });
  probe('B2 Adjektiv sächlich', {
    'новый': 'новое', 'большой': 'большое', 'маленький': 'маленькое',
    'хороший': 'хорошее', 'синий': 'синее', 'горячий': 'горячее'
  }, function (w) { return adjektiv(w, 's'); });
  probe('B3 Adjektiv Mehrzahl', {
    'новый': 'новые', 'молодой': 'молодые', 'большой': 'большие',
    'маленький': 'маленькие', 'хороший': 'хорошие', 'синий': 'синие',
    'дорогой': 'дорогие'
  }, function (w) { return adjektiv(w, 'p'); });
  pruefe('B4 die männliche Form ist die Grundform', adjektiv('новый', 'm') === 'новый');
  pruefe('B5 was kein Adjektiv ist, gibt nichts zurück',
    adjektiv('дом', 'w') === null && adjektiv('холодно', 'w') === null);

  // ── C · Die eine Tür nach draußen ─────────────────────────
  pruefe('C1 grammForm kennt die neuen Rollen',
    grammForm('книга', 'w', 'plural') === 'книги' &&
    grammForm('книга', 'w', 'gen') === 'книги' &&
    grammForm('читать', 'v', 'praetw') === 'читала' &&
    grammForm('новый', 'a', 'adjs') === 'новое');
  pruefe('C2 und weist die falsche Wortart ab',
    grammForm('читать', 'v', 'plural') === null &&
    grammForm('книга', 'w', 'adjw') === null &&
    grammForm('книга', 'w', 'praetm') === null);

  // ── D · Zehn Bausteine, alle erreichbar ───────────────────
  pruefe('D1 es gibt zehn Regeln', GRAMMATIK.length === 10, String(GRAMMATIK.length));
  pruefe('D2 jede hat eine bekannte Aufgabe',
    GRAMMATIK.every(function (b) {
      return ['geschlecht', 'akk', 'praep', 'gen', 'plural', 'praes', 'ichform',
        'praet', 'adj'].indexOf(b.aufgabe) !== -1;
    }));
  pruefe('D3 jede findet Wörter zum Üben',
    GRAMMATIK.every(function (b) {
      state = defaultState();
      return gramWortPool(b).length >= 4;
    }), GRAMMATIK.filter(function (b) {
      state = defaultState();
      return gramWortPool(b).length < 4;
    }).map(function (b) { return b.id; }).join(','));
  pruefe('D4 und stellt eine Gegenüberstellung auf',
    GRAMMATIK.every(function (b) {
      state = defaultState();
      var paare = gramPaare(b);
      return paare.length >= 3 && paare.every(function (p) { return p.links && p.rechts; });
    }), GRAMMATIK.filter(function (b) {
      state = defaultState();
      return gramPaare(b).length < 3;
    }).map(function (b) { return b.id; }).join(','));

  // ── E · Die Mehrzahl als Übung ────────────────────────────
  var b = oeffne('mehrzahl', 0);
  pruefe('E1 die Übung steht da', !!gramQ && gramQ.art === 'plural', gramQ && gramQ.art);
  pruefe('E2 zur Wahl, vier Möglichkeiten', !gramQ.tippen && alle('[data-gramopt]').length === 4);
  pruefe('E3 die richtige ist dabei', gramQ.optionen.indexOf(gramQ.loesung) !== -1);
  pruefe('E4 und stimmt mit der Maschine überein',
    gramQ.loesung === plural(gramQ.wort.ru, gramQ.wort.art));
  pruefe('E5 das Wort ändert sich überhaupt', gramQ.loesung !== gramQ.wort.ru,
    gramQ.wort.ru + ' → ' + gramQ.loesung);
  tippe(q('[data-gramopt="' + gramQ.loesung + '"]'));
  tippe(q('#gramConfirm'));
  pruefe('E6 richtig gewertet', gramCorrect === true);
  pruefe('E7 die Erklärung nennt die Endung',
    main.textContent.indexOf(gramQ.loesung) !== -1 && !!q('.hint'));

  // ── F · Der Genitiv ───────────────────────────────────────
  b = oeffne('genitiv', 0);
  pruefe('F1 die Übung steht da', !!gramQ && gramQ.art === 'gen');
  pruefe('F2 die Frage nennt «нет»', main.textContent.indexOf('нет') !== -1);
  pruefe('F3 die Lösung stimmt', gramQ.loesung === genitiv(gramQ.wort.ru, gramQ.wort.art));
  pruefe('F4 kein Wort mit eigener Form', !NOMEN[gramQ.wort.ru], gramQ.wort.ru);

  // Ab der Endstufe wird geschrieben, nicht gewählt.
  b = oeffne('genitiv', SATZ_STUFE);
  pruefe('F5 ab Stufe 2 wird getippt', gramQ.tippen && !!q('#gramInput'));
  q('#gramInput').value = gramQ.loesung;
  q('#gramInput').dispatchEvent(new Event('input', { bubbles: true }));
  tippe(q('#gramConfirm'));
  pruefe('F6 richtig geschrieben zählt', gramCorrect === true);
  pruefe('F7 und die Prüfzeile steht da', !!q('.pruefzeile'));

  // ── G · Die Übereinstimmung ───────────────────────────────
  b = oeffne('adjektiv', 0);
  pruefe('G1 die Übung steht da', !!gramQ && gramQ.art === 'adj');
  pruefe('G2 geübt wird an einem Adjektiv', gramQ.wort.art === 'a', gramQ.wort.art);
  pruefe('G3 ein Nomen steht daneben', !!gramQ.partner && !!q('.wort-partner'),
    gramQ.partner && gramQ.partner.text);
  pruefe('G4 die Lösung richtet sich nach ihm',
    gramQ.loesung === adjektiv(gramQ.wort.ru, gramQ.genus),
    gramQ.wort.ru + ' · ' + gramQ.genus + ' → ' + gramQ.loesung);
  pruefe('G5 vier Möglichkeiten, alle echt',
    gramQ.optionen.length === 4 &&
    gramQ.optionen.every(function (f) {
      return GENERA.some(function (g) { return adjektiv(gramQ.wort.ru, g) === f; });
    }), gramQ.optionen.join(' '));
  // Die Mehrzahl des Partners muss die Regel treffen — sonst stünde in der
  // Aufgabe eine falsche Form.
  pruefe('G6 der Partner in der Mehrzahl ist regelmäßig',
    (function () {
      for (var i = 0; i < 60; i++) {
        var p = gramNomenPartner(b);
        if (!p) return 'kein Partner';
        if (p.mehrzahl && NOMEN[p.wort.ru] && NOMEN[p.wort.ru].plural) return p.wort.ru;
      }
      return true;
    })() === true);
  tippe(q('[data-gramopt="' + gramQ.loesung + '"]'));
  tippe(q('#gramConfirm'));
  pruefe('G7 richtig gewertet', gramCorrect === true);

  // ── H · Die Vergangenheit ─────────────────────────────────
  b = oeffne('praeteritum', 0);
  pruefe('H1 die Übung steht da', !!gramQ && gramQ.art === 'praet');
  pruefe('H2 geübt wird an einem Verb', gramQ.wort.art === 'v');
  pruefe('H3 die Frage sagt, wer gehandelt hat',
    GENERA.indexOf(gramQ.genus) !== -1 && main.textContent.indexOf('он') !== -1,
    gramQ.genus);
  pruefe('H4 die Lösung stimmt', gramQ.loesung === praeteritum(gramQ.wort.ru, gramQ.genus));
  pruefe('H5 alle Ablenker sind echte Formen',
    gramQ.optionen.every(function (f) {
      return GENERA.some(function (g) { return praeteritum(gramQ.wort.ru, g) === f; });
    }), gramQ.optionen.join(' '));
  pruefe('H6 kein Verb mit eigener Vergangenheit',
    !(VERBEN[gramQ.wort.ru] && VERBEN[gramQ.wort.ru].praet), gramQ.wort.ru);
  tippe(q('[data-gramopt="' + gramQ.loesung + '"]'));
  tippe(q('#gramConfirm'));
  pruefe('H7 richtig gewertet', gramCorrect === true);
  pruefe('H8 die Erklärung nennt den Stamm', !!q('.hint') &&
    q('.hint').textContent.indexOf(gramQ.wort.ru.slice(0, -2)) !== -1,
    q('.hint') && q('.hint').textContent.slice(0, 60));

  // ── I · Hundert Aufgaben ohne Aussetzer ───────────────────
  // Der eigentliche Test: Jeder Baustein baut Aufgaben, deren Lösung stimmt und
  // deren Ablenker echte Formen sind — nicht nur die eine, die gerade auslost.
  var kaputt = [];
  GRAMMATIK.forEach(function (bb) {
    state = defaultState();
    ansichtenZuruecksetzen();
    state.gramSeen[bb.id] = Date.now();
    state.gramBox[bb.id] = 0;
    gramWahl = bb.id; gramBaustein = bb.id;
    for (var i = 0; i < 40; i++) {
      gramQ = null;
      gramFrageBauen();
      if (!gramQ) { kaputt.push(bb.id + ': keine Aufgabe'); break; }
      if (!gramQ.loesung) { kaputt.push(bb.id + ': ohne Lösung (' + gramQ.wort.ru + ')'); break; }
      if (gramQ.optionen.indexOf(gramQ.loesung) === -1) {
        kaputt.push(bb.id + ': Lösung fehlt in den Möglichkeiten'); break;
      }
      if (gramQ.optionen.length < 2) {
        kaputt.push(bb.id + ': zu wenige Möglichkeiten (' + gramQ.wort.ru + ')'); break;
      }
      var doppelt = gramQ.optionen.filter(function (f, k) {
        return gramQ.optionen.indexOf(f) !== k;
      });
      if (doppelt.length) { kaputt.push(bb.id + ': doppelte Möglichkeit ' + doppelt[0]); break; }
    }
  });
  pruefe('I1 400 Aufgaben, keine ohne Lösung', kaputt.length === 0, kaputt.slice(0, 3).join(' | '));

  // ── J · Zeichnen, ohne zu stolpern ────────────────────────
  var stolper = [];
  GRAMMATIK.forEach(function (bb) {
    [0, 1, SATZ_STUFE, BOX_MAX].forEach(function (st) {
      try {
        oeffne(bb.id, st);
        if (!main.innerHTML) stolper.push(bb.id + '/' + st + ': leer');
      } catch (e) { stolper.push(bb.id + '/' + st + ': ' + e.message); }
    });
  });
  pruefe('J1 jede Regel zeichnet auf jeder Stufe', stolper.length === 0,
    stolper.slice(0, 3).join(' | '));

  // ── K · Die Übersicht führt alle zehn ─────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  gramWahl = null; gramBaustein = null;
  setTab('grammatik');
  // Die Auswahl steht im Kopf, nicht in der Ansicht: ein Chip je Regel plus
  // «Der Reihe nach».
  var chips = alle('[data-fw="gramwahl"]');
  pruefe('K1 die Auswahl führt jede Regel',
    chips.length === GRAMMATIK.length + 1,
    chips.length + ' Chips für ' + GRAMMATIK.length + ' Regeln');
  pruefe('K2 und jede ist beim Namen zu finden',
    GRAMMATIK.every(function (bb) {
      return chips.some(function (c) { return c.dataset.fv === bb.id; });
    }), GRAMMATIK.filter(function (bb) {
      return !chips.some(function (c) { return c.dataset.fv === bb.id; });
    }).map(function (bb) { return bb.id; }).join(','));
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

writeFileSync(BAU + '/t-regeln.html', testseite(html, test));
console.log('Regel-Testseite geschrieben');
