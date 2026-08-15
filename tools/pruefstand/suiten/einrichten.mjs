// Prüft die Übersicht-Einrichtung (ADR 0075) und die Defizite in der Bilanz.
//
// Das Ziehen ist der Teil, den man am leichtesten falsch baut und am
// schwersten von Hand nachprüft: Ein Zeigerereignis ist kein Klick, und ohne
// Aufnahme des Zeigers verliert die Zeile ihn, sobald sie unter ihm wegrutscht.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

// Einen Zug nachstellen: aufsetzen, weit genug ziehen, über der Zielrubrik
// loslassen. Genau die Ereignisse, die ein Finger auslöst.
function zeiger(el, art, y) {
  var e = new PointerEvent(art, {
    bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch',
    clientX: 200, clientY: y
  });
  el.dispatchEvent(e);
  return e;
}
function ziehe(id, zielRubrik) {
  var zeile = q('.einr-zeile[data-eid="' + id + '"]');
  var ziel = q('.einr-liste[data-liste="' + zielRubrik + '"]');
  var r = zeile.getBoundingClientRect();
  var zr = ziel.getBoundingClientRect();
  var zielY = zr.top + zr.height / 2;
  zeiger(zeile, 'pointerdown', r.top + 20);
  zeiger(zeile, 'pointermove', r.top + 40);   // über die Schwelle
  zeiger(zeile, 'pointermove', zielY);
  zeiger(zeile, 'pointerup', zielY);
}

