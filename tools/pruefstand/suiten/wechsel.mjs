// Hell/Dunkel mehrmals hintereinander: Jeder Druck tropft, keiner nimmt dem
// nächsten die Klasse weg (ADR 0036).
//
// Der kopflose Browser zeichnet zu selten, um drei echte Übergänge in Folge zu
// messen — der Rückruf kommt dort oft erst, wenn der nächste Druck den alten
// überspringt. Darum ein Übergang, der sich verhält wie in Safari: Rückruf im
// nächsten Bild, Ende nach THEMA_TROPFEN, ein neuer überspringt den laufenden
// (der alte meldet dann sofort sein Ende).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('wechsel', html, String.raw`
function warte(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
var w = document.documentElement;
function tropft() { return w.classList.contains('thema-tropft'); }
var echt = document.startViewTransition, laufend = null, gestartet = 0;
document.startViewTransition = function (f) {
  if (laufend) laufend.skipTransition();
  gestartet++;
  var fertig, gerufen = false, t = { finished: new Promise(function (r) { fertig = r; }) };
  function rufen() { if (!gerufen) { gerufen = true; f(); } }
  t.skipTransition = function () { rufen(); if (laufend === t) laufend = null; fertig(); };
  setTimeout(rufen, 16);
  setTimeout(t.skipTransition, THEMA_TROPFEN);
  laufend = t;
  return t;
};
frisch();
state.thema = 'hell'; themaAnwenden(); render();

// ── A · Dreimal schnell ─────────────────────────────────────
var spur = [];
themaUmschalten();
return warte(150).then(function () {
  themaUmschalten();
  return warte(150);
}).then(function () {
  themaUmschalten();
  spur.push(tropft());
  return warte(600);
}).then(function () {
  spur.push(tropft());
  pruefe('A1 der dritte Druck tropft weiter, auch wenn die ersten beiden enden', spur[0] && spur[1], JSON.stringify(spur));
  pruefe('A2 jeder Druck tropft', gestartet === 3, gestartet);
  return warte(THEMA_TROPFEN + 300);
}).then(function () {
  pruefe('A3 danach ist es fertig', !tropft());
  pruefe('A4 es gilt, was der letzte Druck wollte', state.thema === 'dunkel' &&
    w.getAttribute('data-thema') === 'dunkel' && q('#themaKnopf').getAttribute('aria-checked') === 'true');

  // ── B · Weicher und langsamer ─────────────────────────────
  var regel = null;
  alle('style').forEach(function (st) {
    var r = st.sheet && st.sheet.cssRules;
    for (var i = 0; r && i < r.length; i++) {
      if (r[i].selectorText === 'html.thema-tropft::view-transition-new(root)') regel = r[i].style;
    }
  });
  pruefe('B1 der Tropfen dauert länger als zuvor', THEMA_TROPFEN >= 1200, THEMA_TROPFEN);
  pruefe('B2 und läuft auf einer sanfteren Kurve', !!regel && /cubic-bezier\(0?\.35, 0, 0?\.25, 1\)/.test(regel.animation),
    regel ? regel.animation : 'keine Regel');

  // ── C · Ohne Bewegung: sofort, und nichts bleibt hängen ───
  state.bewegung = 'aus';
  themaUmschalten();
  pruefe('C1 ohne Bewegung gilt die Wahl sofort, ohne Tropfen', state.thema === 'hell' && !tropft() &&
    w.getAttribute('data-thema') === 'hell');
  state.bewegung = 'auto';
  document.startViewTransition = echt;
  frisch();
  speichern();
});
`);
