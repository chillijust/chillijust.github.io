// Flüssig (ADR 0054): Standard ist die Chilli-Bewegung von 0.15.0. Im Reiter
// «Flüssig» der Einstellungen schaltet man je Stelle auf iOS-Flüssig (fest
// iOS 26, als Pfad gerechnet); geschaltet wird ein Entwurf, die App folgt erst
// nach «Speichern», wer ungespeichert geht, wird im Glas gefragt. Drang und
// Timer zeigen immer Flüssigkeit mit Chili; die Chili wandert in den Timer.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('fluessig', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function aufbauen() {
  frisch();
  esReiter = 'allgemein';
  flEntwurf = null;
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [] })];
  flDauernSetzen();
  zeige('home');
}
function labor() { zeige('einstellungen'); q('#app [data-es-reiter="fluessig"]').click(); }
function buehne(id) { return q('#app [data-fp-buehne="' + id + '"]'); }
function tipp(id, was) { buehne(id).querySelector('[data-fp-tipp="' + was + '"]').click(); }
function schalter(id) { return q('#app [data-fp-schalter="' + id + '"]'); }
function gemerkt() { try { return JSON.parse(localStorage.getItem(SPEICHER)).fluessig; } catch (e) { return null; } }
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
var RUHE = fpRuhe(FP_IOS) + 300;
var IDS = FP_STELLEN.map(function (s) { return s[0]; });

// ── A · Aufbau ──────────────────────────────────────────────
aufbauen();
pruefe('A1 das Dashboard trägt keine Probe', !q('#app #fluessigProbe') && !q('#app [data-fp-buehne]'));
labor();
pruefe('A2 der Reiter «Flüssig» zeigt neun Stellen, je mit Probe und Schalter, alle auf Chilli', IDS.length === 9 &&
  alle('#fluessigProbe .fp-karte').length === 9 && IDS.every(function (id) {
    return !!buehne(id) && schalter(id).getAttribute('aria-checked') === 'false';
  }));
pruefe('A3 keine Regler, keine Technik-Wahl, kein Kopieren', !q('#fluessigProbe input') && !q('#fluessigProbe .wahl') &&
  !q('#fpKopieren'));
