// Nachschliff (0.9.0T3, ADR 0023): sechs Tickets vom Gerät — «Heute» als
// Pille, der heutige Tag im Kreis, ein kommender Tag sagt, was dran ist,
// «Hinzufügen» fragt erst, die Welle läßt sich abbrechen, Kalenderwochen mit
// Strich, Wisch auf dem Dashboard öffnet das Menü (Suite menue), «Allgemein»
// als Ort, der Tropfen ist rund und fließt auch zurück, wo seine Herkunft fort ist.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 12 Uhr (KW 42).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('nachschliff', html, String.raw`
var UHR = new Date(2026, 9, 14, 12, 0).getTime();
jetzt = function () { return new Date(UHR); };
var HEUTE = '2026-10-14';
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
function farbe(c) { var d = document.createElement('div'); d.style.color = c; document.body.appendChild(d);
  var f = getComputedStyle(d).color; weg(d); return f; }
var AKZENT = farbe('var(--akzent)');
function mitte(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
function nah(a, b) { return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2; }
function letzteHuelle() { return alle('body > .tropfen-huelle').pop(); }
function bilder(el) { var a = el && el.getAnimations()[0]; return a ? a.effect.getKeyframes() : []; }
function zuKlein(wo) {
  ausbewegt();
  return alle(wo + ' button').filter(function (k) {
    var r = k.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    return r.width < 44 || r.height < 44;
  }).map(function (k) { return k.id || k.className || k.textContent.trim().slice(0, 20); });
}
function gw(id, rhythmus) {
  return gewohnheitLesen({ id: id, name: id, rhythmus: rhythmus, angelegt: '2026-10-01', erledigt: [] });
}
function aufbauen() {
  frisch();
  kalVersatz = 0;
  kalTag = null;
  // Täglich, nur montags, dreimal pro Woche: Am Donnerstag ist A dran, B nicht, C frei.
  state.gewohnheiten = [gw('B', { art: 'wochentage', tage: [1] }), gw('C', { art: 'proWoche', anzahl: 3 }),
    gw('A', { art: 'taeglich' })];
  zeige('home');
}
function tag(k) { return q('[data-kaltag="' + k + '"]'); }

// ── H · «Heute» und der heutige Tag (Ticket 1) ──────────────
aufbauen();
var pille = q('#heuteKnopf .heute-pille'), ps = pille && getComputedStyle(pille);
pruefe('H1 «Heute» ist eine Pille in Orange', !!pille && pille.textContent === 'Heute' && ps.color === AKZENT &&
  ps.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(ps.borderTopLeftRadius) >= 10 && ps.display === 'inline-block',
  ps && [ps.color, ps.backgroundColor, ps.borderTopLeftRadius].join(' '));
var zahl = tag(HEUTE).querySelector('.kal-zahl'), zs = getComputedStyle(zahl), zr = zahl.getBoundingClientRect();
var kreis = getComputedStyle(zahl, '::before');
pruefe('H2 die Zahl von heute steht in einem Kreis aus dem Akzent, 30 % kleiner (ADR 0025)', kreis.backgroundColor === AKZENT &&
  kreis.borderTopLeftRadius === '50%' && kreis.transform !== 'none' && /0\.7/.test(kreis.transform) &&
  Math.abs(zr.width - zr.height) < 1 && zr.width >= 26 && zs.textDecorationLine === 'none',
  [kreis.backgroundColor, kreis.transform, zr.width, zr.height].join(' '));
pruefe('H3 die anderen Tage nicht', getComputedStyle(tag('2026-10-15').querySelector('.kal-zahl')).backgroundColor ===
  'rgba(0, 0, 0, 0)');
pruefe('H4 die Schrift im Kreis ist dunkel, nicht weiß (3,1 : 1)', zs.color === farbe('var(--auf-akzent)') &&
  zs.color === 'rgb(20, 20, 19)', zs.color);
document.documentElement.setAttribute('data-thema', 'dunkel');
pruefe('H4a auch dunkel', getComputedStyle(zahl).color === 'rgb(20, 20, 19)');
document.documentElement.removeAttribute('data-thema');
themaAnwenden();

// ── V · Ein kommender Tag sagt, was dran ist (Ticket 1) ─────
tag('2026-10-15').click();
var zeilen = alle('#kalLeiste .kal-zeile');
function zeile(i) { return zeilen[i] ? zeilen[i].querySelector('.kal-name').textContent + ':' +
  zeilen[i].querySelector('.kal-status').textContent : ''; }
pruefe('V1 der Donnerstag zeigt seine Gewohnheiten, das Fällige vorn', zeilen.length === 3 &&
  zeile(0) === 'A:fällig' && zeile(1) === 'C:frei' && zeile(2) === 'B:nicht dran',
  [zeile(0), zeile(1), zeile(2)].join(' '));
pruefe('V2 und sagt es in einem Satz', /Eine Gewohnheit ist an diesem Tag dran\./.test(q('#kalLeiste').textContent));
pruefe('V3 abhaken läßt er sich nicht', !q('#kalLeiste [data-nachtrag]') && zeilen.every(function (z) {
  return z.tagName === 'DIV' && z.classList.contains('kommt');
}));
pruefe('V4 was nicht dran ist, steht blaß', zeilen[2].classList.contains('still') && !zeilen[0].classList.contains('still'));
pruefe('V5 «kommt noch» ist fort', !/kommt noch/.test(q('#kalLeiste').textContent));
state.gewohnheiten = [gw('B', { art: 'wochentage', tage: [1] })];
kalTag = '2026-10-17';
render();
pruefe('V6 ein Tag ohne Fälliges sagt auch das', /keine Gewohnheit fällig/.test(q('#kalLeiste').textContent) &&
  alle('#kalLeiste .kal-zeile.still').length === 1);
aufbauen();
pruefe('V7 vergangene Tage bleiben, wie sie waren', (tag('2026-10-12').click(), !!q('[data-nachtrag="A"]')));

// ── A · «Hinzufügen» fragt erst (Ticket 2) ──────────────────
aufbauen();
tag('2026-10-12').click();
var neu = q('#kalNeu');
pruefe('A1 der Knopf heißt «Hinzufügen», zu ist nichts offen', !!neu && neu.textContent === 'Hinzufügen' &&
  q('#hinweisBlatt').hidden && !/Termin an diesem Tag/.test(q('#kalLeiste').textContent));
neu.click();
var knoepfe = alle('#hinweisWahl .knopf'), auf = letzteHuelle();
pruefe('A2 ein Tipp öffnet ein Fenster: Termin, Gewohnheit, Abgewöhnen (ADR 0025)', !q('#hinweisBlatt').hidden &&
  q('#hinweisKarte').classList.contains('glas') && q('#hinweisTitel').textContent === 'Hinzufügen' &&
  knoepfe.map(function (k) { return k.textContent; }).join() === 'Termin,Gewohnheit,Abgewöhnen' &&
  q('#hinweisOk').hidden && !q('#hinweisNein').hidden);
pruefe('A3 es tropft aus «Hinzufügen»', !!auf && auf.classList.contains('glas'));
ausbewegt();
pruefe('A4 groß genug, untereinander', knoepfe.every(function (k) { return k.getBoundingClientRect().height >= 44; }) &&
  knoepfe[2].getBoundingClientRect().top > knoepfe[0].getBoundingClientRect().bottom);
q('#hinweisNein').click();
pruefe('A5 «Abbrechen» schließt es, nichts geschieht', !q('#hinweisBlatt').classList.contains('offen') && ansicht === 'home');
ausbewegt();
neu.click();
ausbewegt();
q('#hinweisBlatt').click();
pruefe('A5a ein Tipp daneben bricht ebenso ab (ADR 0026)', !q('#hinweisBlatt').classList.contains('offen') &&
  ansicht === 'home');
ausbewegt();
neu.click();
ausbewegt();
q('#hinweisKarte').click();
pruefe('A5b ein Tipp ins Fenster selbst schließt es nicht', q('#hinweisBlatt').classList.contains('offen'));
q('#hinweisNein').click();
ausbewegt();
neu.click();
q('#hinweisWahl [data-neugw="an"]').click();
pruefe('A6 «Gewohnheit» öffnet das Formular zum Angewöhnen', ansicht === 'neu' && entwurf.richtung === 'an' &&
  q('[data-richtung="an"]').getAttribute('aria-pressed') === 'true');
pruefe('A6a es wuchs als Tropfen aus dem Knopf', !!letzteHuelle());
zurueckGehen();
pruefe('A7 zurück liegt der Tag noch offen', ansicht === 'home' && kalTag === '2026-10-12' && !!q('#kalNeu'));
var h = letzteHuelle(), z = bilder(h).slice(-2)[0] || {};
pruefe('A8 und die Ansicht fließt als Tropfen in «Hinzufügen» zurück', !!h &&
  nah(mitte({ left: parseFloat(z.left), top: parseFloat(z.top), width: parseFloat(z.width), height: parseFloat(z.height) }),
    mitte(q('#kalNeu').getBoundingClientRect())), JSON.stringify(z));
return durch().then(function () {
  q('#kalNeu').click();
  q('#hinweisWahl [data-neugw="ab"]').click();
  pruefe('A9 «Abgewöhnen» von einem vergangenen Tag: frei seit diesem Tag', ansicht === 'neu' && entwurf.richtung === 'ab' &&
    !q('#abStart').hidden && q('#abTag').value === '2026-10-12' && entwurf.startGeaendert === true);
  q('#gwName').value = 'Zucker';
  q('#gwName').dispatchEvent(new Event('input', { bubbles: true }));
  q('#gwSpeichern').click();
  var a = state.abgewoehnen[0];
  pruefe('A10 angelegt, mit dem Start an jenem Tag', !!a && a.name === 'Zucker' &&
    tagSchluessel(new Date(a.start)) === '2026-10-12', a && new Date(a.start).toString());
  return durch();
}).then(function () {
  kalTag = '2026-10-20';
  kalZeige('2026-10-20');
  render();
  q('#kalNeu').click();
  q('#hinweisWahl [data-neugw="ab"]').click();
  pruefe('A11 von einem kommenden Tag aus beginnt es jetzt — der Start liegt nie in der Zukunft',
    entwurf.richtung === 'ab' && q('#abTag').value === HEUTE && !entwurf.startGeaendert);
  pruefe('A12 ohne Wahl bleibt «Neue Gewohnheit», wie sie war', (zeige('neu'), entwurf.richtung === 'an' &&
    entwurf.startTag === HEUTE));
  return durch();
}).then(function () {
  // ── W · Die Welle läßt sich abbrechen (Ticket 3) ──────────
  aufbauen();
  state.abgewoehnen = [lasterLesen({ id: 'r', name: 'Rauchen', start: UHR - 864e5, rueckfaelle: [], draenge: [] })];
  welleBeginnen('r');
  zeige('welle');
  var ab = q('#welleAbbrechen');
  pruefe('W1 die Welle hat «Abbrechen»', !!ab && /Abbrechen/.test(ab.textContent) && zuKlein('#app').length === 0,
    zuKlein('#app').join());
  ab.click();
  var a = lasterNach('r'), gesp = JSON.parse(localStorage.getItem(SPEICHER));
  pruefe('W2 abgebrochen: keine Welle mehr, nichts gezählt', state.welle === null && a.draenge.length === 0 &&
    a.rueckfaelle.length === 0 && gesp.welle === null && ansicht === 'home');
  pruefe('W3 und es wird gesagt', /Abgebrochen/.test(q('#meldung').textContent));
  state.welle = { id: 'r', start: UHR - WELLE_MS - 1000 };
  zeige('welle');
  pruefe('W4 auch wenn die Welle durch ist', !!q('#welleGewonnen') && !!q('#welleAbbrechen'));
  q('#welleAbbrechen').click();
  pruefe('W5 dann ebenso ohne Zählung', state.welle === null && lasterNach('r').draenge.length === 0);
  pruefe('W6 ohne Welle bricht nichts ab', welleAbbrechen() === false);
  return durch();
}).then(function () {
  // ── K · Kalenderwochen mit Strich (Ticket 4) ──────────────
  aufbauen();
  q('[data-kalender="monat"]').click();
  ausbewegt();
  // Seit ADR 0025: über jeder Woche ein Strich quer durch, die KW vorn darauf.
  var kw = alle('#kalRaster .kal-kw-zeile');
  pruefe('K1 über jeder Woche steht ihre Kalenderwoche', kw.map(function (k) { return k.textContent; }).join() ===
    'KW 40,KW 41,KW 42,KW 43,KW 44', kw.map(function (k) { return k.textContent; }).join());
  var mo = tag('2026-10-05').getBoundingClientRect(), so = tag('2026-10-11').getBoundingClientRect(),
    k41 = kw[1].getBoundingClientRect(), k42 = kw[2].getBoundingClientRect();
  pruefe('K2 klein, zwischen den Wochen: über ihrem Montag, unter der Woche davor', k41.bottom <= mo.top + 1 &&
    k42.top >= mo.bottom - 1 && parseFloat(getComputedStyle(kw[1]).fontSize) <= 11,
    [k41.bottom, mo.top, k42.top, mo.bottom].join());
  // ADR 0026: die KW weiter außen, links vor dem Montag; der Strich reicht entsprechend weiter.
  var gew = getComputedStyle(tag('2026-10-05'));
  pruefe('K2b unter dem Tag mehr Luft als darüber, der Rahmen sitzt nicht knapp', parseFloat(gew.paddingBottom) >
    parseFloat(gew.paddingTop) && parseFloat(gew.paddingBottom) >= 8, gew.paddingTop + ' ' + gew.paddingBottom);
  pruefe('K2c Woche und Monat fließen gleichmäßig, nicht am Anfang schon fast fertig', KAL_TAKT.dauer >= 600 &&
    KAL_TAKT.kurve === 'cubic-bezier(.45, 0, .25, 1)', JSON.stringify(KAL_TAKT));
  pruefe('K2a die KW steht links vor dem Montag, weiter außen', k41.left <= mo.left - 6 && k41.left >= mo.left - 16 &&
    k41.right >= so.right + 4, [k41.left, mo.left, k41.right, so.right].join());
  var st = getComputedStyle(kw[1], '::after'), strich = kw[1].querySelector('span').getBoundingClientRect();
  pruefe('K3 der Strich läuft waagrecht durch den ganzen Kalender', st.content !== 'none' && parseFloat(st.height) === 1 &&
    k41.right >= so.right - 4 && k41.width > mo.width * 6, [st.content, st.height, k41.right, so.right].join(' '));
  pruefe('K4 die Wochentage stehen über ihren Tagen, ohne Spalte davor', alle('.kal-wtage .kal-wt').length === 7 &&
    Math.abs(mitte(alle('.kal-wtage .kal-wt')[0].getBoundingClientRect()).x - mitte(mo).x) < 1);
  pruefe('K5 Trefferflächen im Monat', zuKlein('#app').length === 0, zuKlein('#app').join());
  pruefe('K6 die Woche nennt die KW im Titel, nicht im Raster', (q('[data-kalender="woche"]').click(),
    !q('#kalRaster .kal-kw-zeile') && /KW 42/.test(q('#kalTitel, #kalHeute').textContent)));
  pruefe('K7 die Kalenderwoche ist kein Tag', alle('#kalRaster .kal-kw-zeile').every(function (k) {
    return !k.hasAttribute('data-kaltag') && k.getAttribute('aria-hidden') === 'true';
  }));
  q('[data-kalender="monat"]').click();
  var r = q('#kalRaster').getAnimations()[0], b0 = r ? r.effect.getKeyframes()[0].clipPath : '';
  pruefe('K8 der Monat tropft aus der Woche: erst eine runde Perle (ADR 0025)', /round 999px/.test(b0) && /22%/.test(b0), b0);
  return durch();
}).then(function () {
  // ── O · «Allgemein» als Ort (Ticket 5) ────────────────────
  frisch();
  q('#ticketKnopf').click();
  var orte = alle('#tkOrt option').map(function (o) { return o.value; });
  pruefe('O1 «Allgemein» steht vorn', orte[0] === 'allgemein' && q('#tkOrt option').textContent === 'Allgemein');
  var t = ticketLesen({ id: 'x', art: 'wunsch', titel: 'a', erstellt: 5, ort: 'allgemein' });
  pruefe('O2 und bleibt beim Lesen', t.ort === 'allgemein' && /- Ort: Allgemein/.test(ticketAbschnitt(t, 1, false)));
  return durch();
}).then(function () {
  // ── R · Der Tropfen ist rund und fließt immer zurück (Ticket 6) ──
  frisch();
  ausbewegt();
  q('#ticketKnopf').click();
  return durch();
}).then(function () {
  // «Alle Tickets» bleibt seit ADR 0025 im Blatt; was trotzdem aus dem Blatt
  // heraus eine Ansicht öffnet, fließt zurück in den Ticketknopf.
  q('#tkAlle').click();
  pruefe('R0 «Alle Tickets» bleibt im Blatt', ansicht === 'home' && q('#tkKopf').textContent === 'Alle Tickets');
  letzterTipp = { el: q('#tkListeZurueck'), zeit: Date.now() };
  ticketBlattSchliessen();
  zeige('tickets');
  return durch();
}).then(function () {
  pruefe('R1 die Ticketliste ist offen', ansicht === 'tickets');
  q('#zurueckKnopf').click();
  var h = letzteHuelle(), b = bilder(h), z = b.slice(-2)[0] || {};
  var kn = mitte(q('#ticketKnopf').getBoundingClientRect());
  pruefe('R2 zurück fließt die Liste als Tropfen in den Ticketknopf', ansicht === 'home' && !!h &&
    nah(mitte({ left: parseFloat(z.left), top: parseFloat(z.top), width: parseFloat(z.width), height: parseFloat(z.height) }), kn),
    JSON.stringify(z));
  pruefe('R3 der Tropfen ist rund, an keiner Station eine Spitze', b.length === 5 && b.every(function (f) {
    return !/(^|\s)0%/.test(f.borderRadius);
  }) && b[2].borderRadius === '50%', b.map(function (f) { return f.borderRadius; }).join(' | '));
  return durch();
}).then(function () {
  // Ohne Herkunft — etwa über eine Funktion geöffnet, oder der Leerzustand,
  // aus dem man kam, ist nach dem Anlegen fort.
  frisch();
  ausbewegt();
  herkunft = null;
  zeige('einstellungen');
  ausbewegt();
  q('#titelHeim').click();
  var h = letzteHuelle(), z = bilder(h).slice(-2)[0] || {};
  pruefe('R4 ohne sichtbare Herkunft fließt die Ansicht in den Menüknopf', ansicht === 'home' && !!h &&
    nah(mitte({ left: parseFloat(z.left), top: parseFloat(z.top), width: parseFloat(z.width), height: parseFloat(z.height) }),
      mitte(q('#menuKnopf').getBoundingClientRect())), JSON.stringify(z));
  return durch();
}).then(function () {
  menueOeffnen();
  var erst = bilder(q('#menue .blatt'));
  pruefe('R5 auch das Menü tropft rund', erst.length === 4 && erst.every(function (f) {
    return !/(^|\s)0%/.test(f.borderRadius) && !/14%/.test(f.borderRadius);
  }), erst.map(function (f) { return f.borderRadius; }).join(' | '));
  ausbewegt();
  var probe = document.createElement('button');
  probe.className = 'knopf';
  probe.style.width = '200px';
  document.body.appendChild(probe);
  var kb = knopfTropfenBilder(probe), form = (kb[2].clipPath.split('round ')[1] || '').replace(')', '');
  weg(probe);
  var halb = form.split(' / ');
  pruefe('R6 ein Knopf, der tropft, ist rund: waagerecht wie senkrecht derselbe Halbmesser', halb.length === 2 &&
    halb[0] === halb[1], form);
  frisch();
  return durch();
}).then(function () {
  frisch();
  speichern();
});
`);
