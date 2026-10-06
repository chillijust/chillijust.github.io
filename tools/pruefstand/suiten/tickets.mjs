// Tickets (0.8.0, ADR 0020): der schwebende Knopf unten rechts, das Ticketblatt
// über der Ansicht — als Tropfen aus dem Knopf —, Ort und Grund, der Entwurf,
// der das Zuklappen überlebt, die Liste, der gebündelte Text, «abgegeben».
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('tickets', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function tippen(el, text) { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); }
function waehlen(el, wert) { el.value = wert; el.dispatchEvent(new Event('change', { bubbles: true })); }
var blatt = q('#ticketBlatt'), knopf = q('#ticketKnopf');
var kopiert = null, geht = true;
kopieren = function (t, f) { kopiert = t; f(geht); };
frisch();

// ── A · Der Knopf ───────────────────────────────────────────
var k = knopf.getBoundingClientRect();
pruefe('A1 der Knopf schwebt außerhalb der Ansicht', !q('#app #ticketKnopf') && getComputedStyle(knopf).position === 'fixed');
pruefe('A2 unten rechts', Math.abs(innerWidth - k.right - 16) < 2 && Math.abs(innerHeight - k.bottom - 18) < 2,
  k.right + ' ' + k.bottom);
pruefe('A3 rund, groß genug, mit Symbol und Namen', k.width >= 44 && k.height >= 44 && !!knopf.querySelector('svg') &&
  knopf.getAttribute('aria-label') === 'Ticket schreiben');
pruefe('A4 #app hält ihm unten Platz frei', parseFloat(getComputedStyle(q('#app')).paddingBottom) >= k.height + 18);
pruefe('A5 das Blatt ist zu', blatt.hidden);

// ── B · Das Blatt über einer Ansicht ────────────────────────
zeige('einstellungen');
knopf.click();
var huelle = q('body > .tropfen-huelle');
pruefe('B1 der Knopf öffnet das Blatt', !blatt.hidden && blatt.classList.contains('offen') && q('#tkKopf').textContent === 'Neues Ticket');
pruefe('B2 es quillt als Tropfen aus dem Knopf', !!huelle && huelle.getAnimations().length > 0 &&
  q('#ticketKarte').style.opacity === '0');
