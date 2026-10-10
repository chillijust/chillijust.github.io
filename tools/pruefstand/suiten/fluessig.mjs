// Flüssigprobe (0.16.0T): acht Bühnen am Ende des Dashboards, je im Pfad
// (Umriß als clip-path) oder im Filter (weich gezeichnet, hart geschnitten).
// Der Hals ist ein Metaball, der reißt; die Feder schwingt nur mit
// «Nachfedern» über. Grund, Technik, Regler, Ausnahmen und Urteil werden
// gemerkt, als Text kopiert und reisen nicht im Sicherungscode mit.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('fluessig', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function aufbauen() {
  frisch();
  state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [] })];
  zeige('home');
}
function buehne(id) { return q('#app [data-fp-buehne="' + id + '"]'); }
function tipp(id, was) { buehne(id).querySelector('[data-fp-tipp="' + was + '"]').click(); }
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
var RUHE = fpRuhe(FP_GRUND.ios) + 300;
var IDS = FP_STELLEN.map(function (s) { return s[0]; });

// ── A · Aufbau ──────────────────────────────────────────────
aufbauen();
pruefe('A1 die Probe steht am Ende des Dashboards', !!q('#app #fluessigProbe') &&
  q('#ansicht').lastElementChild.id === 'fluessigProbe');
pruefe('A2 jede Stelle hat Karte und Bühne', alle('#fluessigProbe .fp-karte').length === IDS.length &&
  IDS.every(function (id) { return !!q('[data-fp-karte="' + id + '"]') && !!buehne(id); }));
pruefe('A3 ohne Wahl gilt iOS 26 im Pfad', state.fluessig === null && fpFuer('menue').technik === 'pfad' &&
  fpGleich(fpFuer('menue').werte, FP_GRUND.ios));
