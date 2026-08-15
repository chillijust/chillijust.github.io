// Prüft den Auswahlknopf und sein Aufklapp-Panel.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

// Keine Klappmenüs mehr in der Datei
// **Mit `throw`, nicht mit `process.exit()`.** Ein Ausstieg beim Bauen beendet
// den Läufer selbst — ohne Ausgabe, ohne Grund und ohne die übrigen Suiten.
// Genau das passierte, als hier zum ersten Mal wieder ein `<select>` auftauchte:
// Der Lauf brach nach «fertig» ab, und die Meldung dazu war eine leere Zeile.
const selects = (html.match(/<select/g) || []).length;
console.log('<select> im Quelltext:', selects, selects === 0 ? '· keine mehr' : '· unerwartet!');
if (selects) throw new Error('Die App hat keine Klappmenüs — ' + selects + ' <select> gefunden');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  ALL_VOCAB.slice(0, 40).forEach(function (v, i) {
    state.boxes[v.id] = (i % 4) + 1;
    state.lastSeen[v.id] = Date.now() - i * TAG;
  });

  // A · Start und Sichtbarkeit
  pruefe('A1 die App startet auf Home', currentTab === 'home', currentTab);
  pruefe('A2 auf Home kein Auswahlknopf', q('#filterKnopf').hidden === true);
  setTab('bilanz');
  pruefe('A3 im Menübereich auch nicht', q('#filterKnopf').hidden === true);
  setTab('lernsets');
  pruefe('A4 in einer Übung schon', q('#filterKnopf').hidden === false);
  pruefe('A5 er trägt ein Symbol, keinen Text',
    !!q('#filterKnopf svg') && q('#filterKnopf').textContent.trim() === '');
  pruefe('A6 Trefferfläche groß genug',
    q('#filterKnopf').getBoundingClientRect().height >= 44);

  // B · Aufklappen wie im Menü
  pruefe('B1 zugeklappt keine Höhe',
    getComputedStyle(q('#filterPanel')).gridTemplateRows === '0px',
    getComputedStyle(q('#filterPanel')).gridTemplateRows);
  pruefe('B2 zugeklappt nicht erreichbar', q('[data-fw]').tabIndex === -1);
  q('#filterKnopf').click();
  q('#filterPanel').style.transition = 'none';
  void q('#filterPanel').offsetWidth;
  pruefe('B3 Klick öffnet', filterOffen &&
    q('#filterKnopf').getAttribute('aria-expanded') === 'true' &&
    parseFloat(getComputedStyle(q('#filterPanel')).gridTemplateRows) > 20,
    getComputedStyle(q('#filterPanel')).gridTemplateRows);
  q('#filterPanel').style.transition = '';
  pruefe('B4 es liegt als Ebene unter dem Knopf',
    getComputedStyle(q('#filterPanel')).position === 'absolute' &&
    q('#filterPanel').getBoundingClientRect().top >= q('#filterKnopf').getBoundingClientRect().bottom - 1);
  pruefe('B5 offen erreichbar', q('[data-fw]').tabIndex === 0);
  var vorOffen = main.getBoundingClientRect().top;
  pruefe('B6 der Inhalt bleibt stehen', Math.abs(main.getBoundingClientRect().top - vorOffen) < 0.5);

  // C · Menü und Auswahl schließen einander
  q('#menuKnopf').click();
  pruefe('C1 das Menü schließt die Auswahl', menuOffen && !filterOffen);
  q('#filterKnopf').click();
  pruefe('C2 und umgekehrt', filterOffen && !menuOffen);
  document.body.click();
  pruefe('C3 daneben tippen schließt', !filterOffen);

  // D · Lernsets
  setTab('lernsets');
  uebAuswahl = 'aktuell';
  q('#filterKnopf').click();
  pruefe('D1 Gruppen mit Überschrift', alle('.filtergruppe').length === 2 &&
    alle('.filter-titel')[0].textContent === 'Auswahl');
  pruefe('D2 alle Sets zur Wahl', alle('[data-fw="set"]').length === LERNSETS.length + 2);
  pruefe('D3 das laufende ist markiert',
    q('[data-fw="set"][data-fv="aktuell"]').classList.contains('active'));
  pruefe('D4 Regelfall färbt den Knopf nicht', !q('#filterKnopf').classList.contains('aktiv'));
  q('[data-fw="set"][data-fv="alle"]').click();
  pruefe('D5 Auswahl wirkt und schließt', uebAuswahl === 'alle' && !filterOffen);
  pruefe('D6 abweichende Auswahl färbt den Knopf',
    q('#filterKnopf').classList.contains('aktiv'));
  pruefe('D7 die Ansicht sagt, was gilt',
    main.textContent.indexOf('Alles Freigeschaltete') !== -1);
  q('#filterKnopf').click();
  pruefe('D8 der neue Stand ist markiert',
    q('[data-fw="set"][data-fv="alle"]').classList.contains('active'));
  q('[data-fw="set"][data-fv="aktuell"]').click();
  pruefe('D9 zurück auf den Regelfall', !q('#filterKnopf').classList.contains('aktiv'));

  // E · Freestyle
  setTab('freestyle');
  uebThema = 'Alle';
  renderKopf();
  q('#filterKnopf').click();
  pruefe('E1 alle Themen zur Wahl',
    alle('[data-fw="thema"]').length === Object.keys(VOCAB_THEMES).length + 1);
  pruefe('E2 lange Liste bleibt scrollbar',
    getComputedStyle(q('.filterpanel .menuinhalt')).overflowY === 'auto');
  var thema = Object.keys(VOCAB_THEMES)[2];
  alle('[data-fw="thema"]').filter(function (b) { return b.dataset.fv === thema; })[0].click();
  pruefe('E3 Thema gesetzt', uebThema === thema && q('#filterKnopf').classList.contains('aktiv'), uebThema);
  pruefe('E4 die Ansicht nennt es', main.textContent.indexOf(thema) !== -1);
  uebThema = 'Alle'; uebNext(true); renderKopf();

  // F · Tippen
  state.boxes = {}; state.lastSeen = {};
  ALL_VOCAB.slice(0, 4).forEach(function (v) { state.boxes[v.id] = 3; state.lastSeen[v.id] = Date.now(); });
  ALL_VOCAB.slice(4, 6).forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now() - 22 * TAG; });
  tippenModus = 'lernen'; tWord = null;
  setTab('tippen');
  q('#filterKnopf').click();
  var st = alle('[data-fw="tmodus"]');
  pruefe('F1 drei Stapel mit Zahlen', st.length === 3 &&
    st[0].textContent.indexOf('Lernen · 4') === 0 &&
    st[1].textContent.indexOf('Wiederholung · 2') === 0 &&
    st[2].textContent.indexOf('Alle · 6') === 0,
    st.map(function (x) { return x.textContent; }).join(' | '));
  st[1].click();
  pruefe('F2 Wechsel wirkt', tippenModus === 'wiederholung' && !filterOffen &&
    q('#filterKnopf').classList.contains('aktiv'));
  pruefe('F3 die Karte sagt es', q('.task-label').textContent.indexOf('Sicherheit') !== -1);

  // G · Übersetzen
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  trLevel = 1; trDir = 'gemischt'; trModus = 'lernen'; trTask = null;
  setTab('uebersetzen');
  q('#filterKnopf').click();
  // Drei Gruppen — und seit ADR 0079 die Zeile «Hilfe» darunter, die in jeder
  // Übung mit eigener Tutorial-Spur steht. Sie ist keine Filtergruppe.
  pruefe('G1 drei Gruppen', alle('.filtergruppe').length === 3 &&
    alle('.filtergruppe .filter-titel').map(function (x) { return x.textContent; }).join(',') === 'Stufe,Richtung,Stapel',
    alle('.filtergruppe .filter-titel').map(function (x) { return x.textContent; }).join(','));
  pruefe('G1b und darunter der Weg zur Tutorial-Spur',
    !!q('[data-fw="tutspur"]') && q('[data-fw="tutspur"]').dataset.fv === 'uebersetzen',
    q('[data-fw="tutspur"]') ? q('[data-fw="tutspur"]').dataset.fv : 'keiner');
  // Die Zahl steht in den Daten, nicht hier: Mit jeder Etappe kommen Sätze
  // dazu, und eine festgeschriebene Zahl wäre nur ein Wartungsposten.
  var wieviele = SENTENCES.filter(function (x) { return x.stufe === 1; }).length;
  pruefe('G2 Stufen mit Bestand',
    q('[data-fw="stufe"][data-fv="1"]').textContent
      .indexOf('Stufe 1 \u00b7 ' + wieviele + '/' + wieviele) === 0,
    q('[data-fw="stufe"][data-fv="1"]').textContent);
  pruefe('G3 Regelfall ungefärbt', !q('#filterKnopf').classList.contains('aktiv'));
  pruefe('G3b «Gemischt» ist der Regelfall',
    q('[data-fw="richtung"][data-fv="gemischt"]').classList.contains('active'));
  q('[data-fw="richtung"][data-fv="de-ru"]').click();
  pruefe('G4 Richtung gewechselt', trDir === 'de-ru' && q('#filterKnopf').classList.contains('aktiv'));
  q('#filterKnopf').click();
  q('[data-fw="stufe"][data-fv="2"]').click();
  pruefe('G5 Stufe gewechselt', trLevel === 2 && !!trTask);
  // Die Stufe steht seit dem Umbau über der Kachel, nicht darin.
  pruefe('G6 die Karte nennt die Stufe', q('.kachel-ort').textContent.indexOf('Stufe 2') === 0,
    q('.kachel-ort').textContent);
  trDir = 'gemischt'; trLevel = 1; trTask = null; buildTransTask();

  // H · Beim Ansichtswechsel schließt alles
  q('#filterKnopf').click();
  setTab('home');
  pruefe('H1 Wechsel schließt die Auswahl', !filterOffen && q('#filterKnopf').hidden === true);
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

writeFileSync(BAU + '/t-filter.html', testseite(html, test));
console.log('Filter-Testseite geschrieben');
