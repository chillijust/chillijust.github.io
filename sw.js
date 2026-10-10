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
var SW_VERSION = '0.13.3T2'; /* == VERSION == */
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

// **Aus dem Speicher sofort, im Hintergrund nachsehen.** «Netz zuerst» hieße,
// bei jedem Start erst zu warten — im Funkloch bis zum Zeitablauf. «Nur
// Speicher» wäre eine Falle: Man säße für immer auf dem alten Stand. Dass eine
// neue Fassung da ist, meldet nicht dieser Weg, sondern der wartende Worker.
self.addEventListener('fetch', function (e) {
  var anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  // Fremde Adressen gehen diesen Worker nichts an. Die App ruft keine auf.
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
          if (anfrage.mode === 'navigate') return c.match('./index.html');
          return new Response('', { status: 504, statusText: 'offline' });
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