try {
  tutEnde();
  state = defaultState();
  ansichtenZuruecksetzen();
  state.tutorialFertig = true;

  // ── A · Die Ansicht steht ─────────────────────────────────
  setTab('einrichten');
  pruefe('A1 die Ansicht gibt es', currentTab === 'einrichten' && !!q('[data-liste="oben"]'));
  pruefe('A2 sie trägt einen Namen im Kopf',
    q('#kopfTitel').textContent === ANSICHT_NAME.einrichten, q('#kopfTitel').textContent);
  pruefe('A3 drei Rubriken, in dieser Ordnung',
    alle('.einr-liste').map(function (l) { return l.dataset.liste; }).join() ===
      'oben,weitere,versteckt');
  pruefe('A4 jede Übung steht genau einmal darin', (function () {
    var ids = alle('.einr-zeile').map(function (z) { return z.dataset.eid; });
    return ids.length === 8 && ids.filter(function (x, i) { return ids.indexOf(x) !== i; }).length === 0;
  })(), alle('.einr-zeile').map(function (z) { return z.dataset.eid; }).join());
  pruefe('A5 es gibt einen Weg zurück und einen zur Automatik',
    !!q('#einrAuto') && !!q('#einrFertig'));

  // ── B · Ziehen ────────────────────────────────────────────
  // Die Zeile muss den Zeiger halten: touch-action none, sonst scrollt die
  // Seite unter dem Finger weg, statt zu ziehen.
  pruefe('B0 die Zeilen geben das Scrollen ab',
    getComputedStyle(q('.einr-zeile')).touchAction === 'none',
    getComputedStyle(q('.einr-zeile')).touchAction);

  ziehe('grammatik', 'versteckt');
  pruefe('B1 ins Versteck gezogen', einrRubrik('grammatik') === 'versteckt' &&
    state.settings.homeAus.indexOf('grammatik') !== -1, einrRubrik('grammatik'));
  pruefe('B1b und die Ansicht zeigt es',
    !!q('.einr-liste[data-liste="versteckt"] [data-eid="grammatik"]'));

  ziehe('grammatik', 'oben');
  pruefe('B2 nach oben gezogen', einrRubrik('grammatik') === 'oben' &&
    state.settings.homeAus.indexOf('grammatik') === -1, einrRubrik('grammatik'));
  pruefe('B2b jetzt ist die obere Rubrik von Hand eingerichtet',
    !!state.settings.homeOben && state.settings.homeOben.indexOf('grammatik') !== -1,
    String(state.settings.homeOben));

  // **Ein bloßer Tipp ist kein Zug.** Unter acht Pixeln passiert nichts —
  // sonst verlöre jeder Tipp auf einen Pfeil sein Ereignis.
  var vorher = einrRubrik('grammatik');
  var z = q('.einr-zeile[data-eid="grammatik"]');
  var rr = z.getBoundingClientRect();
  zeiger(z, 'pointerdown', rr.top + 20);
  zeiger(z, 'pointermove', rr.top + 22);
  zeiger(z, 'pointerup', rr.top + 22);
  pruefe('B3 ein Tipp verschiebt nichts', einrRubrik('grammatik') === vorher,
    vorher + ' -> ' + einrRubrik('grammatik'));

  // ── C · Was die Übersicht daraus macht ────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  state.tutorialFertig = true;
  state.settings.homeOben = ['power'];
  setTab('home');
  pruefe('C1 die obere Rubrik heißt «Meine Auswahl»',
    main.textContent.indexOf('Meine Auswahl') !== -1);
  pruefe('C2 sie enthält genau das Angeheftete',
    homeOben(null).join() === 'power', homeOben(null).join());
  // **Auch ohne Arbeit.** Das Power-Training ist bei leerem Lernstand sogar
  // gesperrt — von Hand hingezogen heißt trotzdem: Ich will es sehen. Die
  // Automatik überspringt Gesperrtes und Leeres; eine Anordnung nicht.
  pruefe('C3 auch dann, wenn dort gerade nichts zu tun ist',
    (uebungsStand('power').leer || uebungsStand('power').gesperrt) &&
    !!q('#main [data-uebung="power"]') &&
    homeFaellig(null).indexOf('power') === -1,
    JSON.stringify(uebungsStand('power')));
  pruefe('C4 und die Höchstzahl von drei gilt für Angeheftetes nicht', (function () {
    state.settings.homeOben = ['power', 'grammatik', 'buchstaben', 'tippen', 'freestyle'];
    renderHome();
    return homeOben(null).length === 5;
  })(), String(homeOben(null).length));
  pruefe('C5 nichts steht zweimal auf der Seite', (function () {
    var ids = alle('#main [data-uebung]').map(function (b) { return b.dataset.uebung; });
    return ids.filter(function (x, i) { return ids.indexOf(x) !== i; }).length === 0;
  })(), alle('#main [data-uebung]').map(function (b) { return b.dataset.uebung; }).join());

  // Alles oben: Der untere Bereich sagt es, statt leer dazustehen.
  state.settings.homeOben = alleUebungIds().slice();
  renderHome();
  pruefe('C6 ist unten nichts übrig, steht dort eine Zeile',
    q('#homeAlle').textContent.indexOf('Alles steht schon oben') !== -1,
    q('#homeAlle').textContent.slice(0, 60));

  // Und die Automatik verhält sich wie eh und je.
  state.settings.homeOben = null;
  renderHome();
  pruefe('C7 ohne eigene Einrichtung entscheidet die App',
    homeOben(null).join() === homeFaellig(null).join() &&
    homeOben(null).length <= HOME_FAELLIG_MAX,
    homeOben(null).join());

  // ── D · Defizite in der Bilanz ────────────────────────────
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('bilanz');
  pruefe('D1 ohne Befund steht der Abschnitt trotzdem da',
    main.textContent.indexOf('Defizite') !== -1);

  // Vier Quellen, vier Zeilen. Erst alles gemeistert, damit nichts anderes
  // dazwischenfunkt — sonst prüfte man den Zufall.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; state.lastSeen[v.id] = Date.now(); });
  ALPHABET.forEach(function (b) { state.abcBox[b[1]] = BOX_MAX; state.abcSeen[b[1]] = Date.now(); });
  SENTENCES.forEach(function (x) { state.satzBox[x.ru] = BOX_MAX; state.satzSeen[x.ru] = Date.now(); });
  setTab('bilanz');
  pruefe('D2 mit allem gemeistert meldet sie nichts',
    defizite().length === 0, defizite().map(function (d) { return d.titel; }).join());

  // 1 · Zurückgefallen
  var gefallen = ALL_VOCAB[0];
  state.boxes[gefallen.id] = SATZ_STUFE - 1;
  state.patzer[gefallen.id] = Date.now();
  pruefe('D3 ein zurückgefallenes Wort meldet sich',
    defizite().some(function (d) { return d.titel === 'Zurückgefallen'; }),
    defizite().map(function (d) { return d.titel; }).join());

  // 2 · Verwechslungen — erst ab zwei, ein Ausrutscher ist kein Muster.
  state.verwechselt[ALL_VOCAB[1].id] = {};
  state.verwechselt[ALL_VOCAB[1].id][ALL_VOCAB[2].id] = 1;
  pruefe('D4 eine einzelne Verwechslung ist noch kein Defizit',
    !defizite().some(function (d) { return d.titel === 'Verwechselt'; }));
  state.verwechselt[ALL_VOCAB[1].id][ALL_VOCAB[2].id] = 3;
  pruefe('D5 eine wiederkehrende schon',
    defizite().some(function (d) { return d.titel === 'Verwechselt'; }));

  // 3 · Zeichen
  state.abcBox[ALPHABET[0][1]] = 0;
  pruefe('D6 ein wackliges Zeichen meldet sich',
    defizite().some(function (d) { return d.titel.indexOf('Zeichen') === 0; }));

  // 4 · Überfällig
  ALL_VOCAB.slice(0, 5).forEach(function (v) { state.lastSeen[v.id] = 1; });
  pruefe('D7 Überfälliges meldet sich',
    defizite().some(function (d) { return d.titel === 'Überfällig'; }));

  // **Jede Zeile nennt einen Weg dorthin** — ein Defizit ohne Ausgang ist ein
  // Vorwurf, mit Ausgang ein Vorschlag.
  setTab('bilanz');
  pruefe('D8 jedes Defizit trägt eine Begründung',
    defizite().every(function (d) { return d.warum && d.warum.length > 20; }));
  pruefe('D9 und einen Knopf, der irgendwohin führt',
    alle('[data-defizit]').length > 0 &&
    alle('[data-defizit]').every(function (b) {
      return UEBUNG_NAME[b.dataset.defizit] !== undefined;
    }),
    alle('[data-defizit]').map(function (b) { return b.dataset.defizit; }).join());
  var knopf = alle('[data-defizit]')[0];
  var ziel = knopf.dataset.defizit;
  knopf.click();
  pruefe('D10 der Knopf führt auch wirklich hin', currentTab === ziel, currentTab);

  // Ein Defizit, dessen Übung zu ist, bietet keinen Ausgang an — er führte
  // ins Leere.
  state = defaultState();
  ansichtenZuruecksetzen();
  state.boxes[ALL_VOCAB[0].id] = SATZ_STUFE - 1;
  state.patzer[ALL_VOCAB[0].id] = Date.now();
  pruefe('D11 ein geschlossenes Power-Training bekommt keinen Knopf',
    ptOffen() === false &&
    defizite().filter(function (d) { return d.titel === 'Zurückgefallen'; })[0].ziel === null,
    String(ptOffen()));
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

writeFileSync(BAU + '/t-einrichten.html', testseite(html, test));
console.log('Einrichten-Testseite geschrieben');