pruefe('A4 jede Bühne zeichnet im Pfad einen Umriß', IDS.every(function (id) {
  var f = buehne(id).querySelector('.fp-fluss');
  return !!f && /path\(/.test(f.style.clipPath || f.style.webkitClipPath);
}));
pruefe('A5 alles Tippbare ist groß genug', alle('#fluessigProbe button').every(function (b) {
  var r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44;
}));
pruefe('A6 die Regler haben Schrift ab 16 px', alle('#fluessigProbe input').length === FP_REGLER.length &&
  alle('#fluessigProbe input').every(function (f) { return parseFloat(getComputedStyle(f).fontSize) >= 16; }));
pruefe('A7 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);

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

// ── S · Steuerung und Speicher ──────────────────────────────
q('#fluessigProbe [data-fp-technik="filter"]').click();
pruefe('S1 Filter gilt für alle und ist gemerkt', state.fluessig.technik === 'filter' && gemerkt().technik === 'filter');
pruefe('S2 jede Bühne ist im Filter neu gebaut und hat Formen', IDS.every(function (id) {
  var g = buehne(id).querySelector('.fp-goo');
  return !!g && g.children.length > 0 && !buehne(id).querySelector('.fp-fluss');
}));
q('[data-fp-stelle-technik="pfad"][data-fp-fuer="welle"]').click();
pruefe('S3 eine Ausnahme: die Welle bleibt im Pfad', fpFuer('welle').technik === 'pfad' &&
  !!buehne('welle').querySelector('.fp-fluss') && gemerkt().stellen.welle.technik === 'pfad');
q('[data-fp-stelle-technik="oben"][data-fp-fuer="welle"]').click();
pruefe('S4 «Wie oben» nimmt sie zurück', !state.fluessig.stellen.welle && !!buehne('welle').querySelector('.fp-goo'));
q('#fluessigProbe [data-fp-grund="honig"]').click();
pruefe('S5 Honig setzt alle Regler', fpGleich(state.fluessig.werte, FP_GRUND.honig) &&
  q('.fp-regler-ort[data-fp-fuer=""] input[data-fp-regler="hals"]').value === '0.85');
var tempo = q('.fp-regler-ort[data-fp-fuer=""] input[data-fp-regler="tempo"]');
eingabe(tempo, '0.6');
pruefe('S6 ein Regler ändert den Wert und nennt ihn', state.fluessig.werte.tempo === 0.6 &&
  tempo.parentNode.querySelector('[data-fp-wert]').textContent === '0,60 s' &&
  q('#fpGrundStand').textContent.indexOf(String.fromCharCode(118, 101, 114, 228, 110, 100, 101, 114, 116)) >= 0);
tempo.dispatchEvent(new Event('change', { bubbles: true }));
pruefe('S7 losgelassen ist er gemerkt', gemerkt().werte.tempo === 0.6);
q('[data-fp-eigen="menue"]').click();
var eigen = alle('.fp-regler-ort[data-fp-fuer="menue"] input');
pruefe('S8 eigene Regler klappen auf, vom gemeinsamen Stand aus', eigen.length === FP_REGLER.length &&
  state.fluessig.stellen.menue.werte.tempo === 0.6);
eingabe(eigen[0], '0.3');
pruefe('S9 sie gelten nur für ihre Stelle', fpFuer('menue').werte.tempo === 0.3 && fpFuer('hinweis').werte.tempo === 0.6);
q('[data-fp-urteil="ja"][data-fp-fuer="menue"]').click();
q('[data-fp-urteil="nein"][data-fp-fuer="perle"]').click();
pruefe('S10 das Urteil ist gemerkt', gemerkt().stellen.menue.urteil === 'ja' && gemerkt().stellen.perle.urteil === 'nein');
q('[data-fp-eigen="menue"]').click();
pruefe('S11 eigene Regler zu: die Stelle folgt wieder allen', !state.fluessig.stellen.menue.werte &&
  fpFuer('menue').werte.tempo === 0.6 && !q('.fp-regler-ort[data-fp-fuer="menue"] input'));

// ── K · Kopieren ────────────────────────────────────────────
var text = fpSicherung(), zeilen = text.split('\n');
pruefe('K1 die Sicherung nennt Grund, Technik und Werte', zeilen[1] === 'Grund: ' + FP_GRUND.honig.name + ', ' +
  String.fromCharCode(118, 101, 114, 228, 110, 100, 101, 114, 116) && zeilen[2] === 'Technik: Filter' &&
  zeilen[3] === fpWerteText(state.fluessig.werte), zeilen.slice(0, 4).join(' / '));
pruefe('K2 und jedes Urteil', FP_STELLEN.every(function (s) {
  var u = (state.fluessig.stellen[s[0]] || {}).urteil;
  return zeilen.indexOf('· ' + s[1] + ': ' + (u === 'ja' ? 'nehmen' : u === 'nein' ? 'nicht nehmen' : 'offen')) >= 0;
}));
var kopiert = null;
kopieren = function (t, fertig) { kopiert = t; fertig(true); };
q('#fpKopieren').click();
pruefe('K3 der Knopf kopiert genau diesen Text', kopiert === fpSicherung());

// ── L · Laden ───────────────────────────────────────────────
var s = stand({ fluessig: { grund: '__proto__', technik: 'x', werte: { tempo: 9 }, stellen: {
  menue: { urteil: 'vielleicht', technik: 'filter', werte: { tempo: 0.1, feder: 2, hals: 0.5, dehnen: 0.5, kante: 0.5 } },
  fremd: { urteil: 'ja' } } } });
pruefe('L1 Unsinn fällt auf den Grund', s.fluessig.grund === 'ios' && s.fluessig.technik === 'pfad' &&
  fpGleich(s.fluessig.werte, FP_GRUND.ios));
pruefe('L2 Werte werden begrenzt, Fremdes fällt weg', s.fluessig.stellen.menue.technik === 'filter' &&
  s.fluessig.stellen.menue.werte.tempo === 0.25 && s.fluessig.stellen.menue.werte.feder === 1 &&
  !s.fluessig.stellen.menue.urteil && !s.fluessig.stellen.fremd);
pruefe('L3 ohne Stand keiner', stand({}).fluessig === null);
pruefe('L4 die Probe reist nicht im Sicherungscode mit', !('fluessig' in codeLesen(sicherungsCode(zeitJetzt()))));

// ── B · Bewegung ────────────────────────────────────────────
aufbauen();
tipp('menue', 'knopf');
pruefe('B1 ein Tipp stößt die Bewegung an', fpLauf.menue.laeuft === true);
return warten(RUHE).then(function () {
  pruefe('B2 das Menü steht offen, sein Inhalt ist zu sehen', fpLauf.menue.offen() &&
    buehne('menue').querySelector('[data-fp-teil="inhalt"]').style.opacity === '1');
  pruefe('B3 und die Schleife ruht', fpLauf.menue.laeuft === false);
  tipp('menue', 'flaeche');
  tipp('haken', 'haken');
  tipp('zeilen', 'plus');
  tipp('tag', 'tag5');
  tipp('schalter', 'schalter');
  return warten(3 * RUHE);
}).then(function () {
  pruefe('B4 das Menü ist zurückgeflossen', !fpLauf.menue.offen() &&
    buehne('menue').querySelector('[data-fp-teil="inhalt"]').style.opacity === '0');
  pruefe('B5 abgehakt: Der Tropfen ist im Zähler aufgegangen', fpLauf.haken.zahl() === 4 &&
    buehne('haken').querySelector('[data-fp-tipp="haken"]').getAttribute('aria-pressed') === 'true');
  pruefe('B6 eine Zeile ist dazugetropft', fpLauf.zeilen.anzahl() === 3 && buehne('zeilen').querySelectorAll('.fp-zeile').length === 3);
  pruefe('B7 die Markierung steht auf dem neuen Tag', buehne('tag').querySelector('[data-fp-tipp="tag5"]').getAttribute('aria-pressed') === 'true' &&
    alle('#app [data-fp-buehne="tag"] [aria-pressed="true"]').length === 1);
  pruefe('B8 der Schalter ist umgelegt', buehne('schalter').querySelector('[role="switch"]').getAttribute('aria-checked') === 'true');
  pruefe('B9 alle Schleifen ruhen', IDS.every(function (id) { return !fpLauf[id].laeuft; }),
    IDS.filter(function (id) { return fpLauf[id].laeuft; }).map(function (id) {
      return id + ' ' + fpLauf[id].federn().map(function (f) { return f.x.toFixed(3) + '/' + f.v.toFixed(3) + '>' + f.ziel; }).join(',');
    }).join(' | '));
  tipp('zeilen', 'zeile0');
  tipp('haken', 'haken');
  tipp('welle', 'welle');
  return warten(RUHE);
}).then(function () {
  pruefe('B10 die getippte Zeile ist in den Menüknopf geflossen', fpLauf.zeilen.anzahl() === 2 &&
    buehne('zeilen').querySelectorAll('.fp-zeile').length === 2 && !buehne('zeilen').querySelector('[data-fp-tipp="zeile0"]'));
  pruefe('B11 zurückgenommen zählt der Zähler zurück', fpLauf.haken.zahl() === 3);
  pruefe('B12 die Welle läuft im Zeitraffer', fpLauf.welle.wellenLauf() &&
    buehne('welle').querySelector('[data-fp-teil="zeit"]').textContent !== '10:00');
  tipp('welle', 'welle');
  pruefe('B13 ein zweiter Tipp hält sie an', !fpLauf.welle.wellenLauf());
  state.bewegung = 'aus';
  tipp('perle', 'knopf');
  return warten(100);
}).then(function () {
  pruefe('B14 ohne Bewegung steht sie sofort am Ziel', fpLauf.perle.offen() && fpLauf.perle.laeuft === false);
  pruefe('B15 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);
});
`);
