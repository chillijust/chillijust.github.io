// Chillingo · Service Worker
//
// **Die zweite Datei im Auslieferungspfad** — die erste seit ADR 0001, und die
// einzige, die dazukommt (ADR 0059). Sie enthält keinen Inhalt und keine Logik
// über das Lernen: Sie legt die App beiseite und gibt sie zurück.
//
// Der Stil folgt `index.html`: ES5-nah, `var`, klassische Funktionen, kein
// `async`. Ein Service Worker läuft in jedem Browser, der ihn überhaupt kennt —
// eine neuere Sprachstufe brächte hier nichts.
'use strict';

// Wird von tools/build.mjs gestempelt, genau wie APP_VERSION in index.html.
// **Der Cache trägt die Version im Namen**: Ein neuer Stand legt einen neuen
// Speicher an, und der alte wird beim Aktivieren restlos gelöscht. Ohne das
// bliebe irgendwann eine Fassung hängen, die niemand mehr loswird.
var SW_VERSION = '2.4.2'; /* == VERSION == */
var CACHE = 'chillingo-' + SW_VERSION;

// Mehr ist es nicht. Die App ist **eine** Datei; Bilder, Schrift und Daten
// stecken in ihr. «./» und «./index.html» sind dieselbe Seite unter zwei
// Adressen — beide müssen drin sein, weil der Browser mal die eine, mal die
// andere anfragt.
var DATEIEN = ['./', './index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); })
    // **Kein skipWaiting.** Der neue Worker wartet, bis der Nutzer es will —
    // sonst tauschte sich die App unter der laufenden Sitzung aus. Der Knopf
    // im Hinweis schickt die Nachricht unten.
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.map(function (n) {
        return n === CACHE ? Promise.resolve() : caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// **Aus dem Speicher sofort, im Hintergrund nachsehen.**
//
// Die ausgelieferte Datei ist über 600 KB groß. «Netz zuerst» hieße, bei jedem
// Start erst darauf zu warten — im Funkloch bis zum Zeitablauf. Umgekehrt wäre
// «nur Speicher» eine Falle: Man säße für immer auf dem alten Stand.
//
// Also beides: Die gespeicherte Fassung geht sofort raus, die Anfrage läuft
// trotzdem und legt das Ergebnis für das nächste Mal ab. Dass eine neue Fassung
// da ist, meldet nicht dieser Weg, sondern der wartende Worker.
self.addEventListener('fetch', function (e) {
  var anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  // Fremde Adressen gehen diesen Worker nichts an. Die App ruft keine auf —
  // aber ein Worker, der alles abfängt, wäre eine Zusage, die er nicht
  // einhalten kann.
  if (anfrage.url.indexOf(self.location.origin) !== 0) return;

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(anfrage, { ignoreSearch: true }).then(function (treffer) {
        var netz = fetch(anfrage).then(function (antwort) {
          if (antwort && antwort.ok && antwort.type === 'basic') {
            c.put(anfrage, antwort.clone());
          }
          return antwort;
        }).catch(function () { return null; });

        if (treffer) return treffer;
        return netz.then(function (a) {
          if (a) return a;
          // Weder Speicher noch Netz: Für eine Seitenanfrage die App aus dem
          // Speicher, sonst eine ehrliche Fehlermeldung.
          if (anfrage.mode === 'navigate') return c.match('./index.html');
          return new Response('', { status: 504, statusText: 'offline' });
        });
      });
    })
  );
});

// Die App fragt, was hier liegt, und schickt den Worker weiter. Mehr Nachrichten
// gibt es nicht — was sie nicht beantworten kann, sagt sie nicht.
self.addEventListener('message', function (e) {
  var daten = e.data || {};
  if (daten.art === 'version' && e.ports && e.ports[0]) {
    e.ports[0].postMessage({ version: SW_VERSION });
  }
  if (daten.art === 'uebernehmen') self.skipWaiting();
});
