// Prüft, was die App aushält, wenn die Umgebung nicht mitspielt: Offline,
// fehlender Speicher, vergessene Sicherung. Dazu die Tempomessung.
//
// Der Kern: **Diese Dinge fallen niemandem auf, solange alles gutgeht.** Ein
// nicht gestellter Antrag auf dauerhaften Speicher, eine Uhr, die im falschen
// Moment gestellt wird, eine Erinnerung, die nie kommt — nichts davon wirft
// einen Fehler. Genau deshalb gehören sie in eine Suite.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

// Dateiprüfung: Die Höhe steht dreifach — je älterer Browser, desto gröber.
const hatVh = /body\.aufgabe \{[^}]*min-height: 100vh/.test(html);
const hatSvh = html.includes('body.aufgabe { min-height: 100svh; }');
const hatDvh = html.includes('body.aufgabe { min-height: 100dvh; }');
console.log('Höhenangaben: vh', hatVh, '· svh', hatSvh, '· dvh', hatDvh);
if (!hatVh || !hatSvh || !hatDvh) throw new Error('Die Höhe muss dreifach stehen: vh als Rückfall, svh, dvh');
// Gezählt werden **Deklarationen**, nicht Vorkommen: In einem Kommentar darf
// «100vh» stehen — dort erklärt es ja gerade, warum es sonst nirgends steht.
const vhStellen = (html.match(/min-height: 100vh/g) || []).length;
console.log('«min-height: 100vh»:', vhStellen, vhStellen === 1 ? '(nur als Rückfall · richtig)' : '(unerwartet!)');
if (vhStellen !== 1) throw new Error('«min-height: 100vh» steht ' + vhStellen + '× statt einmal');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }

try {
  tutEnde();

  // ── A · Der Antrag auf dauerhaften Speicher ───────────────
  // Er darf abgelehnt werden, er darf fehlen — er darf nur nicht werfen.
  pruefe('A1 die Funktion gibt es', typeof speicherFesthalten === 'function');
  var echt = navigator.storage;
  var gefragt = false;
  try {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persist: function () { gefragt = true; return Promise.resolve(true); } }
    });
    speicherFesthalten();
    pruefe('A2 er wird gestellt, wenn es ihn gibt', gefragt === true);
    // Ein Browser, der wirft: die App muss weiterlaufen.
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persist: function () { throw new Error('nein'); } }
    });
    speicherFesthalten();
    pruefe('A3 ein werfender Browser bringt nichts zu Fall', true);
    // Ein Browser, der ihn gar nicht kennt.
    Object.defineProperty(navigator, 'storage', { configurable: true, value: undefined });
    speicherFesthalten();
    pruefe('A4 ohne die Schnittstelle passiert einfach nichts', true);
  } catch (e) {
    pruefe('A2 er wird gestellt, wenn es ihn gibt', false, e.message);
  }
  try { Object.defineProperty(navigator, 'storage', { configurable: true, value: echt }); } catch (e) {}

  // ── B · Die Statuslampe im Namen (ADR 0061) ───────────────
  // Offline ist bei dieser App kein Fehler, sondern der gedachte Normalfall —
  // die Anzeige ist darum der Punkt hinter dem Namen, nicht eine Warnung.
  // **Die Farbe trägt die Aussage nie allein**, solange Platz für das Wort ist:
  // Auf Home steht es daneben, unterwegs übernimmt das Vorlesefeld.
  setTab('home');
  var n = q('#netzStand');
  var punkt = q('#netzPunkt');
  var wort = q('#netzWort');
  pruefe('B1 die Lampe steht im Kopf', !!n && !!punkt && !!wort);
  pruefe('B2 der Punkt sitzt direkt hinter dem Namen',
    Math.abs(punkt.getBoundingClientRect().left -
      q('#kopfTitel').getBoundingClientRect().right) < 2,
    punkt.getBoundingClientRect().left.toFixed(0) + ' / ' +
    q('#kopfTitel').getBoundingClientRect().right.toFixed(0));
  var echtOnline = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');
  function setzeOnline(wert) {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: function () { return wert; } });
  }
  function punktFarbe() { return getComputedStyle(punkt).color; }
  setzeOnline(true);
  netzZeigen();
  var gruen = punktFarbe();
  pruefe('B3 online sagt sie «Online»',
    wort.textContent === 'Online' && punkt.getAttribute('aria-label') === 'Online',
    wort.textContent);
  pruefe('B4 und das Wort ist zu sehen',
    getComputedStyle(wort).display !== 'none' && !n.classList.contains('nur-punkt'));
  setzeOnline(false);
  netzZeigen();
  var rot = punktFarbe();
  pruefe('B5 offline sagt sie «Offline»',
    wort.textContent === 'Offline' && punkt.getAttribute('aria-label') === 'Offline',
    wort.textContent);
  pruefe('B6 und der Punkt wechselt die Farbe', rot !== gruen, gruen + ' / ' + rot);
  // Rot und Grün sind nicht irgendwelche Farben, sondern die Signalfarben des
  // Schemas — sonst hieße «falsch» in der App etwas anderes als hier.
  var stil = getComputedStyle(document.documentElement);
  function alsRgb(v) {
    var d = document.createElement('span');
    d.style.color = v.trim();
    document.body.appendChild(d);
    var f = getComputedStyle(d).color;
    d.remove();
    return f;
  }
  pruefe('B7 sie nimmt --good und --bad',
    gruen === alsRgb(stil.getPropertyValue('--good')) &&
    rot === alsRgb(stil.getPropertyValue('--bad')),
    gruen + ' / ' + rot);
  // Punkt und Wort sind **eine** Aussage: Die Farbe steht an der Hülle, beide
  // erben sie. Ein graues Wort neben einem roten Punkt sähe aus wie zwei
  // Angaben, von denen eine veraltet ist.
  pruefe('B7b das Wort trägt dieselbe Farbe wie der Punkt',
    getComputedStyle(wort).color === punktFarbe(),
    getComputedStyle(wort).color + ' / ' + punktFarbe());
  // Und es steht dicht daneben — nicht so weit weg, dass es zu etwas
  // anderem zu gehören scheint.
  pruefe('B7c und steht dicht daneben',
    wort.getBoundingClientRect().left - punkt.getBoundingClientRect().right < 8,
    (wort.getBoundingClientRect().left - punkt.getBoundingClientRect().right).toFixed(1) + ' px');
  // Unterwegs bleibt der Punkt, das Wort geht — der Kopf trägt dort den Namen
  // der Übung und den Rückweg.
  // Ohne Überblendung gemessen: Geprüft wird der **Zustand**, nicht die
  // Bewegung dorthin. Seit ADR 0071 wird das Wort eingeklappt statt
  // ausgeblendet — display: none ließ sich nicht überblenden, und beim Wechsel
  // zurück auf Home fiel es in einem Bild auf volle Breite.
  wort.style.transition = 'none';
  setTab('tippen');
  pruefe('B8 unterwegs steht der Punkt allein',
    n.classList.contains('nur-punkt') &&
    wort.getBoundingClientRect().width < 1 &&
    getComputedStyle(wort).opacity === '0',
    wort.getBoundingClientRect().width.toFixed(1) + ' px · ' +
    getComputedStyle(wort).opacity);
  // Und es ist **da** — nur schmal. Ein display: none könnte nicht aufklappen.
  pruefe('B8b es bleibt im Fluss, damit es sich aufklappen lässt',
    getComputedStyle(wort).display !== 'none', getComputedStyle(wort).display);
  wort.style.transition = '';
  pruefe('B9 die Farbe bleibt trotzdem richtig', punktFarbe() === rot);
  // Er ist keine Zierde: Wer nicht sieht, muss ihn hören können.
  pruefe('B10 und wird vorgelesen',
    punkt.getAttribute('role') === 'img' && punkt.getAttribute('aria-label') === 'Offline');
  pruefe('B11 das Wort daneben aber nicht doppelt',
    wort.getAttribute('aria-hidden') === 'true');
  // Der Name der Ansicht ist genau der Name — die Lampe steht daneben, nicht
  // darin. Sonst hieße die Übung «Tippen.».
  pruefe('B12 die Überschrift trägt nur den Namen', q('#kopfTitel').textContent === 'Tippen',
    q('#kopfTitel').textContent);
  setzeOnline(true);
  netzZeigen();
  pruefe('B13 und der Weg zurück geht auch', punktFarbe() === gruen);

  // **Das Wort ist eine Nachricht, kein Etikett** (ADR 0063). Es klappt nach
  // einer Frist zum Punkt hin ein — der trägt die Auskunft danach allein.
  //
  // Für den ganzen Abschnitt ist die Überblendung abgeschaltet: Geprüft werden
  // die **Zustände**, nicht der Weg dazwischen. Seit ADR 0071 klappt das Wort
  // auch beim Erscheinen auf, statt zu springen — gemessen ohne Abschalten
  // stünde hier durchweg ein Zwischenstand.
  wort.style.transition = 'none';
  setTab('home');
  netzZeigen();
  pruefe('B13a frisch gezeigt steht es offen',
    !n.classList.contains('eingeklappt') && wort.getBoundingClientRect().width > 20,
    wort.getBoundingClientRect().width.toFixed(0) + ' px');
  var offen = wort.getBoundingClientRect().width;
  n.classList.add('eingeklappt');
  pruefe('B13b eingeklappt ist es weg',
    wort.getBoundingClientRect().width < 1 &&
    getComputedStyle(wort).maxWidth === '0px',
    wort.getBoundingClientRect().width.toFixed(1) + ' px');
  // Der Punkt ist die Grenze: Er bleibt stehen, wo er stand.
  pruefe('B13c der Punkt bleibt, wo er war',
    Math.abs(punkt.getBoundingClientRect().left -
      q('#kopfTitel').getBoundingClientRect().right) < 2);
  // Ein Wechsel des Netzes ist etwas Neues — dann klappt es wieder auf.
  setzeOnline(false);
  netzZeigen();
  pruefe('B13d ein Wechsel klappt es wieder auf',
    !n.classList.contains('eingeklappt') && wort.textContent === 'Offline');
  // Ein Renderlauf allein ist **kein** Anlass: Sonst stünde das Wort nach
  // jedem Blattwechsel wieder da und die Frist liefe nie ab.
  n.classList.add('eingeklappt');
  netzZeigen();
  pruefe('B13e ein bloßer Renderlauf nicht', n.classList.contains('eingeklappt'));
  // Die Rückkehr auf Home schon — dort sieht man es zum ersten Mal wieder.
  setTab('tippen');
  setTab('home');
  pruefe('B13f die Rückkehr auf Home schon', !n.classList.contains('eingeklappt'));
  pruefe('B13g und es ist wieder so breit wie zuvor',
    Math.abs(wort.getBoundingClientRect().width - offen) < 12,
    wort.getBoundingClientRect().width.toFixed(0) + ' / ' + offen.toFixed(0));
  wort.style.transition = '';
  // **Auf- und Zuklappen sind derselbe Weg** (ADR 0071): dieselbe Dauer, nur
  // rückwärts. Bis 2.4.12 fiel das Wort in einem Bild auf volle Breite, weil
  // «unterwegs» über display: none lief — und was nicht da ist, klappt nicht
  // auf. Gefragt ist die Überblendung selbst, darum ohne Abschalten.
  var uebergang = getComputedStyle(wort).transitionDuration;
  pruefe('B13h beide Wege dauern gleich lang',
    uebergang.split(',').length >= 2 &&
    uebergang.split(',')[0].trim() === '2s', uebergang);
  setzeOnline(true);
  netzZeigen();
  try {
    if (echtOnline) Object.defineProperty(navigator, 'onLine', echtOnline);
  } catch (e) {}
  setTab('home');
  netzZeigen();

  // ── B14 · «Gespeichert» schiebt nichts (ADR 0071) ─────────
  // Die Meldung stand als vollwertiges Feld in der Zeile: Sobald sie erschien,
  // nahm sie Breite, und das Etikett links davon rückte zusammen — die
  // Kopfzeile zuckte bei jeder Antwort. Jetzt klappt sie auf wie der
  // Online-Status, nur vom rechten Rand her.
  setTab('home');
  var note = q('#saveNote');
  var etikett = q('#kopfLabel');
  note.style.transition = 'none';
  note.className = '';
  note.innerHTML = '';
  var zeileVorher = etikett.getBoundingClientRect().width;
  var hoeheVorher = q('.kopf-meta').getBoundingClientRect().height;
  zeigeStatus('ok', 'gespeichert');
  pruefe('B14 die Meldung steht da', note.classList.contains('show') &&
    note.textContent.indexOf('gespeichert') !== -1, note.textContent);
  pruefe('B14b und schiebt das Etikett daneben nicht',
    Math.abs(etikett.getBoundingClientRect().width - zeileVorher) < 1,
    zeileVorher.toFixed(1) + ' -> ' + etikett.getBoundingClientRect().width.toFixed(1));
  pruefe('B14c und macht die Zeile nicht höher',
    Math.abs(q('.kopf-meta').getBoundingClientRect().height - hoeheVorher) < 1,
    hoeheVorher.toFixed(1) + ' -> ' + q('.kopf-meta').getBoundingClientRect().height.toFixed(1));
  // Sie wächst nach links: rechts steht sie am Rand der Zeile.
  pruefe('B14d sie sitzt am rechten Rand',
    Math.abs(note.getBoundingClientRect().right -
      q('.kopf-meta').getBoundingClientRect().right) < 2,
    note.getBoundingClientRect().right.toFixed(0) + ' / ' +
    q('.kopf-meta').getBoundingClientRect().right.toFixed(0));
  // Zugeklappt nimmt sie keinen Platz — genau wie das Wort am Punkt.
  note.className = 'ok';
  pruefe('B14e zugeklappt ist sie weg',
    note.getBoundingClientRect().width < 1,
    note.getBoundingClientRect().width.toFixed(1) + ' px');
  note.style.transition = '';
  note.className = '';
  note.innerHTML = '';

  // ── B2 · Die Augenbraue auf Home ──────────────────────────
  // «Русский · Тренажёр» ist weg, ihr Platz nicht: Ohne Zeilenbox rückte
  // «Chillingo» an den Bildschirmrand.
  pruefe('B14 auf Home steht dort nichts', q('#kopfEyebrow').textContent === '',
    q('#kopfEyebrow').textContent);
  pruefe('B15 der Platz bleibt trotzdem',
    q('#kopfEyebrow').getBoundingClientRect().height > 6,
    q('#kopfEyebrow').getBoundingClientRect().height.toFixed(1) + ' px');
  setTab('tickets');
  pruefe('B16 unterwegs sagt sie weiter, wo man ist',
    q('#kopfEyebrow').textContent === 'Menü', q('#kopfEyebrow').textContent);
  setTab('home');

  // ── C · Die Erinnerung an die Sicherung ───────────────────
  // Sie darf nicht kommen, solange es nichts zu verlieren gibt, und sie muss
  // kommen, bevor es zu spät ist.
  state = defaultState();
  ansichtenZuruecksetzen();
  pruefe('C1 ein frischer Stand hat nie gesichert', state.gesichertAm === 0 && sicherungAlter() === -1);
  pruefe('C2 und wird trotzdem nicht behelligt', sicherungFaellig() === false);
  state.answered = 200;
  pruefe('C3 wer etwas zu verlieren hat, wird erinnert', sicherungFaellig() === true);
  state.gesichertAm = Date.now();
  pruefe('C4 frisch gesichert ist Ruhe', sicherungFaellig() === false && sicherungAlter() === 0);
  state.gesichertAm = Date.now() - (SICHERUNG_FRIST - 1) * TAG;
  pruefe('C5 einen Tag vor der Frist noch Ruhe', sicherungFaellig() === false,
    String(sicherungAlter()));
  state.gesichertAm = Date.now() - (SICHERUNG_FRIST + 1) * TAG;
  pruefe('C6 danach kommt sie', sicherungFaellig() === true, String(sicherungAlter()));
  setTab('bilanz');
  pruefe('C7 und steht wirklich in der Bilanz',
    !!q('.backup-note.warnung') && main.textContent.indexOf('nur auf diesem Gerät') !== -1,
    q('.backup-note.warnung') ? q('.backup-note.warnung').textContent.slice(0, 50) : 'keine Zeile');
  state.gesichertAm = Date.now();
  setTab('bilanz');
  pruefe('C8 sonst steht sie nicht da', !q('.backup-note.warnung'));

  // Der Knopf in der Sicherung setzt den Merker — sonst erinnert die App ewig.
  state.gesichertAm = 0;
  setTab('sicherung');
  q('#bkMake').click();
  pruefe('C9 einen Code erzeugen zählt als gesichert', state.gesichertAm > 0);

  // ── D · Die Uhr ───────────────────────────────────────────
  // Sie steht in den Aufgabenbauern, nicht im Renderlauf: Eine Ansicht wird
  // auch neu gezeichnet, wenn nur die Tastatur aufklappt.
  state = defaultState();
  ansichtenZuruecksetzen();
  ALL_VOCAB.slice(0, 40).forEach(function (v) { state.boxes[v.id] = 2; });
  uebAuswahl = 0;
  setTab('lernsets');
  uebNext(true);
  pruefe('D1 die Uhr läuft nach dem Aufbau', aufgabeSeit > 0, String(aufgabeSeit));
  var vorher = aufgabeSeit;
  renderUeben();
  pruefe('D2 ein Renderlauf stellt sie nicht zurück', aufgabeSeit === vorher);

  // Gemessen wird beim Werten, und der Wert landet unter der laufenden Übung.
  state.tempo = {};
  aufgabeSeit = Date.now() - 1500;
  updateBox(ALL_VOCAB[0].id, true);
  pruefe('D3 eine Antwort wird notiert',
    state.tempo.lernsets && state.tempo.lernsets.n === 1, JSON.stringify(state.tempo));
  pruefe('D4 die Uhr ist danach aus', aufgabeSeit === 0);
  // Zweimal werten ohne neue Aufgabe darf nicht doppelt zählen.
  updateBox(ALL_VOCAB[0].id, true);
  pruefe('D5 ohne laufende Uhr wird nichts notiert', state.tempo.lernsets.n === 1,
    String(state.tempo.lernsets.n));

  // Ausreißer verderben den Schnitt für immer — sie fliegen raus.
  aufgabeSeit = Date.now() - 300000;
  updateBox(ALL_VOCAB[1].id, true);
  pruefe('D6 eine Pause von fünf Minuten zählt nicht', state.tempo.lernsets.n === 1,
    String(state.tempo.lernsets.n));
  aufgabeSeit = Date.now() - 10;
  updateBox(ALL_VOCAB[2].id, true);
  pruefe('D7 ein Zehntelmoment auch nicht', state.tempo.lernsets.n === 1,
    String(state.tempo.lernsets.n));

  // Der Schnitt schweigt, solange zu wenig da ist.
  pruefe('D8 ein Schnitt aus einer Messung ist keiner', tempoSchnitt('lernsets') === null);
  state.tempo.lernsets = { n: 10, ms: 24000 };
  pruefe('D9 ab fünf Messungen gibt es ihn', tempoSchnitt('lernsets') === 2.4,
    String(tempoSchnitt('lernsets')));
  pruefe('D10 für eine Übung ohne Messung nicht', tempoSchnitt('tippen') === null);
  setTab('bilanz');
  pruefe('D11 und er steht in der Bilanz', main.textContent.indexOf('Tempo') !== -1 &&
    main.textContent.indexOf('2.4 s') !== -1);

  // ── E · Alle Übungen stellen ihre Uhr ─────────────────────
  // Vier Wertungstrichter, fünf Aufgabenbauer — wer einen vergisst, misst dort
  // für immer nichts, und niemand merkt es.
  var ohneUhr = [];
  [['tippen', function () {
      ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = 3; });
      tippenModus = 'alle'; setTab('tippen');
    }],
   ['uebersetzen', function () {
      ALL_VOCAB.forEach(function (v) { state.boxes[v.id] = BOX_MAX; });
      trModus = 'alle'; setTab('uebersetzen');
    }],
   ['buchstaben', function () { abcAnsicht = 'ueben'; abcQ = null; setTab('buchstaben'); }],
   ['grammatik', function () {
      GRAMMATIK.forEach(function (x) { state.gramSeen[x.id] = 0; });
      gramBaustein = GRAMMATIK[0].id; gramQ = null; setTab('grammatik');
    }]
  ].forEach(function (o) {
    aufgabeSeit = 0;
    o[1]();
    if (!aufgabeSeit) ohneUhr.push(o[0]);
  });
  pruefe('E1 jede Übung stellt ihre Uhr', ohneUhr.length === 0, ohneUhr.join(' '));

  // ── F · Das Tempo ist kein Lernstand ──────────────────────
  // Es gehört ins Gerät, nicht in den Sicherungscode — sonst behauptet ein
  // eingespielter Code ein Tempo, das jemand anders gebraucht hat.
  state.tempo = { lernsets: { n: 9, ms: 9000 } };
  state.gesichertAm = 12345;
  var code = encodeBackup();
  var zurueck = decodeBackup(code);
  pruefe('F1 das Tempo reist nicht mit',
    !zurueck.tempo || !zurueck.tempo.lernsets, JSON.stringify(zurueck.tempo));
  pruefe('F2 der Sicherungszeitpunkt auch nicht', !zurueck.gesichertAm);
  pruefe('F3 ein alter Stand bekommt beide Felder',
    JSON.stringify(mergeState({ boxes: {} }).tempo) === '{}' &&
    mergeState({ boxes: {} }).gesichertAm === 0);
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

writeFileSync(BAU + '/t-robust.html', testseite(html, test));
console.log('Robust-Testseite geschrieben');
