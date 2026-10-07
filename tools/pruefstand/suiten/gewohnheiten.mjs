// Gewohnheiten (Bauabschnitt 2): Stärke, Serie, nie zweimal, Anlegen, Abhaken,
// Bearbeiten, Archivieren, der Hinweis ab 3 — und was der Speicher davon annimmt.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026. Die Woche dazu
// beginnt Montag, den 12.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

// Von außen: Die Grenzen, die stand() braucht, stehen vor dem ersten laden().
// Sonst wären sie beim Start noch undefined, und jede Gewohnheit «x-mal pro
// Woche» fiele beim Öffnen der App still aus dem Speicher.
const laedt = html.indexOf('var state = laden();');
for (const name of ['NAME_MAX', 'PRO_WOCHE_MAX']) {
  const steht = html.indexOf('var ' + name + ' =');
  if (steht === -1 || laedt === -1 || steht > laedt) {
    throw new Error(name + ' steht nicht vor «var state = laden();»');
  }
}

suite('gewohnheiten', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };
var HEUTE = '2026-10-14';
var nr = 0;
function gw(rhythmus, angelegt, erledigt, name) {
  return gewohnheitLesen({ id: 't' + (++nr), name: name || 'Lesen', rhythmus: rhythmus,
    angelegt: angelegt, erledigt: erledigt || [] });
}
function tage(von, bis) {
  var r = [];
  for (var k = von; k <= bis; k = tagPlus(k, 1)) r.push(k);
  return r;
}
function vor(n) { return tagPlus(HEUTE, -n); }
function nahe(a, b) { return Math.abs(a - b) < 1e-9; }
var TAEGLICH = { art: 'taeglich' };
function eingeben(text) {
  var feld = q('#gwName');
  feld.value = text;
  feld.dispatchEvent(new Event('input'));
}
frisch();

// ── A · Stärke ──────────────────────────────────────────────
pruefe('A1 α führt in 66 Gelegenheiten auf 90 %', nahe(1 - Math.pow(1 - ALPHA, 66), 0.9), ALPHA);
var voll = gw(TAEGLICH, vor(65), tage(vor(65), HEUTE));
pruefe('A2 66 Tage lückenlos ergeben 90 %', nahe(auswerten(voll, HEUTE).staerke, 0.9),
  auswerten(voll, HEUTE).staerke);
var einer = gw(TAEGLICH, vor(65), tage(vor(65), HEUTE).filter(function (k) { return k !== vor(30); }));
var verlust = auswerten(voll, HEUTE).staerke - auswerten(einer, HEUTE).staerke;
pruefe('A3 ein Aussetzer kostet wenig', verlust > 0 && verlust < 0.04, verlust);
var lang = gw(TAEGLICH, vor(79), tage(vor(79), vor(15)).concat([HEUTE]));
var ganz = gw(TAEGLICH, vor(79), tage(vor(79), HEUTE));
var luecke = auswerten(ganz, HEUTE).staerke - auswerten(lang, HEUTE).staerke;
pruefe('A4 zwei Wochen Lücke kosten viel', luecke > 0.25, luecke);
var offen = gw(TAEGLICH, vor(20), tage(vor(20), vor(1)));
pruefe('A5 heute offen ist kein Aussetzer',
  auswerten(offen, HEUTE).staerke === auswerten(offen, vor(1)).staerke);
var mmf = { art: 'wochentage', tage: [1, 3, 5] };
var nurFaellig = tage(vor(30), HEUTE).filter(function (k) { return [1, 3, 5].indexOf(ausSchluessel(k).getDay()) !== -1; });
var mitExtra = tage(vor(30), HEUTE);
pruefe('A6 Wochentage: Nicht-fällige Tage zählen nicht',
  auswerten(gw(mmf, vor(30), nurFaellig), HEUTE).staerke === auswerten(gw(mmf, vor(30), mitExtra), HEUTE).staerke);
pruefe('A7 Wochentage: Nicht-fällige Lücken kosten nichts',
  nahe(auswerten(gw(mmf, vor(30), nurFaellig), HEUTE).staerke, 1 - Math.pow(1 - ALPHA, nurFaellig.length)));
var w3 = { art: 'proWoche', anzahl: 3 };
var drei = gw(w3, '2026-10-05', ['2026-10-05', '2026-10-06', '2026-10-07']);
pruefe('A8 pro Woche: erreicht wiegt wie drei Tage', nahe(auswerten(drei, HEUTE).staerke, 1 - Math.pow(1 - ALPHA, 3)),
  auswerten(drei, HEUTE).staerke);
