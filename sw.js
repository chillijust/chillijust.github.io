// Chillinal · Service Worker
//
// **Die zweite Datei im Auslieferungspfad, und die letzte** (ADR 0001). Sie
// enthält keinen Inhalt und keine Logik über Gewohnheiten: Sie legt die App
// beiseite und gibt sie zurück.
//
// Der Stil folgt `index.html`: ES5-nah, `var`, klassische Funktionen, kein
// `async`.
'use strict';

// Wird von tools/build.mjs gestempelt, genau wie APP_VERSION in index.html.
// **Der Cache trägt die Version im Namen**: Ein neuer Stand legt einen neuen
// Speicher an, und jeder andere wird beim Aktivieren restlos gelöscht — auch
// der von Chillingo, das unter derselben Adresse lief. Den Lernstand im
// localStorage berührt das nicht.
var SW_VERSION = '1.0.0'; /* == VERSION == */
var CACHE = 'chillinal-' + SW_VERSION;

// Die App ist **eine** Datei; Schriften, Bilder und Symbol stecken in ihr.
// «./» und «./index.html» sind dieselbe Seite unter zwei Adressen — beide
// müssen drin sein, weil der Browser mal die eine, mal die andere anfragt.
var DATEIEN = ['./', './index.html'];

// **Am HTTP-Cache vorbei.** Pages liefert mit `max-age=600`; ein gewöhnliches
// `fetch` nähme bis zu zehn Minuten lang die alte Datei aus dem Browser-Cache
// und legte sie unter dem neuen Namen ab — der neue Worker trüge dann die alte
// App. Beim Übergang von Chillingo wäre das Chillingo gewesen.
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(DATEIEN.map(function (d) { return new Request(d, { cache: 'reload' }); }));
    })
    // **Kein skipWaiting.** Der neue Worker wartet, bis der Nutzer es will —
    // sonst tauschte sich die App unter der laufenden Sitzung aus.
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

// **Er liefert, was er hat** (ADR 0057): Die Dateien seines Standes kommen aus
// seinem Speicher, ohne aufs Netz zu warten — auch im Funkloch. Ans Netz geht
// er nur für das, was fehlt, und legt es abgewartet dazu; was er hat,
// überschreibt er nie. Eine neue Fassung kommt allein über den neuen Worker:
// Der Browser findet ihn beim Start, er richtet sich seinen eigenen Speicher
// ein und wartet auf «Jetzt laden». Bis 0.17.0T14 legte dieser Weg jede frische
// Netzantwort in den eigenen Speicher — beim zweiten Start lief die neue App
// schon unter dem alten Worker, bevor jemand «Jetzt laden» getippt hatte.
self.addEventListener('fetch', function (e) {
  var anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  // Fremde Adressen gehen diesen Worker nichts an. Die App ruft keine auf.
  if (anfrage.url.indexOf(self.location.origin) !== 0) return;

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(anfrage, { ignoreSearch: true }).then(function (treffer) {
        if (treffer) return treffer;
        return fetch(anfrage).then(function (antwort) {
          if (!antwort || !antwort.ok || antwort.type !== 'basic') return antwort;
          // Abgewartet: Scheitert das Ablegen, liefert er trotzdem, was kam.
          return c.put(anfrage, antwort.clone()).then(function () { return antwort; }, function () { return antwort; });
        }, function () {
          var offline = new Response('', { status: 504, statusText: 'offline' });
          if (anfrage.mode !== 'navigate') return offline;
          return c.match('./index.html').then(function (seite) { return seite || offline; });
        });
      });
    })
  );
});

// Zwei Nachrichten, mehr nicht. **Dieselben wie bei Chillingo** — dessen Seite
// schickt «uebernehmen», wenn auf dem Gerät «Jetzt laden» getippt wird. Nur so
// kommt Chillinal über den Update-Knopf der alten App an.
self.addEventListener('message', function (e) {
  var daten = e.data || {};
  if (daten.art === 'version' && e.ports && e.ports[0]) {
    e.ports[0].postMessage({ version: SW_VERSION });
  }
  if (daten.art === 'uebernehmen') self.skipWaiting();
});
