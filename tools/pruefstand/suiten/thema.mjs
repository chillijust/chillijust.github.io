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
// Die neue Darstellung tropft mit dem Druck aus dem Schalter, THEMA_TROPFEN
// lang (ADR 0025, 0026, 0036), und folgt dem Knauf (ADR 0037).
var sk = q('#themaKnopf').getBoundingClientRect(), tropfAn = null;
var sonne = q('#themaKnopf .hell').getBoundingClientRect(), mond = q('#themaKnopf .dunkel').getBoundingClientRect();
function spur(n) { return document.documentElement.style.getPropertyValue('--spur-' + n); }
// inset(o r u l round k) → die Fläche, die es freilässt
function ausSpur(t) {
  var z = (t.match(/-?[0-9.]+px/g) || []).map(parseFloat);
  return z.length === 5 ? { left: z[3], right: innerWidth - z[1], top: z[0], bottom: innerHeight - z[2], rund: z[4] } : null;
}
function gleich(a, b) { return !!a && Math.abs(a.left - b.left) < 1 && Math.abs(a.right - b.right) < 1 &&
  Math.abs(a.top - b.top) < 1 && Math.abs(a.bottom - b.bottom) < 1; }
themaUmschalten();
// ADR 0037: Der Knauf sprang, weil der Schalter schon vor dem Übergang auf
// «dunkel» stand — das alte Bild zeigte ihn bereits am Ziel.
pruefe('C5b im alten Bild liegt der Knauf noch auf der Sonne',
  q('#themaKnopf').getAttribute('aria-checked') === 'false' && knaufAuf() === 'sonne', knaufAuf());
pruefe('C5c der Knauf gleitet als eigene Ebene über dem Tropfen',
  q('#themaKnopf .knauf').style.viewTransitionName === 'thema-traeger' &&
  document.documentElement.classList.contains('thema-folgt'));
// Sonne und Mond liegen über dem Knauf; gehoben werden sie mit, sonst deckte er sie zu.
pruefe('C5h Sonne und Mond bleiben über ihm sichtbar', alle('#themaKnopf .seite').map(function (el) {
  return el.style.viewTransitionName; }).join(',') === 'thema-oben-0,thema-oben-1');
var s0 = ausSpur(spur(0)), s1 = ausSpur(spur(1)), s2 = ausSpur(spur(2));
pruefe('C5d der Tropfen beginnt im Knauf, rund wie er', gleich(s0, sonne) && s0.rund === 18, spur(0));
pruefe('C5e und färbt, was der Knauf überstreicht', gleich(s1, { left: sonne.left, right: mond.right,
  top: sonne.top, bottom: sonne.bottom }) && s1.rund === 18, spur(1));
// Bedeckt ist eine Ecke, wenn sie nicht weiter als «rund» vom Kern (der Fläche
// ohne die Rundung) liegt.
function deckt(f, x, y) {
  var dx = Math.max(f.left + f.rund - x, 0, x - (f.right - f.rund));
  var dy = Math.max(f.top + f.rund - y, 0, y - (f.bottom - f.rund));
  return Math.sqrt(dx * dx + dy * dy) <= f.rund;
}
pruefe('C5f dann läuft er über den ganzen Bildschirm aus, rund', !!s2 && deckt(s2, 0, 0) &&
  deckt(s2, innerWidth, 0) && deckt(s2, 0, innerHeight) && deckt(s2, innerWidth, innerHeight) &&
  Math.abs((s2.rund - 18) - (s1.left - s2.left)) < 0.2, spur(2));
pruefe('C0a der Tropfen beginnt mit dem Druck, nicht danach',
  document.documentElement.classList.contains('thema-tropft') &&
  document.documentElement.style.getPropertyValue('--thema-dauer') === THEMA_TROPFEN + 'ms' && THEMA_TROPFEN >= 1200,
  document.documentElement.style.getPropertyValue('--thema-dauer'));
// ADR 0027: In der Scheibe steigt der Kontrast langsam — die neue Darstellung
// blendet von durchsichtig auf voll, während sie wächst.
var tropfen = regelWerte(function (r) { return r.name === 'thema-tropfen' ? r : null; });
var bildA = tropfen && tropfen.cssRules[0].style, bildZ = tropfen && tropfen.cssRules[tropfen.cssRules.length - 1].style;
pruefe('C0b der Kontrast steigt mit dem Tropfen, nicht schlagartig', !!tropfen &&
  bildA.opacity === '0' && bildZ.opacity === '1' && /circle/.test(bildA.clipPath) && /circle/.test(bildZ.clipPath),
  tropfen ? bildA.opacity + ' ' + bildZ.opacity : 'keine Regel');
// Folgt er einem Träger, gleitet der im ersten Drittel, dann läuft es aus.
var spurRegel = regelWerte(function (r) { return r.name === 'thema-spur' ? r : null; });
var spurBilder = spurRegel ? Array.prototype.map.call(spurRegel.cssRules, function (r) { return r.keyText + ' ' + r.style.opacity; }) : [];
pruefe('C0c mit Träger: erst die Spur, dann aus, der Kontrast steigt', spurBilder.join(',') ===
  '0% 0,33.333% 0.5,100% 1', spurBilder.join(','));
