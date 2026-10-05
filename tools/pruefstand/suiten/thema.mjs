// Hell, dunkel, automatisch — und der Sonne/Mond-Schalter im Kopf.
//
// Der kopflose Browser ist hell. Was das Gerät dunkel macht, lässt sich hier
// nicht einstellen; geprüft wird darum, dass die Medienabfrage dieselbe
// Palette trägt wie die ausdrückliche Wahl — Wert für Wert.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('thema', html, String.raw`
function grund() { return getComputedStyle(document.body).backgroundColor; }
function meta() { return q('meta[name="theme-color"]').getAttribute('content'); }
function token(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function gespeichert() {
  try { return JSON.parse(localStorage.getItem(SPEICHER) || '{}').thema; } catch (e) { return '?'; }
}
// Übergänge abschalten: Der kopflose Browser lässt sie nicht zuverlässig
// ablaufen, und gefragt ist die Zielfarbe, nicht der Weg dorthin.
var still = document.createElement('style');
still.textContent = '*, *::before, *::after { transition: none !important; }';
document.head.appendChild(still);
function warte(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// Chillingos Lernstand liegt auf dem Gerät. Er muss das alles überstehen.
var ALT = 'russisch_' + 'trainer_v1';
try { localStorage.setItem(ALT, '{"boxes":{"x":3}}'); } catch (e) { /* dann prüft E1 es */ }

frisch();
localStorage.removeItem(SPEICHER);

// ── A · Ohne Wahl folgt die App dem Gerät ───────────────────
pruefe('A1 Vorgabe ist «auto»', state.thema === 'auto');
pruefe('A2 dann trägt <html> kein Attribut', !document.documentElement.hasAttribute('data-thema'));
pruefe('A3 der Grund ist Elfenbein', grund() === 'rgb(250, 249, 245)', grund());
pruefe('A4 die Statusleiste auch', meta() === '#FAF9F5', meta());
// Der Schalter ist ein Schieber: Sonne links, Mond rechts, beide immer da;
// der Knauf liegt unter dem, was gilt.
function mitte(el) { var r = el.getBoundingClientRect(); return r.left + r.width / 2; }
function knaufAuf() {
  var k = mitte(q('#themaKnopf .knauf'));
  var hell = mitte(q('#themaKnopf .hell')), dunkel = mitte(q('#themaKnopf .dunkel'));
  return Math.abs(k - hell) < 2 ? 'sonne' : Math.abs(k - dunkel) < 2 ? 'mond' : k + '';
}
pruefe('A5 der Schalter ist ein Schalter', q('#themaKnopf').getAttribute('role') === 'switch' &&
  q('#themaKnopf').getAttribute('aria-label') === 'Dunkle Darstellung');
pruefe('A6 er steht auf «hell»', q('#themaKnopf').getAttribute('aria-checked') === 'false');
pruefe('A7 die Sonne links, der Mond rechts', !!q('#themaKnopf .hell circle') &&
  !q('#themaKnopf .dunkel circle') && mitte(q('#themaKnopf .hell')) < mitte(q('#themaKnopf .dunkel')));
pruefe('A8 der Knauf liegt auf der Sonne', knaufAuf() === 'sonne', knaufAuf());

// ── B · Die Medienabfrage und die Wahl tragen dieselbe Palette ─
function regelWerte(pruefRegel) {
  var werte = null;
  Array.prototype.forEach.call(document.styleSheets, function (blatt) {
    Array.prototype.forEach.call(blatt.cssRules, function (r) { if (!werte) werte = pruefRegel(r); });
  });
  return werte;
}
function eigenschaften(stil) {
  var o = {};
  for (var i = 0; i < stil.length; i++) if (stil[i].indexOf('--') === 0) o[stil[i]] = stil.getPropertyValue(stil[i]).trim();
  return o;
}
var ausMedien = regelWerte(function (r) {
  if (!r.media || r.conditionText !== '(prefers-color-scheme: dark)') return null;
  var innen = r.cssRules[0];
  return innen && innen.selectorText === ':root:not([data-thema="hell"])' ? eigenschaften(innen.style) : null;
});
var ausWahl = regelWerte(function (r) {
  return r.selectorText === ':root[data-thema="dunkel"]' ? eigenschaften(r.style) : null;
});
pruefe('B1 die Medienabfrage gibt es', !!ausMedien);
pruefe('B2 die ausdrückliche Wahl auch', !!ausWahl);
pruefe('B3 beide tragen dieselben Werte',
  !!ausMedien && !!ausWahl && JSON.stringify(ausMedien) === JSON.stringify(ausWahl));
pruefe('B4 eine gewählte helle Darstellung sticht das dunkle Gerät',
  /:root:not\(\[data-thema="hell"\]\)/.test(Array.prototype.map.call(document.styleSheets[0].cssRules,
    function (r) { return r.cssText; }).join(' ')));

// ── C · Der Schalter im Kopf ────────────────────────────────
themaUmschalten();
return warte(400).then(function () {
  pruefe('C1 ein Tipp schaltet dunkel', state.thema === 'dunkel');
  pruefe('C2 <html> trägt es', document.documentElement.getAttribute('data-thema') === 'dunkel');
  pruefe('C3 der Grund wird dunkel', grund() === 'rgb(20, 20, 19)', grund());
  pruefe('C4 die Statusleiste folgt', meta() === '#141413', meta());
  pruefe('C5 der Schalter steht auf «dunkel»', q('#themaKnopf').getAttribute('aria-checked') === 'true');
  pruefe('C5a der Knauf liegt auf dem Mond', knaufAuf() === 'mond', knaufAuf());
  pruefe('C6 die Wahl ist gemerkt', gespeichert() === 'dunkel', gespeichert());
  pruefe('C7 und übersteht das Laden', laden().thema === 'dunkel');
  pruefe('C8 der Akzent bleibt die Chili', token('--akzent') === '#D97757', token('--akzent'));
  pruefe('C9 «erledigt» ist im Dunkeln aufgehellt', token('--erledigt') !== '#788C5D' && token('--erledigt') !== '');
  themaUmschalten();
  return warte(400);
}).then(function () {
  pruefe('C10 der zweite Tipp schaltet hell — fest, nicht zurück auf auto', state.thema === 'hell');
  pruefe('C11 <html> trägt «hell»', document.documentElement.getAttribute('data-thema') === 'hell');
  pruefe('C12 der Grund ist wieder Elfenbein', grund() === 'rgb(250, 249, 245)', grund());
  pruefe('C13 der Knauf ist zurück auf der Sonne', knaufAuf() === 'sonne', knaufAuf());

  // ── D · Die Wahl in den Einstellungen ─────────────────────
  zeige('einstellungen');
  var wahl = alle('.wahl [data-thema]');
  pruefe('D1 drei Möglichkeiten', wahl.map(function (b) { return b.textContent; }).join(',') ===
    'Automatisch,Hell,Dunkel');
  pruefe('D2 die gewählte ist gedrückt',
    q('.wahl [aria-pressed="true"]').getAttribute('data-thema') === 'hell');
  q('.wahl [data-thema="auto"]').click();
  pruefe('D3 «Automatisch» führt zurück zum Gerät', state.thema === 'auto' &&
    !document.documentElement.hasAttribute('data-thema'));
  pruefe('D4 und ist gemerkt', gespeichert() === 'auto');
  q('.wahl [data-thema="dunkel"]').click();
  pruefe('D5 «Dunkel» wirkt sofort', grund() === 'rgb(20, 20, 19)' &&
    q('.wahl [aria-pressed="true"]').getAttribute('data-thema') === 'dunkel');

  // ── E · Chillingo bleibt liegen ───────────────────────────
  pruefe('E1 Chillingos Lernstand ist unberührt', localStorage.getItem(ALT) === '{"boxes":{"x":3}}');
  var schluessel = [];
  for (var i = 0; i < localStorage.length; i++) schluessel.push(localStorage.key(i));
  pruefe('E2 Chillinal schreibt nur unter seinem Schlüssel',
    schluessel.sort().join(',') === [ALT, 'chillinal_v1'].sort().join(','), schluessel.join(','));

  // ── F · Bewegung lässt sich abstellen ─────────────────────
  var ruhig = regelWerte(function (r) {
    return r.media && r.conditionText === '(prefers-reduced-motion: reduce)' ? r.cssRules[0].style : null;
  });
  pruefe('F1 bei «Bewegung reduzieren» stehen Animationen still', !!ruhig &&
    ruhig.getPropertyValue('animation-name') === 'none' &&
    ruhig.getPropertyPriority('animation-name') === 'important');
  pruefe('F2 und Übergänge auch', !!ruhig &&
    ruhig.getPropertyValue('transition-property') === 'none' &&
    ruhig.getPropertyPriority('transition-property') === 'important');
  still.remove();
  frisch();
  speichern();
});
`);
