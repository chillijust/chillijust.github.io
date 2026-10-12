// Ruckler messen (Nachricht 15, Block 3): Im Reiter «Flüssig» mißt die App zehn
// Sekunden lang jeden Bildabstand, gleich welche Bewegung läuft. Der Takt ist
// der Median, ein Ruckler ein Abstand über anderthalb Takten — so gilt es bei
// 60, 120 und 30 Hz. Der Prüfstand zeichnet keine Bilder: Die Bilder kommen
// hier aus einem eigenen requestAnimationFrame, dem die Suite den Takt vorgibt.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('ruckler', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function reihe(n, takt) { var a = []; for (var i = 0; i < n; i++) a.push(takt); return a; }
function wert(name) {
  var z = alle('#rkZeilen .zeile').filter(function (z) { return z.firstChild.textContent === name; })[0];
  return z ? z.querySelector('.wert').textContent : null;
}
// Ein eigener Bildtakt: Jeder Aufruf von bilder(n, ms) liefert n Bilder im
// Abstand ms an alles, was requestAnimationFrame bestellt hat.
var rafEcht = window.requestAnimationFrame, bestellt = [], uhr = 1000;
function bilder(n, ms) {
  for (var i = 0; i < n; i++) {
    uhr += ms;
    var jetztDran = bestellt; bestellt = [];
    jetztDran.forEach(function (f) { f(uhr); });
  }
}
function labor() { esReiter = 'fluessig'; zeige('einstellungen'); }

frisch();
state.bewegung = 'aus';
themaAnwenden();

// ── Die Auswertung ────────────────────────────────────────────
var a = reihe(600, 1000 / 60);
for (var i = 0; i < 15; i++) a[i * 40] = 50;
var e = rucklerAuswerten(a);
pruefe('R1 bei 60 Hz: Takt, Ruckler, ausgelassene Bilder, längster Abstand',
  e && e.hz === 60 && e.ruckler === 15 && e.aus === 30 && e.laengster === 50 && e.bilder === 601, JSON.stringify(e));
var b = reihe(1200, 1000 / 120);
b[10] = 1000 / 60; b[20] = 1000 / 60;
e = rucklerAuswerten(b);
pruefe('R2 bei 120 Hz ist ein Bild zu 60 Hz schon ein Ruckler', e && e.hz === 120 && e.ruckler === 2 && e.aus === 2, JSON.stringify(e));
e = rucklerAuswerten(reihe(300, 1000 / 30));
pruefe('R3 gleichmäßig 30 Hz (Stromsparen) ist kein Ruckler', e && e.hz === 30 && e.ruckler === 0 && e.aus === 0, JSON.stringify(e));
pruefe('R4 unter zehn Abständen gibt es kein Ergebnis', rucklerAuswerten(reihe(9, 16)) === null && rucklerAuswerten([]) === null);
var c = reihe(100, 1000 / 60); c[50] = 1000 / 60 * 1.4;
e = rucklerAuswerten(c);
pruefe('R5 ein knapp verspätetes Bild unter anderthalb Takten zählt nicht', e && e.ruckler === 0, JSON.stringify(e));

// ── Der Reiter ────────────────────────────────────────────────
rucklerLetzte = null;
labor();
var knopf = q('#rkKnopf'), kopf = q('#rkKarte') && q('#rkKarte').parentNode.querySelector('h2');
pruefe('R6 der Reiter «Flüssig» trägt «Ruckler messen» mit Knopf', !!knopf && !!kopf && /Ruckler/.test(kopf.textContent) &&
  knopf.textContent === 'Messen');