return warte(340).then(function () {
  tropfAn = { klasse: document.documentElement.classList.contains('thema-tropft'),
    x: parseFloat(document.documentElement.style.getPropertyValue('--thema-x')),
    y: parseFloat(document.documentElement.style.getPropertyValue('--thema-y')) };
  // «Danach» heißt: nach der Uhr, die spätestens aufräumt (THEMA_TROPFEN + 400).
  // Fest gewartet, war es nach ADR 0037 zu kurz — lokal fiel die Klasse über
  // den 400-ms-Notweg früher, auf GitHub läuft der Übergang an und nur die Uhr
  // nimmt sie weg.
  return warte(THEMA_TROPFEN + 500 - 340);
}).then(function () {
  pruefe('C0 sie tropft aus dem Schalter und ist danach fertig', !!document.startViewTransition && tropfAn.klasse &&
    Math.abs(tropfAn.x - (sk.left + sk.width / 2)) < 2 && Math.abs(tropfAn.y - (sk.top + sk.height / 2)) < 2 &&
    !document.documentElement.classList.contains('thema-tropft'), JSON.stringify(tropfAn));
  pruefe('C1 ein Tipp schaltet dunkel', state.thema === 'dunkel');
  pruefe('C2 <html> trägt es', document.documentElement.getAttribute('data-thema') === 'dunkel');
  pruefe('C3 der Grund wird dunkel', grund() === 'rgb(20, 20, 19)', grund());
  pruefe('C4 die Statusleiste folgt', meta() === '#141413', meta());
  pruefe('C5 der Schalter steht auf «dunkel»', q('#themaKnopf').getAttribute('aria-checked') === 'true');
  pruefe('C5g danach trägt der Knauf keinen Namen mehr', !q('#themaKnopf .knauf').style.viewTransitionName &&
    !document.documentElement.classList.contains('thema-folgt'));
  ausbewegt();
  pruefe('C5a der Knauf liegt auf dem Mond', knaufAuf() === 'mond', knaufAuf());
  pruefe('C6 die Wahl ist gemerkt', gespeichert() === 'dunkel', gespeichert());
  pruefe('C7 und übersteht das Laden', laden().thema === 'dunkel');
  pruefe('C8 der Akzent bleibt die Chili', token('--akzent') === '#D97757', token('--akzent'));
  pruefe('C9 «erledigt» ist im Dunkeln aufgehellt', token('--erledigt') !== '#788C5D' && token('--erledigt') !== '');
  themaUmschalten();
  return warte(THEMA_TROPFEN + 500);
}).then(function () {
  pruefe('C10 der zweite Tipp schaltet hell — fest, nicht zurück auf auto', state.thema === 'hell');
  pruefe('C11 <html> trägt «hell»', document.documentElement.getAttribute('data-thema') === 'hell');
  pruefe('C12 der Grund ist wieder Elfenbein', grund() === 'rgb(250, 249, 245)', grund());
  ausbewegt();
  pruefe('C13 der Knauf ist zurück auf der Sonne', knaufAuf() === 'sonne', knaufAuf());

  // Ein Übergang, der anläuft, aber sein Ende nie meldet (App im Hintergrund,
  // kein Bild gezeichnet): Die Klasse darf nicht hängen bleiben, sonst ruhen
  // alle Übergänge der App für immer (ADR 0030).
  var echt = document.startViewTransition;
  document.startViewTransition = function (f) {
    f();
    return { finished: new Promise(function () {}), skipTransition: function () {} };
  };
  themaUmschalten();
  var haengt = document.documentElement.classList.contains('thema-tropft');
  return warte(THEMA_TROPFEN + 500).then(function () {
    document.startViewTransition = echt;
    pruefe('C14 meldet der Übergang sein Ende nie, löst sich die Klasse trotzdem', haengt &&
      !document.documentElement.classList.contains('thema-tropft'));
    themaUmschalten();
    return warte(THEMA_TROPFEN + 500);
  });
}).then(function () {

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
  pruefe('D4a was nichts sichtbar ändert, tropft nicht', !document.documentElement.classList.contains('thema-tropft'));
  // Auch aus den Einstellungen tropft die neue Darstellung aus dem Knopf (ADR 0036).
  var dk = q('.wahl [data-thema="dunkel"]'), dr = dk.getBoundingClientRect();
  var ak = q('.wahl [data-thema="auto"]').getBoundingClientRect();
  dk.click();
  pruefe('D4b «Dunkel» tropft aus seinem Knopf', document.documentElement.classList.contains('thema-tropft') &&
    Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--thema-x')) - (dr.left + dr.width / 2)) < 2 &&
    Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--thema-y')) - (dr.top + dr.height / 2)) < 2);
  // ADR 0037: Die Markierung gleitet von «Automatisch» zu «Dunkel», der Tropfen folgt ihr.
  var d0 = ausSpur(spur(0)), d1 = ausSpur(spur(1));
  pruefe('D4c der Tropfen folgt der Markierung', q('.wahl .wahl-marke').style.viewTransitionName === 'thema-traeger' &&
    alle('.wahl button').map(function (el) { return el.style.viewTransitionName; }).join(',') ===
      'thema-oben-0,thema-oben-1,thema-oben-2' && gleich(d0, ak) && gleich(d1, { left: ak.left, right: dr.right, top: dr.top, bottom: dr.bottom }) && d0.rund === 12,
    spur(0) + ' ' + spur(1));
  return warte(THEMA_TROPFEN + 500);
}).then(function () {
  pruefe('D4d die Markierung gleitet nicht doppelt und trägt danach keinen Namen',
    q('.wahl .wahl-marke').getAnimations().length === 0 && !q('.wahl .wahl-marke').style.viewTransitionName &&
    alle('.wahl button').every(function (el) { return !el.style.viewTransitionName; }));
  pruefe('D5 «Dunkel» wirkt', grund() === 'rgb(20, 20, 19)' &&
    q('.wahl [aria-pressed="true"]').getAttribute('data-thema') === 'dunkel' &&
    !document.documentElement.classList.contains('thema-tropft'));

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
