// Prüft die akustische Wiedergabe: Hörknöpfe in allen Übungen, beide Sprachen.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

// Die Sprachausgabe selbst prüfen wir nicht — sie ist im Headless-Browser nicht
// vorhanden. Geprüft wird, was die App tut: welchen Text sie mit welcher
// Sprache anmeldet.
var gesagt = [];
// window.speechSynthesis ist ein Getter auf dem Prototyp — eine schlichte
// Zuweisung liefe ins Leere und wir prüften den echten (stummen) Dienst.
Object.defineProperty(window, 'speechSynthesis', {
  configurable: true,
  value: {
    cancel: function () {},
    speak: function (u) { gesagt.push(u.lang + '|' + u.text); }
  }
});
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  configurable: true,
  value: function (text) { this.text = text; this.lang = ''; this.rate = 1; }
});

try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // A · Der Knopf hängt seinen Text an sich selbst
  pruefe('A1 Hörknopf trägt Text und Sprache',
    hoerknopf('привет', 'ru').indexOf('data-say="привет"') !== -1 &&
    hoerknopf('привет', 'ru').indexOf('data-lang="ru"') !== -1);
  pruefe('A2 Deutsch wird als solches ausgezeichnet',
    hoerknopf('hallo', 'de').indexOf('data-lang="de"') !== -1);
  pruefe('A3 ohne Text kein Knopf', hoerknopf('', 'ru') === '');
  pruefe('A4 der Text ist maskiert',
    hoerknopf('a"b<c', 'de').indexOf('a&quot;b&lt;c') === -1 &&
    hoerknopf('a"b<c', 'de').indexOf('&lt;c') !== -1);

  // B · Lernsets: die Frageseite ist zu hören
  ALL_VOCAB.slice(0, 20).forEach(function (v) { state.boxes[v.id] = 1; state.lastSeen[v.id] = Date.now() - 9 * TAG; });
  setTab('lernsets');
  uebNext(true);
  pruefe('B1 die Frage hat einen Hörknopf', !!q('.word [data-say]'));
  var knopf = q('.word [data-say]');
  var erwartet = uebQ.mode === 'mc-de' ? 'ru' : 'de';
  pruefe('B2 die Sprache passt zur Frageseite', knopf.dataset.lang === erwartet,
    knopf.dataset.lang + ' bei ' + uebQ.mode);
  pruefe('B3 die Trefferfläche ist groß genug',
    knopf.getBoundingClientRect().width >= 44 && knopf.getBoundingClientRect().height >= 44);
  gesagt = [];
  knopf.click();
  pruefe('B4 ein Tipp meldet den Text an', gesagt.length === 1, gesagt.join());
  pruefe('B5 mit der richtigen Sprache',
    gesagt[0].indexOf(erwartet === 'ru' ? 'ru-RU' : 'de-DE') === 0, gesagt[0]);

  // C · Nach der Auflösung beide Seiten
  pruefe('C1 vorher keine Hörzeile', !q('.hoerzeile'));
  uebRevealed = true; uebCorrect = false; uebPhase = 'feedback'; renderUeben();
  pruefe('C2 danach schon', !!q('.hoerzeile'));
  var chips = alle('.hoerzeile [data-say]');
  pruefe('C3 zwei Knöpfe, beide Sprachen',
    chips.length === 2 && chips[0].dataset.lang === 'ru' && chips[1].dataset.lang === 'de',
    chips.map(function (c) { return c.dataset.lang; }).join());
  pruefe('C4 sie sind beschriftet',
    chips[0].textContent.indexOf('Russisch') !== -1 && chips[1].textContent.indexOf('Deutsch') !== -1);
  pruefe('C5 und tragen das Wort',
    chips[0].dataset.say === uebQ.word.ru && chips[1].dataset.say === uebQ.word.de);
  gesagt = [];
  chips[1].click();
  pruefe('C6 Deutsch wird deutsch gesprochen', gesagt[0].indexOf('de-DE|') === 0, gesagt[0]);

  // D · Tippen: erst nach der Abgabe zu hören
  ALL_VOCAB.slice(0, 20).forEach(function (v) { state.boxes[v.id] = 3; });
  setTab('tippen');
  pruefe('D1 die deutsche Vorgabe ist zu hören',
    !!q('.word [data-say]') && q('.word [data-say]').dataset.lang === 'de');
  pruefe('D2 das russische Wort noch nicht', !q('.hoerzeile'));
  q('#tInput').value = 'falsch';
  q('#tInput').dispatchEvent(new Event('input', { bubbles: true }));
  q('#tCheck').click();
  pruefe('D3 nach der Abgabe schon', !!q('.hoerzeile') && alle('.hoerzeile [data-say]').length === 2);
  pruefe('D4 mit dem russischen Wort',
    q('.hoerzeile [data-lang="ru"]').dataset.say === tWord.ru);

  // E · Übersetzen: Satz und Übersetzung
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  setTab('uebersetzen');
  trTask = null; buildTransTask(); renderUebersetzen();
  pruefe('E1 der Satz ist zu hören',
    !!q('.sentence [data-say]') && q('.sentence [data-say]').dataset.say === trTask.prompt);
  trRevealed = true; trCorrect = false; trPhase = 'feedback'; renderUebersetzen();
  var trChips = alle('.hoerzeile [data-say]');
  pruefe('E2 danach beide Seiten', trChips.length === 2 &&
    trChips[0].dataset.say === trTask.ru && trChips[1].dataset.say === trTask.de);

  // F · Buchstaben: das Zeichen, aber erst nach der Auflösung
  setTab('buchstaben');
  abcAnsicht = 'ueben'; abcRichtung = 'zeichen'; abcQ = null; renderBuchstaben();
  pruefe('F1 vor der Antwort schweigt es', !q('.hoerzeile'));
  abcPicked = abcQ.b[1];
  abcPruefen();
  pruefe('F2 danach ist der Buchstabe zu hören',
    !!q('.hoerzeile [data-say]') && q('.hoerzeile [data-say]').dataset.say === abcQ.b[1]);
  pruefe('F3 nur Russisch — ein Laut hat keine deutsche Seite',
    alle('.hoerzeile [data-say]').length === 1);
  // Die Tafel spricht beim Nachschlagen sofort
  abcAnsicht = 'tafel'; abcOffen = null; renderBuchstaben();
  alle('[data-abc]')[0].click();
  pruefe('F4 die Merkhilfe der Tafel spricht',
    !!q('.abc-hilfe [data-say]') && q('.abc-hilfe [data-say]').dataset.lang === 'ru');

  // G · Der Zuhörer hängt an #main und überlebt jeden Renderlauf
  setTab('lernsets');
  uebNext(true);
  renderUeben();
  gesagt = [];
  q('.word [data-say]').click();
  pruefe('G1 auch nach dem Neuzeichnen wird gesprochen', gesagt.length === 1);
  pruefe('G2 kein Knopf trägt mehr eine eigene Kennung',
    !q('#speakBtn') && !q('#trSpeak'));
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

writeFileSync(BAU + '/t-hoeren.html', testseite(html, test));
console.log('Hör-Testseite geschrieben');
