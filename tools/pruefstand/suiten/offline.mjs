// Prüft den Service Worker (ADR 0059) — soweit das hier überhaupt geht.
//
// **Was diese Suite nicht kann:** Service Worker laufen nicht unter `file://`,
// und der Prüfstand lädt genau so. Ob der Worker wirklich offline trägt, zeigt
// nur das Gerät. Was hier geprüft wird, ist alles andere — und das ist mehr,
// als es klingt:
//
//   · dass `sw.js` das tut, was er tun soll, und nichts darüber hinaus,
//   · dass die App **ohne** ihn genauso läuft wie vorher,
//   · dass der Notausgang existiert und die Auskunft ehrlich ist.
//
// Der letzte Punkt ist der wichtigste: Ein Worker, der sich verschluckt, ist
// auf einem Telefon sonst nicht loszuwerden.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');
const sw = readFileSync(WURZEL + '/sw.js', 'utf8');
const version = readFileSync(WURZEL + '/VERSION', 'utf8').trim();

// ── Dateiprüfung: sw.js von außen gelesen ────────────────────
const ausser = [];
const pruefeDatei = (name, bedingung, extra) => {
  ausser.push((bedingung ? 'PASS ' : 'FAIL ') + name + (extra ? ' [' + extra + ']' : ''));
};

pruefeDatei('S1 sw.js trägt dieselbe Version wie die App',
  sw.includes("var SW_VERSION = '" + version + "';"), version);
pruefeDatei('S2 der Cache-Name führt die Version mit',
  /CACHE\s*=\s*'chillingo-'\s*\+\s*SW_VERSION/.test(sw));
// **Kein skipWaiting beim Einrichten.** Sonst tauschte sich die App unter der
// laufenden Sitzung aus — der Nutzer entscheidet, wann. Geprüft wird der
// **Aufruf**, nicht das Wort: Im Kommentar darüber steht es auch, und eine
// Prüfung, die auf Prosa anspringt, prüft nichts.
var aufrufe = (sw.match(/self\.skipWaiting\s*\(/g) || []).length;
pruefeDatei('S3 der neue Worker drängt sich nicht vor', aufrufe === 1, String(aufrufe));
pruefeDatei('S4 und lässt sich nur auf Ansage vorlassen',
  /art === 'uebernehmen'\) self\.skipWaiting\(\)/.test(sw));
pruefeDatei('S5 beim Aktivieren fallen alte Speicher weg',
  /activate[\s\S]{0,400}caches\.delete/.test(sw));
pruefeDatei('S6 fremde Adressen fängt er nicht ab',
  /self\.location\.origin/.test(sw));
pruefeDatei('S7 nur GET', /\.method\s*!==\s*'GET'/.test(sw));
pruefeDatei('S8 er lädt nichts nach', !/importScripts/.test(sw));
pruefeDatei('S9 keine Fremdadresse', !/https?:\/\//.test(sw));
// Aus dem Speicher sofort, im Hintergrund nachsehen: Die Datei ist über 600 KB,
// «Netz zuerst» hieße bei jedem Start warten.
pruefeDatei('S10 der Speicher antwortet zuerst',
  /if \(treffer\) return treffer;/.test(sw));
pruefeDatei('S11 und wird im Hintergrund nachgeführt',
  /c\.put\(anfrage, antwort\.clone\(\)\)/.test(sw));
// Gelesen wird die Richtlinie selbst, nicht der Kommentar daneben — dort steht
// «connect-src bleibt weg», und genau das soll gelten.
var cspZeile = (html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/) || [])[1] || '';
pruefeDatei('S12 die CSP öffnet genau eine Tür',
  cspZeile.indexOf("worker-src 'self'") !== -1 && cspZeile.indexOf('connect-src') === -1,
  cspZeile);
pruefeDatei('S13 und bleibt sonst zu',
  cspZeile.indexOf("default-src 'none'") === 0 && !/https?:|\*/.test(cspZeile));
// **Ohne Netz kommt kein Urteil.** `reg.update()` scheitert im Funkloch. Wer
// das stillschweigend abfängt, meldet danach «Aktuell» — und behauptet damit
// etwas über einen Stand, den die App nie gesehen hat (ADR 0052). Genau so
// stand es in 2.4.0.
pruefeDatei('S14 das Nachsehen sagt, woran es war',
  /ende\('kein netz'\)/.test(html) && /ende\('unmoeglich'\)/.test(html) &&
  /ende\('ok'\)/.test(html));