pruefe('B3 die Ansicht darunter bleibt stehen', ansicht === 'einstellungen' && !!q('#swKnopf'));
pruefe('B4 der Ort ist vorgewählt: wo man stand', q('#tkOrt').value === 'einstellungen');
pruefe('B5 die Gestik schweigt bei offenem Blatt', blattOffen());
return durch().then(function () {
  pruefe('B6 danach ist der Tropfen weg und das Blatt sichtbar', !q('body > .tropfen-huelle') &&
    q('#ticketKarte').style.opacity === '');
  tippen(q('#tkTitel'), 'Knopf klemmt');
  pruefe('B7 ein angefangenes Ticket zeigt sich am Knopf', knopf.classList.contains('hat-entwurf') &&
    knopf.getAttribute('aria-label') === 'Angefangenes Ticket weiterschreiben');
  blatt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  pruefe('B8 danebentippen klappt zu', !blatt.classList.contains('offen'));
  return durch();
}).then(function () {
  pruefe('B9 und fließt zurück in den Knopf, dann ist es fort', blatt.hidden && !q('body > .tropfen-huelle'));
  knopf.click();
  pruefe('B10 der Entwurf ist noch da', q('#tkTitel').value === 'Knopf klemmt');
  // Fehler | Wunsch: die Gründe wechseln an Ort und Stelle.
  waehlen(q('#tkGrund'), 'haengt');
  var titelFeld = q('#tkTitel');
  q('[data-tkart="wunsch"]').click();
  var gruende = alle('#tkGrund option').map(function (o) { return o.value; });
  pruefe('B11 ein Wunsch hat andere Gründe', gruende.indexOf('neu') !== -1 && gruende.indexOf('haengt') === -1 &&
    q('#tkGrund').value === '' && q('[data-tkart="wunsch"]').getAttribute('aria-pressed') === 'true');
  pruefe('B12 das Blatt zeichnet sich dabei nicht neu', q('#tkTitel') === titelFeld);
  q('[data-tkart="fehler"]').click();
  waehlen(q('#tkGrund'), 'bedienung');
  waehlen(q('#tkOrt'), 'kalender');
  tippen(q('#tkTitel'), '   ');
  q('#tkSichern').click();
  pruefe('B13 ohne Titel kein Ticket', state.tickets.length === 0 && /Titel/.test(q('#hinweisTitel').textContent) &&
    blatt.classList.contains('offen'));
  hinweisSchliessen();
  tippen(q('#tkTitel'), '  Knopf klemmt  ');
  tippen(q('#tkText'), 'Er reagiert erst beim zweiten Mal.\n');
  q('#tkSichern').click();
  var t = state.tickets[0];
  pruefe('B14 Sichern legt das Ticket an', state.tickets.length === 1 && t.titel === 'Knopf klemmt' && t.art === 'fehler' &&
    t.ort === 'kalender' && t.grund === 'bedienung' && t.text === 'Er reagiert erst beim zweiten Mal.' && !t.abgegeben);
  pruefe('B15 mit dem Stand der App', t.stand === APP_VERSION + ' · ' + APP_STAND && t.erstellt === zeitJetzt());
  pruefe('B16 gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).tickets[0].titel === 'Knopf klemmt');
  pruefe('B17 der Entwurf ist verbraucht', ticketEntwurf === null && !knopf.classList.contains('hat-entwurf'));
  pruefe('B18 erst fließt das Blatt zurück, dann kommt die Bestätigung', !blatt.classList.contains('offen') &&
    !q('#hinweisBlatt').classList.contains('offen'));
  return durch();
}).then(function () {
  pruefe('B19 dann bestätigt das Glas', q('#hinweisBlatt').classList.contains('offen') &&
    q('#hinweisKarte').classList.contains('bestaetigung') && q('#hinweisTitel').textContent === 'Ticket gesichert');
  hinweisSchliessen();
  knopf.click();
  pruefe('B20 ein neues Blatt ist leer', q('#tkTitel').value === '' && q('#tkOrt').value === 'einstellungen');
  tippen(q('#tkTitel'), 'Wegwerfen');
  q('#tkAbbrechen').click();
  pruefe('B21 Verwerfen wirft den Entwurf weg', ticketEntwurf === null && state.tickets.length === 1 &&
    !knopf.classList.contains('hat-entwurf'));
  return durch();
}).then(function () {
  // ── C · Ein halbes Formular darunter überlebt ─────────────
  zeige('neu');
  tippen(q('#gwName'), 'Laufen');
  knopf.click();
  pruefe('C1 aus dem Formular: Ort Gewohnheit', q('#tkOrt').value === 'gewohnheit');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  pruefe('C2 Escape klappt zu', !blatt.classList.contains('offen'));
  pruefe('C3 das Formular darunter ist unberührt', ansicht === 'neu' && q('#gwName').value === 'Laufen' &&
    entwurf.name === 'Laufen');
  q('#tkAbbrechen').click();
  ticketEntwurf = null;
  ticketKnopfZeigen();
  return durch();
}).then(function () {
  // ── D · Die Liste ─────────────────────────────────────────
  state.tickets.push(ticketLesen({ id: 'k2', art: 'wunsch', titel: 'Zweite Erinnerung', text: '', ort: 'gewohnheit',
    grund: 'neu', erstellt: zeitJetzt() + 5, stand: APP_VERSION + ' · ' + APP_STAND }));
  menueOeffnen();
  q('[data-menue="tickets"]').click();
  pruefe('D1 das Menü führt in die Tickets', ansicht === 'tickets' && q('#kopf h1').textContent === 'Tickets');
  pruefe('D2 offen stehen beide', alle('[data-ticket]').length === 2 && q('#tkKopieren').textContent === 'Alle 2 kopieren');
  q('#tkKopieren').click();
  pruefe('D3 der Text trägt Kopf und Nummern', kopiert.indexOf('# Chillinal · 2 Tickets\n\n## 1 · Fehler: Knopf klemmt\n\n' +
    'Er reagiert erst beim zweiten Mal.\n\n- Ort: Kalender\n- Art: Bedienung\n') === 0, kopiert);
  pruefe('D4 der Wunsch folgt, ohne leere Zeilen', kopiert.indexOf('## 2 · Wunsch: Zweite Erinnerung\n\n- Ort: Gewohnheit\n' +
    '- Art: Neue Funktion\n') !== -1);
  pruefe('D5 der Stand steht einmal am Ende', /\n---\nApp-Stand: [^\n]+\n$/.test(kopiert) && kopiert.split('App-Stand').length === 2);
  pruefe('D6 kopiert heißt abgegeben', state.tickets.every(function (x) { return x.abgegeben === zeitJetzt(); }));
  pruefe('D7 die Liste zeigt sie gedimmt unter «Abgegeben»', alle('.tm-liste.gedimmt [data-ticket]').length === 2 &&
    !q('#tkKopieren') && /Nichts offen/.test(q('#ansicht').textContent));
  pruefe('D8 und das Glas sagt es mit Haken', q('#hinweisTitel').textContent === 'Kopiert' &&
    !q('#hinweisHaken').classList.contains('neutral'));
  hinweisSchliessen();
  return durch();
}).then(function () {
  q('[data-ticket="k2"]').click();
  pruefe('D9 eine Zeile öffnet ihr Ticket im Blatt', blatt.classList.contains('offen') && q('#tkKopf').textContent === 'Ticket' &&
    q('#tkTitel').value === 'Zweite Erinnerung' && q('[data-tkart="wunsch"]').getAttribute('aria-pressed') === 'true' &&
    q('#tkGrund').value === 'neu');
  tippen(q('#tkTitel'), 'Zweite Erinnerung am Abend');
  q('#tkSichern').click();
  var t = ticketNach('k2');
  pruefe('D10 geändert ist es wieder offen', t.titel === 'Zweite Erinnerung am Abend' && t.abgegeben === null &&
    state.tickets.length === 2);
  pruefe('D11 die Liste zeigt es oben', alle('.tm-liste:not(.gedimmt) [data-ticket]').length === 1);
  return durch();
}).then(function () {
  hinweisSchliessen();
  // Ein zweiter Stand: dann steht er an jedem Ticket.
  ticketNach('k2').stand = '0.7.9 · 2026-10-01';
  state.tickets.push(ticketLesen({ id: 'k3', art: 'fehler', titel: 'Dritter', erstellt: zeitJetzt() + 9,
    stand: APP_VERSION + ' · ' + APP_STAND }));
  geht = false;
  render();
  q('#tkKopieren').click();
  pruefe('D12 geht die Zwischenablage nicht, steht der Text zum Kopieren da', !!q('#tkAusgabe') &&
    q('#tkAusgabe').value === kopiert && ticketNach('k3').abgegeben === null);
  pruefe('D13 zwei Stände: an jedem Ticket', /- App-Stand: 0\.7\.9/.test(kopiert) && !/\nApp-Stand:/.test(kopiert));
  geht = true;
  q('#tkKopieren').click();
  pruefe('D14 dann geht es, und das Feld ist fort', !q('#tkAusgabe') && ticketNach('k3').abgegeben === zeitJetzt());
  hinweisSchliessen();
  // Löschen: ein Ticket im Blatt, mit zweitem Tipp.
  q('[data-ticket="k3"]').click();
  q('#tkLoeschen').click();
  pruefe('D15 Löschen fragt erst', !!ticketNach('k3') && q('#tkLoeschen').textContent === 'Wirklich löschen?');
  q('#tkLoeschen').click();
  pruefe('D16 dann ist es fort', !ticketNach('k3') && !blatt.classList.contains('offen'));
  return durch();
}).then(function () {
  hinweisSchliessen();
  q('#tkAufraeumen').click();
  pruefe('D17 «Abgegebene löschen» fragt erst', state.tickets.length === 2 && q('#tkAufraeumen').classList.contains('frage'));
  q('#tkAufraeumen').click();
  pruefe('D18 dann bleiben nur die offenen', state.tickets.length === 0 && !q('#tkAufraeumen'));
  hinweisSchliessen();
  q('#tkNeu').click();
  pruefe('D19 «Neues Ticket» öffnet das Blatt, Ort Tickets', blatt.classList.contains('offen') && q('#tkOrt').value === 'tickets');
  ausbewegt();
  var klein = alle('#ticketKarte button, #ticketKarte select, #ticketKarte input').filter(function (b) {
    return b.getBoundingClientRect().height < 44;
  });
  pruefe('D20 alles im Blatt ist groß genug', !klein.length, klein.map(function (b) { return b.id; }).join());
  pruefe('D21 das Blatt duzt', !/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/.test(q('#ticketKarte').textContent +
    alle('#ticketKarte [placeholder]').map(function (e) { return ' ' + e.getAttribute('placeholder'); }).join('')));
  q('#tkAbbrechen').click();
  return durch();
}).then(function () {
  // ── E · Lesen ─────────────────────────────────────────────
  pruefe('E1 ohne Titel kein Ticket', ticketLesen({ id: 'x', titel: '', erstellt: 5 }) === null &&
    ticketLesen({ id: 'x', titel: 'a' }) === null && ticketLesen(null) === null);
  var t = ticketLesen({ id: 'x', art: 'quatsch', titel: 'a', erstellt: 5, ort: 'mond', grund: 'neu' });
  pruefe('E2 Unbekanntes fällt auf das Übliche zurück', t.art === 'fehler' && t.ort === 'anderswo' && t.grund === '');
  var s = stand({ tickets: [{ id: 'b', titel: 'B', erstellt: 9 }, { id: 'a', titel: 'A', erstellt: 3 }, { id: 'a', titel: 'C', erstellt: 4 }] });
  pruefe('E3 der Speicher sortiert und nimmt jede id einmal', s.tickets.map(function (x) { return x.id; }).join() === 'a,b');
  // ── U · Unten, alle Tickets, untereinander (ADR 0021) ─────
  frisch();
  zeige('home');
  knopf.click();
  // Der Rückweg von eben tropft vielleicht noch in den Menüknopf — gemeint ist der neueste.
  var auf = alle('body > .tropfen-huelle').pop();
  pruefe('U0 das Blatt tropft als Glas auf (ADR 0024)', !!auf && auf.classList.contains('glas'));
  return durch();
}).then(function () {
  var kst = getComputedStyle(q('#ticketKarte')), filter = kst.backdropFilter || kst.webkitBackdropFilter || '';
  pruefe('U0a das Blatt ist aus Glas, wie Hinweis und Meldung', q('#ticketKarte').classList.contains('glas') &&
    /blur\(/.test(filter) && /inset/.test(kst.boxShadow) && Number(getComputedStyle(blatt).opacity) === 1, filter);
  var r = q('#ticketKarte').getBoundingClientRect(), k2 = knopf.getBoundingClientRect();
  pruefe('U1 das Blatt steht unten, beim Knopf', Math.abs(innerHeight - 12 - r.bottom) < 2 && r.top > 0,
    [r.top, r.bottom, innerHeight].join());
  var ort = q('#tkOrt').getBoundingClientRect(), grund = q('#tkGrund').getBoundingClientRect();
  pruefe('U2 «Wo» und «Was» stehen untereinander, volle Breite', grund.top >= ort.bottom &&
    Math.abs(grund.left - ort.left) < 1 && Math.abs(grund.width - ort.width) < 1, [ort.top, ort.bottom, grund.top].join());
  pruefe('U3 im Kopf steht «Alle Tickets», groß genug', q('#tkAlle').textContent === 'Alle Tickets' &&
    q('#tkAlle').getBoundingClientRect().height >= 44 && q('.tk-kopf #tkKopf') !== null);
  var vvWar = Object.getOwnPropertyDescriptor(window, 'visualViewport');
  Object.defineProperty(window, 'visualViewport', { value: { height: innerHeight - 300, offsetTop: 0 }, configurable: true });
  ticketTastatur();
  var r2 = q('#ticketKarte').getBoundingClientRect();
  pruefe('U4 geht die Tastatur auf, rückt das Blatt um ihre Höhe hoch', blatt.style.getPropertyValue('--tastatur') === '300px' &&
    r2.bottom <= innerHeight - 312 + 1 && r2.bottom < r.bottom, [r2.top, r2.bottom].join());
  Object.defineProperty(window, 'visualViewport', { value: { height: innerHeight, offsetTop: 0 }, configurable: true });
  ticketTastatur();
  pruefe('U5 und wieder hinunter, wenn sie geht', blatt.style.getPropertyValue('--tastatur') === '0px');
  if (vvWar) Object.defineProperty(window, 'visualViewport', vvWar); else delete window.visualViewport;
  tippen(q('#tkTitel'), 'Halb geschrieben');
  q('#tkAlle').click();
  pruefe('U6 «Alle Tickets» zeigt die Liste im selben Blatt, mit Zurück (ADR 0025)', blatt.classList.contains('offen') &&
    ansicht === 'home' && q('#tkKopf').textContent === 'Alle Tickets' && !!q('#tkListeZurueck') &&
    q('#tkListeZurueck').getBoundingClientRect().height >= 44 && !!ticketEntwurf && ticketEntwurf.titel === 'Halb geschrieben');
  return durch();
}).then(function () {
  q('#tkListeZurueck').click();
  pruefe('U7 zurück steht der Entwurf wieder da', q('#tkTitel').value === 'Halb geschrieben' && !q('#tkListeZurueck'));
  state.tickets = [ticketLesen({ id: 'k1', art: 'fehler', titel: 'Eins', erstellt: 1 }),
    ticketLesen({ id: 'k2', art: 'wunsch', titel: 'Zwei', erstellt: 2 }),
    ticketLesen({ id: 'k3', art: 'wunsch', titel: 'Drei', erstellt: 3, abgegeben: 5 })];
  ausbewegt();
  var formHoehe = q('#ticketKarte').getBoundingClientRect().height;
  q('#tkAlle').click();
  var listeHoehe = q('#ticketKarte').getBoundingClientRect().height;
  var zeilen = alle('#ticketKarte .tk-zeile'), warten = zeilen.map(function (z) {
    var a = z.getAnimations()[0]; return a ? a.effect.getTiming().delay : -1;
  });
  pruefe('U8 alle Tickets, offen vorn, abgegeben gedimmt dahinter', zeilen.map(function (z) {
    return z.getAttribute('data-ticket'); }).join() === 'k1,k2,k3' && !!q('#ticketKarte .tk-liste-blatt.gedimmt [data-ticket="k3"]') &&
    /Alle 2 kopieren/.test(q('#tkListeKopieren').textContent));
  pruefe('U9 sie tropfen nacheinander auf', warten.length === 3 && warten[1] > warten[0] && warten[2] > warten[1] &&
    zeilen.every(function (z) { var a = z.getAnimations()[0]; return a && /round/.test(a.effect.getKeyframes()[0].clipPath); }),
    warten.join());
  // ADR 0026, 0027: erst wenn das Blatt seine neue Höhe hat, dann langsam und
  // sichtbar nacheinander — vor ihrem Einsatz ist eine Zeile noch nicht da.
  var hoehe = q('#ticketKarte').getAnimations().filter(function (a) {
    return a.effect.getKeyframes().some(function (k) { return !!k.height; }); })[0];
  pruefe('U9a erst nach dem Wechsel, deutlich gestaffelt, vor dem Einsatz unsichtbar',
    (hoehe ? warten[0] >= hoehe.effect.getTiming().duration : warten[0] === 0) && warten[1] - warten[0] >= 150 && warten[2] - warten[1] >= 150 &&
    zeilen.every(function (z) { var a = z.getAnimations()[0]; return a && a.effect.getTiming().fill === 'backwards' &&
      a.effect.getTiming().duration >= 800; }), warten.join());
  // ADR 0028: Die Liste ist genau so hoch wie das Ticket davor, ohne Wachsen.
  pruefe('U9d «Alle Tickets» ist genau so hoch wie die Ticketerstellung', Math.abs(listeHoehe - formHoehe) < 1 && !hoehe,
    [formHoehe, listeHoehe].join());
  // ADR 0031: Die Glaskante ist ein innerer Schatten — er liegt unter allem,
  // was in der Karte steht. Rollt die Karte selbst, schiebt sich der Inhalt
  // über ihre Kante. Gerollt wird darum innen, der Kopf steht, und was rollt,
  // bleibt mit Abstand innerhalb der Kante und blendet an ihr aus.
  for (var n = 4; n < 30; n++) state.tickets.push(ticketLesen({ id: 'x' + n, art: 'fehler', titel: 'Viel ' + n, erstellt: 10 + n }));
  ticketBlattWechseln(true);
  ausbewegt();
  var karte = q('#ticketKarte'), rolle = q('#ticketKarte .tk-rolle'), kr = karte.getBoundingClientRect();
  pruefe('U9h die Karte selbst rollt nicht, ihr Inneres schon', karte.scrollHeight <= karte.clientHeight + 1 &&
    !!rolle && rolle.scrollHeight > rolle.clientHeight, [karte.scrollHeight, karte.clientHeight].join());
  var kopfVor = q('#tkListeZurueck').getBoundingClientRect().top;
  rolle.scrollTop = 200;
  var rr = rolle.getBoundingClientRect();
  pruefe('U9i gerollt bleibt der Kopf mit Zurück stehen', q('#tkListeZurueck').getBoundingClientRect().top === kopfVor &&
    !rolle.contains(q('#tkListeZurueck')), kopfVor);
  pruefe('U9j was rollt, bleibt innerhalb der Kante', rr.left >= kr.left + 1 && rr.right <= kr.right - 1 &&
    rr.bottom <= kr.bottom - 1 && rr.top > kr.top + 1, [rr.left - kr.left, kr.right - rr.right, kr.bottom - rr.bottom].join());
  pruefe('U9k und blendet an ihr aus, statt sie zu überdecken', /gradient/.test(getComputedStyle(rolle).webkitMaskImage ||
    getComputedStyle(rolle).maskImage || ''));
  state.tickets = state.tickets.slice(0, 3);
  ticketBlattWechseln(true);
  ausbewegt();
  var seite = q('#tkZurSeite');
  pruefe('U9b im Kopf der Liste führt «Ticketseite» zur Seite Tickets, groß genug', !!seite &&
    seite.textContent === 'Ticketseite' && seite.getBoundingClientRect().height >= 44 &&
    seite.getBoundingClientRect().right <= q('#ticketKarte').getBoundingClientRect().right);
  return durch();
}).then(function () {
  q('#tkZurSeite').click();
  pruefe('U9c ein Tipp: die Seite Tickets, das Blatt geht zu, der Entwurf bleibt', ansicht === 'tickets' &&
    !blatt.classList.contains('offen') && !!ticketEntwurf && ticketEntwurf.titel === 'Halb geschrieben' &&
    !!q('#app #tkOffen'));
  return durch();
}).then(function () {
  zeige('home');
  ticketBlattOeffnen(knopf);
  ausbewegt();
  q('#tkAlle').click();
  return durch();
}).then(function () {
  var formHoehe = q('#ticketKarte').getBoundingClientRect().height, viele = [];
  for (var i = 0; i < 14; i++) viele.push(ticketLesen({ id: 'v' + i, art: 'wunsch', titel: 'Viele ' + i, erstellt: 10 + i }));
  var vorher = state.tickets;
  state.tickets = vorher.concat(viele);
  ticketBlattWechseln(true);
  var karte = q('#ticketKarte'), rolle = q('#ticketKarte .tk-rolle');
  pruefe('U9e auch bei vielen Tickets bleibt die Höhe, die Liste rollt darin',
    Math.abs(karte.getBoundingClientRect().height - formHoehe) < 1 && rolle.scrollHeight > rolle.clientHeight + 20,
    [formHoehe, karte.getBoundingClientRect().height, rolle.scrollHeight].join());
  q('#tkListeZurueck').click();
  pruefe('U9f zurück im Ticket hat das Blatt wieder seine eigene Höhe', karte.style.height === '');
  state.tickets = vorher;
  ausbewegt();
  q('#tkAlle').click();
  return durch();
}).then(function () {
  q('#ticketKarte [data-ticket="k2"]').click();
  pruefe('U10 ein Ticket aus der Liste öffnet sich im selben Blatt', blatt.classList.contains('offen') &&
    q('#tkTitel').value === 'Zwei' && q('#tkKopf').textContent === 'Ticket');
  return durch();
}).then(function () {
  // Der Fließtext wächst mit, höchstens drei Zeilen.
  var feld = q('#tkText'), eine;
  tippen(feld, '');
  var leer = feld.getBoundingClientRect().height, titel = q('#tkTitel').getBoundingClientRect().height;
  pruefe('U13 leer ist der Fließtext so hoch wie der Titel, nicht dünner', Math.abs(leer - titel) < 1.5,
    [leer, titel].join());
  tippen(feld, 'kurz');
  eine = feld.getBoundingClientRect().height;
  tippen(feld, 'eins\nzwei');
  var zwei = feld.getBoundingClientRect().height;
  tippen(feld, 'eins\nzwei\ndrei\nvier\nfünf\nsechs');
  var viele = feld.getBoundingClientRect().height, lh = parseFloat(getComputedStyle(feld).lineHeight);
  pruefe('U11 der Fließtext beginnt mit einer Zeile und wächst mit', zwei > eine + lh * 0.8, [eine, zwei].join());
  pruefe('U12 höchstens drei Zeilen, dann rollt er', viele < eine + lh * 2.3 && viele > eine + lh * 1.7 &&
    getComputedStyle(feld).overflowY === 'auto', [eine, viele, lh].join());
  q('#tkAbbrechen').click();
  return durch();
}).then(function () {
  // ADR 0027: Ein Ticket mit Text, von der Ticketseite geöffnet, zeigt seinen
  // Text — gemessen wurde früher, solange das Blatt noch verborgen war.
  state.tickets = [ticketLesen({ id: 'm1', art: 'fehler', titel: 'Mit Text', text: 'eins\nzwei\ndrei', erstellt: 1 })];
  zeige('tickets');
  var mz = q('#app [data-ticket="m1"]');
  mz.click();
  ausbewegt();
  var feld = q('#tkText'), lh = parseFloat(getComputedStyle(feld).lineHeight),
    titel = q('#tkTitel').getBoundingClientRect().height, h = feld.getBoundingClientRect().height;
  pruefe('U14 von der Ticketseite geöffnet zeigt der Fließtext alle drei Zeilen', h > titel + lh * 1.7,
    [h, titel, lh].join());
  q('#tkAbbrechen').click();
  return durch();
}).then(function () {
  frisch();
  speichern();
});
`);
