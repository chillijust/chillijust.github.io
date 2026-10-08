// Prüft die vier Tickets: Wiederholen können, Wink schließen, keine Schleife,
// und der Weg zur Stufe, auf der die Arbeit liegt.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }

// Der gemeldete Zustand: alles gelernt, alles eben gemeistert.
function allesFertig() {
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) {
    state.boxes[v.id] = BOX_MAX;
    state.lastSeen[v.id] = Date.now();
  });
  SENTENCES.forEach(function (s) {
    state.satzBox[s.ru] = BOX_MAX;
    state.satzSeen[s.ru] = Date.now();
  });
  ALPHABET.forEach(function (b) {
    state.abcBox[b[1]] = BOX_MAX;
    state.abcSeen[b[1]] = Date.now();
  });
  GRAMMATIK.forEach(function (b) {
    state.gramSeen[b.id] = Date.now();
    state.gramBox[b.id] = BOX_MAX;
  });
}

try {
  // ── A · Der dritte Stapel: Fertiges wiederholen ───────────
  allesFertig();
  trLevel = 1;
  pruefe('A0 nichts ist offen — der gemeldete Fall',
    trLernen(1).length === 0 && trFertig(1).length > 0,
    trFertig(1).length + ' fertig');

  trModus = 'alle';
  pruefe('A1 «Alle» gibt den ganzen freigeschalteten Bestand her',
    trPool().length === freieSaetze(1).length && trPool().length > 0,
    String(trPool().length));
  trTask = null;
  buildTransTask();
  pruefe('A2 daraus entsteht eine Aufgabe', !!trTask);
  pruefe('A3 und der Stapel bleibt «Alle» — kein Selbstwechsel', trModus === 'alle', trModus);

  setTab('uebersetzen');
  pruefe('A4 keine Leerseite mehr', !q('.leer') && !!q('.card'));

  // Der Chip steht in der Auswahl und lässt sich wählen.
  filterSetzen(true);
  renderFilter();
  var chips = alle('[data-fw="trmodus"]').map(function (c) { return c.dataset.fv; });
  pruefe('A5 zwei Stapel stehen zur Wahl',
    chips.join(',') === 'lernen,alle', chips.join(','));
  pruefe('A6 «Alle» nennt seine Zahl',
    alle('[data-fw="trmodus"]')[1].textContent.indexOf(String(freieSaetze(1).length)) !== -1,
    alle('[data-fw="trmodus"]')[1].textContent);
  filterWaehlen('trmodus', 'lernen');
  pruefe('A7 zurück auf «Lernen» führt in den Leerzustand',
    trModus === 'lernen' && !!q('.leer'));
  filterWaehlen('trmodus', 'alle');
  pruefe('A8 und «Alle» wieder heraus', trModus === 'alle' && !q('.leer'));

  // Eine Antwort im «Alle»-Stapel zählt ganz normal.
  var satz = trTask.satz;
  var vorher = satzBox(satz);
  trBuilt = trTask.targetTokens.map(function (w, i) {
    return trTask.tiles.filter(function (t) { return normalize(t.word) === normalize(w); })[i === -1 ? 0 : 0].key;
  });
  trEingabe = trTask.solution;
  trPruefen();
  pruefe('A9 richtig bleibt auf der Endstufe',
    satzBox(satz) === BOX_MAX && vorher === BOX_MAX, String(satzBox(satz)));
  pruefe('A10 und schiebt die Auffrischung nach hinten',
    state.satzSeen[satz.ru] > 0);

  // ── B · Keine Schleife in der Empfehlung ──────────────────
  allesFertig();
  pruefe('B1 leere Übungen sind gekennzeichnet',
    uebungsStand('buchstaben').leer === true &&
    uebungsStand('uebersetzen').leer === true &&
    uebungsStand('tippen').leer === true &&
    uebungsStand('grammatik').leer === true);
  pruefe('B2 gesperrt bleibt gesperrt', uebungsStand('power').gesperrt === true);
  pruefe('B3 volle Übungen tragen kein «leer»', !uebungsStand('lernsets').leer);

  ['buchstaben', 'uebersetzen', 'tippen', 'grammatik'].forEach(function (id) {
    state.zuletzt = { uebung: id, zeit: Date.now() };
    var e = empfehlung();
    // **Ins Leere führt sie nie.** Seit ADR 0091 darf sie sehr wohl nach
    // «Tippen» zeigen, wenn sonst alles erledigt ist — dann bringt sie aber
    // den Stapel «Alle» mit, und dort steht etwas. Der Leerzustand, den der
    // Test meint, gehört dem Lernstapel.
    var mitStapel = e.ziel === 'tippen' && e.stapel === 'alle' &&
      tippenWoerter(null, 'alle').length > 0;
    pruefe('B4.' + id + ' führt nicht in die leere Übung zurück',
      e.ziel !== id || mitStapel, e.ziel + ' — ' + e.titel);
  });

  // Wo etwas zu tun ist, führt «Weiter mit …» weiterhin dorthin.
  state.abcBox[ALPHABET[0][1]] = 1;
  state.abcSeen[ALPHABET[0][1]] = 1;
  state.zuletzt = { uebung: 'buchstaben', zeit: Date.now() };
  pruefe('B5 mit offener Arbeit führt sie sehr wohl dorthin',
    empfehlung().ziel === 'buchstaben', empfehlung().ziel);
  pruefe('B6 und nennt den Stand',
    empfehlung().titel.indexOf('Weiter mit') === 0);

  // Der Knopf auf Home landet auch dort, wo etwas ist.
  allesFertig();
  state.zuletzt = { uebung: 'buchstaben', zeit: Date.now() };
  setTab('home');
  var ziel = empfehlung().ziel;
  tippe(q('#homeEmpf'));
  pruefe('B7 der Empfehlungsknopf führt dorthin', currentTab === ziel, currentTab);
  pruefe('B8 und nicht in einen Leerzustand', !q('.leer'), currentTab);

  // ── C · Der Weg zur Stufe mit Arbeit ──────────────────────
  allesFertig();
  var stufen = satzStufen();
  pruefe('C0 es gibt mehr als eine Stufe', stufen.length > 1, stufen.join(','));
  var offenerSatz = stufenSaetze(stufen[1]).filter(satzFrei)[0];
  state.satzBox[offenerSatz.ru] = 1;

  trLevel = stufen[0];
  trModus = 'lernen';
  pruefe('C1 Home zählt ihn', uebungsStand('uebersetzen').text.indexOf('1 offen') === 0,
    uebungsStand('uebersetzen').text);
  pruefe('C2 die eigene Stufe hat nichts',
    trLernen(trLevel).length === 0);
  pruefe('C3 trStufeMitArbeit findet die andere',
    !!trStufeMitArbeit() && trStufeMitArbeit().stufe === stufen[1],
    JSON.stringify(trStufeMitArbeit()));

  trTask = null;
  setTab('uebersetzen');
  pruefe('C4 der Leerzustand nennt sie', !!q('#trZuStufe'));
  pruefe('C5 mit Stufe und Zahl',
    q('#trZuStufe').textContent.indexOf('Stufe ' + stufen[1]) !== -1 &&
    q('#trZuStufe').textContent.indexOf('1 offen') !== -1, q('#trZuStufe').textContent);
  tippe(q('#trZuStufe'));
  pruefe('C6 ein Tipp bringt einen hin', trLevel === stufen[1], String(trLevel));
  pruefe('C7 und die Aufgabe steht da', !q('.leer') && !!trTask);
  pruefe('C8 es ist der offene Satz', trTask.satz.ru === offenerSatz.ru, trTask.satz.ru);
  pruefe('C9 der Chip der Auswahl ist mitgewandert',
    (function () {
      filterSetzen(true);
      renderFilter();
      var aktiv = alle('[data-fw="stufe"]').filter(function (c) {
        return c.classList.contains('active');
      })[0];
      filterSetzen(false);
      return aktiv && parseInt(aktiv.dataset.fv, 10) === stufen[1];
    })());

  // Ist überall etwas zu tun, drängt sich der Knopf nicht auf.
  allesFertig();
  trLevel = stufen[0];
  trModus = 'lernen';
  pruefe('C10 ohne Arbeit anderswo kein Knopf', trStufeMitArbeit() === null);
  trTask = null;
  setTab('uebersetzen');
  pruefe('C11 und er steht auch nicht da', !q('#trZuStufe'));

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

writeFileSync(BAU + '/t-fertig.html', testseite(html, test));
console.log('Fertig-Testseite geschrieben');