pruefe('A3b jede Stelle sagt, was sie tut, wie die Probe läuft und wie man es in der App testet', alle('#fluessigProbe .fp-karte').every(function (k) {
  var wie = k.querySelectorAll('.fp-wie');
  return wie.length === 2 && wie[0].textContent.indexOf('Probe:') === 0 && wie[1].textContent.indexOf('So testest du es:') === 0 &&
    wie[1].textContent.indexOf('Speichern') > 0 && k.querySelector('.fp-text').textContent.length > 60;
}));
pruefe('A4 «Speichern» ist fort, solange nichts geändert ist', q('#flLeiste').hidden === true);
pruefe('A5 jede Probe rechnet als Pfad', IDS.every(function (id) {
  var f = buehne(id).querySelector('.fp-fluss');
  return !!f && /path\(/.test(f.style.clipPath || f.style.webkitClipPath) && !buehne(id).querySelector('filter[id^="fpG"]');
}));
pruefe('A6 alles Tippbare ist groß genug', alle('#fluessigProbe button').filter(function (b) {
  return getComputedStyle(b).visibility !== 'hidden' && !b.closest('[hidden]');
}).every(function (b) { var r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }));
pruefe('A7 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);

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

// ── C · Standard: die Chilli-Bewegung von 0.15.0 ────────────
aufbauen();
pruefe('C1 die Dauern sind die abgenommenen', TROPFEN_DAUER === 416 && MENUE_DAUER === 338 && HINWEIS_DAUER === 166 &&
  MELDE_ZU === 416 && TROPFEN_KURVE === TROPFEN_KURVE_FEST);
pruefe('C2 keine Feder an Knauf und Haken', !document.documentElement.style.getPropertyValue('--fl-schalter-kurve') &&
  !document.documentElement.style.getPropertyValue('--fl-haken-kurve'));
menueOeffnen();
var blatt = q('#menue .blatt'), ba = blatt.getAnimations()[0];
pruefe('C3 das Menü läuft auf der festen Kurve, ohne Hals', !!ba && ba.effect.getTiming().easing === 'cubic-bezier(0.45, 0, 0.2, 1)' &&
  !q('#menue .fl-schicht') && !blatt.classList.contains('fl-kante'));
menueSchliessen(true);
var vorher = alle('body > .tropfen-huelle');
tropfenAuf(q('#ansicht'), punktFlaeche(320, 60));
var h = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0];
pruefe('C4 eine Ansicht quillt wie in 0.15.0', !!h && h.getAnimations()[0].effect.getTiming().duration === 416 &&
  h.getAnimations()[0].effect.getTiming().easing === 'cubic-bezier(0.3, 0, 0.25, 1)' && !q('.fl-schicht'));
ausbewegt();
q('[data-kalender="monat"]').click();
var ma = q('.held .wahl-marke').getAnimations()[0];
pruefe('C5 die Wahl-Marke streckt sich über beide, ohne Rest', !!ma && ma.effect.getTiming().duration === 580 &&
  !q('.held .wahl .fl-schicht'));
ausbewegt();
q('[data-kalender="woche"]').click();
ausbewegt();
q('#app [data-haken="A"]').click();
pruefe('C6 abgehakt fließt kein Tropfen', !q('.fl-perle'));
q('#app [data-haken="A"]').click();

// ── E · Entwurf, Speichern, Rückfrage ───────────────────────
labor();
schalter('menue').click();
pruefe('E1 ein Schalter ändert nur den Entwurf', schalter('menue').getAttribute('aria-checked') === 'true' &&
  !!flEntwurf && flEntwurf.menue === true && !flIos('menue') && state.fluessig === null);
pruefe('E2 dann steht «Speichern» oben und klebt beim Rollen', q('#flLeiste').hidden === false &&
  q('#fluessigProbe').firstElementChild === q('#flLeiste') && getComputedStyle(q('#flLeiste')).position === 'sticky');
schalter('menue').click();
pruefe('E3 zurückgeschaltet ist nichts mehr ungespeichert', !flUngespeichert() && q('#flLeiste').hidden === true);
schalter('menue').click();
zeige('home');
pruefe('E4 wer ungespeichert geht, wird im Glas gefragt und bleibt', ansicht === 'einstellungen' && !!hinweisFrage &&
  q('#hinweisOk').textContent === 'Verwerfen');
q('#hinweisOk').click();
pruefe('E5 «Verwerfen» verwirft und geht', ansicht === 'home' && flEntwurf === null && !flIos('menue') && state.fluessig === null);
ausbewegt();
labor();
pruefe('E6 der Reiter zeigt wieder das Gespeicherte', schalter('menue').getAttribute('aria-checked') === 'false');
['ansichten', 'menue', 'schalter', 'haken', 'tag'].forEach(function (id) { schalter(id).click(); });
q('#flSpeichern').click();
pruefe('E7 «Speichern» merkt die Stellen und die App folgt', flIos('ansichten') && flIos('menue') && flIos('haken') &&
  !flIos('hinweis') && gemerkt().ios.menue === true && !('hinweis' in gemerkt().ios) && flEntwurf === null &&
  q('#flLeiste').hidden === true && TROPFEN_DAUER === fluessigTakt('ansichten').dauer &&
  MENUE_DAUER === Math.round(fluessigTakt('menue').dauer * 0.8125) && HINWEIS_DAUER === 166);
zeige('home');
pruefe('E8 gespeichert geht man ohne Frage', ansicht === 'home');

// ── I · Was auf iOS steht, fließt ───────────────────────────
menueOeffnen();
blatt = q('#menue .blatt');
pruefe('I1 das Blatt selbst fließt, ohne die Chilli-Bilder darunter', !!blatt._fluss && !blatt.getAnimations().length &&
  !!q('#menue .fl-schicht') && blatt.style.background === 'transparent' && /path\(|inset\(/.test(blatt.style.clipPath) &&
  !alle('#menueListe .menue-eintrag').some(function (z) { return z.getAnimations().length; }));
menueSchliessen(true);
pruefe('I1b sofort zu räumt alles ab', !blatt._fluss && !q('#menue .fl-schicht') && !blatt.style.background && !blatt.style.clipPath &&
  !q('#menueListe').style.opacity);
vorher = alle('body > .tropfen-huelle');
tropfenAuf(q('#ansicht'), punktFlaeche(320, 60));
h = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0];
pruefe('I2 eine Ansicht fließt selbst, ohne Chilli-Hülle, mit Schicht darunter', !!h && !!h._fluss && !h.getAnimations().length &&
  !!h.previousElementSibling && h.previousElementSibling.classList.contains('fl-schicht') && h.style.background === 'transparent');
ausbewegt();
q('[data-kalender="monat"]').click();
var marke = q('.held .wahl-marke');
pruefe('I3 die Wahl-Marke fließt und läßt einen Rest mit Hals', marke.getAnimations()[0].effect.getTiming().easing.indexOf('linear(') === 0 &&
  !!q('.held .wahl .fl-schicht'));
ausbewegt();
q('[data-kalender="woche"]').click();
ausbewegt();
q('#app [data-haken="A"]').click();
pruefe('I4 abgehakt fließt ein Tropfen in den Tagesring', !!q('body > .fl-perle') &&
  document.documentElement.style.getPropertyValue('--fl-haken-kurve').indexOf('linear(') === 0);
ausbewegt();

// ── L · Laden ───────────────────────────────────────────────
pruefe('L1 was 0.17 gemerkt hat, fällt weg: alles auf Chilli', stand({ fluessig: { eigen: true, technik: 'pfad', werte: { tempo: 1 } } }).fluessig === null);
var s = stand({ fluessig: { ios: { menue: true, perle: 'ja', fremd: true, welle: false } } });
pruefe('L2 nur bekannte Stellen mit «true»', JSON.stringify(s.fluessig) === JSON.stringify({ ios: { menue: true } }));
pruefe('L3 nicht im Sicherungscode', !('fluessig' in codeLesen(sicherungsCode(zeitJetzt()))));

// ── W · Drang und Timer: immer Flüssigkeit mit Chili ────────
aufbauen();
var nun = zeitJetzt();
state.abgewoehnen = [lasterLesen({ id: 'w1', name: 'Zucker', start: nun - 86400000, rueckfaelle: [], draenge: [] })];
welleBeginnen('w1');
zeige('welle');
var fl = q('#welle .fl-welle');
pruefe('W1 im Drang steht Flüssigkeit unter der Chili, auch im Standard', !!fl && fl.nextElementSibling === q('#chiliFigur') &&
  /path\(/.test(fl.querySelector('.fp-fluss').style.clipPath) && fl.querySelector('.fp-licht').style.opacity === '0');
pruefe('W2 der Ring ist ein Drittel so dick wie zuvor', Math.abs(parseFloat(getComputedStyle(q('#welle .welle-ring circle')).strokeWidth) - 0.73) < 0.01);
state.welle = null;
zeige('home');

var blattFluss = null, stillstand = null, zuGeist = null, zuHuelle = null;
return Promise.resolve().then(function () {
  // ── M · Das Menü auf iOS, in Bewegung ─────────────────────
  aufbauen();
  state.fluessig = { ios: { menue: true } };
  flDauernSetzen();
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
    document.documentElement.classList.contains('fl-menue') && mc.opacity === '1' && mc.transitionProperty.indexOf('background-color') >= 0);
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
  state.fluessig = { ios: { ansichten: true } };
  flDauernSetzen();
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
  state.fluessig = { ios: { hinweis: true, schalter: true } };
  flDauernSetzen();
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
  state.fluessig = null;
  flDauernSetzen();
  // ── B · Bewegung in den Proben ────────────────────────────
  labor();
  tipp('menue', 'knopf');
  pruefe('B1 ein Tipp stößt die Bewegung an', fpLauf.menue.laeuft === true);
  return warten(RUHE);
}).then(function () {
  pruefe('B2 das Menü steht offen, sein Inhalt ist zu sehen', fpLauf.menue.offen() &&
    buehne('menue').querySelector('[data-fp-teil="inhalt"]').style.opacity === '1');
  tipp('menue', 'flaeche');
  tipp('haken', 'haken');
  tipp('zeilen', 'plus');
  tipp('tag', 'tag5');
  tipp('schalter', 'schalter');
  tipp('ansichten', 'knopf');
  return warten(3 * RUHE);
}).then(function () {
  pruefe('B3 das Menü ist zurückgeflossen', !fpLauf.menue.offen());
  pruefe('B4 abgehakt: Der Tropfen ist im Zähler aufgegangen', fpLauf.haken.zahl() === 4);
  pruefe('B5 eine Zeile ist dazugetropft', fpLauf.zeilen.anzahl() === 3);
  pruefe('B6 die Markierung steht auf dem neuen Tag', buehne('tag').querySelector('[data-fp-tipp="tag5"]').getAttribute('aria-pressed') === 'true');
  pruefe('B7 der Schalter ist umgelegt', buehne('schalter').querySelector('[role="switch"]').getAttribute('aria-checked') === 'true');
  pruefe('B8 die Ansicht ist aufgequollen', fpLauf.ansichten.offen());
  pruefe('B9 alle Schleifen ruhen', IDS.every(function (id) { return !fpLauf[id].laeuft; }));
  tipp('menue', 'knopf');
  var pi = buehne('menue').querySelector('[data-fp-teil="inhalt"]');
  pruefe('B3b wer wieder öffnet, blendet den Inhalt ein, statt ihn mitzunehmen', !pi.style.transform && pi.style.opacity === '0');
  tipp('menue', 'flaeche');
  tipp('welle', 'welle');
  return warten(RUHE);
}).then(function () {
  pruefe('B10 die Welle der Probe läuft im Zeitraffer', fpLauf.welle.wellenLauf());
  tipp('welle', 'welle');
  pruefe('B11 ein zweiter Tipp hält sie an', !fpLauf.welle.wellenLauf());
  state.bewegung = 'aus';
  tipp('perle', 'knopf');
  return warten(100);
}).then(function () {
  pruefe('B12 ohne Bewegung steht sie sofort am Ziel', fpLauf.perle.offen() && !fpLauf.perle.laeuft);
  pruefe('B13 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);
  state.bewegung = 'auto';
  state.fluessig = null;
  flDauernSetzen();
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
  state.fluessig = { ios: { menue: true, ansichten: true, tag: true, schalter: true, haken: true } };
  flDauernSetzen();
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
  pruefe('T1 auf iOS wechselt die Tagesliste nur den Inhalt, ohne neuen Tropfen', !q('.held .tropfen') && !!q('#kalLeiste'));
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
  pruefe('Z1 auch ein Zähler schickt auf iOS einen Tropfen in den Tagesring', alle('body > .fl-perle').length > vor);
  state.thema = 'auto';
  themaAnwenden();
  weg(stillstand);
  state.fluessig = null;
  flDauernSetzen();
});
`);