pruefe('R7 der Knopf ist groß genug', knopf.getBoundingClientRect().height >= 44 && knopf.getBoundingClientRect().width >= 44);
pruefe('R8 ohne Messung steht «noch keine» da', wert('Letzte Messung') === 'noch keine');
pruefe('R9 die Messung steht über den Proben', !!q('#app [data-fp-karte]') &&
  (q('#rkKarte').compareDocumentPosition(q('#app [data-fp-karte]')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);

// ── Eine Messung, mit eigenem Takt ────────────────────────────
window.requestAnimationFrame = function (f) { bestellt.push(f); return bestellt.length; };
knopf.click();
var lauf = ruckler;
pruefe('R10 «Messen» startet die Messung und zählt herunter', !!lauf && q('#rkKnopf').textContent.indexOf('10 s') !== -1, q('#rkKnopf').textContent);
q('#rkKnopf').click();
pruefe('R11 ein zweiter Tipp startet keine zweite', ruckler === lauf && bestellt.length === 1, bestellt.length);
bilder(301, 1000 / 60);   // das erste Bild setzt nur den Anfang
pruefe('R12 nach fünf Sekunden steht «5 s» auf dem Knopf', /5 s/.test(q('#rkKnopf').textContent), q('#rkKnopf').textContent);
// Mitten in der Messung woanders hin: Sie läuft weiter.
zeige('home');
bilder(1, 100);
bilder(1, 1000 / 60 * 3);
pruefe('R13 die Messung läuft weiter, wenn man den Reiter verläßt', ruckler === lauf);
bilder(400, 1000 / 60);
pruefe('R14 nach zehn Sekunden ist sie fertig', ruckler === null && bestellt.length === 0, bestellt.length);
pruefe('R15 das Ergebnis meldet sich mit «OK», wo man ist', !q('#hinweisBlatt').hidden && q('#hinweisTitel').textContent === '2 Ruckler' &&
  !q('#hinweisOk').hidden && /längster Abstand 100 ms/.test(q('#hinweisText').textContent), q('#hinweisTitel').textContent + ' / ' + q('#hinweisText').textContent);
pruefe('R16 im neutralen Zeichen, nicht im Haken', q('#hinweisHaken').getAttribute('data-zeichen') === 'hinweis');
q('#hinweisOk').click();
labor();
pruefe('R17 der Reiter zeigt die letzte Messung', wert('Ruckler') === '2' && wert('Ausgelassene Bilder') === '7' &&
  wert('Längster Abstand') === '100 ms' && /^60 Hz/.test(wert('Takt')), [wert('Ruckler'), wert('Ausgelassene Bilder'), wert('Längster Abstand'), wert('Takt')].join(' | '));

// ── Im Reiter fertig: die Karte zeichnet sich an Ort und Stelle neu ──
q('#rkKnopf').click();
bilder(10, 1000 / 60); bilder(1, 50); bilder(600, 1000 / 60);
q('#hinweisOk').click();
pruefe('R18 endet sie im Reiter, steht das neue Ergebnis gleich da, der Knopf geht wieder',
  wert('Ruckler') === '1' && q('#rkKnopf').textContent === 'Messen' && !ruckler, wert('Ruckler'));
q('#rkKnopf').click();
pruefe('R19 der neue Knopf ist gebunden', !!ruckler);
bilder(700, 1000 / 60);
q('#hinweisOk').click();

// ── Hintergrund: die Lücke ist kein Ruckler ──────────────────
var vorher = rucklerLetzte;
q('#rkKnopf').click();
bilder(100, 1000 / 60);
Object.defineProperty(document, 'hidden', { configurable: true, get: function () { return true; } });
document.dispatchEvent(new Event('visibilitychange'));
delete document.hidden;
bilder(1, 5000); bilder(400, 1000 / 60);
pruefe('R20 war die App im Hintergrund, gibt es kein Ergebnis', ruckler === null && rucklerLetzte === vorher &&
  q('#hinweisTitel').textContent === 'Keine Messung' && /Hintergrund/.test(q('#hinweisText').textContent), q('#hinweisTitel').textContent);
q('#hinweisOk').click();

// ── Eine offene Frage wird nicht überschrieben ───────────────
q('#rkKnopf').click();
bilder(100, 1000 / 60);
hinweisZeigen('Eine Frage', 'Wirklich?', null, null, { frage: { ja: 'Ja', beiJa: function () {} } });
bilder(600, 1000 / 60);
pruefe('R21 steht eine Frage da, wartet das Ergebnis', ruckler === null && q('#hinweisTitel').textContent === 'Eine Frage');
q('#hinweisNein').click();
window.requestAnimationFrame = rafEcht;
return warten(700).then(function () {
  pruefe('R22 nach der Frage kommt das Ergebnis', !q('#hinweisBlatt').hidden && q('#hinweisTitel').textContent === 'Keine Ruckler',
    q('#hinweisTitel').textContent);
  q('#hinweisOk').click();

  // ── Kein Bild mehr: die Messung endet trotzdem ─────────────
  window.requestAnimationFrame = function (f) { return 0; };
  rucklerStarten();
  window.requestAnimationFrame = rafEcht;
  return warten(RUCKLER_MS + 1200);
}).then(function () {
  pruefe('R23 kommt kein Bild, endet sie nach der Frist ohne Ergebnis', ruckler === null &&
    q('#hinweisTitel').textContent === 'Keine Messung', q('#hinweisTitel').textContent);
  q('#hinweisOk').click();
});
`);
