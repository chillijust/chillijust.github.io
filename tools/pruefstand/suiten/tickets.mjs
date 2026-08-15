// Prüft das Ticketsystem: Speichern, Adressbau, Absicherung.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

// Dateiprüfung: gar keine Fremdadresse
const adressen = [...new Set([...html.matchAll(/https?:\/\/[^\s'"<>)]+/g)].map((m) => m[0]))];
console.log('Fremdadressen im Quelltext:', adressen.length ? adressen : '(keine)');
if (adressen.length) { console.error('Unerwartet!'); process.exit(1); }

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  // A · Content-Security-Policy
  var meta = q('meta[http-equiv="Content-Security-Policy"]').content;
  pruefe('A1 nichts darf geladen werden', meta.indexOf("default-src 'none'") !== -1);
  pruefe('A2 eingebettete Bilder bleiben erlaubt', meta.indexOf('img-src data:') !== -1);
  pruefe('A3 kein Verbindungsaufbau erlaubt', meta.indexOf('connect-src') === -1 &&
    meta.indexOf("default-src 'none'") !== -1);
  pruefe('A4 die App läuft trotzdem', !!q('#chiliFigur') && !!q('#menuKnopf') && FACTS.length > 0);
  pruefe('A5 Maskottchen wird angezeigt', q('#chiliFigur').complete !== false &&
    q('#chiliFigur').naturalWidth > 0, String(q('#chiliFigur').naturalWidth));
  pruefe('A6 App-Symbol ist eingebettet',
    q('link[apple-touch-icon], link[rel="apple-touch-icon"]').href.indexOf('data:image/png') === 0);

  // B · Anlegen und Aufbewahren
  tickets = [];
  var t = ticketAnlegen('bug', '  Chili hängt beim Scrollen  ', 'Sie läuft nach.', 'bilanz');
  pruefe('B1 Ticket liegt vorn', tickets.length === 1 && tickets[0] === t);
  pruefe('B2 Art normalisiert', t.art === 'bug');
  pruefe('B3 Rubrik im Klartext', t.reiter === 'Bilanz', t.reiter);
  pruefe('B4 Stand mitgeschrieben', /^\d{4}-\d{2}-\d{2}$/.test(t.stand), t.stand);
  pruefe('B5 Gerät mitgeschrieben', t.geraet.length > 10 && t.geraet.length <= 180);
  pruefe('B6 noch nicht übergeben', t.uebergeben === null);
  var w = ticketAnlegen('feature', 'Dunkelmodus pro Rubrik', '', 'tippen');
  pruefe('B7 unbekannte Art wird Wunsch', w.art === 'feature');
  pruefe('B8 Kennungen sind verschieden', t.id !== w.id);
  pruefe('B9 Zeitstempel steigt streng', w.erstellt > t.erstellt, t.erstellt + ' → ' + w.erstellt);

  // C · Eigener Speicherschlüssel
  pruefe('C1 Tickets stehen nicht im Lernstand',
    JSON.stringify(state).indexOf('Chili hängt') === -1);
  var roh = localStorage.getItem('chillingo_tickets_v1');
  pruefe('C2 eigener Schlüssel gefüllt', !!roh && JSON.parse(roh).tickets.length === 2);
  tickets = [];
  ticketsLaden();
  pruefe('C3 wird wieder eingelesen', tickets.length === 2 && tickets[1].titel === 'Chili hängt beim Scrollen');
  localStorage.setItem('chillingo_tickets_v1', '{kein json');
  ticketsLaden();
  pruefe('C4 kaputter Stand wirft nicht', tickets.length === 0);
  // Alter Zustand «gesendet» wandert auf «übergeben»
  localStorage.setItem('chillingo_tickets_v1', JSON.stringify({ tickets: [
    { id: 'x', art: 'bug', titel: 'Alt', text: '', reiter: 'Bilanz', stand: '2026-01-01',
      geraet: 'alt', erstellt: 1, gesendet: 4711 }
  ] }));
  ticketsLaden();
  pruefe('C5 alter Zustand wandert mit', tickets[0].uebergeben === 4711 && tickets[0].gesendet === undefined);
  tickets = [t, w];
  ticketsSichern();

  // D · Der gebündelte Text
  var txt = ticketsAlsText(tickets);
  pruefe('D1 nennt Anzahl im Kopf', txt.indexOf('# Chillingo · 2 Tickets') === 0, txt.slice(0, 40));
  pruefe('D2 älteste Nummer zuerst',
    txt.indexOf('## 1 · Fehler: Chili hängt beim Scrollen') < txt.indexOf('## 2 · Wunsch:'),
    txt.slice(0, 120));
  pruefe('D3 Beschreibung steht drin', txt.indexOf('Sie läuft nach.') !== -1);
  // «Ort», nicht «Übung»: Der Bezug kann auch die Übersicht oder eine
  // Menüansicht sein.
  pruefe('D4 nennt Ort und Zeit', txt.indexOf('- Ort: Bilanz') !== -1 &&
    txt.indexOf('- Erstellt: ') !== -1, txt.slice(0, 200));
  pruefe('D4a Zeit als Ortszeit mit Versatz', /- Erstellt: \d{4}-\d{2}-\d{2} \d{2}:\d{2} \(UTC[+-]\d{2}/.test(txt),
    (txt.match(/- Erstellt: .*/) || [''])[0]);
  pruefe('D5 Gerät steht einmal am Ende',
    txt.split('Gerät: ').length === 2 && txt.indexOf('Gerät: ') > txt.indexOf('---'));
  // Ein einziger App-Stand gehört in die Fußzeile, nicht an jedes Ticket.
  pruefe('D5a gleicher Stand steht einmal am Ende',
    txt.split('App-Stand: ').length === 2 &&
    txt.indexOf('App-Stand: ') > txt.indexOf('---'), txt.slice(-120));
  var gemischt = ticketsAlsText([
    { id: 'a', art: 'bug', titel: 'Alt', text: '', reiter: '', stand: '2026-01-01',
      erstellt: 1, geraet: 'X' },
    { id: 'b', art: 'wish', titel: 'Neu', text: '', reiter: '', stand: '2026-02-02',
      erstellt: 2, geraet: 'X' }
  ]);
  pruefe('D5b verschiedene Stände stehen an jedem Ticket',
    gemischt.split('App-Stand: ').length === 3 &&
    gemischt.indexOf('App-Stand: 2026-01-01') < gemischt.indexOf('---'), gemischt.slice(-200));
  pruefe('D6 leere Liste ergibt leeren Text', ticketsAlsText([]) === '');
  pruefe('D7 offene Tickets werden erkannt', ticketsOffen().length === 2);

  // E · Ansicht — auf dem echten Weg: Rubrik, Regler, Öffnen
  setTab('tippen');
  q('#menuKnopf').click();
  q('[data-ziel="tickets"]').click();
  pruefe('E0 Weg über das Menü führt hierher',
    currentTab === 'tickets' && letzterTab === 'tippen', currentTab + '/' + letzterTab);
  pruefe('E1 Liste zeigt beide Tickets', alle('.tkzeile').length === 2);
  pruefe('E2 Kopierknopf nennt die Zahl',
    q('#tkKopieren').textContent.indexOf('2 offene') === 0, q('#tkKopieren').textContent);
  pruefe('E3 ohne Übergebene kein Aufräumknopf', !q('#tkAufraeumen') && !q('#tkAlle'));
  q('#tkKopieren').click();
  pruefe('E4 Text erscheint zum Markieren',
    !!q('#tkAusgabe') && q('#tkAusgabe').value.indexOf('# Chillingo · 2 Tickets') === 0);
  pruefe('E5 Feld ist schreibgeschützt', q('#tkAusgabe').readOnly === true);
  pruefe('E6 alles gilt als übergeben', ticketsOffen().length === 0 &&
    typeof tickets[0].uebergeben === 'number');
  q('#tkFertig').click();
  pruefe('E7 zurück zur Liste', !q('#tkAusgabe') && alle('.tkzeile').length === 2);
  pruefe('E8 Zustand steht an der Zeile', main.textContent.indexOf('übergeben') !== -1);
  pruefe('E9 jetzt gibt es «Alle kopieren» und Aufräumen', !!q('#tkAlle') && !!q('#tkAufraeumen'));
  pruefe('E10 kein Kopierknopf für Offene mehr', !q('#tkKopieren'));
  q('#tkAlle').click();
  pruefe('E11 «Alle» nimmt auch Übergebene mit',
    q('#tkAusgabe').value.indexOf('2 Tickets') !== -1);
  q('#tkFertig').click();

  // F · Melden über das schwebende Blatt
  setTab('lernsets');
  pruefe('F0 der Meldeknopf ist überall da', q('#meldeKnopf').hidden !== true &&
    getComputedStyle(q('#meldeKnopf')).position === 'fixed');
  pruefe('F0b er trägt ein Symbol', !!q('#meldeKnopf svg'));
  q('#meldeKnopf').click();
  pruefe('F1 Blatt offen', meldeOffen && !!q('#meldeTitel') &&
    q('#meldeBlatt').getAttribute('aria-hidden') === 'false');
  pruefe('F1b es deckt nur den unteren Teil',
    q('#meldeBlatt').getBoundingClientRect().top > window.innerHeight * 0.25,
    q('#meldeBlatt').getBoundingClientRect().top.toFixed(0) + ' von ' + window.innerHeight);
  pruefe('F2 Titelfeld zoomt nicht heran',
    parseFloat(getComputedStyle(q('#meldeTitel')).fontSize) >= 16);
  pruefe('F3 Textfeld zoomt nicht heran',
    parseFloat(getComputedStyle(q('#meldeText')).fontSize) >= 16);
  // **Der Bezug ist eine Wahl** (ADR 0069), kein Haken: vorbelegt mit der
  // Ansicht, über der das Blatt steht, aber änderbar. Seit ADR 0074 steht sie
  // in einem **Klappfeld** — aus Knöpfen gebaut, nicht als natives
  // Auswahlfeld: Das wäre auf iOS ein Rad über der halben Seite, und die
  // Prüfung ganz oben in dieser Suite bricht darüber ab.
  pruefe('F3b der Bezug steht auf der Ansicht darunter',
    q('#meldeBezug [data-bezug="lernsets"]').classList.contains('an') &&
    meldeBezugWahl === 'lernsets', meldeBezugWahl);
  pruefe('F3c und bietet jede Seite an', (function () {
    var werte = alle('#meldeBezug [data-bezug]').map(function (o) { return o.dataset.bezug; });
    return werte[0] === '' && werte.indexOf('home') !== -1 &&
      werte.indexOf('bilanz') !== -1 && werte.length === meldeSeiten().length + 1;
  })(), alle('#meldeBezug [data-bezug]').length + ' Einträge');
  pruefe('F3d genau eine ist gewählt',
    alle('#meldeBezug .bezug-zeile.an').length === 1,
    String(alle('#meldeBezug .bezug-zeile.an').length));
  // Zugeklappt sagt der Knopf, was gewählt ist — sonst müsste man aufklappen,
  // um zu sehen, was man gerade meldet.
  pruefe('F3e zugeklappt steht die Wahl auf dem Knopf',
    q('#meldeBezug').hidden === true &&
    q('#meldeBezugKnopf').getAttribute('aria-expanded') === 'false' &&
    q('#meldeBezugName').textContent === 'Lernsets',
    q('#meldeBezugName').textContent);
  q('#meldeBezugKnopf').click();
  pruefe('F3f ein Tipp klappt die Liste auf',
    q('#meldeBezug').hidden === false &&
    q('#meldeBezugKnopf').getAttribute('aria-expanded') === 'true' &&
    q('#meldeBezug [data-bezug="bilanz"]').getClientRects().length > 0);
  q('#meldeBezug [data-bezug="bilanz"]').click();
  pruefe('F3g eine Wahl schließt sie wieder',
    meldeBezugWahl === 'bilanz' && q('#meldeBezug').hidden === true &&
    q('#meldeBezugName').textContent === 'Bilanz',
    meldeBezugWahl + ' / ' + q('#meldeBezugName').textContent);
  q('#meldeBezugKnopf').click();
  q('#meldeBezug [data-bezug="lernsets"]').click();

  // ── F3h ff · Ort und Art sind zwei Fragen (ADR 0078) ─────
  // Eine Liste für beides wäre auf dreißig Einträge gewachsen, und man hätte
  // nur eines von beidem sagen können.
  pruefe('F3h beim Fehler steht ein zweites Feld für die Art',
    q('#meldeGrundZeile').hidden === false && !!q('#meldeGrundKnopf'));
  pruefe('F3i es ist zugeklappt und sagt, dass nichts gewählt ist',
    q('#meldeGrund').hidden === true &&
    q('#meldeGrundName').textContent === 'Keine Angabe',
    q('#meldeGrundName').textContent);
  q('#meldeGrundKnopf').click();
  pruefe('F3j es klappt auf und bietet sechs Gründe plus «keine»',
    q('#meldeGrund').hidden === false &&
    alle('#meldeGrund [data-grund]').length === MELDE_GRUENDE.length + 1,
    String(alle('#meldeGrund [data-grund]').length));
  q('#meldeGrund [data-grund="anzeige"]').click();
  pruefe('F3k eine Wahl schließt es und steht auf dem Knopf',
    meldeGrundWahl === 'anzeige' && q('#meldeGrund').hidden === true &&
    q('#meldeGrundName').textContent.indexOf('Anzeige') === 0,
    q('#meldeGrundName').textContent);
  // **Ein Wunsch hat keinen Grund, er hat einen Zweck.**
  q('[data-melde-art="feature"]').click();
  pruefe('F3l beim Wunsch ist das Feld weg', q('#meldeGrundZeile').hidden === true);
  q('[data-melde-art="bug"]').click();
  pruefe('F3m und beim Fehler wieder da', q('#meldeGrundZeile').hidden === false);

  // ── F3n ff · Der dritte Reiter (ADR 0078) ────────────────
  q('#meldeTitel').value = 'Ein Entwurf';
  q('[data-melde-art="liste"]').click();
  // **Gefragt ist, was man sieht, nicht was im Baum steht.** Ein gesetztes
  // display sticht [hidden] — die Knopfzeile ist ein Flex-Kasten und stand
  // darum trotz Attribut noch da.
  function sichtbar(w) { return getComputedStyle(q(w)).display !== 'none'; }
  pruefe('F3n «Bearbeiten» zeigt die Liste statt der Felder',
    meldeModus === 'liste' && sichtbar('#meldeListe') &&
    !sichtbar('#meldeNeu') && !sichtbar('#meldeAktionen'),
    'Liste ' + getComputedStyle(q('#meldeListe')).display +
    ' · Neu ' + getComputedStyle(q('#meldeNeu')).display +
    ' · Knöpfe ' + getComputedStyle(q('#meldeAktionen')).display);
  // **Der Entwurf überlebt den Abstecher** (ADR 0025) — verborgen ist nicht
  // ausgeräumt.
  pruefe('F3o und der Entwurf steht noch da',
    q('#meldeTitel').value === 'Ein Entwurf', q('#meldeTitel').value);
  q('[data-melde-art="bug"]').click();
  pruefe('F3p zurück im Schreibteil',
    meldeModus === 'neu' && sichtbar('#meldeNeu') && sichtbar('#meldeAktionen') &&
    !sichtbar('#meldeListe') && q('#meldeTitel').value === 'Ein Entwurf');
  q('#meldeTitel').value = '';
  var vorher2 = tickets.length;
  q('#meldeSichern').click();
  pruefe('F4 ohne Titel wird nichts gespeichert', tickets.length === vorher2 && meldeOffen);
  q('#meldeTitel').value = '<img src=x onerror=alert(1)>';
  q('#meldeText').value = 'Text & mehr';
  q('#meldeSichern').click();
  pruefe('F5 Ticket gespeichert, Blatt zu', tickets.length === vorher2 + 1 && !meldeOffen);
  pruefe('F5b Bezug übernommen', tickets[0].reiter === 'Lernsets', tickets[0].reiter);
  setTab('tickets');
  pruefe('F6 Titel wird nicht als HTML ausgeführt',
    alle('.tktext img').length === 0 && main.textContent.indexOf('<img src=x') !== -1);

  // F2 · Ohne Bezug
  setTab('bilanz');
  q('#meldeKnopf').click();
  q('#meldeBezug [data-bezug=""]').click();
  q('#meldeTitel').value = 'Ohne Bezug';
  q('#meldeSichern').click();
  pruefe('F7 «Keine Seite» bleibt leer', tickets[0].reiter === '', '«' + tickets[0].reiter + '»');
  pruefe('F8 und fehlt im Text', ticketAbschnitt(tickets[0], 1).indexOf('- Ort:') === -1);
  // Die Wahl merkt sich nichts über das Ticket hinaus — beim nächsten steht
  // wieder die Seite da, über der man ist.
  pruefe('F9 die Wahl fällt auf die aktuelle Seite zurück',
    meldeBezugWahl === meldeBezugQuelle(), meldeBezugWahl);
  // **Eine andere Seite lässt sich wählen** — das war der ganze Punkt: Wer
  // erst später merkt, dass es um etwas anderes ging, muss nicht dorthin
  // zurück und von vorn anfangen.
  q('#meldeKnopf').click();
  q('#meldeBezug [data-bezug="buchstaben"]').click();
  q('#meldeTitel').value = 'Betrifft woanders';
  q('#meldeSichern').click();
  pruefe('F9b eine fremde Seite lässt sich wählen', tickets[0].reiter === 'Buchstaben',
    tickets[0].reiter);

  // F3 · Ziehen: nur nach unten, weit genug schließt
  q('#meldeKnopf').click();
  var blatt = q('#meldeBlatt');
  blatt.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 500, bubbles: true }));
  blatt.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 560, bubbles: true }));
  pruefe('F10 das Blatt folgt dem Finger nach unten',
    blatt.style.transform.indexOf('translateY(') === 0 && blatt.classList.contains('zieht'),
    blatt.style.transform);
  pruefe('F11 gedämpft, nicht eins zu eins',
    parseFloat(blatt.style.transform.replace(/[^0-9.\-]/g, '')) < 60,
    blatt.style.transform);
  blatt.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 430, bubbles: true }));
  pruefe('F11b nach oben gibt es nicht nach',
    parseFloat(blatt.style.transform.replace(/[^0-9.\-]/g, '')) === 0,
    blatt.style.transform);
  blatt.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, clientY: 430, bubbles: true }));
  pruefe('F12 beim Loslassen federt es zurück',
    blatt.style.transform === '' && !blatt.classList.contains('zieht'));
  pruefe('F13 kurzes Ziehen schließt nicht', meldeOffen);

  // F4 · Weit genug gezogen: zu, aber der Entwurf bleibt
  q('#meldeTitel').value = 'Halb geschrieben';
  q('#meldeTitel').dispatchEvent(new Event('input'));
  pruefe('F15 der Knopf zeigt den Entwurf an',
    q('#meldeKnopf').classList.contains('hat-entwurf'));
  blatt.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 500, bubbles: true }));
  blatt.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 700, bubbles: true }));
  blatt.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, clientY: 700, bubbles: true }));
  pruefe('F16 weit genug gezogen schließt es', !meldeOffen);
  pruefe('F17 der Entwurf steht noch', q('#meldeTitel').value === 'Halb geschrieben');
  var vorherAnzahl = tickets.length;
  pruefe('F18 gespeichert wurde noch nichts', tickets.length === vorherAnzahl);
  q('#meldeKnopf').click();
  pruefe('F19 beim Öffnen ist er wieder da', meldeOffen && q('#meldeTitel').value === 'Halb geschrieben');

  // F5 · Danebentippen schließt genauso
  q('#meldeHof').click();
  pruefe('F20 der Hof schließt', !meldeOffen && q('#meldeTitel').value === 'Halb geschrieben');
  q('#meldeKnopf').click();
  q('#meldeAbbruch').click();
  pruefe('F14 Abbrechen schließt und leert', !meldeOffen && q('#meldeTitel').value === '');
  pruefe('F21 und der Knopf ist wieder blank',
    !q('#meldeKnopf').classList.contains('hat-entwurf'));
  tickets = tickets.slice(2);
  ticketsSichern();
  setTab('tickets');

  // F6 · Vorhandenes Ticket bearbeiten
  var bearbeitbar = ticketAnlegen('bug', 'Erst so', 'Erster Text', 'tippen');
  bearbeitbar.uebergeben = Date.now();
  setTab('tickets');
  pruefe('F22 die Zeile ist ein Knopf', !!q('[data-tkedit]'));
  q('[data-tkedit="' + bearbeitbar.id + '"]').click();
  pruefe('F23 das Blatt öffnet mit dem Ticket',
    meldeOffen && meldeBearbeitet === bearbeitbar.id &&
    q('#meldeTitel').value === 'Erst so' && q('#meldeText').value === 'Erster Text');
  pruefe('F24 und heißt jetzt «Ändern»', q('#meldeSichern').textContent === 'Ändern');
  q('#meldeTitel').value = 'Dann so';
  q('[data-melde-art="feature"]').click();
  q('#meldeSichern').click();
  pruefe('F25 geändert statt neu angelegt',
    tickets.filter(function (t) { return t.id === bearbeitbar.id; }).length === 1 &&
    bearbeitbar.titel === 'Dann so' && bearbeitbar.art === 'feature');
  pruefe('F26 ein geändertes Ticket ist wieder offen', bearbeitbar.uebergeben === null);
  pruefe('F27 der Text nennt die Änderung',
    ticketAbschnitt(bearbeitbar, 1).indexOf('- Geändert:') !== -1);
  pruefe('F28 danach ist das Blatt wieder blank',
    meldeBearbeitet === null && q('#meldeTitel').value === '');

  // G · Löschen und Einstieg
  var vorher = tickets.length;
  q('[data-tkweg]').click();
  pruefe('G1 Löschen wirkt', tickets.length === vorher - 1);
  var offenVorher = ticketsOffen().length;
  q('#tkAufraeumen').click();
  pruefe('G1b Aufräumen behält nur Offene',
    tickets.length === offenVorher && ticketsOffen().length === offenVorher,
    String(tickets.length));
  var davor = ansichtStapel[ansichtStapel.length - 1];
  q('#tkBack').click();
  pruefe('G2 Zurück führt in die Ansicht davor', currentTab === davor, currentTab + ' statt ' + davor);
  setTab('uebersetzen');
  q('#menuKnopf').click();
  pruefe('G3 Menü führt zu den Tickets', !!q('[data-ziel="tickets"]'));
  q('[data-ziel="tickets"]').click();
  pruefe('G4 führt in die Tickets', currentTab === 'tickets' && !!q('#tkBack'));
  pruefe('G5 Herkunft folgt der Übung davor', letzterTab === 'uebersetzen', letzterTab);
  q('#tkBack').click();
  pruefe('G5b Zurück führt nach Übersetzen', currentTab === 'uebersetzen', currentTab);
  setTab('tickets');
  tickets = [];
  ticketsSichern();
  renderTickets();
  pruefe('G6 Leerzustand mit Maskottchen', !!q('.leer [data-chili]'));
  // ── Z · Die Version steht am Ticket ───────────────────────
  tickets = [];
  ticketsSichern();
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('freestyle');
  q('#meldeKnopf').click();
  q('#meldeTitel').value = 'Eine Kleinigkeit';
  q('#meldeText').value = 'Dazu ein Satz';
  q('#meldeSichern').click();
  pruefe('Z1 das neue Ticket tr\u00e4gt die Version', tickets[0].version === APP_VERSION,
    String(tickets[0].version));
  pruefe('Z2 und weiterhin den Stand', tickets[0].stand === APP_STAND);
  // Drei Zahlen — und dahinter darf ein «T» für eine noch nicht abgenommene
  // Fassung stehen (ADR 0064). Ein Ticket vom Gerät soll genau sagen, welcher
  // Stand gemeint war; gerade bei einer Fassung zur Ansicht ist das wichtig.
  pruefe('Z3 die Version ist dreiteilig, mit oder ohne T',
    /^\d+\.\d+\.\d+T?$/.test(APP_VERSION), APP_VERSION);
  var txt = ticketsAlsText(tickets);
  pruefe('Z4 der Fu\u00df nennt beide',
    txt.indexOf('App-Stand: ' + APP_VERSION + ' \u00b7 ' + APP_STAND) !== -1,
    txt.split('---')[1]);
  pruefe('Z5 ohne Version steht nur der Stand',
    ticketStand({ stand: '2026-01-01' }) === '2026-01-01');
  pruefe('Z6 die Einstellungen nennen sie auch', (function () {
    setTab('einstellungen');
    return main.textContent.indexOf('Chillingo ' + APP_VERSION) !== -1;
  })());


  // ── Y · Tickets einlesen (ADR 0069) ──────────────────────
  // Der gebündelte Text verlässt das Gerät seit ADR 0016; zurück kam nichts.
  // Gelesen wird genau die Form, die ticketsAlsText() schreibt.
  tickets = [];
  ticketsSichern();
  ticketAnlegen('bug', 'Ein Fehler', 'Zwei Zeilen\nText dazu', 'lernsets', 'Anzeige oder Darstellung');
  ticketAnlegen('feature', 'Ein Wunsch', 'Kurz.', null);
  var text = ticketsAlsText(tickets);
  var gelesen = ticketsLesen(text);
  pruefe('Y1 der eigene Text wird wieder verstanden', gelesen.length === 2,
    String(gelesen.length));
  pruefe('Y2 Art, Titel und Ort kommen mit', (function () {
    var f = gelesen.filter(function (t) { return t.titel === 'Ein Fehler'; })[0];
    return f && f.art === 'bug' && f.reiter === 'Lernsets' &&
      f.text.indexOf('Zwei Zeilen') === 0 && f.text.indexOf('Text dazu') !== -1;
  })(), JSON.stringify(gelesen[0]));
  pruefe('Y3 ein Wunsch bleibt ein Wunsch', (function () {
    var w = gelesen.filter(function (t) { return t.titel === 'Ein Wunsch'; })[0];
    return w && w.art === 'feature' && w.reiter === '';
  })());
  // **Die Art fährt mit** (ADR 0078). Ein Feld, das den Weg nach draußen und
  // zurück nicht überlebt, ist auf dem zweiten Gerät verloren.
  pruefe('Y3b die Art des Fehlers steht im Text und kommt zurück',
    text.indexOf('- Art: Anzeige oder Darstellung') !== -1 &&
    gelesen.filter(function (t) { return t.titel === 'Ein Fehler'; })[0].grund ===
      'Anzeige oder Darstellung',
    gelesen.filter(function (t) { return t.titel === 'Ein Fehler'; })[0].grund);
  pruefe('Y3c und ein Wunsch trägt keine',
    text.split('Ein Wunsch')[1].indexOf('- Art:') === -1);
  // **Was schon da ist, bleibt** — dasselbe zweimal einzufügen verdoppelt nichts.
  var e1 = ticketsUebernehmen(gelesen);
  pruefe('Y4 Bekanntes wird nicht verdoppelt',
    e1.dazu === 0 && e1.schon === 2 && tickets.length === 2,
    JSON.stringify(e1) + ' / ' + tickets.length);
  // Auf einem leeren Gerät kommen sie an.
  tickets = [];
  var e2 = ticketsUebernehmen(gelesen);
  pruefe('Y5 auf einem leeren Gerät kommen sie an',
    e2.dazu === 2 && tickets.length === 2, JSON.stringify(e2));
  pruefe('Y6 und behalten ihre Reihenfolge', (function () {
    var sortiert = tickets.slice().sort(function (a, b) { return a.erstellt - b.erstellt; });
    return sortiert[0].titel === 'Ein Fehler';
  })(), tickets.map(function (t) { return t.titel; }).join());
  // **Nichts verstanden heißt nichts getan.**
  pruefe('Y7 Unsinn ergibt kein Ticket', ticketsLesen('Hallo Welt').length === 0);

  // ── Z · Bearbeiten aus dem Blatt heraus (ADR 0078) ───────
  // Bisher führte der einzige Weg über das Menü in die Ticketansicht. Der
  // dritte Reiter bringt die Liste dorthin, wo man ohnehin schreibt.
  tickets = [];
  ticketsSichern();
  ticketAnlegen('bug', 'Zu bearbeiten', 'Alter Text', 'tippen', 'Bedienung');
  setTab('home');
  meldeSetzen(false);
  meldeLeeren();
  q('#meldeKnopf').click();
  pruefe('Z1 das Blatt öffnet im Schreibteil', meldeModus === 'neu' &&
    q('#meldeNeu').hidden === false);
  q('[data-melde-art="liste"]').click();
  pruefe('Z2 die Liste führt das vorhandene Ticket',
    alle('#meldeListe [data-tkwahl]').length === 1 &&
    q('#meldeListe').textContent.indexOf('Zu bearbeiten') !== -1,
    q('#meldeListe').textContent.slice(0, 60));
  // Sie nennt auch, worum es ging — sonst müsste man raten, welches man meint.
  pruefe('Z2b und sagt Art und Ort dazu',
    q('#meldeListe').textContent.indexOf('Fehler') !== -1 &&
    q('#meldeListe').textContent.indexOf('Tippen') !== -1,
    q('#meldeListe').textContent.slice(0, 90));
  q('#meldeListe [data-tkwahl]').click();
  pruefe('Z3 ein Tipp holt es in den Schreibteil',
    meldeModus === 'neu' && !!meldeBearbeitet &&
    q('#meldeTitel').value === 'Zu bearbeiten' &&
    q('#meldeText').value === 'Alter Text',
    q('#meldeTitel').value);
  pruefe('Z3b samt Ort und Art', meldeBezugWahl === 'tippen' &&
    meldeGrundWahl === 'bedienung',
    meldeBezugWahl + ' / ' + meldeGrundWahl);
  pruefe('Z3c und der Knopf heißt jetzt «Ändern»',
    q('#meldeSichern').textContent === 'Ändern', q('#meldeSichern').textContent);
  q('#meldeTitel').value = 'Geändert';
  q('#meldeSichern').click();
  pruefe('Z4 gespeichert wird dasselbe Ticket, nicht ein zweites',
    tickets.length === 1 && tickets[0].titel === 'Geändert' &&
    tickets[0].grund === 'Bedienung',
    tickets.length + ' / ' + tickets[0].titel + ' / ' + tickets[0].grund);
  // Leer heißt leer: Ohne Tickets steht dort ein Satz, keine leere Fläche.
  tickets = [];
  ticketsSichern();
  q('#meldeKnopf').click();
  q('[data-melde-art="liste"]').click();
  pruefe('Z5 ohne Tickets steht ein Satz da',
    alle('#meldeListe [data-tkwahl]').length === 0 &&
    q('#meldeListe').textContent.indexOf('Noch keine Tickets') !== -1,
    q('#meldeListe').textContent.slice(0, 50));
  meldeSetzen(false);
  meldeLeeren();
  pruefe('Y8 auch leerer Text nicht', ticketsLesen('').length === 0);
  // Ein Kopf ohne Ticketabschnitt ebenfalls nicht.
  pruefe('Y9 ein Kopf allein auch nicht',
    ticketsLesen('# Chillingo · 2 Tickets\n\n---\nGerät: x\n').length === 0);
  // Die Oberfläche: ein Feld, das aufklappt, und ein Knopf, der einliest.
  tickets = [];
  ticketsSichern();
  ansichtenZuruecksetzen();
  setTab('tickets');
  pruefe('Y10 der Einstieg steht auch im Leerzustand da', !!q('#tkImportKnopf'));
  pruefe('Y11 und ist zugeklappt',
    getComputedStyle(q('#tkImportBlatt')).display === 'none');
  q('#tkImportKnopf').click();
  pruefe('Y12 ein Tipp klappt ihn auf',
    tkImportOffen === true && getComputedStyle(q('#tkImportBlatt')).display !== 'none');
  q('#tkImportFeld').value = text;
  q('#tkImportLesen').click();
  pruefe('Y13 der Knopf liest ein', tickets.length === 2, String(tickets.length));
  pruefe('Y14 und sagt, was ankam',
    tkImportMeldung.indexOf('2') === 0 && tkImportMeldung.indexOf('übernommen') !== -1,
    tkImportMeldung);
  q('#tkImportKnopf').click();
  q('#tkImportFeld').value = 'Nichts davon ist ein Ticket';
  q('#tkImportLesen').click();
  pruefe('Y15 Unverstandenes ändert nichts',
    tickets.length === 2 && tkImportMeldung.indexOf('kein Ticket') !== -1, tkImportMeldung);
  pruefe('Y16 Ansichtszustand wird zurückgesetzt', (function () {
    ansichtenZuruecksetzen();
    return tkImportOffen === false && tkImportMeldung === '';
  })());
  tickets = [];
  ticketsSichern();

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

writeFileSync(BAU + '/t-tickets.html', testseite(html, test));
console.log('Ticket-Testseite geschrieben');