var zwei = gw(w3, '2026-10-05', ['2026-10-05', '2026-10-09']);
pruefe('A9 pro Woche: verfehlt zählt anteilig',
  nahe(auswerten(zwei, HEUTE).staerke, (1 - Math.pow(1 - ALPHA, 3)) * 2 / 3));
var sonntag = gw(w3, '2026-10-11', ['2026-10-11']);
pruefe('A10 die angebrochene erste Woche verlangt nur, was ging', nahe(auswerten(sonntag, HEUTE).staerke, ALPHA));
var laufend = auswerten(drei, HEUTE);
pruefe('A11 die laufende Woche zählt erst, wenn sie erreicht ist',
  laufend.faelligHeute && laufend.treffer === 0 && laufend.ziel === 3);
var schon = auswerten(gw({ art: 'proWoche', anzahl: 2 }, '2026-10-12', ['2026-10-12', '2026-10-13']), HEUTE);
pruefe('A12 erreicht, ist sie heute nicht mehr dran', !schon.faelligHeute && nahe(schon.staerke, 1 - Math.pow(1 - ALPHA, 2)));

// ── B · Nie zweimal, Serie, Punkte ──────────────────────────
var gestern = gw(TAEGLICH, vor(3), [vor(3), vor(2)]);
var b = auswerten(gestern, HEUTE);
pruefe('B1 gestern verpaßt: heute warnt die Kachel', b.warnen === true);
pruefe('B2 die Serie hält einen Aussetzer aus', b.serie === 2, b.serie);
gestern.erledigt.push(HEUTE);
pruefe('B3 heute erledigt: keine Warnung mehr', auswerten(gestern, HEUTE).warnen === false);
var s1 = gw(TAEGLICH, vor(9), tage(vor(9), vor(5)).concat(tage(vor(3), vor(1))));
pruefe('B4 einmal ausgelassen: die Serie zählt weiter', auswerten(s1, HEUTE).serie === 8, auswerten(s1, HEUTE).serie);
var s2 = gw(TAEGLICH, vor(9), tage(vor(9), vor(5)).concat(tage(vor(2), vor(1))));
pruefe('B5 zweimal in Folge: sie bricht', auswerten(s2, HEUTE).serie === 2, auswerten(s2, HEUTE).serie);
var momi = gw({ art: 'wochentage', tage: [1, 3] }, '2026-10-05', ['2026-10-05', '2026-10-07']);
pruefe('B6 Wochentage: verpaßt ist die letzte fällige, nicht gestern', auswerten(momi, HEUTE).warnen === true);
var mofr = auswerten(gw({ art: 'wochentage', tage: [1, 5] }, '2026-10-05', []), HEUTE);
pruefe('B7 heute nicht fällig: keine Warnung', !mofr.faelligHeute && !mofr.warnen);
var woche = gw({ art: 'proWoche', anzahl: 2 }, '2026-09-28', ['2026-09-28', '2026-09-29', '2026-10-06']);
pruefe('B8 pro Woche: letzte Woche verfehlt, diese warnt', auswerten(woche, HEUTE).warnen === true);
var p = auswerten(gestern, HEUTE).punkte;
pruefe('B9 sieben Punkte, heute zuletzt', p.length === 7 && p[6].tag === HEUTE);
pruefe('B10 vor dem Anlegen frei, verpaßt, erledigt',
  p.map(function (x) { return x.art; }).join(',') === 'frei,frei,frei,erledigt,erledigt,verpasst,erledigt',
  p.map(function (x) { return x.art; }).join(','));