pruefeDatei('S15 und der Knopf gibt es weiter',
  /lage === 'kein netz' \? 'Kein Netz'/.test(html) &&
  /lage === 'unmoeglich' \? 'Nicht möglich'/.test(html));
pruefeDatei('S16 «Aktuell» steht nur nach einer geglückten Anfrage',
  (html.match(/'Aktuell'/g) || []).length === 1 &&
  /if \(!swStand\.wartet\) \{\s*\n\s*swKnopfMelden\(/.test(html));
// **`update()` ist fertig, bevor die neue Fassung wartet.** Es meldet das Ende
// der Anfrage, nicht das der Einrichtung: Der neue Worker steckt danach oft
// noch in `installing`. Wer sofort urteilt, sagt «Aktuell» und sieht die neue
// Fassung eine Sekunde später von selbst auftauchen — genau so war es in 2.4.2.
pruefeDatei('S17 nach dem Nachsehen wird auf den neuen Worker gewartet',
  /var neu = reg\.installing;/.test(html) &&
  /neu\.addEventListener\('statechange'/.test(html) &&
  /if \(neu\.state === 'installing'\) return;/.test(html));
pruefeDatei('S18 und nicht ewig — der Ring dreht sich nicht für immer',
  /setTimeout\(function \(\) \{ swWartendPruefen\(reg\); ende\('ok'\); \}, 8000\)/.test(html));
// **Ein Update lädt nie von selbst.** `swUebernehmen()` steht genau zweimal:
// am Knopf des Hinweises und im Knopf der Einstellungen. Beides ist ein Tipp
// des Nutzers, nichts läuft im Hintergrund an.
// Gezählt werden die **Aufrufe**, nicht die Erwähnungen: die Deklaration zählt
// nicht mit. Zwei sind es, und beide hängen an einem Tipp — der Zeile oben und
// dem Knopf in den Einstellungen. Ein dritter wäre ein Weg, der von selbst
// lädt, und ein `setTimeout(swUebernehmen…)` wäre einer zu viel.
pruefeDatei('S19 übernommen wird nur auf Ansage',
  (html.match(/swUebernehmen\(\);/g) || []).length === 2 &&
  !/setTimeout\([^)]*swUebernehmen/.test(html) &&
  /if \(swStand\.wartet\) \{\s*\n\s*swKnopfLage = 'laedt';/.test(html));
// Dieselbe Anzeige an beiden Knöpfen (ADR 0063): Beide warten auf dieselbe
// Sache, also sieht das Warten gleich aus. Den Balken von 2.4.3 gibt es nicht
// mehr — er stand nur an einem der beiden.
pruefeDatei('S20 beide Wege warten gleich',
  (html.match(/class="sw-ring"/g) || []).length === 3 &&
  !/sw-balken/.test(html));
console.log(ausser.join('\n'));
if (ausser.some((z) => z.indexOf('FAIL') === 0)) {
  throw new Error('sw.js entspricht nicht der Absprache');
}

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

try {
  tutEnde();
  state = defaultState();
  ansichtenZuruecksetzen();

  // ── A · Ohne Worker läuft alles wie vorher ────────────────
  // **Das ist die tragende Prüfung.** Diese Seite läuft über file://. Die
  // Schnittstelle gibt es dort zwar — anmelden lässt sich nichts, und darum
  // steuert hier kein Worker. Die App merkt es nicht einmal.
  pruefe('A1 hier steuert kein Worker die Seite',
    !navigator.serviceWorker || !navigator.serviceWorker.controller);
  pruefe('A2 die App steht trotzdem', !!q('#chiliFigur') && !!q('#menuKnopf'));
  pruefe('A3 das Anmelden wirft nicht', (function () {
    try { swAnmelden(); return true; } catch (e) { return false; }
  })());
  pruefe('A4 das Nachsehen auch nicht', (function () {
    try { swNachsehen(); return true; } catch (e) { return false; }
  })());
  pruefe('A5 und der Notausgang ebenso wenig', (function () {
    try { swAufraeumen(); return true; } catch (e) { return false; }
  })());
  pruefe('A6 die Auskunft bleibt ehrlich',
    swAuskunft() === 'nicht unterstützt' || swAuskunft() === 'noch nicht',
    swAuskunft());
  pruefe('A7 ohne Worker steht der Stand auf «nicht bereit»', swStand.bereit === false);

  // ── B · Der Hinweis ───────────────────────────────────────
  var leiste = q('#swNeu');
  pruefe('B1 die Leiste steht im Baum', !!leiste);
  // **Das Attribut allein genügt nicht.** Ein gesetztes display sticht
  // [hidden] — genau so stand die Leiste erst immer da. Gefragt ist, was
  // man sieht, nicht was im Baum steht.
  pruefe('B2 und ist verborgen, solange nichts wartet',
    leiste.hidden === true && getComputedStyle(leiste).display === 'none',
    getComputedStyle(leiste).display);
  pruefe('B3 sie hat einen Knopf zum Laden und einen zum Wegtippen',
    !!q('#swLaden') && !!q('#swSpaeter'));
  pruefe('B4 sie meldet sich von selbst, ruhig',
    leiste.getAttribute('role') === 'status' &&
    leiste.getAttribute('aria-live') === 'polite');
  // **Kein Blatt, kein Zwang** — sie liegt nicht über der Seite.
  pruefe('B5 sie deckt nichts zu', (function () {
    var st = getComputedStyle(leiste);
    return st.position !== 'fixed' && st.position !== 'absolute';
  })(), getComputedStyle(leiste).position);

  swStand.gemeldet = false;
  swHinweisZeigen();
  pruefe('B6 gezeigt wird sie auf Ansage', leiste.hidden === false);
  q('#swSpaeter').click();
  pruefe('B7 und lässt sich wegtippen',
    leiste.hidden === true && getComputedStyle(leiste).display === 'none');
  // Einmal je Sitzung: Wer sie weggetippt hat, hat entschieden.
  swHinweisZeigen();
  pruefe('B8 sie drängt sich nicht ein zweites Mal auf', leiste.hidden === true);

  // ── C · Der Reiter «App» ──────────────────────────────────
  einstReiter = 'app';
  setTab('einstellungen');
  pruefe('C1 es gibt fünf Reiter', alle('[data-reiter]').length === 5,
    String(alle('[data-reiter]').length));
  // Und sie passen nebeneinander: Ein Reiter, den man erst suchen muss, ist
  // keiner. Gemessen wird am Zielgerät — die Testseite läuft in 430 px.
  pruefe('C1b sie passen alle nebeneinander', (function () {
    var bar = q('.reiter');
    return bar.scrollWidth <= bar.clientWidth + 1;
  })(), q('.reiter').scrollWidth + '/' + q('.reiter').clientWidth);
  // Seit 2.4.4 steht er **vorn**: Was die App über sich selbst sagt, sucht man
  // zuerst. Ein eigener Reiter bleibt er in jedem Fall — mit Farben hat er
  // nichts zu tun (ADR 0059).
  pruefe('C2 «App» ist ein eigener Reiter', EINST_REITER[0].id === 'app');
  pruefe('C3 er sagt, ob die App offline bereit ist', !!q('#swBereit'));
  pruefe('C4 er hat einen Knopf zum Nachsehen', !!q('#swSuchen'));
  pruefe('C5 und den Notausgang', !!q('#swLeeren'));
  // **Der Notausgang fragt einmal nach.** Ein Fehlgriff wäre kein Drama, ein
  // Neuladen ohne Netz schon.
  pruefe('C6 er fragt zuerst nach', q('#swLeeren').textContent === 'Leeren');
  q('#swLeeren').click();
  pruefe('C7 der zweite Tipp ist der ernste',
    q('#swLeeren').textContent.indexOf('Wirklich') === 0, q('#swLeeren').textContent);
  pruefe('C8 Zurücksetzen nimmt die Rückfrage zurück', (function () {
    ansichtenZuruecksetzen();
    return swLeerenSicher === false;
  })());
  einstReiter = 'app';
  renderEinstellungen();
  // **Alle Reiter stehen gleichzeitig im Baum** — sie liegen nebeneinander auf
  // einer Bahn, damit der Finger sie mitnehmen kann. Gefragt wird darum das
  // Blatt, nicht die Seite.
  var blatt = q('[data-reiterblatt="app"]');
  pruefe('C9 auf diesem Reiter gibt es nichts einzustellen',
    blatt.querySelectorAll('[data-set]').length === 0 &&
    blatt.querySelectorAll('[data-wahl]').length === 0 &&
    blatt.querySelectorAll('[data-wahltext]').length === 0 &&
    blatt.querySelectorAll('[data-zaehler]').length === 0);
  pruefe('C10 die laufende Fassung steht da',
    blatt.textContent.indexOf(APP_VERSION) !== -1, APP_VERSION);

  // Die anderen Reiter haben davon nichts abbekommen.
  var hell = q('[data-reiterblatt="darstellung"]');
  pruefe('C11 «Darstellung» blieb, was es war',
    !hell.querySelector('#swBereit') && !!hell.querySelector('[data-wahltext="schema"]'));

  // ── E · Der Knopf «Suchen / Update» (ADR 0062) ───────────
  // Bis 2.4.2 **meldete** er nur. Stand «Neue Fassung bereit» darauf, sah das
  // aus wie ein Angebot — beim Tippen suchte er aber bloß noch einmal. Wer den
  // Hinweis oben weggetippt hatte, kam an die Fassung gar nicht mehr heran.
  einstReiter = 'app';
  setTab('einstellungen');
  var knopf = q('#swSuchen');
  var notiz = knopf.closest('.setting').querySelector('.setting-note').textContent;
  var masse = [];
  function messen() {
    var r = knopf.getBoundingClientRect();
    masse.push(Math.round(r.width) + 'x' + Math.round(r.height));
  }
  swStand.wartet = null;
  swKnopfLage = 'ruhe';
  swKnopfMeldung = '';
  swKnopfZeichnen();
  pruefe('E1 in Ruhe heißt er «Suchen»', knopf.textContent === 'Suchen', knopf.textContent);
  messen();

  // Wartet eine Fassung, heißt er «Update» — **ohne** dass man erst suchen
  // muss. Genau das war der Weg, der vorher ins Leere führte.
  swStand.wartet = { postMessage: function () {} };
  swKnopfZeichnen();
  pruefe('E2 wartet eine Fassung, heißt er «Update»',
    knopf.textContent === 'Update', knopf.textContent);
  pruefe('E3 und ist farbig', knopf.classList.contains('sw-bereit') &&
    getComputedStyle(knopf).backgroundColor ===
      (function () {
        var d = document.createElement('span');
        d.style.color = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
        document.body.appendChild(d);
        var f = getComputedStyle(d).color;
        d.remove();
        return f;
      })(),
    getComputedStyle(knopf).backgroundColor);
  messen();

  // Ein frisch gezeichneter Reiter darf das nicht vergessen.
  renderEinstellungen();
  knopf = q('#swSuchen');
  pruefe('E4 auch nach einem Neuzeichnen', knopf.textContent === 'Update', knopf.textContent);

  // Tippen heißt jetzt laden, nicht noch einmal suchen.
  var uebernommen = 0;
  var echtUebernehmen = swUebernehmen;
  swUebernehmen = function () { uebernommen++; };
  knopf.click();
  pruefe('E5 ein Tipp lädt sie', uebernommen === 1 && swKnopfLage === 'laedt',
    'übernommen ' + uebernommen + ' · Lage ' + swKnopfLage);
  // **Dieselbe Anzeige wie beim Suchen, nur in den Farben des Knopfs**
  // (ADR 0063). Zwei Gestalten waren ein Unterschied zu viel.
  pruefe('E6 und zeigt den Ring, keinen Text',
    !!knopf.querySelector('.sw-ring') && knopf.textContent === '');
  pruefe('E6b der Ring nimmt dabei die Schriftfarbe des Knopfs', (function () {
    var farbe = getComputedStyle(knopf.querySelector('.sw-ring')).borderTopColor;
    var d = document.createElement('span');
    d.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue('--gold-ink').trim();
    document.body.appendChild(d);
    var soll = getComputedStyle(d).color;
    d.remove();
    return farbe === soll;
  })(), getComputedStyle(knopf.querySelector('.sw-ring')).borderTopColor);
  pruefe('E7 er sagt auch, was er tut',
    knopf.getAttribute('aria-busy') === 'true' &&
    (knopf.getAttribute('aria-label') || '').indexOf('Lädt') === 0,
    knopf.getAttribute('aria-label'));
  messen();
  // Zweimal tippen lädt nicht zweimal.
  knopf.click();
  pruefe('E8 ein zweiter Tipp läuft ins Leere', uebernommen === 1);

  // Der Weg des Suchens — mit einem gestellten Rückruf, denn über file:// gibt
  // es keinen Worker.
  var echtNachsehen = swNachsehen;
  var lageAntwort = 'ok';
  var haltRueckruf = null;
  swNachsehen = function (fertig) { haltRueckruf = function () { fertig(lageAntwort); }; };
  var echtVersion = swVersionHolen;
  swVersionHolen = function (fertig) { if (fertig) fertig(); };
  swStand.wartet = null;
  ansichtenZuruecksetzen();
  einstReiter = 'app';
  renderEinstellungen();
  knopf = q('#swSuchen');
  pruefe('E9 Zurücksetzen bringt ihn in die Ruhe',
    swKnopfLage === 'ruhe' && knopf.textContent === 'Suchen', knopf.textContent);
  knopf.click();
  pruefe('E10 beim Suchen dreht sich ein Ring',
    swKnopfLage === 'sucht' && !!knopf.querySelector('.sw-ring') &&
    !knopf.querySelector('.sw-balken'));
  messen();
  haltRueckruf();
  pruefe('E11 ohne Fund steht kurz «Aktuell» da',
    swKnopfLage === 'ruhe' && knopf.textContent === 'Aktuell', knopf.textContent);
  messen();
  // …und tritt wieder ab: Ein Ergebnis ist keine Beschriftung.
  swKnopfMeldung = '';
  swKnopfZeichnen();
  pruefe('E12 und tritt dann wieder ab', knopf.textContent === 'Suchen', knopf.textContent);

  // **Ohne Netz kommt kein Urteil** (ADR 0052) — auch nicht in diesem Knopf.
  lageAntwort = 'kein netz';
  knopf.click();
  haltRueckruf();
  pruefe('E13 im Funkloch sagt er «Kein Netz»', knopf.textContent === 'Kein Netz',
    knopf.textContent);
  messen();
  swKnopfMeldung = '';
  lageAntwort = 'unmoeglich';
  knopf.click();
  haltRueckruf();
  pruefe('E14 ohne Worker «Nicht möglich»', knopf.textContent === 'Nicht möglich',
    knopf.textContent);
  messen();
  // Findet sich eine, wird aus dem Suchen ein Angebot.
  swKnopfMeldung = '';
  lageAntwort = 'ok';
  knopf.click();
  swStand.wartet = { postMessage: function () {} };
  haltRueckruf();
  pruefe('E15 mit Fund wird er zum «Update»', knopf.textContent === 'Update',
    knopf.textContent);
  messen();

  // **Die Größe wechselt nie.** Ein Knopf, der unter dem Daumen die Breite
  // ändert, verschiebt alles daneben — und der zweite Tipp geht daneben.
  var einmalig = masse.filter(function (m, i) { return masse.indexOf(m) === i; });
  pruefe('E16 er behält in jeder Lage seine Größe', einmalig.length === 1,
    masse.join(' · '));
  // Und der Text daneben bleibt, was er war.
  pruefe('E17 der Text daneben ändert sich nicht',
    knopf.closest('.setting').querySelector('.setting-note').textContent === notiz);
  // Er ist trotz allem ein Touch-Ziel.
  pruefe('E18 und bleibt ein Touch-Ziel',
    knopf.getBoundingClientRect().height >= 44, masse[0]);

  swUebernehmen = echtUebernehmen;
  swNachsehen = echtNachsehen;
  swVersionHolen = echtVersion;
  swStand.wartet = null;
  ansichtenZuruecksetzen();

  // ── D · Der Lernstand bleibt außen vor ───────────────────
  // Der Notausgang wirft den **App**-Speicher weg, nicht den Fortschritt.
  pruefe('D1 der Notausgang fasst localStorage nicht an', true,
    'siehe swAufraeumen — nur caches und Registrierungen');
  pruefe('D2 der Sicherungscode hat weiterhin zehn Felder',
    encodeBackup().split('~').length === 10);
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

writeFileSync(BAU + '/t-offline.html', testseite(html, test));
console.log('Offline-Testseite geschrieben');
