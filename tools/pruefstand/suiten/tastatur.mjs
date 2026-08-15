// Prüft den Aufbau der eingebauten Tastatur: Rücktaste rechts, Leerzeichen unten.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }

try {
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Der Aufbau, unabhängig von der Übung ──────────────
  var huelle = document.createElement('div');
  huelle.innerHTML = tastaturHtml('probe');
  document.body.appendChild(huelle);
  var reihen = Array.prototype.slice.call(huelle.querySelectorAll('.kb-row'));

  pruefe('A1 eine Reihe mehr als Buchstabenreihen',
    reihen.length === KB_ROWS.length + 1, String(reihen.length));

  var letzte = reihen[reihen.length - 1];
  pruefe('A2 die letzte Reihe trägt nur das Leerzeichen',
    letzte.children.length === 1 && letzte.children[0].dataset.probe === ' ',
    letzte.children.length + ' Tasten');
  pruefe('A3 sie heißt so für Vorleser',
    letzte.children[0].getAttribute('aria-label') === 'Leerzeichen');
  pruefe('A4 und trägt die Klasse «space»',
    letzte.children[0].classList.contains('space'));

  var dritte = reihen[KB_ROWS.length - 1];
  var letzteTaste = dritte.children[dritte.children.length - 1];
  pruefe('A5 die Rücktaste sitzt am Ende der letzten Buchstabenreihe',
    letzteTaste.dataset.probe === 'BS', letzteTaste.dataset.probe);
  pruefe('A6 sie steht dort allein — kein Leerzeichen daneben',
    Array.prototype.slice.call(dritte.children).filter(function (k) {
      return k.dataset.probe === ' ';
    }).length === 0);

  // Jede Buchstabenreihe trägt genau ihre Zeichen.
  pruefe('A7 die Buchstabenreihen sind vollständig',
    KB_ROWS.every(function (row, i) {
      var kinder = Array.prototype.slice.call(reihen[i].children)
        .filter(function (k) { return k.dataset.probe !== 'BS'; })
        .map(function (k) { return k.dataset.probe; });
      return kinder.join('') === row.join('');
    }));
  pruefe('A8 kein Zeichen ist verlorengegangen',
    huelle.querySelectorAll('[data-probe]').length === 33 + 2,
    String(huelle.querySelectorAll('[data-probe]').length));
  huelle.remove();

  // ── B · Im Bild: breit, mittig, greifbar ──────────────────
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.settings.tippenStufe = 2;
  tKb = null;
  setTab('tippen');
  var leer = q('.key.space');
  pruefe('B1 die Leertaste steht da', !!leer);
  var lb = leer.getBoundingClientRect();
  pruefe('B2 sie ist deutlich breiter als eine Buchstabentaste',
    lb.width > q('.key.cyr').getBoundingClientRect().width * 4,
    lb.width.toFixed(0) + ' gegen ' + q('.key.cyr').getBoundingClientRect().width.toFixed(0));
  pruefe('B3 sie ist hoch genug zum Treffen', lb.height >= 44, lb.height.toFixed(0));

  // Mittig heißt: gleich viel Luft links wie rechts.
  var reihe = leer.parentNode.getBoundingClientRect();
  var links = lb.left - reihe.left;
  var rechts = reihe.right - lb.right;
  pruefe('B4 sie sitzt mittig', Math.abs(links - rechts) < 2,
    links.toFixed(1) + ' / ' + rechts.toFixed(1));

  // Sie steht unten — unter allen Buchstaben.
  var tiefste = alle('.key.cyr').reduce(function (m, k) {
    return Math.max(m, k.getBoundingClientRect().bottom);
  }, 0);
  pruefe('B5 sie steht unter allen Buchstaben', lb.top >= tiefste - 1,
    lb.top.toFixed(0) + ' gegen ' + tiefste.toFixed(0));

  // Und die Reihe bricht nicht um — sonst stünde etwas daneben.
  pruefe('B6 die Buchstabenreihen brechen nicht um',
    alle('.kb-row').every(function (r) {
      var kinder = Array.prototype.slice.call(r.children);
      if (!kinder.length) return true;
      var oben = kinder[0].getBoundingClientRect().top;
      return kinder.every(function (k) {
        return Math.abs(k.getBoundingClientRect().top - oben) < 2;
      });
    }));

  // ── C · Sie schreibt auch ─────────────────────────────────
  tEingabe = '';
  tippe(q('[data-key="й"]'));
  tippe(leer);
  tippe(q('[data-key="ф"]'));
  pruefe('C1 die Leertaste schreibt ein Leerzeichen', tEingabe === 'й ф', '«' + tEingabe + '»');
  tippe(q('[data-key="BS"]'));
  pruefe('C2 die Rücktaste nimmt zurück', tEingabe === 'й ', '«' + tEingabe + '»');

  // ── D · Alle vier Übungen bauen dieselbe Tastatur ─────────
  // «Tippen» hatte eine eigene, gleichlautende Fassung — eine reicht.
  var stellen = [];
  function zaehle(name) {
    var r = alle('.kb-row');
    stellen.push(name + ':' + r.length + '/' + (q('.key.space') ? '1' : '0'));
    return r.length === KB_ROWS.length + 1 && !!q('.key.space') &&
      alle('.kb-row')[KB_ROWS.length - 1].lastElementChild.getAttribute('aria-label') ===
        'Zeichen löschen';
  }
  var ok = zaehle('tippen');

  SENTENCES.forEach(function (sz) { state.satzBox[sz.ru] = 3; });
  trLevel = 1; trDir = 'de-ru'; trModus = 'lernen';
  trKb = null; trTask = null;
  var n = 0;
  while (n++ < 200 && (!trTask || trTask.art !== 'tippen' || !trTask.loesungRu)) {
    trTask = null;
    buildTransTask();
  }
  setTab('uebersetzen');
  ok = zaehle('uebersetzen') && ok;

  GRAMMATIK.forEach(function (b) {
    state.gramSeen[b.id] = Date.now();
    state.gramBox[b.id] = SATZ_STUFE;
  });
  gramWahl = 'akkusativ';
  gramBaustein = null; gramQ = null; gramKb = null;
  setTab('grammatik');
  ok = zaehle('grammatik') && ok;

  state.patzer = {};
  ALL_VOCAB.filter(function (v) {
    return v.ru.length >= 4 && v.ru.indexOf(' ') === -1;
  }).slice(0, PT_WOERTER).forEach(function (v) {
    state.boxes[v.id] = SATZ_STUFE - 1;
    state.patzer[v.id] = Date.now();
  });
  setTab('power');
  ptSatz.forEach(function (e) { e.treffer = 4; });
  ptQ = null; ptKb = null; ptNaechstes(); renderPower();
  ok = zaehle('power') && ok;

  pruefe('D1 alle vier Übungen zeigen denselben Aufbau', ok, stellen.join(' · '));

  // ── Z · Die Schreibmarke gehört ins Feld (ADR 0068) ──────
  // Wer über die eingebaute Tastatur schreibt, sah bis 2.4.9 nicht, wo er im
  // Text steht: Das Feld bekam seinen Wert gesetzt, aber nie den Fokus — und
  // ohne Fokus blinkt nichts.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = 0; });
  tippenModus = 'alle';
  tKb = true;
  tWord = null;
  setTab('tippen');
  var feld = q('#tInput');
  pruefe('Z1 das Feld steht da und die Tastatur auch', !!feld && !!q('[data-key]'));
  // **inputmode=none**: Fokussieren allein wäre die Falle — auf iOS klappte
  // damit die Gerätetastatur auf, und genau die soll die eingebaute ersetzen.
  pruefe('Z2 es bittet um keine Gerätetastatur',
    feld.getAttribute('inputmode') === 'none', feld.getAttribute('inputmode'));
  q('[data-key]').click();
  pruefe('Z3 ein Tastendruck schreibt ins Feld', q('#tInput').value.length === 1,
    q('#tInput').value);
  pruefe('Z4 und das Feld hat den Fokus', document.activeElement === q('#tInput'),
    document.activeElement ? document.activeElement.id || document.activeElement.tagName : '—');
  pruefe('Z5 die Marke steht am Ende',
    q('#tInput').selectionStart === q('#tInput').value.length,
    q('#tInput').selectionStart + '/' + q('#tInput').value.length);
  // **Ist die eingebaute Tastatur zu, muss die Gerätetastatur aufgehen dürfen.**
  tKb = false;
  renderTippen();
  pruefe('Z6 ohne eingebaute Tastatur steht das Attribut nicht da',
    !q('#tInput').getAttribute('inputmode'), q('#tInput').getAttribute('inputmode'));
  // Und der Helfer verträgt ein Feld, das es nicht gibt.
  pruefe('Z7 ein fehlendes Feld wirft nicht', (function () {
    try { feldSchreiben('gibtsnicht', 'x'); return true; } catch (e) { return false; }
  })());
  tKb = null;
  state = defaultState();
  ansichtenZuruecksetzen();

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

writeFileSync(BAU + '/t-tastatur.html', testseite(html, test));
console.log('Tastatur-Testseite geschrieben');
