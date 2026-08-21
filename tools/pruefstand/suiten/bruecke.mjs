// Prüft «Mehr …» als aufklappendes Blatt und den Rückweg durch die Ansichten.
// Der dritte Teil — die Brücke Buchstaben→Freestyle — ist mit dem Lesemodus
// entfallen (ADR 0091).
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

  // ── A · «Mehr …» klappt auf wie das Menü ──────────────────
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
  state.gramSeen[GRAMMATIK[0].id] = Date.now();
  state.gramBox[GRAMMATIK[0].id] = 1;
  gramWahl = GRAMMATIK[0].id;
  setTab('grammatik');
  pruefe('A1 die Regelkarte liegt schon im Baum', !!q('#gramRegelKlapp'));
  pruefe('A2 zugeklappt trägt sie kein «auf»',
    !q('#gramRegelKlapp').classList.contains('auf'));
  pruefe('A3 zugeklappt ist sie vor Vorlesern verborgen',
    q('#gramRegelKlapp').getAttribute('aria-hidden') === 'true');
  pruefe('A4 der Knopf heißt «Mehr …»', q('#gramWarum').textContent.indexOf('Mehr') === 0);
  pruefe('A5 und meldet seinen Zustand',
    q('#gramWarum').getAttribute('aria-expanded') === 'false');
  var klappVorher = q('#gramRegelKlapp');
  tippe(q('#gramWarum'));
  pruefe('A6 ein Tipp klappt auf', q('#gramRegelKlapp').classList.contains('auf'));
  pruefe('A7 ohne neu zu zeichnen — sonst gäbe es keinen Übergang',
    q('#gramRegelKlapp') === klappVorher);
  pruefe('A8 der Knopf meldet den neuen Zustand',
    q('#gramWarum').getAttribute('aria-expanded') === 'true');
  pruefe('A9 und die Karte ist wieder erreichbar',
    q('#gramRegelKlapp').getAttribute('aria-hidden') === 'false');
  pruefe('A10 die Karte trägt Tabelle und Merksatz',
    !!q('#gramRegelKlapp .gram-tabelle') && !!q('#gramRegelKlapp .gram-merk'));
  tippe(q('#gramWarum'));
  pruefe('A11 nochmal tippen klappt zu', !q('#gramRegelKlapp').classList.contains('auf'));
  pruefe('A12 der Zustand steht in gramRegelOffen', gramRegelOffen === false);

  // ── B · Der Rückweg führt zurück, nicht nach Hause ─────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('home');
  setTab('bilanz');
  pruefe('B1 von Home in die Bilanz', currentTab === 'bilanz');
  setTab('fakten');
  pruefe('B2 weiter zu den Fakten', currentTab === 'fakten');
  zurueckGehen();
  pruefe('B3 zurück führt in die Bilanz', currentTab === 'bilanz', currentTab);
  zurueckGehen();
  pruefe('B4 von dort nach Home', currentTab === 'home', currentTab);
  pruefe('B5 der Stapel ist leer', ansichtStapel.length === 0, String(ansichtStapel.length));

  setTab('bilanz');
  setTab('sicherung');
  zurueckGehen();
  pruefe('B6 auch aus der Sicherung geht es in die Bilanz', currentTab === 'bilanz', currentTab);

  // Ein Rundweg darf den Stapel nicht wachsen lassen.
  setTab('home');
  setTab('bilanz');
  setTab('sicherung');
  setTab('bilanz');
  pruefe('B7 ein Rundweg schneidet den Stapel ab',
    ansichtStapel.join(',') === 'home', ansichtStapel.join(','));
  zurueckGehen();
  pruefe('B8 und führt danach nach Home', currentTab === 'home');

  // Home räumt den Stapel — dort endet jeder Weg.
  setTab('bilanz');
  setTab('fakten');
  setTab('home');
  pruefe('B9 Home räumt den Stapel leer', ansichtStapel.length === 0);

  // Aus einer Übung heraus gilt derselbe Weg.
  setTab('lernsets');
  zurueckGehen();
  pruefe('B10 aus einer Übung nach Home', currentTab === 'home');

  // Die Detailansicht der Bilanz behält ihren eigenen Zwischenschritt.
  setTab('bilanz');
  bilanzDetail = 'woerter';
  zurueckGehen();
  pruefe('B11 erst die Detailansicht schließen', currentTab === 'bilanz' && !bilanzDetail);
  zurueckGehen();
  pruefe('B12 dann erst weiter zurück', currentTab === 'home');

  // Der «Zurück»-Knopf in den Menüansichten geht denselben Weg.
  setTab('bilanz');
  setTab('einstellungen');
  pruefe('B13 die Einstellungen haben einen Zurück-Knopf', !!q('#setBack'));
  tippe(q('#setBack'));
  pruefe('B14 er führt in die Bilanz', currentTab === 'bilanz', currentTab);

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

writeFileSync(BAU + '/t-bruecke.html', testseite(html, test));
console.log('Brücken-Testseite geschrieben');
