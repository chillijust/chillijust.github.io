// Bewegung: Tropfen (0.4.0T2, ADR 0007). Nichts ploppt: Die Tagesliste fällt als
// Tropfen aus dem Tag und fließt zurück, eine Ansicht wächst aus dem, was
// getippt wurde, und schrumpft beim Zurück hinein, die Marke der Umschalter
// streckt sich hinüber, Formularteile ziehen sich auf und zu. Geprüft wird,
// daß es geschieht, daß der Zustand trotzdem sofort stimmt, daß Geister
// unsichtbar für Skripte bleiben und sich aufräumen — und daß ohne Bewegung
// nichts davon geschieht.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('bewegung', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 8, 0); };
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
// Der kopflose Läufer rechnet in virtueller Zeit und zeichnet keine Bilder —
// Animationen kämen nie an. Darum ans Ziel bringen und die Aufräumer abwarten.
function durch() { ausbewegt(); return warten(30); }
function laeuft(el) { return !!el && el.getAnimations().some(function (a) { return a.playState === 'running'; }); }
function geister() { return alle('body > .geist, #app .geist'); }
function aufbauen() {
  frisch();
  kalVersatz = 0;
  kalTag = null;
  state.gewohnheiten = [];
  for (var i = 0; i < 6; i++) {
    state.gewohnheiten.push(gewohnheitLesen({ id: 'g' + i, name: 'Gewohnheit ' + i, rhythmus: { art: 'taeglich' },
      angelegt: '2026-10-01', erledigt: [] }));
  }
  state.termine = [terminLesen({ id: 't1', titel: 'Zahnarzt', tag: '2026-10-14', von: '09:30' })];
  zeige('home');
  ausbewegt();
}
function unter(marke, knopf) {
  var m = marke.getBoundingClientRect(), k = knopf.getBoundingClientRect();
  return Math.abs(m.left - k.left) < 1.5 && Math.abs(m.width - k.width) < 1.5;
}
var bewegungEcht = bewegungAus;

pruefe('B1 die Feder ist eine gültige Kurve', CSS.supports('transition-timing-function', FEDER) &&
  getComputedStyle(document.documentElement).getPropertyValue('--feder').trim() === FEDER, FEDER.slice(0, 40));
pruefe('B2 diese Prüfung läuft mit Bewegung', !bewegungAus());

