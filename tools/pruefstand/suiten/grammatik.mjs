// Prüft den Grammatikteil: Formenmaschine, Wortarten, Übung, Wissen, Sicherung.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');
const bausteine = JSON.parse(readFileSync(WURZEL + '/data/grammatik.json', 'utf8'));
console.log('Bausteine in /data:', bausteine.length);

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }


try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // A · Wortart und Geschlecht
  pruefe('A1 die Endung verrät das Meiste',
    wortartRegel('дом') === 'm' && wortartRegel('книга') === 'w' &&
    wortartRegel('окно') === 's' && wortartRegel('читать') === 'v' &&
    wortartRegel('новый') === 'a');
  pruefe('A2 bei -ь schweigt sie', wortartRegel('дверь') === '' && wortartRegel('день') === '');
  pruefe('A3 die Ausnahmen stehen in den Daten',
    VOKABEL['папа'].art === 'mb' && VOKABEL['кофе'].art === 'm' &&
    VOKABEL['время'].art === 's' && VOKABEL['кровать'].art === 'w',
    [VOKABEL['папа'].art, VOKABEL['кофе'].art, VOKABEL['время'].art, VOKABEL['кровать'].art].join());
  pruefe('A4 jedes Wort hat eine Wortart',
    ALL_VOCAB.every(function (v) { return !!v.art; }),
    ALL_VOCAB.filter(function (v) { return !v.art; }).map(function (v) { return v.ru; }).join());
  pruefe('A5 kein Adverb gilt als Nomen',
    !istNomen(VOKABEL['хорошо'].art) && !istNomen(VOKABEL['пожалуйста'].art) &&
    !istNomen(VOKABEL['сегодня'].art));
  pruefe('A6 Belebtheit ist vermerkt',
    VOKABEL['брат'].art === 'mb' && VOKABEL['стол'].art === 'm');
  pruefe('A7 das Geschlecht blendet die Belebtheit aus',
    geschlecht('mb') === 'm' && geschlecht('wb') === 'w' && geschlecht('w') === 'w');
  pruefe('A8 Lebewesen sind in allen Geschlechtern vermerkt',
    belebt('mb') && belebt('wb') && !belebt('m') && !belebt('w'));
  pruefe('A9 die Familie lebt',
    VOKABEL['мама'].art === 'wb' && VOKABEL['сестра'].art === 'wb' &&
    VOKABEL['кошка'].art === 'wb' && VOKABEL['дочь'].art === 'wb',
    [VOKABEL['мама'].art, VOKABEL['кошка'].art].join());
  pruefe('A10 die Wohnung nicht',
    !belebt(VOKABEL['книга'].art) && !belebt(VOKABEL['кухня'].art) &&
    !belebt(VOKABEL['семья'].art));
  pruefe('A11 belebt weiblich beugt sich wie unbelebt weiblich',
    grammForm('мама', 'wb', 'akk') === 'маму' &&
    grammForm('мышь', 'wb', 'praep') === 'мыши');

  // B · Die Formenmaschine
  pruefe('B1 weiblich -а wird -у', grammForm('книга', 'w', 'akk') === 'книгу');
  pruefe('B2 weiblich -я wird -ю', grammForm('кухня', 'w', 'akk') === 'кухню');
  pruefe('B3 sächlich bleibt', grammForm('окно', 's', 'akk') === 'окно');
  pruefe('B4 männliche Sache bleibt', grammForm('стол', 'm', 'akk') === 'стол');
  pruefe('B5 männliches Lebewesen nimmt -а', grammForm('брат', 'mb', 'akk') === 'брата');
  pruefe('B6 weiblich auf -ь bleibt', grammForm('дверь', 'w', 'akk') === 'дверь');
  pruefe('B7 unbekannte Rolle sagt nein', grammForm('книга', 'w', 'dat') === null);

  // C · Der Beweis: jede vermerkte Form im Satz
  var geprueft = 0, daneben = [];
  SENTENCES.forEach(function (s) {
    if (!s.formen) return;
    Object.keys(s.formen).forEach(function (f) {
      var g = s.formen[f][0], r = s.formen[f][1];
      var v = VOKABEL[g];
      var gebaut = v ? grammForm(g, v.art, r) : null;
      geprueft++;
      if (!gebaut || gebaut.toLowerCase() !== f.toLowerCase()) daneben.push(f + '≠' + gebaut);
    });
  });
  pruefe('C1 Formen in den Sätzen vermerkt', geprueft >= 55, String(geprueft));
  pruefe('C2 die Maschine baut jede exakt nach', daneben.length === 0, daneben.join(' '));

  // D · Die Übung: entdecken
  setTab('grammatik');
  var b = GRAMMATIK[0];
  pruefe('D1 sechste Kachel führt hierher', currentTab === 'grammatik');
  pruefe('D2 unentdeckt heißt entdecken', !gramEntdeckt(b) && !!q('[data-gramdeutung]'));
  pruefe('D3 Paare aus bekannten Wörtern', alle('.gram-paar').length >= 3);
  pruefe('D4 mindestens drei Deutungen', alle('[data-gramdeutung]').length >= 3);
  alle('[data-gramdeutung]')[(b.richtig + 1) % b.deutungen.length].click();
  q('#gramDeutungAb').click();
  pruefe('D5 falsche Deutung wird erkannt', gramCorrect === false);
  pruefe('D6 die Stufe steigt beim Deuten noch nicht', gramBox(b) === 0);
  q('#gramZurRegel').click();
  pruefe('D7 danach steht die Regel da', !!q('.gram-tabelle') && !!q('.gram-merk'));
  pruefe('D8 und der Baustein gilt als entdeckt', gramEntdeckt(b));
  q('#gramZurUebung').click();
  pruefe('D9 dann die Aufgabe', !!gramQ && !!q('[data-gramopt]'));

  // E · Anwenden: Geschlecht
  pruefe('E1 gefragt ist ein Nomen', istNomen(gramQ.wort.art), gramQ.wort.ru + '/' + gramQ.wort.art);
  pruefe('E2 die Lösung ist ein Geschlecht',
    ['m', 'w', 's'].indexOf(gramQ.loesung) !== -1, gramQ.loesung);
  pruefe('E3 auf Stufe 0 keine Ausnahmen',
    geschlecht(gramQ.wort.art) === wortartRegel(gramQ.wort.ru), gramQ.wort.ru);
  var richtig = gramQ.loesung;
  q('[data-gramopt="' + richtig + '"]').click();
  q('#gramConfirm').click();
  pruefe('E4 richtig erkannt', gramCorrect === true);
  pruefe('E5 die Stufe der Regel steigt', gramBox(b) === 1, String(gramBox(b)));
  pruefe('E6 die Begründung steht dabei', main.textContent.indexOf('endet auf') !== -1 ||
    main.textContent.indexOf('Ausnahme') !== -1);
  pruefe('E7 der Wortschatz bleibt unberührt', Object.keys(state.boxes).length === 0);
  pruefe('E8 «beantwortet» zählt nicht mit', state.answered === 0);

  // F · Die Regel steigt, nicht das Wort
  var vorher = gramQ.wort.id;
  q('#gramNext').click();
  pruefe('F1 nächste Aufgabe, anderes Wort', !!gramQ && gramQ.wort.id !== vorher);
  pruefe('F2 die Karteikarte ist die Regel',
    Object.keys(state.gramBox).length === 1 && state.gramBox[b.id] === 1);

  // G · Akkusativ, gestaffelt
  state = defaultState();
  ansichtenZuruecksetzen();
  state.gramSeen[GRAMMATIK[0].id] = Date.now();
  state.gramBox[GRAMMATIK[0].id] = BOX_MAX;
  // Nicht über die Position suchen — die Reihenfolge der Bausteine ändert sich.
  var akk = gramFinde('akkusativ');
  state.gramSeen[akk.id] = Date.now();
  gramBaustein = akk.id; gramQ = null;
  renderGrammatik();
  pruefe('G1 jetzt der Akkusativ', gramQ && gramQ.baustein === akk.id, gramQ && gramQ.baustein);
  pruefe('G2 auf Stufe 0 zur Wahl', !gramQ.tippen && alle('[data-gramopt]').length === 4);
  pruefe('G3 die richtige Form ist dabei',
    gramQ.optionen.indexOf(gramQ.loesung) !== -1);
  pruefe('G4 kein belebtes männliches Wort', gramQ.wort.art !== 'mb', gramQ.wort.art);
  pruefe('G5 die Maschine liefert die Lösung',
    gramQ.loesung === grammForm(gramQ.wort.ru, gramQ.wort.art, 'akk'));
  q('[data-gramopt="' + gramQ.loesung + '"]').click();
  q('#gramConfirm').click();
  pruefe('G6 richtig', gramCorrect === true);
  // Ab Stufe 2 wird getippt
  state.gramBox[akk.id] = SATZ_STUFE;
  gramBaustein = akk.id; gramQ = null;
  renderGrammatik();
  pruefe('G7 ab Stufe 2 selbst schreiben', gramQ.tippen && !!q('#gramInput') && !q('[data-gramopt]'));
  pruefe('G8 leer darf man nicht abgeben', q('#gramConfirm').disabled);
  q('#gramInput').value = gramQ.loesung;
  q('#gramInput').dispatchEvent(new Event('input'));
  pruefe('G9 mit Text schon', !q('#gramConfirm').disabled);
  q('#gramConfirm').click();
  pruefe('G10 getippt und richtig', gramCorrect === true);
  pruefe('G11 die Tastatur lässt sich einblenden', !!q('#gramKbToggle') || gramPhase === 'feedback');

  // H · «Mehr …» klappt die Regel auf
  gramQ = null; gramRegelOffen = false;
  renderGrammatik();
  pruefe('H1 die Regel liegt bereit, aber zugeklappt',
    !!q('#gramRegelKlapp') && !q('#gramRegelKlapp').classList.contains('auf'));
  q('#gramWarum').click();
  pruefe('H2 «Mehr …» klappt sie auf', q('#gramRegelKlapp').classList.contains('auf') &&
    !!q('#gramRegelKlapp .gram-tabelle') && !!q('#gramRegelKlapp .gram-merk'));

  // L · Die Konjugation
  pruefe('L1 e-Reihe, alle sechs Personen',
    ['praes1s','praes2s','praes3s','praes1p','praes2p','praes3p'].map(function (r) {
      return grammForm('читать', 'v', r);
    }).join(' ') === 'читаю читаешь читает читаем читаете читают');
  pruefe('L2 i-Reihe', ['praes1s','praes2s','praes3p'].map(function (r) {
    return grammForm('говорить', 'v', r);
  }).join(' ') === 'говорю говоришь говорят');
  pruefe('L3 nach Zischlaut -у und -ат',
    grammForm('учить', 'v', 'praes1s') === 'учу' &&
    grammForm('учить', 'v', 'praes3p') === 'учат');
  pruefe('L4 der л-Einschub', grammForm('любить', 'v', 'praes1s') === 'люблю' &&
    grammForm('готовить', 'v', 'praes1s') === 'готовлю');
  pruefe('L5 der Konsonantenwandel', grammForm('платить', 'v', 'praes1s') === 'плачу' &&
    grammForm('видеть', 'v', 'praes1s') === 'вижу' &&
    grammForm('встретить', 'v', 'praes1s') === 'встречу');
  pruefe('L6 nur die Ich-Form wandelt',
    grammForm('любить', 'v', 'praes2s') === 'любишь' &&
    grammForm('видеть', 'v', 'praes3s') === 'видит');
  pruefe('L7 eigener Stamm aus VERBEN',
    grammForm('писать', 'v', 'praes3s') === 'пишет' &&
    grammForm('жить', 'v', 'praes1s') === 'живу' &&
    grammForm('пить', 'v', 'praes3s') === 'пьёт' &&
    grammForm('идти', 'v', 'praes1p') === 'идём');
  pruefe('L8 rückbezüglich bekommt -ся / -сь',
    grammForm('учиться', 'v', 'praes1s') === 'учусь' &&
    grammForm('учиться', 'v', 'praes1p') === 'учимся');
  pruefe('L9 быть hat kein Präsens', grammForm('быть', 'v', 'praes3s') === null);
  pruefe('L10 ein Nomen wird nicht konjugiert', grammForm('книга', 'w', 'praes1s') === null);
  pruefe('L11 die Reihe steht am Infinitiv',
    verbKlasse('читать') === 'e' && verbKlasse('говорить') === 'i' &&
    verbKlasse('жить') === 'e' && verbKlasse('хотеть') === '');
  pruefe('L12 der Stamm auch',
    verbStamm('читать') === 'чита' && verbStamm('смотреть') === 'смотр' &&
    verbStamm('писать') === 'пиш');
  pruefe('L13 Wandel nur wo einer ist',
    verbIchWandel('любить') && verbIchWandel('видеть') &&
    !verbIchWandel('говорить') && !verbIchWandel('читать'));

  // M · Präsens üben
  state = defaultState();
  ansichtenZuruecksetzen();
  var pb = GRAMMATIK.filter(function (x) { return x.aufgabe === 'praes' && x.klasse === 'e'; })[0];
  pruefe('M1 es gibt einen Baustein für die e-Reihe', !!pb);
  state.gramSeen[pb.id] = Date.now();
  gramBaustein = pb.id; gramQ = null;
  renderGrammatik();
  pruefe('M2 gefragt ist ein Verb', gramQ.wort.art === 'v', gramQ.wort.ru);
  pruefe('M3 aus der eigenen Reihe', verbKlasse(gramQ.wort.ru) === 'e', gramQ.wort.ru);
  pruefe('M4 kein Verb mit eigenem Stamm', !VERBEN[gramQ.wort.ru], gramQ.wort.ru);
  pruefe('M5 eine Person ist ausgelost',
    PERSONEN.indexOf(gramQ.person) !== -1, gramQ.person);
  pruefe('M6 die Lösung kommt aus der Maschine',
    gramQ.loesung === grammForm(gramQ.wort.ru, 'v', 'praes' + gramQ.person));
  pruefe('M7 vier Möglichkeiten', alle('[data-gramopt]').length === 4);
  pruefe('M8 die Ablenker sind echte Formen dieses Verbs',
    gramQ.optionen.every(function (f) { return verbBau(gramQ.wort.ru).indexOf(f) !== -1; }),
    gramQ.optionen.join(' '));
  pruefe('M9 die Person steht dabei',
    main.textContent.indexOf(PERSON_DE[gramQ.person]) !== -1);
  q('[data-gramopt="' + gramQ.loesung + '"]').click();
  q('#gramConfirm').click();
  pruefe('M10 richtig', gramCorrect === true);
  pruefe('M11 die Begründung nennt Stamm und Endung',
    main.textContent.indexOf('Stamm') !== -1 && main.textContent.indexOf('Endung') !== -1);
  pruefe('M12 der Wortschatz bleibt unberührt', Object.keys(state.boxes).length === 0);
  state.gramBox[pb.id] = SATZ_STUFE;
  gramQ = null; renderGrammatik();
  pruefe('M13 ab Stufe 2 selbst schreiben', gramQ.tippen && !!q('#gramInput'));

  // N · Die i-Reihe stellt sich der e-Reihe gegenüber
  state = defaultState();
  ansichtenZuruecksetzen();
  var ib = GRAMMATIK.filter(function (x) { return x.aufgabe === 'praes' && x.klasse === 'i'; })[0];
  pruefe('N1 es gibt einen Baustein für die i-Reihe', !!ib);
  gramBaustein = ib.id; gramQ = null;
  renderGrammatik();
  pruefe('N2 zuerst entdecken', !!q('[data-gramdeutung]'));
  var links = alle('.gram-paar').map(function (x) { return x.firstChild.textContent; });
  pruefe('N3 die Gegenüberstellung zeigt beide Reihen',
    links.some(function (t) { return /(ить|еть)\s/.test(t); }) &&
    links.some(function (t) { return /(ать|ять)\s/.test(t); }), links.join(' | '));
  state.gramSeen[ib.id] = Date.now();
  gramQ = null; renderGrammatik();
  pruefe('N4 gefragt ist ein Verb der i-Reihe',
    verbKlasse(gramQ.wort.ru) === 'i', gramQ.wort.ru);

  // O · Die Ich-Form
  state = defaultState();
  ansichtenZuruecksetzen();
  var ich = GRAMMATIK.filter(function (x) { return x.aufgabe === 'ichform'; })[0];
  pruefe('O1 es gibt einen Baustein für die Ich-Form', !!ich);
  state.gramSeen[ich.id] = Date.now();
  gramBaustein = ich.id; gramQ = null;
  renderGrammatik();
  pruefe('O2 nur Verben, deren Stamm kippt',
    verbIchWandel(gramQ.wort.ru), gramQ.wort.ru);
  pruefe('O3 gegeben ist die ты-Form',
    gramQ.von === grammForm(gramQ.wort.ru, 'v', 'praes2s'), gramQ.von);
  pruefe('O4 gefragt ist die я-Form',
    gramQ.loesung === grammForm(gramQ.wort.ru, 'v', 'praes1s'), gramQ.loesung);
  pruefe('O5 der ungewandelte Stamm steht als Verlockung dabei',
    gramQ.optionen.some(function (f) {
      return f.indexOf(verbStamm(gramQ.wort.ru)) === 0 && f !== gramQ.loesung;
    }), gramQ.optionen.join(' '));
  q('[data-gramopt="' + gramQ.loesung + '"]').click();
  q('#gramConfirm').click();
  pruefe('O6 richtig', gramCorrect === true);
  pruefe('O7 die Begründung nennt den Wandel',
    main.textContent.indexOf('Ich-Form') !== -1, main.textContent.slice(0, 60));
  // Entdecken: drei mit Wandel, eines ohne — sonst gäbe es nichts zu sehen
  state = defaultState();
  ansichtenZuruecksetzen();
  gramBaustein = ich.id; gramQ = null;
  renderGrammatik();
  var paare = alle('.gram-paar');
  pruefe('O8 vier Paare zum Vergleichen', paare.length === 4, String(paare.length));
  var ohneWandel = paare.filter(function (p) {
    var l = p.firstChild.textContent, r = p.lastChild.textContent;
    return l.slice(0, -3) === r.slice(0, -1);
  });
  pruefe('O9 eines davon ohne Wandel — die Gegenprobe',
    ohneWandel.length === 1, String(ohneWandel.length));

  // P · Der Präpositiv
  pruefe('P1 männlich bekommt -е', grammForm('город', 'm', 'praep') === 'городе' &&
    grammForm('стол', 'm', 'praep') === 'столе');
  pruefe('P2 weiblich -а und -я werden -е', grammForm('Москва', 'w', 'praep') === 'Москве' &&
    grammForm('кухня', 'w', 'praep') === 'кухне');
  pruefe('P3 sächlich -о wird -е', grammForm('окно', 's', 'praep') === 'окне');
  pruefe('P4 -ия wird -ии', grammForm('Россия', 'w', 'praep') === 'России' &&
    grammForm('путешествие', 's', 'praep') === 'путешествии');
  pruefe('P5 weiblich auf -ь wird -и', grammForm('дверь', 'w', 'praep') === 'двери' &&
    grammForm('ночь', 'w', 'praep') === 'ночи');
  pruefe('P6 männlich auf -ь wird -е', grammForm('медведь', 'mb', 'praep') === 'медведе');
  pruefe('P7 auf -е bleibt es', grammForm('море', 's', 'praep') === 'море' &&
    grammForm('кофе', 'm', 'praep') === 'кофе');
  pruefe('P8 flüchtiger Vokal fällt aus', grammForm('день', 'm', 'praep') === 'дне' &&
    grammForm('ребёнок', 'mb', 'praep') === 'ребёнке' &&
    grammForm('палец', 'm', 'praep') === 'пальце');
  pruefe('P9 der Ortsfall auf -у', grammForm('год', 'm', 'praep') === 'году' &&
    grammForm('лес', 'm', 'praep') === 'лесу');
  pruefe('P10 eigener Stamm', grammForm('время', 's', 'praep') === 'времени' &&
    grammForm('дочь', 'w', 'praep') === 'дочери');
  pruefe('P11 Lehnwörter rühren sich nicht', grammForm('метро', 's', 'praep') === 'метро' &&
    grammForm('пальто', 's', 'praep') === 'пальто');
  pruefe('P12 ein Verb hat keinen Präpositiv', grammForm('читать', 'v', 'praep') === null);

  // Q · Präpositiv üben
  state = defaultState();
  ansichtenZuruecksetzen();
  var pp = GRAMMATIK.filter(function (x) { return x.aufgabe === 'praep'; })[0];
  pruefe('Q1 es gibt einen Baustein', !!pp);
  gramBaustein = pp.id; gramQ = null;
  renderGrammatik();
  pruefe('Q2 zuerst entdecken', !!q('[data-gramdeutung]'));
  var pa = alle('.gram-paar');
  pruefe('Q3 vier Paare', pa.length === 4, String(pa.length));
  pruefe('Q4 die Formen stehen mit в da',
    pa.every(function (x) { return x.lastChild.textContent.indexOf('в ') === 0; }),
    pa.map(function (x) { return x.lastChild.textContent; }).join(' | '));
  var gs = alle('.gram-paar').map(function (x) {
    return geschlecht(VOKABEL[x.firstChild.textContent].art);
  });
  pruefe('Q4a kein Lebewesen in der Gegenüberstellung',
    alle('.gram-paar').every(function (x) {
      return !belebt(VOKABEL[x.firstChild.textContent].art);
    }), alle('.gram-paar').map(function (x) { return x.firstChild.textContent; }).join(' '));
  pruefe('Q5 alle drei Geschlechter sind vertreten',
    gs.indexOf('m') !== -1 && gs.indexOf('w') !== -1 && gs.indexOf('s') !== -1, gs.join(''));
  state.gramSeen[pp.id] = Date.now();
  gramQ = null; renderGrammatik();
  pruefe('Q6 gefragt ist ein Nomen', istNomen(gramQ.wort.art), gramQ.wort.ru);
  pruefe('Q6a und kein Lebewesen — in einer Mutter ist niemand',
    !belebt(gramQ.wort.art), gramQ.wort.ru);
  pruefe('Q7 keine Ausnahme aus NOMEN', !NOMEN[gramQ.wort.ru], gramQ.wort.ru);
  pruefe('Q8 die Form ändert sich auch wirklich',
    gramQ.loesung !== gramQ.wort.ru, gramQ.wort.ru + '→' + gramQ.loesung);
  pruefe('Q9 die Maschine liefert die Lösung',
    gramQ.loesung === grammForm(gramQ.wort.ru, gramQ.wort.art, 'praep'));
  pruefe('Q10 vier Möglichkeiten', alle('[data-gramopt]').length === 4);
  q('[data-gramopt="' + gramQ.loesung + '"]').click();
  q('#gramConfirm').click();
  pruefe('Q11 richtig', gramCorrect === true);
  pruefe('Q12 die Begründung steht dabei',
    main.textContent.indexOf('Hauptregel') !== -1 ||
    main.textContent.indexOf('-ии') !== -1 || main.textContent.indexOf('-и') !== -1,
    main.textContent.slice(0, 60));
  state.gramBox[pp.id] = SATZ_STUFE;
  gramQ = null; renderGrammatik();
  pruefe('Q13 ab Stufe 2 selbst schreiben', gramQ.tippen && !!q('#gramInput'));

  // I · Wissen im Satz
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  // Ein Satz mit einer gebeugten Nomenform — an ihr hängen die Prüfungen unten.
  var satz = SENTENCES.filter(function (s) {
    if (!s.formen || s.stufe !== 1) return false;
    return Object.keys(s.formen).some(function (f) { return s.formen[f][1] === 'akk'; });
  })[0];
  trDir = 'ru-de'; trLevel = satz.stufe; trModus = 'lernen';
  setTab('uebersetzen');
  buildTransTask(satz);
  renderUebersetzen();
  renderKopf();
  pruefe('I1 der Knopf steht bereit', !q('#wissenKnopf').hidden);
  pruefe('I2 die Wörter sind antippbar', alle('[data-wissenwort]').length >= 3);
  var form = Object.keys(satz.formen).filter(function (f) {
    return satz.formen[f][1] === 'akk';
  })[0];
  var knopf = alle('[data-wissenwort]').filter(function (x) {
    return x.dataset.wissenwort.replace(/[.,!?]/g, '') === form;
  })[0];
  pruefe('I3 die gebeugte Form ist dabei', !!knopf, form);
  knopf.click();
  pruefe('I4 das Fenster geht auf', wissenOffen && !!q('.wissen-karte'));
  var text = q('#wissenInhalt').textContent;
  pruefe('I5 es nennt die Grundform', text.indexOf(satz.formen[form][0]) !== -1, text.slice(0, 90));
  pruefe('I6 und die Rolle', text.indexOf('Akkusativ') !== -1);
  pruefe('I7 und das Geschlecht', text.indexOf('weiblich') !== -1 ||
    text.indexOf('männlich') !== -1 || text.indexOf('sächlich') !== -1);
  // Verbformen erklärt dasselbe Fenster — mit Stamm und Endung statt Geschlecht.
  var vsatz = SENTENCES.filter(function (s) {
    if (!s.formen) return false;
    return Object.keys(s.formen).some(function (f) { return s.formen[f][1].indexOf('praes') === 0; });
  })[0];
  var vform = Object.keys(vsatz.formen).filter(function (f) {
    return vsatz.formen[f][1].indexOf('praes') === 0;
  })[0];
  trDir = 'ru-de'; trLevel = vsatz.stufe; trTask = null;
  buildTransTask(vsatz); renderUebersetzen(); renderKopf();
  var vknopf = alle('[data-wissenwort]').filter(function (x) {
    return x.dataset.wissenwort.replace(/[.,!?]/g, '').toLowerCase() === vform.toLowerCase();
  })[0];
  pruefe('I6a die Verbform ist antippbar', !!vknopf, vform);
  vknopf.click();
  var vtext = q('#wissenInhalt').textContent;
  pruefe('I6b sie wird als Präsens benannt', vtext.indexOf('Präsens') !== -1, vtext.slice(0, 80));
  pruefe('I6c mit Stamm und Endung',
    vtext.indexOf('Stamm') !== -1 && vtext.indexOf('Endung') !== -1, vtext.slice(0, 120));
  pruefe('I6d ohne Geschlecht', vtext.indexOf('sächlich') === -1);

  trDir = 'ru-de'; trLevel = satz.stufe; trTask = null;
  buildTransTask(satz); renderUebersetzen(); renderKopf();
  alle('[data-wissenwort]')[0].click();
  q('#wissenAlle').click();
  pruefe('I8 «Ganzer Satz» zeigt alle Wörter',
    alle('.wissen-karte').length >= 3, String(alle('.wissen-karte').length));
  pruefe('I9 unerklärte Formen sagen das ehrlich',
    q('#wissenInhalt').textContent.indexOf('noch nicht erklärt') !== -1 ||
    alle('.wissen-regel.offen').length === 0);
  // In der Gegenrichtung schweigt es, solange nicht aufgelöst ist
  trDir = 'de-ru'; trTask = null; buildTransTask(satz); renderUebersetzen(); renderKopf();
  pruefe('I10 DE → RU verrät nichts', q('#wissenKnopf').hidden && !q('[data-wissenwort]'));
  trPhase = 'feedback'; renderKopf();
  pruefe('I11 nach der Auflösung schon', !q('#wissenKnopf').hidden);

  // J · Sicherungscode
  state = defaultState();
  state.gramBox[GRAMMATIK[0].id] = 3;
  state.gramSeen[GRAMMATIK[0].id] = Date.now();
  var code = encodeBackup();
  pruefe('J1 zehn Felder', code.split('~').length === 10, String(code.split('~').length));
  var zurueck = mergeState(decodeBackup(code));
  pruefe('J2 der Regelstand kommt zurück', zurueck.gramBox[GRAMMATIK[0].id] === 3);
  pruefe('J3 der Überblick nennt ihn', bkUeberblick(state).indexOf('1 Regel') !== -1,
    bkUeberblick(state));
  var alt = code.split('~');
  var rumpf = alt.slice(0, 7).join('~');
  var achtFeldrig = rumpf + '~' + bkPruefsumme(rumpf);
  var a8 = mergeState(decodeBackup(achtFeldrig));
  pruefe('J4 achtfeldrige Codes bleiben lesbar', Object.keys(a8.gramBox).length === 0);
  pruefe('J5 fremde Bausteine fallen weg',
    Object.keys(mergeState({ gramBox: { geschlecht: 2, quatsch: 4 } }).gramBox).join() === 'geschlecht');

  // K · Zurücksetzen räumt auf
  gramBaustein = 'akkusativ'; gramRegelOffen = true; gramEingabe = 'xy';
  ansichtenZuruecksetzen();
  pruefe('K1 alles zurück', gramBaustein === null && gramQ === null &&
    gramRegelOffen === false && gramEingabe === '');
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

writeFileSync(BAU + '/t-grammatik.html', testseite(html, test));
console.log('Grammatik-Testseite geschrieben');