// ── C · Anlegen ─────────────────────────────────────────────
frisch();
q('#ersteGewohnheit').click();
pruefe('C1 das Formular öffnet', ansicht === 'neu' && !!q('#gwName'));
pruefe('C2 «Täglich» ist vorgewählt', q('[data-art="taeglich"]').getAttribute('aria-pressed') === 'true');
pruefe('C3 der Name hat eine Grenze', q('#gwName').maxLength === NAME_MAX);
pruefe('C4 das Feld zoomt nicht (≥ 16 px)', parseFloat(getComputedStyle(q('#gwName')).fontSize) >= 16);
q('#gwSpeichern').click();
pruefe('C5 ohne Namen wird nichts angelegt', state.gewohnheiten.length === 0 && ansicht === 'neu');
pruefe('C6 und die Meldung sagt warum', /Namen/.test(q('#meldung').textContent));
eingeben('  Lesen  ');
q('[data-art="wochentage"]').click();
pruefe('C7 Wochentage zeigen die Tage', !q('#rhTage').hidden && q('#rhAnzahl').hidden);
pruefe('C8 Montag zuerst', alle('[data-tag]').map(function (t) { return t.textContent; }).join('') === 'MoDiMiDoFrSaSo');
alle('[data-tag][aria-pressed="true"]').forEach(function (t) { t.click(); });
q('#gwSpeichern').click();
pruefe('C9 ohne Tag wird nichts angelegt', state.gewohnheiten.length === 0 && /Tag/.test(q('#meldung').textContent));
q('[data-tag="1"]').click();
q('[data-tag="4"]').click();
q('#gwSpeichern').click();
var neu = state.gewohnheiten[0];
pruefe('C10 angelegt, mit Rhythmus und Tag', !!neu && neu.name === 'Lesen' && neu.angelegt === HEUTE &&
  neu.rhythmus.art === 'wochentage' && neu.rhythmus.tage.join() === '1,4', JSON.stringify(neu));
