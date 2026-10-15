// Flüssig (ADR 0054, 0062): Jede Stelle fließt wie in iOS 26 (fest, als Pfad
// gerechnet). Den Reiter «Flüssig» mit Proben und Schaltern gibt es seit
// 0.19.0 nicht mehr; ein gemerkter Stand von dort fällt beim Laden weg. Drang
// und Timer zeigen Flüssigkeit mit Chili; die Chili wandert in den Timer.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('fluessig', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function aufbauen() {
  frisch();
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [] })];
  flDauernSetzen();
  zeige('home');
}
function umlauf(pts) {
  var s = 0;
  for (var i = 0; i < pts.length; i++) { var p = pts[i], n = pts[(i + 1) % pts.length]; s += p[0] * n[1] - n[0] * p[1]; }
  return s;
}
// Die vier Endpunkte eines Halses: M p C h h p L p C h h p Z.
function halsEcken(d) {
  var z = d.match(/-?[0-9.]+/g).map(Number);
  return [[z[0], z[1]], [z[6], z[7]], [z[8], z[9]], [z[14], z[15]]];
}

// ── A · Kein Reiter, keine Schalter ─────────────────────────
aufbauen();
zeige('einstellungen');
pruefe('A1 die Einstellungen sind eine Seite: kein Reiter, keine Probe, keine Messung',
  !q('#app [data-es-reiter]') && !q('#app #fluessigProbe') && !q('#app [data-fp-buehne]') && !q('#app #rkKnopf') &&
  !!q('#app [data-thema]') && !!q('#app #esBewegung'));
