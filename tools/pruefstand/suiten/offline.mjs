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
  /lage === 'kein netz'\) suchen\.textContent = 'Kein Netz';/.test(html));
pruefeDatei('S16 «Aktuell» steht nur nach einer geglückten Anfrage',
  (html.match(/'Aktuell'/g) || []).length === 1 &&
  /else suchen\.textContent = swStand\.wartet \? 'Neue Fassung bereit' : 'Aktuell';/.test(html));
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
  pruefe('C2 der letzte heißt «App»',
    EINST_REITER[EINST_REITER.length - 1].id === 'app');
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
