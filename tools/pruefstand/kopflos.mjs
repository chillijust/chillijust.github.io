// Der kopflose Browser, gesteuert über das DevTools-Protokoll.
//
// Bis 0.17.0T16 rief der Läufer Chromium je Suite mit `--dump-dom` und
// `--window-size=430,932`. Das kopflose Chrome hält aber eine Mindestbreite von
// 500 Punkten und zieht 87 Punkte Leiste ab: Geprüft wurde in 500 × 845, nicht
// auf dem Zielgerät. Die Kopfloshülle kann es genau, fehlt aber auf GitHub —
// lokal grün und dort rot wäre schlimmer als beides falsch. Über das Protokoll
// stellt `Emulation.setDeviceMetricsOverride` das Fenster in jedem Chromium
// exakt ein. Node 22 bringt `WebSocket` mit; installiert wird nichts.
//
// Wie `--dump-dom --virtual-time-budget`: Die virtuelle Zeit startet mit der
// Navigation, läuft bis zum Budget, dann wird das DOM gelesen. Jede Seite bekommt
// einen eigenen Browserkontext — eigener Speicher, wie zuvor ein frischer Prozess.

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

function mitFrist(versprechen, ms, was) {
  let uhr;
  const frist = new Promise((ja, nein) => { uhr = setTimeout(() => nein(new Error(was)), ms); });
  return Promise.race([versprechen, frist]).finally(() => clearTimeout(uhr));
}

export async function browserStarten(chrome) {
  const profil = mkdtempSync(join(tmpdir(), 'pruefstand-'));
  // Jede Seite beginnt hier, nicht auf about:blank: Der Weg von dort nach
  // file:// wechselt den Prozeß, und mit laufender virtueller Zeit stürzt der
  // Renderer dabei ab. Von file:// nach file:// bleibt er, wo er ist.
  const leer = join(profil, 'leer.html');
  writeFileSync(leer, '<!DOCTYPE html><title></title>');
  const proc = spawn(chrome, ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--remote-debugging-port=0', '--user-data-dir=' + profil, 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
  // Endet Node vorher (ein Wurf, ein Abbruch), bleibt kein Chromium liegen.
  const aufraeumen = () => proc.kill('SIGKILL');
  process.once('exit', aufraeumen);
  const adresse = await mitFrist(new Promise((ja, nein) => {
    let gelesen = '';
    proc.stderr.on('data', (d) => {
      if (gelesen === null) return;   // weiter abnehmen, damit die Leitung nicht vollläuft
      gelesen += d;
      const m = gelesen.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { gelesen = null; ja(m[1]); }
    });
    proc.on('exit', (c) => nein(new Error('Chromium endete beim Start mit ' + c)));
  }), 30000, 'Chromium meldet sich nicht');

  const ws = new WebSocket(adresse);
  await mitFrist(new Promise((ja, nein) => { ws.onopen = ja; ws.onerror = () => nein(new Error('keine Verbindung')); }),
    10000, 'DevTools antworten nicht');
  let zaehler = 0;
  const offen = new Map(), hoerer = new Set();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && offen.has(m.id)) {
      const w = offen.get(m.id);
      offen.delete(m.id);
      if (m.error) w.nein(new Error(m.error.message)); else w.ja(m.result);
    } else if (m.method) hoerer.forEach((h) => h(m));
  };
  // Reißt die Verbindung, wartet keine Anfrage mehr ewig.
  ws.onclose = () => {
    offen.forEach((w) => w.nein(new Error('Verbindung zu Chromium getrennt')));
    offen.clear();
  };
  function senden(method, params = {}, sessionId) {
    const id = ++zaehler;
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
    return new Promise((ja, nein) => offen.set(id, { ja, nein }));
  }
  return {
    senden,
    hoerer,
    leer: pathToFileURL(leer).href,
    ende() {
      try { ws.close(); } catch (e) { /* schon zu */ }
      process.removeListener('exit', aufraeumen);
      proc.kill('SIGKILL');
      try { rmSync(profil, { recursive: true, force: true }); } catch (e) { /* bleibt liegen */ }
    }
  };
}

// Lädt `url` in einem Fenster von `breite` × `hoehe`, läßt `budget` ms virtuelle
// Zeit laufen und gibt das DOM zurück. Hängt die Seite (eine Schleife ohne
// Ende), wirft es nach `frist` ms echter Zeit.
export async function domLesen(b, url, breite, hoehe, budget = 20000, frist = 120000) {
  const { browserContextId } = await b.senden('Target.createBrowserContext');
  try {
    const { targetId } = await b.senden('Target.createTarget', { url: b.leer, browserContextId });
    const { sessionId } = await b.senden('Target.attachToTarget', { targetId, flatten: true });
    await b.senden('Emulation.setDeviceMetricsOverride',
      { width: breite, height: hoehe, deviceScaleFactor: 1, mobile: false }, sessionId);
    // Auf dem iPhone liegt die Bildlaufleiste über dem Inhalt und nimmt keinen
    // Platz. Die klassische nimmt 15 Punkte: Wird die Seite knapp zu hoch,
    // erscheint sie, der Text bricht um, die Seite wird höher (langdruck G3).
    await b.senden('Emulation.setScrollbarsHidden', { hidden: true }, sessionId);
    let fertig;
    const abgelaufen = new Promise((ja) => {
      fertig = (m) => { if (m.sessionId === sessionId && m.method === 'Emulation.virtualTimeBudgetExpired') ja(); };
      b.hoerer.add(fertig);
    });
    try {
      // Erst die Zeit anhalten, dann laden, dann das Budget freigeben: So läuft
      // jeder Zeitgeber der Seite von Anfang an virtuell. `waitForNavigation`
      // wartete hier nicht — das Budget lief leer ab, bevor die Seite kam.
      await b.senden('Emulation.setVirtualTimePolicy', { policy: 'pause' }, sessionId);
      await b.senden('Page.navigate', { url }, sessionId);
      await b.senden('Emulation.setVirtualTimePolicy', { policy: 'pauseIfNetworkFetchesPending', budget }, sessionId);
      await mitFrist(abgelaufen, frist, 'die Seite hängt');
    } finally {
      b.hoerer.delete(fertig);
    }
    const r = await mitFrist(b.senden('Runtime.evaluate',
      { expression: 'document.documentElement.outerHTML', returnByValue: true }, sessionId), 10000, 'das DOM kommt nicht');
    return r.result.value || '';
  } finally {
    await mitFrist(b.senden('Target.disposeBrowserContext', { browserContextId }), 10000, '').catch(() => {});
  }
}