pruefe('C11 und zurück auf dem Dashboard', ansicht === 'home' && alle('.gw-kachel').length === 1);
pruefe('C12 gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten.length === 1);
zeige('neu');
q('[data-art="proWoche"]').click();
pruefe('C13 pro Woche zeigt den Zähler', !q('#rhAnzahl').hidden && q('#rhTage').hidden);
for (var i = 0; i < 10; i++) q('#anzMehr').click();
pruefe('C14 höchstens sechsmal', /^6/.test(q('#anzWert').textContent));
for (i = 0; i < 10; i++) q('#anzWeniger').click();
pruefe('C15 mindestens einmal', /^1/.test(q('#anzWert').textContent));
q('#anzMehr').click();
eingeben('Laufen');
q('#gwSpeichern').click();
pruefe('C16 «2× pro Woche» steht im Speicher', state.gewohnheiten[1].rhythmus.anzahl === 2);
zeige('neu');
pruefe('C17 ein neues Formular ist leer', q('#gwName').value === '' &&
  q('[data-art="taeglich"]').getAttribute('aria-pressed') === 'true');

// ── D · Dashboard ───────────────────────────────────────────
frisch();
state.gewohnheiten = [gw(TAEGLICH, vor(5), [], 'Lesen'), gw(TAEGLICH, vor(5), [], '<b>Wasser</b>'),
  gw({ art: 'wochentage', tage: [1] }, vor(5), [], 'Montags')];
zeige('home');
pruefe('D1 der Tagesring zählt nur, was heute dran ist', q('#tagesZahl').textContent === '0 von 2',
  q('#tagesZahl').textContent);
pruefe('D2 zwei Kacheln oben, eine gedimmt',
  alle('.gw-liste:not(.gedimmt) .gw-kachel').length === 2 && alle('.gw-liste.gedimmt .gw-kachel').length === 1);
pruefe('D3 die Chili steht genau einmal da, im Ring', alle('#chiliFigur').length === 1 && !!q('.tagesring #chiliFigur'));
pruefe('D4 Namen werden nicht als HTML gelesen', !q('.gw-name b') &&
  alle('.gw-name').some(function (n) { return n.textContent === '<b>Wasser</b>'; }));
var erste = state.gewohnheiten[0].id;
q('[data-haken="' + erste + '"]').click();
pruefe('D5 antippen = erledigt', state.gewohnheiten[0].erledigt.indexOf(HEUTE) !== -1);
pruefe('D5a die Chili flammt auf', q('#chiliFigur').classList.contains('flammt') &&
  getComputedStyle(q('#chiliFigur')).animationName.indexOf('flammen') !== -1,
  getComputedStyle(q('#chiliFigur')).animationName);
zeige('home');
pruefe('D5b nur einmal: neu gezeichnet flammt sie nicht wieder', !q('#chiliFigur').classList.contains('flammt'));
pruefe('D6 die Kachel sagt es', q('[data-haken="' + erste + '"]').getAttribute('aria-pressed') === 'true' &&
  q('[data-haken="' + erste + '"]').parentNode.classList.contains('erledigt'));
pruefe('D7 der Tagesring zählt mit', q('#tagesZahl').textContent === '1 von 2');
pruefe('D8 gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten[0].erledigt.indexOf(HEUTE) !== -1);
pruefe('D9 die Kachel bleibt, wo sie war', alle('[data-haken]')[0].getAttribute('data-haken') === erste);
q('[data-haken="' + erste + '"]').click();
pruefe('D10 nochmal = zurück', state.gewohnheiten[0].erledigt.indexOf(HEUTE) === -1 &&
  q('#tagesZahl').textContent === '0 von 2');
pruefe('D10a zurücknehmen ist kein Jubel', !q('#chiliFigur').classList.contains('flammt'));
q('.gedimmt [data-haken]').click();
pruefe('D11 auch Gedimmtes läßt sich abhaken', state.gewohnheiten[2].erledigt.indexOf(HEUTE) !== -1 &&
  q('#tagesZahl').textContent === '0 von 2');
function chili() { return q('#chiliFigur').className; }
q('[data-haken="' + erste + '"]').click();
pruefe('D11a der erste von zweien flammt nur', chili() === 'flammt', chili());
q('[data-haken="' + state.gewohnheiten[1].id + '"]').click();
pruefe('D11b der letzte Haken des Tages lodert', chili() === 'lodert' &&
  getComputedStyle(q('#chiliFigur')).animationName.indexOf('lodern') !== -1, chili());
q('.gedimmt [data-haken]').click();
q('.gedimmt [data-haken]').click();
pruefe('D11c neben einem vollen Tag flammt sie nur', chili() === 'flammt' &&
  q('#tagesZahl').textContent === '2 von 2', chili());
pruefe('D12 jeder Ring hat Spur und Füllung', alle('.ring').every(function (r) {
  return !!r.querySelector('.ring-spur') && !!r.querySelector('.ring-fuell');
}) && alle('.ring').length === 4);
function zuKlein(wo) {
  ausbewegt();
  return alle(wo + ' button').filter(function (k) {
    var r = k.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    return r.width < 44 || r.height < 44;
  }).map(function (k) { return k.id || k.className || k.textContent.trim().slice(0, 20); });
}
pruefe('D13 Trefferflächen auf dem Dashboard', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
state.gewohnheiten[0].erledigt = [vor(3), vor(2)];
zeige('home');
pruefe('D14 nie zweimal: die Kachel trägt die Warnung', !!q('.gw-kachel.warnen') &&
  /Heute nicht wieder/.test(q('.gw-kachel.warnen').textContent));
state.gewohnheiten = [gw(TAEGLICH, vor(1), [vor(1)])];
zeige('home');
jetzt = function () { return new Date(2026, 9, 15, 7, 0); };
document.dispatchEvent(new Event('visibilitychange'));
pruefe('D15 nach Mitternacht zeichnet das Dashboard den neuen Tag',
  q('#tagesZahl').textContent === '0 von 1' && /Donnerstag, 15\. Oktober/.test(q('#kopf .datum').textContent));
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };

// ── E · Hinweis ab drei ungefestigten ───────────────────────
frisch();
var fest = tage(vor(80), HEUTE);
state.gewohnheiten = [gw(TAEGLICH, vor(2)), gw(TAEGLICH, vor(2)), gw(TAEGLICH, vor(80), fest)];
zeige('neu');
pruefe('E1 zwei schwache: kein Hinweis', !q('#gwHinweis'));
state.gewohnheiten.push(gw(TAEGLICH, vor(2)));
zeige('neu');
pruefe('E2 drei schwache: der Hinweis', !!q('#gwHinweis') && /3 Gewohnheiten/.test(q('#gwHinweis').textContent));
pruefe('E3 er verbietet nichts', !!q('#gwSpeichern') && !q('#gwSpeichern').disabled);
pruefe('E4 Gefestigte zählen nicht', schwacheZahl(HEUTE) === 3);

// ── F · Bearbeiten und Archivieren ──────────────────────────
frisch();
state.gewohnheiten = [gw(TAEGLICH, vor(10), tage(vor(10), vor(1)), 'Lesen')];
var id = state.gewohnheiten[0].id;
zeige('home');
zeige('bearbeiten', id);
pruefe('F1 die Gewohnheit öffnet mit ihrem Namen', ansicht === 'bearbeiten' && q('#gwName').value === 'Lesen');
pruefe('F2 mit Stärke und Serie', /10 Tage/.test(q('#app').textContent) && /Stärke/.test(q('#app').textContent));
pruefe('F3 Trefferflächen im Formular', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
eingeben('Lesen am Abend');
q('[data-art="proWoche"]').click();
q('#gwSpeichern').click();
var g = state.gewohnheiten[0];
pruefe('F4 Name und Rhythmus geändert, die Geschichte bleibt', g.name === 'Lesen am Abend' &&
  g.rhythmus.art === 'proWoche' && g.erledigt.length === 10 && g.angelegt === vor(10));
zeige('bearbeiten', id);
q('#gwArchivieren').click();
pruefe('F5 der Tipp fragt im Glas (ADR 0041)', !g.archiviert && q('#hinweisBlatt').classList.contains('offen') && !!hinweisFrage &&
  q('#hinweisOk').textContent === 'Archivieren');
q('#hinweisOk').click();
pruefe('F6 «Archivieren» im Glas archiviert', g.archiviert === HEUTE && ansicht === 'home');
pruefe('F7 vom Dashboard verschwunden, im Speicher geblieben', !q('.gw-kachel') && !!q('#ersteGewohnheit') &&
  JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten.length === 1);
zeige('bearbeiten', 'gibtsnicht');
pruefe('F8 eine unbekannte Gewohnheit führt nach Hause', ansicht === 'home');

// ── G · Speicher ────────────────────────────────────────────
var gelesen = stand({ gewohnheiten: [
  { id: 'a', name: ' Gut ', rhythmus: { art: 'proWoche', anzahl: 3 }, angelegt: '2026-10-01',
    erledigt: ['2026-10-02', '2026-10-02', 'quatsch', '2026-02-30', '2026-10-01'] },
  { id: 'a', name: 'Doppelt', rhythmus: TAEGLICH, angelegt: '2026-10-01' },
  { id: 'b', name: '', rhythmus: TAEGLICH, angelegt: '2026-10-01' },
  { id: 'c', name: 'Rhythmus kaputt', rhythmus: { art: 'proWoche', anzahl: 9 }, angelegt: '2026-10-01' },
  { id: 'd', name: 'Ohne Tage', rhythmus: { art: 'wochentage', tage: [] }, angelegt: '2026-10-01' },
  { id: 'e', name: 'Datum kaputt', rhythmus: TAEGLICH, angelegt: 'gestern' },
  { id: 'f', name: 'Tage gemischt', rhythmus: { art: 'wochentage', tage: [5, 1, 9, 1] }, angelegt: '2026-10-01',
    archiviert: '2026-10-03' },
  'gar keine'
] });
pruefe('G1 nur Gültiges kommt hinein', gelesen.gewohnheiten.map(function (x) { return x.id; }).join() === 'a,f',
  gelesen.gewohnheiten.map(function (x) { return x.id; }).join());
pruefe('G2 Einträge geprüft, einmalig, sortiert',
  gelesen.gewohnheiten[0].erledigt.join() === '2026-10-01,2026-10-02' && gelesen.gewohnheiten[0].name === 'Gut');
pruefe('G3 Tage geordnet, Fremdes weg', gelesen.gewohnheiten[1].rhythmus.tage.join() === '1,5');
pruefe('G4 archiviert bleibt archiviert', gelesen.gewohnheiten[1].archiviert === '2026-10-03');
pruefe('G5 ohne Liste ist sie leer', stand({ thema: 'hell' }).gewohnheiten.length === 0);
frisch();
state.gewohnheiten = [gw({ art: 'proWoche', anzahl: 4 }, vor(3), [vor(1)])];
speichern();
pruefe('G6 hin und zurück unverändert', JSON.stringify(laden()) === JSON.stringify(state));

// ── H · Die App duzt, auch hier ─────────────────────────────
function siezt() {
  var m = q('#app').innerText.match(/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/g);
  return m ? m.join(' | ') : '';
}
state.gewohnheiten = [gw(TAEGLICH, vor(2)), gw(TAEGLICH, vor(2)), gw(TAEGLICH, vor(2), [vor(2)])];
zeige('home');
pruefe('H1 auf dem Dashboard', siezt() === '', siezt());
zeige('neu');
pruefe('H2 im Formular mit Hinweis', !!q('#gwHinweis') && siezt() === '', siezt());
zeige('bearbeiten', state.gewohnheiten[0].id);
pruefe('H3 beim Bearbeiten', siezt() === '', siezt());
frisch();
speichern();
`);
