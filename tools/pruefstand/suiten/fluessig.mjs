// Flüssig (ADR 0053): Die echten Tropfen fließen mit Feder und Hals, wie im
// Reiter «Flüssig» der Einstellungen eingestellt — voreingestellt iOS 26 im
// Filter. Dort stehen acht Proben, je im Pfad (Umriß als clip-path) oder im
// Filter (weich gezeichnet, hart geschnitten); «Eigene Einstellungen» für alle
// und je Stelle, gemerkt, als Text kopiert, nicht im Sicherungscode.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('fluessig', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function aufbauen() {
  frisch();
  esReiter = 'allgemein';
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [] })];
  zeige('home');
}
function labor() { zeige('einstellungen'); q('#app [data-es-reiter="fluessig"]').click(); }
function buehne(id) { return q('#app [data-fp-buehne="' + id + '"]'); }
function tipp(id, was) { buehne(id).querySelector('[data-fp-tipp="' + was + '"]').click(); }
function schalter(id) { return q('#app [data-fp-schalter="' + id + '"]'); }
function gemerkt() { try { return JSON.parse(localStorage.getItem(SPEICHER)).fluessig; } catch (e) { return null; } }
function eingabe(r, wert) { r.value = wert; r.dispatchEvent(new Event('input', { bubbles: true })); }
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
var VERAENDERT = String.fromCharCode(118, 101, 114, 228, 110, 100, 101, 114, 116);
var RUHE = fpRuhe(FP_GRUND.ios) + 300;
var IDS = FP_STELLEN.map(function (s) { return s[0]; });

// ── A · Aufbau ──────────────────────────────────────────────
aufbauen();
pruefe('A1 das Dashboard trägt keine Probe mehr', !q('#app #fluessigProbe') && !q('#app [data-fp-buehne]'));
zeige('einstellungen');
pruefe('A2 die Einstellungen haben zwei Reiter, Allgemein ist offen', alle('#app [data-es-reiter]').length === 2 &&
  q('#app [data-es-reiter="allgemein"]').getAttribute('aria-pressed') === 'true' && !!q('#esLoeschen') && !q('#fluessigProbe'));
q('#app [data-es-reiter="fluessig"]').click();
pruefe('A3 «Flüssig» zeigt das Labor statt der allgemeinen Einstellungen', !!q('#app #fluessigProbe') && !q('#esLoeschen') &&
  q('#app [data-es-reiter="fluessig"]').getAttribute('aria-pressed') === 'true');
pruefe('A4 jede Stelle hat Karte, Bühne und Umschalter', alle('#fluessigProbe .fp-karte').length === IDS.length &&
  IDS.every(function (id) { return !!buehne(id) && schalter(id).getAttribute('aria-checked') === 'false'; }));
pruefe('A5 ohne eigene Einstellungen gilt iOS 26 im Filter', state.fluessig === null && schalter('').getAttribute('aria-checked') === 'false' &&
  IDS.every(function (id) { return fpFuer(id).technik === 'filter' && fpGleich(fpFuer(id).werte, FP_GRUND.ios); }) &&
  !q('#fluessigProbe input'));
