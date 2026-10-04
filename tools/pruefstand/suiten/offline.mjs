// Der Service Worker (ADR 0001) — soweit das hier überhaupt geht.
//
// **Was diese Suite nicht kann:** Service Worker laufen nicht unter file://,
// und der Prüfstand lädt genau so. Ob der Worker wirklich offline trägt, zeigt
// nur das Gerät. Geprüft wird alles andere:
//
//   · dass sw.js tut, was er soll, und nichts darüber hinaus,
//   · dass die App ohne ihn genauso läuft,
//   · dass der Notausgang existiert und die Auskunft ehrlich ist.
import { readFileSync } from 'node:fs';
import { WURZEL, suite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');
const sw = readFileSync(WURZEL + '/sw.js', 'utf8');
const version = readFileSync(WURZEL + '/VERSION', 'utf8').trim();

// ── Dateiprüfung: sw.js und index.html von außen gelesen ─────
const aussen = [];
const pruefeDatei = (name, bedingung, extra) => {
  aussen.push((bedingung ? 'PASS ' : 'FAIL ') + name + (extra ? ' [' + extra + ']' : ''));
};
pruefeDatei('S1 sw.js trägt dieselbe Version wie die App',
  sw.includes("var SW_VERSION = '" + version + "';") && html.includes("var APP_VERSION = '" + version + "';"),
  version);
pruefeDatei('S2 der Cache heißt nach Chillinal und der Version',
  /CACHE\s*=\s*'chillinal-'\s*\+\s*SW_VERSION/.test(sw));
// Geprüft wird der **Aufruf**, nicht das Wort — im Kommentar steht es auch.
const aufrufe = (sw.match(/self\.skipWaiting\s*\(/g) || []).length;
pruefeDatei('S3 der neue Worker drängt sich nicht vor', aufrufe === 1, String(aufrufe));
// **Dieselbe Nachricht wie bei Chillingo.** Dessen Seite schickt sie, wenn
// auf dem Gerät «Jetzt laden» getippt wird — nur so kommt Chillinal an.
pruefeDatei('S4 er lässt sich nur auf Ansage vor, mit Chillingos Wort',
  /art === 'uebernehmen'\) self\.skipWaiting\(\)/.test(sw));
pruefeDatei('S5 und antwortet auf die Frage nach der Version, wie Chillingo sie stellt',
  /daten\.art === 'version' && e\.ports && e\.ports\[0\]/.test(sw));
pruefeDatei('S6 beim Aktivieren fällt jeder fremde Speicher weg, Chillingos eingeschlossen',
  /activate[\s\S]{0,400}n === CACHE \? Promise\.resolve\(\) : caches\.delete\(n\)/.test(sw));
pruefeDatei('S7 fremde Adressen fängt er nicht ab', /self\.location\.origin/.test(sw));
pruefeDatei('S8 nur GET', /\.method\s*!==\s*'GET'/.test(sw));
pruefeDatei('S9 er lädt nichts nach', !/importScripts/.test(sw));
pruefeDatei('S10 keine Fremdadresse', !/https?:\/\//.test(sw));
pruefeDatei('S11 der Speicher antwortet zuerst', /if \(treffer\) return treffer;/.test(sw));
pruefeDatei('S12 und wird im Hintergrund nachgeführt', /c\.put\(anfrage, antwort\.clone\(\)\)/.test(sw));
pruefeDatei('S12b eingerichtet wird am HTTP-Cache vorbei, sonst trüge der neue Worker die alte App',
  /install[\s\S]{0,300}new Request\(d, \{ cache: 'reload' \}\)/.test(sw));
pruefeDatei('S13 er rührt den localStorage nicht an', !/localStorage\s*\./.test(sw));
const csp = (html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/) || [])[1] || '';
pruefeDatei('S14 die CSP öffnet genau eine Tür',
  csp.indexOf("worker-src 'self'") !== -1 && csp.indexOf('connect-src') === -1, csp);
pruefeDatei('S15 und bleibt sonst zu', csp.indexOf("default-src 'none'") === 0 && !/https?:|\*/.test(csp));
// **Ein Update lädt nie von selbst.** swUebernehmen() wird genau zweimal
// gerufen, beide Male an einem Tipp: «Jetzt laden» und der Knopf in den
// Einstellungen.
pruefeDatei('S16 übernommen wird nur auf Ansage',
  (html.match(/swUebernehmen\(\);/g) || []).length === 2 && !/setTimeout\([^)]*swUebernehmen/.test(html));
pruefeDatei('S17 nach dem Nachsehen wird auf den neuen Worker gewartet, aber nicht ewig',
  /if \(neu\.state === 'installing'\) return;/.test(html) &&
  /setTimeout\(function \(\) \{ swWartendPruefen\(reg\); ende\('ok'\); \}, 8000\)/.test(html));
pruefeDatei('S18 ohne Netz kein Urteil', /\.catch\(function \(\) \{ ende\('kein netz'\); \}\)/.test(html));
console.log(aussen.join('\n'));
if (aussen.some((z) => z.indexOf('FAIL') === 0)) throw new Error('sw.js entspricht nicht der Absprache');

suite('offline', html, String.raw`
frisch();

// ── A · Ohne Worker läuft alles ─────────────────────────────
pruefe('A1 hier steuert kein Worker die Seite',
  !navigator.serviceWorker || !navigator.serviceWorker.controller);
pruefe('A2 die App steht trotzdem', !!q('#chiliFigur') && !!q('#menuKnopf'));
pruefe('A3 das Anmelden wirft nicht', (function () {
  try { swAnmelden(); return true; } catch (e) { return false; }
})());
pruefe('A4 das Nachsehen auch nicht', (function () {
  try { swNachsehen(); return true; } catch (e) { return false; }
})());
pruefe('A5 der Notausgang ebenso wenig', (function () {
  try { swAufraeumen(); return true; } catch (e) { return false; }
})());
pruefe('A6 die Auskunft bleibt ehrlich',
  swAuskunft() === 'nicht unterstützt' || swAuskunft() === 'noch nicht', swAuskunft());

// ── B · Die Auskunft in den Einstellungen ───────────────────
zeige('einstellungen');
pruefe('B1 Version und Stand stehen da', q('#ansicht').textContent.indexOf(APP_VERSION) !== -1 &&
  q('#ansicht').textContent.indexOf(APP_STAND) !== -1);
swStand.bereit = true;
swStand.version = '9.9.9';
swBereitZeichnen();
pruefe('B2 eine späte Antwort des Workers kommt ins Feld',
  q('#swBereit').textContent === 'bereit · 9.9.9' && q('#swBereit').classList.contains('bereit'),
  q('#swBereit').textContent);
swStand.bereit = false;
swStand.version = '';
swBereitZeichnen();
pruefe('B3 ohne Worker sagt es das', q('#swBereit').textContent !== 'bereit' &&
  !q('#swBereit').classList.contains('bereit'));

// ── C · Der Knopf sagt, woran er war ────────────────────────
var lagen = { 'kein netz': 'Kein Netz', 'unmoeglich': 'Nicht möglich', 'aktuell': 'Aktuell',
  'sucht': 'Suche …', 'ruhe': 'Nach Aktualisierung suchen' };
Object.keys(lagen).forEach(function (l) {
  swKnopfLage = l;
  swKnopfZeichnen();
  pruefe('C ' + l, q('#swKnopf').textContent === lagen[l], q('#swKnopf').textContent);
});
swKnopfLage = 'ruhe';
swStand.wartet = { postMessage: function (m) { swStand.gesendet = m; } };
swKnopfZeichnen();
pruefe('C wartet eine Fassung, lädt der Knopf sie', q('#swKnopf').textContent === 'Neue Fassung laden');

// ── D · Der Hinweis ─────────────────────────────────────────
zeige('home');
var leiste = q('#swNeu');
swStand.wartet = null;
pruefe('D1 die Leiste ist verborgen, solange nichts wartet',
  leiste.hidden && getComputedStyle(leiste).display === 'none');
pruefe('D2 sie meldet sich ruhig', leiste.getAttribute('role') === 'status' &&
  leiste.getAttribute('aria-live') === 'polite');
var neuGeladen = 0;
swNeustart = function () { neuGeladen++; };
swStand.wartet = { postMessage: function (m) { swStand.gesendet = m; } };
swHinweisZeigen();
pruefe('D3 wartet eine Fassung, zeigt sie sich', !leiste.hidden && getComputedStyle(leiste).display !== 'none');
pruefe('D4 sie deckt nichts zu', getComputedStyle(leiste).position === 'static');
q('#swLaden').click();
pruefe('D5 «Jetzt laden» schickt dem Worker «uebernehmen»',
  swStand.gesendet && swStand.gesendet.art === 'uebernehmen');
pruefe('D6 und merkt sich, dass danach neu geladen wird', swStand.neuladen === true);
pruefe('D7 neu geladen wird erst, wenn der Worker übernimmt', neuGeladen === 0);
q('#swSpaeter').click();
pruefe('D8 «Später» blendet sie aus', leiste.hidden);
swHinweisZeigen();
pruefe('D9 und sie kommt in dieser Sitzung nicht wieder', leiste.hidden);

// ── E · Der Notausgang ──────────────────────────────────────
zeige('einstellungen');
pruefe('E1 es gibt ihn in den Einstellungen', !!q('#swNotausgang'));
pruefe('E2 er sagt, dass die Daten bleiben', /Daten bleiben/.test(q('#ansicht').textContent));
var vorher = localStorage.getItem(SPEICHER);
return new Promise(function (fertig) { swAufraeumen(fertig); }).then(function () {
  pruefe('E3 der Rückruf kommt', true);
  pruefe('E4 der localStorage ist unberührt', localStorage.getItem(SPEICHER) === vorher);
  swStand.wartet = null;
  swStand.neuladen = false;
  frisch();
});
`);
