// Prüft das Ticketsystem: Speichern, Adressbau, Absicherung.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU } from '../helfer.mjs';
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
  pruefe('F3b der Bezug nennt die Ansicht darunter',
    q('#meldeBezugName').textContent === 'Lernsets' && q('#meldeBezug').checked,
    q('#meldeBezugName').textContent);
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
  q('#meldeBezug').checked = false;
  q('#meldeBezug').dispatchEvent(new Event('change'));
  q('#meldeTitel').value = 'Ohne Bezug';
  q('#meldeSichern').click();
  pruefe('F7 abgehakter Bezug bleibt leer', tickets[0].reiter === '', '«' + tickets[0].reiter + '»');
  pruefe('F8 und fehlt im Text', ticketAbschnitt(tickets[0], 1).indexOf('- Übung:') === -1);
  pruefe('F9 der Haken merkt sich nichts über das Ticket hinaus', meldeBezugAn === true);

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
  pruefe('Z3 die Version ist dreiteilig', /^\d+\.\d+\.\d+$/.test(APP_VERSION), APP_VERSION);
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

const skript = '\n<script>\nwindow.addEventListener("error", function (e) { document.title = "SEITENFEHLER: " + e.message; });\nsetTimeout(function () {' + test + '}, 150);\n</scr' + 'ipt>\n';
writeFileSync(BAU + '/t-tickets.html', html.replace('</body>', skript + '</body>'));
console.log('Ticket-Testseite geschrieben');