// ── T · Tagesliste: Tropfen auf, Tropfen zu ─────────────────
aufbauen();
var h0 = q('.held').offsetHeight;
q('[data-kaltag="2026-10-16"]').click();
pruefe('T1 der Tag ist sofort offen', kalTag === '2026-10-16' && !!q('#kalLeiste'));
pruefe('T2 ein Tropfen fällt in der Karte', !!q('.held > .tropfen') && laeuft(q('.held > .tropfen')));
pruefe('T3 die Karte fließt auf ihre Höhe', laeuft(q('.held')) && q('.held').style.overflow === 'hidden');
pruefe('T4 der Inhalt kommt nach dem Tropfen', laeuft(q('#kalLeiste')));
return durch().then(function () {
  pruefe('T5 danach ist der Tropfen weg', !q('.tropfen'));
  pruefe('T6 und die Karte wieder offen', !laeuft(q('.held')) && q('.held').style.overflow === '' &&
    q('.held').offsetHeight > h0);
  q('[data-kaltag="2026-10-16"]').click();
  pruefe('T7 zu ist sofort zu', kalTag === null && !q('#kalLeiste'));
  var g = q('body > .geist');
  pruefe('T8 die Liste fließt als Geist in den Tag zurück', !!g && !!g.shadowRoot.querySelector('#kalLeiste') && laeuft(g));
  pruefe('T9 Skripte sehen den Geist nicht', alle('#kalLeiste').length === 0 && alle('#chiliFigur').length === 1 &&
    alle('[data-neutermin]').length === 0);
  pruefe('T10 er nimmt nichts an', getComputedStyle(g).pointerEvents === 'none' && g.getAttribute('aria-hidden') === 'true');
  return durch();
}).then(function () {
  pruefe('T11 danach ist er weg', geister().length === 0);

  // ── A · Ansichten wachsen aus dem Getippten ───────────────
  aufbauen();
  window.scrollTo(0, 120);
  var gerollt = window.pageYOffset;
  q('#ansicht > .abschnitt [data-termin="t1"]').click();
  pruefe('A1 die Ansicht wechselt sofort', ansicht === 'termin' && q('#tmTitel').value === 'Zahnarzt');
  pruefe('A2 sie wächst aus der Zeile', laeuft(q('#ansicht')) && herkunft === '[data-termin="t1"]');
  var g = q('body > .geist');
  pruefe('A3 die alte liegt als Geist darunter', !!g && getComputedStyle(g).zIndex === '0' &&
    !!g.shadowRoot.querySelector('.held'));
  pruefe('A4 Skripte sehen nur die neue', alle('[data-termin]').length === 0 && alle('#chiliFigur').length === 0);
  return durch().then(function () {
    pruefe('A5 danach ist der Geist weg', geister().length === 0 && q('#ansicht').style.background === '' &&
      !laeuft(q('#ansicht')));
    q('#zurueckKnopf').click();
    pruefe('A6 zurück ist sofort das Dashboard', ansicht === 'home' && !!q('.held'));
    var g2 = q('body > .geist');
    pruefe('A7 die Ansicht schrumpft oben in ihre Zeile', !!g2 && getComputedStyle(g2).zIndex === '5' &&
      !!g2.shadowRoot.querySelector('#tmTitel') && laeuft(g2));
    pruefe('A8 das Dashboard steht, wo es verlassen wurde', gerollt > 0 && Math.abs(window.pageYOffset - gerollt) < 2,
      gerollt + ' / ' + window.pageYOffset);
    pruefe('A9 die Herkunft ist verbraucht', herkunft === null);
    return durch();
  });
}).then(function () {
  pruefe('A10 danach ist der Geist weg', geister().length === 0);
  menueOeffnen();
  q('[data-menue="termin"]').click();
  pruefe('A11 aus dem Menü gemerkt wird der Menüknopf', ansicht === 'terminNeu' && herkunft === '#menuKnopf');
  zeige('home');
  zeige('einstellungen');
  pruefe('A12 ohne Tipp ein sanftes Einblenden, keine Herkunft', herkunft === null && laeuft(q('#ansicht')));
  zeige('home');
  ausbewegt();
  window.scrollTo(0, 0);

  // ── W · Umschalter: die Marke fließt ─────────────────────
  pruefe('W1 jede Wahl hat eine Marke unter dem Gewählten', alle('#app .wahl').length > 0 &&
    alle('#app .wahl').every(function (w) {
      return !!w.querySelector('.wahl-marke') && unter(w.querySelector('.wahl-marke'), w.querySelector('[aria-pressed="true"]'));
    }));
  q('[data-kalender="monat"]').click();
  var m = q('.held .wahl-marke');
  pruefe('W2 Woche zu Monat: die Marke fließt', laeuft(m));
  var mitte = m.getAnimations()[0].effect.getKeyframes()[1];
  pruefe('W3 und streckt sich dabei über beide', parseFloat(mitte.width) > q('[data-kalender="monat"]').offsetWidth +
    q('[data-kalender="woche"]').offsetWidth - 2, mitte.width);
  ausbewegt();
  pruefe('W4 am Ende liegt sie unter «Monat»', unter(m, q('[data-kalender="monat"]')));
  q('[data-kalender="woche"]').click();
  ausbewegt();
  zeige('termin', 't1');
  pruefe('W5 eine neue Ansicht fließt nicht von der alten her', !laeuft(q('.tm-wdh .wahl-marke')));
  q('[data-wdh="monatlich"]').click();
  pruefe('W6 im Formular fließt sie auch', laeuft(q('.tm-wdh .wahl-marke')));
  ausbewegt();
  pruefe('W7 und landet unter «Monatlich»', unter(q('.tm-wdh .wahl-marke'), q('[data-wdh="monatlich"]')));

  // ── F · Formularteile ziehen sich auf und zu ──────────────
  ausbewegt();
  q('#tmGanz').click();
  pruefe('F1 ganztags: die Uhrzeit ist sofort weg', q('#tmZeiten').hidden && getComputedStyle(q('#tmZeiten')).display === 'none');
  var g = q('#tmZeiten').previousElementSibling;
  pruefe('F2 an ihrer Stelle zieht sich ein Geist zusammen', !!g && g.className === 'geist' && laeuft(g) &&
    !!g.shadowRoot.querySelector('#tmVon'));
  pruefe('F3 Skripte finden das Feld nur einmal', alle('#tmVon').length === 1);
  return durch();
}).then(function () {
  pruefe('F4 danach ist der Geist weg', geister().length === 0);
  q('#tmGanz').click();
  pruefe('F5 aus: die Uhrzeit ist sofort da und wächst', !q('#tmZeiten').hidden && laeuft(q('#tmZeiten')) &&
    q('#tmZeiten').style.overflow === 'hidden');
  return durch();
}).then(function () {
  pruefe('F6 danach ohne Spuren', q('#tmZeiten').style.overflow === '' && q('#tmZeiten').offsetHeight >= 44);
  q('[data-wdh="keine"]').click();
  q('[data-wdh="keine"]').click();
  pruefe('F7 zweimal dasselbe macht keinen zweiten Geist', alle('#app .geist').length <= 1);
  zeige('home');
  return durch();
}).then(function () {
  pruefe('F8 am Ende ist alles aufgeräumt', geister().length === 0 && !q('.tropfen'));

  // ── D · Tropfen: Menü, runde Knöpfe, Woche | Monat (ADR 0008) ──
  menueOeffnen();
  var bl = q('#menue .blatt'), kn = q('#menuKnopf').getBoundingClientRect();
  var erst = laeuft(bl) ? bl.getAnimations()[0].effect.getKeyframes()[0] : {};
  pruefe('D1 das Menü quillt als Tropfen aus dem Knopf', laeuft(bl) && erst.borderRadius === TROPFEN_AUF, erst.borderRadius);
  ausbewegt();
  var br = bl.getBoundingClientRect();
  pruefe('D2 es hängt unter dem Knopf, rechtsbündig', br.top >= kn.bottom && br.top - kn.bottom < 16 &&
    Math.abs(br.right - kn.right) < 1.5, br.top + ' ' + br.right + ' / ' + kn.bottom + ' ' + kn.right);
  menueSchliessen();
  pruefe('D3 zu fließt es zurück in den Knopf', laeuft(bl) && !q('#menue').classList.contains('offen') && !q('#menue').hidden);
  return durch();
}).then(function () {
  pruefe('D4 danach ist es weg', q('#menue').hidden && !laeuft(q('#menue .blatt')));
  menueOeffnen();
  ausbewegt();
  q('[data-menue="einstellungen"]').click();
  var h = q('.tropfen-huelle');
  pruefe('D5 die Einstellungen quellen als Tropfen aus dem Eintrag', ansicht === 'einstellungen' && !!h && laeuft(h) &&
    q('#ansicht').style.opacity === '0');
  pruefe('D6 das Menü ist im selben Augenblick weg', q('#menue').hidden);
  pruefe('D7 Skripte sehen nur die echte Ansicht', alle('#swKnopf').length === 1);
  return durch();
}).then(function () {
  pruefe('D8 danach ist die Hülle weg und die Ansicht sichtbar', !q('.tropfen-huelle') && q('#ansicht').style.opacity === '');
  q('#zurueckKnopf').click();
  var h = q('.tropfen-huelle'), bilder = h ? h.getAnimations()[0].effect.getKeyframes() : [], z = bilder[bilder.length - 2] || {};
  var k = q('#menuKnopf').getBoundingClientRect();
  pruefe('D9 zurück fließt die Ansicht als Tropfen in den Menüknopf', ansicht === 'home' && !!h && laeuft(h) &&
    !!h.querySelector('.geist'));
  pruefe('D10 mit dem Bauch voran, die Spitze unten links', z.borderRadius === TROPFEN_ZU, z.borderRadius);
  pruefe('D11 und landet auf dem Knopf', Math.abs(parseFloat(z.left) + parseFloat(z.width) / 2 - (k.left + k.width / 2)) < 2 &&
    Math.abs(parseFloat(z.top) + parseFloat(z.height) / 2 - (k.top + k.height / 2)) < 2);
  pruefe('D12 Kacheln bleiben Rechtecke', !tropfenQuelle(q('[data-haken]')) && !tropfenQuelle(q('[data-termin]')) &&
    tropfenQuelle(q('#menuKnopf')));
  return durch();
}).then(function () {
  pruefe('D13 danach ist die Hülle weg', !q('.tropfen-huelle') && geister().length === 0);
  aufbauen();
  q('[data-kaltag="2026-10-16"]').click();
  ausbewegt();
  q('[data-kalender="monat"]').click();
  var bild = laeuft(q('#kalRaster')) ? q('#kalRaster').getAnimations()[0].effect.getKeyframes()[0].clipPath : '';
  pruefe('D14 zum Monat: der Tag bleibt, der Monat quillt aus seiner Woche', kalTag === '2026-10-16' && !!q('#kalLeiste') &&
    /^inset\([1-9]/.test(bild), bild);
  ausbewegt();
  q('[data-kalender="woche"]').click();
  var gk = geister();
  pruefe('D15 zur Woche: der Monat zieht sich als Geist zusammen', kalTag === '2026-10-16' && !!q('#kalLeiste') &&
    gk.length === 1 && laeuft(gk[0]) && !!gk[0].shadowRoot.querySelector('#kalRaster') && alle('#kalRaster').length === 1);
  return durch();
}).then(function () {
  pruefe('D16 danach ist alles aufgeräumt', geister().length === 0 && !q('.tropfen-huelle'));
  aufbauen();

  // ── R · Ohne Bewegung geschieht nichts davon ─────────────
  bewegungAus = function () { return true; };
  q('[data-kaltag="2026-10-16"]').click();
  pruefe('R1 kein Tropfen, kein Fließen', !q('.tropfen') && !laeuft(q('.held')) && !!q('#kalLeiste'));
  q('[data-kaltag="2026-10-16"]').click();
  pruefe('R2 kein Geist beim Schließen', geister().length === 0);
  q('#ansicht > .abschnitt [data-termin="t1"]').click();
  pruefe('R3 die Ansicht steht sofort', ansicht === 'termin' && !laeuft(q('#ansicht')) && geister().length === 0);
  q('#tmGanz').click();
  pruefe('R4 Formularteile verschwinden ohne Geist', q('#tmZeiten').hidden && geister().length === 0);
  q('[data-wdh="taeglich"]').click();
  pruefe('R5 die Marke springt', !laeuft(q('.tm-wdh .wahl-marke')) && unter(q('.tm-wdh .wahl-marke'), q('[data-wdh="taeglich"]')));
  zeige('home');
  menueOeffnen();
  pruefe('R6 das Menü steht sofort, ohne Tropfen', !q('#menue').hidden && !laeuft(q('#menue .blatt')));
  q('[data-menue="einstellungen"]').click();
  pruefe('R7 auch die Ansicht daraus', ansicht === 'einstellungen' && !q('.tropfen-huelle') && q('#ansicht').style.opacity === '');
  q('#zurueckKnopf').click();
  pruefe('R8 und zurück', ansicht === 'home' && !q('.tropfen-huelle') && geister().length === 0);
  bewegungAus = bewegungEcht;
  frisch();
  speichern();
});
`);