pruefe('A6 jede Bühne zeichnet im Filter', IDS.every(function (id) {
  var g = buehne(id).querySelector('.fp-goo'); return !!g && g.children.length > 0 && !buehne(id).querySelector('.fp-fluss');
}));
pruefe('A7 alles Tippbare ist groß genug', alle('#fluessigProbe button').every(function (b) {
  var r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44;
}));
pruefe('A8 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);

// ── H · Hals und Umriß ──────────────────────────────────────
var k = { x: 0, y: 0, r: 20 };
pruefe('H1 nahe Kreise hängen über einen Hals', fpHalsPfad(k, { x: 50, y: 0, r: 15 }, 80) !== '');
pruefe('H2 jenseits der Weite ist er gerissen', fpHalsPfad(k, { x: 90, y: 0, r: 15 }, 80) === '');
pruefe('H3 liegt ein Kreis im anderen, ist er aufgegangen', fpHalsPfad(k, { x: 3, y: 0, r: 10 }, 80) === '');
pruefe('H4 zäher hält weiter', fpWeite(20, 15, FP_GRUND.honig) > fpWeite(20, 15, FP_GRUND.ios) &&
  fpWeite(20, 15, FP_GRUND.ios) > fpWeite(20, 15, FP_GRUND.quecksilber));
pruefe('H5 Formen laufen im Uhrzeigersinn, auch gedehnt', umlauf(fpPunkte({ x: 0, y: 0, w: 100, h: 40, r: 12 })) > 0 &&
  umlauf(fpPunkte({ x: 0, y: 0, w: 30, h: 30, r: 15, deh: { a: 1, e: 1.3 } })) > 0);
pruefe('H6 Hälse auch, in jeder Richtung — sonst stanzt die Überlappung ein Loch', [[50, 0], [-50, 0], [0, 50], [30, -40]].every(function (p) {
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
pruefe('F3 die Voreinstellung läßt die abgenommenen Dauern, wie sie sind', Math.abs(tk.faktor - 1) < 1e-9);
pruefe('F4 die Kurve ist die Feder, mit Überschwingen', tk.kurve.indexOf('linear(') === 0 &&
  Math.max.apply(null, punkte(tk.kurve)) > 1 && punkte(tk.kurve).pop() === 1);
pruefe('F5 in den Knopf hinein schwingt nichts über', punkte(tz.kurve).every(function (x, i, a) { return x <= 1 && (!i || x >= a[i - 1]); }));

// ── S · Steuerung und Speicher ──────────────────────────────
schalter('').click();
var alle0 = q('#fluessigProbe [data-fp-eigenes=""]');
pruefe('S1 «Eigene Einstellungen» klappt Grund, Technik und Regler auf — ab der Voreinstellung',
  state.fluessig.eigen === true && gemerkt().eigen === true && alle0.querySelectorAll('input').length === FP_REGLER.length &&
  alle0.querySelectorAll('[data-fp-grund]').length === 3 && fpFuer('menue').technik === 'filter');
pruefe('S2 die Regler haben Schrift ab 16 px', alle('#fluessigProbe input').every(function (f) { return parseFloat(getComputedStyle(f).fontSize) >= 16; }));
alle0.querySelector('[data-fp-technik="pfad"]').click();
pruefe('S3 Pfad gilt für alle, jede Bühne ist neu gebaut', gemerkt().technik === 'pfad' && IDS.every(function (id) {
  var f = buehne(id).querySelector('.fp-fluss'); return !!f && /path\(/.test(f.style.clipPath || f.style.webkitClipPath);
}));
alle0.querySelector('[data-fp-grund="honig"]').click();
pruefe('S4 Honig setzt alle Regler', fpGleich(state.fluessig.werte, FP_GRUND.honig) &&
  alle0.querySelector('input[data-fp-regler="hals"]').value === '0.85');
var tempo = alle0.querySelector('input[data-fp-regler="tempo"]');
eingabe(tempo, '0.6');
pruefe('S5 ein Regler ändert den Wert und nennt ihn', state.fluessig.werte.tempo === 0.6 &&
  tempo.parentNode.querySelector('[data-fp-wert]').textContent === '0,60 s' && q('#fpGrundStand').textContent.indexOf(VERAENDERT) >= 0);
tempo.dispatchEvent(new Event('change', { bubbles: true }));
pruefe('S6 losgelassen ist er gemerkt', gemerkt().werte.tempo === 0.6);
schalter('welle').click();
var welle0 = q('#fluessigProbe [data-fp-eigenes="welle"]');
pruefe('S7 eine Stelle übernimmt beim Einschalten, was eben galt', state.fluessig.stellen.welle.eigen === true &&
  state.fluessig.stellen.welle.technik === 'pfad' && state.fluessig.stellen.welle.werte.tempo === 0.6 &&
  welle0.querySelectorAll('input').length === FP_REGLER.length && !welle0.querySelector('[data-fp-grund]'));
welle0.querySelector('[data-fp-technik="filter"]').click();
eingabe(welle0.querySelector('input[data-fp-regler="tempo"]'), '0.3');
pruefe('S8 ihre Einstellungen gelten nur für sie', fpFuer('welle').technik === 'filter' && fpFuer('welle').werte.tempo === 0.3 &&
  !!buehne('welle').querySelector('.fp-goo') && fpFuer('menue').technik === 'pfad' && fpFuer('menue').werte.tempo === 0.6);
schalter('welle').click();
pruefe('S9 aus: Sie folgt wieder allen, ihre Werte bleiben gemerkt', fpFuer('welle').technik === 'pfad' &&
  state.fluessig.stellen.welle.eigen === false && state.fluessig.stellen.welle.werte.tempo === 0.3 &&
  !welle0.querySelector('input') && !!buehne('welle').querySelector('.fp-fluss'));
schalter('').click();
pruefe('S10 für alle aus: wieder iOS 26 im Filter, die eigenen Werte bleiben', IDS.every(function (id) {
  return fpFuer(id).technik === 'filter' && fpGleich(fpFuer(id).werte, FP_GRUND.ios);
}) && state.fluessig.werte.tempo === 0.6 && gemerkt().eigen === false && !alle0.querySelector('input'));
schalter('').click();
pruefe('S11 wieder an: alles ist wie vorher', fpFuer('menue').technik === 'pfad' && fpFuer('menue').werte.tempo === 0.6 &&
  alle0.querySelector('input[data-fp-regler="tempo"]').value === '0.6');

// ── K · Kopieren ────────────────────────────────────────────
schalter('perle').click();
var zeilen = fpSicherung().split('\n');
pruefe('K1 die Sicherung nennt Schalter, Grund, Technik und Werte', zeilen[1] === 'Eigene Einstellungen: an' &&
  zeilen[2] === 'Grund: ' + FP_GRUND.honig.name + ', ' + VERAENDERT && zeilen[3] === 'Technik: Pfad' &&
  zeilen[4] === fpWerteText(state.fluessig.werte), zeilen.slice(0, 5).join(' / '));
pruefe('K2 und nur die Stellen mit eigenen Einstellungen', zeilen.filter(function (z) { return z.indexOf('· ') === 0; }).length === 1 &&
  zeilen.indexOf('· ' + fpName('perle') + ': Pfad · ' + fpWerteText(state.fluessig.stellen.perle.werte)) >= 0);
var kopiert = null;
kopieren = function (t, fertig) { kopiert = t; fertig(true); };
q('#fpKopieren').click();
pruefe('K3 der Knopf kopiert genau diesen Text', kopiert === fpSicherung());

// ── L · Laden ───────────────────────────────────────────────
var s = stand({ fluessig: { grund: '__proto__', technik: 'x', werte: { tempo: 9 }, stellen: {
  menue: { urteil: 'ja', technik: 'pfad', werte: { tempo: 0.1, feder: 2, hals: 0.5, dehnen: 0.5, kante: 0.5 } },
  perle: { eigen: true, technik: 'filter' }, fremd: { eigen: true } } } });
pruefe('L1 Unsinn fällt auf den Grund; ohne «eigen» gilt die Voreinstellung', s.fluessig.eigen === false && s.fluessig.grund === 'ios' &&
  s.fluessig.technik === 'filter' && fpGleich(s.fluessig.werte, FP_GRUND.ios));
pruefe('L2 der Stand aus 0.16 bleibt gemerkt, aber aus; Werte begrenzt, Fremdes fällt weg', s.fluessig.stellen.menue.eigen === false &&
  s.fluessig.stellen.menue.technik === 'pfad' && s.fluessig.stellen.menue.werte.tempo === 0.25 &&
  s.fluessig.stellen.menue.werte.feder === 1 && !('urteil' in s.fluessig.stellen.menue) && !s.fluessig.stellen.perle && !s.fluessig.stellen.fremd);
pruefe('L3 ohne Stand keiner', stand({}).fluessig === null);
pruefe('L4 nicht im Sicherungscode', !('fluessig' in codeLesen(sicherungsCode(zeitJetzt()))));

// ── R · Die echte App fließt ────────────────────────────────
aufbauen();
var quelle = document.createElement('div'), tropfen = document.createElement('div');
quelle.style.cssText = 'position: fixed; left: 300px; top: 40px; width: 44px; height: 44px; border-radius: 50%;';
tropfen.style.cssText = 'position: fixed; left: 302px; top: 100px; width: 40px; height: 40px; border-radius: 50%; background: red; z-index: 25;';
document.body.appendChild(quelle);
document.body.appendChild(tropfen);
var h = null, hals = fliessen(tropfen, quelle, { stelle: 'menue', dauer: 400 });
pruefe('R1 der Hals liegt direkt unter dem Tropfen, der Tropfen trägt die Lichtkante', !!hals && hals.nextElementSibling === tropfen &&
  tropfen.classList.contains('fl-kante'));
return warten(120).then(function () {
  pruefe('R2 nah an der Quelle hängt er, im Filter, und spart die Quelle aus', hals.style.display === '' &&
    hals.querySelector('.fp-goo').children.length >= 2 && /evenodd/.test(hals.style.clipPath || hals.style.webkitClipPath));
  tropfen.style.top = '420px';
  return warten(120);
}).then(function () {
  pruefe('R3 fern der Quelle ist er gerissen', hals.style.display === 'none');
  return warten(400);
}).then(function () {
  pruefe('R4 danach räumt er auf', !hals.isConnected && !tropfen.classList.contains('fl-kante'));
  weg(quelle);
  weg(tropfen);
  menueOeffnen();
  var b = q('#menue .blatt'), a = b.getAnimations()[0];
  pruefe('R5 das Menü quillt mit der Feder und hängt am Knopf', !!a && a.effect.getTiming().easing.indexOf('linear(') === 0 &&
    a.effect.getTiming().duration === MENUE_DAUER && !!q('#menue .fl-schicht'));
  menueSchliessen(true);
  state.fluessig = fluessigLesen({ eigen: true, werte: { tempo: 1, feder: 0.35, hals: 0.35, dehnen: 0.4, kante: 0.6 } });
  var vorher = alle('body > .tropfen-huelle');
  tropfenAuf(q('#ansicht'), punktFlaeche(320, 60));
  h = alle('body > .tropfen-huelle').filter(function (x) { return vorher.indexOf(x) < 0; })[0];
  pruefe('R6 eigenes Tempo dehnt die Dauer, der Tropfen hängt an seiner Quelle', !!h &&
    h.getAnimations()[0].effect.getTiming().duration === Math.round(TROPFEN_DAUER * fluessigTakt('menue').faktor) &&
    fluessigTakt('menue').faktor > 1.9 && !!h.previousElementSibling && h.previousElementSibling.classList.contains('fl-schicht'));
  return warten(Math.round(TROPFEN_DAUER * fluessigTakt('menue').faktor) + 300);
}).then(function () {
  ausbewegt();
  return warten(50);
}).then(function () {
  pruefe('R7 nach dem Tropfen ist nichts übrig', !q('.fl-schicht') && !q('.fl-kante') && !h.isConnected);
  state.bewegung = 'aus';
  pruefe('R8 ohne Bewegung kein Hals', fliessen(q('#ansicht'), q('#menuKnopf'), { stelle: 'menue', dauer: 400 }) === null);
  state.bewegung = 'auto';
  state.fluessig = null;

  // ── B · Bewegung in den Proben ──────────────────────────────
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
  return warten(3 * RUHE);
}).then(function () {
  pruefe('B3 das Menü ist zurückgeflossen', !fpLauf.menue.offen() &&
    buehne('menue').querySelector('[data-fp-teil="inhalt"]').style.opacity === '0');
  pruefe('B4 abgehakt: Der Tropfen ist im Zähler aufgegangen', fpLauf.haken.zahl() === 4);
  pruefe('B5 eine Zeile ist dazugetropft', fpLauf.zeilen.anzahl() === 3 && buehne('zeilen').querySelectorAll('.fp-zeile').length === 3);
  pruefe('B6 die Markierung steht auf dem neuen Tag', buehne('tag').querySelector('[data-fp-tipp="tag5"]').getAttribute('aria-pressed') === 'true' &&
    alle('#app [data-fp-buehne="tag"] [aria-pressed="true"]').length === 1);
  pruefe('B7 der Schalter ist umgelegt', buehne('schalter').querySelector('[role="switch"]').getAttribute('aria-checked') === 'true');
  pruefe('B8 alle Schleifen ruhen', IDS.every(function (id) { return !fpLauf[id].laeuft; }));
  tipp('zeilen', 'zeile0');
  tipp('haken', 'haken');
  tipp('welle', 'welle');
  return warten(RUHE);
}).then(function () {
  pruefe('B9 die getippte Zeile ist in den Menüknopf geflossen', fpLauf.zeilen.anzahl() === 2 &&
    !buehne('zeilen').querySelector('[data-fp-tipp="zeile0"]'));
  pruefe('B10 zurückgenommen zählt der Zähler zurück', fpLauf.haken.zahl() === 3);
  pruefe('B11 die Welle läuft im Zeitraffer', fpLauf.welle.wellenLauf() &&
    buehne('welle').querySelector('[data-fp-teil="zeit"]').textContent !== '10:00');
  tipp('welle', 'welle');
  pruefe('B12 ein zweiter Tipp hält sie an', !fpLauf.welle.wellenLauf());
  state.bewegung = 'aus';
  tipp('perle', 'knopf');
  return warten(100);
}).then(function () {
  pruefe('B13 ohne Bewegung steht sie sofort am Ziel', fpLauf.perle.offen() && !fpLauf.perle.laeuft);
  pruefe('B14 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);
});
`);