pruefe('A2 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);
zeige('home');
pruefe('A3 die Dauern kommen aus der Feder von iOS 26', TROPFEN_DAUER === fluessigTakt('ansichten').dauer &&
  MENUE_DAUER === Math.round(fluessigTakt('menue').dauer * 0.8125) && HINWEIS_DAUER === Math.round(fluessigTakt('ansichten').dauer * 0.4) &&
  MELDE_ZU === fluessigTakt('ansichten').dauer && TROPFEN_KURVE === fluessigTakt('zeilen', true).kurve);
pruefe('A4 Knauf und Haken federn', document.documentElement.style.getPropertyValue('--fl-schalter-kurve').indexOf('linear(') === 0 &&
  document.documentElement.style.getPropertyValue('--fl-haken-kurve').indexOf('linear(') === 0);

// ── L · Laden ───────────────────────────────────────────────
var gl = stand({ fluessig: { ios: { menue: true } }, schwachHinweis: false });
pruefe('L1 was der Reiter gemerkt hat, fällt weg; der Rest liest sich', !('fluessig' in gl) && gl.schwachHinweis === false);
pruefe('L2 der neue Stand kennt kein «fluessig»', !('fluessig' in grundStand()) && !('fluessig' in state));
pruefe('L3 nicht im Sicherungscode', !('fluessig' in codeLesen(sicherungsCode(zeitJetzt()))));

// ── H · Hals und Umriß ──────────────────────────────────────
var k = { x: 0, y: 0, r: 20 };
pruefe('H1 nahe Kreise hängen über einen Hals', fpHalsPfad(k, { x: 50, y: 0, r: 15 }, 80) !== '');
pruefe('H2 jenseits der Weite ist er gerissen', fpHalsPfad(k, { x: 90, y: 0, r: 15 }, 80) === '');
pruefe('H3 liegt ein Kreis im anderen, ist er aufgegangen', fpHalsPfad(k, { x: 3, y: 0, r: 10 }, 80) === '');
pruefe('H4 Formen laufen im Uhrzeigersinn, auch gedehnt', umlauf(fpPunkte({ x: 0, y: 0, w: 100, h: 40, r: 12 })) > 0 &&
  umlauf(fpPunkte({ x: 0, y: 0, w: 30, h: 30, r: 15, deh: { a: 1, e: 1.3 } })) > 0);
pruefe('H5 Hälse auch, in jeder Richtung — sonst stanzt die Überlappung ein Loch', [[50, 0], [-50, 0], [0, 50], [30, -40]].every(function (p) {
  return umlauf(halsEcken(fpHalsPfad(k, { x: p[0], y: p[1], r: 15 }, 80))) > 0;
}));

// ── F · Feder ───────────────────────────────────────────────
function spitze(feder) {
  var f = fpFeder(0), max = 0;
  f.ziel = 1;
  for (var i = 0; i < 300; i++) { fpSchwingen(f, 0.01, { tempo: 0.5, feder: feder }); max = Math.max(max, f.x); }
  return { max: max, x: f.x };
}
pruefe('F1 ohne Nachfedern kommt sie ohne Überschwingen an', spitze(0).max <= 1.0005 && Math.abs(spitze(0).x - 1) < 0.01);
pruefe('F2 mit Nachfedern schwingt sie über', spitze(0.7).max > 1.05);
function punkte(kurve) { return kurve.slice(7, -1).split(',').map(Number); }
var tk = fluessigTakt('menue'), tz = fluessigTakt('menue', true);
pruefe('F3 die iOS-Kurve schwingt über', tk.kurve.indexOf('linear(') === 0 && Math.max.apply(null, punkte(tk.kurve)) > 1);
pruefe('F4 in einen Knopf hinein schwingt nichts über', punkte(tz.kurve).every(function (x, i, a) { return x <= 1 && (!i || x >= a[i - 1]); }));

// ── I · Was fließt ──────────────────────────────────────────
aufbauen();
menueOeffnen();
var blatt = q('#menue .blatt');
pruefe('I1 das Blatt selbst fließt, ohne eigene Bilder darunter', !!blatt._fluss && !blatt.getAnimations().length &&
  !!q('#menue .fl-schicht') && blatt.style.background === 'transparent' && /path\(|inset\(/.test(blatt.style.clipPath) &&
  !alle('#menueListe .menue-eintrag').some(function (z) { return z.getAnimations().length; }));
menueSchliessen(true);
pruefe('I1b sofort zu räumt alles ab', !blatt._fluss && !q('#menue .fl-schicht') && !blatt.style.background && !blatt.style.clipPath &&
  !q('#menueListe').style.opacity);
var vorher = alle('body > .tropfen-huelle');
tropfenAuf(q('#ansicht'), punktFlaeche(320, 60));
var h = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0];
pruefe('I2 eine Ansicht fließt selbst, mit Schicht darunter', !!h && !!h._fluss && !h.getAnimations().length &&
  !!h.previousElementSibling && h.previousElementSibling.classList.contains('fl-schicht') && h.style.background === 'transparent');
// Weit gerollt: Die Seite reicht 800 px über den Rand. Gemalt wird nur, was zu
// sehen ist — eine Hülle von Bildschirmhöhen blieb am Gerät aus.
var lang = { left: 0, top: -800, width: innerWidth, height: 2000, right: innerWidth, bottom: 1200 }, gg = geist(q('#ansicht'));
vorher = alle('body > .tropfen-huelle');
tropfenZu(gg, lang, q('#menuKnopf'));
h = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0];
pruefe('I2b eine weit gerollte Ansicht fließt nur, soweit sie zu sehen ist', !!h && parseFloat(h.style.top) === 0 &&
  parseFloat(h.style.height) <= innerHeight && gg.style.top === '-800px');
ausbewegt();
q('[data-kalender="monat"]').click();
var marke = q('.held .wahl-marke');
pruefe('I3 die Wahl-Marke fließt und läßt einen Rest mit Hals', marke.getAnimations()[0].effect.getTiming().easing.indexOf('linear(') === 0 &&
  !!q('.held .wahl .fl-schicht'));
ausbewegt();
q('[data-kalender="woche"]').click();
ausbewegt();
q('#app [data-haken="A"]').click();
pruefe('I4 abgehakt fließt ein Tropfen in den Tagesring', !!q('body > .fl-perle'));
ausbewegt();

// ── W · Drang und Timer: Flüssigkeit mit Chili ──────────────
aufbauen();
var nun = zeitJetzt();
state.abgewoehnen = [lasterLesen({ id: 'w1', name: 'Zucker', start: nun - 86400000, rueckfaelle: [], draenge: [] })];
welleBeginnen('w1');
zeige('home');
drangOeffnen('w1');
var fl = q('#drangKarte .fl-welle'), licht = fl && fl.querySelector('.fw-licht');
pruefe('W1 im Drang steht Flüssigkeit unter der Chili', !!fl && fl.nextElementSibling === q('#chiliFigur') &&
  /^M/.test(fl.querySelector('svg .fw-fluss').getAttribute('d') || ''));
// Sie wird alle 50 ms neu gezeichnet, Minuten lang: ein SVG, kein Filter, keine
// Maske (Nachricht 15, Timer).
pruefe('W1b Saum, Kern und Lichtkante als Strich, am Umriß abgeschnitten, ohne Filter', !!licht &&
  !!fl.querySelector('.fw-kern') && /^M/.test(licht.getAttribute('d') || '') && !fl.querySelector('filter') &&
  /url\(#fwC-/.test(licht.getAttribute('clip-path') || '') && licht.style.opacity === String(FP_IOS.kante));
pruefe('W2 der Ring ist ein Drittel so dick wie zuvor', Math.abs(parseFloat(getComputedStyle(q('#drangKarte .ring circle')).strokeWidth) - 0.73) < 0.01);
drangSchliessen(true);
pruefe('W1d zu zeichnet die Welle nicht weiter: sie ist fort', !q('#drangKarte .fl-welle'));
state.welle = null;
zeige('home');

var blattFluss = null, stillstand = null, zuGeist = null, zuHuelle = null;
return Promise.resolve().then(function () {
  // ── M · Das Menü in Bewegung ──────────────────────────────
  aufbauen();
  menueOeffnen();
  blattFluss = blatt._fluss;
  return warten(120);
}).then(function () {
  menueSchliessen();
  pruefe('M1 wer mitten im Weg schließt, kehrt mit derselben Feder um', !!blatt._fluss && blatt._fluss === blattFluss &&
    blattFluss.p.ziel === 0 && blattFluss.p.x > 0);
  return warten(90);
}).then(function () {
  var li = q('#menueListe'), sk = /scale\(([\d.]+)\)/.exec(li.style.transform), mc = getComputedStyle(q('#menue'));
  pruefe('R1 zurück blendet nur der Schleier aus, das Blatt bleibt deckend, bis es im Knopf ist',
    mc.opacity === '1' && mc.transitionProperty.indexOf('background-color') >= 0);
  pruefe('R2 der Tropfen nimmt die Einträge mit, verkleinert und noch zu sehen', !!sk && +sk[1] < 1 && +li.style.opacity > 0);
  return warten(1500);
}).then(function () {
  pruefe('M2 zurückgeflossen ist das Menü zu und aufgeräumt', q('#menue').hidden && !blatt._fluss && !q('#menue .fl-schicht') &&
    !blatt.style.clipPath && !blatt.style.background && !q('#menueListe').style.transform);
  menueOeffnen();
  return warten(1500);
}).then(function () {
  pruefe('M3 aufgeflossen steht das Blatt als es selbst', !q('#menue').hidden && !blatt._fluss && !q('#menue .fl-schicht') &&
    !blatt.style.clipPath && !blatt.style.boxShadow && !q('#menueListe').style.opacity);
  menueSchliessen(true);
  // Eine Ansicht fließt zurück in ihren Knopf und nimmt ihren Inhalt mit.
  zuGeist = geist(q('#ansicht'));
  tropfenZu(zuGeist, q('#ansicht').getBoundingClientRect(), q('#menuKnopf'));
  return warten(90);
}).then(function () {
  var sk = /scale\(([\d.]+)\)/.exec(zuGeist.style.transform), zh = zuHuelle = zuGeist.parentNode;
  pruefe('R3 eine Ansicht fließt zurück und nimmt ihren Inhalt mit in den Knopf', !!zh && !!zh._fluss && zh._fluss.p.ziel === 0 &&
    !!sk && +sk[1] < 1 && +zuGeist.style.opacity > 0);
  return warten(1500);
}).then(function () {
  pruefe('R4 angekommen ist die Hülle fort, mit ihrer Schicht', !zuGeist.isConnected && !zuHuelle.isConnected && !zuHuelle._fluss &&
    !q('body > .fl-schicht'));
  // Hinweis aus Glas: Der Tropfen ist das Glas, die Schicht malt nur Hals
  // und Schatten.
  vorher = alle('body > .tropfen-huelle');
  tropfenAuf(q('#hinweisKarte'), punktFlaeche(320, 600), { rund: '18px', glas: true });
  h = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0];
  return warten(80);
}).then(function () {
  var sch = h && h.previousElementSibling, loch = sch ? sch.style.clipPath : '';
  pruefe('M4 der Hinweis fließt als Glas, die Schicht spart den Tropfen aus', !!h && !!h._fluss && h.classList.contains('glas') &&
    !h.getAnimations().length && h.style.background !== 'transparent' && (loch.match(/M/g) || []).length >= 2);
  ausbewegt();
  q('[data-kalender="monat"]').click();
  return warten(60);
}).then(function () {
  var sch = q('.held .wahl .fl-schicht .fp-schatten'), d = sch ? sch.getAttribute('d') || '' : '';
  pruefe('M5 unter der Marke liegt kein zweites Bild: nur Rest und Hals', !!sch && (d.match(/M/g) || []).length <= 2);
  ausbewegt();
  zeige('einstellungen');
  q('#esHinweis').click();
  var k = q('#esHinweis .schalter-knauf');
  pruefe('M6 der Knauf fließt hinüber, mit Rest und Hals', !!k && k.getAnimations().length === 1 &&
    k.getAnimations()[0].effect.getTiming().easing.indexOf('linear(') === 0 && !!q('#esHinweis .fl-schicht') &&
    getComputedStyle(k).transitionProperty.indexOf('transform') < 0);
  ausbewegt();
  // Am Gerät hat der Finger den Knauf gestreckt; kommt der Tipp an, wird er
  // beim Loslassen noch schmaler — ein Übergang aus CSS, der das Fließen
  // nicht aufhalten darf. Hier startet kein Übergang ohne Bilder, also steht
  // einer da, wie ihn Safari meldet.
  k = q('#esHinweis .schalter-knauf');
  k.getAnimations = function () { return [Object.create(CSSTransition.prototype)]; };
  q('#esHinweis').click();
  delete k.getAnimations;
  pruefe('M7 auch wenn der Knauf vom Drücken noch schmaler wird, fließt er', k === q('#esHinweis .schalter-knauf') &&
    eigeneBewegung(k) && !eigeneBewegung({ getAnimations: function () { return [Object.create(CSSTransition.prototype)]; } }));
  ausbewegt();
  zeige('home');
  // ── D · Dunkel: Kontrast, Saum, Lichtkante ──────────────────
  aufbauen();
  // Gefragt ist die Zielfarbe, nicht der Übergang dorthin.
  stillstand = document.createElement('style');
  stillstand.textContent = '*, *::before, *::after { transition: none !important; }';
  document.head.appendChild(stillstand);
  state.thema = 'dunkel';
  themaAnwenden();
  function hell(c) { var f = flRgb(c); return f ? 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2] : 0; }
  var seite = hell(getComputedStyle(document.body).backgroundColor);
  pruefe('D1 in Dunkel ist das Menü heller als der Grund', hell(getComputedStyle(q('#menue .blatt')).backgroundColor) > seite + 15);
  pruefe('D2 der Menüknopf hebt sich ab, mit hellem Rand', hell(getComputedStyle(q('#menuKnopf')).backgroundColor) > seite + 10 &&
    getComputedStyle(q('#menuKnopf')).boxShadow.indexOf('inset') >= 0);
  pruefe('D3 die Marke einer Wahl ist heller als ihre Bahn',
    hell(getComputedStyle(q('.held .wahl-marke')).backgroundColor) > hell(getComputedStyle(q('.held .wahl')).backgroundColor) + 10);
  // Ab hier zählen die echten Übergänge wieder: W3 und T2 fragen nach ihnen.
  weg(stillstand);
  var probe = document.createElement('div');
  document.body.appendChild(probe);
  var pb = fpSchichten(probe, 'pruef', true);
  pruefe('D4 die Lichtkante stanzt mit voller Deckkraft aus, sonst bliebe ein grauer Schleier',
    !!probe.querySelector('filter[id="fpL-pruef"] feComponentTransfer feFuncA[type="linear"]') && !!pb.kern);
  weg(probe);
  pruefe('D5 Farben lesen und mischen', flMischen([255, 255, 255, 1], flRgb('#141413'), 0) === 'rgba(20, 20, 19, 1)' &&
    flMischen([255, 255, 255, 1], [0, 0, 0, 1], 1) === 'rgba(255, 255, 255, 1)' && flRgb('rgba(1, 2, 3, .5)')[3] === 0.5);
  menueOeffnen();
  var mf = q('#menue .blatt')._fluss;
  pruefe('D6 im Fließen trägt das Flüssige einen hellen Saum und hebt sich', !!mf &&
    hell(mf.b.fluss.style.background) > hell(mf.b.kern.style.background) + 20 &&
    hell(mf.b.kern.style.background) > hell(getComputedStyle(document.documentElement).getPropertyValue('--erhoben')));
  letzterTipp = { el: q('#menueListe [data-menue="journal"]'), zeit: Date.now() };
  var u = uebergangVorbereiten('home', 'journal'), kr = q('#menuKnopf').getBoundingClientRect();
  pruefe('Q1 aus dem Menü quillt eine Ansicht aus dem Menüknopf, nicht aus dem, was unter dem Eintrag liegt',
    !!u && !!u.quelle && Math.abs(u.quelle.left - kr.left) < 1 && Math.abs(u.quelle.top - kr.top) < 1);
  menueSchliessen(true);
  q('[data-kalender="monat"]').click();
  pruefe('W3 nach dem Neuzeichnen trägt kein Knopf eine zweite Marke',
    getComputedStyle(q('.held [data-kalender="monat"]')).backgroundColor === 'rgba(0, 0, 0, 0)');
  ausbewegt();
  q('[data-kalender="woche"]').click();
  ausbewegt();
  alle('#kalRaster [data-kaltag]')[1].click();
  return warten(900);
}).then(function () {
  ausbewegt();
  alle('#kalRaster [data-kaltag]')[4].click();
  var n = q('#kalRaster .kal-tag.gewaehlt');
  pruefe('T1 die Tagesliste wechselt nur den Inhalt, ohne neuen Tropfen', !q('.held .tropfen') && !!q('#kalLeiste'));
  pruefe('T2 ein Ring gleitet, der Zielring wartet, ohne auszublenden', !!q('body > .fl-tagring') && !!n &&
    n.classList.contains('gleitet') && getComputedStyle(n).transitionDuration.split(',').every(function (d) { return parseFloat(d) === 0; }));
  return warten(900);
}).then(function () {
  ausbewegt();
  q('#app [data-kaltag].gewaehlt').click();
  state.gewohnheiten.push(gewohnheitLesen({ id: 'Z', name: 'Wasser', rhythmus: { art: 'taeglich' },
    angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [], zaehler: { schritt: 1 } }));
  zeige('home');
  return warten(900);
}).then(function () {
  ausbewegt();
  var vor = alle('body > .fl-perle').length;
  q('#app [data-haken="Z"]').click();
  pruefe('Z1 auch ein Zähler schickt einen Tropfen in den Tagesring', alle('body > .fl-perle').length > vor);
  state.thema = 'auto';
  themaAnwenden();
  weg(stillstand);
});
`);
